<script setup lang="ts">
import type {
    FileMetadata,
    FolderMetadata,
    FolderResponse,
} from '~~/shared/types/api'
import ExplorerButton from './explorer-button.vue'
import FileContextMenu from './file-context-menu.vue'
import RenameDialog from './rename-dialog.vue'
import { logger } from '~/utils/logger'

interface FileExplorerProps {
    folder: FolderResponse
}

const props = defineProps<FileExplorerProps>()
const emit = defineEmits<{
    folderClick: [path: string]
    fileClick: [path: string]
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

function handleClick(_event: MouseEvent, callback: () => void) {
    if (contextMenuOpen.value) {
        return
    }
    callback()
}

function handleRename() {
    renameDialogOpen.value = true
}

function handleDelete() {
    if (!selectedItem.value || !selectedItemType.value) return

    logger.log(`Delete ${selectedItemType.value}:`, selectedItem.value.path)
}

function confirmRename(newName: string) {
    if (!selectedItem.value || !selectedItemType.value) return

    logger.log(
        `Rename ${selectedItemType.value}:`,
        selectedItem.value.path,
        '->',
        newName,
    )
}
</script>

<template>
    <div class="flex flex-col font-mono">
        <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
            <ExplorerButton
                v-if="hasParent"
                @click="
                    parentPath !== undefined && emit('folderClick', parentPath)
                "
            >
                go back
            </ExplorerButton>

            <ExplorerButton
                v-for="directory in sortedDirectories"
                :key="directory.path"
                icon="📁"
                @click="
                    handleClick($event, () =>
                        emit('folderClick', directory.path),
                    )
                "
                @contextmenu="handleContextMenu($event, directory, 'folder')"
                @touchstart="handleTouchStart($event, directory, 'folder')"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
                @touchcancel="handleTouchEnd"
            >
                {{ directory.name }}
            </ExplorerButton>

            <ExplorerButton
                v-for="file in sortedFiles"
                :key="file.path"
                icon="📄"
                @click="handleClick($event, () => emit('fileClick', file.path))"
                @contextmenu="handleContextMenu($event, file, 'file')"
                @touchstart="handleTouchStart($event, file, 'file')"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
                @touchcancel="handleTouchEnd"
            >
                {{ file.name }}
            </ExplorerButton>
        </div>

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
    </div>
</template>
