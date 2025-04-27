import { NextResponse } from 'next/server';
import { createFoodEntry, getFoodEntries } from '@/lib/fitness-db';

export async function POST(request) {
  try {
    const foodData = await request.json();
    
    if (!foodData.name || !foodData.servingSize || !foodData.calories) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const foodEntry = await createFoodEntry(1, foodData); // TODO: Get actual user ID
    return NextResponse.json(foodEntry);
  } catch (error) {
    console.error('Error creating food entry:', error);
    return NextResponse.json(
      { error: 'Failed to create food entry' },
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

    const foodEntries = await getFoodEntries(userId);
    return NextResponse.json(foodEntries);
  } catch (error) {
    console.error('Error fetching food entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food entries' },
      { status: 500 }
    );
  }
} 