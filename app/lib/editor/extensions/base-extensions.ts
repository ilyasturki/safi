import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import { history } from '@codemirror/commands'
import { bracketMatching, indentOnInput } from '@codemirror/language'
import { highlightSelectionMatches } from '@codemirror/search'
import { EditorState } from '@codemirror/state'
import { dropCursor, EditorView, highlightSpecialChars } from '@codemirror/view'

// https://codemirror.net/docs/extensions/
export const baseExtensions = [
    // Whitespace
    indentOnInput(),

    // Editing Helpers
    EditorState.allowMultipleSelections.of(true),
    autocompletion(),
    closeBrackets(),
    history(),

    // Presentation Features
    // drawSelection(),
    EditorView.lineWrapping,
    highlightSpecialChars(),
    // scrollPastEnd(),
    bracketMatching(),
    highlightSelectionMatches(),

    // Input Handling
    dropCursor(),
]
