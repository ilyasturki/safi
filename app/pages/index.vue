<script setup lang="ts">
import Explorer from '~/components/explorer.vue'
import type { FolderResponse } from '~~/shared/types/api'

const currentPath = ref('')
const { data: folder } = await useFetch<FolderResponse>(
    () => `/api/folders/${currentPath.value}`,
)

function handleFolderClick(path: string) {
    navigateTo(`/edit/${path}`)
}

function handleFileClick(path: string) {
    navigateTo(`/edit/${path}`)
}

const totalItems = computed(() => {
    if (!folder.value) return 0
    return folder.value.files.length + folder.value.directories.length
})

const workspacePath = computed(() => {
    return folder.value?.currentPath || '/'
})

const isEmpty = computed(() => totalItems.value === 0)

const isMac = computed(() =>
    navigator.platform.toLowerCase().includes('mac'),
)
</script>

<template>
    <div
        class="flex min-h-screen flex-col items-center justify-start px-4 py-12"
    >
        <div class="w-full max-w-2xl">
            <!-- Hero Section -->
            <div class="mb-12 text-center">
                <h1
                    class="mb-3 font-mono text-4xl font-medium tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100"
                >
                    Pure Editor
                </h1>
                <p
                    class="font-mono text-sm text-zinc-600 sm:text-base dark:text-zinc-400"
                >
                    A minimalist markdown editor
                </p>
            </div>

            <!-- Workspace Info -->
            <div
                class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800"
            >
                <div class="flex items-center gap-2">
                    <span
                        class="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100"
                    >
                        Your Files
                    </span>
                    <span
                        v-if="!isEmpty"
                        class="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                        {{ totalItems }}
                    </span>
                </div>
                <div class="font-mono text-xs text-zinc-500 dark:text-zinc-500">
                    <kbd
                        class="rounded border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                        {{ isMac ? '⌘' : 'Ctrl' }}
                    </kbd>
                    <kbd
                        class="ml-1 rounded border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                        K
                    </kbd>
                    <span class="ml-1.5">quick navigation</span>
                </div>
            </div>

            <!-- Explorer Section -->
            <div
                v-if="folder"
                class="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
                <!-- Empty State -->
                <div
                    v-if="isEmpty"
                    class="flex flex-col items-center justify-center px-8 py-16 text-center"
                >
                    <div class="mb-4 text-5xl">📝</div>
                    <h2
                        class="mb-2 font-mono text-lg font-medium text-zinc-900 dark:text-zinc-100"
                    >
                        Your workspace is empty
                    </h2>
                    <p
                        class="mb-4 font-mono text-sm text-zinc-600 dark:text-zinc-400"
                    >
                        Create your first markdown file to get started
                    </p>
                    <p
                        class="font-mono text-xs text-zinc-500 dark:text-zinc-500"
                    >
                        Workspace: {{ workspacePath }}
                    </p>
                </div>

                <!-- Explorer -->
                <Explorer
                    v-else
                    :folder="folder"
                    @folder-click="handleFolderClick"
                    @file-click="handleFileClick"
                />
            </div>

            <!-- Loading State -->
            <div
                v-else
                class="flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-8 py-16 dark:border-zinc-800 dark:bg-zinc-900"
            >
                <p class="font-mono text-sm text-zinc-500 dark:text-zinc-500">
                    Loading workspace...
                </p>
            </div>
        </div>
    </div>
</template>
