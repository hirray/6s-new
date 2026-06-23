require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/advisories', require('./routes/advisories'));
app.use('/api/data', require('./routes/data'));
app.use('/api/students', require('./routes/students'));
app.use('/api/submissions', require('./routes/submissions'));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running...');
});

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
.then(() => {
  console.log('MongoDB connection successful');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
