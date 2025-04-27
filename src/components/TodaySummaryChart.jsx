import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Dumbbell, Utensils } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TodaySummaryChart() {
  const [todaysFood, setTodaysFood] = useState([]);
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get today's date
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Fetch user profile
      const profileResponse = await fetch('/api/fitness/profile?userId=1');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData && profileData.id) {
          setProfile(profileData);
        }
      }
      
      // Fetch today's food entries
      const foodResponse = await fetch(`/api/fitness/food?userId=1`);
      if (foodResponse.ok) {
        const foodData = await foodResponse.json();
        // Filter for today's entries
        const todaysEntries = foodData.filter(entry => 
          entry.date && entry.date.startsWith(today)
        );
        setTodaysFood(todaysEntries);
      }
      
      // Fetch workouts
      const workoutsResponse = await fetch('/api/fitness/workouts?userId=1');
      if (workoutsResponse.ok) {
        const workoutsData = await workoutsResponse.json();
        // Filter for today's workouts
        const todaysWorkouts = workoutsData.filter(workout => 
          workout.date && workout.date.startsWith(today)
        );
        setTodaysWorkouts(todaysWorkouts);
      }
    } catch (error) {
      console.error('Error fetching daily summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for food consumption chart
  const prepareConsumptionData = () => {
    // Get total calories consumed
    const totalCalories = todaysFood.reduce((sum, food) => sum + (food.calories || 0), 0);
    
    // Group food items by name if there are duplicates
    const foodGroups = todaysFood.reduce((groups, food) => {
      const name = food.name;
      if (!groups[name]) {
        groups[name] = {
          name,
          calories: 0,
          count: 0
        };
      }
      groups[name].calories += (food.calories || 0);
      groups[name].count += 1;
      return groups;
    }, {});
    
    // Convert to array and add percentage
    const foodData = Object.values(foodGroups).map(food => ({
      ...food,
      percentage: Math.round((food.calories / totalCalories) * 100) || 0
    }));
    
    // Sort by calories (highest first)
    return foodData.sort((a, b) => b.calories - a.calories);
  };

  // Generate colors for food items
  const getFoodColor = (index) => {
    const colors = [
      '#4ade80', // green
      '#60a5fa', // blue
      '#f97316', // orange
      '#a78bfa', // purple
      '#f43f5e', // pink
      '#facc15', // yellow
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const foodData = prepareConsumptionData();
  const totalCalories = todaysFood.reduce((sum, food) => sum + (food.calories || 0), 0);
  const totalBurned = todaysWorkouts.reduce((sum, workout) => sum + (workout.calories_burned || 0), 0);
  const dailyGoal = profile?.daily_calorie_goal || 0;
  const percentOfGoal = dailyGoal ? Math.round((totalCalories / dailyGoal) * 100) : 0;

  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-6">Today's Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-500/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">Consumed</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalCalories} cal</p>
          {dailyGoal > 0 && (
            <p className="text-sm text-white/60 mt-1">
              {percentOfGoal}% of daily goal
            </p>
          )}
        </div>
        
        <div className="bg-red-500/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="h-5 w-5 text-red-400" />
            <span className="text-white font-medium">Burned</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalBurned} cal</p>
          <p className="text-sm text-white/60 mt-1">
            {todaysWorkouts.length} workout{todaysWorkouts.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="bg-purple-500/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white font-medium">Net</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalCalories - totalBurned} cal</p>
          {dailyGoal > 0 && (
            <p className={`text-sm mt-1 ${
              totalCalories - totalBurned > dailyGoal * 1.1 
                ? 'text-red-400' 
                : totalCalories - totalBurned < dailyGoal * 0.9
                  ? 'text-yellow-400'
                  : 'text-green-400'
            }`}>
              {totalCalories - totalBurned > dailyGoal * 1.1 
                ? 'Above target' 
                : totalCalories - totalBurned < dailyGoal * 0.9
                  ? 'Below target'
                  : 'On target'}
            </p>
          )}
        </div>
      </div>
      
      {todaysFood.length === 0 && todaysWorkouts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No food or workout entries for today. Start tracking your day!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {todaysFood.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Food Consumption</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={foodData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={false} />
                    <XAxis type="number" stroke="#999" />
                    <YAxis dataKey="name" type="category" width={100} stroke="#999" tick={{ fill: '#999' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                      formatter={(value, name) => [
                        name === 'calories' ? `${value} calories` : `${value}%`,
                        name === 'calories' ? 'Calories' : 'Percentage'
                      ]}
                    />
                    <Bar dataKey="calories" name="Calories" radius={[0, 4, 4, 0]}>
                      {foodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getFoodColor(index)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {todaysWorkouts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Today's Workouts</h3>
              <div className="space-y-3">
                {todaysWorkouts.map(workout => (
                  <div key={workout.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">{workout.name}</h4>
                        <p className="text-sm text-white/60">{workout.type}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-white/80">{workout.duration} min</span>
                        <p className="text-sm text-white/60">{workout.calories_burned} calories</p>
                      </div>
                    </div>
                    {workout.exercises && workout.exercises.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-white/60">Exercises:</p>
                        <ul className="mt-1 text-xs text-white/80 space-y-1">
                          {workout.exercises.slice(0, 3).map((exercise, idx) => (
                            <li key={exercise.id || idx}>
                              • {exercise.name} {exercise.sets ? `(${exercise.sets} × ${exercise.reps})` : ''} 
                              {exercise.duration ? `(${exercise.duration} min)` : ''}
                            </li>
                          ))}
                          {workout.exercises.length > 3 && (
                            <li>• +{workout.exercises.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 