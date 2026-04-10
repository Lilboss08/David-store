import './config.js';
import mongoose from 'mongoose';
import { Location } from './schemas/locationSchema.js';

const checkLocations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Database connected');

    const stateCount = await Location.countDocuments({ type: 'state' });
    const lgaCount = await Location.countDocuments({ type: 'lga' });

    console.log(`States in database: ${stateCount}`);
    console.log(`LGAs in database: ${lgaCount}`);

    if (stateCount > 0) {
      const sampleStates = await Location.find({ type: 'state' }).limit(5);
      console.log('Sample states:', sampleStates.map(s => s.name));
    }

    if (lgaCount > 0) {
      const sampleLGAs = await Location.find({ type: 'lga' }).limit(5);
      console.log('Sample LGAs:', sampleLGAs.map(l => `${l.name} (${l.state})`));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkLocations();