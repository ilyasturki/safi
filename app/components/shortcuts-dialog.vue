<script setup lang="ts">
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

interface Shortcut {
    keys: string[]
    description: string
}

const isMac = navigator.userAgent.toLowerCase().includes('mac')

const shortcuts = computed<Shortcut[]>(() => [
    {
        keys: isMac.value ? ['⌘', 'K'] : ['Ctrl', 'K'],
        description: 'Open file explorer',
    },
    {
        keys: ['F1'],
        description: 'Show keyboard shortcuts',
    },
])
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
                <div
                    v-for="(shortcut, index) in shortcuts"
                    :key="index"
                    class="flex items-center justify-between gap-4 px-5 py-4"
                >
                    <span class="text-sm text-zinc-600 dark:text-zinc-400">
                        {{ shortcut.description }}
                    </span>
                    <KeyboardKey :keys="shortcut.keys" />
                </div>
            </div>
        </div>
    </dialog>
</template>
