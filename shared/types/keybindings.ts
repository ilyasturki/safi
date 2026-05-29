export interface KeyBinding {
    key: string
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
}

export type ShortcutAction =
    | 'show-shortcuts'
    | 'open-explorer'
    | 'new-file'
    | 'toggle-focus-mode'
    | 'toggle-vim-mode'
    | 'open-file-search'
    | 'open-preferences'
    | 'create-document'
    | 'create-folder'

export type KeyBindings = Record<ShortcutAction, KeyBinding>

export type EditorAction =
    | 'vim-escape-insert'
    | 'vim-move-line-up'
    | 'vim-move-line-down'
    | 'editor-move-line-up'
    | 'editor-move-line-down'

export type EditorActionMode =
    | 'vim-insert'
    | 'vim-normal'
    | 'vim-visual'
    | 'editor'

export interface EditorBinding {
    keys: string[]
}

export type EditorKeyBindings = Record<EditorAction, EditorBinding>

export interface KeyBindingsFile {
    shortcuts: KeyBindings
    editor: EditorKeyBindings
}
