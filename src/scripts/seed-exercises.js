import { neon } from '@neondatabase/serverless';

const DATABASE_URL = "postgres://neondb_owner:npg_qdjbmX87nwFU@ep-green-waterfall-a18kff2e-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

const exercises = [
  { name: "Push-Up", type: "Strength", muscle_group: "Chest", equipment: "Bodyweight", calories_per_rep: 0.5, calories_per_minute: null },
  { name: "Squat", type: "Strength", muscle_group: "Legs", equipment: "Bodyweight", calories_per_rep: 0.6, calories_per_minute: null },
  { name: "Bench Press", type: "Strength", muscle_group: "Chest", equipment: "Barbell", calories_per_rep: 0.8, calories_per_minute: null },
  { name: "Deadlift", type: "Strength", muscle_group: "Back", equipment: "Barbell", calories_per_rep: 1.0, calories_per_minute: null },
  { name: "Bicep Curl", type: "Strength", muscle_group: "Arms", equipment: "Dumbbell", calories_per_rep: 0.3, calories_per_minute: null },
  { name: "Running", type: "Cardio", muscle_group: "Full Body", equipment: "None", calories_per_rep: null, calories_per_minute: 10 },
  { name: "Cycling", type: "Cardio", muscle_group: "Legs", equipment: "Bicycle", calories_per_rep: null, calories_per_minute: 8 },
  { name: "Jump Rope", type: "Cardio", muscle_group: "Full Body", equipment: "Jump Rope", calories_per_rep: null, calories_per_minute: 12 },
  { name: "Plank", type: "Core", muscle_group: "Abs", equipment: "Bodyweight", calories_per_rep: null, calories_per_minute: 4 },
  { name: "Pull-Up", type: "Strength", muscle_group: "Back", equipment: "Pull-Up Bar", calories_per_rep: 0.7, calories_per_minute: null },
  { name: "Lunges", type: "Strength", muscle_group: "Legs", equipment: "Bodyweight", calories_per_rep: 0.4, calories_per_minute: null },
  { name: "Burpees", type: "Cardio", muscle_group: "Full Body", equipment: "Bodyweight", calories_per_rep: null, calories_per_minute: 14 },
  { name: "Mountain Climbers", type: "Cardio", muscle_group: "Core", equipment: "Bodyweight", calories_per_rep: null, calories_per_minute: 10 },
  { name: "Tricep Dips", type: "Strength", muscle_group: "Arms", equipment: "Bench/Chair", calories_per_rep: 0.4, calories_per_minute: null },
  { name: "Shoulder Press", type: "Strength", muscle_group: "Shoulders", equipment: "Dumbbell", calories_per_rep: 0.5, calories_per_minute: null }
];

async function seedExercises() {
  await sql`
    CREATE TABLE IF NOT EXISTS exercises (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100),
      muscle_group VARCHAR(100),
      equipment VARCHAR(100),
      calories_per_rep DECIMAL(4,2),
      calories_per_minute DECIMAL(4,2)
    );
  `;

  for (const ex of exercises) {
    await sql`
      INSERT INTO exercises (name, type, muscle_group, equipment, calories_per_rep, calories_per_minute)
      VALUES (${ex.name}, ${ex.type}, ${ex.muscle_group}, ${ex.equipment}, ${ex.calories_per_rep}, ${ex.calories_per_minute})
      ON CONFLICT (name) DO NOTHING;
    `;
  }

  console.log('Exercises seeded!');
  process.exit(0);
}

seedExercises().catch(e => {
  console.error(e);
  process.exit(1);
});