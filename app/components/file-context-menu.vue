<script setup lang="ts">
import type { CSSProperties } from 'vue'

interface Props {
    x: number
    y: number
}

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<Props>()

const emit = defineEmits<{
    rename: []
    delete: []
    close: []
}>()

const dialogEl = useTemplateRef('dialogEl')
const canClose = ref(false)

watch(open, (isOpen) => {
    if (isOpen && dialogEl.value) {
        canClose.value = false
        dialogEl.value.showModal()
        nextTick(() => {
            canClose.value = true
        })
    } else if (dialogEl.value) {
        dialogEl.value.close()
    }
})

function handleClose() {
    open.value = false
    emit('close')
}

function handleBackdropClick(event: MouseEvent) {
    if (canClose.value && event.target === dialogEl.value) {
        handleClose()
    }
}

function handleRename() {
    emit('rename')
    handleClose()
}

function handleDelete() {
    emit('delete')
    handleClose()
}

const menuStyle = computed<CSSProperties>(() => {
    if (!dialogEl.value) return {}

    return {
        position: 'fixed',
        left: `${props.x}px`,
        top: `${props.y}px`,
        margin: '0',
    }
})
</script>

<template>
    <!-- eslint-disable-next-line vue-a11y/click-events-have-key-events, vue-a11y/no-static-element-interactions -->
    <dialog
        ref="dialogEl"
        :style="menuStyle"
        class="w-fit rounded-md border border-zinc-300 shadow-2xl backdrop:bg-transparent dark:bg-zinc-900 dark:text-zinc-200"
        @close="handleClose"
        @click="handleBackdropClick"
    >
        <div class="flex min-w-[200px] flex-col font-mono text-sm">
            <button
                type="button"
                class="px-5 py-2 text-left transition-colors hover:bg-zinc-100 active:bg-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
                @click="handleRename"
            >
                Rename
            </button>
            <button
                type="button"
                class="px-5 py-2 text-left text-red-600 transition-colors hover:bg-zinc-100 active:bg-zinc-200 dark:text-red-400 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
                @click="handleDelete"
            >
                Delete
            </button>
        </div>
    </dialog>
</template>
