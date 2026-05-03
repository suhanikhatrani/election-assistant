const mongoose = require('mongoose');

const glossarySchema = new mongoose.Schema({
  term: { type: String, required: true, index: true },
  def: { type: String, required: true }
});

module.exports = mongoose.model('Glossary', glossarySchema);
