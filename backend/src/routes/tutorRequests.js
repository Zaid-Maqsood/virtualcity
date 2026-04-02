const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const tutorRequestController = require('../controllers/tutorRequestController');

router.post('/', authenticate, authorize('student'), tutorRequestController.requestTutor);
router.get('/', authenticate, authorize('admin'), tutorRequestController.getAll);
router.patch('/:id', authenticate, authorize('admin'), tutorRequestController.updateStatus);

module.exports = router;
