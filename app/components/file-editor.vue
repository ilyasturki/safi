<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import Editor from '~/components/editor.vue'
import ExplorerDialog from '~/components/explorer-dialog.vue'
import { useShortcut } from '~/composables/use-shortcuts'
import { useLastEditedFile } from '~/composables/use-last-edited-file'
import type { FileResponse } from '~~/shared/types/api'

const props = defineProps<{
    file: FileResponse
}>()

const content = ref('')

watchEffect(() => {
    content.value = props.file.content
})

const DEBOUNCE_DELAY = 300

const { saveLastEditedFile } = useLastEditedFile()

watchDebounced(
    content,
    async (newContent) => {
        const { path } = props.file
        await $fetch(`/api/files/${path as ':path'}`, {
            method: 'PUT',
            body: { content: newContent },
        })
        saveLastEditedFile(path)
    },
    { debounce: DEBOUNCE_DELAY },
)

const isExplorerOpen = ref(false)

useShortcut('open-explorer', () => {
    isExplorerOpen.value = true
})

const currentDirectory = computed(() => {
    const segments = props.file.path.split('/').filter(Boolean)
    if (segments.length === 0) return ''
    segments.pop()
    return segments.length === 0 ? '' : `/${segments.join('/')}`
})
</script>

<template>
    <div class="flex min-h-screen items-start justify-center">
        <Editor
            v-model:content="content"
            placeholder="Start typing your markdown..."
            class="w-full max-w-[70ch]"
        />
    </div>
    <ExplorerDialog
        v-model:open="isExplorerOpen"
        :initial-path="currentDirectory"
    />
</template>
