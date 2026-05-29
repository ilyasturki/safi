import type { FolderResponse } from '~~/shared/types/api'
import { readEntry } from '~~/server/utils/entry'
import { getVaultContext } from '~~/server/utils/vaults'

export default defineEventHandler(async (event): Promise<FolderResponse> => {
    const vault = getVaultContext(event)
    const result = await readEntry(vault.path, '')
    if (result.type !== 'folder') {
        throw createError({
            statusCode: 500,
            statusMessage: 'Vault root must be a folder',
        })
    }
    return result
})
