const { createRateLimiter, clientIp, rateLimited } = require('../../../lib/rateLimit');

describe('createRateLimiter', () => {
    let time;
    const now = () => time;

    beforeEach(() => {
        time = 1_000_000;
    });

    it('allows up to the limit, then blocks with a retry delay', () => {
        const limiter = createRateLimiter({ limit: 2, windowMs: 60_000, now });

        expect(limiter.check('ip').allowed).toBe(true);
        expect(limiter.check('ip').allowed).toBe(true);

        time += 15_000;
        expect(limiter.check('ip')).toEqual({ allowed: false, retryAfterSeconds: 45 });
    });

    it('starts a fresh window once the old one has expired', () => {
        const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now });
        limiter.check('ip');
        expect(limiter.check('ip').allowed).toBe(false);

        time += 60_000;
        expect(limiter.check('ip').allowed).toBe(true);
    });

    it('counts each key separately', () => {
        const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now });
        expect(limiter.check('a').allowed).toBe(true);
        expect(limiter.check('b').allowed).toBe(true);
        expect(limiter.check('a').allowed).toBe(false);
    });
});

describe('clientIp', () => {
    const request = (headers) => ({ headers: new Map(Object.entries(headers)) });

    it('uses the first X-Forwarded-For address', () => {
        expect(clientIp(request({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7');
    });

    it('falls back when no proxy header is present', () => {
        expect(clientIp(request({}))).toBe('local');
    });
});

describe('rateLimited', () => {
    const NextResponse = { json: (body, init) => ({ body, ...init }) };

    it('returns a 429 with Retry-After once the quota is used up', () => {
        const key = `test-${Date.now()}`;
        for (let i = 0; i < 10; i++) expect(rateLimited(NextResponse, 'password', key)).toBeNull();

        const blocked = rateLimited(NextResponse, 'password', key);
        expect(blocked.status).toBe(429);
        expect(Number(blocked.headers['Retry-After'])).toBeGreaterThan(0);
    });
});
