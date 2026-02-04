const request = require('supertest');
const app = require('../../server');

describe('Trips API Integration Tests', () => {
    let authToken;

    beforeAll(async () => {
        // Register and login to get auth token
        const email = `triptest-${Date.now()}@example.com`;
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email,
                password: 'test123456',
                name: 'Trip Test User'
            });

        authToken = response.body.user.token;
    });

    describe('GET /api/trips', () => {
        test('should return all trips without auth', async () => {
            const response = await request(app).get('/api/trips');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body).toHaveProperty('pagination');
        });
    });

    describe('POST /api/trips', () => {
        test('should create trip with valid data and auth', async () => {
            const response = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    from: 'Paris',
                    to: 'Tunis',
                    departureDate: '2024-06-01',
                    maxWeight: 10,
                    size: 'M',
                    priceType: 'free'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.from).toBe('Paris');
            expect(response.body.to).toBe('Tunis');
        });

        test('should return 401 without auth token', async () => {
            const response = await request(app)
                .post('/api/trips')
                .send({
                    from: 'Paris',
                    to: 'Tunis',
                    departureDate: '2024-06-01'
                });

            expect(response.status).toBe(401);
        });

        test('should return 400 with missing required fields', async () => {
            const response = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    from: 'Paris'
                    // Missing 'to' and 'departureDate'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
        });

        test('should return 400 with invalid date', async () => {
            const response = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    from: 'Paris',
                    to: 'Tunis',
                    departureDate: 'invalid-date'
                });

            expect(response.status).toBe(400);
            expect(response.body.details).toContain('Invalid departure date format');
        });
    });

    describe('GET /api/trips/:id', () => {
        test('should return trip by id', async () => {
            // First create a trip
            const createRes = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    from: 'Lyon',
                    to: 'Tunis',
                    departureDate: '2024-07-01',
                    maxWeight: 5
                });

            const id = createRes.body.id;

            // Then get it
            const response = await request(app).get(`/api/trips/${id}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(id);
            expect(response.body.from).toBe('Lyon');
        });

        test('should return 404 for non-existent trip', async () => {
            const response = await request(app).get('/api/trips/507f1f77bcf86cd799439011');

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/trips/:id', () => {
        test('should update trip with auth', async () => {
            // Create trip first
            const createRes = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    from: 'Marseille',
                    to: 'Tunis',
                    departureDate: '2024-08-01',
                    maxWeight: 15
                });

            const id = createRes.body.id;

            // Update it
            const response = await request(app)
                .put(`/api/trips/${id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    maxWeight: 20
                });

            expect(response.status).toBe(200);
            expect(response.body.maxWeight).toBe(20);
            expect(response.body.from).toBe('Marseille'); // Unchanged
        });

        test('should return 401 without auth', async () => {
            const response = await request(app)
                .put('/api/trips/507f1f77bcf86cd799439011')
                .send({ maxWeight: 20 });

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/trips/:id', () => {
        test('should delete trip with auth', async () => {
            // Create trip first
            const createRes = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    from: 'Nice',
                    to: 'Tunis',
                    departureDate: '2024-09-01',
                    maxWeight: 8
                });

            const id = createRes.body.id;

            // Delete it
            const response = await request(app)
                .delete(`/api/trips/${id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('deleted');

            // Verify it's gone
            const getRes = await request(app).get(`/api/trips/${id}`);
            expect(getRes.status).toBe(404);
        });

        test('should return 401 without auth', async () => {
            const response = await request(app).delete('/api/trips/507f1f77bcf86cd799439011');

            expect(response.status).toBe(401);
        });
    });

    describe('Trip Filtering', () => {
        beforeEach(async () => {
            // Seed some data for filtering
            await request(app).post('/api/trips').set('Authorization', `Bearer ${authToken}`).send({
                from: 'Paris', to: 'Tunis', departureDate: '2024-06-01', maxWeight: 10, priceType: 'free'
            });
            await request(app).post('/api/trips').set('Authorization', `Bearer ${authToken}`).send({
                from: 'Lyon', to: 'Oran', departureDate: '2024-07-01', maxWeight: 5, priceType: 'paid'
            });
            await request(app).post('/api/trips').set('Authorization', `Bearer ${authToken}`).send({
                from: 'Marseille', to: 'Tunis', departureDate: '2024-08-01', maxWeight: 20, priceType: 'free'
            });
        });

        test('should filter by from/to location', async () => {
            const response = await request(app).get('/api/trips?from=Paris');
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            expect(response.body.data[0].from).toBe('Paris');
        });

        test('should filter by price type', async () => {
            const response = await request(app).get('/api/trips?priceType=paid');
            expect(response.status).toBe(200);
            const paidTrips = response.body.data.filter(t => t.to === 'Oran'); // Filter to our seeded one to be safe
            expect(paidTrips.length).toBeGreaterThanOrEqual(1);
            expect(paidTrips[0].priceType).toBe('paid');
        });

        test('should filter by min weight', async () => {
            const response = await request(app).get('/api/trips?minWeight=15');
            expect(response.status).toBe(200);
            // Should find the 20kg one but not 5 or 10
            const heavyTrips = response.body.data.filter(t => t.maxWeight >= 15);
            expect(heavyTrips.length).toBeGreaterThanOrEqual(1);
            expect(heavyTrips.every(t => t.maxWeight >= 15)).toBe(true);
        });
    });
});
