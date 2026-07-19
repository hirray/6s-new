const mongoose = require('mongoose');

const ZonalReportSchema = new mongoose.Schema({
  zoneName: { type: String, required: true },
  comments: { type: String, required: true },
  submittedBy: { type: String, required: true },
  date: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ZonalReport', ZonalReportSchema);
