import type { MaybeRefOrGetter } from 'vue'

export type ShortcutScope = 'global' | 'home' | 'explorer'

export interface ShortcutOptions {
    description: string
    key: string
    ctrl?: boolean // Automatically uses Cmd on Mac, Ctrl on Windows/Linux
    alt?: boolean
    shift?: boolean
    scope?: ShortcutScope // defaults to 'global'
}

type ShortcutAction =
    | 'show-shortcuts'
    | 'open-explorer'
    | 'new-file'
    | 'toggle-focus-mode'
    | 'open-file-search'
    | 'open-preferences'
    | 'create-document'
    | 'create-folder'

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
        scope: 'home',
    },
    'toggle-focus-mode': {
        description: 'Toggle focus mode',
        key: 'd',
        ctrl: true,
        shift: true,
    },
    'open-preferences': {
        description: 'Open preferences',
        key: ',',
        ctrl: true,
    },
    'create-document': {
        description: 'Create new document',
        key: 'n',
        scope: 'explorer',
    },
    'create-folder': {
        description: 'Create new folder',
        key: 'n',
        shift: true,
        scope: 'explorer',
    },
}

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false
    const tag = target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
    return target.isContentEditable
}

function isTypingKey(key: string): boolean {
    return key.length === 1
}

const activeShortcutCounts = reactive<Record<keyof typeof shortcuts, number>>(
    Object.fromEntries(
        Object.keys(shortcuts).map((action) => [action, 0]),
    ) as Record<keyof typeof shortcuts, number>,
)

export function useActiveShortcuts() {
    return computed(() => {
        const set = new Set<keyof typeof shortcuts>()
        for (const action of Object.keys(activeShortcutCounts) as (keyof typeof shortcuts)[]) {
            if (activeShortcutCounts[action] > 0) set.add(action)
        }
        return set
    })
}

export function useShortcut(
    action: keyof typeof shortcuts,
    callback: () => void,
    isActive?: MaybeRefOrGetter<boolean>,
) {
    const options = shortcuts[action]
    if (!options) throw new Error(`Shortcut not found: ${action}`)

    const isMac = navigator.userAgent.toLowerCase().includes('mac')
    const activeRef = isActive == null ? undefined : toRef(isActive)

    const handler = (event: KeyboardEvent) => {
        if (activeRef && !activeRef.value) return

        const hasModifier =
            options.ctrl === true
            || options.alt === true
            || options.shift === true
        if (
            !hasModifier
            && isTypingKey(options.key)
            && isTypingTarget(event.target)
        ) return

        const matchesKey = event.key.toLowerCase() === options.key.toLowerCase()

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

    let isLive = false
    const setLive = (live: boolean) => {
        if (live === isLive) return
        isLive = live
        activeShortcutCounts[action] += live ? 1 : -1
    }

    let stopActiveWatch: (() => void) | undefined

    onMounted(() => {
        globalThis.addEventListener('keydown', handler)
        if (activeRef) {
            stopActiveWatch = watch(
                activeRef,
                (value) => setLive(value),
                { immediate: true },
            )
        } else {
            setLive(true)
        }
    })

    onUnmounted(() => {
        globalThis.removeEventListener('keydown', handler)
        stopActiveWatch?.()
        setLive(false)
    })
}
