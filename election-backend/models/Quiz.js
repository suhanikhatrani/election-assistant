const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  q: { type: String, required: true },
  opts: [{ type: String, required: true }],
  ans: { type: String, required: true },
  exp: { type: String, required: true },
  order: { type: Number, required: true },
  imageUrl: { type: String },
  cloudinaryId: { type: String }
});

module.exports = mongoose.model('Quiz', quizSchema);
