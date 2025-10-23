import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { useExtensions } from '~/lib/editor/extensions'
import type { UseExtensionsOptions } from '~/lib/editor/extensions'
import { createLogger, LogLevels } from '~/utils/create-logger'

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

    let editorView: EditorView | undefined

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

    function createEditor() {
        if (!editorElement.value) {
            logger.warn('Editor element is not available')
            return
        }

        const state = EditorState.create({
            doc: content.value,
            extensions: [
                ...extensions,
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

        logger.trace('CodeMirror editor created successfully')
    }

    function destroyEditor() {
        if (editorView) {
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
        if (!editorView) return

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

    return {
        // State
        isReady: readonly(isReady),
        isFocused: readonly(isFocused),

        // Editor instance (for advanced usage)
        editorView: readonly(ref(editorView)),

        // Methods
        focus,
        blur,
        getSelection,
        setSelection,
        updateContent: updateEditorContent,
    }
}
