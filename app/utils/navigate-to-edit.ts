export function navigateToEdit(path?: string): void {
    if (!path) {
        void navigateTo('/edit')
        return
    }

    const cleanPath = path.replace(/^\/+/u, '').replace(/\/+$/u, '')
    void navigateTo(cleanPath ? `/edit/${cleanPath}` : '/edit')
}
