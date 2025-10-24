import { syntaxHighlighting } from '@codemirror/language'
import { clouds } from 'thememirror'

import { markdownStyles } from './bold-headings'
import { headingOutdentTheme } from './heading-outdent-theme'

export const themeExtension = [
    clouds,
    syntaxHighlighting(markdownStyles),
    headingOutdentTheme,
]
