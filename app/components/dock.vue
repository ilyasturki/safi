<script setup lang="ts">
import DockButton from '~/components/dock-button.vue'
import { useActiveVault } from '~/composables/use-active-vault'
import { triggerDockAction, useDockView } from '~/composables/use-dock'
import { usePreferencesState } from '~/composables/use-preferences-state'

const view = useDockView()
const isShortcutsOpen = useState('isShortcutsOpen', () => false)
const isFileSearchOpen = useState('isFileSearchOpen', () => false)
const isPreferencesOpen = useState('isPreferencesOpen', () => false)
const isVaultPickerOpen = useState('isVaultPickerOpen', () => false)
const { enableFocusMode } = usePreferencesState()
const { id: vaultId } = useActiveVault()
const homeHref = computed(() => (vaultId.value ? `/v/${vaultId.value}/` : '/'))
</script>

<template>
    <nav
        v-if="view"
        class="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center"
        aria-label="Dock"
    >
        <div
            role="toolbar"
            aria-label="Dock actions"
            class="pointer-events-auto flex items-center gap-1 rounded-lg border border-zinc-200 bg-white/95 px-2 py-1.5 font-mono shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95"
        >
            <template v-if="view === 'home'">
                <DockButton
                    icon="lucide:file-plus"
                    label="New file"
                    @click="triggerDockAction('new-file')"
                />
                <DockButton
                    icon="lucide:folder-open"
                    label="Open explorer"
                    @click="triggerDockAction('open-explorer')"
                />
                <DockButton
                    icon="lucide:search"
                    label="Search files"
                    @click="isFileSearchOpen = true"
                />
            </template>

            <template v-else-if="view === 'explorer'">
                <DockButton
                    icon="lucide:house"
                    label="Home"
                    :to="homeHref"
                />
                <DockButton
                    icon="lucide:file-plus"
                    label="New document"
                    @click="triggerDockAction('new-document')"
                />
                <DockButton
                    icon="lucide:folder-plus"
                    label="New folder"
                    @click="triggerDockAction('new-folder')"
                />
                <DockButton
                    icon="lucide:search"
                    label="Search files"
                    @click="isFileSearchOpen = true"
                />
            </template>

            <template v-else-if="view === 'editor'">
                <DockButton
                    icon="lucide:house"
                    label="Home"
                    :to="homeHref"
                />
                <DockButton
                    icon="lucide:folder-open"
                    label="Open explorer"
                    @click="triggerDockAction('open-explorer')"
                />
                <DockButton
                    icon="lucide:search"
                    label="Search files"
                    @click="isFileSearchOpen = true"
                />
                <DockButton
                    icon="lucide:focus"
                    label="Focus mode"
                    :active="enableFocusMode"
                    @click="enableFocusMode = !enableFocusMode"
                />
            </template>

            <div class="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-800" />

            <DockButton
                icon="lucide:layers"
                label="Switch vault"
                @click="isVaultPickerOpen = true"
            />
            <DockButton
                icon="lucide:settings"
                label="Preferences"
                @click="isPreferencesOpen = true"
            />
            <DockButton
                icon="lucide:keyboard"
                label="Keybindings"
                @click="isShortcutsOpen = true"
            />
        </div>
    </nav>
</template>
