<script setup lang="ts">
import { Icon } from '#components'
import { useFsBrowser } from '~/composables/use-fs-browser'
import { useVaults } from '~/composables/use-vaults'

const isOpen = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ added: [vaultId: string] }>()

const dialogEl = useTemplateRef('dialogEl')
const { listing, isLoading, error, navigate } = useFsBrowser()
const { register } = useVaults()

const isAdding = ref(false)
const addError = ref<string | null>(null)

watch(isOpen, async (open) => {
    if (open) {
        addError.value = null
        await navigate()
        dialogEl.value?.showModal()
    } else {
        dialogEl.value?.close()
    }
})

function handleClose() {
    isOpen.value = false
}

async function handleAdd() {
    const current = listing.value?.path
    if (!current || isAdding.value) return

    isAdding.value = true
    addError.value = null
    try {
        const vault = await register(current)
        handleClose()
        emit('added', vault.id)
    } catch (err) {
        addError.value =
            (err as { statusMessage?: string })?.statusMessage
            ?? 'Failed to add vault'
    } finally {
        isAdding.value = false
    }
}
</script>

<template>
    <dialog
        ref="dialogEl"
        class="fixed inset-0 m-auto h-fit max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border-0 p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex dark:bg-zinc-900"
        closedby="any"
        @close="handleClose"
    >
        <div class="flex min-h-0 w-full flex-1 flex-col font-mono">
            <div
                class="shrink-0 border-b border-zinc-200 px-5 py-4 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
            >
                Add vault
            </div>

            <div
                class="flex shrink-0 items-center gap-2 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800"
            >
                <button
                    type="button"
                    class="flex shrink-0 items-center justify-center rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    :disabled="!listing?.parent || isLoading"
                    title="Go up"
                    @click="listing?.parent && navigate(listing.parent)"
                >
                    <Icon name="lucide:arrow-up" />
                </button>
                <span
                    class="min-w-0 flex-1 truncate text-xs text-zinc-500 dark:text-zinc-400"
                    :title="listing?.path"
                >
                    {{ listing?.path ?? '…' }}
                </span>
            </div>

            <div class="min-h-40 flex-1 overflow-y-auto">
                <p
                    v-if="error"
                    class="p-5 text-sm text-red-600 dark:text-red-400"
                >
                    {{ error }}
                </p>
                <p
                    v-else-if="isLoading"
                    class="p-5 text-sm text-zinc-500 dark:text-zinc-400"
                >
                    Loading…
                </p>
                <p
                    v-else-if="listing && listing.entries.length === 0"
                    class="p-5 text-sm text-zinc-500 dark:text-zinc-400"
                >
                    No subfolders here. You can still add this folder as a
                    vault.
                </p>
                <ul
                    v-else
                    class="divide-y divide-zinc-200 dark:divide-zinc-800"
                >
                    <li
                        v-for="entry in listing?.entries ?? []"
                        :key="entry.path"
                    >
                        <button
                            type="button"
                            class="flex w-full items-center gap-3 px-5 py-2.5 text-left text-zinc-900 transition-colors hover:bg-zinc-50 focus:inset-ring-2 focus:outline-none active:bg-zinc-100 dark:inset-ring-zinc-200 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
                            @click="navigate(entry.path)"
                        >
                            <Icon
                                name="lucide:folder"
                                class="shrink-0 text-zinc-400 dark:text-zinc-500"
                            />
                            <span class="truncate">{{ entry.name }}</span>
                        </button>
                    </li>
                </ul>
            </div>

            <div
                class="flex shrink-0 flex-col gap-2 border-t border-zinc-200 px-5 py-3 dark:border-zinc-800"
            >
                <p
                    v-if="addError"
                    class="text-xs text-red-600 dark:text-red-400"
                >
                    {{ addError }}
                </p>
                <div class="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        class="rounded-md px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        @click="handleClose"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        class="flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-zinc-50 transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                        :disabled="!listing?.path || isAdding || isLoading"
                        @click="handleAdd"
                    >
                        <Icon name="lucide:folder-plus" />
                        Add this folder
                    </button>
                </div>
            </div>
        </div>
    </dialog>
</template>
