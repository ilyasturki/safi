import path from 'node:path'

import {
    copyFolderRecursive,
    generateUniqueName,
} from '~~/server/utils/file-operations'
import {
    getWorkspacePath,
    isWithinWorkspace,
    resolvePath,
} from '~~/server/utils/workspace'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<{
            sourcePath: string
            destinationPath: string
        }>(event)

        if (
            !body
            || typeof body.sourcePath !== 'string'
            || !body.sourcePath.trim()
        ) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Source path is required',
            })
        }

        if (
            !body
            || typeof body.destinationPath !== 'string'
            || !body.destinationPath.trim()
        ) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Destination path is required',
            })
        }

        const sourceAbsolutePath = resolvePath(body.sourcePath.trim())
        const destAbsolutePath = resolvePath(body.destinationPath.trim())

        if (!isWithinWorkspace(sourceAbsolutePath)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Source path access denied',
            })
        }

        if (!isWithinWorkspace(destAbsolutePath)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Destination path access denied',
            })
        }

        const destDir = path.dirname(destAbsolutePath)
        const destFolderName = path.basename(destAbsolutePath)
        const uniqueDestFolderName = await generateUniqueName(
            destDir,
            destFolderName,
        )
        const finalDestPath = path.join(destDir, uniqueDestFolderName)

        await copyFolderRecursive(sourceAbsolutePath, finalDestPath)

        const workspacePath = getWorkspacePath()
        const finalRelativePath = path.relative(workspacePath, finalDestPath)

        return {
            success: true,
            sourcePath: body.sourcePath,
            destinationPath: finalRelativePath,
        }
    } catch (error) {
        console.error('Error copying folder:', error)

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to copy folder',
        })
    }
})
