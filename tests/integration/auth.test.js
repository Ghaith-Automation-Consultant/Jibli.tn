const request = require('supertest');
const app = require('../../server'); // Import the Express app

describe('Auth API Integration Tests', () => {
    let authCookies;
    let userId;

    describe('POST /api/auth/register', () => {
        test('should register new user and return token', async () => {
            const uniqueEmail = `integration-${Date.now()}@test.com`;

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: uniqueEmail,
                    password: 'Test@123456789',
                    name: 'Integration Test User'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('User registered successfully');

            // Note: In new flow, register doesn't auto-login or return user/token.
        });

        test('should return 400 for duplicate email', async () => {
            const email = `duplicate-${Date.now()}@test.com`;

            await request(app)
                .post('/api/auth/register')
                .send({
                    email,
                    password: 'Test@123456789',
                    name: 'First User'
                });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email,
                    password: 'Test@123456789',
                    name: 'Second User'
                });

            expect(response.status).toBe(409);
            expect(response.body.error).toContain('Email already in use');
        });

        test('should return 400 for invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'Test@123456789',
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
                    password: 'Short@1',
                    name: 'Test User'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Password must be at least 12 characters long');
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
                    password: 'Test@123456789',
                    name: 'Login Test User'
                });
        });

        test('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: loginEmail,
                    password: 'Test@123456789'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(loginEmail);
            expect(response.body.user.password).toBeUndefined();
            expect(response.headers['set-cookie']).toBeDefined();
            authCookies = response.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        });

        test('should return 401 for wrong password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: loginEmail,
                    password: 'Wrong@Password1'
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid credentials');
        });

        test('should return 401 for non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'Test@123456789'
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
                    password: 'Test@123456789',
                    name: 'Full Flow User'
                });

            expect(registerRes.status).toBe(201);

            // 2. Login
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email,
                    password: 'Test@123456789'
                });

            expect(loginRes.status).toBe(200);

            // 3. Access protected route (create trip)
            const tripRes = await request(app)
                .post('/api/trips')
                .set('Cookie', loginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; '))
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
