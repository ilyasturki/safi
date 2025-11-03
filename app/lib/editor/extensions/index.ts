import { baseExtensions } from './base-extensions'
import { headingOutdentExtension } from './heading-outdent'
import { keymapsExtension } from './keymap'
import { liveMarkers } from './live-markers'
import { markdownExtension } from './markdown'
import { createPlaceholder } from './placeholder'
import { focusModeExtension } from './focus-mode'
import { noSpell } from './spellcheck'
import { darkSelection, lightSelection } from './selection'
import { usePreferredDark } from '@vueuse/core'
import { darkTheme, lightTheme } from '~/lib/editor/theme/theme-extension'
import type { MaybeRef } from 'vue'
import { unref } from 'vue'

export interface UseExtensionsOptions {
    /** @default undefined */
    placeholder?: string
    /** @default false */
    enableLiveMarkers?: MaybeRef<boolean>
    /** @default false */
    enableFocusMode?: MaybeRef<boolean>
}

export function useExtensions(options: UseExtensionsOptions = {}) {
    const {
        placeholder,
        enableLiveMarkers = false,
        enableFocusMode = false,
    } = options

    const isDark = usePreferredDark()

    return computed(() => {
        const extensions = [
            baseExtensions,
            keymapsExtension,
            markdownExtension,

            noSpell,
            headingOutdentExtension,
        ]

        if (unref(enableLiveMarkers)) {
            extensions.push(...liveMarkers)
        }

        if (unref(enableFocusMode)) {
            extensions.push(...focusModeExtension)
        }

        if (placeholder) {
            extensions.push(createPlaceholder(placeholder))
        }

        return [
            ...extensions,
            ...(isDark.value ? darkTheme : lightTheme),
            ...(isDark.value ? darkSelection : lightSelection),
        ]
    })
}
