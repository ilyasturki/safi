import { rename } from 'node:fs/promises'
import path from 'node:path'
import {
    resolveFilePath,
    isWithinWorkspace,
    validateNewPath,
    getWorkspacePath,
    decodeRouterParam,
} from '~~/server/utils/workspace'

export default defineEventHandler(async (event) => {
    try {
        const filePath = decodeRouterParam(event, 'path')

        if (!filePath) {
            throw createError({
                statusCode: 400,
                statusMessage: 'File path is required',
            })
        }

        const body = await readBody<{ newName: string }>(event)

        if (!body || typeof body.newName !== 'string' || !body.newName.trim()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'New name is required',
            })
        }

        const oldAbsolutePath = resolveFilePath(filePath)

        if (!isWithinWorkspace(oldAbsolutePath)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Access denied',
            })
        }

        const newName = body.newName.trim()
        const newNameWithExtension = newName.endsWith('.md')
            ? newName
            : `${newName}.md`

        const directory = path.dirname(oldAbsolutePath)
        const newAbsolutePath = path.join(directory, newNameWithExtension)

        await validateNewPath(newAbsolutePath)

        await rename(oldAbsolutePath, newAbsolutePath)

        const workspacePath = getWorkspacePath()
        const newRelativePath = path
            .relative(workspacePath, newAbsolutePath)
            .replace(/\.md$/iu, '')

        return {
            success: true,
            oldPath: filePath,
            newPath: newRelativePath,
        }
    } catch (error) {
        console.error('Error renaming file:', error)

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to rename file',
        })
    }
})
