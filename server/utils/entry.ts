import { readFile, stat } from 'node:fs/promises'

import type { FileResponse, FolderResponse } from '~~/shared/types/api'
import {
    listDirectory,
    resolveFilePath,
    resolvePath,
} from '~~/server/utils/workspace'

export async function readEntry(
    vaultPath: string,
    relPath: string,
): Promise<FileResponse | FolderResponse> {
    try {
        const fileAbsolutePath = resolveFilePath(vaultPath, relPath)
        const stats = await stat(fileAbsolutePath)

        if (stats.isFile()) {
            const content = await readFile(fileAbsolutePath, 'utf8')
            return {
                type: 'file',
                content,
                path: relPath,
            }
        }
    } catch {}

    try {
        const folderAbsolutePath = resolvePath(vaultPath, relPath)
        const stats = await stat(folderAbsolutePath)

        if (stats.isDirectory()) {
            const { files, directories } = await listDirectory(
                vaultPath,
                relPath,
            )
            return {
                type: 'folder',
                files,
                directories,
                currentPath: relPath,
            }
        }
    } catch {}

    throw createError({
        statusCode: 404,
        statusMessage: 'Path not found',
    })
}
