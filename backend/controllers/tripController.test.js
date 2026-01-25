const tripController = require('./tripController');
const db = require('../db');

jest.mock('../db');

describe('TripController', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getAllTrips', () => {
        test('should return all trips', () => {
            const mockTrips = [
                { id: 1, from: 'Paris', to: 'Tunis' },
                { id: 2, from: 'Lyon', to: 'Tunis' }
            ];

            db.getAll.mockReturnValue(mockTrips);

            tripController.getAllTrips(req, res);

            expect(db.getAll).toHaveBeenCalledWith('trips');
            expect(res.json).toHaveBeenCalledWith(mockTrips);
        });
    });

    describe('getTripById', () => {
        test('should return trip by id', () => {
            const mockTrip = { id: 1, from: 'Paris', to: 'Tunis' };
            req.params.id = '1';

            db.getAll.mockReturnValue([mockTrip]);

            tripController.getTripById(req, res);

            expect(db.getAll).toHaveBeenCalledWith('trips');
            expect(res.json).toHaveBeenCalledWith(mockTrip);
        });

        test('should return 404 if trip not found', () => {
            req.params.id = '999';
            db.getAll.mockReturnValue([]);

            tripController.getTripById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Trip not found' });
        });
    });

    describe('createTrip', () => {
        test('should create trip with valid data', () => {
            const tripData = {
                from: 'Paris',
                to: 'Tunis',
                departureDate: '2024-06-01',
                maxWeight: 10
            };

            req.body = tripData;

            const createdTrip = { id: 1, ...tripData };
            db.add.mockReturnValue(createdTrip);

            tripController.createTrip(req, res);

            expect(db.add).toHaveBeenCalledWith('trips', tripData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdTrip);
        });

        test('should return 400 if from is missing', () => {
            req.body = { to: 'Tunis', departureDate: '2024-06-01' };

            tripController.createTrip(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
            expect(db.add).not.toHaveBeenCalled();
        });

        test('should return 400 if to is missing', () => {
            req.body = { from: 'Paris', departureDate: '2024-06-01' };

            tripController.createTrip(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
        });
    });

    describe('updateTrip', () => {
        test('should update trip successfully', () => {
            req.params.id = '1';
            req.body = { from: 'Updated Paris' };

            const updatedTrip = { id: 1, from: 'Updated Paris', to: 'Tunis' };
            db.update.mockReturnValue(updatedTrip);

            tripController.updateTrip(req, res);

            expect(db.update).toHaveBeenCalledWith('trips', '1', req.body);
            expect(res.json).toHaveBeenCalledWith(updatedTrip);
        });

        test('should return 404 if trip not found', () => {
            req.params.id = '999';
            req.body = { from: 'Updated Paris' };

            db.update.mockReturnValue(null);

            tripController.updateTrip(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Trip not found' });
        });
    });

    describe('deleteTrip', () => {
        test('should delete trip successfully', () => {
            req.params.id = '1';
            db.remove.mockReturnValue(true);

            tripController.deleteTrip(req, res);

            expect(db.remove).toHaveBeenCalledWith('trips', '1');
            expect(res.json).toHaveBeenCalledWith({ message: 'Trip deleted' });
        });

        test('should return 404 if trip not found', () => {
            req.params.id = '999';
            db.remove.mockReturnValue(false);

            tripController.deleteTrip(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Trip not found' });
        });
    });
});
