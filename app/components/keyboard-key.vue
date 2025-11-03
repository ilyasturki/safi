<script setup lang="ts">
interface KeyboardKeyProps {
    keys: string[]
}

defineProps<KeyboardKeyProps>()
</script>

<template>
    <span class="inline-flex items-center gap-1">
        <kbd
            v-for="(key, keyIndex) in keys"
            :key="keyIndex"
            class="rounded border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
            {{ key }}
        </kbd>
    </span>
</template>
