import type {
    AiCompletionRequest,
    AiCompletionResponse,
} from '~~/shared/types/api'
import { HTTP_STATUS } from '~~/shared/utils/http-status'

const CHAT_URL = 'https://api.mistral.ai/v1/chat/completions'
const MODEL = 'mistral-small-latest'
const CURSOR_MARKER = '<|cursor|>'

const MAX_PREFIX_CHARS = 4000
const MAX_SUFFIX_CHARS = 1000
const MAX_TOKENS = 80
const TEMPERATURE = 0.3

const SYSTEM_PROMPT =
    `You are an inline text-completion engine for a Markdown editor.` +
    ` The user is writing. You will receive their document with a ${CURSOR_MARKER} marker at the cursor position.` +
    `\n\nReturn ONLY the text that should be inserted at the cursor — no quotes, no preamble, no explanations, no markdown fences.` +
    ` Never repeat text that already appears before or after the cursor.` +
    ` Match the tone, voice, and style of the surrounding text.` +
    ` Keep the continuation short (one phrase to one sentence) unless the context clearly invites a list or longer block.` +
    ` If the cursor is mid-word, complete the word naturally before continuing.` +
    ` If no useful continuation is possible, return an empty string.`

interface MistralChatResponse {
    choices?: Array<{
        message?: { content?: string }
    }>
}

function isString(value: unknown): value is string {
    return typeof value === 'string'
}

function parseBody(body: unknown): AiCompletionRequest {
    if (typeof body !== 'object' || body === null) {
        throw createError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            statusMessage: 'Expected JSON body with prefix and suffix',
        })
    }
    const record: Record<string, unknown> = { ...body }
    const { prefix, suffix } = record
    if (!isString(prefix) || !isString(suffix)) {
        throw createError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            statusMessage: 'prefix and suffix must be strings',
        })
    }
    return { prefix, suffix }
}

function stripWrappingArtifacts(text: string): string {
    let out = text
    // Trim a leading newline the model sometimes prepends.
    if (out.startsWith('\n')) out = out.slice(1)
    // Strip surrounding quotes if the whole thing is quoted.
    const quoted = /^(["'`])([\s\S]*)\1$/.exec(out)
    if (quoted) out = quoted[2] ?? out
    return out
}

function dedupeAgainstPrefix(completion: string, prefix: string): string {
    // Models often repeat the last few words of the prefix at the start of the completion.
    const tail = prefix.slice(-80)
    for (let len = Math.min(tail.length, completion.length); len > 3; len--) {
        if (completion.startsWith(tail.slice(-len))) {
            return completion.slice(len)
        }
    }
    return completion
}

export default defineEventHandler(
    async (event): Promise<AiCompletionResponse> => {
        const { mistralApiKey } = useRuntimeConfig(event)
        if (!mistralApiKey) {
            throw createError({
                statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
                statusMessage:
                    'Mistral API key is not configured. Set NUXT_MISTRAL_API_KEY in your environment.',
            })
        }

        const { prefix, suffix } = parseBody(await readBody<unknown>(event))

        const trimmedPrefix = prefix.slice(-MAX_PREFIX_CHARS)
        const trimmedSuffix = suffix.slice(0, MAX_SUFFIX_CHARS)

        const userMessage = `${trimmedPrefix}${CURSOR_MARKER}${trimmedSuffix}`

        let response: Response
        try {
            response = await fetch(CHAT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${mistralApiKey}`,
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: userMessage },
                    ],
                    max_tokens: MAX_TOKENS,
                    temperature: TEMPERATURE,
                    stream: false,
                }),
            })
        } catch (error) {
            console.error('Mistral request failed:', error)
            throw createError({
                statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
                statusMessage: 'Could not reach Mistral API',
            })
        }

        if (!response.ok) {
            const text = await response.text().catch(() => '')
            console.error(
                'Mistral API error:',
                response.status,
                text.slice(0, 500),
            )
            throw createError({
                statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
                statusMessage: `Mistral API returned ${response.status}`,
            })
        }

        let data: MistralChatResponse
        try {
            data = (await response.json()) as MistralChatResponse
        } catch (error) {
            console.error('Mistral response was not valid JSON:', error)
            throw createError({
                statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
                statusMessage: 'Mistral API returned a malformed response',
            })
        }
        const raw = data.choices?.[0]?.message?.content ?? ''
        let completion = dedupeAgainstPrefix(
            stripWrappingArtifacts(raw),
            trimmedPrefix,
        )
        if (/\s$/.test(trimmedPrefix) && /^\s/.test(completion)) {
            completion = completion.replace(/^\s+/, '')
        }

        return { completion }
    },
)
