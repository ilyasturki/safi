import { placeholder } from '@codemirror/view'

export function createPlaceholder(
    text: string = 'Start typing your note here...',
) {
    return placeholder(text)
}
