const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const tutorController = require('../controllers/tutorController');

router.get('/', tutorController.getAll);

module.exports = router;
