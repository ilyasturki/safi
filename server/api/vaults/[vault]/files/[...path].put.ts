import { writeFile } from 'node:fs/promises'

import type { FileRequest } from '~~/shared/types/api'
import { throwFsError } from '~~/server/utils/errors'
import { getVaultContext } from '~~/server/utils/vaults'
import {
    decodeRouterParam,
    ensureDirectoryExists,
    resolveFilePath,
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

        if (
            !body
            || typeof body.content !== 'string'
            || body.content === undefined
        ) {
            throw createError({
                statusCode: 400,
                statusMessage: 'File content is required',
            })
        }

        const absolutePath = resolveFilePath(vault.path, path)

        await ensureDirectoryExists(absolutePath)
        await writeFile(absolutePath, body.content, 'utf8')

        return {
            success: true,
            path,
        }
    } catch (error) {
        console.error('Error writing file:', error)
        throwFsError(error, 'Failed to write file')
    }
})
