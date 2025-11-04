import { rm } from 'node:fs/promises'
import { resolvePath, isWithinWorkspace, decodeRouterParam } from '~~/server/utils/workspace'

export default defineEventHandler(async (event) => {
    try {
        const path = decodeRouterParam(event, 'path')

        if (!path) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Folder path is required',
            })
        }

        const absolutePath = resolvePath(path)

        if (!isWithinWorkspace(absolutePath)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Access denied',
            })
        }

        await rm(absolutePath, { recursive: true, force: true })

        return {
            success: true,
            path,
        }
    } catch (error) {
        console.error('Error deleting folder:', error)

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete folder',
        })
    }
})
