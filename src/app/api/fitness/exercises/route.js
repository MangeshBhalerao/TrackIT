import { NextResponse } from 'next/server';
import { getExercises } from '@/lib/fitness-db';

export async function GET() {
  try {
    const exercises = await getExercises();
    return NextResponse.json(exercises);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 