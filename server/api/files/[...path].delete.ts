import { unlink } from 'node:fs/promises'
import { resolveFilePath, isWithinWorkspace, decodeRouterParam } from '~~/server/utils/workspace'

export default defineEventHandler(async (event) => {
    try {
        const path = decodeRouterParam(event, 'path')

        if (!path) {
            throw createError({
                statusCode: 400,
                statusMessage: 'File path is required',
            })
        }

        const absolutePath = resolveFilePath(path)

        if (!isWithinWorkspace(absolutePath)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Access denied',
            })
        }

        await unlink(absolutePath)

        return {
            success: true,
            path,
        }
    } catch (error) {
        console.error('Error deleting file:', error)

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete file',
        })
    }
})
