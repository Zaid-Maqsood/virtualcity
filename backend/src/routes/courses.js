const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const courseController = require('../controllers/courseController');

router.get('/', courseController.getAll);
router.get('/my', authenticate, authorize('teacher', 'admin'), courseController.getMyCourses);
router.get('/:id', courseController.getOne);
router.post('/', authenticate, authorize('teacher', 'admin'), courseController.create);
router.put('/:id', authenticate, authorize('teacher', 'admin'), courseController.update);
router.delete('/:id', authenticate, authorize('admin'), courseController.remove);

module.exports = router;
