'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Activity, 
  Dumbbell, 
  Flame, 
  Heart, 
  Timer, 
  TrendingUp,
  Plus,
  Calendar,
  Target,
  Users,
  Utensils,
  Edit,
  Trash2,
  UserCircle,
  Menu
} from 'lucide-react'
import WorkoutModal from '@/components/WorkoutModal'
import FoodEntryForm from '@/components/FoodEntryForm'
import FoodList from '@/components/FoodList'
import CalorieProgressChart from '@/components/CalorieProgressChart'
import WeightGoalCard from '@/components/WeightGoalCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import Link from 'next/link'
import React from 'react'

export default function FitnessPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState(null)
  const [workouts, setWorkouts] = useState([])
  const [stats, setStats] = useState({
    calories: 0,
    steps: 0,
    workouts: 0,
    waterIntake: 0,
    activeMinutes: 0,
    heartRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false)
  const [todaysFoodEntries, setTodaysFoodEntries] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchWorkouts()
    fetchStats()
    fetchTodaysFoodEntries()
    fetchUserProfile()
  }, [])

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/fitness/workouts?userId=1') // TODO: Get actual user ID
      if (!response.ok) {
        throw new Error('Failed to fetch workouts')
      }
      const data = await response.json()
      setWorkouts(data)
    } catch (error) {
      console.error('Error fetching workouts:', error)
      toast.error('Failed to fetch workouts')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/fitness/stats?userId=1') // TODO: Get actual user ID
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      const data = await response.json()
      // If data is empty or not an array, provide default empty stats
      if (!data || !Array.isArray(data) || data.length === 0) {
        setStats({
          calories: 0,
          steps: 0,
          workouts: 0,
          waterIntake: 0,
          activeMinutes: 0,
          heartRate: 0
        })
      } else {
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to fetch stats')
      // Set default stats on error
      setStats({
        calories: 0,
        steps: 0,
        workouts: 0,
        waterIntake: 0,
        activeMinutes: 0,
        heartRate: 0
      })
    }
  }

  const fetchTodaysFoodEntries = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const response = await fetch(`/api/fitness/food?userId=1`) // TODO: Get actual user ID
      if (!response.ok) {
        throw new Error('Failed to fetch food entries')
      }
      const data = await response.json()
      // Filter for today's entries
      const todaysEntries = data.filter(entry => entry.date && entry.date.startsWith(today))
      setTodaysFoodEntries(todaysEntries)
    } catch (error) {
      console.error('Error fetching today\'s food entries:', error)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/fitness/profile?userId=1') // TODO: Get actual user ID
      if (response.ok) {
        const data = await response.json()
        if (data && data.id) {
          setUserProfile(data)
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleAddWorkout = () => {
    setEditingWorkout(null)
    setIsWorkoutModalOpen(true)
  }

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout)
    setIsWorkoutModalOpen(true)
  }

  const handleWorkoutSubmit = async (workoutData) => {
    try {
      const response = await fetch('/api/fitness/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // TODO: Get actual user ID
          workoutData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save workout')
      }

      const data = await response.json()
      if (editingWorkout) {
        setWorkouts(workouts.map(w => 
          w.id === editingWorkout.id ? data : w
        ))
      } else {
        setWorkouts([data, ...workouts])
      }
      fetchStats() // Refresh stats after workout update
      toast.success('Workout saved successfully')
    } catch (error) {
      console.error('Error saving workout:', error)
      toast.error('Failed to save workout')
    }
  }

  const handleDeleteWorkout = async (workoutId) => {
    try {
      const response = await fetch(`/api/fitness/workouts/${workoutId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete workout')
      }

      // Animate removal with fade out and then update state
      setWorkouts(prev => prev.map(w => 
        w.id === workoutId ? { ...w, isDeleting: true } : w
      ))
      
      // Wait for animation to complete
      setTimeout(() => {
        setWorkouts(workouts.filter(w => w.id !== workoutId))
        fetchStats() // Refresh stats after workout deletion
      }, 300)
      
      toast.success('Workout deleted successfully')
    } catch (error) {
      console.error('Error deleting workout:', error)
      toast.error('Failed to delete workout')
    }
  }

  const handleFoodAdded = () => {
    fetchStats() // Refresh stats after food entry
    fetchTodaysFoodEntries() // Refresh today's food entries
    toast.success('Food entry added successfully')
  }

  // Add a function to delete a workout exercise
  const handleDeleteExercise = async (exerciseId) => {
    try {
      const response = await fetch(`/api/fitness/workout-exercises/${exerciseId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete exercise');
      }
      // Optimistically update UI
      setWorkouts(prevWorkouts => prevWorkouts.map(workout => ({
        ...workout,
        exercises: workout.exercises?.filter(ex => ex.id !== exerciseId)
      })));
      fetchWorkouts(); // Full refresh after deletion
      toast.success('Exercise deleted successfully');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast.error('Failed to delete exercise');
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 relative z-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Fitness Tracking
          </h1>
          
          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button 
              className="bg-gray-800/30 border border-zinc-800 hover:bg-zinc-700 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-4 w-4 mr-2" />
              Menu
            </Button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto mt-3 sm:mt-0 ${mobileMenuOpen ? 'flex' : 'hidden sm:flex'}`}>
          <Button 
            className="bg-gray-800/30 border border-zinc-800 hover:bg-zinc-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 text-sm"
            onClick={() => {
              setIsFoodModalOpen(true);
            }}
          >
            <Utensils className="h-3.5 w-3.5 mr-1.5" />
            Add Food
          </Button>
          <Button 
            className="bg-gray-800/30 border border-zinc-800 hover:bg-zinc-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 text-sm"
            onClick={handleAddWorkout}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Workout
          </Button>
          <Link href="/fitness/profile" className="w-full sm:w-auto">
            <Button 
              className="bg-gray-800/30 border border-zinc-800 hover:bg-zinc-700 text-white w-full transition-all duration-300 ease-in-out transform hover:scale-105 text-sm"
            >
              <UserCircle className="h-3.5 w-3.5 mr-1.5" />
              {userProfile ? 'My Profile' : 'Setup Profile'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('overview')}
          className="text-white transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
          size="sm"
        >
          <Activity className="h-3.5 w-3.5 mr-1.5" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'workouts' ? 'default' : 'outline'}
          onClick={() => setActiveTab('workouts')}
          className="text-white transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
          size="sm"
        >
          <Dumbbell className="h-3.5 w-3.5 mr-1.5" />
          Workouts
        </Button>
        <Button
          variant={activeTab === 'food' ? 'default' : 'outline'}
          onClick={() => setActiveTab('food')}
          className="text-white transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
          size="sm"
        >
          <Utensils className="h-3.5 w-3.5 mr-1.5" />
          Food
        </Button>
      </div>

      {/* Content */}
      <div className="min-h-[60vh] sm:min-h-[70vh]">
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            {/* Progress Chart */}
            {userProfile ? (
              <div className="transition-all duration-500 ease-in-out transform hover:scale-[1.01]">
                <CalorieProgressChart />
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6 text-center py-8 sm:py-12 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                <UserCircle className="h-10 w-10 sm:h-12 sm:w-12 text-white/50 mx-auto mb-3 sm:mb-4 animate-pulse" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Profile Not Set Up</h3>
                <p className="text-white/70 mb-4 sm:mb-6 text-sm sm:text-base">
                  Set up your profile to get personalized calorie goals and track your progress
                </p>
                <Link href="/fitness/profile">
                  <Button className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 text-sm">
                    Set Up Profile
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Weight Goal Card - shown only if profile exists */}
            {userProfile && (
              <div className="transition-all duration-500 ease-in-out transform hover:scale-[1.01]">
                <WeightGoalCard />
              </div>
            )}
            
            {/* Recent Workouts */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 border-b border-white/10 pb-2">Recent Workouts</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
                </div>
              ) : workouts.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-400 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-sm sm:text-base">
                  No workouts yet. Add your first workout!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {workouts.slice(0, 3).map(workout => (
                    <div
                      key={workout.id}
                      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${workout.isDeleting ? 'opacity-0 scale-95' : 'opacity-100'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-white">{workout.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-400">{workout.type}</p>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-400 bg-gray-800/30 px-2 py-1 rounded-md">
                          {new Date(workout.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-3 sm:mt-4 flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-400 flex items-center">
                          <Timer className="h-3.5 w-3.5 mr-1" /> {workout.duration} min
                        </span>
                        <span className="text-white flex items-center">
                          <Flame className="h-3.5 w-3.5 mr-1 text-orange-500" /> {workout.calories_burned} cal
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'workouts' && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
              </div>
            ) : workouts.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-400 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                <Dumbbell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-500/50" />
                <p className="text-lg sm:text-xl font-medium mb-2">No workouts yet</p>
                <p className="mb-4 sm:mb-6 text-sm sm:text-base">Start tracking your fitness journey today</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-sm"
                  onClick={handleAddWorkout}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Your First Workout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {workouts.map(workout => (
                  <div
                    key={workout.id}
                    className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4 shadow-lg transition-all duration-300 ease-in-out ${workout.isDeleting ? 'opacity-0 scale-95' : 'opacity-100 hover:scale-[1.02]'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-white">{workout.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(workout.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditWorkout(workout)}
                          className="text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400">Exercises:</p>
                        <span className="text-xs text-gray-500 bg-gray-800/40 px-2 py-1 rounded-full">{workout.type}</span>
                      </div>
                      <ul className="mt-2 space-y-2 max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-2">
                        {workout.exercises?.map((exercise, index) => (
                          <li key={exercise.id || index} className="text-sm text-white flex items-center justify-between gap-2 bg-white/5 rounded-md p-2 group">
                            <span className="truncate">
                              {exercise.name} {exercise.sets ? `- ${exercise.sets} × ${exercise.reps}` : ''}
                              {exercise.duration ? `- ${exercise.duration} min` : ''}
                              {exercise.weight && ` @ ${exercise.weight}kg`}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteExercise(exercise.id)}
                              className="text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all duration-200"
                              title="Delete Exercise"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4 flex justify-between text-sm pt-2 border-t border-white/10">
                      <span className="text-gray-400 flex items-center">
                        <Timer className="h-4 w-4 mr-1" /> {workout.duration} min
                      </span>
                      <span className="text-white flex items-center">
                        <Flame className="h-4 w-4 mr-1 text-orange-500" /> {workout.calories_burned} cal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'food' && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">Food Tracking</h2>
              <Button 
                className="bg-gray-800/30 border border-zinc-800 hover:bg-zinc-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105"
                onClick={() => {
                  setIsFoodModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Food
              </Button>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 shadow-lg">
              <FoodList />
            </div>
          </div>
        )}
      </div>

      <WorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        onSubmit={handleWorkoutSubmit}
        workout={editingWorkout}
      />

      {/* Food Entry Modal - always mounted */}
      <Dialog open={isFoodModalOpen} onOpenChange={setIsFoodModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Food Entry</DialogTitle>
            <DialogDescription className="text-white/70">
              Track what you eat to monitor calorie intake
            </DialogDescription>
          </DialogHeader>
          <FoodEntryForm 
            onFoodAdded={() => {
              handleFoodAdded();
              setIsFoodModalOpen(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 