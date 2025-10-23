import { useEventHandler } from './events'
import { useSuggestionState } from './state'
import { useSuggestionStorage } from './storage'

export function useSuggestion() {
    const storageConfig = useSuggestionStorage()
    const stateConfig = useSuggestionState()

    const domEventHandlers = useEventHandler(stateConfig, storageConfig)

    const extensions = [
        stateConfig.suggestionUiField,
        stateConfig.suggestionTextField,
        domEventHandlers,
    ]
    return {
        extension: extensions,
    }
}
