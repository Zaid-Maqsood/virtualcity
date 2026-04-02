const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');

router.post('/join/:liveClassId', authenticate, authorize('student'), attendanceController.joinClass);
router.get('/my', authenticate, authorize('student', 'parent'), attendanceController.getMyAttendance);
router.get('/course/:courseId', authenticate, authorize('teacher', 'admin', 'student'), attendanceController.getForCourse);
router.put('/:id', authenticate, authorize('teacher', 'admin'), attendanceController.update);

module.exports = router;
