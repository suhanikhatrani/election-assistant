const express = require('express');
const {
  createTimeline, updateTimeline, deleteTimeline,
  createStep, updateStep, deleteStep,
  createGlossary, updateGlossary, deleteGlossary,
  createQuiz, updateQuiz, deleteQuiz
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// All routes here are protected and require 'admin' role
router.use(protect);
router.use(authorize('admin'));

// --- TIMELINE ---
router.post('/timeline', upload.single('image'), createTimeline);
router.put('/timeline/:id', upload.single('image'), updateTimeline);
router.delete('/timeline/:id', deleteTimeline);

// --- STEPS ---
router.post('/steps', upload.single('image'), createStep);
router.put('/steps/:id', upload.single('image'), updateStep);
router.delete('/steps/:id', deleteStep);

// --- GLOSSARY ---
router.post('/glossary', upload.single('image'), createGlossary);
router.put('/glossary/:id', upload.single('image'), updateGlossary);
router.delete('/glossary/:id', deleteGlossary);

// --- QUIZ ---
router.post('/quiz', upload.single('image'), createQuiz);
router.put('/quiz/:id', upload.single('image'), updateQuiz);
router.delete('/quiz/:id', deleteQuiz);

module.exports = router;
