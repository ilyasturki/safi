import { EditorView } from '@codemirror/view'
import { useDebounceFn } from '@vueuse/core'

import type { UseSuggestionStateReturn } from './state'
import type { UseSuggestionStorageReturn } from './storage'
import { useFetchSuggestion } from './fetch'
import { logger } from './logger'

export function useSuggestionActions(
    stateConfig: UseSuggestionStateReturn,
    storageConfig: UseSuggestionStorageReturn,
) {
    const { fetchSuggestion, hasActiveFetch } = useFetchSuggestion()

    const {
        suggestionUiField,
        suggestionTextField,
        hideSuggestionState,
        showSuggestionState,
        insertSuggestionState,
    } = stateConfig
    const { debounceMs } = storageConfig

    function shouldTriggerSuggestion(view: EditorView): boolean {
        const { state } = view
        const cursorPosition = state.selection.main.head
        const cursorLine = state.doc.lineAt(cursorPosition)

        // Check if cursor is at the end of the line or line is empty
        const isAtEndOfLine = cursorPosition === cursorLine.to
        const isEmptyLine = cursorLine.text.trim() === ''

        return isAtEndOfLine || isEmptyLine
    }

    function triggerSuggestion(view: EditorView): boolean {
        const { state } = view
        const cursorPosition = state.selection.main.head
        const currentAiSuggestion = state.field(suggestionUiField)

        if (hasActiveFetch()) {
            logger.trace('AI suggestion request already in progress')
            return false
        }
        if (currentAiSuggestion.size > 0) {
            logger.verbose('AI suggestion already visible, skipping request')
            return false
        }
        if (!shouldTriggerSuggestion(view)) {
            logger.verbose(
                'Cursor not at end of line or in empty line, skipping suggestion',
            )
            return false
        }

        const editorContent = state.doc.toString()
        const cursorLine = state.doc.lineAt(cursorPosition)
        logger.verbose('Requesting AI suggestion for ', cursorLine.text)

        const suggestionRequest = fetchSuggestion({
            editorContent,
            cursorPosition,
        })

        suggestionRequest.then((textSuggestion) => {
            logger.verbose('AI suggestion received:', textSuggestion)
            view.dispatch({
                effects: showSuggestionState.of({
                    pos: cursorPosition,
                    text: textSuggestion,
                }),
            })
        })

        return true
    }

    const debouncedTriggerSuggestion = useDebounceFn(
        triggerSuggestion,
        debounceMs.value,
    )

    function insertCurrentSuggestion(view: EditorView): boolean {
        const { state } = view
        const currentAiSuggestion = state.field(suggestionUiField)
        const suggestionText = state.field(suggestionTextField)

        if (currentAiSuggestion.size <= 0 || suggestionText === null) {
            logger.trace('No AI suggestion available to insert')
            return false
        }

        const cursorPosition = state.selection.main.head
        const newCursorPosition = cursorPosition + suggestionText.length

        view.dispatch({
            changes: {
                from: cursorPosition,
                insert: suggestionText,
            },
            selection: { anchor: newCursorPosition },
            effects: insertSuggestionState.of({
                pos: cursorPosition,
                text: suggestionText,
            }),
        })

        return true
    }

    function hideSuggestion(view: EditorView) {
        view.dispatch({
            effects: hideSuggestionState.of(undefined),
        })
    }

    return {
        triggerSuggestion,
        debouncedTriggerSuggestion,
        insertCurrentSuggestion,
        hideSuggestion,
    }
}
