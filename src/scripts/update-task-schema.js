// @ts-check
import { neon } from '@neondatabase/serverless';

// TEMPORARY: Hardcoded connection string (same as in db.js)
const DATABASE_URL = "postgres://neondb_owner:npg_qdjbmX87nwFU@ep-green-waterfall-a18kff2e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

// Initialize the Neon client
const sql = neon(DATABASE_URL);

/**
 * Updates the tasks table to add reminder tracking fields
 */
async function updateTaskSchema() {
  try {
    console.log('Updating task schema to support reminder functionality...');
    
    // Check if the due_date column exists (required for reminders)
    const checkDueDate = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' AND column_name = 'due_date'
    `;
    
    if (checkDueDate.length === 0) {
      console.log('Adding due_date column to tasks table...');
      // Add due_date and due_time columns if they don't exist
      await sql`
        ALTER TABLE tasks
        ADD COLUMN due_date DATE,
        ADD COLUMN due_time VARCHAR(5),
        ADD COLUMN is_all_day BOOLEAN DEFAULT FALSE
      `;
      console.log('Added date/time columns to tasks table');
    }
    
    // Check if reminder_sent column already exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' AND column_name = 'reminder_sent'
    `;
    
    if (checkColumn.length === 0) {
      console.log('Adding reminder_sent column to tasks table...');
      
      // Add the reminder_sent column if it doesn't exist
      await sql`
        ALTER TABLE tasks
        ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE
      `;
      
      console.log('Successfully added reminder_sent column to tasks table');
    } else {
      console.log('reminder_sent column already exists in tasks table');
    }
    
    console.log('Task schema update completed successfully');
  } catch (error) {
    console.error('Error updating task schema:', error);
  }
}

// Run the update
updateTaskSchema(); 