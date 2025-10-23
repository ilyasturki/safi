import { themeExtension } from '~/lib/editor/theme/theme-extension'
import { baseExtensions } from './base-extensions'
import { keymapsExtension } from './keymap'
import { liveMarkers } from './live-markers'
import { markdownExtension } from './markdown'
import { createPlaceholder } from './placeholder'
import { sentenceFocusExtension } from './sentence-focus'
import { noSpell } from './spellcheck'

export interface UseExtensionsOptions {
    /** @default undefined */
    placeholder?: string
    /** @default false */
    enableLiveMarkers?: boolean
    /** @default true */
    enableSentenceFocus?: boolean
}

export function useExtensions(options: UseExtensionsOptions = {}) {
    const {
        placeholder,
        enableLiveMarkers = false,
        enableSentenceFocus = true,
    } = options

    const extensions = [
        baseExtensions,
        keymapsExtension,
        markdownExtension,
        themeExtension,

        // Extra
        noSpell,
    ]

    if (enableLiveMarkers) {
        extensions.push(...liveMarkers)
    }

    if (enableSentenceFocus) {
        extensions.push(...sentenceFocusExtension)
    }

    if (placeholder) {
        extensions.push(createPlaceholder(placeholder))
    }

    return extensions
}
