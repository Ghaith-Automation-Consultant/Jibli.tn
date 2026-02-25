const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken: verifyToken } = require('../middlewares/auth');
const { validateRequest } = require('../middleware/validation');

router.get('/', requestController.getAllRequests);
router.get('/:id', requestController.getRequestById);
router.post('/', verifyToken, validateRequest, requestController.createRequest);
router.put('/:id', verifyToken, validateRequest, requestController.updateRequest);
router.delete('/:id', verifyToken, requestController.deleteRequest);

module.exports = router;
