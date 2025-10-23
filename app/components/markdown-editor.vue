<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { useCodeMirror } from '~/composables/use-code-mirror'

interface EditorProps {
    placeholder?: string
    class?: HTMLAttributes['class']
}

const content = defineModel<string>('content', { required: true })
const props = withDefaults(defineProps<EditorProps>(), {
    placeholder: 'Start typing your note here...',
})

const editorEl = useTemplateRef('editorEl')

const {
    isReady,
    isFocused,
    focus,
    blur,
    getSelection,
    setSelection,
    updateContent,
} = useCodeMirror(content, editorEl, {
    placeholder: props.placeholder,
})

defineExpose({
    isReady,
    isFocused,
    focus,
    blur,
    getSelection,
    setSelection,
    updateContent,
})
</script>

<template>
    <div
        ref="editorEl"
        :class="props.class"
    />
</template>

<style>
@reference '~/assets/css/main.css';

.cm-editor {
    height: 100%;
    overflow: hidden;

    &.cm-focused {
        @apply outline-none;
    }
    .cm-content {
        @apply mx-auto min-h-full max-w-full p-5 text-lg md:max-w-2xl;
    }
}
</style>
