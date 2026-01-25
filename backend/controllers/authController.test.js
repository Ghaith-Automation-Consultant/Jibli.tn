const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authController = require('./authController');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

// Mock dependencies
jest.mock('../db');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('login', () => {
        test('should return user and token with valid credentials', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashedPassword123'
            };

            req.body = { email: 'test@example.com', password: 'password123' };

            db.getAll.mockReturnValue([mockUser]);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mock-jwt-token');

            await authController.login(req, res);

            expect(db.getAll).toHaveBeenCalledWith('users');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 1, email: 'test@example.com', name: 'Test User' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            expect(res.json).toHaveBeenCalledWith({
                user: expect.objectContaining({
                    id: 1,
                    email: 'test@example.com',
                    token: 'mock-jwt-token'
                })
            });
            expect(res.json.mock.calls[0][0].user.password).toBeUndefined();
        });

        test('should return 401 with non-existent email', async () => {
            req.body = { email: 'nonexistent@example.com', password: 'password123' };
            db.getAll.mockReturnValue([]);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });

        test('should return 401 with wrong password', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword123'
            };

            req.body = { email: 'test@example.com', password: 'wrongpassword' };
            db.getAll.mockReturnValue([mockUser]);
            bcrypt.compare.mockResolvedValue(false);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });

        test('should return 500 on server error', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            db.getAll.mockImplementation(() => {
                throw new Error('Database error');
            });

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('register', () => {
        test('should create user with hashed password and return token', async () => {
            req.body = {
                email: 'newuser@example.com',
                name: 'New User',
                password: 'password123'
            };

            db.getAll.mockReturnValue([]);
            bcrypt.hash.mockResolvedValue('hashedPassword123');
            db.add.mockReturnValue({
                id: 1,
                email: 'newuser@example.com',
                name: 'New User',
                location: 'Tunis, Tunisie',
                password: 'hashedPassword123'
            });
            jwt.sign.mockReturnValue('mock-jwt-token');

            await authController.register(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(db.add).toHaveBeenCalledWith('users', {
                email: 'newuser@example.com',
                name: 'New User',
                location: 'Tunis, Tunisie',
                password: 'hashedPassword123'
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                user: expect.objectContaining({
                    id: 1,
                    email: 'newuser@example.com',
                    token: 'mock-jwt-token'
                }),
                message: 'Registration successful'
            });
        });

        test('should return 400 if user already exists', async () => {
            req.body = {
                email: 'existing@example.com',
                name: 'Existing User',
                password: 'password123'
            };

            db.getAll.mockReturnValue([{ email: 'existing@example.com' }]);

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User with this email already exists'
            });
            expect(bcrypt.hash).not.toHaveBeenCalled();
        });
    });

    describe('getUser', () => {
        test('should return user without password', () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashedPassword123'
            };

            req.params.id = '1';
            db.getAll.mockReturnValue([mockUser]);

            authController.getUser(req, res);

            expect(res.json).toHaveBeenCalledWith({
                id: 1,
                email: 'test@example.com',
                name: 'Test User'
            });
        });

        test('should return 404 if user not found', () => {
            req.params.id = '999';
            db.getAll.mockReturnValue([]);

            authController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
    });

    describe('updateUser', () => {
        test('should update user and hash new password', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated Name', password: 'newpassword' };

            bcrypt.hash.mockResolvedValue('newHashedPassword');
            db.update.mockReturnValue({
                id: 1,
                name: 'Updated Name',
                password: 'newHashedPassword'
            });

            await authController.updateUser(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
            expect(db.update).toHaveBeenCalledWith('users', '1', {
                name: 'Updated Name',
                password: 'newHashedPassword'
            });
            expect(res.json.mock.calls[0][0].password).toBeUndefined();
        });

        test('should update user without hashing if no password change', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated Name' };

            db.update.mockReturnValue({
                id: 1,
                name: 'Updated Name'
            });

            await authController.updateUser(req, res);

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(db.update).toHaveBeenCalledWith('users', '1', { name: 'Updated Name' });
        });
    });

    describe('deleteUser', () => {
        test('should delete user successfully', () => {
            req.params.id = '1';
            db.remove.mockReturnValue(true);

            authController.deleteUser(req, res);

            expect(db.remove).toHaveBeenCalledWith('users', '1');
            expect(res.json).toHaveBeenCalledWith({ message: 'User deleted' });
        });

        test('should return 404 if user not found', () => {
            req.params.id = '999';
            db.remove.mockReturnValue(false);

            authController.deleteUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
    });
});
