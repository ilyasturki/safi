import { rename } from 'node:fs/promises'
import path from 'node:path'

import { throwFsError } from '~~/server/utils/errors'
import {
    decodeRouterParam,
    getWorkspacePath,
    isWithinWorkspace,
    resolvePath,
    validateNewPath,
} from '~~/server/utils/workspace'

export default defineEventHandler(async (event) => {
    try {
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

        const oldAbsolutePath = resolvePath(folderPath)

        if (!isWithinWorkspace(oldAbsolutePath)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Access denied',
            })
        }

        const newName = body.newName.trim()
        const directory = path.dirname(oldAbsolutePath)
        const newAbsolutePath = path.join(directory, newName)

        await validateNewPath(newAbsolutePath)

        await rename(oldAbsolutePath, newAbsolutePath)

        const workspacePath = getWorkspacePath()
        const newRelativePath = path.relative(workspacePath, newAbsolutePath)

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
