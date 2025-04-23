import { config } from 'dotenv';
// Load environment variables from .env.local
config({ path: '.env.local' });

// Import the database initializer
import { initDB } from '../lib/db.js';

async function setup() {
  try {
    console.log('Initializing database...');
    await initDB();
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setup(); 