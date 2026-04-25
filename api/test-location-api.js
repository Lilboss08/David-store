// Test script for Nigeria States and LGAs API
// Run with: node backend/test-location-api.js

async function testExternalAPI() {
  const NGA_STATES_API = 'https://nga-states-lga.onrender.com';

  console.log('=== Testing Nigeria States & LGAs API ===\n');

  // Test 1: Get all states
  console.log('1. Fetching all states...');
  try {
    const statesRes = await fetch(`${NGA_STATES_API}/fetch`);
    const statesData = await statesRes.json();
    console.log('   Status:', statesRes.status);
    console.log('   Type:', typeof statesData);
    console.log('   Is Array:', Array.isArray(statesData));
    if (Array.isArray(statesData)) {
      console.log('   Count:', statesData.length);
      console.log('   First 5:', statesData.slice(0, 5));
    } else {
      console.log('   Keys:', Object.keys(statesData));
    }
    console.log('');
  } catch (err) {
    console.error('   ERROR:', err.message);
  }

  // Test 2: Get LGAs for Lagos
  console.log('2. Fetching LGAs for Lagos...');
  try {
    const lgaRes = await fetch(`${NGA_STATES_API}/?state=Lagos`);
    const lgaData = await lgaRes.json();
    console.log('   Status:', lgaRes.status);
    console.log('   Type:', typeof lgaData);
    console.log('   Is Array:', Array.isArray(lgaData));
    if (Array.isArray(lgaData)) {
      console.log('   Count:', lgaData.length);
      console.log('   First 5:', lgaData.slice(0, 5));
    } else {
      console.log('   Keys:', Object.keys(lgaData));
      console.log('   Raw:', JSON.stringify(lgaData).substring(0, 500));
    }
    console.log('');
  } catch (err) {
    console.error('   ERROR:', err.message);
  }

  // Test 3: Get LGAs for Abuja/FCT
  console.log('3. Fetching LGAs for Abuja...');
  try {
    const lgaRes = await fetch(`${NGA_STATES_API}/?state=Abuja`);
    const lgaData = await lgaRes.json();
    console.log('   Status:', lgaRes.status);
    console.log('   Raw:', JSON.stringify(lgaData).substring(0, 500));
    console.log('');
  } catch (err) {
    console.error('   ERROR:', err.message);
  }

  // Test 4: Get LGAs for Kano
  console.log('4. Fetching LGAs for Kano...');
  try {
    const lgaRes = await fetch(`${NGA_STATES_API}/?state=Kano`);
    const lgaData = await lgaRes.json();
    console.log('   Status:', lgaRes.status);
    console.log('   Raw:', JSON.stringify(lgaData).substring(0, 500));
    console.log('');
  } catch (err) {
    console.error('   ERROR:', err.message);
  }
}

testExternalAPI();
