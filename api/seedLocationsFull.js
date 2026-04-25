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

// Seed all states and LGAs
const seedLocations = async () => {
  try {
    console.log('Starting full Nigerian location seeding...');

    // Clear existing data
    await Location.deleteMany({});
    console.log('Cleared existing location data');

    // Fetch all states
    console.log('Fetching all Nigerian states from API...');
    const states = await fetchStatesFromAPI();
    console.log(`Fetched ${states.length} states from API`);

    if (states.length === 0) {
      throw new Error('No states fetched from API');
    }

    // Save all states to database
    const stateDocuments = states.map(stateName => ({
      type: 'state',
      name: stateName,
      code: stateName.toLowerCase().replace(/\s+/g, '-')
    }));

    await Location.insertMany(stateDocuments);
    console.log(`✓ Saved ${stateDocuments.length} states to database`);

    // Fetch and save LGAs for each state
    let totalLGAs = 0;
    console.log('\nFetching LGAs for all states...');

    for (let i = 0; i < states.length; i++) {
      const stateName = states[i];
      console.log(`[${i + 1}/${states.length}] Processing ${stateName}...`);

      try {
        const lgas = await fetchLGAsForState(stateName);

        if (lgas.length > 0) {
          const lgaDocuments = lgas.map(lgaName => ({
            type: 'lga',
            name: lgaName,
            state: stateName,
            code: `${stateName.toLowerCase().replace(/\s+/g, '-')}-${lgaName.toLowerCase().replace(/\s+/g, '-')}`
          }));

          await Location.insertMany(lgaDocuments);
          totalLGAs += lgaDocuments.length;
          console.log(`  ✓ Saved ${lgaDocuments.length} LGAs for ${stateName}`);
        } else {
          console.log(`  ⚠ No LGAs found for ${stateName}`);
        }
      } catch (error) {
        console.error(`  ✗ Failed to fetch LGAs for ${stateName}:`, error.message);
      }

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`\n🎉 Seeding completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   States: ${states.length}`);
    console.log(`   LGAs: ${totalLGAs}`);

    // Final verification
    const finalStateCount = await Location.countDocuments({ type: 'state' });
    const finalLgaCount = await Location.countDocuments({ type: 'lga' });
    console.log(`\n✅ Final verification:`);
    console.log(`   States in database: ${finalStateCount}`);
    console.log(`   LGAs in database: ${finalLgaCount}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
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