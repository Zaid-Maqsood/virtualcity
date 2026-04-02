const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const assignmentController = require('../controllers/assignmentController');

router.get('/my', authenticate, authorize('student', 'teacher', 'admin'), assignmentController.getMyAssignments);
router.get('/course/:courseId', authenticate, assignmentController.getForCourse);
router.post('/', authenticate, authorize('teacher', 'admin'), assignmentController.create);
router.put('/:id', authenticate, authorize('teacher', 'admin'), assignmentController.update);
router.delete('/:id', authenticate, authorize('teacher', 'admin'), assignmentController.remove);

module.exports = router;
