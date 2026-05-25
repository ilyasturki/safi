import { unlink } from 'node:fs/promises'

import { throwFsError } from '~~/server/utils/errors'
import {
    decodeRouterParam,
    isWithinWorkspace,
    resolveFilePath,
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
        throwFsError(error, 'Failed to delete file')
    }
})
