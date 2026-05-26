import type { Preferences } from '~~/shared/types/preferences'
import {
    DEFAULT_PRIMARY_COLOR_ID,
    getPrimaryColor,
} from '~~/shared/utils/primary-colors'

function defaultPreferences(): Preferences {
    return {
        primaryColorId: DEFAULT_PRIMARY_COLOR_ID,
    }
}

export function usePreferences() {
    const preferences = useState<Preferences>('preferences', defaultPreferences)
    const isLoaded = useState<boolean>('preferences-loaded', () => false)

    async function load() {
        if (isLoaded.value) return
        try {
            const data = await $fetch<Preferences>('/api/preferences')
            preferences.value = data
        } catch (error) {
            console.error('Failed to load preferences:', error)
        } finally {
            isLoaded.value = true
        }
    }

    async function setPrimaryColor(id: string) {
        const next: Preferences = {
            ...preferences.value,
            primaryColorId: id,
        }
        preferences.value = next
        try {
            const saved = await $fetch<Preferences>('/api/preferences', {
                method: 'PUT',
                body: next,
            })
            preferences.value = saved
        } catch (error) {
            console.error('Failed to save preferences:', error)
        }
    }

    const primaryColor = computed(() =>
        getPrimaryColor(preferences.value.primaryColorId),
    )

    return {
        preferences,
        primaryColor,
        isLoaded,
        load,
        setPrimaryColor,
    }
}
