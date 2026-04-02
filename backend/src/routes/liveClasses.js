const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const liveClassController = require('../controllers/liveClassController');

router.get('/my', authenticate, liveClassController.getMy);
router.get('/course/:courseId', authenticate, liveClassController.getForCourse);
router.get('/:id', authenticate, liveClassController.getOne);
router.post('/', authenticate, authorize('teacher', 'admin'), liveClassController.create);
router.delete('/:id', authenticate, authorize('teacher', 'admin'), liveClassController.remove);

module.exports = router;
