import {
    Prec,
    StateEffect,
    StateField,
    type Extension,
} from '@codemirror/state'
import { Decoration, EditorView, keymap, WidgetType } from '@codemirror/view'

import type {
    AiCompletionRequest,
    AiCompletionResponse,
} from '~~/shared/types/api'

interface InlineSuggestion {
    text: string
    from: number
}

const setSuggestion = StateEffect.define<InlineSuggestion | null>()

const suggestionState = StateField.define<InlineSuggestion | null>({
    create: () => null,
    update(value, tr) {
        let next = value
        for (const effect of tr.effects) {
            if (effect.is(setSuggestion)) next = effect.value
        }
        if (next === null) return null
        if (tr.docChanged) return null
        if (tr.selection && !tr.selection.main.empty) return null
        if (tr.selection && tr.selection.main.head !== next.from) return null
        return next
    },
})

class GhostTextWidget extends WidgetType {
    constructor(readonly text: string) {
        super()
    }

    override eq(other: GhostTextWidget) {
        return other.text === this.text
    }

    override toDOM() {
        const span = document.createElement('span')
        span.className = 'cm-inline-suggestion'
        // Preserve newlines by splitting into per-line spans so wrapping behaves.
        const lines = this.text.split('\n')
        lines.forEach((line, index) => {
            if (index > 0) span.appendChild(document.createElement('br'))
            const text = document.createTextNode(line)
            span.appendChild(text)
        })
        return span
    }

    override ignoreEvent() {
        return true
    }
}

const suggestionDecorations = EditorView.decorations.compute(
    [suggestionState],
    (state) => {
        const suggestion = state.field(suggestionState)
        if (!suggestion || suggestion.text.length === 0) {
            return Decoration.none
        }
        return Decoration.set([
            Decoration.widget({
                widget: new GhostTextWidget(suggestion.text),
                side: 1,
            }).range(suggestion.from),
        ])
    },
)

const inlineSuggestionTheme = EditorView.theme({
    '.cm-inline-suggestion': {
        opacity: '0.45',
        fontStyle: 'italic',
        pointerEvents: 'none',
    },
})

function acceptSuggestion(view: EditorView): boolean {
    const suggestion = view.state.field(suggestionState, false)
    if (!suggestion || suggestion.text.length === 0) return false
    const sel = view.state.selection
    // Only accept with a single collapsed caret at the suggestion anchor —
    // otherwise let Tab fall through to indent / multi-cursor commands.
    if (sel.ranges.length !== 1) return false
    if (!sel.main.empty) return false
    if (sel.main.head !== suggestion.from) return false

    view.dispatch({
        changes: { from: suggestion.from, insert: suggestion.text },
        selection: { anchor: suggestion.from + suggestion.text.length },
        effects: setSuggestion.of(null),
        userEvent: 'input.complete',
    })
    return true
}

function dismissSuggestion(view: EditorView): boolean {
    const suggestion = view.state.field(suggestionState, false)
    if (!suggestion || suggestion.text.length === 0) return false
    view.dispatch({ effects: setSuggestion.of(null) })
    return true
}

interface PendingRequest {
    controller: AbortController
    id: number
}

let activeRequestId = 0
let pending: PendingRequest | null = null
let cooldownUntil = 0

function readRetryAfterSeconds(error: unknown): number {
    const data = (error as { data?: { data?: { retryAfter?: unknown } } })
        ?.data?.data?.retryAfter
    if (typeof data === 'number' && Number.isFinite(data) && data > 0) {
        return Math.ceil(data)
    }
    return 10
}

async function requestSuggestion(view: EditorView): Promise<boolean> {
    if (Date.now() < cooldownUntil) return false

    const selection = view.state.selection.main
    if (!selection.empty) return false

    const pos = selection.head
    const doc = view.state.doc
    const prefix = doc.sliceString(0, pos)
    const suffix = doc.sliceString(pos)

    pending?.controller.abort()

    const controller = new AbortController()
    const requestId = ++activeRequestId
    pending = { controller, id: requestId }

    const body: AiCompletionRequest = { prefix, suffix }
    try {
        const response = await $fetch<AiCompletionResponse>('/api/ai/complete', {
            method: 'POST',
            body,
            signal: controller.signal,
        })
        if (requestId !== activeRequestId) return true
        if (view.state.selection.main.head !== pos) return true

        const completion = response.completion ?? ''
        if (!completion) {
            view.dispatch({ effects: setSuggestion.of(null) })
            return true
        }

        view.dispatch({
            effects: setSuggestion.of({ text: completion, from: pos }),
        })
    } catch (error) {
        if (controller.signal.aborted) return true
        if (requestId !== activeRequestId) return true

        const status = (error as { statusCode?: number; status?: number })
            ?.statusCode
            ?? (error as { status?: number })?.status
        if (status === 429) {
            cooldownUntil = Date.now() + readRetryAfterSeconds(error) * 1000
            view.dispatch({ effects: setSuggestion.of(null) })
            return true
        }

        console.error('Inline completion request failed:', error)
        view.dispatch({ effects: setSuggestion.of(null) })
    } finally {
        if (pending?.id === requestId) pending = null
    }
    return true
}

export const triggerInlineCompletion = (view: EditorView): boolean => {
    if (!view.state.selection.main.empty) return false
    void requestSuggestion(view)
    return true
}

const inlineCompletionKeymap = Prec.highest(
    keymap.of([
        {
            key: 'Mod-Space',
            run: triggerInlineCompletion,
        },
        {
            key: 'Tab',
            run: acceptSuggestion,
        },
        {
            key: 'Escape',
            run: dismissSuggestion,
        },
    ]),
)

export function inlineCompletionExtension(): Extension {
    return [
        suggestionState,
        suggestionDecorations,
        inlineSuggestionTheme,
        inlineCompletionKeymap,
    ]
}
