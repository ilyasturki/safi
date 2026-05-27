import { useLocalStorage } from '@vueuse/core'

const STORAGE_KEY = 'safi:opened-files'

export function useOpenedFiles() {
    const openedAt = useLocalStorage<Record<string, number>>(STORAGE_KEY, {})

    const markFileOpened = (filePath: string): void => {
        openedAt.value = { ...openedAt.value, [filePath]: Date.now() }
    }

    const pruneOpenedFiles = (knownPaths: Iterable<string>): void => {
        const allowed = new Set(knownPaths)
        const current = openedAt.value
        const next: Record<string, number> = {}
        let changed = false
        for (const [path, openedTime] of Object.entries(current)) {
            if (typeof openedTime !== 'number' || !Number.isFinite(openedTime)) {
                changed = true
                continue
            }
            if (allowed.has(path)) {
                next[path] = openedTime
            } else {
                changed = true
            }
        }
        if (changed) openedAt.value = next
    }

    return {
        openedAt,
        markFileOpened,
        pruneOpenedFiles,
    }
}
