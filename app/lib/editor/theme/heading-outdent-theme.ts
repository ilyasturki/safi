import { EditorView } from '@codemirror/view'

export const headingOutdentTheme = EditorView.theme({
    '.cm-heading-line-1': {
        textIndent: '-2ch',
        paddingLeft: '-2ch',
    },
    '.cm-heading-line-2': {
        textIndent: '-3ch',
        paddingLeft: '-3ch',
    },
    '.cm-heading-line-3': {
        textIndent: '-4ch',
        paddingLeft: '-4ch',
    },
    '.cm-heading-line-4': {
        textIndent: '-5ch',
        paddingLeft: '-5ch',
    },
    '.cm-heading-line-5': {
        textIndent: '-6ch',
        paddingLeft: '-6ch',
    },
    '.cm-heading-line-6': {
        textIndent: '-7ch',
        paddingLeft: '-7ch',
    },
})
