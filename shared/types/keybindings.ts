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
    | 'open-file-search'
    | 'open-preferences'
    | 'create-document'
    | 'create-folder'

export type KeyBindings = Record<ShortcutAction, KeyBinding>
