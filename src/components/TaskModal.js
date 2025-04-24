'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

export default function TaskModal({ isOpen, onClose, selectedDate, onSubmit, initialTask }) {
  const [task, setTask] = useState({
    title: '',
    description: '',
    dueDate: selectedDate || new Date(),
    priority: 'medium',
    status: 'pending'
  })

  // Update task state when initialTask or selectedDate changes
  useEffect(() => {
    if (initialTask) {
      setTask(initialTask)
    } else {
      setTask({
        title: '',
        description: '',
        dueDate: selectedDate || new Date(),
        priority: 'medium',
        status: 'pending'
      })
    }
  }, [initialTask, selectedDate, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(task)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-zinc-800 shadow-xl max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {initialTask ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Task Title</Label>
            <Input
              id="title"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="bg-black border-zinc-800 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={task.description || ''}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              className="bg-black border-zinc-800 text-white min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-white">Priority</Label>
              <Select
                value={task.priority}
                onValueChange={(value) => setTask({ ...task, priority: value })}
              >
                <SelectTrigger className="bg-black border-zinc-800 text-white">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-black border-zinc-800 text-white">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-white">Due Date</Label>
            <div className="border border-zinc-800 bg-black rounded-md p-3">
              <Calendar
                mode="single"
                selected={task.dueDate ? new Date(task.dueDate) : undefined}
                onSelect={(date) => setTask({ ...task, dueDate: date })}
                className="mx-auto"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-white border-zinc-800 bg-black hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gray-800/30 border-1 border-gray-800 text-white hover:bg-blue-900"
            >
              {initialTask ? 'Update Task' : 'Save Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 