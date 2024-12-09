// config/env.ts
import dotenv from 'dotenv';

// Environment detection
const isProd = process.env.NODE_ENV === 'production';

// Load appropriate env file
const envFile = isProd ? '.env.prod' : '.env';

dotenv.config({ path: envFile });

// Configuration object
export const config = {
  API_URL: isProd 
    ? process.env.PROD_API_URL || 'https://backend.popsita.com' 
    : process.env.DEV_API_URL || 'http://localhost:8000',
  // Add other environment variables here
};
