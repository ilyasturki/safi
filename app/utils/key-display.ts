import type { KeyBinding } from '~~/shared/types/keybindings'

function formatKey(key: string): string {
    if (key.length === 1) return key.toUpperCase()
    return key
}

export function getKeyDisplay(binding: KeyBinding): string[] {
    const keys: string[] = []
    const isMac =
        typeof navigator !== 'undefined'
        && navigator.userAgent.toLowerCase().includes('mac')

    if (binding.ctrl) {
        keys.push(isMac ? '⌘' : 'Ctrl')
    }
    if (binding.alt) {
        keys.push(isMac ? '⌥' : 'Alt')
    }
    if (binding.shift) {
        keys.push(isMac ? '⇧' : 'Shift')
    }
    keys.push(formatKey(binding.key))

    return keys
}
