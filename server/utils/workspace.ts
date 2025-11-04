import { constants } from 'node:fs'
import { access, mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import type { H3Event } from 'h3'
import type { FileMetadata, FolderMetadata } from '~~/shared/types/api'

export function decodeRouterParam(event: H3Event, name: string): string {
    const param = getRouterParam(event, name) ?? ''
    return decodeURIComponent(param)
}

export function getWorkspacePath(): string {
    const { workspacePath } = useRuntimeConfig()
    if (!workspacePath) {
        throw createError({
            statusCode: 500,
            statusMessage:
                'NUXT_WORKSPACE_PATH environment variable is not set. Please configure it to point to your markdown files directory.',
        })
    }
    return path.resolve(workspacePath)
}

export function isWithinWorkspace(absolutePath: string): boolean {
    const workspacePath = getWorkspacePath()
    const relativePath = path.relative(workspacePath, absolutePath)

    return (
        !relativePath.startsWith('..')
        && !relativePath.startsWith('/')
        && relativePath !== ''
    )
}

export function isMarkdownFile(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() === '.md'
}

export async function ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = filePath.slice(0, Math.max(0, filePath.lastIndexOf('/')))
    try {
        await access(dir, constants.W_OK)
    } catch {
        await mkdir(dir, { recursive: true })
    }
}

export function resolvePath(relativePath: string): string {
    const workspacePath = getWorkspacePath()
    const normalizedPath = relativePath.replace(/^\/+/u, '')
    return path.resolve(path.join(workspacePath, normalizedPath))
}

export function resolveFilePath(relativePath: string): string {
    const pathWithExtension =
        relativePath.endsWith('.md') ? relativePath : `${relativePath}.md`

    const absolutePath = resolvePath(pathWithExtension)

    if (!isMarkdownFile(absolutePath)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Only .md files are allowed',
        })
    }

    return absolutePath
}

export function isHiddenFile(filename: string): boolean {
    return filename.startsWith('.')
}

export function getFileMetadata(
    absolutePath: string,
    relativePath: string,
    mtime: number,
): FileMetadata {
    const filename = path.basename(absolutePath)
    const nameWithoutExtension = filename.replace(/\.md$/iu, '')
    const pathWithoutExtension = relativePath.replace(/\.md$/iu, '')

    return {
        name: nameWithoutExtension,
        path: pathWithoutExtension,
        mtime,
    }
}

export async function listDirectory(
    relativePath: string,
): Promise<{ files: FileMetadata[]; directories: FolderMetadata[] }> {
    const absolutePath = resolvePath(relativePath)
    const workspacePath = getWorkspacePath()

    try {
        await access(absolutePath, constants.R_OK)
    } catch {
        await mkdir(absolutePath, { recursive: true })
    }

    const entries = await readdir(absolutePath, { withFileTypes: true })

    const directories: FolderMetadata[] = []
    const files: FileMetadata[] = []

    for (const entry of entries) {
        if (isHiddenFile(entry.name)) {
            continue
        }

        const entryAbsolutePath = path.join(absolutePath, entry.name)
        const entryRelativePath = path.relative(
            workspacePath,
            entryAbsolutePath,
        )

        if (entry.isDirectory()) {
            directories.push({
                name: entry.name,
                path: entryRelativePath,
            })
        } else if (entry.isFile() && isMarkdownFile(entry.name)) {
            const stats = await stat(entryAbsolutePath)
            files.push(
                getFileMetadata(
                    entryAbsolutePath,
                    entryRelativePath,
                    stats.mtime.getTime(),
                ),
            )
        }
    }

    return { files, directories }
}

export async function listAllFilesRecursive(
    relativePath = '',
): Promise<FileMetadata[]> {
    const absolutePath = resolvePath(relativePath)
    const workspacePath = getWorkspacePath()
    const allFiles: FileMetadata[] = []

    try {
        await access(absolutePath, constants.R_OK)
    } catch {
        await mkdir(absolutePath, { recursive: true })
    }

    const entries = await readdir(absolutePath, { withFileTypes: true })

    for (const entry of entries) {
        if (isHiddenFile(entry.name)) {
            continue
        }

        const entryAbsolutePath = path.join(absolutePath, entry.name)
        const entryRelativePath = path.relative(
            workspacePath,
            entryAbsolutePath,
        )

        if (entry.isDirectory()) {
            const subFiles = await listAllFilesRecursive(entryRelativePath)
            allFiles.push(...subFiles)
        } else if (entry.isFile() && isMarkdownFile(entry.name)) {
            const stats = await stat(entryAbsolutePath)
            allFiles.push(
                getFileMetadata(
                    entryAbsolutePath,
                    entryRelativePath,
                    stats.mtime.getTime(),
                ),
            )
        }
    }

    allFiles.sort((a, b) => b.mtime - a.mtime)

    return allFiles
}

export async function validateNewPath(newAbsolutePath: string): Promise<void> {
    if (!isWithinWorkspace(newAbsolutePath)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Path must be within workspace',
        })
    }

    try {
        await access(newAbsolutePath)
        throw createError({
            statusCode: 409,
            statusMessage: 'A file or folder with this name already exists',
        })
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error
        }
    }
}
