const express = require('express');
const router = express.Router();
const ZonalHead = require('../models/ZonalHead');
const SubZonalHead = require('../models/SubZonalHead');
const Checklist = require('../models/Checklist');

router.get('/zonalheads', async (req, res) => {
  try {
    const data = await ZonalHead.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/subzonalheads', async (req, res) => {
  try {
    const data = await SubZonalHead.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/checklists', async (req, res) => {
  try {
    const data = await Checklist.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
