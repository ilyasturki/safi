import { resolveVault } from '~~/server/utils/vaults'

const VAULT_PREFIX = '/api/vaults/'

export default defineEventHandler(async (event) => {
    const eventPath = event.path ?? ''
    if (!eventPath.startsWith(VAULT_PREFIX)) return

    const remainder = eventPath.slice(VAULT_PREFIX.length)
    const segment = remainder.split(/[/?]/u, 1)[0] ?? ''
    if (!segment) return

    // Routes that address a resource *inside* a vault always carry a sub-path
    // (e.g. /api/vaults/<id>/files/...). A bare /api/vaults/<id> is a
    // collection-level management route (unregister) that must work even when
    // the underlying folder is gone, so it gets no resolved vault context.
    const rest = remainder.slice(segment.length)
    if (!rest.startsWith('/')) return

    event.context.vault = await resolveVault(segment)
})
