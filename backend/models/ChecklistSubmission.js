const mongoose = require('mongoose');

const ChecklistSubmissionSchema = new mongoose.Schema({
  subZonalHeadId: { type: String, required: true },
  zone: { type: String, required: true },
  score: { type: Number, required: true },
  date: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ChecklistSubmission', ChecklistSubmissionSchema);
