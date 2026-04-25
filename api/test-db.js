import './config.js';
import mongoose from 'mongoose';

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Database connected successfully');

    // Test basic query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

testConnection();