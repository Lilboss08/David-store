import './config.js';

import express from 'express';
import cors from 'cors';
import productRouter from './routes/product Routes.js'
import transactionRouter from './routes/transactionRoutes.js'
import locationRouter from './routes/locationRoutes.js';
import mongoose from 'mongoose';
import { User } from './schemas/userSchema.js';
import userRouter from './routes/userRouter.js';
import reviewRouter from './routes/reviewRoutes.js';
import morgan from 'morgan';

const app = express();
app.use(morgan('combined'))
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors('*'));
app.use("/api/v1/user", userRouter);
app.use(productRouter)
app.use(transactionRouter)
app.use(reviewRouter)
app.use(locationRouter);



// creating an express server
const PORT = process.env.PORT || 5000;

const MONGODB_URL = process.env.MONGODB_URL;

mongoose.connect(MONGODB_URL)
.then(async (conn)=>{
    console.log(`database connected successfully to ${conn.connection.host}`);

    // Debug: print and clean up indexes on the users collection
    try {
      const indexes = await User.collection.getIndexes({ full: true });
      console.log('User collection indexes:', indexes);

      // If a legacy unique index on phoneNumber exists (and we no longer store it), remove it.
      const phoneIndex = indexes.find(i => i.name === 'phoneNumber_1');
      if (phoneIndex) {
        console.log('Dropping legacy phoneNumber_1 index to avoid duplicate-null errors');
        await User.collection.dropIndex('phoneNumber_1');
        const newIndexes = await User.collection.getIndexes({ full: true });
        console.log('Updated user indexes:', newIndexes);
      }
    } catch (idxErr) {
      console.error('Could not get or update user indexes:', idxErr);
    }
}).catch((err)=>{
    console.log(`could not connect to the mongodb, Error: ${err}`);
});

app.listen(PORT, ()=>{
    console.log(`server running on port: ${PORT}`)

})