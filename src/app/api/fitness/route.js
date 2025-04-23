import { createFitnessActivity, getFitnessActivities } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const activities = await getFitnessActivities();
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { activityType, duration, caloriesBurned, notes } = await request.json();
    
    if (!activityType) {
      return NextResponse.json(
        { error: 'Activity type is required' },
        { status: 400 }
      );
    }

    const activity = await createFitnessActivity(
      activityType,
      duration,
      caloriesBurned,
      notes
    );
    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 