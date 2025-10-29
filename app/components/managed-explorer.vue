<script setup lang="ts">
import Explorer from '~/components/explorer.vue'
import type { FolderResponse } from '~~/shared/types/api'

const currentFolderPath = defineModel<string>('folder-path', { default: '' })

const { data: folder } = await useFetch<FolderResponse>(
    () => `/api/folders/${currentFolderPath.value}`,
    {
        lazy: true,
    },
)

function handleFolderClick(path: string) {
    currentFolderPath.value = path
}

function handleFileClick(path: string) {
    navigateTo(`/edit/${path}`)
}
</script>

<template>
    <Explorer
        v-if="folder"
        :folder="folder"
        @folder-click="handleFolderClick"
        @file-click="handleFileClick"
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
