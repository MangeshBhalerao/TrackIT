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
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        picture VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create tasks table with user_id
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create fitness_activities table
    await sql`
      CREATE TABLE IF NOT EXISTS fitness_activities (
        id SERIAL PRIMARY KEY,
        activity_type VARCHAR(100) NOT NULL,
        duration INTEGER,
        calories_burned INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create documents table
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        category VARCHAR(100),
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

// User operations
export async function createUser(googleId, email, name, picture) {
  const result = await sql`
    INSERT INTO users (google_id, email, name, picture)
    VALUES (${googleId}, ${email}, ${name}, ${picture})
    ON CONFLICT (google_id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        picture = EXCLUDED.picture
    RETURNING *;
  `;
  return result[0];
}

export async function getUserByGoogleId(googleId) {
  const result = await sql`
    SELECT * FROM users WHERE google_id = ${googleId};
  `;
  return result[0];
}

// Modified task operations to include user_id
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

// Fitness activities CRUD operations
export async function createFitnessActivity(activityType, duration, caloriesBurned, notes) {
  const result = await sql`
    INSERT INTO fitness_activities (activity_type, duration, calories_burned, notes)
    VALUES (${activityType}, ${duration}, ${caloriesBurned}, ${notes})
    RETURNING *;
  `;
  return result[0];
}

export async function getFitnessActivities() {
  const result = await sql`SELECT * FROM fitness_activities ORDER BY created_at DESC;`;
  return result;
}

// Documents CRUD operations
export async function createDocument(title, content, category) {
  const result = await sql`
    INSERT INTO documents (title, content, category)
    VALUES (${title}, ${content}, ${category})
    RETURNING *;
  `;
  return result[0];
}

export async function getDocuments() {
  const result = await sql`SELECT * FROM documents ORDER BY created_at DESC;`;
  return result;
} 