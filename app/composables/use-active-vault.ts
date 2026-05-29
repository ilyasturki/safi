import { useLocalStorage } from '@vueuse/core'

const ACTIVE_VAULT_KEY = 'safi:active-vault'

export function useStoredActiveVault() {
    return useLocalStorage<string | undefined>(ACTIVE_VAULT_KEY, undefined)
}

export function useActiveVault() {
    const route = useRoute()
    const stored = useStoredActiveVault()

    const id = computed(() => {
        const param = route.params.vault
        if (typeof param === 'string') return param
        if (Array.isArray(param) && typeof param[0] === 'string')
            return param[0]
        return ''
    })

    const apiBase = computed(() =>
        id.value ? `/api/vaults/${id.value}` : '',
    )

    watch(
        id,
        (current) => {
            if (current) stored.value = current
        },
        { immediate: true },
    )

    async function switchTo(targetId: string) {
        stored.value = targetId
        await navigateTo(`/v/${targetId}/`)
    }

    return { id, apiBase, switchTo }
}
