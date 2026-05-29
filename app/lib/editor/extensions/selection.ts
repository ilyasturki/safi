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

        const scrollRect = view.scrollDOM.getBoundingClientRect()
        const baseLeft = scrollRect.left - view.scrollDOM.scrollLeft
        const baseTop = scrollRect.top - view.scrollDOM.scrollTop
        const doc = view.state.doc

        const lineHeight = view.defaultLineHeight
        const markers: RectangleMarker[] = []
        const pushLineMarkers = (from: number, to: number) => {
            if (from >= to) return
            let domRange: Range
            try {
                const startDOM = view.domAtPos(from)
                const endDOM = view.domAtPos(to)
                domRange = document.createRange()
                domRange.setStart(startDOM.node, startDOM.offset)
                domRange.setEnd(endDOM.node, endDOM.offset)
            } catch {
                return
            }
            for (const rect of domRange.getClientRects()) {
                if (rect.width <= 0 || rect.height <= 0) continue
                const centerY = (rect.top + rect.bottom) / 2
                markers.push(
                    new RectangleMarker(
                        'cm-minimal-selection',
                        rect.left - baseLeft,
                        centerY - lineHeight / 2 - baseTop,
                        rect.width,
                        lineHeight,
                    ),
                )
            }
        }

        const pushNewlineMarker = (pos: number) => {
            const coords = view.coordsAtPos(pos)
            if (!coords) return
            const width = view.defaultCharacterWidth || 8
            const centerY = (coords.top + coords.bottom) / 2
            markers.push(
                new RectangleMarker(
                    'cm-minimal-selection',
                    coords.left - baseLeft,
                    centerY - lineHeight / 2 - baseTop,
                    width,
                    lineHeight,
                ),
            )
        }

        for (const range of view.state.selection.ranges) {
            if (range.empty) continue
            const from = Math.max(range.from, view.viewport.from)
            const to = Math.min(range.to, view.viewport.to)
            if (from >= to) continue
            const fromLine = doc.lineAt(from)
            const toLine = doc.lineAt(to)
            for (let n = fromLine.number; n <= toLine.number; n++) {
                const line = doc.line(n)
                const lineFrom = n === fromLine.number ? from : line.from
                const lineTo = n === toLine.number ? to : line.to
                if (lineFrom < lineTo) pushLineMarkers(lineFrom, lineTo)
                // Mark the trailing newline of every non-final selected line
                // so a selection that wraps a line break stays visible.
                if (n < toLine.number) pushNewlineMarker(line.to)
            }
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
