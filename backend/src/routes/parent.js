const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const parentController = require('../controllers/parentController');

router.get('/dashboard', authenticate, authorize('parent'), parentController.getDashboard);

module.exports = router;
