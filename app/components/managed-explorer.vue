<script setup lang="ts">
import type { FolderResponse } from '~~/shared/types/api'
import Explorer from '~/components/explorer.vue'
import { navigateToEdit } from '~/utils/navigate-to-edit'

withDefaults(defineProps<{ isActive?: boolean }>(), { isActive: true })

const { data: folder, refresh } = await useFetch<FolderResponse>(
    () => `/api/folders/`,
    {
        lazy: true,
    },
)

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
        :is-active="isActive"
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
