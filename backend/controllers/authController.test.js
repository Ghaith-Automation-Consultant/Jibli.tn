const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authController = require('./authController');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

// Mock dependencies
jest.mock('../models/User');
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
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashedPassword123',
                toJSON: jest.fn().mockReturnValue({
                    id: '1',
                    email: 'test@example.com',
                    name: 'Test User',
                    password: 'hashedPassword123'
                })
            };

            req.body = { email: 'test@example.com', password: 'password123' };

            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mock-jwt-token');

            await authController.login(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
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
            User.findOne.mockResolvedValue(null);

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
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });

        test('should return 500 on server error', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            User.findOne.mockRejectedValue(new Error('Database error'));

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

            User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPassword123');

            // Mock mongoose document toObject
            const mockUserInstance = {
                id: '1',
                email: 'newuser@example.com',
                name: 'New User',
                toJSON: jest.fn().mockReturnValue({
                    id: '1',
                    email: 'newuser@example.com',
                    name: 'New User',
                    password: 'hashedPassword123'
                })
            };
            User.create.mockResolvedValue(mockUserInstance);
            jwt.sign.mockReturnValue('mock-jwt-token');

            await authController.register(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(User.create).toHaveBeenCalledWith({
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

            User.findOne.mockResolvedValue({ email: 'existing@example.com' });

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User with this email already exists'
            });
            expect(bcrypt.hash).not.toHaveBeenCalled();
        });
    });

    describe('getUser', () => {
        test('should return user without password', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashedPassword123'
            };

            // Mock mongoose document toJSON
            const mockUserInstance = {
                ...mockUser,
                toJSON: jest.fn().mockReturnValue(mockUser)
            };
            req.params.id = '1';
            User.findById.mockResolvedValue(mockUserInstance);

            await authController.getUser(req, res);

            expect(res.json).toHaveBeenCalledWith({
                id: 1,
                email: 'test@example.com',
                name: 'Test User'
            });
        });

        test('should return 404 if user not found', async () => {
            req.params.id = '999';
            User.findById.mockResolvedValue(null);

            await authController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
    });

    describe('updateUser', () => {
        test('should update user and hash new password', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated Name', password: 'newpassword' };

            bcrypt.hash.mockResolvedValue('newHashedPassword');

            const mockUserInstance = {
                id: 1,
                name: 'Updated Name',
                toJSON: jest.fn().mockReturnValue({
                    id: 1,
                    name: 'Updated Name',
                    password: 'newHashedPassword'
                })
            };
            User.findByIdAndUpdate.mockResolvedValue(mockUserInstance);

            await authController.updateUser(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('1', {
                name: 'Updated Name',
                password: 'newHashedPassword'
            }, { new: true });
            expect(res.json.mock.calls[0][0].password).toBeUndefined();
        });

        test('should update user without hashing if no password change', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated Name' };

            const mockUserInstance = {
                id: 1,
                name: 'Updated Name',
                toJSON: jest.fn().mockReturnValue({
                    id: 1,
                    name: 'Updated Name'
                })
            };
            User.findByIdAndUpdate.mockResolvedValue(mockUserInstance);

            await authController.updateUser(req, res);

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('1', { name: 'Updated Name' }, { new: true });
        });
    });

    describe('deleteUser', () => {
        test('should delete user successfully', async () => {
            req.params.id = '1';
            User.findByIdAndDelete.mockResolvedValue({ id: 1 });

            await authController.deleteUser(req, res);

            expect(User.findByIdAndDelete).toHaveBeenCalledWith('1');
            expect(res.json).toHaveBeenCalledWith({ message: 'User deleted' });
        });

        test('should return 404 if user not found', async () => {
            req.params.id = '999';
            User.findByIdAndDelete.mockResolvedValue(null);

            await authController.deleteUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
    });
});
