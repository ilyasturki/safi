import { boysAndGirls, clouds } from 'thememirror'
import { syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'

import { markdownStyles } from './bold-headings'
import { headingOutdentTheme } from './heading-outdent-theme'

const theme = [syntaxHighlighting(markdownStyles), headingOutdentTheme]

const caretOverride = EditorView.theme({
    '.cm-content': {
        caretColor: 'var(--safi-primary) !important',
    },
    '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: 'var(--safi-primary) !important',
    },
})

const lightBackground = EditorView.theme(
    {
        '&': {
            backgroundColor: '#ffffff',
        },
        '.cm-gutters': {
            backgroundColor: '#ffffff',
        },
    },
    { dark: false },
)

const darkBackground = EditorView.theme(
    {
        '&': {
            backgroundColor: '#09090b',
        },
        '.cm-gutters': {
            backgroundColor: '#09090b',
        },
    },
    { dark: true },
)

export const lightTheme = [clouds, ...theme, lightBackground, caretOverride]
export const darkTheme = [boysAndGirls, ...theme, darkBackground, caretOverride]
