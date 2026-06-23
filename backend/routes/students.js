const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// POST /api/students/login
router.post('/login', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !email.endsWith('@gsfcuniversity.ac.in')) {
      return res.status(400).json({ error: 'Invalid email domain' });
    }

    const userId = email.split('@')[0];

    // Find existing student or create new one
    let student = await Student.findOne({ email });
    
    if (!student) {
      student = new Student({ userId, email, name });
      await student.save();
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
