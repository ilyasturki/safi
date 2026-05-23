import { boysAndGirls, clouds } from 'thememirror'
import { syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'

import { markdownStyles } from './bold-headings'
import { headingOutdentTheme } from './heading-outdent-theme'

const theme = [syntaxHighlighting(markdownStyles), headingOutdentTheme]

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

export const lightTheme = [clouds, ...theme, lightBackground]
export const darkTheme = [boysAndGirls, ...theme, darkBackground]
