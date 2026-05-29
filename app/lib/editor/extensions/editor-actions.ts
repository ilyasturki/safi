import { moveLineDown, moveLineUp } from '@codemirror/commands'
import type { Extension } from '@codemirror/state'
import type { Command, KeyBinding as CmKeyBinding } from '@codemirror/view'
import { keymap } from '@codemirror/view'
import { Vim } from '@replit/codemirror-vim'

import type {
    EditorAction,
    EditorActionMode,
    EditorKeyBindings,
} from '~~/shared/types/keybindings'
import {
    EDITOR_ACTIONS,
    EDITOR_ACTION_META,
} from '~~/shared/utils/keybindings'

let exDefined = false
function defineExCommands() {
    if (exDefined) return
    exDefined = true
    Vim.defineEx('safiMoveLineUp', undefined, (cm) => {
        moveLineUp(cm.cm6)
    })
    Vim.defineEx('safiMoveLineDown', undefined, (cm) => {
        moveLineDown(cm.cm6)
    })
}

function vimContextOf(mode: EditorActionMode): string | undefined {
    switch (mode) {
        case 'vim-insert':
            return 'insert'
        case 'vim-normal':
            return 'normal'
        case 'vim-visual':
            return 'visual'
        default:
            return undefined
    }
}

function vimRhsFor(action: EditorAction): string | undefined {
    switch (action) {
        case 'vim-escape-insert':
            return '<Esc>'
        case 'vim-move-line-up':
            return ':safiMoveLineUp<CR>'
        case 'vim-move-line-down':
            return ':safiMoveLineDown<CR>'
        default:
            return undefined
    }
}

interface AppliedVimEntry {
    keys: string
    ctx: string
}

let appliedVim: AppliedVimEntry[] = []

// Vim mappings live on a singleton — applying user bindings mutates global
// state. Re-apply whenever editor bindings change to keep it in sync.
export function applyVimUserBindings(bindings: EditorKeyBindings) {
    defineExCommands()
    for (const entry of appliedVim) {
        try {
            Vim.unmap(entry.keys, entry.ctx)
        } catch {
            // ignore — unmap may throw if the binding was already cleared.
        }
    }
    appliedVim = []
    // Dedup (sequence, ctx) so the first action wins; the upstream Vim
    // singleton would otherwise silently overwrite earlier mappings.
    const claimed = new Set<string>()
    for (const action of EDITOR_ACTIONS) {
        const meta = EDITOR_ACTION_META[action]
        const ctx = vimContextOf(meta.mode)
        if (!ctx) continue
        const rhs = vimRhsFor(action)
        if (!rhs) continue
        const keys = bindings[action]?.keys ?? []
        for (const sequence of keys) {
            const claim = `${ctx}\0${sequence}`
            if (claimed.has(claim)) continue
            claimed.add(claim)
            try {
                Vim.noremap(sequence, rhs, ctx)
                appliedVim.push({ keys: sequence, ctx })
            } catch {
                // ignore — a malformed sequence must not abort the loop.
            }
        }
    }
}

function editorCommandFor(action: EditorAction): Command | undefined {
    switch (action) {
        case 'editor-move-line-up':
            return moveLineUp
        case 'editor-move-line-down':
            return moveLineDown
        default:
            return undefined
    }
}

// CodeMirror's keymap parses modifier prefixes like `Mod-`, `Ctrl-`, `Alt-`,
// etc., and throws on unknown modifiers. Filter sequences with bad modifiers
// here so a malformed user binding can't crash the extensions reconfigure.
const MOD_NAME = /^(cmd|meta|m|a|alt|c|ctrl|control|s|shift|mod)$/i
function isValidKeyString(key: string): boolean {
    const parts = key.split(/-(?!$)/)
    const base = parts[parts.length - 1]
    if (!base || base.length === 0) return false
    for (let i = 0; i < parts.length - 1; i++) {
        if (!MOD_NAME.test(parts[i]!)) return false
    }
    return true
}

export function createEditorActionsKeymap(
    bindings: EditorKeyBindings,
): Extension {
    const entries: CmKeyBinding[] = []
    const claimed = new Set<string>()
    for (const action of EDITOR_ACTIONS) {
        const meta = EDITOR_ACTION_META[action]
        if (meta.mode !== 'editor') continue
        const command = editorCommandFor(action)
        if (!command) continue
        const keys = bindings[action]?.keys ?? []
        for (const sequence of keys) {
            if (!isValidKeyString(sequence)) continue
            if (claimed.has(sequence)) continue
            claimed.add(sequence)
            entries.push({ key: sequence, run: command, preventDefault: true })
        }
    }
    return keymap.of(entries)
}
