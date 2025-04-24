import fs from 'fs';
import path from 'path';

// TEMPORARY: Hardcoded connection string to bypass .env loading issues
const DATABASE_URL = "postgres://neondb_owner:npg_qdjbmX87nwFU@ep-green-waterfall-a18kff2e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

// DEBUG: print the connection string
console.log('DEBUG: Using hardcoded DATABASE_URL');

import { neon } from '@neondatabase/serverless';

// Initialize the Neon client with hardcoded URL
const sql = neon(DATABASE_URL);

// Initialize database tables
export async function initDB() {
  try {
    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Task operations
export async function createTask(title, description) {
  const result = await sql`
    INSERT INTO tasks (title, description)
    VALUES (${title}, ${description})
    RETURNING *;
  `;
  return result[0];
}

export async function getTasks() {
  const result = await sql`
    SELECT * FROM tasks 
    ORDER BY created_at DESC;
  `;
  return result;
}

export async function deleteTask(taskId) {
  const result = await sql`
    DELETE FROM tasks
    WHERE id = ${taskId}
    RETURNING *;
  `;
  return result[0];
}

export async function updateTaskStatus(taskId, status) {
  const result = await sql`
    UPDATE tasks
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${taskId}
    RETURNING *;
  `;
  return result[0];
} 