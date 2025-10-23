import type { Component } from 'vue'
import { createApp } from 'vue'
import { WidgetType } from '@codemirror/view'

export class TextWidget extends WidgetType {
    constructor(readonly text: string) {
        super()
    }

    toDOM() {
        const span = document.createElement('span')
        span.textContent = this.text
        return span
    }
}

export class QuoteWidget extends WidgetType {
    toDOM() {
        const span = document.createElement('span')
        span.textContent = ' '
        span.className = 'border-l-2 border-foreground/50'
        return span
    }
}

export class VueWidget extends WidgetType {
    constructor(
        readonly component: Component,
        readonly props: Record<string, unknown> = {},
    ) {
        super()
    }

    toDOM() {
        const container = document.createElement('span')
        const app = createApp(this.component, this.props)
        app.mount(container)
        return container
    }
}
