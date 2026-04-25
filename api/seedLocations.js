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

// Fetch all states from external API
const fetchStatesFromAPI = async () => {
  try {
    const response = await fetch('https://nga-states-lga.onrender.com/fetch');
    if (!response.ok) {
      throw new Error('Failed to fetch states from external API');
    }
    const states = await response.json();
    return Array.isArray(states) ? states : [];
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

// Fetch LGAs for a specific state
const fetchLGAsForState = async (state) => {
  try {
    const response = await fetch(`https://nga-states-lga.onrender.com/fetch/${encodeURIComponent(state)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch LGAs for ${state}`);
    }
    const lgas = await response.json();
    return Array.isArray(lgas) ? lgas : [];
  } catch (error) {
    console.error(`Error fetching LGAs for ${state}:`, error);
    return [];
  }
};

// Seed states and LGAs
const seedLocations = async () => {
  try {
    console.log('Starting location seeding...');

    // Clear existing data
    await Location.deleteMany({});
    console.log('Cleared existing location data');

    // Fetch all states
    const states = await fetchStatesFromAPI();
    console.log(`Fetched ${states.length} states from API`);

    // Save states to database
    const stateDocuments = states.map(stateName => ({
      type: 'state',
      name: stateName,
      code: stateName.toLowerCase().replace(/\s+/g, '-')
    }));

    await Location.insertMany(stateDocuments);
    console.log(`Saved ${stateDocuments.length} states to database`);

    // Fetch and save LGAs for each state (limit to first 3 for testing)
    let totalLGAs = 0;
    const statesToProcess = states.slice(0, 3); // Process only first 3 states for testing
    console.log(`Processing ${statesToProcess.length} states for testing...`);

    for (const stateName of statesToProcess) {
      console.log(`Fetching LGAs for ${stateName}...`);
      const lgas = await fetchLGAsForState(stateName);
      console.log(`Found ${lgas.length} LGAs for ${stateName}`);

      if (lgas.length > 0) {
        const lgaDocuments = lgas.map(lgaName => ({
          type: 'lga',
          name: lgaName,
          state: stateName,
          code: `${stateName.toLowerCase().replace(/\s+/g, '-')}-${lgaName.toLowerCase().replace(/\s+/g, '-')}`
        }));

        await Location.insertMany(lgaDocuments);
        totalLGAs += lgaDocuments.length;
        console.log(`Saved ${lgaDocuments.length} LGAs for ${stateName}`);
      }

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Test seeding completed! Processed states: ${statesToProcess.length}, Total LGAs: ${totalLGAs}`);

    // Verify data
    const stateCount = await Location.countDocuments({ type: 'state' });
    const lgaCount = await Location.countDocuments({ type: 'lga' });
    console.log(`Verification - States in DB: ${stateCount}, LGAs in DB: ${lgaCount}`);

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

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeding().catch(console.error);
}

export { seedLocations };