// @ts-check
import { initFitnessDB } from '../lib/fitness-db.js';

async function main() {
  try {
    await initFitnessDB();
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

main(); 