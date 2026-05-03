const express = require('express');
const { getOverview, getQuizAnalytics, getUserAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all analytics routes to admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/overview', getOverview);
router.get('/quiz', getQuizAnalytics);
router.get('/users', getUserAnalytics);

module.exports = router;
