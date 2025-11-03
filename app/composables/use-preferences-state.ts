import { useLocalStorage } from '@vueuse/core'

export function usePreferencesState() {
    const enableFocusMode = useLocalStorage('enable-focus-mode', false)
    return {
        enableFocusMode,
    }
}
