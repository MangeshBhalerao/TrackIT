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
  UserCircle
} from 'lucide-react'
import WorkoutModal from '@/components/WorkoutModal'
import FoodEntryForm from '@/components/FoodEntryForm'
import FoodList from '@/components/FoodList'
import CalorieProgressChart from '@/components/CalorieProgressChart'
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

      setWorkouts(workouts.filter(w => w.id !== workoutId))
      fetchStats() // Refresh stats after workout deletion
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
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Fitness Tracking</h1>
        <div className="flex gap-4">
          <Button 
            className="bg-gray-800/30 border border-zinc-800 hover:bg-zinc-700 text-white"
            onClick={() => {
              console.log('Add Food button clicked');
              setIsFoodModalOpen(true);
            }}
          >
            <Utensils className="h-4 w-4 mr-2" />
            Add Food
          </Button>
          <Button 
            className="bg-gray-800/30 border border-zinc-800 hover:bg-zinc-700 text-white"
            onClick={handleAddWorkout}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Workout
          </Button>
          <Link href="/fitness/profile">
            <Button 
              className="bg-gray-800/30 border border-zinc-800 hover:bg-zinc-700 text-white"
            >
              <UserCircle className="h-4 w-4 mr-2" />
              {userProfile ? 'My Profile' : 'Setup Profile'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('overview')}
          className="text-white"
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'workouts' ? 'default' : 'outline'}
          onClick={() => setActiveTab('workouts')}
          className="text-white"
        >
          Workouts
        </Button>
        <Button
          variant={activeTab === 'food' ? 'default' : 'outline'}
          onClick={() => setActiveTab('food')}
          className="text-white"
        >
          <Utensils className="h-4 w-4 mr-2" />
          Food
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Progress Chart */}
          {userProfile ? (
            <div>
              <CalorieProgressChart />
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center py-12">
              <UserCircle className="h-12 w-12 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Profile Not Set Up</h3>
              <p className="text-white/70 mb-6">
                Set up your profile to get personalized calorie goals and track your progress
              </p>
              <Link href="/fitness/profile">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Set Up Profile
                </Button>
              </Link>
            </div>
          )}
          
          {/* Recent Workouts */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Workouts</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : workouts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No workouts yet. Add your first workout!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workouts.slice(0, 3).map(workout => (
                  <div
                    key={workout.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
                        <p className="text-sm text-gray-400">{workout.type}</p>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(workout.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                      <span className="text-gray-400">{workout.duration} min</span>
                      <span className="text-white">{workout.calories_burned} cal</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'workouts' && (
        <div className="space-y-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : workouts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No workouts yet. Add your first workout!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workouts.map(workout => (
                <div
                  key={workout.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
                      <p className="text-sm text-gray-400">{workout.type}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditWorkout(workout)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteWorkout(workout.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-400">Exercises:</p>
                    <ul className="mt-2 space-y-2">
                      {workout.exercises?.map((exercise, index) => (
                        <li key={exercise.id || index} className="text-sm text-white flex items-center gap-2">
                          {exercise.name} {exercise.sets ? `- ${exercise.sets} sets × ${exercise.reps}` : ''}
                          {exercise.duration ? `- ${exercise.duration} min` : ''}
                          {exercise.weight && ` @ ${exercise.weight}kg`}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteExercise(exercise.id)}
                            className="text-gray-400 hover:text-red-500"
                            title="Delete Exercise"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-gray-400">{workout.duration} min</span>
                    <span className="text-white">{workout.calories_burned} cal</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'food' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Food Tracking</h2>
            <Button 
              className="bg-gray-800/30 border border-zinc-800 hover:bg-zinc-700 text-white"
              onClick={() => {
                console.log('Add Food button clicked');
                setIsFoodModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Food
            </Button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <FoodList />
          </div>
        </div>
      )}

      <WorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        onSubmit={handleWorkoutSubmit}
        workout={editingWorkout}
      />

      {/* Food Entry Modal - always mounted */}
      <Dialog open={isFoodModalOpen} onOpenChange={setIsFoodModalOpen}>
        <DialogContent className="bg-black border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Add Food Entry</DialogTitle>
            <DialogDescription>
              Search for food and add it to your daily log
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