import type { DecorationSet } from '@codemirror/view'
import { StateEffect, StateField } from '@codemirror/state'
import { Decoration, EditorView } from '@codemirror/view'

import { AiSuggestionWidget } from './widget'

export type UseSuggestionStateReturn = ReturnType<typeof useSuggestionState>

export const useSuggestionState = () => {
    const showSuggestion = StateEffect.define<{ pos: number; text: string }>()
    const hideSuggestion = StateEffect.define<undefined>()
    const insertSuggestion = StateEffect.define<{ pos: number; text: string }>()

    const suggestionUiField = StateField.define<DecorationSet>({
        create() {
            return Decoration.none
        },
        update(decorations, transaction) {
            decorations = decorations.map(transaction.changes)

            for (const effect of transaction.effects) {
                if (effect.is(showSuggestion)) {
                    const { pos, text } = effect.value
                    const decoration = Decoration.widget({
                        widget: new AiSuggestionWidget(text),
                        side: 1,
                    })
                    decorations = decorations.update({
                        add: [decoration.range(pos)],
                    })
                } else if (effect.is(hideSuggestion)) {
                    decorations = Decoration.none
                } else if (effect.is(insertSuggestion)) {
                    decorations = Decoration.none
                }
            }

            return decorations
        },
        provide: (f) => EditorView.decorations.from(f),
    })

    const suggestionTextField = StateField.define<string | null>({
        create() {
            return null
        },
        update(currentText, transaction) {
            for (const effect of transaction.effects) {
                if (effect.is(showSuggestion)) {
                    return effect.value.text
                } else if (
                    effect.is(hideSuggestion)
                    || effect.is(insertSuggestion)
                ) {
                    return null
                }
            }
            return currentText
        },
    })

    return {
        showSuggestionState: showSuggestion,
        hideSuggestionState: hideSuggestion,
        insertSuggestionState: insertSuggestion,
        suggestionUiField,
        suggestionTextField,
    }
}
