<script setup lang="ts">
// import LastEditedFileCard from '~/components/last-edited-file-card.vue'
// import ManagedExplorer from '~/components/managed-explorer.vue'
import ShortcutsDialog from '~/components/shortcuts-dialog.vue'
import { useKeyboardShortcut } from '~/composables/use-keyboard-shortcut'

// const currentFolderPath = ref('')

const { data: workspace } = await useFetch('/api/workspace')
const workspacePath = computed(() => workspace.value?.path ?? '')

const isShortcutsOpen = ref(false)

useKeyboardShortcut(
    {
        key: 'F1',
    },
    () => {
        isShortcutsOpen.value = !isShortcutsOpen.value
    },
)
</script>

<template>
    <div
        class="flex min-h-screen flex-col items-center justify-start px-4 py-12"
    >
        <main class="w-full max-w-2xl">
            <header class="relative mb-12 text-center">
                <button
                    type="button"
                    class="absolute top-0 right-0 flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm text-zinc-600 transition-colors hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
                    aria-label="Show keyboard shortcuts"
                    @click="isShortcutsOpen = true"
                >
                    ?
                </button>
                <h1
                    class="mb-3 font-mono text-4xl font-medium tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100"
                >
                    Safi
                </h1>
                <p
                    class="font-mono text-sm text-zinc-600 sm:text-base dark:text-zinc-400"
                >
                    <span class="text-zinc-500 dark:text-zinc-500">
                        Workspace:
                    </span>
                    <span class="ml-1">{{ workspacePath }}</span>
                </p>
            </header>

            <!-- <div
                class="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
                <ManagedExplorer v-model:folder-path="currentFolderPath" />
            </div>

            <LastEditedFileCard /> -->

            <button
                type="button"
                @click="isShortcutsOpen = true"
            >
                Show Shortcuts
            </button>
        </main>
    </div>

    <ShortcutsDialog v-model:open="isShortcutsOpen" />
</template>
