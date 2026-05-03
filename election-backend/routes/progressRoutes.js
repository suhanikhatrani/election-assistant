const express = require('express');
const { submitQuiz, completeStep, getDashboard } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');
const { validateQuizScore, validateStep } = require('../middleware/validate');

const router = express.Router();

router.post('/quiz', protect, validateQuizScore, submitQuiz);
router.post('/step', protect, validateStep, completeStep);
router.get('/dashboard', protect, getDashboard);

module.exports = router;
