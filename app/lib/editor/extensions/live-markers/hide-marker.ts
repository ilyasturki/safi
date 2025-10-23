import type { DecorationSet, ViewUpdate } from '@codemirror/view'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'

import type { DecorationPostProcessor } from './decoration'
import type { MarkerContext } from './filter'
import type { MarkerConfig } from './marker'
import { logger } from '~~/shared/utils/logger'
import { initDecorator } from './decoration'
import { getFilter } from './filter'

export type HideMarkerConfig = {
    decorationPostProcessor?: DecorationPostProcessor
}

export function createMarkerHider(markerConfig: MarkerConfig) {
    const { createDecoration, updateDecoration } = initDecorator(markerConfig)

    return ViewPlugin.fromClass(
        class {
            private allDecorations: DecorationSet
            decorations: DecorationSet

            constructor(view: EditorView) {
                this.allDecorations = createDecoration(view)
                this.decorations = this.filterDecorations(
                    this.allDecorations,
                    view,
                )
            }

            update(update: ViewUpdate) {
                this.allDecorations = updateDecoration(update)
                this.decorations = this.filterDecorations(
                    this.allDecorations,
                    update.view,
                )
            }

            private filterDecorations(
                decos: DecorationSet,
                view: EditorView,
            ): DecorationSet {
                return decos.update({
                    filter: (markerFrom, markerTo) => {
                        logger.verbose(
                            `Filtering decorations from ${markerFrom} to ${markerTo}`,
                        )
                        const context: MarkerContext = {
                            view,
                            markerFrom,
                            markerTo,
                        }
                        return getFilter(context, markerConfig)
                    },
                })
            }
        },
        {
            decorations: (instance) => instance.decorations,
            provide: (plugin) =>
                EditorView.atomicRanges.of((view) => {
                    return view.plugin(plugin)?.decorations || Decoration.none
                }),
        },
    )
}
