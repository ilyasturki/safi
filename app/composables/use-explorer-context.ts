import type { InjectionKey, Ref } from 'vue'
import type { FileMetadata, FolderMetadata } from '~~/shared/types/api'

export interface ExplorerContext {
    handleFileClick: (path: string) => void
    handleFolderClick: (path: string) => void
    handleKeyDown: (event: KeyboardEvent) => void
    handleFolderContextMenu: (event: MouseEvent, directory: FolderMetadata) => void
    handleFileContextMenu: (event: MouseEvent, file: FileMetadata) => void
    handleFolderTouchStart: (event: TouchEvent, directory: FolderMetadata) => void
    handleFileTouchStart: (event: TouchEvent, file: FileMetadata) => void
    handleTouchMove: (event: TouchEvent) => void
    handleTouchEnd: () => void
    isWithinLongPressGrace: () => boolean
    refreshNonce: Ref<number>
}

export const explorerContextKey: InjectionKey<ExplorerContext> =
    Symbol('explorerContext')
