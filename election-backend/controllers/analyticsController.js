const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');

// @route   GET /api/admin/analytics/overview
exports.getOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAttempts = await QuizAttempt.countDocuments();
    
    // Global Average Quiz Score
    const avgScoreResult = await QuizAttempt.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$score" } } }
    ]);
    const avgScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAttempts,
        averageScore: avgScore.toFixed(2)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/admin/analytics/quiz
exports.getQuizAnalytics = async (req, res, next) => {
  try {
    // 1. Score Distribution (Bar Chart)
    const scoreDistribution = await QuizAttempt.aggregate([
      { $group: { _id: "$score", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // 2. Activity over time (Line Chart)
    const activityOverTime = await QuizAttempt.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          attempts: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        scoreDistribution,
        activityOverTime
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/admin/analytics/users
exports.getUserAnalytics = async (req, res, next) => {
  try {
    // 1. Step Completion (Pie Chart) - how many users finished N steps
    const stepCompletion = await User.aggregate([
      {
        $project: {
          completedStepsCount: { $size: { $ifNull: ["$completedSteps", []] } }
        }
      },
      {
        $group: {
          _id: "$completedStepsCount",
          users: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stepCompletion
      }
    });
  } catch (err) {
    next(err);
  }
};
