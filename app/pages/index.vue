<script setup lang="ts">
import { Icon } from '#components'

import HomeButton from '~/components/home-button.vue'
import { useActiveVault, useStoredActiveVault } from '~/composables/use-active-vault'
import { clearDockView } from '~/composables/use-dock'
import { useVaults } from '~/composables/use-vaults'

const { vaults, isLoaded, load } = useVaults()
const { switchTo } = useActiveVault()
const stored = useStoredActiveVault()

clearDockView()

await load()

const hasVaults = computed(() => vaults.value.length > 0)

onMounted(async () => {
    if (!isLoaded.value) await load()
    if (vaults.value.length === 0) return

    const lastUsed = stored.value
    if (lastUsed && vaults.value.some((v) => v.id === lastUsed)) {
        await switchTo(lastUsed)
    }
})

async function handlePick(vaultId: string) {
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

        <main class="flex w-full max-w-md flex-col items-center">
            <template v-if="hasVaults">
                <HomeButton
                    v-for="vault in vaults"
                    :key="vault.id"
                    @click="handlePick(vault.id)"
                >
                    <span class="flex items-center gap-2">
                        <Icon name="lucide:folder" />
                        {{ vault.name }}
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
                    No vaults found.
                </p>
                <p
                    class="max-w-sm text-xs text-zinc-500 dark:text-zinc-500"
                >
                    Create a folder inside the directory pointed to by
                    <code class="font-mono">NUXT_VAULTS_PATH</code>
                    and reload.
                </p>
            </div>
        </main>
    </div>
</template>
