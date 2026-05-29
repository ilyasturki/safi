import type { Vault } from '~~/server/utils/vaults'
import { listVaults } from '~~/server/utils/vaults'

export default defineEventHandler(async (): Promise<Vault[]> => {
    return await listVaults()
})
