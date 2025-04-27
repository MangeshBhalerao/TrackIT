import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { startReminderScheduler } from '@/scripts/reminderScheduler';

// Start the scheduler (it will only initialize once)
let schedulerStarted = false;
function initializeScheduler() {
  if (!schedulerStarted && typeof window === 'undefined') {
    console.log('Initializing task reminder scheduler...');
    try {
      startReminderScheduler();
      schedulerStarted = true;
      console.log('Reminder scheduler started successfully');
    } catch (error) {
      console.error('Failed to start reminder scheduler:', error);
    }
  }
}

// Initialize when this module is loaded
initializeScheduler();

export async function GET() {
  try {
    const tasks = await db.getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, description, userId = 1, dueDate, dueTime, isAllDay = false } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newTask = await db.createTask(
      title,
      description,
      userId,
      dueDate || null,
      dueTime || null,
      isAllDay
    );
    
    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 