// @ts-check
import cron from 'node-cron';
import { neon } from '@neondatabase/serverless';
import { formatDistanceToNow } from 'date-fns';
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
 * Send a reminder email for a specific task
 * @param {Object} task - The task object with details
 * @returns {Promise<boolean>} - True if email sent successfully
 */
async function sendReminderEmail(task) {
  try {
    console.log(`Sending reminder email for task "${task.title}" to ${task.email}`);
    
    const dueDateTime = new Date(task.due_date);
    if (task.due_time) {
      const [hours, minutes] = task.due_time.split(':');
      dueDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    }
    
    const formattedTime = dueDateTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    const formattedDate = dueDateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    
    const info = await transporter.sendMail({
      from: '"TrackIT Reminder" <trackitreminder@gmail.com>',
      to: task.email,
      subject: `Reminder: ${task.title}`,
      text: `This is a reminder for your task "${task.title}" scheduled for ${formattedTime} on ${formattedDate}.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">🔔 Task Reminder</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">This is a reminder for your upcoming task:</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1e3a8a;">${task.title}</h3>
            <p style="margin-bottom: 5px;"><strong>When:</strong> ${formattedTime} on ${formattedDate}</p>
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

    console.log('Reminder email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
}

/**
 * Check for upcoming tasks and send reminders
 */
async function checkAndSendReminders() {
  try {
    console.log('Checking for tasks needing reminders...');
    
    // Get current time
    const now = new Date();
    
    // Time window for checking reminders (next 30 minutes)
    const thirtyMinutesLater = new Date(now);
    thirtyMinutesLater.setMinutes(now.getMinutes() + 30);
    
    // Format dates for SQL query
    const nowDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const nowTime = now.toTimeString().substring(0, 5); // HH:MM
    const laterTime = thirtyMinutesLater.toTimeString().substring(0, 5); // HH:MM
    
    console.log(`Looking for tasks between ${nowTime} and ${laterTime} on ${nowDate}`);
    
    // Get tasks due in the next 30 minutes that haven't had reminders sent
    // Note: This SQL handles tasks due today with times in the next 30 minutes
    const tasks = await sql`
      SELECT t.*, p.email 
      FROM tasks t
      JOIN task_preferences p ON t.user_id = p.id
      WHERE t.due_date = ${nowDate}
      AND t.due_time BETWEEN ${nowTime} AND ${laterTime}
      AND t.reminder_sent = FALSE
      AND p.enable_reminders = TRUE
      AND p.email IS NOT NULL
    `;
    
    console.log(`Found ${tasks.length} tasks needing reminders`);
    
    // Send reminders for each task
    for (const task of tasks) {
      const sent = await sendReminderEmail(task);
      
      if (sent) {
        // Update task to mark reminder as sent
        await sql`
          UPDATE tasks
          SET reminder_sent = TRUE
          WHERE id = ${task.id}
        `;
        console.log(`Marked task ${task.id} as reminded`);
      }
    }
  } catch (error) {
    console.error('Error checking for reminders:', error);
  }
}

/**
 * Start the reminder scheduler
 */
export function startReminderScheduler() {
  // Verify email configuration
  transporter.verify()
    .then(() => console.log('Email connection verified'))
    .catch(err => console.error('Email verification failed:', err));
  
  // Schedule to run every 5 minutes
  const job = cron.schedule('* * * * *', () => {
    console.log(`Running reminder check at ${new Date().toISOString()}`);
    checkAndSendReminders();
  });
  
  console.log('Reminder scheduler started');
  
  // Also run immediately on startup
  console.log('Running initial reminder check...');
  checkAndSendReminders();
  
  return job;
}

// If this file is executed directly, start the scheduler
if (typeof require !== 'undefined' && require.main === module) {
  startReminderScheduler();
} 