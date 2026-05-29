<script setup lang="ts">
import { usePreferredDark } from '@vueuse/core'

import Dock from '~/components/dock.vue'
import FileSearchDialog from '~/components/file-search-dialog.vue'
import PreferencesDialog from '~/components/preferences-dialog.vue'
import ShortcutsDialog from '~/components/shortcuts-dialog.vue'
import { applyVimUserBindings } from '~/lib/editor/extensions/editor-actions'
import { usePreferences } from '~/composables/use-preferences'
import {
    loadKeyBindings,
    useEditorKeyBindings,
    useShortcut,
} from '~/composables/use-shortcuts'

useHead({
    titleTemplate: (titleChunk) => {
        return titleChunk ? `${titleChunk} - Safi` : 'Safi'
    },
    htmlAttrs: {
        lang: 'en',
    },
    link: [
        {
            rel: 'icon',
            type: 'image/svg+xml',
            href: '/favicon.svg',
        },
    ],
})

const isShortcutsOpen = useState('isShortcutsOpen', () => false)
const isFileSearchOpen = useState('isFileSearchOpen', () => false)
const isPreferencesOpen = useState('isPreferencesOpen', () => false)

useShortcut('show-shortcuts', () => {
    isShortcutsOpen.value = !isShortcutsOpen.value
})

useShortcut('open-file-search', () => {
    isFileSearchOpen.value = !isFileSearchOpen.value
})

useShortcut('open-preferences', () => {
    isPreferencesOpen.value = !isPreferencesOpen.value
})

const { preferences, primaryColor, load: loadPreferences, setEnableVimMode } = usePreferences()
const isDark = usePreferredDark()
const editorKeyBindings = useEditorKeyBindings()
const editorBindingsLoaded = ref(false)

useShortcut('toggle-vim-mode', () => {
    void setEnableVimMode(!preferences.value.enableVimMode)
})

onMounted(() => {
    void loadPreferences()
    void loadKeyBindings().finally(() => {
        editorBindingsLoaded.value = true
    })
})

// Vim mappings live on a global singleton — only apply once the persisted
// bindings are in memory, otherwise the empty defaults briefly clear any
// previously-installed user mappings.
watch(
    [editorKeyBindings, editorBindingsLoaded],
    ([bindings, loaded]) => {
        if (!loaded) return
        applyVimUserBindings(bindings)
    },
    { deep: true },
)

watchEffect(() => {
    if (!import.meta.client) return
    const color = isDark.value ? primaryColor.value.dark : primaryColor.value.light
    const root = document.documentElement
    root.style.setProperty('--safi-primary', color)
    root.style.setProperty(
        '--safi-primary-selection',
        `color-mix(in srgb, ${color} 22%, transparent)`,
    )
    root.style.setProperty(
        '--safi-primary-match',
        `color-mix(in srgb, ${color} 32%, transparent)`,
    )
})
</script>

<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>

    <ShortcutsDialog v-model:open="isShortcutsOpen" />
    <FileSearchDialog v-model:open="isFileSearchOpen" />
    <PreferencesDialog v-model:open="isPreferencesOpen" />
    <Dock />
</template>
