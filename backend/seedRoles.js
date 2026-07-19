const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Ensure bcrypt is installed: npm install bcrypt

// Replace with your actual User model path if different
// const User = require('./models/User');

// Mock User schema for demonstration if the real model isn't imported
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['ZonalHead', 'SubZonalHead', 'Admin', 'User'] },
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const MOCK_USERS = [
  {
    email: 'zonal.head.1@example.com',
    role: 'ZonalHead'
  },
  {
    email: 'zonal.head.2@example.com',
    role: 'ZonalHead'
  },
  {
    email: 'subzonal.head.1@example.com',
    role: 'SubZonalHead'
  },
  {
    email: 'subzonal.head.2@example.com',
    role: 'SubZonalHead'
  }
];

async function seedDatabase() {
  try {
    // Connect to your local development database
    // Ensure this is ONLY your local or test database URI
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/6s_monitor_dev';
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    for (const mockUser of MOCK_USERS) {
      // For local testing, we set the password to be the same as the email
      const rawPassword = mockUser.email;
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

      const userData = {
        ...mockUser,
        password: hashedPassword
      };

      // Upsert the user to avoid duplicate key errors on multiple runs
      await User.findOneAndUpdate(
        { email: mockUser.email },
        { $set: userData },
        { upsert: true, new: true }
      );
      
      console.log(`Seeded user: ${mockUser.email} with role: ${mockUser.role}`);
    }

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

// Run the seed function
seedDatabase();
