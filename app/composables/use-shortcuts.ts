export interface ShortcutOptions {
    action: string
    description: string
    key: string
    ctrl?: boolean // Automatically uses Cmd on Mac, Ctrl on Windows/Linux
    alt?: boolean
    shift?: boolean
}

export const shortcuts: ShortcutOptions[] = [
    {
        action: 'show-shortcuts',
        description: 'Show keyboard shortcuts',
        key: 'F1',
    },
    {
        action: 'open-explorer',
        description: 'Open file explorer',
        key: 'k',
        ctrl: true,
    },
]
export function useShortcut(
    action: ShortcutOptions['action'],
    callback: () => void,
) {
    const options = shortcuts.find((s) => s.action === action)
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
