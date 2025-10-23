import { useStorage } from '@vueuse/core'

import type { SuggestionConfig, SuggestionTriggerMode } from './config'
import { defaultSuggestionConfig } from './config'

export type UseSuggestionStorageReturn = ReturnType<typeof useSuggestionStorage>

const STORAGE_KEY = 'editor-suggestion-config'

export function useSuggestionStorage() {
    const config = useStorage<SuggestionConfig>(
        STORAGE_KEY,
        defaultSuggestionConfig,
    )

    const triggerMode = computed({
        get: () => config.value.triggerMode,
        set: (value: SuggestionTriggerMode) => {
            config.value.triggerMode = value
        },
    })

    const debounceMs = computed({
        get: () => config.value.debounceMs,
        set: (value: number) => {
            config.value.debounceMs = value
        },
    })

    const canTriggerManually = computed(
        () => config.value.triggerMode !== 'auto',
    )

    const canTriggerAutomatically = computed(
        () => config.value.triggerMode !== 'manual',
    )

    return {
        config: readonly(config),
        triggerMode,
        debounceMs,

        canTriggerManually,
        canTriggerAutomatically,
    }
}
