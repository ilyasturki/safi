import type { MaybeRefOrGetter, Ref } from 'vue'

import type {
    KeyBinding,
    KeyBindings,
    ShortcutAction,
} from '~~/shared/types/keybindings'
import {
    DEFAULT_KEYBINDINGS,
    SHORTCUT_ACTIONS,
    SHORTCUT_META,
} from '~~/shared/utils/keybindings'

export type { KeyBinding, KeyBindings, ShortcutAction }
export type { ShortcutMeta, ShortcutScope } from '~~/shared/utils/keybindings'
export { SHORTCUT_META, DEFAULT_KEYBINDINGS } from '~~/shared/utils/keybindings'

function useKeyBindingsState(): Ref<KeyBindings> {
    return useState<KeyBindings>('keybindings', () => ({
        ...DEFAULT_KEYBINDINGS,
    }))
}

const isCapturingRef = ref(false)

const isMacPlatform =
    typeof navigator !== 'undefined'
    && navigator.userAgent.toLowerCase().includes('mac')

export function isMac(): boolean {
    return isMacPlatform
}

export function setShortcutsPaused(value: boolean) {
    isCapturingRef.value = value
}

export function useKeyBindings(): Ref<KeyBindings> {
    return useKeyBindingsState()
}

export function useBinding(action: ShortcutAction) {
    const bindings = useKeyBindingsState()
    return computed<KeyBinding>(() => bindings.value[action])
}

const activeShortcutCounts = reactive<Record<ShortcutAction, number>>(
    Object.fromEntries(SHORTCUT_ACTIONS.map((a) => [a, 0])) as Record<
        ShortcutAction,
        number
    >,
)

export function useActiveShortcuts() {
    return computed(() => {
        const set = new Set<ShortcutAction>()
        for (const action of SHORTCUT_ACTIONS) {
            if (activeShortcutCounts[action] > 0) set.add(action)
        }
        return set
    })
}

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false
    const tag = target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
    return target.isContentEditable
}

function isTypingKey(key: string): boolean {
    return key.length === 1
}

export function useShortcut(
    action: ShortcutAction,
    callback: () => void,
    isActive?: MaybeRefOrGetter<boolean>,
) {
    if (!(action in SHORTCUT_META)) {
        throw new Error(`Shortcut not found: ${action}`)
    }

    const bindings = useKeyBindingsState()
    const activeRef = isActive == null ? undefined : toRef(isActive)

    const handler = (event: KeyboardEvent) => {
        if (activeRef && !activeRef.value) return
        if (isCapturingRef.value) return

        const options = bindings.value[action]
        if (!options) return

        const hasModifier =
            options.ctrl === true
            || options.alt === true
            || options.shift === true
        if (
            !hasModifier
            && isTypingKey(options.key)
            && isTypingTarget(event.target)
        )
            return

        const matchesKey =
            event.key.toLowerCase() === options.key.toLowerCase()

        const shouldCheckCtrl = options.ctrl && !isMacPlatform
        const shouldCheckMeta = options.ctrl && isMacPlatform

        const matchesCtrl = shouldCheckCtrl ? event.ctrlKey : !event.ctrlKey
        const matchesMeta = shouldCheckMeta ? event.metaKey : !event.metaKey
        const matchesAlt = options.alt ? event.altKey : !event.altKey
        const matchesShift = options.shift ? event.shiftKey : !event.shiftKey

        if (
            matchesKey
            && matchesCtrl
            && matchesAlt
            && matchesShift
            && matchesMeta
        ) {
            event.preventDefault()
            callback()
        }
    }

    let isLive = false
    const setLive = (live: boolean) => {
        if (live === isLive) return
        isLive = live
        activeShortcutCounts[action] += live ? 1 : -1
    }

    let stopActiveWatch: (() => void) | undefined

    onMounted(() => {
        globalThis.addEventListener('keydown', handler)
        if (activeRef) {
            stopActiveWatch = watch(
                activeRef,
                (value) => setLive(value),
                { immediate: true },
            )
        } else {
            setLive(true)
        }
    })

    onUnmounted(() => {
        globalThis.removeEventListener('keydown', handler)
        stopActiveWatch?.()
        setLive(false)
    })
}

let loadPromise: Promise<void> | undefined
let saveChain: Promise<unknown> = Promise.resolve()

export function loadKeyBindings(): Promise<void> {
    if (loadPromise) return loadPromise
    const state = useKeyBindingsState()
    loadPromise = (async () => {
        try {
            const data = await $fetch<KeyBindings>('/api/keybindings')
            state.value = data
        } catch (error) {
            console.error('Failed to load keybindings:', error)
        }
    })()
    return loadPromise
}

async function putKeyBindings(
    body: Partial<KeyBindings>,
): Promise<KeyBindings> {
    const state = useKeyBindingsState()
    const saved = await $fetch<KeyBindings>('/api/keybindings', {
        method: 'PUT',
        body,
    })
    state.value = saved
    return saved
}

function enqueueSave(
    task: () => Promise<KeyBindings>,
): Promise<KeyBindings> {
    const next = saveChain.then(task, task)
    saveChain = next.catch(() => undefined)
    return next
}

export async function updateKeyBinding(
    action: ShortcutAction,
    binding: KeyBinding,
): Promise<KeyBindings> {
    await loadKeyBindings()
    return enqueueSave(() => putKeyBindings({ [action]: binding }))
}

export async function resetKeyBindings(): Promise<KeyBindings> {
    await loadKeyBindings()
    return enqueueSave(() => putKeyBindings({ ...DEFAULT_KEYBINDINGS }))
}

export async function resetKeyBinding(
    action: ShortcutAction,
): Promise<KeyBindings> {
    return await updateKeyBinding(action, DEFAULT_KEYBINDINGS[action])
}
