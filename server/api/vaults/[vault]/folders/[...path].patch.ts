import { rename } from 'node:fs/promises'
import path from 'node:path'

import { throwFsError } from '~~/server/utils/errors'
import { getVaultContext } from '~~/server/utils/vaults'
import {
    decodeRouterParam,
    isWithinVault,
    resolvePath,
    validateNewPath,
} from '~~/server/utils/workspace'

export default defineEventHandler(async (event) => {
    try {
        const vault = getVaultContext(event)
        const folderPath = decodeRouterParam(event, 'path')

        if (!folderPath) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Folder path is required',
            })
        }

        const body = await readBody<{ newName: string }>(event)

        if (!body || typeof body.newName !== 'string' || !body.newName.trim()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'New name is required',
            })
        }

        const oldAbsolutePath = resolvePath(vault.path, folderPath)

        if (!isWithinVault(vault.path, oldAbsolutePath)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Access denied',
            })
        }

        const newName = body.newName.trim()
        const directory = path.dirname(oldAbsolutePath)
        const newAbsolutePath = path.join(directory, newName)

        await validateNewPath(vault.path, newAbsolutePath)

        await rename(oldAbsolutePath, newAbsolutePath)

        const newRelativePath = path.relative(vault.path, newAbsolutePath)

        return {
            success: true,
            oldPath: folderPath,
            newPath: newRelativePath,
        }
    } catch (error) {
        console.error('Error renaming folder:', error)
        throwFsError(error, 'Failed to rename folder')
    }
})
