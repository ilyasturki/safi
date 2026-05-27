<script setup lang="ts">
import type {
    KeyBinding,
    ShortcutAction,
} from '~~/shared/types/keybindings'
import {
    bindingSignature,
    DEFAULT_KEYBINDINGS,
    SHORTCUT_META,
    type ShortcutScope,
} from '~~/shared/utils/keybindings'
import {
    isMac,
    resetKeyBinding,
    resetKeyBindings,
    setShortcutsPaused,
    updateKeyBinding,
    useActiveShortcuts,
    useKeyBindings,
} from '~/composables/use-shortcuts'
import { getKeyDisplay } from '~/utils/key-display'
import KeyboardKey from './keyboard-key.vue'

const isOpen = defineModel<boolean>('open', { default: false })

const dialogEl = useTemplateRef('dialogEl')

const keybindings = useKeyBindings()
const activeShortcuts = useActiveShortcuts()

const editingAction = ref<ShortcutAction | undefined>(undefined)
const captureError = ref<string | undefined>(undefined)
const saveError = ref<string | undefined>(undefined)

watch(isOpen, (open) => {
    if (open) {
        dialogEl.value?.showModal()
    } else {
        dialogEl.value?.close()
        cancelEditing()
    }
})

function handleClose() {
    isOpen.value = false
}

const scopeLabels: Record<ShortcutScope, string> = {
    global: 'Global',
    home: 'Home',
    explorer: 'Explorer',
}

const SCOPE_ORDER: ShortcutScope[] = ['global', 'home', 'explorer']

interface ShortcutEntry {
    action: ShortcutAction
    description: string
    scope: ShortcutScope
    binding: KeyBinding
}

const groupedShortcuts = computed(() => {
    const groups: Record<ShortcutScope, ShortcutEntry[]> = {
        global: [],
        home: [],
        explorer: [],
    }
    for (const action of Object.keys(SHORTCUT_META) as ShortcutAction[]) {
        const meta = SHORTCUT_META[action]
        const scope = meta.scope ?? 'global'
        if (scope !== 'global' && !activeShortcuts.value.has(action)) {
            continue
        }
        groups[scope].push({
            action,
            description: meta.description,
            scope,
            binding: keybindings.value[action],
        })
    }
    return SCOPE_ORDER.filter((scope) => groups[scope].length > 0).map(
        (scope) => ({ scope, entries: groups[scope] }),
    )
})

const conflictMap = computed(() => {
    const signatures = new Map<string, ShortcutAction[]>()
    for (const action of Object.keys(SHORTCUT_META) as ShortcutAction[]) {
        const signature = bindingSignature(keybindings.value[action])
        const bucket = signatures.get(signature) ?? []
        bucket.push(action)
        signatures.set(signature, bucket)
    }
    const conflicts = new Set<ShortcutAction>()
    for (const bucket of signatures.values()) {
        if (bucket.length > 1) {
            for (const action of bucket) conflicts.add(action)
        }
    }
    return conflicts
})

function startEditing(action: ShortcutAction) {
    if (editingAction.value === action) {
        cancelEditing()
        return
    }
    editingAction.value = action
    captureError.value = undefined
    saveError.value = undefined
    setShortcutsPaused(true)
    if (import.meta.client) {
        window.addEventListener('keydown', handleCaptureKeydown, true)
    }
}

function cancelEditing() {
    if (editingAction.value === undefined) return
    editingAction.value = undefined
    captureError.value = undefined
    setShortcutsPaused(false)
    if (import.meta.client) {
        window.removeEventListener('keydown', handleCaptureKeydown, true)
    }
}

const MODIFIER_KEYS = new Set([
    'Control',
    'Shift',
    'Alt',
    'Meta',
    'OS',
    'CapsLock',
    'NumLock',
    'ScrollLock',
    'Fn',
    'FnLock',
    'Hyper',
    'Super',
])

function buildBindingFromEvent(event: KeyboardEvent): KeyBinding | undefined {
    if (MODIFIER_KEYS.has(event.key)) return undefined

    const binding: KeyBinding = { key: event.key }
    const ctrlLike = event.ctrlKey || (isMac() && event.metaKey)
    if (ctrlLike) binding.ctrl = true
    if (event.altKey) binding.alt = true
    if (event.shiftKey) binding.shift = true

    if (binding.key.length === 1) {
        binding.key = binding.key.toLowerCase()
    }

    return binding
}

