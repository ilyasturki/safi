import { onScopeDispose } from 'vue'

export type DockView = 'home' | 'explorer' | 'editor'

export type DockAction =
    | 'open-explorer'
    | 'new-file'
    | 'new-document'
    | 'new-folder'

type Handler = () => void

const dockActions = new Map<DockAction, Handler[]>()

export function useDockView() {
    return useState<DockView | null>('dock-view', () => null)
}

export function setDockView(view: DockView) {
    const state = useDockView()
    state.value = view
}

export function registerDockAction(key: DockAction, handler: Handler) {
    const stack = dockActions.get(key) ?? []
    stack.push(handler)
    dockActions.set(key, stack)
    onScopeDispose(() => {
        const current = dockActions.get(key)
        if (!current) return
        const idx = current.lastIndexOf(handler)
        if (idx === -1) return
        current.splice(idx, 1)
        if (current.length === 0) dockActions.delete(key)
    })
}

export function triggerDockAction(key: DockAction) {
    const stack = dockActions.get(key)
    if (!stack || stack.length === 0) return
    stack[stack.length - 1]?.()
}
