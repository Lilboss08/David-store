import './config.js';
import mongoose from 'mongoose';
import { Location } from './schemas/locationSchema.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Database connected for seeding');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Simple seed function
const seedLocations = async () => {
  try {
    console.log('Starting simple location seeding...');

    // Clear existing data
    await Location.deleteMany({});
    console.log('Cleared existing location data');

    // Add test data
    const testData = [
      { type: 'state', name: 'Lagos', code: 'lagos' },
      { type: 'state', name: 'Abuja', code: 'abuja' },
      { type: 'lga', name: 'Ikeja', state: 'Lagos', code: 'lagos-ikeja' },
      { type: 'lga', name: 'Surulere', state: 'Lagos', code: 'lagos-surulere' },
      { type: 'lga', name: 'Abaji', state: 'Abuja', code: 'abuja-abaji' }
    ];

    await Location.insertMany(testData);
    console.log('Saved test locations');

    // Verify
    const stateCount = await Location.countDocuments({ type: 'state' });
    const lgaCount = await Location.countDocuments({ type: 'lga' });
    console.log(`Verification - States: ${stateCount}, LGAs: ${lgaCount}`);

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
};

// Main execution
const runSeeding = async () => {
  await connectDB();
  await seedLocations();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

runSeeding().catch(console.error);