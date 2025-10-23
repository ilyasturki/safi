import type { WidgetType } from '@codemirror/view'

import type { DecorationPostProcessor } from './decoration'
import type { FilterMode } from './filter'
import Separator from '~/components/ui/separator/separator.vue'
import { QuoteWidget, TextWidget, VueWidget } from './widget'

interface BaseMarkerConfig {
    markName: string
    nodeNames: readonly string[]
    filterMode: FilterMode
    decorationPostProcessor?: DecorationPostProcessor
    widget: WidgetType
}

interface PairedMarkerConfig extends BaseMarkerConfig {
    filterMode: 'paired'
    getMarkerLength: (nodeName: string, text: string) => number
}

interface SimpleMarkerConfig extends BaseMarkerConfig {
    filterMode: Exclude<BaseMarkerConfig['filterMode'], 'paired'>
}

export type MarkerConfig = PairedMarkerConfig | SimpleMarkerConfig

export const marker = {
    heading: <MarkerConfig>{
        markName: 'HeaderMark',
        nodeNames: ['ATXHeading'],
        filterMode: 'line',
        widget: new TextWidget(''),
        decorationPostProcessor: (view, from, to) => {
            // Remove a space after heading if it exists
            if (view.state.doc.sliceString(from, to + 1).endsWith(' ')) {
                return to + 1
            }
            return to
        },
    },
    quote: <MarkerConfig>{
        markName: 'QuoteMark',
        nodeNames: ['BlockQuote'],
        filterMode: 'line',
        widget: new QuoteWidget(),
    },
    emphasis: <MarkerConfig>{
        markName: 'EmphasisMark',
        nodeNames: ['StrongEmphasis', 'Emphasis'],
        filterMode: 'paired',
        widget: new TextWidget(''),
        getMarkerLength: (nodeName, text) => {
            if (nodeName === 'StrongEmphasis') {
                return text.startsWith('**') || text.startsWith('__') ? 2 : 1
            }
            return 1
        },
    },
    strikethrough: <MarkerConfig>{
        markName: 'StrikethroughMark',
        nodeNames: ['Strikethrough'],
        filterMode: 'paired',
        widget: new TextWidget(''),
        getMarkerLength: () => 2,
    },
    code: <MarkerConfig>{
        markName: 'CodeMark',
        nodeNames: ['InlineCode', 'FencedCode'],
        filterMode: 'paired',
        widget: new TextWidget(''),
        getMarkerLength: (nodeName, _text) =>
            nodeName === 'FencedCode' ? 3 : 1,
    },
    horizontalRule: <MarkerConfig>{
        markName: 'HorizontalRule',
        nodeNames: ['HorizontalRule'],
        filterMode: 'line',
        widget: new VueWidget(Separator, {
            orientation: 'horizontal',
            class: 'inline-flex',
        }),
    },
} as const
