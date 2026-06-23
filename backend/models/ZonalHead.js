const mongoose = require('mongoose');

const ZonalHeadSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  zone: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ZonalHead', ZonalHeadSchema);
