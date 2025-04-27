// @ts-check
import { neon } from '@neondatabase/serverless';

// TEMPORARY: Hardcoded connection string to bypass .env loading issues
const DATABASE_URL = "postgres://neondb_owner:npg_qdjbmX87nwFU@ep-green-waterfall-a18kff2e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

async function updateProfileSchema() {
  try {
    console.log('Adding new columns to user_profiles table...');
    
    // Check if the columns already exist to prevent errors
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      AND (column_name = 'target_weight' OR column_name = 'time_frame' OR column_name = 'weight_change_rate');
    `;
    
    const existingColumns = columns.map(c => c.column_name);
    
    // Add target_weight column if it doesn't exist
    if (!existingColumns.includes('target_weight')) {
      await sql`ALTER TABLE user_profiles ADD COLUMN target_weight FLOAT;`;
      console.log('Added target_weight column');
    } else {
      console.log('target_weight column already exists');
    }
    
    // Add time_frame column if it doesn't exist
    if (!existingColumns.includes('time_frame')) {
      await sql`ALTER TABLE user_profiles ADD COLUMN time_frame INTEGER;`;
      console.log('Added time_frame column');
    } else {
      console.log('time_frame column already exists');
    }
    
    // Add weight_change_rate column if it doesn't exist
    if (!existingColumns.includes('weight_change_rate')) {
      await sql`ALTER TABLE user_profiles ADD COLUMN weight_change_rate FLOAT;`;
      console.log('Added weight_change_rate column');
    } else {
      console.log('weight_change_rate column already exists');
    }
    
    console.log('Database schema updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to update database schema:', error);
    process.exit(1);
  }
}

updateProfileSchema(); 