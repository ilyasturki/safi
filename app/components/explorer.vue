<script setup lang="ts">
import type {
    FileMetadata,
    FolderMetadata,
    FolderResponse,
} from '~~/shared/types/api'
import ExplorerItem from './explorer-item.vue'
import FileContextMenu from './file-context-menu.vue'
import RenameDialog from './rename-dialog.vue'

interface FileExplorerProps {
    folder: FolderResponse
}

const props = defineProps<FileExplorerProps>()
const emit = defineEmits<{
    folderClick: [path: string]
    fileClick: [path: string]
    refresh: []
}>()

const sortedDirectories = computed(() =>
    props.folder.directories.toSorted((a, b) => a.name.localeCompare(b.name)),
)

const sortedFiles = computed(() =>
    props.folder.files.toSorted((a, b) => a.name.localeCompare(b.name)),
)

const parentPath = computed(() => {
    const segments = props.folder.currentPath.split('/').filter(Boolean)
    if (segments.length === 0) return
    segments.pop()
    return segments.length === 0 ? '' : `/${segments.join('/')}`
})

const hasParent = computed(() => parentPath.value !== undefined)

const listContainerRef = useTemplateRef('listContainer')

function handleKeyDown(event: KeyboardEvent) {
    if (!listContainerRef.value) return

    const items = [
        ...listContainerRef.value.querySelectorAll<HTMLElement>(
            '[tabindex="0"]',
        ),
    ]
    if (items.length === 0) return

    const { activeElement } = document
    const currentIndex =
        activeElement ? items.indexOf(activeElement as HTMLElement) : -1

    if (event.key === 'ArrowDown') {
        event.preventDefault()
        const nextIndex = (currentIndex + 1) % items.length
        items[nextIndex]?.focus()
    } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        const prevIndex =
            currentIndex <= 0 ? items.length - 1 : currentIndex - 1
        items[prevIndex]?.focus()
    }
}

const selectedItem = ref<FileMetadata | FolderMetadata | undefined>(undefined)
const selectedItemType = ref<'file' | 'folder' | undefined>(undefined)
const contextMenuOpen = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const renameDialogOpen = ref(false)

let touchTimer: NodeJS.Timeout | undefined
let touchStartX = 0
let touchStartY = 0

function handleContextMenu(
    event: MouseEvent,
    item: FileMetadata | FolderMetadata,
    type: 'file' | 'folder',
) {
    event.preventDefault()
    selectedItem.value = item
    selectedItemType.value = type
    contextMenuX.value = event.clientX
    contextMenuY.value = event.clientY
    contextMenuOpen.value = true
}

const TOUCH_THRESHOLD = 500

function handleTouchStart(
    event: TouchEvent,
    item: FileMetadata | FolderMetadata,
    type: 'file' | 'folder',
) {
    const [touch] = event.touches
    if (!touch) return

    touchStartX = touch.clientX
    touchStartY = touch.clientY

    touchTimer = setTimeout(() => {
        selectedItem.value = item
        selectedItemType.value = type
        contextMenuX.value = touch.clientX
        contextMenuY.value = touch.clientY
        contextMenuOpen.value = true
        touchTimer = undefined
    }, TOUCH_THRESHOLD)
}

function handleTouchMove(event: TouchEvent) {
    if (!touchTimer) return

    const [touch] = event.touches
    if (!touch) return

    const deltaX = Math.abs(touch.clientX - touchStartX)
    const deltaY = Math.abs(touch.clientY - touchStartY)

    if (deltaX > 10 || deltaY > 10) {
        clearTimeout(touchTimer)
        touchTimer = undefined
    }
}

function handleTouchEnd() {
    if (touchTimer) {
        clearTimeout(touchTimer)
        touchTimer = undefined
    }
}

function handleRename() {
    renameDialogOpen.value = true
}

async function handleDelete() {
    if (!selectedItem.value || !selectedItemType.value) return

    const endpoint =
        selectedItemType.value === 'file' ?
            `/api/files/${selectedItem.value.path}`
        :   `/api/folders/${selectedItem.value.path}`

    await $fetch(endpoint, { method: 'DELETE' })

    emit('refresh')
}

async function confirmRename(newName: string) {
    if (!selectedItem.value || !selectedItemType.value) return

    const endpoint =
        selectedItemType.value === 'file' ?
            `/api/files/${selectedItem.value.path}`
        :   `/api/folders/${selectedItem.value.path}`

    await $fetch(endpoint, {
        method: 'PATCH',
        body: { newName },
    })

    emit('refresh')
}
</script>

<template>
    <ul
        ref="listContainer"
        class="flex flex-col divide-y divide-zinc-200 font-mono dark:divide-zinc-800"
    >
        <ExplorerItem
            v-if="hasParent"
            tabindex="0"
            @dblclick="
                parentPath !== undefined && emit('folderClick', parentPath)
            "
            @keydown.enter.prevent="
                parentPath !== undefined && emit('folderClick', parentPath)
            "
            @keydown="handleKeyDown"
        >
            go back
        </ExplorerItem>

        <ExplorerItem
            v-for="directory in sortedDirectories"
            :key="directory.path"
            tabindex="0"
            icon="📁"
            @dblclick="emit('folderClick', directory.path)"
            @keydown.enter.prevent="emit('folderClick', directory.path)"
            @contextmenu="handleContextMenu($event, directory, 'folder')"
            @touchstart="handleTouchStart($event, directory, 'folder')"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @touchcancel="handleTouchEnd"
            @keydown="handleKeyDown"
        >
            {{ directory.name }}
        </ExplorerItem>

        <ExplorerItem
            v-for="file in sortedFiles"
            :key="file.path"
            tabindex="0"
            icon="📄"
            @dblclick="emit('fileClick', file.path)"
            @keydown.enter.prevent="emit('fileClick', file.path)"
            @contextmenu="handleContextMenu($event, file, 'file')"
            @touchstart="handleTouchStart($event, file, 'file')"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @touchcancel="handleTouchEnd"
            @keydown="handleKeyDown"
        >
            {{ file.name }}
        </ExplorerItem>
    </ul>

    <FileContextMenu
        v-model:open="contextMenuOpen"
        :x="contextMenuX"
        :y="contextMenuY"
        @rename="handleRename"
        @delete="handleDelete"
    />

    <RenameDialog
        v-if="selectedItem"
        v-model:open="renameDialogOpen"
        :current-name="selectedItem.name"
        :item-type="selectedItemType!"
        @confirm="confirmRename"
    />
</template>
