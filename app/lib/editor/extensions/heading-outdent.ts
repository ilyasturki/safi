import { syntaxTree } from '@codemirror/language'
import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, ViewPlugin } from '@codemirror/view'
import type { DecorationSet, EditorView, ViewUpdate } from '@codemirror/view'

const headingLineDecorations = {
    h1: Decoration.line({ attributes: { class: 'cm-heading-line-1' } }),
    h2: Decoration.line({ attributes: { class: 'cm-heading-line-2' } }),
    h3: Decoration.line({ attributes: { class: 'cm-heading-line-3' } }),
    h4: Decoration.line({ attributes: { class: 'cm-heading-line-4' } }),
    h5: Decoration.line({ attributes: { class: 'cm-heading-line-5' } }),
    h6: Decoration.line({ attributes: { class: 'cm-heading-line-6' } }),
}

function buildHeadingDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>()
    const tree = syntaxTree(view.state)

    for (const { from, to } of view.visibleRanges) {
        tree.iterate({
            from,
            to,
            enter: (node) => {
                let decoration: Decoration | undefined

                switch (node.name) {
                    case 'ATXHeading1':
                        decoration = headingLineDecorations.h1
                        break
                    case 'ATXHeading2':
                        decoration = headingLineDecorations.h2
                        break
                    case 'ATXHeading3':
                        decoration = headingLineDecorations.h3
                        break
                    case 'ATXHeading4':
                        decoration = headingLineDecorations.h4
                        break
                    case 'ATXHeading5':
                        decoration = headingLineDecorations.h5
                        break
                    case 'ATXHeading6':
                        decoration = headingLineDecorations.h6
                        break
                }

                if (decoration) {
                    const line = view.state.doc.lineAt(node.from)
                    builder.add(line.from, line.from, decoration)
                }
            },
        })
    }

    return builder.finish()
}

export const headingOutdentExtension = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet

        constructor(view: EditorView) {
            this.decorations = buildHeadingDecorations(view)
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = buildHeadingDecorations(update.view)
            }
        }
    },
    {
        decorations: (v) => v.decorations,
    },
)
