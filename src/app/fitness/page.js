'use client'

import { useState } from 'react'
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
  Users
} from 'lucide-react'
import WorkoutModal from '@/components/WorkoutModal'

export default function FitnessPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState(null)
  const [workouts, setWorkouts] = useState([
    {
      id: 1,
      name: 'Morning Cardio',
      duration: '30 min',
      calories: 320,
      type: 'Cardio',
      date: 'Today',
      exercises: [
        { name: 'Running', sets: 1, reps: '30 min', weight: '' },
        { name: 'Jump Rope', sets: 3, reps: '100', weight: '' }
      ]
    },
    {
      id: 2,
      name: 'Strength Training',
      duration: '45 min',
      calories: 450,
      type: 'Strength',
      date: 'Yesterday',
      exercises: [
        { name: 'Bench Press', sets: 3, reps: '12', weight: '60' },
        { name: 'Squats', sets: 4, reps: '10', weight: '80' }
      ]
    },
    {
      id: 3,
      name: 'Yoga Flow',
      duration: '60 min',
      calories: 280,
      type: 'Flexibility',
      date: '2 days ago',
      exercises: [
        { name: 'Sun Salutations', sets: 3, reps: '10', weight: '' },
        { name: 'Warrior Poses', sets: 2, reps: '30 sec', weight: '' }
      ]
    }
  ])

  // Mock data for demonstration
  const stats = {
    calories: 2500,
    steps: 8500,
    workouts: workouts.length,
    waterIntake: 2.5,
    activeMinutes: 45,
    heartRate: 72
  }

  const recentWorkouts = [
    {
      id: 1,
      name: 'Morning Cardio',
      duration: '30 min',
      calories: 320,
      type: 'Cardio',
      date: 'Today'
    },
    {
      id: 2,
      name: 'Strength Training',
      duration: '45 min',
      calories: 450,
      type: 'Strength',
      date: 'Yesterday'
    },
    {
      id: 3,
      name: 'Yoga Flow',
      duration: '60 min',
      calories: 280,
      type: 'Flexibility',
      date: '2 days ago'
    }
  ]

  const weeklyProgress = [
    { day: 'Mon', calories: 2200, steps: 8000 },
    { day: 'Tue', calories: 2400, steps: 8500 },
    { day: 'Wed', calories: 2300, steps: 8200 },
    { day: 'Thu', calories: 2500, steps: 9000 },
    { day: 'Fri', calories: 2600, steps: 8800 },
    { day: 'Sat', calories: 2800, steps: 10000 },
    { day: 'Sun', calories: 2500, steps: 8500 }
  ]

  const handleAddWorkout = () => {
    setEditingWorkout(null)
    setIsWorkoutModalOpen(true)
  }

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout)
    setIsWorkoutModalOpen(true)
  }

  const handleWorkoutSubmit = (workoutData) => {
    if (editingWorkout) {
      setWorkouts(workouts.map(w => 
        w.id === editingWorkout.id 
          ? { ...workoutData, id: editingWorkout.id, date: 'Today' }
          : w
      ))
    } else {
      setWorkouts([...workouts, {
        ...workoutData,
        id: Date.now(),
        date: 'Today'
      }])
    }
  }

  const handleDeleteWorkout = (workoutId) => {
    setWorkouts(workouts.filter(w => w.id !== workoutId))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Fitness Tracking</h1>
        <Button 
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={handleAddWorkout}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Workout
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Flame className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Calories Burned</p>
              <h3 className="text-2xl font-bold text-white">{stats.calories}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Activity className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Steps</p>
              <h3 className="text-2xl font-bold text-white">{stats.steps}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Dumbbell className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Workouts</p>
              <h3 className="text-2xl font-bold text-white">{stats.workouts}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <Timer className="h-6 w-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Active Minutes</p>
              <h3 className="text-2xl font-bold text-white">{stats.activeMinutes}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Heart Rate</p>
              <h3 className="text-2xl font-bold text-white">{stats.heartRate} bpm</h3>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Water Intake</p>
              <h3 className="text-2xl font-bold text-white">{stats.waterIntake}L</h3>
            </div>
          </div>
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
          variant={activeTab === 'progress' ? 'default' : 'outline'}
          onClick={() => setActiveTab('progress')}
          className="text-white"
        >
          Progress
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Workouts */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Workouts</h2>
            <div className="space-y-4">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between bg-white/5 rounded-lg p-4"
                >
                  <div>
                    <h3 className="text-white font-medium">{workout.name}</h3>
                    <p className="text-sm text-white/70">
                      {workout.duration} • {workout.calories} calories
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-white/70">{workout.date}</span>
                    <p className="text-sm text-blue-500">{workout.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Weekly Progress</h2>
            <div className="space-y-4">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-white/70">{day.day}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-white/10 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(day.calories / 3000) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-white/70 mt-1">
                      <span>{day.calories} cal</span>
                      <span>{day.steps} steps</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workouts' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Workout Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleEditWorkout(workout)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Dumbbell className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-white font-medium">{workout.name}</h3>
                </div>
                <p className="text-sm text-white/70 mb-4">
                  {workout.type} • {workout.duration} • {workout.calories} calories
                </p>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <span>{workout.exercises.length} exercises</span>
                  <span>•</span>
                  <span>{workout.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Progress Tracking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight Progress */}
            <div>
              <h3 className="text-white font-medium mb-4">Weight Progress</h3>
              <div className="h-64 bg-white/5 rounded-lg p-4">
                {/* Add weight chart here */}
                <p className="text-white/70">Weight tracking chart will be displayed here</p>
              </div>
            </div>

            {/* Body Measurements */}
            <div>
              <h3 className="text-white font-medium mb-4">Body Measurements</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 rounded-lg p-4">
                  <span className="text-white/70">Chest</span>
                  <span className="text-white">40&quot;</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-lg p-4">
                  <span className="text-white/70">Waist</span>
                  <span className="text-white">32&quot;</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-lg p-4">
                  <span className="text-white/70">Hips</span>
                  <span className="text-white">38&quot;</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-lg p-4">
                  <span className="text-white/70">Arms</span>
                  <span className="text-white">14&quot;</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-lg p-4">
                  <span className="text-white/70">Legs</span>
                  <span className="text-white">22&quot;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <WorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        onSubmit={handleWorkoutSubmit}
        initialWorkout={editingWorkout}
      />
    </div>
  )
} 