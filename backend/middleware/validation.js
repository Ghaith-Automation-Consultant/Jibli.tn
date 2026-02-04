/**
 * Validation middleware for API requests
 */

const validateTrip = (req, res, next) => {
    const { from, to, departureDate, maxWeight } = req.body;
    const errors = [];

    // Required fields check only for creation (POST)
    if (req.method === 'POST') {
        if (!from || from.trim() === '') errors.push('Departure location (from) is required');
        if (!to || to.trim() === '') errors.push('Arrival location (to) is required');
        if (!departureDate) errors.push('Departure date is required');
    }

    // Format validation if fields are present
    if (from !== undefined && from.trim() === '') errors.push('Departure location (from) cannot be empty');
    if (to !== undefined && to.trim() === '') errors.push('Arrival location (to) cannot be empty');

    if (departureDate) {
        const date = new Date(departureDate);
        if (isNaN(date.getTime())) {
            errors.push('Invalid departure date format');
        }
    }

    if (maxWeight !== undefined) {
        const weight = parseFloat(maxWeight);
        if (isNaN(weight) || weight <= 0) {
            errors.push('Max weight must be a positive number');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
};

const validateRequest = (req, res, next) => {
    const { item, location } = req.body;
    const errors = [];

    // Required fields check only for creation (POST)
    if (req.method === 'POST') {
        if (!item || item.trim() === '') errors.push('Item name is required');
        if (!location || location.trim() === '') errors.push('Location is required');
    }

    // Format validation if fields are present
    if (item !== undefined && item.trim() === '') errors.push('Item name cannot be empty');
    if (location !== undefined && location.trim() === '') errors.push('Location cannot be empty');

    if (req.body.weight !== undefined) {
        const weight = parseFloat(req.body.weight);
        if (isNaN(weight) || weight <= 0) {
            errors.push('Weight must be a positive number');
        }
    }

    if (req.body.budget !== undefined) {
        const budget = parseFloat(req.body.budget);
        if (isNaN(budget) || budget < 0) {
            errors.push('Budget must be a non-negative number');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
};

const validateUser = (req, res, next) => {
    const { email, password, name } = req.body;
    const errors = [];

    if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        }
    }

    if (password !== undefined && password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (name !== undefined && name.trim() === '') {
        errors.push('Name cannot be empty');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
};

module.exports = {
    validateTrip,
    validateRequest,
    validateUser
};
