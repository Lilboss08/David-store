import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './schemas/productSchema.js';

dotenv.config({ path: './config.env' });

async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to DB for seeding frontend products');
  } catch (err) {
    console.error('DB connection error', err);
    process.exit(1);
  }
}

async function seedFrontendProducts() {
  try {
    const raw = fs.readFileSync('frontend-products.json', 'utf-8');
    const products = JSON.parse(raw);

    console.log(`Preparing to seed ${products.length} frontend products…`);

    // option 1: just insert them (may fail on duplicate id)
    // const result = await Product.insertMany(products);

    // option 2: upsert - update if exists, insert if not
    const result = await Promise.all(
      products.map(p =>
        Product.findOneAndUpdate(
          { id: p.id },
          p,
          { upsert: true, new: true }
        )
      )
    );

    console.log(`✅ Successfully seeded/updated ${result.length} frontend products`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding frontend products', err);
    process.exit(1);
  }
}

(async () => {
  await connect();
  await seedFrontendProducts();
})();
