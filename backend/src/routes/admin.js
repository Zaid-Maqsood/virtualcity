const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.use(authenticate, authorize('admin'));

router.get('/users', adminController.getUsers);
router.put('/users/:id/toggle', adminController.toggleUser);
router.get('/stats', adminController.getStats);
router.put('/courses/:id/assign-teacher', adminController.assignTeacher);

module.exports = router;
