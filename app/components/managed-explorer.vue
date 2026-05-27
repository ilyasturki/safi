<script setup lang="ts">
import type { FolderResponse } from '~~/shared/types/api'
import Explorer from '~/components/explorer.vue'
import { navigateToEdit } from '~/utils/navigate-to-edit'

const props = withDefaults(
    defineProps<{ isActive?: boolean; initialPath?: string }>(),
    { isActive: true, initialPath: '' },
)

const currentPath = ref(props.initialPath)

watch(
    () => props.isActive,
    (active) => {
        if (active) currentPath.value = props.initialPath
    },
)

const { data: folder, refresh } = await useFetch<FolderResponse>(
    () => `/api/folders/${currentPath.value}`,
    {
        lazy: true,
    },
)

function handleFileClick(path: string) {
    navigateToEdit(path)
}

function handleFolderClick(path: string) {
    currentPath.value = path
}

function handleRefresh() {
    refresh()
}
</script>

<template>
    <Explorer
        v-if="folder"
        :folder="folder"
        :is-active="isActive"
        @file-click="handleFileClick"
        @folder-click="handleFolderClick"
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
