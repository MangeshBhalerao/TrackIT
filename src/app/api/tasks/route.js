import { NextResponse } from 'next/server';

// Mock database for now (replace with real DB later)
let tasks = [];

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Create new task with unique ID
    const newTask = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description || '',
      dueDate: body.dueDate || null,
      completed: body.completed || false,
      priority: body.priority || 'medium',
      createdAt: new Date().toISOString(),
      ...body
    };
    
    // Add to "database"
    tasks.push(newTask);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks - Update a task
export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    // Find and update task
    const taskIndex = tasks.findIndex(task => task.id === body.id);
    
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...body };
    
    return NextResponse.json(tasks[taskIndex], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks?id=123 - Delete a task
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    const initialLength = tasks.length;
    tasks = tasks.filter(task => task.id !== id);
    
    if (tasks.length === initialLength) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 