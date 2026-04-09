// Backend controller for Nigeria states and LGAs
// Fetches data from external API: https://nga-states-lga.onrender.com
import { Location } from '../schemas/locationSchema.js';

// External API base URL
const NGA_STATES_API = 'https://nga-states-lga.onrender.com';

// Cache for performance
const stateCache = {
  states: null,
  lgasByState: {},
  lastFetched: 0,
  maxAgeMs: 30 * 60 * 1000 // 30 minutes cache
};

export const getStates = async (req, res) => {
  try {
    const now = Date.now();

    // Check cache first
    if (stateCache.states && now - stateCache.lastFetched < stateCache.maxAgeMs) {
      console.log('[Location] Serving states from cache');
      return res.status(200).json({ status: 'success', states: stateCache.states, source: 'cache' });
    }

    console.log('[Location] Fetching states from external API:', NGA_STATES_API + '/fetch');
    
    // Fetch from external API
    const response = await fetch(`${NGA_STATES_API}/fetch`);
    
    if (!response.ok) {
      throw new Error(`External API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[Location] Received states from API, count:', data.length);
    
    // Extract state names (API returns array of state objects or strings)
    let stateNames;
    if (Array.isArray(data)) {
      stateNames = data.map(item => {
        if (typeof item === 'string') return item;
        if (item.state) return item.state;
        if (item.name) return item.name;
        return Object.values(item)[0];
      }).filter(Boolean);
    } else {
      stateNames = Object.keys(data);
    }
    
    // Sort alphabetically
    stateNames.sort((a, b) => a.localeCompare(b));

    // Update cache
    stateCache.states = stateNames;
    stateCache.lastFetched = now;

    res.status(200).json({ status: 'success', states: stateNames, source: 'api' });
  } catch (err) {
    console.error('[Location] Error fetching states from API:', err.message);
    
    // Fallback to database if external API fails
    try {
      console.log('[Location] Falling back to database...');
      const states = await Location.find({ type: 'state' }).select('name').sort('name');
      const stateNames = states.map(state => state.name);
      res.status(200).json({ status: 'success', states: stateNames, source: 'database' });
    } catch (dbErr) {
      console.error('[Location] Database fallback also failed:', dbErr.message);
      res.status(500).json({ status: 'failed', message: 'Could not load states' });
    }
  }
};

export const getLGAs = async (req, res) => {
  try {
    const state = req.params.state;
    if (!state) {
      return res.status(400).json({ status: 'failed', message: 'State is required' });
    }

    const now = Date.now();
    const normalizedState = state.replace(/-/g, ' ').replace(/%20/g, ' '); // Handle URL-encoded spaces

    // Check cache first
    if (stateCache.lgasByState[normalizedState] && now - stateCache.lastFetched < stateCache.maxAgeMs) {
      console.log('[Location] Serving LGAs for', normalizedState, 'from cache');
      return res.status(200).json({ status: 'success', state: normalizedState, lgas: stateCache.lgasByState[normalizedState], source: 'cache' });
    }

    console.log('[Location] Fetching LGAs for', normalizedState, 'from external API');
    
    // Fetch from external API
    const apiUrl = `${NGA_STATES_API}/?state=${encodeURIComponent(normalizedState)}`;
    
    const response = await fetch(apiUrl);
    const rawData = await response.text();
    
    // Check if response is an error message (not JSON)
    if (rawData.trim().startsWith('Error:') || !rawData.trim().startsWith('[') && !rawData.trim().startsWith('{')) {
      console.log('[Location] API returned error for', normalizedState, ':', rawData.substring(0, 100));
      
      // Try alternate state names for common cases
      const alternateNames = {
        'abuja': ['FCT', 'Federal Capital Territory'],
        'fct': ['Abuja'],
        'federal capital territory': ['Abuja', 'FCT']
      };
      
      const alts = alternateNames[normalizedState.toLowerCase()];
      if (alts) {
        for (const alt of alts) {
          console.log('[Location] Trying alternate name:', alt);
          const altUrl = `${NGA_STATES_API}/?state=${encodeURIComponent(alt)}`;
          const altRes = await fetch(altUrl);
          const altData = await altRes.text();
          
          if (altData.trim().startsWith('[')) {
            console.log('[Location] Alternate name worked:', alt);
            const parsed = JSON.parse(altData);
            if (Array.isArray(parsed)) {
              const lgaNames = parsed.map(l => typeof l === 'string' ? l.trim() : l).filter(Boolean);
              stateCache.lgasByState[normalizedState] = lgaNames;
              stateCache.lastFetched = now;
              return res.status(200).json({ status: 'success', state: normalizedState, lgas: lgaNames, source: 'api' });
            }
          }
        }
      }
      
      throw new Error(`State "${normalizedState}" not found in external API`);
    }
    
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (parseErr) {
      console.error('[Location] Failed to parse API response:', parseErr.message);
      throw new Error('Invalid JSON from external API');
    }
    
    // Extract LGA names
    let lgaNames = [];
    
    if (Array.isArray(data)) {
      lgaNames = data.map(item => {
        if (typeof item === 'string') return item.trim();
        if (typeof item === 'object' && item !== null) {
          if (item.lga) return item.lga;
          if (item.name) return item.name;
          if (item.LGA) return item.LGA;
          if (item.Name) return item.Name;
          const values = Object.values(item);
          if (values.length === 1 && typeof values[0] === 'string') return values[0];
        }
        return null;
      }).filter(Boolean);
    }

    console.log('[Location] Extracted LGAs count:', lgaNames.length);

    // Remove duplicates and sort alphabetically
    lgaNames = [...new Set(lgaNames)].sort((a, b) => a.localeCompare(b));

    // Update cache
    stateCache.lgasByState[normalizedState] = lgaNames;
    stateCache.lastFetched = now;

    res.status(200).json({ status: 'success', state: normalizedState, lgas: lgaNames, source: 'api' });
  } catch (err) {
    console.error('[Location] Error fetching LGAs:', err.message);
    
    // Fallback to database
    try {
      console.log('[Location] Falling back to database for LGAs...');
      const lgas = await Location.find({ type: 'lga', state: state.replace(/-/g, ' ') }).select('name').sort('name');
      const lgaNames = lgas.map(lga => lga.name);
      res.status(200).json({ status: 'success', state: req.params.state, lgas: lgaNames, source: 'database' });
    } catch (dbErr) {
      console.error('[Location] Database fallback also failed:', dbErr.message);
      res.status(500).json({ status: 'failed', message: 'Could not load LGAs: ' + err.message });
    }
  }
};

// Function to get all locations (for admin purposes)
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({}).sort({ type: 1, state: 1, name: 1 });
    res.status(200).json({ status: 'success', locations });
  } catch (err) {
    console.error('Error fetching all locations:', err);
    res.status(500).json({ status: 'failed', message: 'Could not load locations from database' });
  }
};

// Seed function to populate database from external API (for offline use)
export const seedLocationsFromAPI = async (req, res) => {
  try {
    console.log('[Location] Seeding locations from external API...');
    
    // Fetch all states
    const statesResponse = await fetch(`${NGA_STATES_API}/fetch`);
    const statesData = await statesResponse.json();
    
    const stateNames = statesData.map(item => {
      if (typeof item === 'string') return item;
      if (item.state) return item.state;
      if (item.name) return item.name;
      return Object.values(item)[0];
    }).filter(Boolean);
    
    const locationsToInsert = [];
    
    // For each state, fetch LGAs
    for (const state of stateNames) {
      // Add state
      locationsToInsert.push({
        name: state,
        type: 'state',
        state: state
      });
      
      // Fetch LGAs for this state
      try {
        const lgaResponse = await fetch(`${NGA_STATES_API}/?state=${encodeURIComponent(state)}`);
        const lgaData = await lgaResponse.json();
        
        let lgaNames;
        if (Array.isArray(lgaData)) {
          lgaNames = lgaData.map(item => {
            if (typeof item === 'string') return item;
            if (item.lga) return item.lga;
            if (item.name) return item.name;
            return Object.values(item)[0];
          }).filter(Boolean);
        } else if (typeof lgaData === 'object') {
          lgaNames = Object.values(lgaData).flat();
        }
        
        if (lgaNames) {
          for (const lga of lgaNames) {
            locationsToInsert.push({
              name: lga,
              type: 'lga',
              state: state
            });
          }
        }
      } catch (lgaErr) {
        console.warn('[Location] Could not fetch LGAs for', state, ':', lgaErr.message);
      }
    }
    
    // Clear existing and insert new
    await Location.deleteMany({});
    await Location.insertMany(locationsToInsert);
    
    console.log('[Location] Seeding complete! Inserted', locationsToInsert.length, 'locations');
    
    res.status(200).json({ 
      status: 'success', 
      message: `Seeded ${locationsToInsert.length} locations`,
      breakdown: {
        states: stateNames.length,
        lgAs: locationsToInsert.filter(l => l.type === 'lga').length
      }
    });
  } catch (err) {
    console.error('[Location] Seeding error:', err);
    res.status(500).json({ status: 'failed', message: 'Seeding failed: ' + err.message });
  }
};