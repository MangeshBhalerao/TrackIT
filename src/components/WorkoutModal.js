import { useState } from 'react'
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
import { Textarea } from "@/components/ui/textarea"
import { Dumbbell, Timer, Target, Plus, X } from 'lucide-react'

export default function WorkoutModal({ isOpen, onClose, onSubmit, initialWorkout = null }) {
  const [workout, setWorkout] = useState(initialWorkout || {
    name: '',
    type: '',
    duration: '',
    calories: '',
    description: '',
    exercises: []
  })

  const [exercises, setExercises] = useState(initialWorkout?.exercises || [])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...workout, exercises })
    onClose()
  }

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', weight: '' }])
  }

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index, field, value) => {
    const updatedExercises = [...exercises]
    updatedExercises[index] = { ...updatedExercises[index], [field]: value }
    setExercises(updatedExercises)
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
          {/* Basic Workout Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Workout Name</Label>
              <Input
                id="name"
                value={workout.name}
                onChange={(e) => setWorkout({ ...workout, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-white">Type</Label>
                <Input
                  id="type"
                  value={workout.type}
                  onChange={(e) => setWorkout({ ...workout, type: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-white">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={workout.duration}
                  onChange={(e) => setWorkout({ ...workout, duration: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories" className="text-white">Estimated Calories</Label>
              <Input
                id="calories"
                type="number"
                value={workout.calories}
                onChange={(e) => setWorkout({ ...workout, calories: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={workout.description}
                onChange={(e) => setWorkout({ ...workout, description: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                rows={3}
              />
            </div>
          </div>

          {/* Exercises Section */}
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
              {exercises.map((exercise, index) => (
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Name</Label>
                      <Input
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Sets</Label>
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Reps</Label>
                      <Input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Weight (kg)</Label>
                      <Input
                        type="number"
                        value={exercise.weight}
                        onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
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