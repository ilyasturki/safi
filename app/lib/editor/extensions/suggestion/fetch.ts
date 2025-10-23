import type { AiSuggestionOptions } from '~~/shared/utils/valibot/suggestion-schema'
import { logger } from '~~/shared/utils/logger'

export function useFetchSuggestion() {
    const currentController = ref<AbortController | undefined>(undefined)
    const currentFetch = ref<Promise<string> | undefined>(undefined)

    const cancelCurrentFetch = () => {
        if (currentController.value) {
            logger.debug('Cancelling ongoing AI fetch')
            currentController.value.abort()
        }
    }

    const handleResponse = async (response: Response): Promise<string> => {
        if (!response.ok) {
            logger.error(
                'API request failed:',
                response.status,
                response.statusText,
            )
            return ''
        }

        const data = await response.json()
        return data.suggestion || ''
    }

    const makeAPIFetch = async (
        options: AiSuggestionOptions,
    ): Promise<string> => {
        cancelCurrentFetch()

        currentController.value = new AbortController()

        try {
            const response = await fetch('/api/suggestion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(options),
                signal: currentController.value.signal,
            })
            return await handleResponse(response)
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                logger.error('AI fetch cancelled')
                return ''
            }
            logger.error('Error fetching AI suggestion:', error)
            return ''
        } finally {
            currentController.value = undefined
        }
    }

    const fetchSuggestion = async (
        options: AiSuggestionOptions,
    ): Promise<string> => {
        if (currentFetch.value) {
            return ''
        }

        currentFetch.value = makeAPIFetch(options)

        try {
            const result = await currentFetch.value
            return result
        } catch {
            logger.error('Error fetching AI suggestion')
            return ''
        } finally {
            currentFetch.value = undefined
        }
    }

    const hasActiveFetch = (): boolean => {
        return currentFetch.value !== undefined
    }

    return {
        fetchSuggestion,
        hasActiveFetch,
        cancelCurrentFetch,
    }
}
