const Trip = require('../models/Trip');
const User = require('../models/User');

exports.getGlobalStats = async (req, res) => {
    try {
        const activeTripsCount = await Trip.countDocuments({ status: 'active' });
        const completedTripsCount = await Trip.countDocuments({ status: 'completed' }); // Represents successful transactions for now
        const totalUsersCount = await User.countDocuments({}); // Simplest proxy for "active travelers"

        res.json({
            activeTrips: activeTripsCount,
            totalUsers: totalUsersCount,
            successfulTransactions: completedTripsCount
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
