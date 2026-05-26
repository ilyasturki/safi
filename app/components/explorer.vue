<script setup lang="ts">
import type {
    FileMetadata,
    FolderMetadata,
    FolderResponse,
} from '~~/shared/types/api'
import { useClipboard } from '~/composables/use-clipboard'
import { useContextMenu } from '~/composables/use-context-menu'
import { useFileSystemCrud } from '~/composables/use-file-system-crud'
import { useKeyboardListNavigation } from '~/composables/use-keyboard-list-navigation'
import { useShortcut } from '~/composables/use-shortcuts'
import { navigateToEdit } from '~/utils/navigate-to-edit'
import CreateItemDialog from './create-item-dialog.vue'
import ExplorerItem from './explorer-item.vue'
import FileContextMenu from './file-context-menu.vue'
import RenameDialog from './rename-dialog.vue'

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

function handleRename() {
    renameDialogOpen.value = true
}

async function handleDelete() {
    if (!selectedItem.value || !selectedItemType.value) return

    await (selectedItemType.value === 'document' ?
        deleteFile(selectedItem.value.path)
    :   deleteFolder(selectedItem.value.path))

    emit('refresh')
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

        emit('refresh')
    } catch (error) {
        console.error('Error pasting:', error)
    }
}

async function confirmRename(newName: string) {
    if (!selectedItem.value || !selectedItemType.value) return

    await (selectedItemType.value === 'document' ?
        renameFile(selectedItem.value.path, newName)
    :   renameFolder(selectedItem.value.path, newName))

    emit('refresh')
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

    navigateToEdit(newPath)
}

useShortcut('create-document', handleCreateFile, () => props.isActive)
useShortcut('create-folder', handleCreateFolder, () => props.isActive)
</script>

<template>
    <div
        ref="listContainer"
        class="flex flex-col font-mono text-white"
    >
        <ul
            class="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 [&>li:first-child]:rounded-t-lg"
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

            <ExplorerItem
                v-for="directory in sortedDirectories"
                :key="directory.path"
                icon="lucide:folder"
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
                icon="lucide:file-text"
                @dblclick="emit('fileClick', file.path)"
                @keydown.enter.prevent="emit('fileClick', file.path)"
                @contextmenu="handleContextMenu($event, file, 'document')"
                @touchstart="handleTouchStart($event, file, 'document')"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
                @touchcancel="handleTouchEnd"
                @keydown="handleKeyDown"
            >
                {{ file.name }}
            </ExplorerItem>
        </ul>

        <ul
            class="sticky bottom-0 flex flex-col divide-y divide-zinc-200 border-t border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 [&>li:last-child]:rounded-b-lg"
        >
            <ExplorerItem
                icon="lucide:file-plus"
                @dblclick="handleCreateFile"
                @keydown.enter.prevent="handleCreateFile"
                @keydown="handleKeyDown"
            >
                create new document
            </ExplorerItem>

            <ExplorerItem
                icon="lucide:folder-plus"
                @dblclick="handleCreateFolder"
                @keydown.enter.prevent="handleCreateFolder"
                @keydown="handleKeyDown"
            >
                create new folder
            </ExplorerItem>
        </ul>
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
