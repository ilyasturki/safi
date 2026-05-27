<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'

import type { FileResponse } from '~~/shared/types/api'
import Editor from '~/components/editor.vue'
import ExplorerDialog from '~/components/explorer-dialog.vue'
import { registerDockAction } from '~/composables/use-dock'
import { useLastEditedFile } from '~/composables/use-last-edited-file'
import { useOpenedFiles } from '~/composables/use-opened-files'
import { usePreferencesState } from '~/composables/use-preferences-state'
import { useShortcut } from '~/composables/use-shortcuts'

const props = defineProps<{
    file: FileResponse
}>()

const { markFileOpened } = useOpenedFiles()
watch(
    () => props.file.path,
    (path) => {
        if (path) markFileOpened(path)
    },
    { immediate: true },
)

const editorRef = useTemplateRef('editorRef')
const content = ref('')

function onWrapperMousedown(event: MouseEvent) {
    editorRef.value?.focusFromGutterClick(event)
}

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

const currentDirectory = computed(() => {
    const segments = props.file.path.split('/').filter(Boolean)
    segments.pop()
    return segments.join('/')
})

const { enableFocusMode } = usePreferencesState()
useShortcut('open-explorer', () => {
    isExplorerOpen.value = true
})
useShortcut('toggle-focus-mode', () => {
    enableFocusMode.value = !enableFocusMode.value
})

registerDockAction('open-explorer', () => {
    isExplorerOpen.value = true
})
</script>

<template>
    <div
        class="flex min-h-screen cursor-text items-start justify-center"
        @mousedown="onWrapperMousedown"
    >
        <Editor
            ref="editorRef"
            v-model:content="content"
            placeholder="Start typing your markdown..."
            :enable-focus-mode
            class="w-full max-w-[70ch]"
        />
    </div>
    <ExplorerDialog
        v-model:open="isExplorerOpen"
        :initial-path="currentDirectory"
    />
</template>
