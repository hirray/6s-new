const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  author: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true }
});

const AdvisorySchema = new mongoose.Schema({
  targetZone: { type: String, required: true },
  targetSubZone: { type: String, required: true },
  text: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: String, required: true },
  replies: [ReplySchema]
}, { timestamps: true });

module.exports = mongoose.model('Advisory', AdvisorySchema);
