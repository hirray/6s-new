const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// Get all complaints
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new complaint
router.post('/', async (req, res) => {
  try {
    const { studentId, zone, subZone, desc, imageUri } = req.body;
    const newComplaint = new Complaint({
      studentId,
      zone,
      subZone,
      desc,
      imageUri,
      status: 'Pending',
      date: new Date().toLocaleString(),
      remarks: []
    });
    const savedComplaint = await newComplaint.save();
    res.status(201).json(savedComplaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve/Update a complaint
router.put('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionText, photoProof, author } = req.body;
    
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.status = 'Resolved';
    complaint.remarks.push({
      author: author || 'Admin',
      text: resolutionText,
      photoProof: photoProof || null,
      date: new Date().toLocaleString()
    });

    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
