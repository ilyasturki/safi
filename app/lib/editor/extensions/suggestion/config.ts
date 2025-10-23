export type SuggestionTriggerMode = 'manual' | 'auto' | 'both'

export type SuggestionConfig = {
    // Defines how suggestions are triggered
    // 'manual' - suggestions are triggered only by specific keys
    // 'auto' - suggestions are triggered automatically based on typing
    // 'both' - suggestions can be triggered both manually and automatically
    triggerMode: SuggestionTriggerMode
    // Debounce time in milliseconds for automatic suggestions
    debounceMs: number
}

export const defaultSuggestionConfig: SuggestionConfig = {
    triggerMode: 'auto',
    debounceMs: 300,
}
