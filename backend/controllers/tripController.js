const db = require('../db');

exports.getAllTrips = (req, res) => {
    const trips = db.getAll('trips');
    res.json(trips);
};

exports.getTripById = (req, res) => {
    const trips = db.getAll('trips');
    const trip = trips.find(t => t.id == req.params.id);

    if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
};

exports.createTrip = (req, res) => {
    const newTrip = req.body;
    // Simple validation
    if (!newTrip.from || !newTrip.to) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const createdTrip = db.add('trips', newTrip);
    res.status(201).json(createdTrip);
};

exports.updateTrip = (req, res) => {
    const updatedTrip = db.update('trips', req.params.id, req.body);
    if (!updatedTrip) return res.status(404).json({ error: 'Trip not found' });
    res.json(updatedTrip);
};

exports.deleteTrip = (req, res) => {
    const success = db.remove('trips', req.params.id);
    if (!success) return res.status(404).json({ error: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
};
