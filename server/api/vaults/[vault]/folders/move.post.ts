import { rename } from 'node:fs/promises'
import path from 'node:path'

import { throwFsError } from '~~/server/utils/errors'
import { generateUniqueName } from '~~/server/utils/file-operations'
import { getVaultContext } from '~~/server/utils/vaults'
import { isWithinVault, resolvePath } from '~~/server/utils/workspace'

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

        const sourceAbsolutePath = resolvePath(
            vault.path,
            body.sourcePath.trim(),
        )
        const destAbsolutePath = resolvePath(
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
        const destFolderName = path.basename(destAbsolutePath)
        const uniqueDestFolderName = await generateUniqueName(
            destDir,
            destFolderName,
        )
        const finalDestPath = path.join(destDir, uniqueDestFolderName)

        await rename(sourceAbsolutePath, finalDestPath)

        const finalRelativePath = path.relative(vault.path, finalDestPath)

        return {
            success: true,
            sourcePath: body.sourcePath,
            destinationPath: finalRelativePath,
        }
    } catch (error) {
        console.error('Error moving folder:', error)
        throwFsError(error, 'Failed to move folder')
    }
})
