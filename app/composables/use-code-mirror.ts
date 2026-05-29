import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { getCM } from '@replit/codemirror-vim'

import type { UseExtensionsOptions } from '~/lib/editor/extensions'
import { useExtensions } from '~/lib/editor/extensions'
import { createLogger, LogLevels } from '~/utils/create-logger'

type VimMode = 'normal' | 'insert' | 'visual' | 'replace'

const logger = createLogger({
    tag: 'use-code-mirror',
    level: LogLevels.warn,
})

export interface UseCodeMirrorOptions extends UseExtensionsOptions {
    /** @default undefined */
    onContentChange?: (content: string) => void
}

export function useCodeMirror(
    content: Ref<string>,
    editorElement: Ref<HTMLElement | null>,
    options: UseCodeMirrorOptions = {},
) {
    const { onContentChange, ...extensionsOptions } = options

    const isReady = ref(false)
    const isFocused = ref(false)
    const vimMode = ref<VimMode>('normal')

    let editorView: EditorView | undefined
    let vimCM: ReturnType<typeof getCM> = null
    const extensionsCompartment = new Compartment()

    function handleVimModeChange(event: { mode?: string }) {
        if (event.mode) vimMode.value = event.mode as VimMode
    }

    function detachVimListener() {
        if (vimCM) {
            vimCM.off('vim-mode-change', handleVimModeChange)
            vimCM = null
        }
    }

    function syncVimListener() {
        if (!editorView) return
        const cm = getCM(editorView)
        if (cm === vimCM) return
        detachVimListener()
        // Vim was removed from the extension stack — reset the mode so a
        // stale 'insert' badge doesn't survive disabling vim.
        if (!cm) {
            vimMode.value = 'normal'
            return
        }
        vimCM = cm
        vimMode.value = 'normal'
        cm.on('vim-mode-change', handleVimModeChange)
    }

    onMounted(() => {
        createEditor()
    })

    onUnmounted(() => {
        destroyEditor()
    })

    watch(content, (newValue) => {
        if (editorView && newValue !== editorView.state.doc.toString()) {
            updateEditorContent(newValue)
        }
    })

    const extensions = useExtensions(extensionsOptions)

    watch(extensions, (newExtensions) => {
        if (editorView) {
            editorView.dispatch({
                effects: extensionsCompartment.reconfigure(newExtensions),
            })
            syncVimListener()
            logger.trace('Extensions reconfigured')
        }
    })

    function createEditor() {
        if (!editorElement.value) {
            logger.warn('Editor element is not available')
            return
        }

        const state = EditorState.create({
            doc: content.value,
            extensions: [
                extensionsCompartment.of(extensions.value),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        handleEditorChange(update.state.doc.toString())
                    }

                    if (update.focusChanged) {
                        isFocused.value = update.view.hasFocus
                    }
                }),
            ],
        })

        editorView = new EditorView({
            state,
            parent: editorElement.value,
        })

        isReady.value = true
        isFocused.value = editorView.hasFocus
        syncVimListener()

        logger.trace('CodeMirror editor created successfully')
    }

    function destroyEditor() {
        if (editorView) {
            detachVimListener()
            editorView.destroy()
            editorView = undefined
            isReady.value = false
            isFocused.value = false
            logger.trace('CodeMirror editor destroyed')
        }
    }

    function handleEditorChange(newContent: string) {
        content.value = newContent
        onContentChange?.(newContent)
        logger.trace('Content updated from editor:', newContent)
    }

    function updateEditorContent(newContent: string) {
        if (!editorView) {
            logger.warn('Editor view is not initialized, cannot update content')
            return
        }

        logger.trace('Updating editor content externally:', newContent)
        const transaction = editorView.state.update({
            changes: {
                from: 0,
                to: editorView.state.doc.length,
                insert: newContent,
            },
        })
        editorView.dispatch(transaction)
    }

    function focus() {
        if (editorView) {
            editorView.focus()
        }
    }

    function blur() {
        if (editorView) {
            editorView.contentDOM.blur()
        }
    }

    function getSelection() {
        if (!editorView) return undefined

        return {
            from: editorView.state.selection.main.from,
            to: editorView.state.selection.main.to,
        }
    }

    function setSelection(from: number, to?: number) {
        if (!editorView) return

        editorView.dispatch({
            selection: { anchor: from, head: to ?? from },
        })
    }

    function focusFromGutterClick(event: MouseEvent) {
        if (!editorView) return

        const { contentDOM } = editorView

        if (
            event.target instanceof Node
            && contentDOM.contains(event.target)
        ) {
            return
        }

        const rect = contentDOM.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return

        const clampedY = Math.max(
            rect.top + 1,
            Math.min(event.clientY, rect.bottom - 1),
        )

        const pos = editorView.posAtCoords(
            { x: rect.right - 1, y: clampedY },
            false,
        )
        if (pos == null) return

        const line = editorView.state.doc.lineAt(pos)
        const lineEndCoords = editorView.coordsAtPos(line.to)
        if (!lineEndCoords) return

        event.preventDefault()
        editorView.focus()

        const synthetic = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window,
            button: event.button,
            buttons: event.buttons,
            clientX: lineEndCoords.right + 2,
            clientY: (lineEndCoords.top + lineEndCoords.bottom) / 2,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            detail: event.detail,
        })
        contentDOM.dispatchEvent(synthetic)
    }

    const editorViewRef = computed(() => editorView)

    return {
        // State
        isReady: readonly(isReady),
        isFocused: readonly(isFocused),
        vimMode: readonly(vimMode),

        // Editor instance (for advanced usage)
        editorView: editorViewRef,

        // Methods
        focus,
        blur,
        getSelection,
        setSelection,
        updateContent: updateEditorContent,
        focusFromGutterClick,
    }
}
