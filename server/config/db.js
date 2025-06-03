import mongoose from 'mongoose';
import 'dotenv/config';
const MONGO_URI = process.env.MONGO_URI 

export const connectDB = async () => {
  await mongoose
    .connect(
      MONGO_URI
    )
    .then(() => console.log('Db connected'));
};
