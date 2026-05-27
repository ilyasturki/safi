<script setup lang="ts">
import type {
    FileMetadata,
    FolderMetadata,
    FolderResponse,
} from '~~/shared/types/api'
import { useClipboard } from '~/composables/use-clipboard'
import { useContextMenu } from '~/composables/use-context-menu'
import { registerDockAction } from '~/composables/use-dock'
import { explorerContextKey } from '~/composables/use-explorer-context'
import { useFileSystemCrud } from '~/composables/use-file-system-crud'
import { useKeyboardListNavigation } from '~/composables/use-keyboard-list-navigation'
import { useBinding, useShortcut } from '~/composables/use-shortcuts'
import { getKeyDisplay } from '~/utils/key-display'
import { navigateToEdit } from '~/utils/navigate-to-edit'
import CreateItemDialog from './create-item-dialog.vue'
import ExplorerFolderNode from './explorer-folder-node.vue'
import ExplorerItem from './explorer-item.vue'
import FileContextMenu from './file-context-menu.vue'
import KeyboardKey from './keyboard-key.vue'
import RenameDialog from './rename-dialog.vue'
import { Icon } from '#components'

interface FileExplorerProps {
    folder: FolderResponse
    isActive?: boolean
}

const props = withDefaults(defineProps<FileExplorerProps>(), {
    isActive: true,
})
const emit = defineEmits<{
    folderClick: [path: string]
    fileClick: [path: string]
    refresh: []
}>()

const parentPath = computed(() => {
    const segments = props.folder.currentPath.split('/').filter(Boolean)
    if (segments.length === 0) return undefined
    segments.pop()
    return segments.length === 0 ? '' : segments.join('/')
})

const sortedDirectories = computed(() =>
    props.folder.directories.toSorted((a, b) => a.name.localeCompare(b.name)),
)

const sortedFiles = computed(() =>
    props.folder.files.toSorted((a, b) => a.name.localeCompare(b.name)),
)

const listContainerRef = useTemplateRef('listContainer')

const { handleKeyDown } = useKeyboardListNavigation(listContainerRef)

const {
    isOpen: contextMenuOpen,
    x: contextMenuX,
    y: contextMenuY,
    selectedItem,
    selectedItemType,
    handleContextMenu,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isWithinLongPressGrace,
} = useContextMenu<FileMetadata | FolderMetadata, 'document' | 'folder'>()

const {
    createFile,
    createFolder,
    renameFile,
    renameFolder,
    deleteFile,
    deleteFolder,
    copyFile,
    copyFolder,
    moveFile,
    moveFolder,
} = useFileSystemCrud()

const { clipboard, copyToClipboard, cutToClipboard, clearClipboard } =
    useClipboard()

const renameDialogOpen = ref(false)
const createDialogOpen = ref(false)
const createItemType = ref<'document' | 'folder' | undefined>(undefined)

const refreshNonce = ref(0)

function triggerRefresh() {
    refreshNonce.value++
    emit('refresh')
}

function handleRename() {
    renameDialogOpen.value = true
}

async function handleDelete() {
    if (!selectedItem.value || !selectedItemType.value) return

    await (selectedItemType.value === 'document' ?
        deleteFile(selectedItem.value.path)
    :   deleteFolder(selectedItem.value.path))

    triggerRefresh()
}

function handleCopy() {
    if (!selectedItem.value || !selectedItemType.value) return
    copyToClipboard(selectedItem.value, selectedItemType.value)
}

function handleCut() {
    if (!selectedItem.value || !selectedItemType.value) return
    cutToClipboard(selectedItem.value, selectedItemType.value)
}

async function handlePaste() {
    if (!clipboard.value) return

    const { item, itemType, operation } = clipboard.value
    const { currentPath } = props.folder

    const destinationPath =
        currentPath ? `${currentPath}/${item.name}` : item.name

    try {
        if (operation === 'copy') {
            await (itemType === 'document' ?
                copyFile(item.path, destinationPath)
            :   copyFolder(item.path, destinationPath))
        } else {
            await (itemType === 'document' ?
                moveFile(item.path, destinationPath)
            :   moveFolder(item.path, destinationPath))
            clearClipboard()
        }

        triggerRefresh()
    } catch (error) {
        console.error('Error pasting:', error)
    }
}

async function confirmRename(newName: string) {
    if (!selectedItem.value || !selectedItemType.value) return

    await (selectedItemType.value === 'document' ?
        renameFile(selectedItem.value.path, newName)
    :   renameFolder(selectedItem.value.path, newName))

    triggerRefresh()
}

async function handleCreateFile() {
    createItemType.value = 'document'
    await nextTick()
    createDialogOpen.value = true
}

async function handleCreateFolder() {
    createItemType.value = 'folder'
    await nextTick()
    createDialogOpen.value = true
}

