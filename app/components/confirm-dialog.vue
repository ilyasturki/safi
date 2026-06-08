<script setup lang="ts">
interface Props {
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    destructive?: boolean
}

const open = defineModel<boolean>('open', { default: false })

withDefaults(defineProps<Props>(), {
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    destructive: false,
})

const emit = defineEmits<{
    confirm: []
    cancel: []
}>()

const dialogEl = useTemplateRef('dialogEl')
const confirmRef = useTemplateRef('confirmRef')

// Tracks whether the impending close was triggered by confirming, so the
// native `close` event (Escape, backdrop, programmatic) only reports a cancel
// when the user actually dismissed the dialog.
let confirmed = false

watch(open, (isOpen) => {
    if (isOpen) {
        confirmed = false
        dialogEl.value?.showModal()
        nextTick(() => {
            confirmRef.value?.focus()
        })
    } else {
        dialogEl.value?.close()
    }
})

function handleClose() {
    open.value = false
    if (!confirmed) emit('cancel')
}

function handleConfirm() {
    confirmed = true
    emit('confirm')
    open.value = false
}

function handleCancel() {
    open.value = false
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
                {{ title }}
            </h2>
            <p class="text-sm text-zinc-600 dark:text-zinc-400">
                {{ message }}
            </p>
            <div class="flex items-center justify-end gap-2">
                <button
                    type="button"
                    class="rounded-md px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    @click="handleCancel"
                >
                    {{ cancelLabel }}
                </button>
                <button
                    ref="confirmRef"
                    type="button"
                    class="rounded-md px-3 py-1.5 text-sm text-zinc-50 transition-colors focus:outline-none focus:inset-ring-2 dark:text-zinc-50"
                    :class="
                        destructive ?
                            'bg-red-600 hover:bg-red-700 focus:inset-ring-red-300 dark:bg-red-600 dark:hover:bg-red-700'
                        :   'bg-zinc-900 hover:bg-zinc-700 focus:inset-ring-zinc-300 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'
                    "
                    @click="handleConfirm"
                >
                    {{ confirmLabel }}
                </button>
            </div>
        </div>
    </dialog>
</template>
