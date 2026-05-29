interface Bucket {
    tokens: number
    updatedAt: number
}

interface Limit {
    capacity: number
    refillPerSec: number
}

const LIMITS: Record<string, Limit> = {
    '/api/ai/complete': { capacity: 10, refillPerSec: 1 / 6 },
}

const buckets = new Map<string, Bucket>()

export default defineEventHandler((event) => {
    const limit = LIMITS[event.path ?? '']
    if (!limit) return

    const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
    const key = `${event.path}:${ip}`
    const now = Date.now()
    const bucket = buckets.get(key) ?? {
        tokens: limit.capacity,
        updatedAt: now,
    }

    const elapsedMs = Math.max(0, now - bucket.updatedAt)
    bucket.tokens = Math.min(
        limit.capacity,
        bucket.tokens + (elapsedMs / 1000) * limit.refillPerSec,
    )
    bucket.updatedAt = now

    if (bucket.tokens < 1) {
        const retryAfter = Math.max(
            1,
            Math.ceil((1 - bucket.tokens) / limit.refillPerSec),
        )
        setResponseHeader(event, 'Retry-After', retryAfter)
        buckets.set(key, bucket)
        throw createError({
            statusCode: 429,
            statusMessage: `Too many requests — retry in ${retryAfter}s`,
            data: { retryAfter },
        })
    }

    bucket.tokens -= 1
    buckets.set(key, bucket)
})
