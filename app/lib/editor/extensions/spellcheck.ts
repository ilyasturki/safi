import { EditorView } from '@codemirror/view'

export const noSpell = EditorView.contentAttributes.of({
    spellcheck: 'false',
    autocorrect: 'off',
    autocapitalize: 'off',
    'data-lt-active': 'false',
})
