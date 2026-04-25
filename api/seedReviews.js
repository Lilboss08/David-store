import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from './schemas/reviewSchema.js';

dotenv.config({ path: './config.env' });

async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to DB for seeding reviews');
  } catch (err) {
    console.error('DB connection error', err);
    process.exit(1);
  }
}

async function seed() {
  try {
    const raw = fs.readFileSync('reviews.json', 'utf-8');
    const reviews = JSON.parse(raw);

    // clear existing reviews
    await Review.deleteMany({});

    // filter out invalid entries
    const prepared = reviews.filter(r => 
      r && 
      r.productId && 
      r.userId && 
      r.rating && 
      r.title && 
      r.comment
    );

    await Review.insertMany(prepared);
    console.log(`Seeded ${prepared.length} reviews`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding reviews', err);
    process.exit(1);
  }
}

(async () => {
  await connect();
  await seed();
})();
