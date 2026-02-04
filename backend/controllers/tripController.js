const Trip = require('../models/Trip');

exports.getAllTrips = async (req, res) => {
    try {
        const { from, to, date, minWeight, priceType, page = 1, limit = 20 } = req.query;
        const filter = {};

        // Filtering
        if (from) filter.from = { $regex: from, $options: 'i' };
        if (to) filter.to = { $regex: to, $options: 'i' };
        if (date) {
            const searchDate = new Date(date);
            // Search for trips on or after this date (ignoring time if just date provided)
            filter.departureDate = { $gte: searchDate };
        }
        if (minWeight) filter.maxWeight = { $gte: Number(minWeight) };
        if (priceType) filter.priceType = priceType;

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;

        const trips = await Trip.find(filter)
            .sort({ departureDate: 1 }) // Sort by date ascending
            .skip(skip)
            .limit(limitNum)
            .populate('user', 'name location'); // Populate user details

        const total = await Trip.countDocuments(filter);

        res.json({
            data: trips,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createTrip = async (req, res) => {
    try {
        const newTripData = req.body;
        // Simple validation
        if (!newTripData.from || !newTripData.to) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Add user from auth middleware (assumes verifyToken is used)
        if (req.user) {
            newTripData.user = req.user.id;
        }

        const trip = new Trip(newTripData);
        const createdTrip = await trip.save();

        res.status(201).json(createdTrip);
    } catch (error) {
        console.error('Create trip error:', error);
        res.status(400).json({ error: 'Invalid data' });
    }
};

exports.updateTrip = async (req, res) => {
    try {
        const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTrip) return res.status(404).json({ error: 'Trip not found' });
        res.json(updatedTrip);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findByIdAndDelete(req.params.id);
        if (!trip) return res.status(404).json({ error: 'Trip not found' });
        res.json({ message: 'Trip deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
