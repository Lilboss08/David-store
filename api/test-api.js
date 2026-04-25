import './config.js';

// Test API calls
const testAPI = async () => {
  try {
    console.log('Testing states API...');
    const statesResponse = await fetch('https://nga-states-lga.onrender.com/fetch');
    const states = await statesResponse.json();
    console.log('States fetched:', Array.isArray(states) ? states.length : 'not array', states.slice(0, 3));

    if (states.length > 0) {
      const testState = states[0];
      console.log(`Testing LGAs for ${testState}...`);
      const lgasResponse = await fetch(`https://nga-states-lga.onrender.com/fetch/${encodeURIComponent(testState)}`);
      const lgas = await lgasResponse.json();
      console.log('LGAs fetched:', Array.isArray(lgas) ? lgas.length : 'not array', lgas.slice(0, 3));
    }
  } catch (error) {
    console.error('API test failed:', error);
  }
};

testAPI();