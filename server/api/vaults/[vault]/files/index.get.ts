import type { FileMetadata } from '~~/shared/types/api'
import { getVaultContext } from '~~/server/utils/vaults'
import { listAllFilesRecursive } from '~~/server/utils/workspace'

export default defineEventHandler(async (event): Promise<FileMetadata[]> => {
    const vault = getVaultContext(event)
    return await listAllFilesRecursive(vault.path)
})
