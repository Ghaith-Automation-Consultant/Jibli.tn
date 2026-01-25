const requestController = require('./requestController');
const db = require('../db');

jest.mock('../db');

describe('RequestController', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getAllRequests', () => {
        test('should return all requests', () => {
            const mockRequests = [
                { id: 1, item: 'Médicaments', location: 'Tunis' },
                { id: 2, item: 'Électronique', location: 'Sousse' }
            ];

            db.getAll.mockReturnValue(mockRequests);

            requestController.getAllRequests(req, res);

            expect(db.getAll).toHaveBeenCalledWith('requests');
            expect(res.json).toHaveBeenCalledWith(mockRequests);
        });
    });

    describe('getRequestById', () => {
        test('should return request by id', () => {
            const mockRequest = { id: 1, item: 'Médicaments', location: 'Tunis' };
            req.params.id = '1';

            db.getAll.mockReturnValue([mockRequest]);

            requestController.getRequestById(req, res);

            expect(db.getAll).toHaveBeenCalledWith('requests');
            expect(res.json).toHaveBeenCalledWith(mockRequest);
        });

        test('should return 404 if request not found', () => {
            req.params.id = '999';
            db.getAll.mockReturnValue([]);

            requestController.getRequestById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Request not found' });
        });
    });

    describe('createRequest', () => {
        test('should create request with valid data', () => {
            const requestData = {
                item: 'Médicaments',
                location: 'Tunis',
                weight: 0.5,
                budget: 20
            };

            req.body = requestData;

            const createdRequest = { id: 1, ...requestData };
            db.add.mockReturnValue(createdRequest);

            requestController.createRequest(req, res);

            expect(db.add).toHaveBeenCalledWith('requests', requestData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdRequest);
        });

        test('should return 400 if item is missing', () => {
            req.body = { location: 'Tunis' };

            requestController.createRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Missing item name' });
            expect(db.add).not.toHaveBeenCalled();
        });
    });

    describe('updateRequest', () => {
        test('should update request successfully', () => {
            req.params.id = '1';
            req.body = { item: 'Updated Item' };

            const updatedRequest = { id: 1, item: 'Updated Item', location: 'Tunis' };
            db.update.mockReturnValue(updatedRequest);

            requestController.updateRequest(req, res);

            expect(db.update).toHaveBeenCalledWith('requests', '1', req.body);
            expect(res.json).toHaveBeenCalledWith(updatedRequest);
        });

        test('should return 404 if request not found', () => {
            req.params.id = '999';
            req.body = { item: 'Updated Item' };

            db.update.mockReturnValue(null);

            requestController.updateRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Request not found' });
        });
    });

    describe('deleteRequest', () => {
        test('should delete request successfully', () => {
            req.params.id = '1';
            db.remove.mockReturnValue(true);

            requestController.deleteRequest(req, res);

            expect(db.remove).toHaveBeenCalledWith('requests', '1');
            expect(res.json).toHaveBeenCalledWith({ message: 'Request deleted' });
        });

        test('should return 404 if request not found', () => {
            req.params.id = '999';
            db.remove.mockReturnValue(false);

            requestController.deleteRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Request not found' });
        });
    });
});
