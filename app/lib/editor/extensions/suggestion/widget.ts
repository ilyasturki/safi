import { WidgetType } from '@codemirror/view'

export class AiSuggestionWidget extends WidgetType {
    constructor(readonly text: string) {
        super()
    }

    override eq(other: AiSuggestionWidget) {
        return this.text === other.text
    }

    toDOM() {
        const span = document.createElement('span')
        span.className = 'cm-ai-suggestion'
        span.textContent = this.text
        span.style.opacity = '0.4'
        span.style.color = 'var(--color-text-muted, #6b7280)'
        span.style.fontStyle = 'italic'
        span.style.pointerEvents = 'none'
        span.style.userSelect = 'none'
        return span
    }
}
