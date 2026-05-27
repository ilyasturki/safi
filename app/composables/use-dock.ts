import { onScopeDispose } from 'vue'

export type DockView = 'home' | 'explorer' | 'editor'

export type DockAction =
    | 'open-explorer'
    | 'new-file'
    | 'new-document'
    | 'new-folder'

type Handler = () => void

const dockActions = new Map<DockAction, Handler>()

export function useDockView() {
    return useState<DockView | null>('dock-view', () => null)
}

export function setDockView(view: DockView) {
    const state = useDockView()
    state.value = view
}

export function registerDockAction(key: DockAction, handler: Handler) {
    dockActions.set(key, handler)
    onScopeDispose(() => {
        if (dockActions.get(key) !== handler) return
        dockActions.delete(key)
    })
}

export function triggerDockAction(key: DockAction) {
    dockActions.get(key)?.()
}
