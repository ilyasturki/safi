<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'

import type { FileResponse } from '~~/shared/types/api'
import Editor from '~/components/editor.vue'
import ExplorerDialog from '~/components/explorer-dialog.vue'
import { useActiveVault } from '~/composables/use-active-vault'
import { registerDockAction } from '~/composables/use-dock'
import { useLastEditedFile } from '~/composables/use-last-edited-file'
import { useOpenedFiles } from '~/composables/use-opened-files'
import { usePreferences } from '~/composables/use-preferences'
import { usePreferencesState } from '~/composables/use-preferences-state'
import { useShortcut } from '~/composables/use-shortcuts'

const { apiBase } = useActiveVault()

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

const editorRef = useTemplateRef<InstanceType<typeof Editor>>('editorRef')
const content = ref('')
const vimMode = computed(() => editorRef.value?.vimMode ?? 'normal')

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
        await $fetch(
            `${apiBase.value}/files/${path}` as `/api/vaults/:vault/files/:path`,
            {
                method: 'PUT',
                body: { content: newContent },
            },
        )
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
const { preferences, load: loadPreferences } = usePreferences()
void loadPreferences()
const enableVimMode = computed(() => preferences.value.enableVimMode)

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
            :enable-vim-mode
            class="w-full max-w-[70ch]"
        />
    </div>
    <div
        v-if="enableVimMode"
        aria-label="Vim mode"
        class="pointer-events-none fixed bottom-4 left-4 z-40 rounded-lg border border-zinc-200 bg-white/95 px-2 py-1.5 font-mono text-xs tracking-wider text-zinc-700 uppercase shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 dark:text-zinc-300"
    >
        {{ vimMode }}
    </div>
    <ExplorerDialog
        v-model:open="isExplorerOpen"
        :initial-path="currentDirectory"
    />
</template>
