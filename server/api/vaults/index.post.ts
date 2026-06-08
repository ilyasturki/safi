import type { Vault } from '~~/server/utils/vaults'
import { registerVault } from '~~/server/utils/vaults'

export default defineEventHandler(async (event): Promise<Vault> => {
    const body = await readBody<{ path?: unknown }>(event)
    return await registerVault(body?.path)
})
