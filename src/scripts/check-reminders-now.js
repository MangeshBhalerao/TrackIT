// @ts-check
import { neon } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';

// TEMPORARY: Hardcoded connection string (same as in db.js)
const DATABASE_URL = "postgres://neondb_owner:npg_qdjbmX87nwFU@ep-green-waterfall-a18kff2e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

// Initialize the Neon client
const sql = neon(DATABASE_URL);

// Create a transporter using Gmail with the successful configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: 'trackitreminder@gmail.com',
    pass: 'sgihdozzfgqlcabb'  // App Password
  }
});

/**
 * Manually set up a task for testing reminders
 */
async function setupTestTask() {
  try {
    console.log('Setting up a test task for 5:00 PM today...');
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Choose a task to update (using the first task in the list)
    const tasks = await sql`SELECT id, title FROM tasks LIMIT 1`;
    
    if (tasks.length === 0) {
      console.log('No tasks found to update.');
      return null;
    }
    
    const taskToUpdate = tasks[0];
    console.log(`Updating task "${taskToUpdate.title}" with ID ${taskToUpdate.id} for 5:00 PM reminder`);
    
    // Update the task with today's date and 5:00 PM time
    await sql`
      UPDATE tasks
      SET due_date = ${today},
          due_time = '17:00',
          is_all_day = FALSE,
          reminder_sent = FALSE
      WHERE id = ${taskToUpdate.id}
    `;
    
    console.log('Task updated successfully');
    
    // Also ensure there's a test preference with an email
    const prefs = await sql`SELECT id FROM task_preferences LIMIT 1`;
    
    if (prefs.length === 0) {
      // Create a preference row
      await sql`
        INSERT INTO task_preferences (email, enable_reminders)
        VALUES ('mangeshbhalerao523@gmail.com', TRUE)
      `;
      console.log('Created new task preferences');
    } else {
      // Update existing preference
      await sql`
        UPDATE task_preferences
        SET email = 'mangeshbhalerao523@gmail.com',
            enable_reminders = TRUE
        WHERE id = ${prefs[0].id}
      `;
      console.log('Updated task preferences');
    }
    
    // Update the user_id in the task
    const pref = await sql`SELECT id FROM task_preferences LIMIT 1`;
    if (pref.length > 0) {
      await sql`
        UPDATE tasks
        SET user_id = ${pref[0].id}
        WHERE id = ${taskToUpdate.id}
      `;
      console.log('Linked task to user preferences');
    }
    
    // Return the updated task
    const updatedTask = await sql`
      SELECT t.*, p.email
      FROM tasks t
      JOIN task_preferences p ON t.user_id = p.id
      WHERE t.id = ${taskToUpdate.id}
    `;
    
    return updatedTask[0];
  } catch (error) {
    console.error('Error setting up test task:', error);
    return null;
  }
}

/**
 * Send a reminder email for a task
 */
async function sendReminderEmail(task) {
  try {
    console.log(`Sending reminder email for task "${task.title}" to ${task.email}`);
    
    const info = await transporter.sendMail({
      from: '"TrackIT Reminder" <trackitreminder@gmail.com>',
      to: task.email,
      subject: `Reminder: ${task.title}`,
      text: `This is a reminder for your task "${task.title}" scheduled for 5:00 PM today.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">🔔 Task Reminder</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">This is a reminder for your upcoming task:</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1e3a8a;">${task.title}</h3>
            <p style="margin-bottom: 5px;"><strong>When:</strong> 5:00 PM today (${task.due_date})</p>
            ${task.description ? `<p style="margin-bottom: 5px;"><strong>Details:</strong> ${task.description}</p>` : ''}
            <p style="margin-bottom: 0;"><strong>Status:</strong> ${task.status}</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">Log in to TrackIT to view or update this task.</p>
          
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #666; font-size: 12px;">This is an automated message from TrackIT. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });
    
    console.log('Email sent successfully:', info.messageId);
    
    // Mark the task as reminded
    await sql`
      UPDATE tasks
      SET reminder_sent = TRUE
      WHERE id = ${task.id}
    `;
    
    console.log('Task marked as reminded');
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
}

/**
 * Main function to test sending a reminder
 */
async function testReminderSystem() {
  console.log('=== TRACKIT REMINDER TEST ===');
  
  // 1. Set up a test task
  console.log('\n=== SETTING UP TEST TASK ===');
  const testTask = await setupTestTask();
  
  if (!testTask) {
    console.error('Failed to set up test task. Exiting.');
    return;
  }
  
  console.log('\nTest task configured:', testTask);
  
  // 2. Send a reminder for this task
  console.log('\n=== SENDING TEST REMINDER ===');
  await sendReminderEmail(testTask);
  
  console.log('\n=== TEST COMPLETED ===');
  console.log('Check your email for the reminder!');
}

// Run the test
testReminderSystem(); 