async function confirmCreate(name: string) {
    if (!createItemType.value) return

    const { currentPath } = props.folder
    const newPath = currentPath ? `${currentPath}/${name}` : name

    await (createItemType.value === 'document' ?
        createFile(newPath)
    :   createFolder(newPath))

    triggerRefresh()
    navigateToEdit(newPath)
}

function handleFileClickEmit(path: string) {
    emit('fileClick', path)
}

function handleFolderClickEmit(path: string) {
    emit('folderClick', path)
}

function handleFolderContextMenu(event: MouseEvent, directory: FolderMetadata) {
    handleContextMenu(event, directory, 'folder')
}

function handleFileContextMenu(event: MouseEvent, file: FileMetadata) {
    handleContextMenu(event, file, 'document')
}

function handleFolderTouchStart(event: TouchEvent, directory: FolderMetadata) {
    handleTouchStart(event, directory, 'folder')
}

function handleFileTouchStart(event: TouchEvent, file: FileMetadata) {
    handleTouchStart(event, file, 'document')
}

provide(explorerContextKey, {
    handleFileClick: handleFileClickEmit,
    handleFolderClick: handleFolderClickEmit,
    handleKeyDown,
    handleFolderContextMenu,
    handleFileContextMenu,
    handleFolderTouchStart,
    handleFileTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isWithinLongPressGrace,
    refreshNonce,
})

useShortcut('create-document', handleCreateFile, () => props.isActive)
useShortcut('create-folder', handleCreateFolder, () => props.isActive)

const createDocumentBinding = useBinding('create-document')
const createFolderBinding = useBinding('create-folder')

registerDockAction('new-document', handleCreateFile)
registerDockAction('new-folder', handleCreateFolder)
</script>

<template>
    <div
        ref="listContainer"
        class="flex min-h-0 flex-1 flex-col font-mono text-white"
    >
        <ul
            class="flex min-h-0 flex-1 flex-col divide-y divide-zinc-200 overflow-y-auto dark:divide-zinc-800"
        >
            <ExplorerItem
                v-if="parentPath !== undefined"
                icon="lucide:folder-up"
                @dblclick="emit('folderClick', parentPath)"
                @keydown.enter.prevent="emit('folderClick', parentPath)"
                @keydown="handleKeyDown"
            >
                go to parent folder
            </ExplorerItem>

            <ExplorerFolderNode
                v-for="directory in sortedDirectories"
                :key="directory.path"
                :directory="directory"
                :depth="0"
            />

            <ExplorerItem
                v-for="file in sortedFiles"
                :key="file.path"
                icon="lucide:file-text"
                @dblclick="emit('fileClick', file.path)"
                @keydown.enter.prevent="emit('fileClick', file.path)"
                @contextmenu="handleFileContextMenu($event, file)"
                @touchstart="handleFileTouchStart($event, file)"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
                @touchcancel="handleTouchEnd"
                @keydown="handleKeyDown"
            >
                {{ file.name }}
            </ExplorerItem>
        </ul>

        <div
            class="sticky bottom-0 flex shrink-0 border-t border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
        >
            <button
                type="button"
                tabindex="0"
                class="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-200 hover:text-zinc-900 focus:bg-zinc-200 focus:outline-none dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 dark:focus:bg-zinc-700"
                @click="handleCreateFile"
                @keydown="handleKeyDown"
            >
                <Icon
                    name="lucide:file-plus"
                    class="text-base"
                />
                new document
                <KeyboardKey :keys="getKeyDisplay(createDocumentBinding)" />
            </button>
            <div class="w-px bg-zinc-300 dark:bg-zinc-700" />
            <button
                type="button"
                tabindex="0"
                class="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-200 hover:text-zinc-900 focus:bg-zinc-200 focus:outline-none dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 dark:focus:bg-zinc-700"
                @click="handleCreateFolder"
                @keydown="handleKeyDown"
            >
                <Icon
                    name="lucide:folder-plus"
                    class="text-base"
                />
                new folder
                <KeyboardKey :keys="getKeyDisplay(createFolderBinding)" />
            </button>
        </div>
    </div>

    <FileContextMenu
        v-model:open="contextMenuOpen"
        :x="contextMenuX"
        :y="contextMenuY"
        @copy="handleCopy"
        @cut="handleCut"
        @paste="handlePaste"
        @rename="handleRename"
        @delete="handleDelete"
    />

    <RenameDialog
        v-if="selectedItem && selectedItemType"
        v-model:open="renameDialogOpen"
        :current-name="selectedItem.name"
        :item-type="selectedItemType"
        @confirm="confirmRename"
    />

    <CreateItemDialog
        v-if="createItemType"
        v-model:open="createDialogOpen"
        :item-type="createItemType"
        @confirm="confirmCreate"
    />
</template>
