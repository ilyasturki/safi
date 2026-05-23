import { writeFile } from 'node:fs/promises'

import type { FileRequest } from '~~/shared/types/api'
import {
    decodeRouterParam,
    ensureDirectoryExists,
    resolveFilePath,
    validateNewPath,
} from '~~/server/utils/workspace'

export default defineEventHandler(async (event) => {
    try {
        const path = decodeRouterParam(event, 'path')

        if (!path) {
            throw createError({
                statusCode: 400,
                statusMessage: 'File path is required',
            })
        }

        const body = await readBody<FileRequest>(event)
        const content = body?.content ?? ''

        const absolutePath = resolveFilePath(path)

        await validateNewPath(absolutePath)
        await ensureDirectoryExists(absolutePath)
        await writeFile(absolutePath, content, 'utf8')

        return {
            success: true,
            path,
        }
    } catch (error) {
        console.error('Error creating file:', error)

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create file',
        })
    }
})
