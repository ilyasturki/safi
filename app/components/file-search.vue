<script setup lang="ts">
import type { FileMetadata } from '~~/shared/types/api'
import { Icon } from '#components'
import { HTTP_STATUS } from '~~/shared/utils/http-status'

const searchQuery = ref('')
const searchInputRef = useTemplateRef('searchInputRef')

const {
    data: files,
    status,
    error,
    refresh,
} = await useFetch<FileMetadata[]>('/api/files')

const filteredFiles = computed(() => {
    if (!files.value) return []
    if (!searchQuery.value.trim()) return files.value

    const query = searchQuery.value.toLowerCase()
    return files.value.filter((file) => file.path.toLowerCase().includes(query))
})

const isLoading = computed(() => status.value === 'pending')
const isError = computed(() => status.value === 'error')
const isEmpty = computed(() => filteredFiles.value.length === 0)

const errorMessage = computed(() => {
    if (!error.value) return

    const { statusCode, statusMessage } = error.value

    if (
        statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
        && statusMessage?.includes('NUXT_WORKSPACE_PATH')
    ) {
        return 'Workspace not configured'
    }
    if (statusCode === HTTP_STATUS.FORBIDDEN) {
        return 'Unable to access workspace'
    }

    return statusMessage || 'Failed to load files'
})

function handleSearchKeyDown(event: KeyboardEvent) {
    const links = document.querySelectorAll<HTMLElement>('[data-result-link]')

    if (event.key === 'ArrowDown' && links.length > 0) {
        event.preventDefault()
        links[0]?.focus()
    } else if (event.key === 'Enter' && links.length > 0) {
        event.preventDefault()
        links[0]?.click()
        searchQuery.value = ''
    }
}

function handleResultKeyDown(event: KeyboardEvent) {
    const links = [
        ...document.querySelectorAll<HTMLElement>('[data-result-link]'),
    ]
    const currentIndex = links.indexOf(event.target as HTMLElement)

    switch (event.key) {
        case 'ArrowDown': {
            event.preventDefault()
            const nextIndex = (currentIndex + 1) % links.length
            links[nextIndex]?.focus()
            break
        }

        case 'ArrowUp':
            event.preventDefault()
            if (currentIndex === 0) {
                searchInputRef.value?.focus()
            } else {
                links[currentIndex - 1]?.focus()
            }
            break
    }
}
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
                ref="searchInputRef"
                v-model="searchQuery"
                type="search"
                placeholder="Search files..."
                class="h-10 w-full rounded-sm border border-zinc-200 bg-white px-4 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
                @keydown="handleSearchKeyDown"
            />
        </div>

        <div
            v-if="isLoading"
            class="flex flex-1 items-center justify-center p-8 text-sm text-zinc-600 dark:text-zinc-400"
        >
            Loading files...
        </div>

        <div
            v-else-if="isError"
            class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-zinc-600 dark:text-zinc-400"
        >
            <Icon
                name="lucide:alert-circle"
                class="text-2xl"
            />
            <div class="text-center text-sm">
                <div class="font-medium text-zinc-900 dark:text-zinc-100">
                    {{ errorMessage }}
                </div>
                <div class="mt-1">Unable to load files</div>
            </div>
            <button
                type="button"
                class="mt-2 rounded-sm border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 focus:border-zinc-400 focus:outline-none active:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:border-zinc-600 dark:active:bg-zinc-700"
                @click="refresh()"
            >
                Try again
            </button>
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
                    :data-result-link="true"
                    :to="`/edit/${file.path}`"
                    class="flex w-full flex-col gap-1 px-5 py-3 transition-colors hover:bg-zinc-50 focus:inset-ring-2 focus:outline-none active:bg-zinc-100 dark:inset-ring-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
                    @keydown="handleResultKeyDown"
                    @click="searchQuery = ''"
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
