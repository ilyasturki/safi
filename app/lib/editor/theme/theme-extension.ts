import { syntaxHighlighting } from '@codemirror/language'

import { baseViewTheme } from './base-view-theme'
import { markdownHighlightStyle } from './markdown-highlight-style'
import { highlightStyle, viewTheme } from './theme'

export const themeExtension = [
    baseViewTheme,

    viewTheme,
    syntaxHighlighting(highlightStyle),

    syntaxHighlighting(markdownHighlightStyle),
]
