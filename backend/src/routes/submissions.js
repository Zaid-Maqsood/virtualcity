const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const submissionController = require('../controllers/submissionController');

router.post('/', authenticate, authorize('student'), submissionController.submit);
router.get('/my', authenticate, authorize('student'), submissionController.getMySubmissions);
router.get('/assignment/:assignmentId', authenticate, authorize('teacher', 'admin'), submissionController.getForAssignment);
router.put('/:id/grade', authenticate, authorize('teacher', 'admin'), submissionController.grade);

module.exports = router;
