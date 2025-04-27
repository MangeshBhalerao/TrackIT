import { NextResponse } from 'next/server';
import { deleteFoodEntry } from '@/lib/fitness-db';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Food entry ID is required' },
        { status: 400 }
      );
    }

    await deleteFoodEntry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting food entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete food entry' },
      { status: 500 }
    );
  }
} 