// dashboardRoutes.js
const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
    getDashboardStats,
    getAgeStats,
    getDusunStats,
    getMarriageStats,
    getEducationStats
} = require('../controllers/dashboardController');

const router = express.Router();

// Protect all dashboard routes
router.use(authenticateToken);

router.get('/stats', getDashboardStats);
router.get('/age-stats', getAgeStats);
router.get('/dusun-stats', getDusunStats);
router.get('/marriage-stats', getMarriageStats);
router.get('/education-stats', getEducationStats); // Tambahkan route baru

module.exports = router;