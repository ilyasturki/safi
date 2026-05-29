import type { MaybeRef } from 'vue'
import { unref } from 'vue'
import { usePreferredDark } from '@vueuse/core'

import { darkTheme, lightTheme } from '~/lib/editor/theme/theme-extension'
import { baseExtensions } from './base-extensions'
import { focusModeExtension } from './focus-mode'
import { headingOutdentExtension } from './heading-outdent'
import { inlineCompletionExtension } from './inline-completion'
import { createKeymapsExtension } from './keymap'
import { liveMarkers } from './live-markers'
import { markdownExtension } from './markdown'
import { createPlaceholder } from './placeholder'
import { selectionExtension } from './selection'
import { noSpell } from './spellcheck'
import { vimExtension } from './vim'

export interface UseExtensionsOptions {
    /** @default undefined */
    placeholder?: string
    /** @default false */
    enableLiveMarkers?: MaybeRef<boolean>
    /** @default false */
    enableFocusMode?: MaybeRef<boolean>
    /** @default false */
    enableVimMode?: MaybeRef<boolean>
}

export function useExtensions(options: UseExtensionsOptions = {}) {
    const {
        placeholder,
        enableLiveMarkers = false,
        enableFocusMode = false,
        enableVimMode = false,
    } = options

    const isDark = usePreferredDark()

    return computed(() => {
        const vimOn = unref(enableVimMode)
        const extensions = []

        // Vim must come before the default keymap so its bindings win.
        if (vimOn) {
            extensions.push(vimExtension)
        }

        extensions.push(
            baseExtensions,
            inlineCompletionExtension(),
            createKeymapsExtension(vimOn),
            markdownExtension,

            noSpell,
            headingOutdentExtension,
        )

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
            ...selectionExtension,
        ]
    })
}
