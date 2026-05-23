import { mkdir } from 'node:fs/promises'

import {
    decodeRouterParam,
    resolvePath,
    validateNewPath,
} from '~~/server/utils/workspace'

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

        await validateNewPath(absolutePath)
        await mkdir(absolutePath)

        return {
            success: true,
            path,
        }
    } catch (error) {
        console.error('Error creating folder:', error)

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create folder',
        })
    }
})
