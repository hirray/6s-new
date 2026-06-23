const express = require('express');
const router = express.Router();
const Advisory = require('../models/Advisory');

// Get all advisories
router.get('/', async (req, res) => {
  try {
    const advisories = await Advisory.find().sort({ createdAt: -1 });
    res.json(advisories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new advisory
router.post('/', async (req, res) => {
  try {
    const { targetZone, targetSubZone, text, author } = req.body;
    const newAdvisory = new Advisory({
      targetZone,
      targetSubZone,
      text,
      author: author || 'Core Admin',
      date: new Date().toLocaleString(),
      replies: []
    });
    const savedAdvisory = await newAdvisory.save();
    res.status(201).json(savedAdvisory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reply to advisory
router.post('/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { author, text } = req.body;

    const advisory = await Advisory.findById(id);
    if (!advisory) return res.status(404).json({ error: 'Advisory not found' });

    advisory.replies.push({
      author: author || 'User',
      text,
      date: new Date().toLocaleString()
    });

    const updatedAdvisory = await advisory.save();
    res.json(updatedAdvisory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
