import { useState, useEffect } from 'react';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';
import { Flame, UtensilsCrossed } from 'lucide-react';

export default function CalorieProgressChart() {
  const [stats, setStats] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('day'); // 'day', 'week', or 'month'

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get user profile to access calorie goal
      const profileResponse = await fetch('/api/fitness/profile?userId=1'); // TODO: Get actual user ID
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }
      const profileData = await profileResponse.json();
      setProfile(profileData);

      // Calculate date range based on selected period
      const today = new Date();
      let startDate, endDate;
      
      if (period === 'day') {
        startDate = format(subDays(today, 1), 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
      } else if (period === 'week') {
        startDate = format(subDays(today, 7), 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
      } else if (period === 'month') {
        startDate = format(subDays(today, 30), 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
      }

      // Fetch stats for the date range
      const statsResponse = await fetch(
        `/api/fitness/stats?userId=1&startDate=${startDate}&endDate=${endDate}`
      );
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const statsData = await statsResponse.json();
      
      // Format the data for the chart based on period
      const formattedStats = statsData.map(day => {
        let displayDate;
        const date = new Date(day.date);
        
        if (period === 'day') {
          // For daily view, show hours
          displayDate = format(date, 'ha');
        } else if (period === 'week') {
          // For weekly view, show day name and date
          displayDate = format(date, 'EEE dd');
        } else {
          // For monthly view, show month/day
          displayDate = format(date, 'MM/dd');
        }
        
        return {
          date: displayDate,
          fullDate: date,
          consumed: day.total_calories_consumed,
          burned: day.total_calories_burned,
          net: day.net_calories,
          goal: day.calorie_goal || profileData.daily_calorie_goal,
          status: day.status
        };
      });
      
      setStats(formattedStats);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  // Check each day's status and display alerts if needed
  useEffect(() => {
    if (stats.length > 0 && period === 'day') {
      const latestDay = stats[stats.length - 1];
      if (latestDay.status === 'over') {
        toast.error(
          'You exceeded your calorie goal today! Try to reduce your intake.',
          { icon: '⚠️', duration: 5000 }
        );
      } else if (latestDay.status === 'under') {
        toast.error(
          'You are below your calorie goal! Make sure to eat enough for your needs.',
          { icon: '⚠️', duration: 5000 }
        );
      }
    }
  }, [stats, period]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'over': return '#ef4444'; // red
      case 'under': return '#eab308'; // yellow
      case 'on_target': return '#22c55e'; // green
      default: return '#3b82f6'; // blue
    }
  };
  
  const getDateRangeText = () => {
    if (stats.length === 0) return '';
    
    if (period === 'day') {
      return 'Today';
    } else if (period === 'week') {
      return `Last 7 days`;
    } else if (period === 'month') {
      return `Last 30 days`;
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Calorie Tracking</h2>
          <p className="text-sm text-white/60">{getDateRangeText()}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === 'day' ? 'default' : 'outline'}
            onClick={() => setPeriod('day')}
            size="sm"
            className="text-white"
          >
            Day
          </Button>
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            onClick={() => setPeriod('week')}
            size="sm"
            className="text-white"
          >
            Week
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            onClick={() => setPeriod('month')}
            size="sm"
            className="text-white"
          >
            Month
          </Button>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No data available for this period. Start tracking your meals and workouts!
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-blue-400" />
                <span className="text-white/70 text-sm">Daily Goal</span>
              </div>
              <p className="text-xl font-bold text-white">{profile?.daily_calorie_goal || 0} cal</p>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-green-400" />
                <span className="text-white/70 text-sm">Avg. Consumed</span>
              </div>
              <p className="text-xl font-bold text-white">
                {Math.round(stats.reduce((sum, day) => sum + day.consumed, 0) / stats.length)} cal
              </p>
            </div>
            
            <div className="bg-red-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-400" />
                <span className="text-white/70 text-sm">Avg. Burned</span>
              </div>
              <p className="text-xl font-bold text-white">
                {Math.round(stats.reduce((sum, day) => sum + day.burned, 0) / stats.length)} cal
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={stats}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value, name) => [
                  `${value} calories`, 
                  name === 'consumed' ? 'Calories Consumed' : 
                  name === 'burned' ? 'Calories Burned' : 
                  name === 'net' ? 'Net Calories' : 
                  name === 'goal' ? 'Goal' : name
                ]}
                labelFormatter={(label, entries) => {
                  const entry = entries[0]?.payload;
                  return entry?.fullDate ? format(entry.fullDate, 'MMM dd, yyyy') : label;
                }}
              />
              <Legend />
              <ReferenceLine 
                y={profile?.daily_calorie_goal} 
                label={{ value: 'Goal', position: 'right', fill: '#fff' }} 
                stroke="#8884d8" 
                strokeDasharray="3 3" 
              />
              <Line
                type="monotone"
                dataKey="consumed"
                name="Calories Consumed"
                stroke="#4ade80"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="burned"
                name="Calories Burned"
                stroke="#f87171"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="net"
                name="Net Calories"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ stroke: (entry) => getStatusColor(entry.status), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
} 