import { rename } from 'node:fs/promises'
import path from 'node:path'

import { generateUniqueName } from '~~/server/utils/file-operations'
import {
    ensureDirectoryExists,
    getWorkspacePath,
    isWithinWorkspace,
    resolveFilePath,
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

        const sourceAbsolutePath = resolveFilePath(body.sourcePath.trim())
        const destAbsolutePath = resolveFilePath(body.destinationPath.trim())

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
        const destFileName = path.basename(destAbsolutePath)
        const uniqueDestFileName = await generateUniqueName(
            destDir,
            destFileName,
        )
        const finalDestPath = path.join(destDir, uniqueDestFileName)

        await ensureDirectoryExists(finalDestPath)
        await rename(sourceAbsolutePath, finalDestPath)

        const workspacePath = getWorkspacePath()
        const finalRelativePath = path
            .relative(workspacePath, finalDestPath)
            .replace(/\.md$/iu, '')

        return {
            success: true,
            sourcePath: body.sourcePath,
            destinationPath: finalRelativePath,
        }
    } catch (error) {
        console.error('Error moving file:', error)

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to move file',
        })
    }
})
