const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

// @desc    Submit a quiz score
// @route   POST /api/progress/quiz
// @access  Private
exports.submitQuiz = async (req, res, next) => {
  try {
    const { score } = req.body;
    
    // Validate score logic (e.g., ensure it's not greater than total questions)
    const totalQuestions = await Quiz.countDocuments();
    
    if (score > totalQuestions || score < 0) {
      res.status(400);
      return next(new Error('Invalid score submitted'));
    }

    const attempt = await QuizAttempt.create({
      user: req.user.id,
      score,
      totalQuestions
    });

    res.status(201).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a step as complete
// @route   POST /api/progress/step
// @access  Private
exports.completeStep = async (req, res, next) => {
  try {
    const { stepNumber } = req.body;

    if (!stepNumber) {
      res.status(400);
      return next(new Error('Step number is required'));
    }

    const user = await User.findById(req.user.id);
    
    // Only add if not already completed
    if (!user.completedSteps.includes(stepNumber)) {
      user.completedSteps.push(stepNumber);
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: user.completedSteps
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user progress dashboard
// @route   GET /api/progress/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const quizAttempts = await QuizAttempt.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: {
        completedSteps: user.completedSteps,
        quizHistory: quizAttempts,
        totalAttempts: quizAttempts.length,
        bestScore: quizAttempts.length > 0 ? Math.max(...quizAttempts.map(a => a.score)) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};
