const Request = require('../models/Request');

exports.getAllRequests = async (req, res) => {
    try {
        const { query, location, date, maxBudget, page = 1, limit = 20 } = req.query || {};
        const filter = {};

        // Filtering
        if (query) {
            filter.$or = [
                { item: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        if (location) filter.location = { $regex: location, $options: 'i' };
        // Determine date logic? Usually "deadline"
        // if (date) filter.deadline ... (Assuming Request model has deadline, let's allow basic filtering if it does)

        if (maxBudget) filter.budget = { $lte: Number(maxBudget) };

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;

        const requests = await Request.find(filter)
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)
            .limit(limitNum)
            .populate('user', 'name location avatar');

        const total = await Request.countDocuments(filter);

        res.json({
            data: requests,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getRequestById = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createRequest = async (req, res) => {
    try {
        const newRequestData = req.body;
        if (!newRequestData.item) {
            return res.status(400).json({ error: 'Missing item name' });
        }

        // Add user from auth middleware
        if (req.user) {
            newRequestData.user = req.user.id;
        }

        const request = new Request(newRequestData);
        const createdRequest = await request.save();

        res.status(201).json(createdRequest);
    } catch (error) {
        console.error('Create request error:', error);
        res.status(400).json({ error: 'Invalid data' });
    }
};

exports.updateRequest = async (req, res) => {
    try {
        const updatedRequest = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRequest) return res.status(404).json({ error: 'Request not found' });
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteRequest = async (req, res) => {
    try {
        const request = await Request.findByIdAndDelete(req.params.id);
        if (!request) return res.status(404).json({ error: 'Request not found' });
        res.json({ message: 'Request deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
