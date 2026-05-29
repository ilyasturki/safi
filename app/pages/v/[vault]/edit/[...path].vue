<script setup lang="ts">
import type { FileResponse, FolderResponse } from '~~/shared/types/api'
import Explorer from '~/components/explorer.vue'
import FileEditor from '~/components/file-editor.vue'
import { useActiveVault } from '~/composables/use-active-vault'
import { setDockView } from '~/composables/use-dock'
import { navigateToEdit } from '~/utils/navigate-to-edit'

const route = useRoute()
const { apiBase } = useActiveVault()

const entryPath = computed(() => {
    const pathParam = route.params.path
    const path = Array.isArray(pathParam) ? pathParam.join('/') : pathParam
    return path ?? ''
})

const { data: entry, refresh } = await useFetch<FileResponse | FolderResponse>(
    () => `${apiBase.value}/entry/${entryPath.value}`,
)

function syncDockView() {
    if (entry.value?.type === 'folder') setDockView('explorer')
    else if (entry.value?.type === 'file') setDockView('editor')
}

syncDockView()
watch(() => entry.value?.type, syncDockView)

function handleFolderClick(path: string) {
    navigateToEdit(path)
}

function handleFileClick(path: string) {
    navigateToEdit(path)
}
</script>

<template>
    <Explorer
        v-if="entry?.type === 'folder'"
        :folder="entry"
        @folder-click="handleFolderClick"
        @file-click="handleFileClick"
        @refresh="refresh"
    />
    <FileEditor
        v-else-if="entry?.type === 'file'"
        :file="entry"
    />
</template>
