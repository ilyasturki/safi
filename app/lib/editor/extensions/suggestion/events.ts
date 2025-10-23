import { EditorView } from '@codemirror/view'

import type { UseSuggestionStateReturn } from './state'
import type { UseSuggestionStorageReturn } from './storage'
import { useSuggestionActions } from './action'
import { logger } from './logger'
import { normalizeKeyEvent } from './utils'

export function useEventHandler(
    stateConfig: UseSuggestionStateReturn,
    storageConfig: UseSuggestionStorageReturn,
) {
    const {
        triggerSuggestion,
        debouncedTriggerSuggestion,
        insertCurrentSuggestion,
        hideSuggestion,
    } = useSuggestionActions(stateConfig, storageConfig)

    const { canTriggerManually, canTriggerAutomatically } = storageConfig

    const domEventHandlers = EditorView.domEventHandlers({
        click(_event, view) {
            hideSuggestion(view)
            return false
        },
        keydown(event, view) {
            const normalizedKey = normalizeKeyEvent(event)
            logger.verbose(`Normalized Event ${normalizedKey}`)

            switch (normalizedKey) {
                case 'escape':
                    hideSuggestion(view)
                    return true

                case 'alt':
                    if (canTriggerManually.value) {
                        return triggerSuggestion(view)
                    }
                    break

                case 'tab':
                    return insertCurrentSuggestion(view)

                case 'ctrl':
                case 'shift':
                case 'meta':
                case 'capslock':
                    // Ignore non action keys
                    return false

                case undefined:
                    // repeat events that are ignored
                    return false

                default:
                    // General handling for all unhandled keys
                    if (canTriggerAutomatically.value) {
                        debouncedTriggerSuggestion(view)
                    }
                    hideSuggestion(view)
                    break
            }

            return false
        },
    })

    return domEventHandlers
}
