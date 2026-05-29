import { rm } from 'node:fs/promises'

import { throwFsError } from '~~/server/utils/errors'
import { getVaultContext } from '~~/server/utils/vaults'
import {
    decodeRouterParam,
    isWithinVault,
    resolvePath,
} from '~~/server/utils/workspace'

export default defineEventHandler(async (event) => {
    try {
        const vault = getVaultContext(event)
        const path = decodeRouterParam(event, 'path')

        if (!path) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Folder path is required',
            })
        }

        const absolutePath = resolvePath(vault.path, path)

        if (!isWithinVault(vault.path, absolutePath)) {
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
        throwFsError(error, 'Failed to delete folder')
    }
})
