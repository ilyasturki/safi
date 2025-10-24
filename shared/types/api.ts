export interface FileReadResponse {
    content: string
    path: string
}

export interface FileWriteRequest {
    content: string
}

export interface FileWriteResponse {
    success: boolean
    path: string
}

export interface ErrorResponse {
    error: string
    statusCode: number
}

export interface FileMetadata {
    name: string
    path: string
    createdAt: Date
    modifiedAt: Date
}

export interface DirectoryMetadata {
    name: string
    path: string
}

export interface DirectoryListResponse {
    files: FileMetadata[]
    directories: DirectoryMetadata[]
    currentPath: string
}
