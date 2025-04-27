// @ts-check
import { neon } from '@neondatabase/serverless';

// TEMPORARY: Hardcoded connection string (same as in db.js)
const DATABASE_URL = "postgres://neondb_owner:npg_qdjbmX87nwFU@ep-green-waterfall-a18kff2e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

// Initialize the Neon client
const sql = neon(DATABASE_URL);

/**
 * Creates a test task scheduled a few minutes from now
 */
async function createTestTask() {
  try {
    console.log('Creating a test task for reminder testing...');
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Calculate a time a few minutes from now
    const futureTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in the future
    const timeStr = futureTime.toTimeString().substring(0, 5); // HH:MM
    
    console.log(`Creating task for ${todayStr} at ${timeStr} (10 minutes from now)`);
    
    // Ensure there's a preference row with an email
    let prefId;
    const prefs = await sql`SELECT id FROM task_preferences LIMIT 1`;
    
    if (prefs.length === 0) {
      // Create a preference row
      const newPref = await sql`
        INSERT INTO task_preferences (email, enable_reminders)
        VALUES ('mangeshbhalerao523@gmail.com', TRUE)
        RETURNING id
      `;
      prefId = newPref[0].id;
      console.log('Created new task preferences');
    } else {
      // Update existing preference
      await sql`
        UPDATE task_preferences
        SET email = 'mangeshbhalerao523@gmail.com',
            enable_reminders = TRUE
        WHERE id = ${prefs[0].id}
      `;
      prefId = prefs[0].id;
      console.log('Updated task preferences');
    }
    
    // Create the test task
    const task = await sql`
      INSERT INTO tasks (
        title, 
        description, 
        user_id,
        due_date, 
        due_time, 
        is_all_day,
        reminder_sent
      )
      VALUES (
        'Reminder Test Task', 
        'This task was created to test the reminder system. You should receive a reminder 30 minutes before this task is due.',
        ${prefId},
        ${todayStr},
        ${timeStr},
        FALSE,
        FALSE
      )
      RETURNING *
    `;
    
    console.log('Created test task:', task[0]);
    console.log(`Task ID: ${task[0].id}, Title: ${task[0].title}`);
    console.log(`Due: ${task[0].due_date} at ${task[0].due_time}`);
    console.log('\nYou should receive a reminder email approximately 30 minutes before this task is due.');
    console.log(`Expected reminder time: Around ${new Date(Date.now() + 7 * 60 * 1000).toTimeString().substring(0, 5)} (7-8 minutes from now)`);
    
  } catch (error) {
    console.error('Error creating test task:', error);
  }
}

// Run the function
createTestTask(); 