import { EditorView, layer, RectangleMarker } from '@codemirror/view'

const selectionLayer = layer({
    above: false,
    class: 'cm-minimal-selectionLayer',
    update(update) {
        return (
            update.selectionSet
            || update.docChanged
            || update.viewportChanged
            || update.geometryChanged
            || update.focusChanged
        )
    },
    markers(view) {
        if (!view.hasFocus) return []

        const markers: RectangleMarker[] = []
        for (const range of view.state.selection.ranges) {
            if (range.empty) continue
            markers.push(
                ...RectangleMarker.forRange(view, 'cm-minimal-selection', range),
            )
        }
        return markers
    },
})

const baseSelectionTheme = EditorView.baseTheme({
    '.cm-minimal-selectionLayer': {
        zIndex: '-1',
    },
    '.cm-minimal-selection': {
        position: 'absolute',
        backgroundColor: 'var(--safi-primary-selection)',
    },
    '.cm-content ::selection': {
        backgroundColor: 'transparent !important',
    },
    '.cm-selectionMatch': {
        backgroundColor: 'var(--safi-primary-match) !important',
    },
})

export const selectionExtension = [selectionLayer, baseSelectionTheme]
