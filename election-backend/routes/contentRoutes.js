const express = require('express');
const { getTimeline, getSteps, getGlossary, getQuiz } = require('../controllers/contentController');
const paginate = require('../middleware/paginate');

const router = express.Router();

router.get('/timeline', paginate, getTimeline);
router.get('/steps', paginate, getSteps);
router.get('/glossary', paginate, getGlossary);
router.get('/quiz', paginate, getQuiz);

module.exports = router;
