import { HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'

import { markdownTags } from '~/lib/editor/extensions/markdown'

export const markdownHighlightStyle = HighlightStyle.define([
    {
        tag: tags.heading1,
        class: 'text-rel-3xl',
    },
    {
        tag: tags.heading2,
        class: 'text-rel-2xl',
    },
    {
        tag: tags.heading3,
        class: 'text-rel-xl',
    },
    {
        tag: tags.heading4,
        class: 'text-rel-lg',
    },
    {
        tag: tags.heading5,
        class: 'text-rel-base',
    },
    {
        tag: tags.heading6,
        class: 'text-rel-sm',
    },
    {
        tag: markdownTags.QuoteMark,
        class: 'border-l-2 opacity-50',
    },
])
