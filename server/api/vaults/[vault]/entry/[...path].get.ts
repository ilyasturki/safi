import type { FileResponse, FolderResponse } from '~~/shared/types/api'
import { readEntry } from '~~/server/utils/entry'
import { getVaultContext } from '~~/server/utils/vaults'
import { decodeRouterParam } from '~~/server/utils/workspace'

export default defineEventHandler(
    async (event): Promise<FileResponse | FolderResponse> => {
        const vault = getVaultContext(event)
        const relativePath = decodeRouterParam(event, 'path')
        return await readEntry(vault.path, relativePath)
    },
)
