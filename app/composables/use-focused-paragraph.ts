import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useFocusedParagraph(editorRef: Ref<HTMLElement | undefined>) {
  const focusedParagraphIndex = ref(0)

  const updateFocusedParagraph = () => {
    if (!editorRef.value) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    let node = range.startContainer

    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode as Node
    }

    const paragraphs = editorRef.value.querySelectorAll('[data-paragraph-index]')
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i]
      if (paragraph && paragraph.contains(node)) {
        focusedParagraphIndex.value = i
        return
      }
    }

    focusedParagraphIndex.value = 0
  }

  onMounted(() => {
    document.addEventListener('selectionchange', updateFocusedParagraph)
  })

  onUnmounted(() => {
    document.removeEventListener('selectionchange', updateFocusedParagraph)
  })

  return {
    focusedParagraphIndex,
    updateFocusedParagraph,
  }
}
