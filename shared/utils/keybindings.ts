import type {
    EditorAction,
    EditorActionMode,
    EditorBinding,
    EditorKeyBindings,
    KeyBinding,
    KeyBindings,
    KeyBindingsFile,
    ShortcutAction,
} from '~~/shared/types/keybindings'

export type ShortcutScope = 'global' | 'home' | 'explorer'

export interface ShortcutMeta {
    description: string
    scope?: ShortcutScope
}

export const SHORTCUT_META: Record<ShortcutAction, ShortcutMeta> = {
    'show-shortcuts': {
        description: 'Show keyboard shortcuts',
    },
    'open-explorer': {
        description: 'Open file explorer',
    },
    'open-file-search': {
        description: 'Search Files',
    },
    'new-file': {
        description: 'Create a new file',
        scope: 'home',
    },
    'toggle-focus-mode': {
        description: 'Toggle focus mode',
    },
    'toggle-vim-mode': {
        description: 'Toggle vim mode',
    },
    'open-preferences': {
        description: 'Open preferences',
    },
    'create-document': {
        description: 'Create new document',
        scope: 'explorer',
    },
    'create-folder': {
        description: 'Create new folder',
        scope: 'explorer',
    },
}

export const DEFAULT_KEYBINDINGS: KeyBindings = {
    'show-shortcuts': { key: 'F1' },
    'open-explorer': { key: 'k', ctrl: true },
    'open-file-search': { key: 'e', ctrl: true },
    'new-file': { key: 'm', ctrl: true },
    'toggle-focus-mode': { key: 'd', ctrl: true, shift: true },
    'toggle-vim-mode': { key: 'v', ctrl: true, shift: true },
    'open-preferences': { key: ',', ctrl: true },
    'create-document': { key: 'n' },
    'create-folder': { key: 'n', shift: true },
}

export const SHORTCUT_ACTIONS = Object.keys(SHORTCUT_META) as ShortcutAction[]

export function isShortcutAction(value: unknown): value is ShortcutAction {
    return typeof value === 'string' && value in SHORTCUT_META
}

export function normalizeBinding(input: unknown): KeyBinding | undefined {
    if (typeof input !== 'object' || input === null) return undefined
    const candidate = input as Record<string, unknown>
    if (typeof candidate.key !== 'string' || candidate.key.length === 0) {
        return undefined
    }
    const binding: KeyBinding = { key: candidate.key }
    if (candidate.ctrl === true) binding.ctrl = true
    if (candidate.alt === true) binding.alt = true
    if (candidate.shift === true) binding.shift = true
    return binding
}

export function sanitizeKeyBindings(input: unknown): KeyBindings {
    const base: KeyBindings = { ...DEFAULT_KEYBINDINGS }
    if (typeof input !== 'object' || input === null) return base

    const candidate = input as Record<string, unknown>
    for (const action of SHORTCUT_ACTIONS) {
        const normalized = normalizeBinding(candidate[action])
        if (normalized) {
            base[action] = normalized
        }
    }
    return base
}

export function sanitizePartialKeyBindings(input: unknown): Partial<KeyBindings> {
    const result: Partial<KeyBindings> = {}
    if (typeof input !== 'object' || input === null) return result

    const candidate = input as Record<string, unknown>
    for (const action of SHORTCUT_ACTIONS) {
        if (!(action in candidate)) continue
        const normalized = normalizeBinding(candidate[action])
        if (normalized) {
            result[action] = normalized
        }
    }
    return result
}

export function bindingSignature(binding: KeyBinding): string {
    return [
        binding.ctrl ? 'C' : '',
        binding.alt ? 'A' : '',
        binding.shift ? 'S' : '',
        binding.key.toLowerCase(),
    ].join('+')
}

export interface EditorActionMeta {
    description: string
    mode: EditorActionMode
}

export const EDITOR_ACTION_META: Record<EditorAction, EditorActionMeta> = {
    'vim-escape-insert': {
        description: 'Exit insert mode',
        mode: 'vim-insert',
    },
    'vim-move-line-up': {
        description: 'Move line up',
        mode: 'vim-normal',
    },
    'vim-move-line-down': {
        description: 'Move line down',
        mode: 'vim-normal',
    },
    'editor-move-line-up': {
        description: 'Move line up',
        mode: 'editor',
    },
    'editor-move-line-down': {
        description: 'Move line down',
        mode: 'editor',
    },
}

