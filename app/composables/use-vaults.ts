import type { Vault } from '~~/server/utils/vaults'

let inflight: Promise<void> | undefined

export function useVaults() {
    const vaults = useState<Vault[]>('vaults', () => [])
    const isLoaded = useState<boolean>('vaults-loaded', () => false)

    async function load() {
        if (isLoaded.value) return
        if (inflight) return inflight
        inflight = (async () => {
            try {
                const data = await $fetch<Vault[]>('/api/vaults')
                // The endpoint contract is a Vault[]. Guard against responses
                // that are not arrays — e.g. when /api/* is not routed to the
                // Nitro server and $fetch resolves to the SPA HTML shell — so
                // consumers never crash on vaults.value.some(...) / v-for.
                if (Array.isArray(data)) {
                    vaults.value = data
                } else {
                    console.error('Unexpected /api/vaults response:', data)
                    vaults.value = []
                }
            } catch (error) {
                console.error('Failed to load vaults:', error)
            } finally {
                isLoaded.value = true
                inflight = undefined
            }
        })()
        return inflight
    }

    async function refresh() {
        isLoaded.value = false
        await load()
    }

    return { vaults, isLoaded, load, refresh }
}
