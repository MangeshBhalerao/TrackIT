import { NextResponse } from 'next/server';
import { getTaskPreferences, saveTaskPreferences } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const preferences = await getTaskPreferences(userId);
    return NextResponse.json(preferences || { exists: false });
  } catch (error) {
    console.error('Error fetching task preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId, preferences } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // If reminders are enabled, email is required
    if (preferences.enableReminders && !preferences.email) {
      return NextResponse.json(
        { error: 'Email is required for reminders' },
        { status: 400 }
      );
    }

    const savedPreferences = await saveTaskPreferences(userId, preferences);
    return NextResponse.json(savedPreferences);
  } catch (error) {
    console.error('Error saving task preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save task preferences' },
      { status: 500 }
    );
  }
} 