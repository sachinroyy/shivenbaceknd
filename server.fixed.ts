import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 1. Load environment variables first
const envPath = path.join(process.cwd(), 'local.env');
console.log('Loading environment from:', envPath);

// Check if file exists
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: local.env not found at:', envPath);
  console.log('Current directory:', process.cwd());
  console.log('Directory contents:', fs.readdirSync(process.cwd()));
  process.exit(1);
}

// Load the environment file
dotenv.config({ path: envPath });

// Verify MONGO_URI is loaded
if (!process.env.MONGO_URI) {
  console.error('❌ Error: MONGO_URI not found in environment variables');
  console.log('Available environment variables:', Object.keys(process.env).join(', '));
  process.exit(1);
}

console.log('✅ Environment loaded successfully');
console.log('MONGO_URI starts with:', process.env.MONGO_URI.substring(0, 20) + '...');

// Now import the rest of the application
import('./src/server').catch(console.error);
