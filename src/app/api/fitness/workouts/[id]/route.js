import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = "postgres://neondb_owner:npg_qdjbmX87nwFU@ep-green-waterfall-a18kff2e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 });
    }
    
    console.log(`Deleting workout with ID: ${id}`);
    
    // First delete all exercises for this workout
    await sql`DELETE FROM workout_exercises WHERE workout_id = ${id}`;
    
    // Then delete the workout itself
    const result = await sql`DELETE FROM workout_history WHERE id = ${id} RETURNING *`;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    
    console.log(`Successfully deleted workout: ${JSON.stringify(result[0])}`);
    return NextResponse.json({ success: true, deletedWorkout: result[0] });
  } catch (error) {
    console.error(`Error deleting workout: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 