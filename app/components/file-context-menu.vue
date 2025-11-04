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
        class="w-fit rounded-md bg-zinc-900 shadow-2xl"
        @close="handleClose"
        @click="handleBackdropClick"
    >
        <div class="flex min-w-[200px] flex-col font-mono text-sm">
            <button
                type="button"
                class="px-5 py-3 text-left transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
                @click="handleRename"
            >
                Rename
            </button>
            <button
                type="button"
                class="px-5 py-3 text-left text-red-600 transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:text-red-400 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
                @click="handleDelete"
            >
                Delete
            </button>
        </div>
    </dialog>
</template>
