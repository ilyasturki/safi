export function navigateToEdit(path?: string): void {
    if (!path) {
        navigateTo('/edit')
        return
    }

    const cleanPath = path.replace(/^\/+/u, '').replace(/\/+$/u, '')
    navigateTo(cleanPath ? `/edit/${cleanPath}` : '/edit')
}
