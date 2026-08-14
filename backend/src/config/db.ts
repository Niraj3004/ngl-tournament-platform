import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async () => {
  try {
    let uri = env.mongoUri;
    if (!uri.includes('retryWrites=')) {
      uri += uri.includes('?') ? '&retryWrites=false' : '?retryWrites=false';
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
