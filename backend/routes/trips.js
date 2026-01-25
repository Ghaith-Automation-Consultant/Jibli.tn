const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { verifyToken } = require('../middleware/auth');
const { validateTrip } = require('../middleware/validation');

router.get('/', tripController.getAllTrips);
router.get('/:id', tripController.getTripById);
router.post('/', verifyToken, validateTrip, tripController.createTrip);
router.put('/:id', verifyToken, validateTrip, tripController.updateTrip);
router.delete('/:id', verifyToken, tripController.deleteTrip);

module.exports = router;
