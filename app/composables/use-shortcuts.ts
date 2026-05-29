import type { MaybeRefOrGetter, Ref } from 'vue'

import type {
    EditorAction,
    EditorBinding,
    EditorKeyBindings,
    KeyBinding,
    KeyBindings,
    KeyBindingsFile,
    ShortcutAction,
} from '~~/shared/types/keybindings'
import {
    DEFAULT_EDITOR_KEYBINDINGS,
    DEFAULT_KEYBINDINGS,
    EDITOR_ACTIONS,
    EDITOR_ACTION_META,
    SHORTCUT_ACTIONS,
    SHORTCUT_META,
} from '~~/shared/utils/keybindings'

export type {
    EditorAction,
    EditorBinding,
    EditorKeyBindings,
    KeyBinding,
    KeyBindings,
    ShortcutAction,
}
export type { ShortcutMeta, ShortcutScope } from '~~/shared/utils/keybindings'
export {
    DEFAULT_EDITOR_KEYBINDINGS,
    DEFAULT_KEYBINDINGS,
    EDITOR_ACTION_META,
    SHORTCUT_META,
} from '~~/shared/utils/keybindings'

function useKeyBindingsState(): Ref<KeyBindings> {
    return useState<KeyBindings>('keybindings', () => ({
        ...DEFAULT_KEYBINDINGS,
    }))
}

function useEditorKeyBindingsState(): Ref<EditorKeyBindings> {
    return useState<EditorKeyBindings>('editor-keybindings', () => ({
        ...DEFAULT_EDITOR_KEYBINDINGS,
    }))
}

const isCapturingRef = ref(false)

const isMacPlatform =
    typeof navigator !== 'undefined'
    && navigator.userAgent.toLowerCase().includes('mac')

export function isMac(): boolean {
    return isMacPlatform
}

export function setShortcutsPaused(value: boolean) {
    isCapturingRef.value = value
}

export function useKeyBindings(): Ref<KeyBindings> {
    return useKeyBindingsState()
}

export function useEditorKeyBindings(): Ref<EditorKeyBindings> {
    return useEditorKeyBindingsState()
}

export function useBinding(action: ShortcutAction) {
    const bindings = useKeyBindingsState()
    return computed<KeyBinding>(() => bindings.value[action])
}

const activeShortcutCounts = reactive<Record<ShortcutAction, number>>(
    Object.fromEntries(SHORTCUT_ACTIONS.map((a) => [a, 0])) as Record<
        ShortcutAction,
        number
    >,
)

export function useActiveShortcuts() {
    return computed(() => {
        const set = new Set<ShortcutAction>()
        for (const action of SHORTCUT_ACTIONS) {
            if (activeShortcutCounts[action] > 0) set.add(action)
        }
        return set
    })
}

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false
    const tag = target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
    return target.isContentEditable
}

export function useShortcut(
    action: ShortcutAction,
    callback: () => void,
    isActive?: MaybeRefOrGetter<boolean>,
) {
    if (!(action in SHORTCUT_META)) {
        throw new Error(`Shortcut not found: ${action}`)
    }

    const bindings = useKeyBindingsState()
    const activeRef = isActive == null ? undefined : toRef(isActive)

    const handler = (event: KeyboardEvent) => {
        if (activeRef && !activeRef.value) return
        if (isCapturingRef.value) return

        const options = bindings.value[action]
        if (!options) return

        const hasModifier =
            options.ctrl === true
            || options.alt === true
            || options.shift === true
        if (!hasModifier && isTypingTarget(event.target)) return

        const matchesKey =
            event.key.toLowerCase() === options.key.toLowerCase()

        const shouldCheckCtrl = options.ctrl && !isMacPlatform
        const shouldCheckMeta = options.ctrl && isMacPlatform

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

let loadPromise: Promise<void> | undefined
let saveChain: Promise<unknown> = Promise.resolve()

export function loadKeyBindings(): Promise<void> {
    if (loadPromise) return loadPromise
    const shortcutsState = useKeyBindingsState()
    const editorState = useEditorKeyBindingsState()
    const attempt = (async () => {
        const data = await $fetch<KeyBindingsFile>('/api/keybindings')
        shortcutsState.value = data.shortcuts
        editorState.value = data.editor
    })()
    loadPromise = attempt.catch((error) => {
        loadPromise = undefined
        throw error
    })
    return loadPromise
}

async function putKeyBindings(
    body: Partial<KeyBindingsFile>,
): Promise<KeyBindingsFile> {
    const shortcutsState = useKeyBindingsState()
    const editorState = useEditorKeyBindingsState()
    const saved = await $fetch<KeyBindingsFile>('/api/keybindings', {
        method: 'PUT',
        body,
    })
    shortcutsState.value = saved.shortcuts
    editorState.value = saved.editor
    return saved
}

function enqueueSave(
    task: () => Promise<KeyBindingsFile>,
): Promise<KeyBindingsFile> {
    const next = saveChain.then(task, task)
    saveChain = next.catch(() => undefined)
    return next
}

export async function updateKeyBinding(
    action: ShortcutAction,
    binding: KeyBinding,
): Promise<KeyBindingsFile> {
    await loadKeyBindings()
    return enqueueSave(() =>
        putKeyBindings({ shortcuts: { [action]: binding } as KeyBindings }),
    )
}

export async function resetKeyBindings(): Promise<KeyBindingsFile> {
    await loadKeyBindings()
    return enqueueSave(() =>
        putKeyBindings({ shortcuts: { ...DEFAULT_KEYBINDINGS } }),
    )
}

export async function resetKeyBinding(
    action: ShortcutAction,
): Promise<KeyBindingsFile> {
    return await updateKeyBinding(action, DEFAULT_KEYBINDINGS[action])
}

export async function updateEditorKeyBinding(
    action: EditorAction,
    binding: EditorBinding,
): Promise<KeyBindingsFile> {
    if (!(action in EDITOR_ACTION_META)) {
        throw new Error(`Editor action not found: ${action}`)
    }
    await loadKeyBindings()
    return enqueueSave(() =>
        putKeyBindings({ editor: { [action]: binding } as EditorKeyBindings }),
    )
}

export async function resetEditorKeyBindings(): Promise<KeyBindingsFile> {
    await loadKeyBindings()
    return enqueueSave(() =>
        putKeyBindings({ editor: { ...DEFAULT_EDITOR_KEYBINDINGS } }),
    )
}

export { EDITOR_ACTIONS }
