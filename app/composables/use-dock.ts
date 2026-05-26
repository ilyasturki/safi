import { onScopeDispose } from 'vue'

export type DockView = 'home' | 'explorer' | 'editor'

export type DockAction =
    | 'open-explorer'
    | 'new-file'
    | 'new-document'
    | 'new-folder'

type Handler = () => void

export function useDockView() {
    return useState<DockView | null>('dock-view', () => null)
}

function useDockActionsState() {
    return useState<Partial<Record<DockAction, Handler>>>(
        'dock-actions',
        () => ({}),
    )
}

export function setDockView(view: DockView) {
    const state = useDockView()
    state.value = view
}

export function registerDockAction(key: DockAction, handler: Handler) {
    const actions = useDockActionsState()
    actions.value = { ...actions.value, [key]: handler }
    onScopeDispose(() => {
        if (actions.value[key] !== handler) return
        const next = { ...actions.value }
        delete next[key]
        actions.value = next
    })
}

export function triggerDockAction(key: DockAction) {
    const actions = useDockActionsState()
    actions.value[key]?.()
}
