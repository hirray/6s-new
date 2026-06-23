const express = require('express');
const router = express.Router();
const ChecklistSubmission = require('../models/ChecklistSubmission');

// Get all submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await ChecklistSubmission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new submission
router.post('/', async (req, res) => {
  try {
    const { subZonalHeadId, zone, score } = req.body;
    const newSubmission = new ChecklistSubmission({
      subZonalHeadId,
      zone,
      score,
      date: new Date().toLocaleString()
    });
    const savedSubmission = await newSubmission.save();
    res.status(201).json(savedSubmission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
