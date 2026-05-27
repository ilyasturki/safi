import type {
    KeyBinding,
    KeyBindings,
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
