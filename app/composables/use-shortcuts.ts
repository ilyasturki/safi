export interface ShortcutOptions {
    description: string
    key: string
    ctrl?: boolean // Automatically uses Cmd on Mac, Ctrl on Windows/Linux
    alt?: boolean
    shift?: boolean
}

type ShortcutAction =
    | 'show-shortcuts'
    | 'open-explorer'
    | 'new-file'
    | 'toggle-focus-mode'
    | 'open-file-search'
export const shortcuts: Record<ShortcutAction, ShortcutOptions> = {
    'show-shortcuts': {
        description: 'Show keyboard shortcuts',
        key: 'F1',
    },
    'open-explorer': {
        description: 'Open file explorer',
        key: 'k',
        ctrl: true,
    },
    'open-file-search': {
        description: 'Search Files',
        key: 'e',
        ctrl: true,
    },
    'new-file': {
        description: 'Create a new file',
        key: 'm',
        ctrl: true,
    },
    'toggle-focus-mode': {
        description: 'Toggle focus mode',
        key: 'd',
        ctrl: true,
        shift: true,
    },
}

export function useShortcut(
    action: keyof typeof shortcuts,
    callback: () => void,
) {
    const options = shortcuts[action]
    if (!options) throw new Error(`Shortcut not found: ${action}`)

    const isMac = navigator.userAgent.toLowerCase().includes('mac')

    const handler = (event: KeyboardEvent) => {
        const matchesKey = event.key.toLowerCase() === options.key.toLowerCase()

        // On Mac, ctrl option translates to meta key (Cmd)
        const shouldCheckCtrl = options.ctrl && !isMac
        const shouldCheckMeta = options.ctrl && isMac

        const matchesCtrl = shouldCheckCtrl ? event.ctrlKey : !event.ctrlKey
        const matchesMeta = shouldCheckMeta ? event.metaKey : !event.metaKey
        const matchesAlt = options.alt ? event.altKey : !event.altKey
        const matchesShift = options.shift ? event.shiftKey : !event.shiftKey

        if (
            matchesKey
            && matchesCtrl
            && matchesAlt
            && matchesShift
            && matchesMeta
        ) {
            event.preventDefault()
            callback()
        }
    }

    onMounted(() => {
        globalThis.addEventListener('keydown', handler)
    })

    onUnmounted(() => {
        globalThis.removeEventListener('keydown', handler)
    })
}
