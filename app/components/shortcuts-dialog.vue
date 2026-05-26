<script setup lang="ts">
import type { ShortcutScope } from '~/composables/use-shortcuts'
import { shortcuts } from '~/composables/use-shortcuts'
import { getKeyDisplay } from '~/utils/key-display'
import KeyboardKey from './keyboard-key.vue'

const isOpen = defineModel<boolean>('open', { default: false })

const dialogEl = useTemplateRef('dialogEl')

watch(isOpen, (open) => {
    if (open) {
        dialogEl.value?.showModal()
    } else {
        dialogEl.value?.close()
    }
})

function handleClose() {
    isOpen.value = false
}

const scopeLabels: Record<ShortcutScope, string> = {
    global: 'Global',
    explorer: 'Explorer',
}

const groupedShortcuts = computed(() => {
    const groups: Record<ShortcutScope, { action: string; description: string; shortcut: (typeof shortcuts)[keyof typeof shortcuts] }[]> = {
        global: [],
        explorer: [],
    }
    for (const [action, shortcut] of Object.entries(shortcuts)) {
        const scope = shortcut.scope ?? 'global'
        groups[scope].push({
            action,
            description: shortcut.description,
            shortcut,
        })
    }
    return (Object.keys(groups) as ShortcutScope[])
        .filter((scope) => groups[scope].length > 0)
        .map((scope) => ({ scope, entries: groups[scope] }))
})
</script>

<template>
    <dialog
        ref="dialogEl"
        class="fixed inset-0 m-auto h-fit w-full max-w-md rounded-lg border-0 p-0 shadow-2xl outline-none backdrop:bg-black/50 backdrop:backdrop-blur-sm dark:bg-zinc-900"
        closedby="any"
        @close="handleClose"
    >
        <div class="flex flex-col font-mono">
            <div
                class="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800"
            >
                <h2
                    class="text-lg font-medium text-zinc-900 dark:text-zinc-100"
                >
                    Keyboard Shortcuts
                </h2>
            </div>

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
                            class="flex items-center justify-between gap-4 px-5 py-3"
                        >
                            <span
                                class="text-sm text-zinc-600 dark:text-zinc-400"
                            >
                                {{ entry.description }}
                            </span>
                            <KeyboardKey :keys="getKeyDisplay(entry.shortcut)" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </dialog>
</template>
