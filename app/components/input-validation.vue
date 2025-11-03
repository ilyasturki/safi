<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

const model = defineModel<string>({ required: true })

const props = defineProps<{
    disableValidation?: boolean
}>()

const emit = defineEmits<{
    validate: []
    cancel: []
}>()

const containerRef = useTemplateRef('containerRef')
const inputRef = useTemplateRef('inputRef')

onClickOutside(containerRef, () => {
    emit('cancel')
})

defineExpose({
    focus: () => inputRef.value?.focus(),
})
</script>

<template>
    <div
        ref="containerRef"
        class="flex w-full gap-2"
    >
        <label
            for="new-file-name"
            class="sr-only"
        >
            New file name
        </label>
        <input
            id="new-file-name"
            ref="inputRef"
            v-model="model"
            type="text"
            placeholder="Enter filename"
            class="h-10 w-full rounded-sm border border-zinc-200 bg-white px-4 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
            @keyup.enter="emit('validate')"
            @keyup.escape="emit('cancel')"
        />
        <button
            type="button"
            class="flex size-10 items-center justify-center rounded-sm border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:active:bg-zinc-600"
            :disabled="props.disableValidation"
            @click="emit('validate')"
        >
            ✓
        </button>
    </div>
</template>
