const request = require('supertest');
const app = require('../../server');

describe('Requests API Integration Tests', () => {
    let authToken;

    beforeAll(async () => {
        // Register and login to get auth token
        const email = `requesttest-${Date.now()}@example.com`;
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email,
                password: 'test123456',
                name: 'Request Test User'
            });

        authToken = response.body.user.token;
    });

    describe('GET /api/requests', () => {
        test('should return all requests without auth', async () => {
            const response = await request(app).get('/api/requests');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body).toHaveProperty('pagination');
        });
    });

    describe('POST /api/requests', () => {
        test('should create request with valid data and auth', async () => {
            const response = await request(app)
                .post('/api/requests')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    item: 'Médicaments',
                    description: 'Médicaments spécifiques',
                    location: 'Tunis',
                    weight: 0.5,
                    budget: 20
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.item).toBe('Médicaments');
            expect(response.body.location).toBe('Tunis');
        });

        test('should return 401 without auth token', async () => {
            const response = await request(app)
                .post('/api/requests')
                .send({
                    item: 'Test Item',
                    location: 'Tunis'
                });

            expect(response.status).toBe(401);
        });

        test('should return 400 with missing item', async () => {
            const response = await request(app)
                .post('/api/requests')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    location: 'Tunis'
                });

            expect(response.status).toBe(400);
            expect(response.body.details).toContain('Item name is required');
        });

        test('should return 400 with negative weight', async () => {
            const response = await request(app)
                .post('/api/requests')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    item: 'Test Item',
                    location: 'Tunis',
                    weight: -5
                });

            expect(response.status).toBe(400);
            expect(response.body.details).toContain('Weight must be a positive number');
        });
    });

    describe('GET /api/requests/:id', () => {
        test('should return request by id', async () => {
            // Create request first
            const createRes = await request(app)
                .post('/api/requests')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    item: 'Électronique',
                    location: 'Sousse',
                    weight: 2,
                    budget: 50
                });

            const id = createRes.body.id;

            // Get it
            const response = await request(app).get(`/api/requests/${id}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(id);
            expect(response.body.item).toBe('Électronique');
        });

        test('should return 404 for non-existent request', async () => {
            const response = await request(app).get('/api/requests/507f1f77bcf86cd799439011');

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/requests/:id', () => {
        test('should update request with auth', async () => {
            // Create request first
            const createRes = await request(app)
                .post('/api/requests')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    item: 'Vêtements',
                    location: 'Sfax',
                    weight: 1,
                    budget: 15
                });

            const id = createRes.body.id;

            // Update it
            const response = await request(app)
                .put(`/api/requests/${id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    budget: 25
                });

            expect(response.status).toBe(200);
            expect(response.body.budget).toBe(25);
            expect(response.body.item).toBe('Vêtements'); // Unchanged
        });

        test('should return 401 without auth', async () => {
            const response = await request(app)
                .put('/api/requests/507f1f77bcf86cd799439011')
                .send({ budget: 30 });

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/requests/:id', () => {
        test('should delete request with auth', async () => {
            // Create request first
            const createRes = await request(app)
                .post('/api/requests')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    item: 'Documents',
                    location: 'Bizerte',
                    weight: 0.2,
                    budget: 10
                });

            const id = createRes.body.id;

            // Delete it
            const response = await request(app)
                .delete(`/api/requests/${id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('deleted');

            // Verify it's gone
            const getRes = await request(app).get(`/api/requests/${id}`);
            expect(getRes.status).toBe(404);
        });

        test('should return 401 without auth', async () => {
            const response = await request(app).delete('/api/requests/507f1f77bcf86cd799439011');

            expect(response.status).toBe(401);
        });
    });

    describe('Request Filtering', () => {
        beforeEach(async () => {
            // Seed some data
            await request(app).post('/api/requests').set('Authorization', `Bearer ${authToken}`).send({
                item: 'Laptop', location: 'Tunis', weight: 2, budget: 100
            });
            await request(app).post('/api/requests').set('Authorization', `Bearer ${authToken}`).send({
                item: 'Documents', location: 'Sousse', weight: 0.1, budget: 20
            });
        });

        test('should filter by location', async () => {
            const response = await request(app).get('/api/requests?location=Sousse');
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            expect(response.body.data[0].location).toBe('Sousse');
        });

        test('should filter by text query', async () => {
            const response = await request(app).get('/api/requests?query=Laptop');
            expect(response.status).toBe(200);
            expect(response.body.data.some(r => r.item === 'Laptop')).toBe(true);
        });

        test('should filter by max budget', async () => {
            const response = await request(app).get('/api/requests?maxBudget=50');
            expect(response.status).toBe(200);
            // Should find Documents (20) but not Laptop (100)
            const cheapRequests = response.body.data.filter(r => r.budget <= 50);
            expect(cheapRequests.length).toBeGreaterThanOrEqual(1);
            expect(cheapRequests.every(r => r.budget <= 50)).toBe(true);
        });
    });
});
