const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  phase: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  fact: { type: String, required: true },
  stepNumber: { type: Number, required: true },
  imageUrl: { type: String },
  cloudinaryId: { type: String }
});

module.exports = mongoose.model('Step', stepSchema);
