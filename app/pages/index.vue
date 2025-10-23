<script setup lang="ts">
import { debounceFilter, useLocalStorage } from '@vueuse/core'
import MarkdownEditor from '~/components/markdown-editor.vue'

const DEBOUNCE_DELAY = 300

const text = useLocalStorage('pure-editor:markdown-text', '', {
    eventFilter: debounceFilter(DEBOUNCE_DELAY),
})
</script>

<template>
    <div class="flex min-h-screen items-start justify-center">
        <div class="w-full max-w-[70ch]">
            <MarkdownEditor
                v-model:content="text"
                placeholder="Start typing your markdown..."
            />
        </div>
    </div>
</template>
