import type { DirectoryListing } from '~~/shared/types/api'

export function useFsBrowser() {
    const listing = ref<DirectoryListing | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    async function navigate(targetPath?: string) {
        isLoading.value = true
        error.value = null
        try {
            listing.value = await $fetch<DirectoryListing>('/api/fs/list', {
                query: targetPath ? { path: targetPath } : undefined,
            })
        } catch (err) {
            error.value =
                (err as { statusMessage?: string })?.statusMessage
                ?? 'Failed to read directory'
        } finally {
            isLoading.value = false
        }
    }

    return { listing, isLoading, error, navigate }
}
