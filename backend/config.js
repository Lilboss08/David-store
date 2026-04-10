import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const tryLoadEnv = (filePath) => {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
    console.log(`Loaded env from ${filePath}`);
    return true;
  }
  return false;
};

// Prioritize backend/config.env then root config.env
const backendEnv = path.resolve(process.cwd(), 'backend', 'config.env');
const rootEnv = path.resolve(process.cwd(), 'config.env');

if (!tryLoadEnv(backendEnv)) {
  if (!tryLoadEnv(rootEnv)) {
    console.warn('No config.env found in backend/ or root; environment variables may be missing.');
  }
}

const adminPasscodeState = process.env.ADMIN_PASSCODE ? 'SET' : 'MISSING';

// Debug: ensure env vars are loaded early
console.log('dotenv loaded:', {
  EMAIL_USERNAME: process.env.EMAIL_USERNAME ? 'SET' : 'MISSING',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'SET' : 'MISSING',
  MONGODB_URL: process.env.MONGODB_URL ? 'SET' : 'MISSING',
  PORT: process.env.PORT ? 'SET' : 'MISSING',
  ADMIN_PASSCODE: adminPasscodeState,
});

if (adminPasscodeState === 'SET') {
  console.log(`Admin passcode is configured and has length ${process.env.ADMIN_PASSCODE.trim().length}.`);
}
