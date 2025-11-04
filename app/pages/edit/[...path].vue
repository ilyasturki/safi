<script setup lang="ts">
import Explorer from '~/components/explorer.vue'
import FileEditor from '~/components/file-editor.vue'
import { navigateToEdit } from '~/utils/navigate-to-edit'

const route = useRoute()
const entryPath = computed(() => {
    const pathParam = route.params.path
    const path = Array.isArray(pathParam) ? pathParam.join('/') : pathParam
    return path ?? ''
})

const { data: entry, refresh } = await useFetch(
    () => `/api/entry/${entryPath.value}`,
)

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
