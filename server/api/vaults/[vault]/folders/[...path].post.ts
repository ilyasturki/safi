import { mkdir } from 'node:fs/promises'

import { throwFsError } from '~~/server/utils/errors'
import { getVaultContext } from '~~/server/utils/vaults'
import {
    decodeRouterParam,
    resolvePath,
    validateNewPath,
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

        await validateNewPath(vault.path, absolutePath)
        await mkdir(absolutePath, { recursive: true })

        return {
            success: true,
            path,
        }
    } catch (error) {
        console.error('Error creating folder:', error)
        throwFsError(error, 'Failed to create folder')
    }
})
