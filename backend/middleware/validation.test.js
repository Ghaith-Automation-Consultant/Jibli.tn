const { validateTrip, validateRequest, validateUser } = require('./validation');

describe('Validation Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, method: 'POST' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('validateTrip', () => {
        test('should call next() with valid trip data', () => {
            req.body = {
                from: 'Paris',
                to: 'Tunis',
                departureDate: '2024-06-01',
                maxWeight: 10
            };

            validateTrip(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 400 when from is missing', () => {
            req.body = { to: 'Tunis', departureDate: '2024-06-01' };

            validateTrip(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.arrayContaining(['Departure location (from) is required'])
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 400 when to is missing', () => {
            req.body = { from: 'Paris', departureDate: '2024-06-01' };

            validateTrip(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.arrayContaining(['Arrival location (to) is required'])
            });
        });

        test('should return 400 when departureDate is missing', () => {
            req.body = { from: 'Paris', to: 'Tunis' };

            validateTrip(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.arrayContaining(['Departure date is required'])
            });
        });

        test('should return 400 with invalid date format', () => {
            req.body = { from: 'Paris', to: 'Tunis', departureDate: 'invalid-date' };

            validateTrip(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.arrayContaining(['Invalid departure date format'])
            });
        });

        test('should return 400 with negative maxWeight', () => {
            req.body = { from: 'Paris', to: 'Tunis', departureDate: '2024-06-01', maxWeight: -5 };

            validateTrip(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.arrayContaining(['Max weight must be a positive number'])
            });
        });

        test('should return multiple errors', () => {
            req.body = {};

            validateTrip(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            const call = res.json.mock.calls[0][0];
            expect(call.details).toHaveLength(3); // from, to, departureDate
        });
    });

    describe('validateRequest', () => {
        test('should call next() with valid request data', () => {
            req.body = {
                item: 'Médicaments',
                location: 'Tunis',
                weight: 0.5,
                budget: 20
            };

            validateRequest(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 400 when item is missing', () => {
            req.body = { location: 'Tunis' };

            validateRequest(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.arrayContaining(['Item name is required'])
            });
        });

        test('should return 400 when location is missing', () => {
            req.body = { item: 'Médicaments' };

            validateRequest(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.arrayContaining(['Location is required'])
            });
        });

        test('should return 400 with negative weight', () => {
            req.body = { item: 'Médicaments', location: 'Tunis', weight: -1 };

            validateRequest(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.arrayContaining(['Weight must be a positive number'])
            });
        });

        test('should return 400 with negative budget', () => {
            req.body = { item: 'Médicaments', location: 'Tunis', budget: -10 };

            validateRequest(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.arrayContaining(['Budget must be a non-negative number'])
            });
        });
    });

    describe('validateUser', () => {
        test('should call next() with valid user data', () => {
            req.body = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            };

            validateUser(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 400 with invalid email format', () => {
            req.body = { email: 'invalid-email', password: 'password123' };

            validateUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.arrayContaining(['Invalid email format'])
            });
        });

        test('should return 400 with short password', () => {
            req.body = { email: 'test@example.com', password: '123' };

            validateUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.arrayContaining(['Password must be at least 6 characters long'])
            });
        });

        test('should return 400 with empty name', () => {
            req.body = { email: 'test@example.com', password: 'password123', name: '   ' };

            validateUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.arrayContaining(['Name cannot be empty'])
            });
        });

        test('should allow partial validation (only email)', () => {
            req.body = { email: 'test@example.com' };

            validateUser(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });
});
