const express = require('express');
const router = express.Router();
const ChecklistSubmission = require('../models/ChecklistSubmission');
const ZonalReport = require('../models/ZonalReport');

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
    const { subZonalHeadId, zone, score, remarks } = req.body;
    const newSubmission = new ChecklistSubmission({
      subZonalHeadId,
      zone,
      score,
      date: new Date().toLocaleString(),
      remarks: remarks || []
    });
    const savedSubmission = await newSubmission.save();
    res.status(201).json(savedSubmission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve a submission
router.put('/:id/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const submission = await ChecklistSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    submission.approved = true;
    submission.approvedBy = approvedBy || 'Zonal Head';
    const updatedSubmission = await submission.save();
    
    res.json(updatedSubmission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post a new Zonal Report
router.post('/zonal-reports', async (req, res) => {
  try {
    const { zoneName, comments, submittedBy } = req.body;
    const report = new ZonalReport({
      zoneName,
      comments,
      submittedBy,
      date: new Date().toISOString()
    });
    const saved = await report.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Zonal Reports
router.get('/zonal-reports', async (req, res) => {
  try {
    const reports = await ZonalReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
