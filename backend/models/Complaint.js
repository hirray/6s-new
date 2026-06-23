const mongoose = require('mongoose');

const RemarkSchema = new mongoose.Schema({
  author: { type: String, required: true },
  text: { type: String, required: true },
  photoProof: { type: String, default: null },
  date: { type: String, required: true }
});

const ComplaintSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  zone: { type: String, required: true },
  subZone: { type: String, required: true },
  desc: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  date: { type: String, required: true },
  imageUri: { type: String, default: null },
  remarks: [RemarkSchema]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
