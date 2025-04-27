import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from 'lucide-react'

export default function WorkoutModal({ isOpen, onClose, onSubmit, initialWorkout = null }) {
  const [exercises, setExercises] = useState(initialWorkout?.exercises || [])
  const [exerciseOptions, setExerciseOptions] = useState([])

  useEffect(() => {
    // Fetch exercises from the API when the modal opens
    if (isOpen) {
      fetch('/api/fitness/exercises')
        .then(res => res.json())
        .then(data => setExerciseOptions(data))
        .catch(() => setExerciseOptions([]))
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault();
    const firstExercise = exercises[0];
    const dbExercise = firstExercise ? exerciseOptions.find(e => e.name === firstExercise.name) : null;
    
    // Calculate total workout duration (sum of cardio exercise durations)
    const totalDuration = exercises.reduce((total, ex) => {
      const dbEx = exerciseOptions.find(e => e.name === ex.name);
      if (dbEx && dbEx.type === 'Cardio') {
        return total + (Number(ex.duration) || 0);
      }
      return total;
    }, 0);
    
    const workoutData = {
      name: firstExercise?.name || "Workout",
      type: dbExercise?.type || "Custom",
      duration: totalDuration,
      caloriesBurned: getWorkoutTotalCalories(),
      notes: "",
      exercises: exercises.map(ex => {
        const dbEx = exerciseOptions.find(e => e.name === ex.name);
        return {
          ...ex,
          type: dbEx ? dbEx.type : '',
        };
      })
    };
    onSubmit(workoutData);
    onClose();
  }

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '' }])
  }

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index, field, value) => {
    const updatedExercises = [...exercises]
    updatedExercises[index] = { ...updatedExercises[index], [field]: value }
    setExercises(updatedExercises)
  }

  const getCaloriesPerRep = (exerciseName) => {
    const found = exerciseOptions.find(e => e.name === exerciseName)
    return found ? Number(found.calories_per_rep) : 0
  }

  const getTotalCalories = (exercise) => {
    const dbExercise = exerciseOptions.find(e => e.name === exercise.name);
    if (!dbExercise) return '0.00';
    if (dbExercise.type === 'Cardio') {
      const duration = Number(exercise.duration) || 0;
      const cpm = Number(dbExercise.calories_per_minute) || 0;
      return (cpm * duration).toFixed(2);
    } else {
      const cpr = Number(dbExercise.calories_per_rep) || 0;
      const sets = Number(exercise.sets) || 0;
      const reps = Number(exercise.reps) || 0;
      return (cpr * sets * reps).toFixed(2);
    }
  }

  const getWorkoutTotalCalories = () => {
    return exercises.reduce((sum, ex) => sum + Number(getTotalCalories(ex)), 0);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">
            {initialWorkout ? 'Edit Workout' : 'Add New Workout'}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {initialWorkout ? 'Update your workout details' : 'Create a new workout routine'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exercises Section Only */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Exercises</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExercise}
                className="text-white border-white/20 hover:bg-white/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            <div className="space-y-4">
              {exercises.map((exercise, index) => {
                const dbExercise = exerciseOptions.find(e => e.name === exercise.name);
                return (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">Exercise {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExercise(index)}
                        className="h-8 w-8 p-0 hover:bg-white/10"
                      >
                        <X className="h-4 w-4 text-white" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Exercise</Label>
                        <Select
                          value={exercise.name}
                          onValueChange={(value) => updateExercise(index, 'name', value)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Select exercise" />
                          </SelectTrigger>
                          <SelectContent>
                            {exerciseOptions.map((ex) => (
                              <SelectItem key={ex.id} value={ex.name}>
                                {ex.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {dbExercise && (
                          <div className="text-xs text-white/60 mt-1">Type: {dbExercise.type}</div>
                        )}
                      </div>

                      {/* Cardio: show duration, Strength: show sets/reps */}
                      {dbExercise && dbExercise.type === 'Cardio' ? (
                        <div className="space-y-2 col-span-2">
                          <Label className="text-white">Duration (minutes)</Label>
                          <Input
                            type="number"
                            value={exercise.duration || ''}
                            onChange={(e) => updateExercise(index, 'duration', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            required
                          />
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label className="text-white">Sets</Label>
                            <Input
                              type="number"
                              value={exercise.sets || ''}
                              onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                              className="bg-white/5 border-white/10 text-white"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Reps</Label>
                            <Input
                              type="number"
                              value={exercise.reps || ''}
                              onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                              className="bg-white/5 border-white/10 text-white"
                              required
                            />
                          </div>
                        </>
                      )}
                    </div>
                    {exercise.name && (
                      <div className="text-sm text-white/70">
                        {dbExercise && dbExercise.type === 'Cardio' ? (
                          <>Calories per minute: {dbExercise.calories_per_minute}<br />Total calories: {getTotalCalories(exercise)}</>
                        ) : (
                          <>Calories per rep: {dbExercise?.calories_per_rep}<br />Total calories: {getTotalCalories(exercise)}</>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {initialWorkout ? 'Update Workout' : 'Create Workout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 