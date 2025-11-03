<script setup lang="ts">
import HomeButton from '~/components/home-button.vue'
import InputValidation from '~/components/input-validation.vue'
import KeyboardKey from '~/components/keyboard-key.vue'
import { useShortcut } from '~/composables/use-shortcuts'
// import LastEditedFileCard from '~/components/last-edited-file-card.vue'
// import ManagedExplorer from '~/components/managed-explorer.vue'

// const currentFolderPath = ref('')

// const { data: workspace } = await useFetch('/api/workspace')
// const workspacePath = computed(() => workspace.value?.path ?? '')

const isShortcutsOpen = useState('isShortcutsOpen', () => false)

const isCreatingFile = ref(false)
const newFileName = ref('')
const createFileContainer = useTemplateRef('createFileContainer')

function startCreating() {
    isCreatingFile.value = true
    newFileName.value = ''
    nextTick(() => {
        createFileContainer.value?.focus()
    })
}

function cancelCreating() {
    isCreatingFile.value = false
    newFileName.value = ''
}

async function createFile() {
    const trimmedName = newFileName.value.trim()
    if (!trimmedName) {
        return
    }

    const fileName = `${trimmedName}.md` as const
    await $fetch(`/api/files/${fileName}`, {
        method: 'PUT',
        body: {
            content: '',
        },
    })

    cancelCreating()

    await navigateTo(`/edit/${fileName}`)
}

useShortcut('new-file', startCreating)
</script>

<template>
    <div class="flex flex-col items-center px-4 py-12 font-mono">
        <header class="mb-12 text-center">
            <h1
                class="mb-3 text-4xl font-medium tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100"
            >
                Safi
            </h1>
            <!-- <p class="text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                <span> Workspace: </span>
                <span class="ml-1">{{ workspacePath }}</span>
            </p> -->
        </header>

        <!-- <div
                class="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
                <ManagedExplorer v-model:folder-path="currentFolderPath" />
            </div>

            <LastEditedFileCard /> -->

        <main class="flex w-full max-w-md flex-col items-center gap-4">
            <InputValidation
                v-if="isCreatingFile"
                ref="createFileContainer"
                v-model="newFileName"
                class="flex gap-2"
                :disable-validation="!newFileName.trim()"
                @validate="createFile"
                @cancel="cancelCreating"
            />
            <HomeButton
                v-else
                @click="startCreating"
            >
                New File
                <KeyboardKey :keys="['Ctrl', 'N']" />
            </HomeButton>

            <HomeButton @click="isShortcutsOpen = true">
                Show Shortcuts
                <KeyboardKey :keys="['F1']" />
            </HomeButton>
        </main>
    </div>
</template>
