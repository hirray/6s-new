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

// GET all students
router.get('/', async (req, res) => {
  try {
    const data = await Student.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new student manually (from dashboard)
router.post('/', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    // ensure userId exists
    if (!newStudent.userId && newStudent.email) {
      newStudent.userId = newStudent.email.split('@')[0];
    }
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT (update) student
router.put('/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
