// Script to create or upgrade admin user
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import './config.js'; // Load environment variables

// Import the User model
const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  role: String,
  isVerified: Boolean,
  verificationToken: String,
  verificationTokenExpires: Date
});

const User = mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@davidstore.com';
    const password = 'admin123';
    const fullName = 'Admin User';

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      console.log('User found:', user.email, 'Current role:', user.role);
      
      // Update existing user to admin
      user.role = 'admin';
      await user.save();
      console.log('User upgraded to admin successfully!');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      
      user = await User.create({
        fullName: fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        verificationToken: 'admin-token',
        verificationTokenExpires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
      });
      
      console.log('Admin user created successfully!');
    }

    console.log('Admin credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', user.role);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
