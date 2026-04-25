import './config.js';
import mongoose from 'mongoose';
import { Location } from './schemas/locationSchema.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Database connected for LGA seeding');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
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

// Seed LGAs for a specific state
const seedLGAsForState = async (stateName) => {
  try {
    console.log(`Seeding LGAs for ${stateName}...`);

    // Check if LGAs already exist for this state
    const existingLGAs = await Location.countDocuments({ type: 'lga', state: stateName });
    if (existingLGAs > 0) {
      console.log(`LGAs already exist for ${stateName} (${existingLGAs} found)`);
      return;
    }

    const lgas = await fetchLGAsForState(stateName);

    if (lgas.length > 0) {
      const lgaDocuments = lgas.map(lgaName => ({
        type: 'lga',
        name: lgaName,
        state: stateName,
        code: `${stateName.toLowerCase().replace(/\s+/g, '-')}-${lgaName.toLowerCase().replace(/\s+/g, '-')}`
      }));

      await Location.insertMany(lgaDocuments);
      console.log(`✓ Saved ${lgaDocuments.length} LGAs for ${stateName}`);
    } else {
      console.log(`⚠ No LGAs found for ${stateName}`);
    }

  } catch (error) {
    console.error(`❌ Error seeding LGAs for ${stateName}:`, error);
  }
};

// Main execution - seed LGAs for all states
const seedAllLGAs = async () => {
  await connectDB();

  try {
    // Get all states
    const states = await Location.find({ type: 'state' }).select('name').sort('name');
    const stateNames = states.map(state => state.name);

    console.log(`Found ${stateNames.length} states. Seeding LGAs...`);

    for (let i = 0; i < stateNames.length; i++) {
      const stateName = stateNames[i];
      console.log(`[${i + 1}/${stateNames.length}] Processing ${stateName}...`);
      await seedLGAsForState(stateName);

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Final count
    const finalLgaCount = await Location.countDocuments({ type: 'lga' });
    console.log(`\n🎉 LGA seeding completed! Total LGAs: ${finalLgaCount}`);

  } catch (error) {
    console.error('Error during LGA seeding:', error);
  }

  await mongoose.connection.close();
};

seedAllLGAs().catch(console.error);