<script setup lang="ts">
import ManagedExplorer from '~/components/managed-explorer.vue'

const isOpen = defineModel<boolean>('open', { default: false })

const dialogEl = useTemplateRef('dialogEl')

watch(isOpen, (open) => {
    if (open) {
        dialogEl.value?.showModal()
    } else {
        dialogEl.value?.close()
    }
})

function handleClose() {
    isOpen.value = false
}
</script>

<template>
    <dialog
        ref="dialogEl"
        class="fixed inset-0 m-auto h-fit max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex dark:bg-zinc-900"
        closedby="any"
        @close="handleClose"
    >
        <ManagedExplorer :is-active="isOpen" />
    </dialog>
</template>
