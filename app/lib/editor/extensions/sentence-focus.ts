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
    const sentenceEnders = /[.!?](?=\s|$)|\n\n/g

    let sentenceStart = 0
    let sentenceEnd = text.length

    let match: RegExpExecArray | null
    let lastEnd = 0

    while ((match = sentenceEnders.exec(text)) !== null) {
        const matchEnd = match.index + match[0].length

        if (matchEnd <= cursorPos) {
            sentenceStart = matchEnd
            while (sentenceStart < text.length && /\s/.test(text[sentenceStart])) {
                sentenceStart++
            }
            lastEnd = matchEnd
        } else {
            sentenceEnd = matchEnd
            break
        }
    }

    if (cursorPos < sentenceStart) {
        sentenceStart = lastEnd
        while (sentenceStart < text.length && /\s/.test(text[sentenceStart])) {
            sentenceStart++
        }
    }

    return { start: sentenceStart, end: sentenceEnd }
}

const sentenceFocusPlugin = ViewPlugin.fromClass(
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
            const cursorPos = state.selection.main.head
            const text = state.doc.toString()

            const { start, end } = findSentenceBoundary(text, cursorPos)

            if (start > 0) {
                decorations.push(
                    Decoration.mark({
                        class: 'cm-sentence-dimmed',
                    }).range(0, start),
                )
            }

            if (end < text.length) {
                decorations.push(
                    Decoration.mark({
                        class: 'cm-sentence-dimmed',
                    }).range(end, text.length),
                )
            }

            return Decoration.set(decorations)
        }
    },
    {
        decorations: (instance) => instance.decorations,
    },
)

const sentenceFocusTheme = EditorView.baseTheme({
    '.cm-sentence-dimmed': {
        opacity: '0.3',
    },
})

export const sentenceFocusExtension = [sentenceFocusPlugin, sentenceFocusTheme]
