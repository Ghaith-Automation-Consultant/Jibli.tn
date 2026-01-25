const db = require('../db');

exports.getAllRequests = (req, res) => {
    const requests = db.getAll('requests');
    res.json(requests);
};

exports.getRequestById = (req, res) => {
    const requests = db.getAll('requests');
    const request = requests.find(r => r.id == req.params.id);

    if (!request) {
        return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
};

exports.createRequest = (req, res) => {
    const newRequest = req.body;
    if (!newRequest.item) {
        return res.status(400).json({ error: 'Missing item name' });
    }
    const createdRequest = db.add('requests', newRequest);
    res.status(201).json(createdRequest);
};

exports.updateRequest = (req, res) => {
    const updatedRequest = db.update('requests', req.params.id, req.body);
    if (!updatedRequest) return res.status(404).json({ error: 'Request not found' });
    res.json(updatedRequest);
};

exports.deleteRequest = (req, res) => {
    const success = db.remove('requests', req.params.id);
    if (!success) return res.status(404).json({ error: 'Request not found' });
    res.json({ message: 'Request deleted' });
};
