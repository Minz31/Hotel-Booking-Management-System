const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getRecentActivity
} = require('../controllers/dashboardController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All routes require authentication and admin privileges
router.use(verifyToken, isAdmin);

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);

module.exports = router;
