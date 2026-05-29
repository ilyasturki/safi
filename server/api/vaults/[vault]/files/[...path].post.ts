import { writeFile } from 'node:fs/promises'

import type { FileRequest } from '~~/shared/types/api'
import { throwFsError } from '~~/server/utils/errors'
import { getVaultContext } from '~~/server/utils/vaults'
import {
    decodeRouterParam,
    ensureDirectoryExists,
    resolveFilePath,
    validateNewPath,
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

        const body = await readBody<FileRequest>(event)
        const content = body?.content ?? ''

        const absolutePath = resolveFilePath(vault.path, path)

        await validateNewPath(vault.path, absolutePath)
        await ensureDirectoryExists(absolutePath)
        await writeFile(absolutePath, content, 'utf8')

        return {
            success: true,
            path,
        }
    } catch (error) {
        console.error('Error creating file:', error)
        throwFsError(error, 'Failed to create file')
    }
})
