const Trip = require('../models/Trip');
const tripController = require('./tripController');

jest.mock('../models/Trip');

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
        test('should return all trips', async () => {
            const mockTrips = [
                { id: 1, from: 'Paris', to: 'Tunis' },
                { id: 2, from: 'Lyon', to: 'Tunis' }
            ];

            const mockQuery = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockTrips)
            };
            Trip.find.mockReturnValue(mockQuery);
            Trip.countDocuments = jest.fn().mockResolvedValue(2);

            await tripController.getAllTrips(req, res);

            expect(Trip.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                data: mockTrips,
                pagination: { total: 2, page: 1, limit: 20, pages: 1 }
            });
        });

        test('should return 500 on server error', async () => {
            Trip.find.mockImplementation(() => { throw new Error('DB Error'); });
            await tripController.getAllTrips(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getTripById', () => {
        test('should return trip by id', async () => {
            const mockTrip = { id: 1, from: 'Paris', to: 'Tunis' };
            req.params.id = '1';

            Trip.findById.mockResolvedValue(mockTrip);

            await tripController.getTripById(req, res);

            expect(Trip.findById).toHaveBeenCalledWith('1');
            expect(res.json).toHaveBeenCalledWith(mockTrip);
        });

        test('should return 404 if trip not found', async () => {
            req.params.id = '999';
            Trip.findById.mockResolvedValue(null);

            await tripController.getTripById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Trip not found' });
        });
    });

    describe('createTrip', () => {
        test('should create trip with valid data', async () => {
            const tripData = {
                from: 'Paris',
                to: 'Tunis',
                departureDate: '2024-06-01',
                maxWeight: 10
            };

            req.body = tripData;

            const createdTrip = { id: 1, ...tripData };
            // Mock Mongoose save (instance method)
            const mockSave = jest.fn().mockResolvedValue(createdTrip);
            Trip.mockImplementation(() => ({ save: mockSave }));

            await tripController.createTrip(req, res);

            expect(Trip).toHaveBeenCalledWith(tripData);
            expect(mockSave).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdTrip);
        });

        test('should return 400 if from is missing', async () => {
            req.body = { to: 'Tunis', departureDate: '2024-06-01' };

            await tripController.createTrip(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
        });

        test('should return 400 if to is missing', async () => {
            req.body = { from: 'Paris', departureDate: '2024-06-01' };

            await tripController.createTrip(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
        });
    });

    describe('updateTrip', () => {
        test('should update trip successfully', async () => {
            req.params.id = '1';
            req.body = { from: 'Updated Paris' };

            const updatedTrip = { id: 1, from: 'Updated Paris', to: 'Tunis' };
            Trip.findByIdAndUpdate.mockResolvedValue(updatedTrip);

            await tripController.updateTrip(req, res);

            expect(Trip.findByIdAndUpdate).toHaveBeenCalledWith('1', req.body, { new: true });
            expect(res.json).toHaveBeenCalledWith(updatedTrip);
        });

        test('should return 404 if trip not found', async () => {
            req.params.id = '999';
            req.body = { from: 'Updated Paris' };

            Trip.findByIdAndUpdate.mockResolvedValue(null);

            await tripController.updateTrip(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Trip not found' });
        });
    });

    describe('deleteTrip', () => {
        test('should delete trip successfully', async () => {
            req.params.id = '1';
            Trip.findByIdAndDelete.mockResolvedValue({ id: 1 });

            await tripController.deleteTrip(req, res);

            expect(Trip.findByIdAndDelete).toHaveBeenCalledWith('1');
            expect(res.json).toHaveBeenCalledWith({ message: 'Trip deleted' });
        });

        test('should return 404 if trip not found', async () => {
            req.params.id = '999';
            Trip.findByIdAndDelete.mockResolvedValue(null);

            await tripController.deleteTrip(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Trip not found' });
        });
    });
});
