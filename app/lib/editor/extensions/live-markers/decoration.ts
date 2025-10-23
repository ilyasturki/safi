import type { Range } from '@codemirror/state'
import type { DecorationSet, EditorView, ViewUpdate } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { Decoration } from '@codemirror/view'

import type { MarkerConfig } from './marker'
import { logger } from '~~/shared/utils/logger'

export type DecorationPostProcessor = (
    view: EditorView,
    from: number,
    to: number,
) => number

export function initDecorator(markerConfig: MarkerConfig) {
    return {
        createDecoration: (view: EditorView) =>
            buildDecorations(view, markerConfig),
        updateDecoration: (update: ViewUpdate) =>
            buildDecorations(update.view, markerConfig),
    }
}

function buildDecorations(
    view: EditorView,
    markerConfig: MarkerConfig,
): DecorationSet {
    const decorations: Range<Decoration>[] = []
    const tree = syntaxTree(view.state)
    const doc = view.state.doc

    tree.iterate({
        enter: (node) => {
            // logger.trace(
            //     `Visiting node: ${node.name}`,
            //     doc.sliceString(node.from, node.to),
            // )
            if (node.name === markerConfig.markName) {
                const from = node.from
                let to = node.to
                const text = doc.sliceString(from, to)
                logger.verbose(
                    `Found node: ${node.name} from ${from} to ${to} with text: "${text}"`,
                )

                if (markerConfig.decorationPostProcessor) {
                    to = markerConfig.decorationPostProcessor(view, from, to)
                }

                decorations.push(
                    Decoration.replace({
                        widget: markerConfig.widget,
                    }).range(from, to),
                )
            }
        },
    })

    return Decoration.set(decorations)
}
