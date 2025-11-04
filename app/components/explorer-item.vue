<script setup lang="ts">
interface ExplorerItemProps {
    icon?: string
}

defineProps<ExplorerItemProps>()
defineSlots<{
    default: []
}>()
</script>

<template>
    <li
        role="button"
        class="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors select-none hover:bg-zinc-50 focus:bg-zinc-100 focus:inset-ring-2 focus:outline-none active:bg-zinc-100 dark:inset-ring-zinc-200 dark:hover:bg-zinc-900 dark:focus:bg-zinc-800 dark:active:bg-zinc-800"
    >
        <span
            v-if="icon"
            class="text-xl"
            >{{ icon }}</span
        >
        <span class="flex-1 text-zinc-900 dark:text-zinc-100">
            <slot />
        </span>
    </li>
</template>
