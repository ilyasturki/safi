<script setup lang="ts">
import type { Vault } from '~~/server/utils/vaults'
import { Icon } from '#components'
import ConfirmDialog from '~/components/confirm-dialog.vue'
import VaultAddDialog from '~/components/vault-add-dialog.vue'
import { useActiveVault } from '~/composables/use-active-vault'
import { useVaults } from '~/composables/use-vaults'

const isOpen = defineModel<boolean>('open', { default: false })
const dialogEl = useTemplateRef('dialogEl')

const { vaults, load, remove } = useVaults()
const { id: activeId, switchTo } = useActiveVault()

const isAddOpen = ref(false)
const isRemoveOpen = ref(false)
const pendingRemoval = ref<Vault | null>(null)

watch(isOpen, async (open) => {
    if (open) {
        await load()
        dialogEl.value?.showModal()
    } else {
        dialogEl.value?.close()
    }
})

function handleClose() {
    isOpen.value = false
}

async function handlePick(vaultId: string) {
    handleClose()
    if (vaultId === activeId.value) return
    await switchTo(vaultId)
}

function handleRemove(vault: Vault) {
    pendingRemoval.value = vault
    isRemoveOpen.value = true
}

async function confirmRemove() {
    const vault = pendingRemoval.value
    pendingRemoval.value = null
    if (!vault) return

    await remove(vault.id)
    // Removing the active vault leaves the current route pointing at a vault
    // that no longer exists — send the user back to the vault chooser.
    if (vault.id === activeId.value) {
        handleClose()
        await navigateTo('/')
    }
}

async function handleAdded(vaultId: string) {
    handleClose()
    await switchTo(vaultId)
}
</script>

<template>
    <dialog
        ref="dialogEl"
        class="fixed inset-0 m-auto h-fit max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-lg border-0 p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex dark:bg-zinc-900"
        closedby="any"
        @close="handleClose"
    >
        <div class="flex min-h-0 w-full flex-1 flex-col font-mono">
            <div
                class="shrink-0 border-b border-zinc-200 px-5 py-4 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
            >
                Switch vault
            </div>

            <div
                v-if="vaults.length === 0"
                class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
            >
                <Icon
                    name="lucide:folder-x"
                    class="text-2xl text-zinc-400 dark:text-zinc-600"
                />
                <p class="text-sm text-zinc-600 dark:text-zinc-400">
                    No vaults yet. Add a folder on the server to get started.
                </p>
            </div>

            <div
                v-else
                class="min-h-0 flex-1 overflow-y-auto"
            >
                <ul class="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <li
                        v-for="vault in vaults"
                        :key="vault.id"
                        class="flex items-center"
                    >
                        <button
                            type="button"
                            class="flex min-w-0 flex-1 items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-zinc-50 focus:inset-ring-2 focus:outline-none active:bg-zinc-100 dark:inset-ring-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
                            @click="handlePick(vault.id)"
                        >
                            <span
                                class="flex min-w-0 items-center gap-3 text-zinc-900 dark:text-zinc-100"
                            >
                                <Icon
                                    name="lucide:folder"
                                    class="shrink-0"
                                />
                                <span class="truncate">{{ vault.name }}</span>
                            </span>
                            <Icon
                                v-if="vault.id === activeId"
                                name="lucide:check"
                                class="shrink-0 text-zinc-500 dark:text-zinc-400"
                            />
                        </button>
                        <button
                            type="button"
                            class="mr-2 flex shrink-0 items-center justify-center rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                            title="Remove from list"
                            @click="handleRemove(vault)"
                        >
                            <Icon name="lucide:x" />
                        </button>
                    </li>
                </ul>
            </div>

            <div
                class="shrink-0 border-t border-zinc-200 px-5 py-3 dark:border-zinc-800"
            >
                <button
                    type="button"
                    class="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    @click="isAddOpen = true"
                >
                    <Icon name="lucide:folder-plus" />
                    Add vault
                </button>
            </div>
        </div>
    </dialog>

    <VaultAddDialog
        v-model:open="isAddOpen"
        @added="handleAdded"
    />

    <ConfirmDialog
        v-model:open="isRemoveOpen"
        title="Remove vault"
        :message="`Remove “${pendingRemoval?.name}” from your vault list? This only forgets the vault here — the folder and its files stay on disk.`"
        confirm-label="Remove"
        destructive
        @confirm="confirmRemove"
    />
</template>
