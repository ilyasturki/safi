<script setup lang="ts">
import FileSearch from './file-search.vue'

const isOpen = defineModel<boolean>('open', { default: false })
const dialogEl = useTemplateRef('dialogEl')

const route = useRoute()

watch(isOpen, (open) => {
    if (open) {
        dialogEl.value?.showModal()
    } else {
        dialogEl.value?.close()
    }
})

watch(
    () => route.path,
    () => {
        if (isOpen.value) {
            handleClose()
        }
    },
)

function handleClose() {
    isOpen.value = false
}
</script>

<template>
    <dialog
        ref="dialogEl"
        class="fixed inset-0 m-auto h-fit max-h-[80vh] w-full max-w-2xl rounded-lg border-0 p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm dark:bg-zinc-900"
        closedby="any"
        @close="handleClose"
    >
        <FileSearch />
    </dialog>
</template>
