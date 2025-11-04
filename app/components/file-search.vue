<script setup lang="ts">
import type { FileMetadata } from '~~/shared/types/api'

const searchQuery = ref('')

const { data: files, status } = await useFetch<FileMetadata[]>('/api/files')

const filteredFiles = computed(() => {
    if (!files.value) return []
    if (!searchQuery.value.trim()) return files.value

    const query = searchQuery.value.toLowerCase()
    return files.value.filter((file) => file.path.toLowerCase().includes(query))
})

const isLoading = computed(() => status.value === 'pending')
const isEmpty = computed(() => filteredFiles.value.length === 0)
</script>

<template>
    <div class="flex h-full w-full flex-col font-mono">
        <div class="border-b border-zinc-200 p-4 dark:border-zinc-800">
            <label
                for="file-search"
                class="sr-only"
            >
                Search files
            </label>
            <input
                id="file-search"
                v-model="searchQuery"
                type="text"
                placeholder="Search files..."
                class="h-10 w-full rounded-sm border border-zinc-200 bg-white px-4 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
            />
        </div>

        <div
            v-if="isLoading"
            class="flex flex-1 items-center justify-center p-8 text-sm text-zinc-600 dark:text-zinc-400"
        >
            Loading files...
        </div>

        <div
            v-else-if="isEmpty"
            class="flex flex-1 items-center justify-center p-8 text-sm text-zinc-600 dark:text-zinc-400"
        >
            No files found
        </div>

        <div
            v-else
            class="flex-1 overflow-y-auto"
        >
            <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
                <NuxtLink
                    v-for="file in filteredFiles"
                    :key="file.path"
                    :to="`/edit/${file.path}`"
                    class="flex w-full flex-col gap-1 px-5 py-3 transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:hover:bg-zinc-900 dark:active:bg-zinc-800"
                >
                    <span class="text-zinc-900 dark:text-zinc-100">
                        {{ file.name }}
                    </span>
                    <span class="text-sm text-zinc-600 dark:text-zinc-400">
                        {{ file.path }}
                    </span>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
