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

router.post('/zonalheads', async (req, res) => {
  try {
    const newHead = new ZonalHead(req.body);
    const savedHead = await newHead.save();
    res.status(201).json(savedHead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/zonalheads/:id', async (req, res) => {
  try {
    await ZonalHead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Zonal Head deleted successfully' });
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

router.post('/subzonalheads', async (req, res) => {
  try {
    const newHead = new SubZonalHead(req.body);
    const savedHead = await newHead.save();
    res.status(201).json(savedHead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/subzonalheads/:id', async (req, res) => {
  try {
    await SubZonalHead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sub-Zonal Head deleted successfully' });
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
