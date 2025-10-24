import type { DecorationSet, ViewUpdate } from '@codemirror/view'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'

interface SentenceBoundary {
    start: number
    end: number
}

function findSentenceBoundary(
    text: string,
    cursorPos: number,
): SentenceBoundary {
    const sentenceEnders = /[!.?](?=\s|$)|\n/gu

    let sentenceStart = 0
    let sentenceEnd = text.length

    let match: RegExpExecArray | null
    let lastEnd = 0

    match = sentenceEnders.exec(text)
    while (match !== null) {
        const matchEnd = match.index + match[0].length

        if (matchEnd <= cursorPos) {
            sentenceStart = matchEnd
            while (
                sentenceStart < text.length
                && /\s/u.test(text.charAt(sentenceStart))
            ) {
                sentenceStart++
            }
            lastEnd = matchEnd
            match = sentenceEnders.exec(text)
        } else {
            sentenceEnd = matchEnd
            break
        }
    }

    if (cursorPos < sentenceStart) {
        sentenceStart = lastEnd
        while (
            sentenceStart < text.length
            && /\s/u.test(text.charAt(sentenceStart))
        ) {
            sentenceStart++
        }
    }

    return { start: sentenceStart, end: sentenceEnd }
}

const focusModePlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet

        constructor(view: EditorView) {
            this.decorations = this.buildDecorations(view)
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.selectionSet) {
                this.decorations = this.buildDecorations(update.view)
            }
        }

        buildDecorations(view: EditorView): DecorationSet {
            const decorations = []
            const { state } = view
            const selection = state.selection.main
            const text = state.doc.toString()

            let focusStart: number
            let focusEnd: number

            if (selection.from === selection.to) {
                const cursorPos = selection.head
                const { start, end } = findSentenceBoundary(text, cursorPos)
                focusStart = start
                focusEnd = end
            } else {
                const selectionStart = selection.from
                const selectionEnd = selection.to

                const startBoundary = findSentenceBoundary(text, selectionStart)
                const endBoundary = findSentenceBoundary(text, selectionEnd)

                focusStart = startBoundary.start
                focusEnd = endBoundary.end
            }

            if (focusStart > 0) {
                decorations.push(
                    Decoration.mark({
                        class: 'cm-focus-dimmed',
                    }).range(0, focusStart),
                )
            }

            if (focusEnd < text.length) {
                decorations.push(
                    Decoration.mark({
                        class: 'cm-focus-dimmed',
                    }).range(focusEnd, text.length),
                )
            }

            return Decoration.set(decorations)
        }
    },
    {
        decorations: (instance) => instance.decorations,
    },
)

const focusModeTheme = EditorView.baseTheme({
    '.cm-focus-dimmed': {
        opacity: '0.3',
    },
})

export const focusModeExtension = [focusModePlugin, focusModeTheme]
