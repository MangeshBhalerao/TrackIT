'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Switch } from "@/components/ui/switch"
import { Clock, Bell } from "lucide-react"
import Link from "next/link"

export default function TaskModal({ isOpen, onClose, selectedDate, onSubmit, initialTask }) {
  const initialRenderRef = useRef(true)
  const [task, setTask] = useState({
    title: '',
    description: '',
    dueDate: null,
    dueTime: '',
    priority: 'medium',
    status: 'pending',
    category: 'general',
    isAllDay: true,
    hasReminder: false,
    reminderEmail: '',
  })
  
  const [userEmail, setUserEmail] = useState('')
  const [remindersEnabled, setRemindersEnabled] = useState(true)

  // Fetch user preferences once when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchUserPreferences = async () => {
        try {
          const response = await fetch('/api/tasks/preferences?userId=1') // TODO: Get actual user ID
          if (response.ok) {
            const data = await response.json()
            if (data && data.email) {
              setUserEmail(data.email)
              setRemindersEnabled(data.enable_reminders !== false)
            }
          }
        } catch (error) {
          console.error('Error fetching user preferences:', error)
        }
      }
      
      fetchUserPreferences()
    }
  }, [isOpen])

  // Update task state when initialTask or selectedDate changes
  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false
      
      // Now we can safely use Date objects after component has mounted
      const now = new Date()
      const defaultTime = format(new Date(now.setMinutes(0, 0)), 'HH:mm')
      
      if (initialTask) {
        setTask({
          ...initialTask,
          dueTime: initialTask.dueTime || defaultTime,
          isAllDay: initialTask.isAllDay !== undefined ? initialTask.isAllDay : true,
          hasReminder: initialTask.hasReminder || false,
          reminderEmail: initialTask.reminderEmail || userEmail || '',
        })
      } else {
        setTask({
          title: '',
          description: '',
          dueDate: selectedDate || new Date(),
          dueTime: defaultTime,
          priority: 'medium',
          status: 'pending',
          category: 'general',
          isAllDay: true,
          hasReminder: false,
          reminderEmail: userEmail || '',
        })
      }
    }
  }, [initialTask, selectedDate, isOpen, userEmail])

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">Category</Label>
              <Select
                value={task.category}
                onValueChange={(value) => setTask({ ...task, category: value })}
              >
                <SelectTrigger className="bg-black border-zinc-800 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-black border-zinc-800 text-white">
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="errands">Errands</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="dueTime" className="text-white">Time</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAllDay"
                    checked={task.isAllDay}
                    onCheckedChange={(checked) => setTask({ ...task, isAllDay: checked })}
                  />
                  <Label htmlFor="isAllDay" className="text-sm text-zinc-400">All day</Label>
                </div>
              </div>
              {!task.isAllDay ? (
                <div className="flex items-center">
                  <Clock className="text-zinc-400 h-4 w-4 mr-2" />
                  <Input
                    id="dueTime"
                    type="time"
                    value={task.dueTime}
                    onChange={(e) => setTask({ ...task, dueTime: e.target.value })}
                    className="bg-black border-zinc-800 text-white"
                  />
                </div>
              ) : (
                <div className="flex items-center h-9 text-zinc-500 border border-zinc-800 bg-black/50 rounded-md px-3">
                  <Clock className="text-zinc-400 h-4 w-4 mr-2" />
                  <span>All day</span>
                </div>
              )}
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

          <div className="space-y-4 border border-zinc-800 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="text-zinc-400 h-5 w-5" />
                <Label htmlFor="hasReminder" className="text-white">Email Reminder</Label>
              </div>
              <Switch
                id="hasReminder"
                checked={task.hasReminder}
                onCheckedChange={(checked) => setTask({ ...task, hasReminder: checked })}
                disabled={!remindersEnabled || !userEmail}
              />
            </div>
            
            {task.hasReminder && (
              <div className="space-y-2">
                <Label htmlFor="reminderEmail" className="text-sm text-zinc-400">
                  Reminder will be sent 30 minutes before the scheduled time
                </Label>
                <Input
                  id="reminderEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={task.reminderEmail}
                  onChange={(e) => setTask({ ...task, reminderEmail: e.target.value })}
                  className="bg-black border-zinc-800 text-white"
                  required={task.hasReminder}
                />
                {!userEmail && (
                  <div className="text-xs text-blue-400 mt-1">
                    <Link href="/tasks/settings" className="underline">
                      Set up your default email in settings
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {!remindersEnabled && (
              <div className="text-xs text-yellow-400 mt-1">
                Email reminders are disabled in your 
                <Link href="/tasks/settings" className="underline ml-1">
                  notification settings
                </Link>
              </div>
            )}
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