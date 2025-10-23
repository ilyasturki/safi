import type { EditorView } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'

import type { MarkerConfig } from './marker'

export type FilterMode = 'line' | 'selection' | 'paired'
export type MarkerContext = {
    view: EditorView
    markerFrom: number
    markerTo: number
}

// Extract only configs where filterMode is 'paired'
type PairedMarkerConfig = Extract<MarkerConfig, { filterMode: 'paired' }>

export function getFilter(
    context: MarkerContext,
    markerConfig: MarkerConfig,
): boolean {
    const filterMode = markerConfig.filterMode
    switch (filterMode) {
        case 'line':
            return lineFilter(context)
        case 'selection':
            return selectionFilter(context)
        case 'paired':
            return pairedFilter(context, markerConfig)
    }
}

export function lineFilter(context: MarkerContext): boolean {
    const { view, markerFrom: from, markerTo: to } = context

    const selection = view.state.selection.main

    const selectionStart = view.state.doc.lineAt(selection.from).from
    const selectionEnd = view.state.doc.lineAt(selection.to).to

    const isSelected = selectionEnd >= from && selectionStart <= to
    return !isSelected
}
export function selectionFilter(context: MarkerContext): boolean {
    const { view, markerFrom: from, markerTo: to } = context

    const selection = view.state.selection.main

    // Check if cursor is collapsed (just a cursor position, not a selection)
    const isCursorCollapsed = selection.from === selection.to

    if (isCursorCollapsed) {
        // Show marker when cursor is positioned between the marker bounds
        const cursorWithinMarker =
            selection.from >= from && selection.from <= to
        return !cursorWithinMarker
    }
    // Show marker when selection has any overlap with marker bounds
    const hasOverlap = selection.from < to && selection.to > from
    return !hasOverlap
}

function findPair(
    context: MarkerContext,
    config: PairedMarkerConfig,
): { start: number; end: number } | undefined {
    const { view, markerFrom } = context
    const tree = syntaxTree(view.state)
    const doc = view.state.doc

    let result: { start: number; end: number } | undefined = undefined

    tree.iterate({
        from: markerFrom,
        enter: (node) => {
            if (config.nodeNames.includes(node.name)) {
                const nodeStart = node.from
                const nodeEnd = node.to
                const text = doc.sliceString(nodeStart, nodeEnd)

                const markerLength = config.getMarkerLength(node.name, text)

                // Check if this decoration is part of this pair (opening or closing marker)
                const isOpeningMarker =
                    markerFrom >= nodeStart
                    && markerFrom < nodeStart + markerLength
                const isClosingMarker =
                    markerFrom >= nodeEnd - markerLength && markerFrom < nodeEnd

                if (isOpeningMarker || isClosingMarker) {
                    result = {
                        start: nodeStart,
                        end: nodeEnd,
                    }
                    return false // Stop iteration
                }
            }
        },
    })

    return result
}

function pairedFilter(
    context: MarkerContext,
    markerConfig: PairedMarkerConfig,
): boolean {
    const { view } = context
    const selection = view.state.selection.main

    const pair = findPair(context, markerConfig)
    if (pair === undefined) {
        return true // Hide if we can't find the pair
    }

    const isCursorCollapsed = selection.from === selection.to

    if (isCursorCollapsed) {
        // Show markers when cursor is anywhere within the pair
        const cursorWithinPair =
            selection.from >= pair.start && selection.from <= pair.end
        return !cursorWithinPair
    }

    // Show markers when selection has any overlap with the pair
    const hasOverlap = selection.from < pair.end && selection.to > pair.start
    return !hasOverlap
}
