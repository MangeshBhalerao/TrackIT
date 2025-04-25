// @ts-check
import { initDB } from '../lib/db.js';

async function main() {
  try {
    console.log('Initializing database...');
    await initDB();
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

main(); 