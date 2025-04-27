import { NextResponse } from 'next/server';
import { getDailyStats } from '@/lib/fitness-db';
import { format } from 'date-fns';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    let startDate = searchParams.get('startDate');
    let endDate = searchParams.get('endDate');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // If dates are not provided, default to today
    if (!startDate || !endDate) {
      const today = new Date();
      startDate = format(today, 'yyyy-MM-dd');
      endDate = format(today, 'yyyy-MM-dd');
    }

    const stats = await getDailyStats(userId, startDate, endDate);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily stats' },
      { status: 500 }
    );
  }
} 