<script setup lang="ts">
import { Icon } from '#components'
import HomeButton from '~/components/home-button.vue'
import VaultAddDialog from '~/components/vault-add-dialog.vue'
import {
    useActiveVault,
    useStoredActiveVault,
} from '~/composables/use-active-vault'
import { clearDockView } from '~/composables/use-dock'
import { useVaults } from '~/composables/use-vaults'

const { vaults, load } = useVaults()
const { switchTo } = useActiveVault()
const stored = useStoredActiveVault()

const isAddOpen = ref(false)

clearDockView()

await load()

const hasVaults = computed(() => vaults.value.length > 0)

// Surface the last-used vault only if it still exists in the registry — a
// stored id can point at a vault that was since removed.
const lastUsedId = computed(() =>
    stored.value && vaults.value.some((v) => v.id === stored.value) ?
        stored.value
    :   undefined,
)

// Float the last-used vault to the top as a quick re-entry point, keeping the
// rest in the registry's (name-sorted) order.
const sortedVaults = computed(() =>
    lastUsedId.value ?
        vaults.value.toSorted((a, b) =>
            a.id === lastUsedId.value ? -1
            : b.id === lastUsedId.value ? 1
            : 0,
        )
    :   vaults.value,
)

async function handlePick(vaultId: string) {
    await switchTo(vaultId)
}

async function handleAdded(vaultId: string) {
    await switchTo(vaultId)
}
</script>

<template>
    <div class="flex flex-col items-center px-4 py-12 font-mono">
        <header class="mb-12 text-center">
            <h1
                class="mb-3 flex flex-col items-center gap-4 text-4xl font-medium tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100"
            >
                <img
                    src="/favicon.svg"
                    alt="Safi logo"
                    class="h-14 w-14 rounded-lg bg-zinc-200 p-2 shadow-sm sm:h-16 sm:w-16"
                />
                Safi
            </h1>
            <p class="text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Choose a vault
            </p>
        </header>

        <main class="flex w-full max-w-md flex-col items-center gap-3">
            <template v-if="hasVaults">
                <HomeButton
                    v-for="vault in sortedVaults"
                    :key="vault.id"
                    @click="handlePick(vault.id)"
                >
                    <span class="flex min-w-0 items-center gap-2">
                        <Icon
                            name="lucide:folder"
                            class="shrink-0"
                        />
                        <span class="truncate">{{ vault.name }}</span>
                    </span>
                    <span
                        v-if="vault.id === lastUsedId"
                        class="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                        Last used
                    </span>
                </HomeButton>
            </template>
            <div
                v-else
                class="flex flex-col items-center gap-3 px-4 py-8 text-center"
            >
                <Icon
                    name="lucide:folder-x"
                    class="text-3xl text-zinc-400 dark:text-zinc-600"
                />
                <p class="text-sm text-zinc-600 dark:text-zinc-400">
                    No vaults yet.
                </p>
                <p class="max-w-sm text-xs text-zinc-500 dark:text-zinc-500">
                    Add a folder on the server to use as a vault.
                </p>
            </div>

            <HomeButton @click="isAddOpen = true">
                <span class="flex items-center gap-2">
                    <Icon name="lucide:folder-plus" />
                    Add vault
                </span>
            </HomeButton>
        </main>

        <VaultAddDialog
            v-model:open="isAddOpen"
            @added="handleAdded"
        />
    </div>
</template>
