import { NextResponse } from 'next/server';
import { addMinutes, parseISO, format, subMinutes } from 'date-fns';

// This function handles scheduling email reminders for tasks
export async function POST(request) {
  try {
    const { taskId, email, taskTitle, dueDate, dueTime, isAllDay } = await request.json();

    // Validate required fields
    if (!taskId || !email || !taskTitle || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If task is all-day, we'll set a reminder for 9:00 AM
    let taskDateTime;
    if (isAllDay) {
      const dateObj = new Date(dueDate);
      dateObj.setHours(9, 0, 0, 0); // Set to 9:00 AM
      taskDateTime = dateObj;
    } else {
      // Combine date and time
      const dateObj = new Date(dueDate);
      const [hours, minutes] = dueTime.split(':').map(Number);
      dateObj.setHours(hours, minutes, 0, 0);
      taskDateTime = dateObj;
    }

    // Calculate reminder time (30 minutes before task)
    const reminderTime = subMinutes(taskDateTime, 30);
    
    // Check if reminder time is in the past
    if (reminderTime < new Date()) {
      return NextResponse.json({ 
        message: 'Reminder time is in the past, reminder will not be sent',
        status: 'skipped'
      });
    }

    // In a production application, you would:
    // 1. Store the reminder in a database table
    // 2. Set up a background job/cron to send emails at the appropriate time
    // 3. Use an email service like SendGrid, Amazon SES, etc.
    
    console.log('Scheduling reminder:', {
      taskId,
      email,
      taskTitle,
      taskDateTime: format(taskDateTime, 'yyyy-MM-dd HH:mm:ss'),
      reminderTime: format(reminderTime, 'yyyy-MM-dd HH:mm:ss')
    });

    // For now, we'll just return success
    return NextResponse.json({ 
      message: 'Reminder scheduled successfully',
      taskId,
      reminderTime: format(reminderTime, 'yyyy-MM-dd HH:mm:ss')
    });
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 