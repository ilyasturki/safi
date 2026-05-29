<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { useCodeMirror } from '~/composables/use-code-mirror'

interface EditorProps {
    placeholder?: string
    enableFocusMode?: boolean
    enableVimMode?: boolean
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
    focusFromGutterClick,
} = useCodeMirror(content, editorEl, {
    placeholder: props.placeholder,
    enableFocusMode: toRef(() => props.enableFocusMode),
    enableVimMode: toRef(() => props.enableVimMode),
})

defineExpose({
    isReady,
    isFocused,
    focus,
    blur,
    getSelection,
    setSelection,
    updateContent,
    focusFromGutterClick,
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
        @apply mx-auto min-h-full max-w-full py-5 pr-5 pl-[calc(1.25rem+7ch)] text-lg md:max-w-2xl;
    }

    .cm-panels.cm-panels-bottom {
        @apply border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950;
    }

    .cm-vim-panel {
        @apply px-3 py-1 font-mono text-xs text-zinc-700 dark:text-zinc-300;
    }

    .cm-vim-panel input {
        @apply w-full bg-transparent font-mono text-xs text-zinc-900 outline-none dark:text-zinc-100;
    }

    .cm-fat-cursor {
        background:
            color-mix(in srgb, var(--safi-primary) 35%, transparent) !important;
        outline: none !important;
    }

    &:not(.cm-focused) .cm-fat-cursor {
        background: transparent !important;
        outline: 1px solid
            color-mix(in srgb, var(--safi-primary) 55%, transparent) !important;
    }
}
</style>
