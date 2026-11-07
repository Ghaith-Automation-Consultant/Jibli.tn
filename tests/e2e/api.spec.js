const { test, expect, request: playwrightRequest } = require('@playwright/test');
const { PASSWORD, KARIM, LEILA, uniqueEmail } = require('./helpers');

// HTTP-level checks of the Next.js API routes. (The Jest integration tests cover the legacy
// Express server in server.js, not these routes.)
test.describe('Next.js API', () => {
    let anon, karim, leila, karimId, leilaId;

    const signIn = async (email) => {
        const ctx = await playwrightRequest.newContext({ baseURL: 'http://localhost:3100' });
        const res = await ctx.post('/api/auth/login', { data: { email, password: PASSWORD } });
        expect(res.status()).toBe(200);
        return { ctx, id: (await res.json()).user.id };
    };
    const ownerId = (doc) => doc.user?._id || doc.user;

    test.beforeAll(async () => {
        anon = await playwrightRequest.newContext({ baseURL: 'http://localhost:3100' });
        ({ ctx: karim, id: karimId } = await signIn(KARIM.email));
        ({ ctx: leila, id: leilaId } = await signIn(LEILA.email));
    });

    test.afterAll(async () => {
        await Promise.all([anon.dispose(), karim.dispose(), leila.dispose()]);
    });

    test.describe('trips', () => {
        let allTrips, mine, someoneElses;

        test.beforeAll(async () => {
            allTrips = (await (await anon.get('/api/trips?limit=50')).json()).data;
            mine = allTrips.find((trip) => ownerId(trip) === karimId);
            someoneElses = allTrips.find((trip) => ownerId(trip) !== karimId);
        });

        test('documents expose _id, including populated users', () => {
            expect(allTrips[0]._id).toBeTruthy();
            expect(allTrips[0].id).toBe(allTrips[0]._id);
            expect(allTrips[0].user._id).toBeTruthy();
        });

        test('GET by id works and keeps the owner contact details private', async () => {
            const res = await anon.get(`/api/trips/${mine._id}`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.user.name).toBe(KARIM.name);
            expect(body.user.email).toBeUndefined();
            expect(body.user.phone).toBeUndefined();
        });

        test('a malformed id is a 404, not a 500', async () => {
            expect((await anon.get('/api/trips/not-an-id')).status()).toBe(404);
        });

        test('owner can edit, but cannot reassign the trip or set invalid values', async () => {
            const res = await karim.put(`/api/trips/${mine._id}`, {
                data: { maxWeight: 7, user: '507f1f77bcf86cd799439011' },
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.maxWeight).toBe(7);
            expect(String(body.user)).toBe(karimId);

            expect((await karim.put(`/api/trips/${mine._id}`, { data: { size: 'HUGE' } })).status()).toBe(400);
            expect((await karim.put(`/api/trips/${mine._id}`, { data: { maxWeight: -1 } })).status()).toBe(400);
        });

        test("cannot edit or delete someone else's trip", async () => {
            expect((await karim.put(`/api/trips/${someoneElses._id}`, { data: { maxWeight: 1 } })).status()).toBe(403);
            expect((await karim.delete(`/api/trips/${someoneElses._id}`)).status()).toBe(403);
            expect((await anon.delete(`/api/trips/${someoneElses._id}`)).status()).toBe(401);
        });

        test('search input is treated literally', async () => {
            expect((await anon.get('/api/trips?from=(')).status()).toBe(200);
            const wildcard = await (await anon.get('/api/trips?from=.*')).json();
            expect(wildcard.data).toHaveLength(0);
        });

        test('bad query values do not cause a 500', async () => {
            expect((await anon.get('/api/trips?date=garbage')).status()).toBe(400);
            expect((await anon.get('/api/trips?user=garbage')).status()).toBe(400);
            expect((await anon.get('/api/trips?page=abc&limit=abc&minWeight=abc')).status()).toBe(200);
        });

        test('page size is capped', async () => {
            const body = await (await anon.get('/api/trips?limit=100000')).json();
            expect(body.pagination.limit).toBe(100);
        });

        test('size and user filters are applied', async () => {
            const bySize = (await (await anon.get('/api/trips?size=XL')).json()).data;
            expect(bySize.length).toBeGreaterThan(0);
            expect(bySize.every((trip) => trip.size === 'XL')).toBe(true);

            const byUser = (await (await anon.get(`/api/trips?user=${karimId}`)).json()).data;
            expect(byUser.length).toBeGreaterThan(0);
            expect(byUser.every((trip) => ownerId(trip) === karimId)).toBe(true);
        });

        test('invalid bodies are a 400, not a 500', async () => {
            const base = { from: 'A', to: 'B', departureDate: '2099-01-01', maxWeight: 5 };
            for (const data of [{ ...base, from: 123 }, { ...base, maxWeight: undefined }, { ...base, size: 'HUGE' }, { ...base, departureDate: 'nope' }]) {
                expect((await karim.post('/api/trips', { data })).status()).toBe(400);
            }
        });
    });

    test.describe('requests', () => {
        test('GET, edit and delete by id work for the owner only', async () => {
            const created = await karim.post('/api/requests', { data: { item: 'Colis API', location: 'Tunis' } });
            expect(created.status()).toBe(201);
            const { _id } = await created.json();

            expect((await anon.get(`/api/requests/${_id}`)).status()).toBe(200);
            expect((await leila.put(`/api/requests/${_id}`, { data: { budget: 1 } })).status()).toBe(403);

            const updated = await karim.put(`/api/requests/${_id}`, { data: { budget: 9, user: leilaId } });
            expect((await updated.json()).budget).toBe(9);
            expect(String((await updated.json()).user)).toBe(karimId);

            expect((await karim.delete(`/api/requests/${_id}`)).status()).toBe(200);
            expect((await anon.get(`/api/requests/${_id}`)).status()).toBe(404);
        });
    });

    test.describe('users', () => {
        test('contact details are only visible to their owner', async () => {
            const publicView = await (await anon.get(`/api/users/${karimId}`)).json();
            expect(publicView.name).toBe(KARIM.name);
            expect(publicView.email).toBeUndefined();
            expect(publicView.phone).toBeUndefined();
            expect(publicView.password).toBeUndefined();

            const ownView = await (await karim.get(`/api/users/${karimId}`)).json();
            expect(ownView.email).toBe(KARIM.email);
        });

        test('a partial update keeps other fields and ignores protected ones', async () => {
            const res = await karim.put(`/api/users/${karimId}`, {
                data: { bio: 'Bio API', isIdentityVerified: true, email: 'pirate@test.com' },
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.bio).toBe('Bio API');
            expect(body.name).toBe(KARIM.name);
            expect(body.email).toBe(KARIM.email);
            expect(body.isIdentityVerified).toBe(false);
        });

        test("cannot update someone else's profile", async () => {
            expect((await leila.put(`/api/users/${karimId}`, { data: { bio: 'x' } })).status()).toBe(403);
        });
    });

    test.describe('messages', () => {
        test('conversation partners only expose public fields', async () => {
            const conversations = await (await leila.get('/api/messages/conversations')).json();
            expect(conversations.length).toBeGreaterThan(0);
            expect(Object.keys(conversations[0].partner).sort()).toEqual(['_id', 'avatar', 'location', 'name']);
        });

        test('thread loads with sender ids and can be marked as read', async () => {
            const thread = await (await karim.get(`/api/messages/${leilaId}`)).json();
            expect(thread.length).toBeGreaterThan(0);
            expect(thread[0].sender._id).toBeTruthy();

            expect((await karim.put(`/api/messages/${leilaId}/read`)).status()).toBe(200);
            const after = await (await karim.get(`/api/messages/${leilaId}`)).json();
            expect(after.filter((m) => m.receiver._id === karimId).every((m) => m.read)).toBe(true);
        });

        test('invalid messages are a 4xx, not a 500', async () => {
            const send = (data) => karim.post('/api/messages', { data });
            expect((await send({ receiverId: leilaId, content: 'x'.repeat(1001) })).status()).toBe(400);
            expect((await send({ receiverId: { $ne: 1 }, content: 'x' })).status()).toBe(400);
            expect((await send({ receiverId: karimId, content: 'x' })).status()).toBe(400);
            expect((await send({ receiverId: '507f1f77bcf86cd799439011', content: 'x' })).status()).toBe(404);
            expect((await anon.get(`/api/messages/${leilaId}`)).status()).toBe(401);
        });
    });

    test.describe('platform', () => {
        test('health check reports the database as up', async () => {
            const res = await anon.get('/api/health');
            expect(res.status()).toBe(200);
            expect(await res.json()).toEqual({ status: 'ok', database: 'up' });
        });

        test('responses carry security headers', async () => {
            const res = await anon.get('/');
            const headers = res.headers();
            expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
            expect(headers['x-content-type-options']).toBe('nosniff');
            expect(headers['x-powered-by']).toBeUndefined();
        });

        test('profile fields are length-limited', async () => {
            const res = await karim.put(`/api/users/${karimId}`, { data: { bio: 'x'.repeat(501) } });
            expect(res.status()).toBe(400);
            expect((await res.json()).details[0]).toContain('500');
        });
    });

    test.describe('auth', () => {
        const session = async () => {
            const email = uniqueEmail('api');
            const ctx = await playwrightRequest.newContext({ baseURL: 'http://localhost:3100' });
            await ctx.post('/api/auth/register', { data: { email, password: PASSWORD, name: 'API' } });
            await ctx.post('/api/auth/login', { data: { email, password: PASSWORD } });
            return { ctx, email };
        };
        const refreshCookie = async (ctx) => {
            const { cookies } = await ctx.storageState();
            return cookies.find((c) => c.name === 'refresh_token')?.value;
        };

        test('non-string credentials are a 4xx, not a 500', async () => {
            const login = (data) => anon.post('/api/auth/login', { data });
            expect((await login({ email: { $ne: null }, password: 'x' })).status()).toBe(400);
            expect((await login({ email: KARIM.email, password: 12345 })).status()).toBe(400);
        });

        test('refresh rotates the token and the old one stops working', async () => {
            const { ctx } = await session();
            const before = await refreshCookie(ctx);

            expect((await ctx.post('/api/auth/refresh')).status()).toBe(200);
            expect(await refreshCookie(ctx)).not.toBe(before);

            const replay = await anon.post('/api/auth/refresh', { headers: { cookie: `refresh_token=${before}` } });
            expect(replay.status()).toBe(403);
            await ctx.dispose();
        });

        test('logout revokes the refresh token on the server and clears cookies', async () => {
            const { ctx } = await session();
            const token = await refreshCookie(ctx);
            expect(token).toBeTruthy();

            expect((await ctx.post('/api/auth/logout')).status()).toBe(200);
            expect((await ctx.storageState()).cookies).toEqual([]);

            const replay = await anon.post('/api/auth/refresh', { headers: { cookie: `refresh_token=${token}` } });
            expect(replay.status()).toBe(403);
            await ctx.dispose();
        });

        test('changing the password signs out other sessions but keeps this one', async () => {
            const { ctx, email } = await session();
            const other = await playwrightRequest.newContext({ baseURL: 'http://localhost:3100' });
            await other.post('/api/auth/login', { data: { email, password: PASSWORD } });

            const change = (data) => ctx.put('/api/auth/password', { data });
            expect((await change({ oldPassword: 'wrong', newPassword: 'New@Password12345' })).status()).toBe(400);
            expect((await change({ oldPassword: PASSWORD, newPassword: 'weak' })).status()).toBe(400);
            expect((await change({ oldPassword: PASSWORD, newPassword: 'New@Password12345' })).status()).toBe(200);

            expect((await other.post('/api/auth/refresh')).status()).toBe(403);
            expect((await ctx.post('/api/auth/refresh')).status()).toBe(200);

            await Promise.all([ctx.dispose(), other.dispose()]);
        });

        test('account locks after repeated failures and unknown emails take as long as known ones', async () => {
            const { email } = await session();
            for (let i = 0; i < 10; i++) {
                expect((await anon.post('/api/auth/login', { data: { email, password: 'Wrong@Password1' } })).status()).toBe(401);
            }
            const locked = await anon.post('/api/auth/login', { data: { email, password: PASSWORD } });
            expect(locked.status()).toBe(403);

            const timeLogin = async (address) => {
                const start = Date.now();
                await anon.post('/api/auth/login', { data: { email: address, password: 'Wrong@Password1' } });
                return Date.now() - start;
            };
            await timeLogin(uniqueEmail('warmup')); // the first call also computes the dummy hash
            const unknown = await timeLogin(uniqueEmail('nobody'));
            const known = await timeLogin('sami@test.com');
            expect(unknown).toBeGreaterThan(known * 0.4);
        });
    });
});
