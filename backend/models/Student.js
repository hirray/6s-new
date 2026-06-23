const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // e.g., 24bt04d224
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
