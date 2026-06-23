const mongoose = require('mongoose');

const CriteriaSchema = new mongoose.Schema({
  item: { type: String, required: true },
  aspect: { type: String, required: true },
  criteria: { type: String, required: true }
});

const ChecklistSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'masterChecklist', 'hostelChecklist'
  items: [CriteriaSchema]
}, { timestamps: true });

module.exports = mongoose.model('Checklist', ChecklistSchema);
