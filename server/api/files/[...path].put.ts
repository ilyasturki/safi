import { writeFile } from 'node:fs/promises'
import {
    ensureDirectoryExists,
    resolveFilePath,
} from '~~/server/utils/workspace'
import type { FileWriteRequest, FileWriteResponse } from '~~/shared/types/api'

export default defineEventHandler(async (event): Promise<FileWriteResponse> => {
    try {
        const path = getRouterParam(event, 'path')

        if (!path) {
            throw createError({
                statusCode: 400,
                message: 'File path is required',
            })
        }

        const body = await readBody<FileWriteRequest>(event)

        if (
            !body
            || typeof body.content !== 'string'
            || body.content === undefined
        ) {
            throw createError({
                statusCode: 400,
                message: 'File content is required',
            })
        }

        const absolutePath = resolveFilePath(path)

        await ensureDirectoryExists(absolutePath)
        await writeFile(absolutePath, body.content, 'utf8')

        return {
            success: true,
            path,
        }
    } catch (error) {
        console.error('Error writing file:', error)

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to write file',
        })
    }
})
