import { logger } from './logger'

export type NormalizeOptions = {
    ignoreRepeat?: boolean
}
const defaultNormalizeOptions: Required<NormalizeOptions> = {
    ignoreRepeat: true,
}
/**
 * Turn a KeyboardEvent into a normalized shortcut string.
 * E.g. `{ ctrlKey: true, key: 'a' }` becomes `ctrl-a`.
 */
export function normalizeKeyEvent(
    event: KeyboardEvent,
    options?: NormalizeOptions,
): string | undefined {
    logger.verbose('keyboard event to normalize', event)

    const { ignoreRepeat } = { ...defaultNormalizeOptions, ...options }
    if (ignoreRepeat && event.repeat) {
        logger.trace('Ignoring repeat event')
        return undefined
    }

    const parts = []
    if (event.ctrlKey) parts.push('ctrl')
    if (event.shiftKey) parts.push('shift')
    if (event.altKey) parts.push('alt')

    const key = event.key.toLowerCase()
    // Avoid duplicating modifier keys (e.g. "alt-alt" when just Alt is pressed)
    if (
        key !== 'control'
        && key !== 'shift'
        && key !== 'alt'
        && key !== 'meta'
    ) {
        parts.push(key)
    }

    return parts.join('-')
}
