<script setup lang="ts">
import Explorer from '~/components/explorer.vue'
import type { FolderResponse } from '~~/shared/types/api'
import { navigateToEdit } from '~/utils/navigate-to-edit'

const currentFolderPath = defineModel<string>('folder-path', { default: '' })

const { data: folder, refresh } = await useFetch<FolderResponse>(
    () => `/api/folders/${currentFolderPath.value}`,
    {
        lazy: true,
    },
)

function handleFolderClick(path: string) {
    currentFolderPath.value = path
}

function handleFileClick(path: string) {
    navigateToEdit(path)
}

function handleRefresh() {
    refresh()
}
</script>

<template>
    <Explorer
        v-if="folder"
        :folder="folder"
        @folder-click="handleFolderClick"
        @file-click="handleFileClick"
        @refresh="handleRefresh"
    />
    <div
        v-else
        class="flex flex-col items-center justify-center gap-8 p-8 text-center"
    >
        <p class="m-10 text-2xl text-gray-500">Folder not found</p>
        <NuxtLink
            to="/"
            class="text-teal-600 underline hover:text-teal-800"
        >
            Go to index page
        </NuxtLink>
    </div>
</template>
