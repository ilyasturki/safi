<script setup lang="ts">
import { Icon, NuxtLink } from '#components'

defineProps<{
    icon: string
    label: string
    to?: string
    active?: boolean
}>()
</script>

<template>
    <NuxtLink
        v-if="to"
        :to="to"
        :title="label"
        :aria-label="label"
        class="flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:active:bg-zinc-700"
    >
        <Icon
            :name="icon"
            class="text-lg"
        />
    </NuxtLink>
    <button
        v-else
        type="button"
        :title="label"
        :aria-label="label"
        :aria-pressed="active"
        class="flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:active:bg-zinc-700"
        :class="{
            'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100':
                active,
        }"
    >
        <Icon
            :name="icon"
            class="text-lg"
        />
    </button>
</template>
