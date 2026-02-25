const Request = require('../models/Request');
const requestController = require('./requestController');

jest.mock('../models/Request');

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
        test('should return all requests', async () => {
            const mockRequests = [
                { id: 1, item: 'Médicaments', location: 'Tunis' },
                { id: 2, item: 'Électronique', location: 'Sousse' }
            ];

            const mockQuery = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockRequests)
            };
            Request.find.mockReturnValue(mockQuery);
            Request.countDocuments = jest.fn().mockResolvedValue(2);

            await requestController.getAllRequests(req, res);

            expect(Request.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                data: mockRequests,
                pagination: { total: 2, page: 1, limit: 20, pages: 1 }
            });
        });

        test('should return 500 on server error', async () => {
            Request.find.mockImplementation(() => { throw new Error('DB Error'); });
            await requestController.getAllRequests(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getRequestById', () => {
        test('should return request by id', async () => {
            const mockRequest = { id: 1, item: 'Médicaments', location: 'Tunis' };
            req.params.id = '1';

            Request.findById.mockResolvedValue(mockRequest);

            await requestController.getRequestById(req, res);

            expect(Request.findById).toHaveBeenCalledWith('1');
            expect(res.json).toHaveBeenCalledWith(mockRequest);
        });

        test('should return 404 if request not found', async () => {
            req.params.id = '999';
            Request.findById.mockResolvedValue(null);

            await requestController.getRequestById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Request not found' });
        });
    });

    describe('createRequest', () => {
        test('should create request with valid data', async () => {
            const requestData = {
                item: 'Médicaments',
                location: 'Tunis',
                weight: 0.5,
                budget: 20
            };

            req.body = requestData;

            const createdRequest = { id: 1, ...requestData };
            // Mock instance save
            const mockSave = jest.fn().mockResolvedValue(createdRequest);
            Request.mockImplementation(() => ({ save: mockSave }));

            await requestController.createRequest(req, res);

            expect(Request).toHaveBeenCalledWith(requestData);
            expect(mockSave).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdRequest);
        });

        test('should return 400 if item is missing', async () => {
            req.body = { location: 'Tunis' };

            await requestController.createRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Missing item name' });
        });
    });

    describe('updateRequest', () => {
        test('should update request successfully', async () => {
            req.params.id = '1';
            req.body = { item: 'Updated Item' };

            const updatedRequest = { id: 1, item: 'Updated Item', location: 'Tunis' };
            Request.findByIdAndUpdate.mockResolvedValue(updatedRequest);

            await requestController.updateRequest(req, res);

            expect(Request.findByIdAndUpdate).toHaveBeenCalledWith('1', req.body, { new: true });
            expect(res.json).toHaveBeenCalledWith(updatedRequest);
        });

        test('should return 404 if request not found', async () => {
            req.params.id = '999';
            req.body = { item: 'Updated Item' };

            Request.findByIdAndUpdate.mockResolvedValue(null);

            await requestController.updateRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Request not found' });
        });
    });

    describe('deleteRequest', () => {
        test('should delete request successfully', async () => {
            req.params.id = '1';
            Request.findByIdAndDelete.mockResolvedValue({ id: 1 });

            await requestController.deleteRequest(req, res);

            expect(Request.findByIdAndDelete).toHaveBeenCalledWith('1');
            expect(res.json).toHaveBeenCalledWith({ message: 'Request deleted' });
        });

        test('should return 404 if request not found', async () => {
            req.params.id = '999';
            Request.findByIdAndDelete.mockResolvedValue(null);

            await requestController.deleteRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Request not found' });
        });
    });
});
