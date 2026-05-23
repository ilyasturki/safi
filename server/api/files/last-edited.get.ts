import { constants } from 'node:fs'
import { access, readFile } from 'node:fs/promises'

import type { FileResponse } from '~~/shared/types/api'
import { listDirectory, resolveFilePath } from '~~/server/utils/workspace'

export default defineEventHandler(
    async (event): Promise<FileResponse | undefined> => {
        const query = getQuery(event)
        const pathParam =
            typeof query.path === 'string' ? query.path : undefined

        if (pathParam) {
            const absolutePath = resolveFilePath(pathParam)

            try {
                await access(absolutePath, constants.R_OK)
                const content = await readFile(absolutePath, 'utf8')
                return {
                    type: 'file',
                    content,
                    path: pathParam,
                }
            } catch {
                return undefined
            }
        }

        const { files } = await listDirectory('')

        if (files.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'No markdown files found in workspace',
            })
        }

        const [firstFile] = files
        if (firstFile === undefined) {
            return undefined
        }

        const absolutePath = resolveFilePath(firstFile.path)

        try {
            await access(absolutePath, constants.R_OK)
            const content = await readFile(absolutePath, 'utf8')
            return {
                type: 'file',
                content,
                path: firstFile.path,
            }
        } catch {
            return undefined
        }
    },
)
