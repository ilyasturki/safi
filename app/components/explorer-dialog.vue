<script setup lang="ts">
import ManagedExplorer from '~/components/managed-explorer.vue'

const isOpen = defineModel<boolean>('open', { default: false })

const props = withDefaults(
    defineProps<{
        initialPath?: string
    }>(),
    {
        initialPath: '',
    },
)

const currentFolderPath = ref(props.initialPath)
const dialogEl = useTemplateRef('dialogEl')

watch(isOpen, (open) => {
    if (open) {
        // await refresh()
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
        class="fixed inset-0 m-auto h-fit max-h-[80vh] w-full max-w-2xl rounded-lg border-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm dark:bg-zinc-900"
        closedby="any"
        @close="handleClose"
    >
        <ManagedExplorer :folder-path="currentFolderPath" />
    </dialog>
</template>
