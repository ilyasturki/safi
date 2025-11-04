<script setup lang="ts">
import { useLastEditedFile } from '~/composables/use-last-edited-file'
import type { FileResponse } from '~~/shared/types/api'
import { navigateToEdit } from '~/utils/navigate-to-edit'

const { lastEditedFilePath } = useLastEditedFile()
const { data: lastEditedFile } = await useFetch<FileResponse>(
    '/api/files/last-edited',
    {
        query: {
            path: lastEditedFilePath.value,
        },
    },
)

const PREVIEW_LINE_COUNT = 4

const previewLines = computed(() => {
    if (!lastEditedFile.value?.content) return []
    return lastEditedFile.value.content.split('\n').slice(0, PREVIEW_LINE_COUNT)
})

const fileName = computed(() => {
    if (!lastEditedFilePath.value) return ''
    return lastEditedFilePath.value.split('/').findLast(Boolean) || ''
})

function navigateToFile() {
    if (lastEditedFilePath.value !== undefined) {
        navigateToEdit(lastEditedFilePath.value)
    }
}
</script>

<template>
    <button
        v-if="lastEditedFile"
        type="button"
        class="group relative mt-6 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        @click="navigateToFile"
    >
        <div class="transition-all duration-200 group-hover:blur-sm">
            <div
                class="mb-3 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
                {{ fileName }}
            </div>
            <div
                class="space-y-1 font-mono text-xs text-zinc-500 dark:text-zinc-500"
            >
                <div
                    v-for="(line, index) in previewLines"
                    :key="index"
                    class="truncate"
                >
                    {{ line || '\u00A0' }}
                </div>
            </div>
        </div>
        <div
            class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
            <span
                class="font-mono text-2xl font-medium text-zinc-900 dark:text-zinc-100"
            >
                Open
            </span>
        </div>
    </button>
    <div v-else>
        <div class="flex items-center justify-center">
            <span
                class="font-mono text-sm font-medium text-zinc-500 dark:text-zinc-500"
            >
                No file selected
            </span>
        </div>
    </div>
</template>
