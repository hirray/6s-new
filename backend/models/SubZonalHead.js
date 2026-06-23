const mongoose = require('mongoose');

const SubZonalHeadSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  zone: { type: String, required: true },
  subZone: { type: String, required: true },
  areasCovered: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SubZonalHead', SubZonalHeadSchema);
