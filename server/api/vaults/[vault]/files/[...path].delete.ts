import { unlink } from 'node:fs/promises'

import { throwFsError } from '~~/server/utils/errors'
import { getVaultContext } from '~~/server/utils/vaults'
import {
    decodeRouterParam,
    isWithinVault,
    resolveFilePath,
} from '~~/server/utils/workspace'

export default defineEventHandler(async (event) => {
    try {
        const vault = getVaultContext(event)
        const path = decodeRouterParam(event, 'path')

        if (!path) {
            throw createError({
                statusCode: 400,
                statusMessage: 'File path is required',
            })
        }

        const absolutePath = resolveFilePath(vault.path, path)

        if (!isWithinVault(vault.path, absolutePath)) {
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
