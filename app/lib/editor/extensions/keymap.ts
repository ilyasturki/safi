import { closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, historyKeymap } from '@codemirror/commands'
import { searchKeymap } from '@codemirror/search'
import type { KeyBinding } from '@codemirror/view'
import { keymap } from '@codemirror/view'

// Bindings vim owns. Stripping them from competing keymaps stops
// CodeMirror's defaults from firing in insert mode (where vim passes
// most Ctrl-* through), e.g. Mod-d → selectNextOccurrence wrapping
// to top of file.
const VIM_OWNED_KEYS = new Set<string>([
    'Ctrl-a',
    'Ctrl-b',
    'Ctrl-d',
    'Ctrl-e',
    'Ctrl-f',
    'Ctrl-n',
    'Ctrl-o',
    'Ctrl-p',
    'Ctrl-r',
    'Ctrl-u',
    'Ctrl-v',
    'Ctrl-w',
    'Ctrl-x',
    'Ctrl-y',
    'Mod-d',
])

function stripVimKeys(bindings: readonly KeyBinding[]): KeyBinding[] {
    return bindings.filter((b) => !b.key || !VIM_OWNED_KEYS.has(b.key))
}

export function createKeymapsExtension(vimMode: boolean) {
    const def = vimMode ? stripVimKeys(defaultKeymap) : defaultKeymap
    const search = vimMode ? stripVimKeys(searchKeymap) : searchKeymap
    return keymap.of([
        ...closeBracketsKeymap,
        ...def,
        ...search,
        ...historyKeymap,
    ])
}

export const keymapsExtension = createKeymapsExtension(false)
