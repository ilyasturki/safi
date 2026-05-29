import type { H3Event } from 'h3'
import { constants } from 'node:fs'
import { access, mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

import type { FileMetadata, FolderMetadata } from '~~/shared/types/api'

export function decodeRouterParam(event: H3Event, name: string): string {
    const param = getRouterParam(event, name) ?? ''
    return decodeURIComponent(param)
}

export function isWithinVault(vaultPath: string, absolutePath: string): boolean {
    const root = path.resolve(vaultPath)
    const relativePath = path.relative(root, absolutePath)

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

export function resolvePath(vaultPath: string, relativePath: string): string {
    const root = path.resolve(vaultPath)
    const normalizedPath = relativePath.replace(/^\/+/u, '')
    return path.resolve(path.join(root, normalizedPath))
}

export function resolveFilePath(
    vaultPath: string,
    relativePath: string,
): string {
    const pathWithExtension =
        relativePath.endsWith('.md') ? relativePath : `${relativePath}.md`

    const absolutePath = resolvePath(vaultPath, pathWithExtension)

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
    vaultPath: string,
    relativePath: string,
): Promise<{ files: FileMetadata[]; directories: FolderMetadata[] }> {
    const root = path.resolve(vaultPath)
    const absolutePath = resolvePath(root, relativePath)

    try {
        await access(absolutePath, constants.R_OK)
    } catch {
        throw createError({
            statusCode: 404,
            statusMessage: 'Directory not found or not readable',
        })
    }

    const entries = await readdir(absolutePath, { withFileTypes: true })

    const directories: FolderMetadata[] = []
    const fileResults = await Promise.all(
        entries
            .filter((entry) => !isHiddenFile(entry.name))
            .map(async (entry): Promise<FileMetadata | undefined> => {
                const entryAbsolutePath = path.join(absolutePath, entry.name)
                const entryRelativePath = path.relative(
                    root,
                    entryAbsolutePath,
                )

                if (entry.isDirectory()) {
                    directories.push({
                        name: entry.name,
                        path: entryRelativePath,
                    })
                    return undefined
                }
                if (entry.isFile() && isMarkdownFile(entry.name)) {
                    const stats = await stat(entryAbsolutePath)
                    return getFileMetadata(
                        entryAbsolutePath,
                        entryRelativePath,
                        stats.mtime.getTime(),
                    )
                }
                return undefined
            }),
    )

    const files = fileResults.filter(
        (file): file is FileMetadata => file !== undefined,
    )

    return { files, directories }
}

export async function listAllFilesRecursive(
    vaultPath: string,
    relativePath = '',
): Promise<FileMetadata[]> {
    const root = path.resolve(vaultPath)
    const absolutePath = resolvePath(root, relativePath)
    const allFiles: FileMetadata[] = []

    try {
        await access(absolutePath, constants.R_OK)
    } catch {
        throw createError({
            statusCode: 404,
            statusMessage: 'Directory not found or not readable',
        })
    }

    const entries = await readdir(absolutePath, { withFileTypes: true })

    const results = await Promise.all(
        entries
            .filter((entry) => !isHiddenFile(entry.name))
            .map(async (entry): Promise<FileMetadata[]> => {
                const entryAbsolutePath = path.join(absolutePath, entry.name)
                const entryRelativePath = path.relative(
                    root,
                    entryAbsolutePath,
                )

                if (entry.isDirectory()) {
                    return listAllFilesRecursive(root, entryRelativePath)
                }
                if (entry.isFile() && isMarkdownFile(entry.name)) {
                    const stats = await stat(entryAbsolutePath)
                    return [
                        getFileMetadata(
                            entryAbsolutePath,
                            entryRelativePath,
                            stats.mtime.getTime(),
                        ),
                    ]
                }
                return []
            }),
    )

    for (const subFiles of results) {
        allFiles.push(...subFiles)
    }

    allFiles.sort((a, b) => b.mtime - a.mtime)

    return allFiles
}

export async function validateNewPath(
    vaultPath: string,
    newAbsolutePath: string,
): Promise<void> {
    if (!isWithinVault(vaultPath, newAbsolutePath)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Path must be within vault',
        })
    }

    try {
        await access(newAbsolutePath)
        throw createError({
            statusCode: 409,
            statusMessage: 'A file or folder with this name already exists',
        })
    } catch (error) {
        if (
            !(error instanceof Error)
            || !('code' in error)
            || error.code !== 'ENOENT'
        ) {
            throw error
        }
    }
}
