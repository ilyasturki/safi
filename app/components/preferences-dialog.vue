<script setup lang="ts">
import { usePreferredDark } from '@vueuse/core'

import { PRIMARY_COLORS } from '~~/shared/utils/primary-colors'
import { usePreferences } from '~/composables/use-preferences'

const isOpen = defineModel<boolean>('open', { default: false })

const dialogEl = useTemplateRef('dialogEl')
const isDark = usePreferredDark()

const { preferences, setPrimaryColor, load } = usePreferences()

watch(isOpen, (open) => {
    if (open) {
        void load()
        dialogEl.value?.showModal()
    } else {
        dialogEl.value?.close()
    }
})

function handleClose() {
    isOpen.value = false
}

function swatchColor(id: string) {
    const color = PRIMARY_COLORS.find((c) => c.id === id)
    if (!color) return ''
    return isDark.value ? color.dark : color.light
}
</script>

<template>
    <dialog
        ref="dialogEl"
        class="fixed inset-0 m-auto h-fit w-full max-w-md rounded-lg border-0 p-0 shadow-2xl outline-none backdrop:bg-black/50 backdrop:backdrop-blur-sm dark:bg-zinc-900"
        closedby="any"
        @close="handleClose"
    >
        <div class="flex flex-col font-mono">
            <div
                class="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800"
            >
                <h2
                    class="text-lg font-medium text-zinc-900 dark:text-zinc-100"
                >
                    Preferences
                </h2>
            </div>

            <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
                <div class="flex flex-col gap-3 px-5 py-4">
                    <div class="flex items-center justify-between">
                        <span
                            class="text-sm text-zinc-600 dark:text-zinc-400"
                        >
                            Primary color
                        </span>
                        <span
                            class="text-xs text-zinc-500 dark:text-zinc-500"
                        >
                            {{
                                PRIMARY_COLORS.find(
                                    (c) => c.id === preferences.primaryColorId,
                                )?.name
                            }}
                        </span>
                    </div>
                    <div class="grid grid-cols-10 gap-2">
                        <button
                            v-for="color in PRIMARY_COLORS"
                            :key="color.id"
                            type="button"
                            :title="color.name"
                            :aria-label="color.name"
                            :aria-pressed="
                                preferences.primaryColorId === color.id
                            "
                            class="aspect-square rounded-full ring-offset-2 ring-offset-white outline-none transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:ring-offset-zinc-900 dark:focus-visible:ring-zinc-500"
                            :class="
                                preferences.primaryColorId === color.id
                                    ? 'ring-2 ring-zinc-900 dark:ring-zinc-100'
                                    : ''
                            "
                            :style="{ backgroundColor: swatchColor(color.id) }"
                            @click="setPrimaryColor(color.id)"
                        />
                    </div>
                </div>
            </div>
        </div>
    </dialog>
</template>
