import type { FolderResponse } from '~~/shared/types/api'
import { getVaultContext } from '~~/server/utils/vaults'
import { decodeRouterParam, listDirectory } from '~~/server/utils/workspace'

export default defineEventHandler(async (event): Promise<FolderResponse> => {
    const vault = getVaultContext(event)
    const path = decodeRouterParam(event, 'path')

    const { files, directories } = await listDirectory(vault.path, path)

    return {
        type: 'folder',
        files,
        directories,
        currentPath: path,
    }
})
