// Fixed-window rate limiter kept in process memory.
//
// Good enough for a single server instance. With several instances (or serverless) each one
// counts separately, so move the counters to a shared store such as Redis before scaling out.

const MAX_TRACKED_KEYS = 10000;

function createRateLimiter({ limit, windowMs, now = () => Date.now() }) {
    const hits = new Map(); // key -> { count, resetAt }

    function prune(currentTime) {
        for (const [key, entry] of hits) {
            if (entry.resetAt <= currentTime) hits.delete(key);
        }
    }

    /** Counts one hit for `key`. Returns { allowed, retryAfterSeconds }. */
    function check(key) {
        const currentTime = now();
        let entry = hits.get(key);

        if (!entry || entry.resetAt <= currentTime) {
            if (hits.size >= MAX_TRACKED_KEYS) prune(currentTime);
            entry = { count: 0, resetAt: currentTime + windowMs };
            hits.set(key, entry);
        }

        entry.count += 1;
        const allowed = entry.count <= limit;
        return {
            allowed,
            retryAfterSeconds: allowed ? 0 : Math.ceil((entry.resetAt - currentTime) / 1000),
        };
    }

    return { check };
}

/** Best-effort client IP. Only trustworthy behind a proxy that sets X-Forwarded-For itself. */
function clientIp(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    return (forwarded && forwarded.split(',')[0].trim()) || request.headers.get('x-real-ip') || 'local';
}

const MINUTE = 60 * 1000;

// Shared across requests in this process (module scope survives between calls).
const limiters = {
    // Account lockout already stops guessing one account; this stops spraying many accounts.
    login: createRateLimiter({ limit: 100, windowMs: 15 * MINUTE }),
    // Each registration costs a 64 MB Argon2 hash.
    register: createRateLimiter({ limit: 20, windowMs: 60 * MINUTE }),
    password: createRateLimiter({ limit: 10, windowMs: 15 * MINUTE }),
    message: createRateLimiter({ limit: 30, windowMs: MINUTE }),
};

/**
 * Returns a 429 response when `key` has used up `name`'s quota, otherwise null.
 * Takes NextResponse as an argument so this file stays free of Next imports (and testable in Jest).
 */
function rateLimited(NextResponse, name, key) {
    const { allowed, retryAfterSeconds } = limiters[name].check(key);
    if (allowed) return null;
    return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    );
}

module.exports = { createRateLimiter, clientIp, rateLimited };
