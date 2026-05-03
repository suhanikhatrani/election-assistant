const Timeline = require('../models/Timeline');
const Step = require('../models/Step');
const Glossary = require('../models/Glossary');
const Quiz = require('../models/Quiz');

exports.getTimeline = async (req, res, next) => {
  try {
    const { skip, limit, page } = req.pagination;
    const total = await Timeline.countDocuments();
    const timeline = await Timeline.find().sort('order').skip(skip).limit(limit);
    res.status(200).json({
      success: true,
      count: timeline.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: timeline
    });
  } catch (error) { next(error); }
};

exports.getSteps = async (req, res, next) => {
  try {
    const { skip, limit, page } = req.pagination;
    const total = await Step.countDocuments();
    const steps = await Step.find().sort('stepNumber').skip(skip).limit(limit);
    res.status(200).json({
      success: true,
      count: steps.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: steps
    });
  } catch (error) { next(error); }
};

exports.getGlossary = async (req, res, next) => {
  try {
    const { skip, limit, page } = req.pagination;
    let query = {};
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = { $or: [{ term: searchRegex }, { def: searchRegex }] };
    }
    const total = await Glossary.countDocuments(query);
    const glossary = await Glossary.find(query).sort('term').skip(skip).limit(limit);
    res.status(200).json({
      success: true,
      count: glossary.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: glossary
    });
  } catch (error) { next(error); }
};

exports.getQuiz = async (req, res, next) => {
  try {
    const { skip, limit, page } = req.pagination;
    const total = await Quiz.countDocuments();
    const quiz = await Quiz.find().sort('order').skip(skip).limit(limit);
    res.status(200).json({
      success: true,
      count: quiz.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: quiz
    });
  } catch (error) { next(error); }
};
