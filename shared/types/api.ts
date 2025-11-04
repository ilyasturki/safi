export interface FileResponse {
    type: 'file'
    content: string
    path: string
}

export interface FolderResponse {
    type: 'folder'
    files: FileMetadata[]
    directories: FolderMetadata[]
    currentPath: string
}

export interface FileRequest {
    type: 'file'
    content: string
    path: string
}

export interface FileMetadata {
    name: string
    path: string
    mtime: number
}

export interface FolderMetadata {
    name: string
    path: string
}