export const DEFAULT_EDITOR_KEYBINDINGS: EditorKeyBindings = {
    'vim-escape-insert': { keys: [] },
    'vim-move-line-up': { keys: [] },
    'vim-move-line-down': { keys: [] },
    'editor-move-line-up': { keys: [] },
    'editor-move-line-down': { keys: [] },
}

export const EDITOR_ACTIONS = Object.keys(EDITOR_ACTION_META) as EditorAction[]

export const EDITOR_ACTION_MODE_LABELS: Record<EditorActionMode, string> = {
    'vim-insert': 'Vim insert',
    'vim-normal': 'Vim normal',
    'vim-visual': 'Vim visual',
    editor: 'Editor',
}

export function isEditorAction(value: unknown): value is EditorAction {
    return typeof value === 'string' && value in EDITOR_ACTION_META
}

export function normalizeEditorBinding(
    input: unknown,
): EditorBinding | undefined {
    if (typeof input !== 'object' || input === null) return undefined
    const candidate = input as Record<string, unknown>
    const raw = candidate.keys

    // Back-compat: previous shape stored a single string.
    if (typeof raw === 'string') {
        const trimmed = raw.trim()
        return { keys: trimmed.length > 0 ? [trimmed] : [] }
    }

    if (!Array.isArray(raw)) return undefined
    const keys: string[] = []
    const seen = new Set<string>()
    for (const item of raw) {
        if (typeof item !== 'string') continue
        const trimmed = item.trim()
        if (trimmed.length === 0) continue
        if (seen.has(trimmed)) continue
        seen.add(trimmed)
        keys.push(trimmed)
    }
    return { keys }
}

export function sanitizeEditorKeyBindings(input: unknown): EditorKeyBindings {
    const base: EditorKeyBindings = { ...DEFAULT_EDITOR_KEYBINDINGS }
    if (typeof input !== 'object' || input === null) return base
    const candidate = input as Record<string, unknown>
    for (const action of EDITOR_ACTIONS) {
        const normalized = normalizeEditorBinding(candidate[action])
        if (normalized) base[action] = normalized
    }
    return base
}

export function sanitizePartialEditorKeyBindings(
    input: unknown,
): Partial<EditorKeyBindings> {
    const result: Partial<EditorKeyBindings> = {}
    if (typeof input !== 'object' || input === null) return result
    const candidate = input as Record<string, unknown>
    for (const action of EDITOR_ACTIONS) {
        if (!(action in candidate)) continue
        const normalized = normalizeEditorBinding(candidate[action])
        if (normalized) result[action] = normalized
    }
    return result
}

export function sanitizeKeyBindingsFile(input: unknown): KeyBindingsFile {
    const empty: KeyBindingsFile = {
        shortcuts: { ...DEFAULT_KEYBINDINGS },
        editor: { ...DEFAULT_EDITOR_KEYBINDINGS },
    }
    if (typeof input !== 'object' || input === null) return empty

    const candidate = input as Record<string, unknown>
    const hasNestedShape = 'shortcuts' in candidate || 'editor' in candidate

    if (hasNestedShape) {
        return {
            shortcuts: sanitizeKeyBindings(candidate.shortcuts),
            editor: sanitizeEditorKeyBindings(candidate.editor),
        }
    }

    // Legacy flat shape: root keys are ShortcutAction → KeyBinding entries.
    return {
        shortcuts: sanitizeKeyBindings(candidate),
        editor: { ...DEFAULT_EDITOR_KEYBINDINGS },
    }
}

export function sanitizePartialKeyBindingsFile(
    input: unknown,
): Partial<KeyBindingsFile> {
    const result: Partial<KeyBindingsFile> = {}
    if (typeof input !== 'object' || input === null) return result
    const candidate = input as Record<string, unknown>

    if ('shortcuts' in candidate) {
        const partial = sanitizePartialKeyBindings(candidate.shortcuts)
        if (Object.keys(partial).length > 0) {
            result.shortcuts = partial as KeyBindings
        }
    }
    if ('editor' in candidate) {
        const partial = sanitizePartialEditorKeyBindings(candidate.editor)
        if (Object.keys(partial).length > 0) {
            result.editor = partial as EditorKeyBindings
        }
    }

    // Backward-compat: treat top-level ShortcutAction keys as { shortcuts:
    // ... } so existing clients sending { 'show-shortcuts': {...} } keep
    // working. Always merge, so a payload mixing flat shortcuts with a
    // malformed `shortcuts`/`editor` envelope still preserves the flat keys.
    const flat = sanitizePartialKeyBindings(candidate)
    if (Object.keys(flat).length > 0) {
        result.shortcuts = { ...result.shortcuts, ...flat } as KeyBindings
    }

    return result
}
