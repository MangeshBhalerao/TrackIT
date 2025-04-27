import { neon } from '@neondatabase/serverless';

// TEMPORARY: Hardcoded connection string to bypass .env loading issues
const DATABASE_URL = "postgres://neondb_owner:npg_qdjbmX87nwFU@ep-green-waterfall-a18kff2e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

// Initialize fitness-related tables
export async function initFitnessDB() {
  try {
    // Create workout_history table (formerly workouts)
    await sql`
      CREATE TABLE IF NOT EXISTS workout_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        duration INTEGER NOT NULL,
        calories_burned INTEGER NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      );
    `;

    // Create workout_exercises table
    await sql`
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id SERIAL PRIMARY KEY,
        workout_id INTEGER REFERENCES workout_history(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        sets INTEGER,
        reps INTEGER,
        duration INTEGER,
        weight FLOAT,
        calories_per_rep FLOAT,
        calories_per_minute FLOAT,
        total_calories INTEGER,
        type VARCHAR(100)
      );
    `;

    // Create food_entries table
    await sql`
      CREATE TABLE IF NOT EXISTS food_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        serving_size FLOAT NOT NULL,
        calories INTEGER NOT NULL,
        protein FLOAT,
        carbs FLOAT,
        fat FLOAT,
        spoonacular_id INTEGER,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create daily_stats table
    await sql`
      CREATE TABLE IF NOT EXISTS daily_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        total_calories_consumed INTEGER DEFAULT 0,
        total_calories_burned INTEGER DEFAULT 0,
        net_calories INTEGER DEFAULT 0,
        water_intake FLOAT DEFAULT 0,
        steps INTEGER DEFAULT 0,
        UNIQUE(user_id, date)
      );
    `;

    // Create user_profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        age INTEGER,
        gender VARCHAR(10),
        height FLOAT,
        weight FLOAT,
        activity_level VARCHAR(20),
        goal VARCHAR(20),
        daily_calorie_goal INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `;

    console.log('Fitness database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing fitness database:', error);
    throw error;
  }
}

// Workout operations
export async function createWorkout(userId, workoutData) {
  const { name, type, duration, caloriesBurned, notes, exercises } = workoutData;
  
  const result = await sql`
    INSERT INTO workout_history (user_id, name, type, duration, calories_burned, notes)
    VALUES (${userId}, ${name}, ${type}, ${duration}, ${caloriesBurned}, ${notes})
    RETURNING *;
  `;

  const workout = result[0];

  // Insert exercises if provided
  if (exercises && exercises.length > 0) {
    for (const exercise of exercises) {
      const isCardio = exercise.type === 'Cardio';
      // Calculate total_calories if not provided
      let total_calories = exercise.total_calories;
      if (!total_calories) {
        if (isCardio) {
          total_calories = (Number(exercise.calories_per_minute || 0) * Number(exercise.duration || 0));
        } else {
          total_calories = (Number(exercise.calories_per_rep || 0) * Number(exercise.sets || 0) * Number(exercise.reps || 0));
        }
      }
      await sql`
        INSERT INTO workout_exercises (
          workout_id, name, sets, reps, duration, weight, 
          calories_per_rep, calories_per_minute, total_calories, type
        )
        VALUES (
          ${workout.id}, ${exercise.name},
          ${isCardio ? null : exercise.sets},
          ${isCardio ? null : exercise.reps},
          ${isCardio ? exercise.duration : null},
          ${exercise.weight || null},
          ${isCardio ? null : exercise.calories_per_rep},
          ${isCardio ? exercise.calories_per_minute : null},
          ${total_calories},
          ${exercise.type || null}
        );
      `;
    }
  }

  return workout;
}

export async function getWorkouts(userId) {
  const workouts = await sql`
    SELECT * FROM workout_history 
    WHERE user_id = ${userId}
    ORDER BY date DESC;
  `;

  // Get exercises for each workout
  for (const workout of workouts) {
    const exercises = await sql`
      SELECT * FROM workout_exercises
      WHERE workout_id = ${workout.id}
      ORDER BY id;
    `;
    workout.exercises = exercises;
  }

  return workouts;
}

