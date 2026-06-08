import { removeVault } from '~~/server/utils/vaults'

export default defineEventHandler(async (event) => {
    const id = decodeURIComponent(getRouterParam(event, 'vault') ?? '')
    await removeVault(id)
    setResponseStatus(event, 204)
    return null
})
