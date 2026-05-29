import { useActiveVault } from '~/composables/use-active-vault'

export function navigateToEdit(path?: string, vaultId?: string): void {
    const id = vaultId ?? useActiveVault().id.value
    if (!id) {
        void navigateTo('/')
        return
    }
    const base = `/v/${id}/edit`
    if (!path) {
        void navigateTo(base)
        return
    }

    const cleanPath = path.replace(/^\/+/u, '').replace(/\/+$/u, '')
    void navigateTo(cleanPath ? `${base}/${cleanPath}` : base)
}
