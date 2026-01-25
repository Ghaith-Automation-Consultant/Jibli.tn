const jwt = require('jsonwebtoken');
const { verifyToken, optionalAuth, JWT_SECRET } = require('./auth');

describe('Auth Middleware', () => {
    describe('verifyToken', () => {
        let req, res, next;

        beforeEach(() => {
            req = {
                headers: {}
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            next = jest.fn();
        });

        test('should call next() with valid token', () => {
            const token = jwt.sign({ id: 1, email: 'test@example.com', name: 'Test' }, JWT_SECRET);
            req.headers['authorization'] = `Bearer ${token}`;

            verifyToken(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeDefined();
            expect(req.user.id).toBe(1);
            expect(req.user.email).toBe('test@example.com');
        });

        test('should return 401 when no token provided', () => {
            verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. No token provided.' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 403 with invalid token', () => {
            req.headers['authorization'] = 'Bearer invalid-token';

            verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token.' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 403 with expired token', () => {
            const expiredToken = jwt.sign(
                { id: 1, email: 'test@example.com' },
                JWT_SECRET,
                { expiresIn: '-1s' } // Already expired
            );
            req.headers['authorization'] = `Bearer ${expiredToken}`;

            verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token.' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should handle malformed authorization header', () => {
            req.headers['authorization'] = 'InvalidFormat';

            verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. No token provided.' });
        });
    });

    describe('optionalAuth', () => {
        let req, res, next;

        beforeEach(() => {
            req = {
                headers: {}
            };
            res = {};
            next = jest.fn();
        });

        test('should set req.user with valid token', () => {
            const token = jwt.sign({ id: 1, email: 'test@example.com' }, JWT_SECRET);
            req.headers['authorization'] = `Bearer ${token}`;

            optionalAuth(req, res, next);

            expect(req.user).toBeDefined();
            expect(req.user.id).toBe(1);
            expect(next).toHaveBeenCalled();
        });

        test('should call next() without token (no error)', () => {
            optionalAuth(req, res, next);

            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalled();
        });

        test('should call next() with invalid token (no error)', () => {
            req.headers['authorization'] = 'Bearer invalid-token';

            optionalAuth(req, res, next);

            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalled();
        });
    });
});
