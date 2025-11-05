export function useKeyboardListNavigation(
    containerRef: Ref<HTMLElement | null>,
    selector = '[tabindex="0"]',
) {
    function handleKeyDown(event: KeyboardEvent) {
        if (!containerRef.value) return

        const items = [
            ...containerRef.value.querySelectorAll<HTMLElement>(selector),
        ]
        if (items.length === 0) return

        const { activeElement } = document
        const currentIndex =
            activeElement ?
                items.indexOf(activeElement as HTMLElement)
            :   undefined

        if (event.key === 'ArrowDown') {
            event.preventDefault()
            const nextIndex =
                currentIndex === undefined ? 0 : (
                    (currentIndex + 1) % items.length
                )
            items[nextIndex]?.focus()
        } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            const prevIndex =
                currentIndex === undefined ? items.length - 1 : currentIndex - 1
            items[prevIndex]?.focus()
        }
    }

    return {
        handleKeyDown,
    }
}