// Food entry operations
export async function createFoodEntry(userId, foodData) {
  const { name, servingSize, calories, protein, carbs, fat, spoonacularId } = foodData;
  
  const result = await sql`
    INSERT INTO food_entries (
      user_id, name, serving_size, calories, protein, carbs, fat, spoonacular_id
    )
    VALUES (
      ${userId}, ${name}, ${servingSize}, ${calories}, 
      ${protein}, ${carbs}, ${fat}, ${spoonacularId}
    )
    RETURNING *;
  `;

  // Update daily stats
  await updateDailyStats(userId, new Date());

  return result[0];
}

export async function getFoodEntries(userId) {
  return await sql`
    SELECT * FROM food_entries 
    WHERE user_id = ${userId}
    ORDER BY date DESC;
  `;
}

export async function deleteFoodEntry(id) {
  const result = await sql`
    DELETE FROM food_entries
    WHERE id = ${id}
    RETURNING *;
  `;

  if (result.length === 0) {
    throw new Error('Food entry not found');
  }

  // Update daily stats
  await updateDailyStats(1, new Date()); // TODO: Get actual user ID

  return result[0];
}

// Daily stats operations
export async function updateDailyStats(userId, date) {
  // Get total calories consumed
  const consumedResult = await sql`
    SELECT COALESCE(SUM(calories), 0) as total
    FROM food_entries
    WHERE user_id = ${userId}
    AND DATE(date) = DATE(${date});
  `;

  // Get total calories burned
  const burnedResult = await sql`
    SELECT COALESCE(SUM(calories_burned), 0) as total
    FROM workout_history
    WHERE user_id = ${userId}
    AND DATE(date) = DATE(${date});
  `;

  const totalConsumed = consumedResult[0].total;
  const totalBurned = burnedResult[0].total;
  const netCalories = totalConsumed - totalBurned;

  // Update or insert daily stats
  await sql`
    INSERT INTO daily_stats (
      user_id, date, total_calories_consumed, 
      total_calories_burned, net_calories
    )
    VALUES (
      ${userId}, ${date}, ${totalConsumed}, 
      ${totalBurned}, ${netCalories}
    )
    ON CONFLICT (user_id, date) DO UPDATE
    SET total_calories_consumed = ${totalConsumed},
        total_calories_burned = ${totalBurned},
        net_calories = ${netCalories};
  `;
}

export async function getDailyStats(userId, startDate, endDate) {
  // Get stats for the date range
  const stats = await sql`
    SELECT * FROM daily_stats
    WHERE user_id = ${userId}
    AND date BETWEEN ${startDate} AND ${endDate}
    ORDER BY date ASC;
  `;
  
  // Get user profile for calorie goal
  const userProfile = await getUserProfile(userId);
  
  // Add calorie goal and status to each day's stats
  if (userProfile) {
    for (const day of stats) {
      day.calorie_goal = userProfile.daily_calorie_goal;
      
      // Calculate status (over/under/on target)
      const netCalories = day.net_calories;
      const goal = userProfile.daily_calorie_goal;
      
      if (netCalories > goal * 1.1) {
        day.status = 'over';
      } else if (netCalories < goal * 0.9) {
        day.status = 'under';
      } else {
        day.status = 'on_target';
      }
    }
  }
  
  return stats;
}

export async function getExercises() {
  return await sql`SELECT * FROM exercises ORDER BY name;`;
}

// User profile operations
export async function createOrUpdateUserProfile(userId, profileData) {
  const { 
    age, 
    gender, 
    height, 
    weight, 
    activityLevel, 
    goal, 
    dailyCalorieGoal 
  } = profileData;
  
  const result = await sql`
    INSERT INTO user_profiles (
      user_id, age, gender, height, weight, activity_level, goal, daily_calorie_goal, updated_at
    )
    VALUES (
      ${userId}, ${age}, ${gender}, ${height}, ${weight}, ${activityLevel}, ${goal}, ${dailyCalorieGoal}, CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      age = ${age},
      gender = ${gender},
      height = ${height},
      weight = ${weight},
      activity_level = ${activityLevel},
      goal = ${goal},
      daily_calorie_goal = ${dailyCalorieGoal},
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  return result[0];
}

export async function getUserProfile(userId) {
  const result = await sql`
    SELECT * FROM user_profiles 
    WHERE user_id = ${userId};
  `;
  return result[0] || null;
} 