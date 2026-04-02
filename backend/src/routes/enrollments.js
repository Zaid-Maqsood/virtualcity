const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const enrollmentController = require('../controllers/enrollmentController');

router.post('/', authenticate, authorize('student'), enrollmentController.enroll);
router.delete('/:courseId', authenticate, authorize('student'), enrollmentController.unenroll);
router.get('/my', authenticate, authorize('student', 'parent'), enrollmentController.getMyEnrollments);
router.get('/course/:courseId', authenticate, authorize('teacher', 'admin'), enrollmentController.getCourseStudents);

module.exports = router;
