<script setup lang="ts">
import { debounceFilter, useLocalStorage } from '@vueuse/core'
import Editor from '~/components/editor.vue'

const DEBOUNCE_DELAY = 300

const text = useLocalStorage('pure-editor:text', '', {
    eventFilter: debounceFilter(DEBOUNCE_DELAY),
})
</script>

<template>
    <div
        class="min-h-screen bg-[#fafafa] transition-colors duration-200 dark:bg-[#0a0a0a]"
    >
        <div class="flex min-h-screen items-center justify-center px-6 py-12">
            <div class="w-full max-w-[70ch]">
                <Editor
                    v-model="text"
                    placeholder="Start typing..."
                />
            </div>
        </div>
    </div>
</template>
