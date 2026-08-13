import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ngl-tournament',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-key-change-me',
  nodeEnv: process.env.NODE_ENV || 'development',
};
