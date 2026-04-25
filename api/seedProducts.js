import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './schemas/productSchema.js';

dotenv.config({ path: './config.env' });

async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to DB for seeding');
  } catch (err) {
    console.error('DB connection error', err);
    process.exit(1);
  }
}

// Attempt to map any image URL to a local frontend asset if available
function mapImage(imageUrl) {
  if (!imageUrl) return '';
  const filename = imageUrl.split('/').pop();
  const candidate = `../frontend/public/${filename}`;
  if (fs.existsSync(candidate)) {
    return `/${filename}`; // will resolve from frontend server
  }
  return imageUrl; // leave unchanged if no local copy
}

async function seed() {
  try {
    const raw = fs.readFileSync('product.json', 'utf-8');
    const products = JSON.parse(raw);

    // clear existing products
    await Product.deleteMany({});

    // filter out invalid entries and normalize
    const prepared = products
      .filter(p => p && p.title && typeof p.price === 'number')
      .map(p => {
        // ensure required id field exists
        if (!p.id) {
          p.id = Date.now();
        }
        return {
          ...p,
          image: mapImage(p.image),
        };
      });

    await Product.insertMany(prepared);
    console.log(`Seeded ${prepared.length} products`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding products', err);
    process.exit(1);
  }
}

(async () => {
  await connect();
  await seed();
})();