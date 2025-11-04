<script setup lang="ts">
interface ExplorerButtonProps {
    icon?: string
}

defineProps<ExplorerButtonProps>()
defineSlots<{
    default: []
}>()
</script>

<template>
    <button
        type="button"
        class="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:hover:bg-zinc-900 dark:active:bg-zinc-800"
    >
        <span
            v-if="icon"
            class="text-xl"
            >{{ icon }}</span
        >
        <span class="flex-1 text-zinc-900 dark:text-zinc-100">
            <slot />
        </span>
    </button>
</template>
