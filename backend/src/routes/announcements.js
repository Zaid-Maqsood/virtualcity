const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/announcementController');

router.get('/', authenticate, ctrl.getAll);
router.post('/', authenticate, authorize('teacher', 'admin'), ctrl.create);
router.delete('/:id', authenticate, authorize('teacher', 'admin'), ctrl.remove);

module.exports = router;
