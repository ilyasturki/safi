import { readFile, stat } from 'node:fs/promises'

import type { FileResponse, FolderResponse } from '~~/shared/types/api'
import {
    decodeRouterParam,
    resolveFilePath,
    resolvePath,
} from '~~/server/utils/workspace'

export default defineEventHandler(
    async (event): Promise<FileResponse | FolderResponse> => {
        const relativePath = decodeRouterParam(event, 'path')

        try {
            const fileAbsolutePath = resolveFilePath(relativePath)
            const stats = await stat(fileAbsolutePath)

            if (stats.isFile()) {
                const content = await readFile(fileAbsolutePath, 'utf8')
                return {
                    type: 'file',
                    content,
                    path: relativePath,
                }
            }
        } catch {}

        try {
            const folderAbsolutePath = resolvePath(relativePath)
            const stats = await stat(folderAbsolutePath)

            if (stats.isDirectory()) {
                return await $fetch(`/api/folders/${relativePath}`)
            }
        } catch {}

        throw createError({
            statusCode: 404,
            statusMessage: 'Path not found',
        })
    },
)
