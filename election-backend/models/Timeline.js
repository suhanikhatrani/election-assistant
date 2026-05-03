const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  phase: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['done', 'active', 'upcoming'], required: true },
  label: { type: String, required: true },
  desc: { type: String, required: true },
  details: [{ type: String }],
  order: { type: Number, required: true },
  imageUrl: { type: String },
  cloudinaryId: { type: String }
});

module.exports = mongoose.model('Timeline', timelineSchema);
