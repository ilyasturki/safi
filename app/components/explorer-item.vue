<script setup lang="ts">
import { Icon } from '#components'

interface ExplorerItemProps {
    icon?: string
    indent?: number
    expand?: 'collapsed' | 'expanded' | 'none'
}

const props = withDefaults(defineProps<ExplorerItemProps>(), {
    indent: 0,
    expand: 'none',
})

const emit = defineEmits<{
    toggleExpand: []
}>()

const paddingLeftStyle = computed(() => ({
    paddingLeft: `calc(1.25rem + ${props.indent} * 1.25rem)`,
}))

defineSlots<{
    default: []
}>()

function handleToggleClick(event: MouseEvent) {
    event.stopPropagation()
    emit('toggleExpand')
}
</script>

<template>
    <li
        role="button"
        tabindex="0"
        :style="paddingLeftStyle"
        class="flex w-full items-center gap-3 py-3 pr-5 text-left text-zinc-900 transition-colors select-none hover:bg-zinc-50 focus:bg-zinc-100 focus:inset-ring-2 focus:outline-none active:bg-zinc-100 dark:text-zinc-100 dark:inset-ring-zinc-200 dark:hover:bg-zinc-900 dark:focus:bg-zinc-800 dark:active:bg-zinc-800"
    >
        <button
            v-if="expand !== 'none'"
            type="button"
            tabindex="-1"
            class="-m-1 flex h-6 w-6 shrink-0 items-center justify-center rounded p-1 text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
            :aria-label="expand === 'expanded' ? 'Collapse folder' : 'Expand folder'"
            @mousedown.prevent
            @click="handleToggleClick"
        >
            <Icon
                :name="
                    expand === 'expanded' ?
                        'lucide:chevron-down'
                    :   'lucide:chevron-right'
                "
                class="text-base"
            />
        </button>
        <span
            v-else
            aria-hidden="true"
            class="h-6 w-6 shrink-0"
        />
        <Icon
            v-if="icon"
            :name="icon"
            class="shrink-0 text-xl"
        />
        <span class="flex-1 truncate">
            <slot />
        </span>
    </li>
</template>
