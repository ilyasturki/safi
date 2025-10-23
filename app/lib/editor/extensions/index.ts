import { themeExtension } from '~/lib/editor/theme/theme-extension'
import { baseExtensions } from './base-extensions'
import { keymapsExtension } from './keymap'
import { liveMarkers } from './live-markers'
import { markdownExtension } from './markdown'
import { createPlaceholder } from './placeholder'
import { noSpell } from './spellcheck'

export interface UseExtensionsOptions {
    placeholder?: string
    enableLiveMarkers?: boolean
}

export function useExtensions(options: UseExtensionsOptions = {}) {
    const { placeholder, enableLiveMarkers = false } = options

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

    // Add placeholder if provided
    if (placeholder) {
        extensions.push(createPlaceholder(placeholder))
    }

    return extensions
}
