import { resolveVault } from '~~/server/utils/vaults'

const VAULT_PREFIX = '/api/vaults/'

export default defineEventHandler(async (event) => {
    const eventPath = event.path ?? ''
    if (!eventPath.startsWith(VAULT_PREFIX)) return

    const remainder = eventPath.slice(VAULT_PREFIX.length)
    const segment = remainder.split(/[/?]/u, 1)[0] ?? ''
    if (!segment) return

    event.context.vault = await resolveVault(segment)
})
