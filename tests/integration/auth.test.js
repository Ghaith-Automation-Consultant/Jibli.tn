const request = require('supertest');
const app = require('../../server'); // Import the Express app

describe('Auth API Integration Tests', () => {
    let authToken;
    let userId;

    describe('POST /api/auth/register', () => {
        test('should register new user and return token', async () => {
            const uniqueEmail = `integration-${Date.now()}@test.com`;

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: uniqueEmail,
                    password: 'test123456',
                    name: 'Integration Test User'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user.email).toBe(uniqueEmail);
            expect(response.body.user.password).toBeUndefined();

            // Save for later tests
            authToken = response.body.user.token;
            userId = response.body.user.id;
        });

        test('should return 400 for duplicate email', async () => {
            const email = `duplicate-${Date.now()}@test.com`;

            await request(app)
                .post('/api/auth/register')
                .send({
                    email,
                    password: 'test123456',
                    name: 'First User'
                });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email,
                    password: 'test123456',
                    name: 'Second User'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('already exists');
        });

        test('should return 400 for invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'test123456',
                    name: 'Test User'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Validation failed');
        });

        test('should return 400 for short password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: `test-${Date.now()}@example.com`,
                    password: '123',
                    name: 'Test User'
                });

            expect(response.status).toBe(400);
            expect(response.body.details).toContain('Password must be at least 6 characters long');
        });
    });

    describe('POST /api/auth/login', () => {
        let loginEmail;

        beforeAll(async () => {
            // Register a user for login tests
            loginEmail = `login-${Date.now()}@test.com`;
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: loginEmail,
                    password: 'test123456',
                    name: 'Login Test User'
                });
        });

        test('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: loginEmail,
                    password: 'test123456'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('token');
            expect(response.body.user.email).toBe(loginEmail);
            expect(response.body.user.password).toBeUndefined();
        });

        test('should return 401 for wrong password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: loginEmail,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid credentials');
        });

        test('should return 401 for non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'test123456'
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid credentials');
        });
    });

    describe('Auth Flow Integration', () => {
        test('should complete full auth flow: register → login → access protected route', async () => {
            const email = `fullflow-${Date.now()}@test.com`;

            // 1. Register
            const registerRes = await request(app)
                .post('/api/auth/register')
                .send({
                    email,
                    password: 'test123456',
                    name: 'Full Flow User'
                });

            expect(registerRes.status).toBe(201);
            const token = registerRes.body.user.token;

            // 2. Login
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email,
                    password: 'test123456'
                });

            expect(loginRes.status).toBe(200);

            // 3. Access protected route (create trip)
            const tripRes = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: 'Paris',
                    to: 'Tunis',
                    departureDate: '2024-06-01',
                    maxWeight: 10
                });

            expect(tripRes.status).toBe(201);
            expect(tripRes.body).toHaveProperty('id');
        });
    });
});
