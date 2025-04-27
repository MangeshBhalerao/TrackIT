import { NextResponse } from 'next/server';
import { createWorkout, getWorkouts } from '@/lib/fitness-db';

export async function POST(request) {
  try {
    const { userId, workoutData } = await request.json();
    const workout = await createWorkout(userId, workoutData);
    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    );
  }
}

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

    const workouts = await getWorkouts(userId);
    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
} 