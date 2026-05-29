import path from 'node:path'

import { throwFsError } from '~~/server/utils/errors'
import {
    copyFileWithContent,
    generateUniqueName,
} from '~~/server/utils/file-operations'
import { getVaultContext } from '~~/server/utils/vaults'
import {
    ensureDirectoryExists,
    isWithinVault,
    resolveFilePath,
} from '~~/server/utils/workspace'

export default defineEventHandler(async (event) => {
    try {
        const vault = getVaultContext(event)
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

        const sourceAbsolutePath = resolveFilePath(
            vault.path,
            body.sourcePath.trim(),
        )
        const destAbsolutePath = resolveFilePath(
            vault.path,
            body.destinationPath.trim(),
        )

        if (!isWithinVault(vault.path, sourceAbsolutePath)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Source path access denied',
            })
        }
        if (!isWithinVault(vault.path, destAbsolutePath)) {
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
        await copyFileWithContent(sourceAbsolutePath, finalDestPath)

        const finalRelativePath = path
            .relative(vault.path, finalDestPath)
            .replace(/\.md$/iu, '')

        return {
            success: true,
            sourcePath: body.sourcePath,
            destinationPath: finalRelativePath,
        }
    } catch (error) {
        console.error('Error copying file:', error)
        throwFsError(error, 'Failed to copy file')
    }
})
