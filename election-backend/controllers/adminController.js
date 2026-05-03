const Timeline = require('../models/Timeline');
const Step = require('../models/Step');
const Glossary = require('../models/Glossary');
const Quiz = require('../models/Quiz');

const cloudinary = require('../config/cloudinary');

// Helper to handle memory buffer streaming to Cloudinary
const streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    stream.end(req.file.buffer);
  });
};

// --- HELPER FUNCTION FOR CRUD ---
const createItem = (Model) => async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const result = await streamUpload(req);
      data.imageUrl = result.secure_url;
      data.cloudinaryId = result.public_id;
    }
    const doc = await Model.create(data);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400);
    next(err);
  }
};

const updateItem = (Model) => async (req, res, next) => {
  try {
    const data = { ...req.body };
    const existingDoc = await Model.findById(req.params.id);
    if (!existingDoc) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    if (req.file) {
      if (existingDoc.cloudinaryId) {
        await cloudinary.uploader.destroy(existingDoc.cloudinaryId);
      }
      const result = await streamUpload(req);
      data.imageUrl = result.secure_url;
      data.cloudinaryId = result.public_id;
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    res.status(400);
    next(err);
  }
};

const deleteItem = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      res.status(404);
      return next(new Error('Item not found'));
    }

    if (doc.cloudinaryId) {
      await cloudinary.uploader.destroy(doc.cloudinaryId);
    }
    
    await doc.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400);
    next(err);
  }
};

// --- TIMELINE ---
exports.createTimeline = createItem(Timeline);
exports.updateTimeline = updateItem(Timeline);
exports.deleteTimeline = deleteItem(Timeline);

// --- STEPS ---
exports.createStep = createItem(Step);
exports.updateStep = updateItem(Step);
exports.deleteStep = deleteItem(Step);

// --- GLOSSARY ---
exports.createGlossary = createItem(Glossary);
exports.updateGlossary = updateItem(Glossary);
exports.deleteGlossary = deleteItem(Glossary);

// --- QUIZ ---
exports.createQuiz = createItem(Quiz);
exports.updateQuiz = updateItem(Quiz);
exports.deleteQuiz = deleteItem(Quiz);
