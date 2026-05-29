<script setup lang="ts">
import { Icon } from '#components'
import { useActiveVault } from '~/composables/use-active-vault'
import { useVaults } from '~/composables/use-vaults'

const isOpen = defineModel<boolean>('open', { default: false })
const dialogEl = useTemplateRef('dialogEl')

const { vaults, load } = useVaults()
const { id: activeId, switchTo } = useActiveVault()

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
</script>

<template>
    <dialog
        ref="dialogEl"
        class="fixed inset-0 m-auto h-fit max-h-[80vh] w-full max-w-md rounded-lg border-0 p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm dark:bg-zinc-900"
        closedby="any"
        @close="handleClose"
    >
        <div class="flex h-full w-full flex-col font-mono">
            <div
                class="border-b border-zinc-200 px-5 py-4 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
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
                    No vaults found. Add a folder under NUXT_VAULTS_PATH.
                </p>
            </div>

            <div
                v-else
                class="flex-1 overflow-y-auto"
            >
                <ul class="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <li
                        v-for="vault in vaults"
                        :key="vault.id"
                    >
                        <button
                            type="button"
                            class="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-zinc-50 focus:inset-ring-2 focus:outline-none active:bg-zinc-100 dark:inset-ring-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
                            @click="handlePick(vault.id)"
                        >
                            <span
                                class="flex items-center gap-3 text-zinc-900 dark:text-zinc-100"
                            >
                                <Icon name="lucide:folder" />
                                {{ vault.name }}
                            </span>
                            <Icon
                                v-if="vault.id === activeId"
                                name="lucide:check"
                                class="text-zinc-500 dark:text-zinc-400"
                            />
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </dialog>
</template>
