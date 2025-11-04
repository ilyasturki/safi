<script setup lang="ts">
import InputValidation from '~/components/input-validation.vue'

interface Props {
    currentName: string
    itemType: 'file' | 'folder'
}

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<Props>()

const emit = defineEmits<{
    confirm: [newName: string]
    cancel: []
}>()

const dialogEl = useTemplateRef('dialogEl')
const inputRef = useTemplateRef('inputRef')

const newName = ref('')

watch(open, (isOpen) => {
    if (isOpen) {
        newName.value = props.currentName
        dialogEl.value?.showModal()
        nextTick(() => {
            inputRef.value?.focus()
        })
    } else {
        dialogEl.value?.close()
    }
})

function handleClose() {
    open.value = false
    emit('cancel')
}

function handleConfirm() {
    const trimmedName = newName.value.trim()
    if (!trimmedName) {
        return
    }

    const finalName =
        props.itemType === 'file' ? `${trimmedName}.md` : trimmedName
    emit('confirm', finalName)
    handleClose()
}

function handleCancel() {
    handleClose()
}
</script>

<template>
    <dialog
        ref="dialogEl"
        class="fixed inset-0 m-auto h-fit w-full max-w-md rounded-lg border-0 p-5 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm dark:bg-zinc-900"
        closedby="any"
        @close="handleClose"
    >
        <div class="flex flex-col gap-4 font-mono">
            <h2 class="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Rename {{ itemType }}
            </h2>
            <InputValidation
                ref="inputRef"
                v-model="newName"
                :disable-validation="!newName.trim()"
                @validate="handleConfirm"
                @cancel="handleCancel"
            />
        </div>
    </dialog>
</template>
