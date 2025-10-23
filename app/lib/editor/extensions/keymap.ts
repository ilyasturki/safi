import { closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, historyKeymap } from '@codemirror/commands'
import { searchKeymap } from '@codemirror/search'
import { keymap } from '@codemirror/view'

export const keymapsExtension = keymap.of([
    // Closed-brackets aware backspace
    ...closeBracketsKeymap,
    // A large set of basic bindings
    ...defaultKeymap,
    // Search-related keys
    ...searchKeymap,
    // Redo/undo keys
    ...historyKeymap,
])
