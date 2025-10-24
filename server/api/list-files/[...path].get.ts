import { listDirectory } from '~~/server/utils/workspace'
import type { DirectoryListResponse } from '~~/shared/types/api'

export default defineEventHandler(
    async (event): Promise<DirectoryListResponse> => {
        try {
            const pathParam = getRouterParam(event, 'path')
            const relativePath = pathParam || ''

            const { files, directories } = await listDirectory(relativePath)

            return {
                files,
                directories,
                currentPath: relativePath,
            }
        } catch (error) {
            console.error('Error listing directory:', error)

            if (error && typeof error === 'object' && 'statusCode' in error) {
                throw error
            }

            if (
                error
                && typeof error === 'object'
                && 'code' in error
                && error.code === 'ENOENT'
            ) {
                throw createError({
                    statusCode: 404,
                    message: 'Directory not found',
                })
            }

            if (
                error
                && typeof error === 'object'
                && 'code' in error
                && error.code === 'ENOTDIR'
            ) {
                throw createError({
                    statusCode: 400,
                    message: 'Path is not a directory',
                })
            }

            throw createError({
                statusCode: 500,
                message: 'Failed to list directory',
            })
        }
    },
)
