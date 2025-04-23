import { NextResponse } from 'next/server';

// Mock database for now (replace with real DB later)
let workouts = [];
let fitnessStats = {
  calories: 0,
  steps: 0,
  activeMinutes: 0,
  waterIntake: 0,
  heartRate: 0
};
let bodyMeasurements = {
  weight: [],
  chest: [],
  waist: [],
  hips: [],
  arms: [],
  legs: []
};

// GET /api/fitness - Get all fitness data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    // Return specific data based on type
    switch (type) {
      case 'workouts':
        return NextResponse.json(workouts, { status: 200 });
      case 'stats':
        return NextResponse.json(fitnessStats, { status: 200 });
      case 'measurements':
        return NextResponse.json(bodyMeasurements, { status: 200 });
      default:
        // Return all data
        return NextResponse.json({
          workouts,
          stats: fitnessStats,
          measurements: bodyMeasurements
        }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch fitness data' },
      { status: 500 }
    );
  }
}

// POST /api/fitness - Add new fitness data
export async function POST(request) {
  try {
    const body = await request.json();
    const { type } = body;
    
    if (!type) {
      return NextResponse.json(
        { error: 'Type is required (workouts, stats, or measurements)' },
        { status: 400 }
      );
    }
    
    switch (type) {
      case 'workout':
        // Validate workout data
        if (!body.name || !body.duration) {
          return NextResponse.json(
            { error: 'Workout name and duration are required' },
            { status: 400 }
          );
        }
        
        // Create new workout
        const newWorkout = {
          id: Date.now().toString(),
          name: body.name,
          type: body.type || 'Other',
          duration: body.duration,
          calories: body.calories || 0,
          exercises: body.exercises || [],
          date: body.date || new Date().toISOString(),
          ...body
        };
        
        workouts.push(newWorkout);
        return NextResponse.json(newWorkout, { status: 201 });
        
      case 'stats':
        // Update fitness stats
        fitnessStats = {
          ...fitnessStats,
          ...body.stats
        };
        return NextResponse.json(fitnessStats, { status: 200 });
        
      case 'measurement':
        // Add new measurement
        if (!body.value || !body.part) {
          return NextResponse.json(
            { error: 'Measurement value and body part are required' },
            { status: 400 }
          );
        }
        
        const newMeasurement = {
          value: body.value,
          date: body.date || new Date().toISOString()
        };
        
        // Add to appropriate measurement array
        if (bodyMeasurements[body.part]) {
          bodyMeasurements[body.part].push(newMeasurement);
        } else {
          bodyMeasurements[body.part] = [newMeasurement];
        }
        
        return NextResponse.json(newMeasurement, { status: 201 });
        
      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be workout, stats, or measurement' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add fitness data' },
      { status: 500 }
    );
  }
}

// PUT /api/fitness - Update fitness data
export async function PUT(request) {
  try {
    const body = await request.json();
    
    if (!body.type || !body.id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      );
    }
    
    if (body.type === 'workout') {
      // Find and update workout
      const workoutIndex = workouts.findIndex(w => w.id === body.id);
      
      if (workoutIndex === -1) {
        return NextResponse.json(
          { error: 'Workout not found' },
          { status: 404 }
        );
      }
      
      workouts[workoutIndex] = { ...workouts[workoutIndex], ...body };
      return NextResponse.json(workouts[workoutIndex], { status: 200 });
    }
    
    return NextResponse.json(
      { error: 'Invalid type or operation' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update fitness data' },
      { status: 500 }
    );
  }
}

// DELETE /api/fitness?type=workout&id=123 - Delete fitness data
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      );
    }
    
    if (type === 'workout') {
      const initialLength = workouts.length;
      workouts = workouts.filter(workout => workout.id !== id);
      
      if (workouts.length === initialLength) {
        return NextResponse.json(
          { error: 'Workout not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { message: 'Workout deleted successfully' },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { error: 'Invalid type or operation' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete fitness data' },
      { status: 500 }
    );
  }
} 