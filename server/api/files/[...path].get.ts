import { readFile } from 'node:fs/promises'
import { resolveFilePath } from '~~/server/utils/workspace'
import type { FileReadResponse } from '~~/shared/types/api'

export default defineEventHandler(async (event): Promise<FileReadResponse> => {
    try {
        const path = getRouterParam(event, 'path')

        if (!path) {
            throw createError({
                statusCode: 400,
                message: 'File path is required',
            })
        }

        const absolutePath = resolveFilePath(path)
        const content = await readFile(absolutePath, 'utf8')

        return {
            content,
            path,
        }
    } catch (error) {
        console.error('Error reading file:', error)

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error
        }

        if (
            error
            && typeof error === 'object'
            && 'code' in error
            && error.code === 'ENOENT'
        ) {
            throw createError({
                statusCode: 404,
                message: 'File not found',
            })
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to read file',
        })
    }
})
