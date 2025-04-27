import { NextResponse } from 'next/server';
import { createOrUpdateUserProfile, getUserProfile } from '@/lib/fitness-db';

// Helper function to calculate BMR using Mifflin-St Jeor formula
function calculateBMR(age, gender, weight, height) {
  // Weight in kg, height in cm
  if (gender.toLowerCase() === 'male') {
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
  } else {
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
  }
}

// Helper function to calculate daily calorie goal
function calculateDailyCalorieGoal(bmr, activityLevel, goal) {
  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,         // Light exercise 1-3 days/week
    moderate: 1.55,       // Moderate exercise 3-5 days/week
    active: 1.725,        // Hard exercise 6-7 days/week
    very_active: 1.9      // Very hard exercise & physical job or training twice a day
  };
  
  // Calculate TDEE (Total Daily Energy Expenditure)
  const tdee = Math.round(bmr * activityMultipliers[activityLevel]);
  
  // Apply goal modifier
  switch (goal) {
    case 'lose':
      return Math.round(tdee * 0.8); // 20% deficit for weight loss
    case 'gain':
      return Math.round(tdee * 1.15); // 15% surplus for weight gain
    case 'maintain':
    default:
      return tdee;
  }
}

export async function POST(request) {
  try {
    const { userId, profileData } = await request.json();
    
    console.log('Received profile data:', JSON.stringify({ userId, profileData }));
    
    if (!userId) {
      console.error('Missing userId in request');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const { age, gender, height, weight, activityLevel, goal } = profileData;
    
    // Validate required fields
    if (!age || !gender || !height || !weight || !activityLevel || !goal) {
      console.error('Missing required profile fields', profileData);
      return NextResponse.json({ error: 'All profile fields are required' }, { status: 400 });
    }
    
    // Calculate BMR
    const bmr = calculateBMR(age, gender, weight, height);
    console.log('Calculated BMR:', bmr);
    
    // Calculate daily calorie goal
    const dailyCalorieGoal = calculateDailyCalorieGoal(bmr, activityLevel, goal);
    console.log('Calculated daily calorie goal:', dailyCalorieGoal);
    
    // Save profile with calculated calorie goal
    try {
      const profile = await createOrUpdateUserProfile(userId, {
        ...profileData,
        dailyCalorieGoal
      });
      
      console.log('Profile saved successfully:', profile);
      return NextResponse.json(profile);
    } catch (dbError) {
      console.error('Database error saving profile:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing profile request:', error);
    return NextResponse.json(
      { error: `Failed to save user profile: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const profile = await getUserProfile(userId);
    return NextResponse.json(profile || { exists: false });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 