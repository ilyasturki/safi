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
                vaults.value = await $fetch<Vault[]>('/api/vaults')
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
