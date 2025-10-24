import type { ViewUpdate } from '@codemirror/view'
import { EditorView, ViewPlugin } from '@codemirror/view'

interface SelectionRect {
    top: number
    height: number
    left: number
    width: string
}

const minimalSelectionPlugin = ViewPlugin.fromClass(
    class {
        selectionLayer: HTMLElement
        measureReq: {
            read: () => SelectionRect[]
            write: (rects: SelectionRect[]) => void
        }

        constructor(view: EditorView) {
            this.selectionLayer = document.createElement('div')
            this.selectionLayer.className = 'cm-minimal-selectionLayer'
            view.scrollDOM.append(this.selectionLayer)

            this.measureReq = {
                read: () => this.measureSelections(view),
                write: (rects) => this.applySelections(rects),
            }

            view.requestMeasure(this.measureReq)
        }

        update(update: ViewUpdate) {
            if (
                update.selectionSet
                || update.docChanged
                || update.viewportChanged
                || update.geometryChanged
            ) {
                this.measureReq = {
                    read: () => this.measureSelections(update.view),
                    write: (rects) => this.applySelections(rects),
                }
                update.view.requestMeasure(this.measureReq)
            }
        }

        destroy() {
            this.selectionLayer.remove()
        }

        measureSelections(view: EditorView): SelectionRect[] {
            if (!view.hasFocus) return []

            const rects: SelectionRect[] = []
            const { state, scrollDOM } = view

            const containerRect = scrollDOM.getBoundingClientRect()

            for (const range of state.selection.ranges) {
                if (range.empty) continue

                const { from, to } = range

                let pos = from
                while (pos <= to) {
                    const block = view.lineBlockAt(pos)

                    const selStart = Math.max(from, block.from)
                    const selEnd = Math.min(to, block.to)

                    const blockContent = state.doc.sliceString(
                        block.from,
                        block.to,
                    )
                    const isEmptyBlock = blockContent.length === 0

                    if (isEmptyBlock) {
                        const coords = view.coordsAtPos(selStart)
                        if (coords) {
                            rects.push({
                                top: coords.top - containerRect.top,
                                height: coords.bottom - coords.top,
                                left: coords.left - containerRect.left,
                                width: '1ch',
                            })
                        }
                    } else {
                        const segments: { start: number; end: number }[] = []
                        let segmentStart = selStart
                        let lastCoords = view.coordsAtPos(selStart)

                        if (lastCoords) {
                            for (
                                let checkPos = selStart + 1;
                                checkPos <= selEnd;
                                checkPos++
                            ) {
                                const coords = view.coordsAtPos(checkPos)
                                if (!coords) continue

                                if (Math.abs(coords.top - lastCoords.top) > 2) {
                                    segments.push({
                                        start: segmentStart,
                                        end: checkPos - 1,
                                    })
                                    segmentStart = checkPos
                                    lastCoords = coords
                                }
                            }

                            segments.push({ start: segmentStart, end: selEnd })

                            for (const segment of segments) {
                                const startCoords = view.coordsAtPos(
                                    segment.start,
                                )
                                const endCoords = view.coordsAtPos(segment.end)

                                if (startCoords && endCoords) {
                                    rects.push({
                                        top:
                                            startCoords.top - containerRect.top,
                                        height:
                                            startCoords.bottom
                                            - startCoords.top,
                                        left:
                                            startCoords.left
                                            - containerRect.left,
                                        width: `${endCoords.right - startCoords.left}px`,
                                    })
                                }
                            }
                        }
                    }

                    pos = block.to + 1
                }
            }

            return rects
        }

        applySelections(rects: SelectionRect[]) {
            this.selectionLayer.innerHTML = ''

            for (const rectData of rects) {
                const rect = document.createElement('div')
                rect.className = 'cm-minimal-selection'
                rect.style.top = `${rectData.top}px`
                rect.style.height = `${rectData.height}px`
                rect.style.left = `${rectData.left}px`
                rect.style.width = rectData.width
                this.selectionLayer.append(rect)
            }
        }
    },
)

const minimalSelectionTheme = EditorView.baseTheme({
    '.cm-minimal-selectionLayer': {
        position: 'absolute',
        top: '0',
        left: '0',
        pointerEvents: 'none',
        zIndex: '-1',
    },
    '.cm-minimal-selection': {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
    '.cm-content ::selection': {
        backgroundColor: 'transparent !important',
    },
})

export const minimalSelection = [minimalSelectionPlugin, minimalSelectionTheme]