async function handleCaptureKeydown(event: KeyboardEvent) {
    if (editingAction.value === undefined) return
    event.preventDefault()
    event.stopPropagation()

    if (event.key === 'Escape') {
        cancelEditing()
        isOpen.value = false
        return
    }

    const action = editingAction.value
    const binding = buildBindingFromEvent(event)
    if (!binding) {
        captureError.value = 'Add a non-modifier key'
        return
    }

    cancelEditing()
    try {
        await updateKeyBinding(action, binding)
        saveError.value = undefined
    } catch (error) {
        console.error('Failed to update keybinding', error)
        saveError.value = 'Failed to save. Check workspace permissions.'
    }
}

async function handleResetOne(action: ShortcutAction) {
    cancelEditing()
    try {
        await resetKeyBinding(action)
        saveError.value = undefined
    } catch (error) {
        console.error('Failed to reset binding', error)
        saveError.value = 'Failed to reset.'
    }
}

async function handleResetAll() {
    cancelEditing()
    try {
        await resetKeyBindings()
        saveError.value = undefined
    } catch (error) {
        console.error('Failed to reset bindings', error)
        saveError.value = 'Failed to reset all.'
    }
}

function isDefaultBinding(
    action: ShortcutAction,
    binding: KeyBinding,
): boolean {
    return bindingSignature(binding) === bindingSignature(DEFAULT_KEYBINDINGS[action])
}

onUnmounted(() => {
    if (editingAction.value !== undefined) {
        cancelEditing()
    }
})
</script>

<template>
    <dialog
        ref="dialogEl"
        class="fixed inset-0 m-auto h-fit w-full max-w-lg rounded-lg border-0 p-0 shadow-2xl outline-none backdrop:bg-black/50 backdrop:backdrop-blur-sm dark:bg-zinc-900"
        closedby="any"
        @close="handleClose"
    >
        <div class="flex flex-col font-mono">
            <div
                class="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800"
            >
                <h2
                    class="text-lg font-medium text-zinc-900 dark:text-zinc-100"
                >
                    Keyboard Shortcuts
                </h2>
                <button
                    type="button"
                    class="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    @click="handleResetAll"
                >
                    Reset all
                </button>
            </div>

            <p
                class="px-5 pt-3 text-xs text-zinc-500 dark:text-zinc-500"
            >
                Click to rebind.
                <kbd
                    class="rounded border border-zinc-300 px-1 py-0.5 text-[10px] dark:border-zinc-700"
                >Esc</kbd>
                closes.
            </p>

            <p
                v-if="saveError"
                class="px-5 pt-2 text-xs text-red-600 dark:text-red-400"
            >
                {{ saveError }}
            </p>

            <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
                <section
                    v-for="group in groupedShortcuts"
                    :key="group.scope"
                >
                    <h3
                        class="px-5 pt-4 pb-2 text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-500"
                    >
                        {{ scopeLabels[group.scope] }}
                    </h3>
                    <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
                        <div
                            v-for="entry in group.entries"
                            :key="entry.action"
                            class="flex items-stretch"
                        >
                            <button
                                type="button"
                                class="flex flex-1 items-center justify-between gap-4 px-5 py-3 text-left transition-colors hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none dark:hover:bg-zinc-800/50 dark:focus-visible:bg-zinc-800/50"
                                :aria-label="`Change shortcut for ${entry.description}`"
                                @click="startEditing(entry.action)"
                            >
                                <span class="flex min-w-0 flex-col">
                                    <span
                                        class="text-sm text-zinc-700 dark:text-zinc-300"
                                    >
                                        {{ entry.description }}
                                    </span>
                                    <span
                                        v-if="conflictMap.has(entry.action)"
                                        class="text-[11px] text-amber-600 dark:text-amber-400"
                                    >
                                        Conflict with another shortcut
                                    </span>
                                </span>
                                <span
                                    class="inline-flex h-7 items-center"
                                    :class="
                                        conflictMap.has(entry.action) &&
                                        editingAction !== entry.action
                                            ? 'rounded ring-1 ring-amber-500/60'
                                            : ''
                                    "
                                >
                                    <span
                                        v-if="editingAction === entry.action"
                                        class="inline-flex h-full items-center rounded border border-zinc-400 bg-zinc-100 px-2 text-xs text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200"
                                    >
                                        Press a key…
                                    </span>
                                    <KeyboardKey
                                        v-else
                                        :keys="getKeyDisplay(entry.binding)"
                                    />
                                </span>
                            </button>
                            <button
                                v-if="!isDefaultBinding(entry.action, entry.binding)"
                                type="button"
                                class="flex items-center px-3 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                                :aria-label="`Reset shortcut for ${entry.description}`"
                                title="Reset to default"
                                @click.stop="handleResetOne(entry.action)"
                            >
                                ↺
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <p
                v-if="captureError"
                class="border-t border-zinc-200 px-5 py-3 text-xs text-amber-600 dark:border-zinc-800 dark:text-amber-400"
            >
                {{ captureError }}
            </p>
        </div>
    </dialog>
</template>
