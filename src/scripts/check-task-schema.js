// @ts-check
import { neon } from '@neondatabase/serverless';

// TEMPORARY: Hardcoded connection string (same as in db.js)
const DATABASE_URL = "postgres://neondb_owner:npg_qdjbmX87nwFU@ep-green-waterfall-a18kff2e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

// Initialize the Neon client
const sql = neon(DATABASE_URL);

/**
 * Check the tasks table schema
 */
async function checkTaskSchema() {
  try {
    console.log('Checking task table schema...');
    
    // Get column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tasks'
      ORDER BY ordinal_position;
    `;
    
    console.log('Tasks table columns:');
    console.table(columns);
    
    // Get task_preferences table information
    const prefColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'task_preferences'
      ORDER BY ordinal_position;
    `;
    
    console.log('Task preferences table columns:');
    console.table(prefColumns);
    
    // Check if the updated user_id column exists in the tasks table
    const hasUserId = columns.some(col => col.column_name === 'user_id');
    
    if (!hasUserId) {
      console.log('The user_id column is missing from the tasks table');
      console.log('Attempting to add it...');
      
      try {
        await sql`
          ALTER TABLE tasks
          ADD COLUMN user_id INTEGER;
        `;
        console.log('Successfully added user_id column to tasks table');
      } catch (alterError) {
        console.error('Error adding user_id column:', alterError);
      }
    }
    
    console.log('Schema check completed');
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

// Run the check
checkTaskSchema(); 