<script setup lang="ts">
import type { FolderMetadata, FolderResponse } from '~~/shared/types/api'
import { useActiveVault } from '~/composables/use-active-vault'
import { explorerContextKey } from '~/composables/use-explorer-context'
import ExplorerItem from './explorer-item.vue'

defineOptions({ name: 'ExplorerFolderNode' })

interface Props {
    directory: FolderMetadata
    depth: number
}

const props = defineProps<Props>()

const { apiBase } = useActiveVault()

const injectedCtx = inject(explorerContextKey)
if (!injectedCtx) {
    throw new Error('ExplorerFolderNode must be used within an Explorer')
}
const ctx = injectedCtx

const isExpanded = ref(false)
const folder = ref<FolderResponse | null>(null)
const isLoading = ref(false)
let activeFetchController: AbortController | undefined
let fetchSequence = 0

async function fetchContents() {
    activeFetchController?.abort()
    const controller = new AbortController()
    activeFetchController = controller
    const sequence = ++fetchSequence
    isLoading.value = true
    try {
        const encoded = props.directory.path
            .split('/')
            .map(encodeURIComponent)
            .join('/')
        const response = await $fetch<FolderResponse>(
            `${apiBase.value}/folders/${encoded}`,
            { signal: controller.signal },
        )
        if (sequence === fetchSequence) {
            folder.value = response
        }
    } catch (error) {
        if (controller.signal.aborted) return
        if (sequence === fetchSequence) {
            console.error('Failed to load folder contents:', error)
            folder.value = null
            isExpanded.value = false
        }
    } finally {
        if (sequence === fetchSequence) {
            isLoading.value = false
            activeFetchController = undefined
        }
    }
}

async function toggle() {
    if (ctx.isWithinLongPressGrace(props.directory)) return
    if (!isExpanded.value && !folder.value) {
        await fetchContents()
        if (!folder.value) return
    }
    isExpanded.value = !isExpanded.value
}

watch(
    () => ctx.refreshNonce.value,
    () => {
        if (folder.value) {
            void fetchContents()
        }
    },
)

onBeforeUnmount(() => {
    activeFetchController?.abort()
})

const sortedDirectories = computed(() =>
    (folder.value?.directories ?? []).toSorted((a, b) =>
        a.name.localeCompare(b.name),
    ),
)

const sortedFiles = computed(() =>
    (folder.value?.files ?? []).toSorted((a, b) => a.name.localeCompare(b.name)),
)
</script>

<template>
    <ExplorerItem
        :indent="depth"
        :icon="isExpanded ? 'lucide:folder-open' : 'lucide:folder'"
        :expand="isExpanded ? 'expanded' : 'collapsed'"
        @click="toggle"
        @dblclick="ctx.handleFolderClick(directory.path)"
        @keydown.enter.prevent="ctx.handleFolderClick(directory.path)"
        @keydown="ctx.handleKeyDown"
        @toggle-expand="toggle"
        @contextmenu="ctx.handleFolderContextMenu($event, directory)"
        @touchstart="ctx.handleFolderTouchStart($event, directory)"
        @touchmove="ctx.handleTouchMove"
        @touchend="ctx.handleTouchEnd"
        @touchcancel="ctx.handleTouchEnd"
    >
        {{ directory.name }}
    </ExplorerItem>

    <template v-if="isExpanded">
        <ExplorerFolderNode
            v-for="dir in sortedDirectories"
            :key="dir.path"
            :directory="dir"
            :depth="depth + 1"
        />
        <ExplorerItem
            v-for="file in sortedFiles"
            :key="file.path"
            :indent="depth + 1"
            icon="lucide:file-text"
            @dblclick="ctx.handleFileClick(file.path)"
            @keydown.enter.prevent="ctx.handleFileClick(file.path)"
            @keydown="ctx.handleKeyDown"
            @contextmenu="ctx.handleFileContextMenu($event, file)"
            @touchstart="ctx.handleFileTouchStart($event, file)"
            @touchmove="ctx.handleTouchMove"
            @touchend="ctx.handleTouchEnd"
            @touchcancel="ctx.handleTouchEnd"
        >
            {{ file.name }}
        </ExplorerItem>
    </template>
</template>
