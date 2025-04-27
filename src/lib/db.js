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

    // Create task_preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS task_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255),
        enable_reminders BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
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

    // Drop existing documents table if it exists
    await sql`DROP TABLE IF EXISTS documents;`;

    // Create documents table with correct column names
    await sql`
      CREATE TABLE documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        file_url VARCHAR(1000) NOT NULL,
        file_type VARCHAR(50),
        file_size BIGINT,
        public_id VARCHAR(255),
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
export async function createTask(title, description, userId, dueDate, dueTime, isAllDay = false) {
  const result = await sql`
    INSERT INTO tasks (title, description, user_id, due_date, due_time, is_all_day)
    VALUES (${title}, ${description}, ${userId}, ${dueDate}, ${dueTime}, ${isAllDay})
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
export async function createDocument({ title, category, file_url, file_type, file_size, public_id }) {
  console.log('Creating document with:', { title, category, file_url, file_type, file_size, public_id });
  try {
    const result = await sql`
      INSERT INTO documents (
        title,
        category,
        file_url,
        file_type,
        file_size,
        public_id,
        created_at,
        updated_at
      )
      VALUES (
        ${title},
        ${category},
        ${file_url},
        ${file_type},
        ${file_size},
        ${public_id},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING *;
    `;
    console.log('Document created:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

export async function getDocuments() {
  const result = await sql`
    SELECT * FROM documents 
    ORDER BY created_at DESC;
  `;
  return result;
}

export async function getDocumentById(id) {
  const result = await sql`
    SELECT * FROM documents
    WHERE id = ${id}
    LIMIT 1;
  `;
  return result[0];
}

export async function deleteDocument(id) {
  const result = await sql`
    DELETE FROM documents
    WHERE id = ${id}
    RETURNING *;
  `;
  return result[0];
}

// Task preferences operations
export async function getTaskPreferences(userId) {
  const result = await sql`
    SELECT * FROM task_preferences 
    WHERE user_id = ${userId};
  `;
  return result[0] || null;
}

export async function saveTaskPreferences(userId, preferences) {
  const { email, enableReminders } = preferences;
  
  const result = await sql`
    INSERT INTO task_preferences (
      user_id, email, enable_reminders, updated_at
    )
    VALUES (
      ${userId}, ${email}, ${enableReminders !== false}, CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      email = ${email},
      enable_reminders = ${enableReminders !== false},
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  return result[0];
} 