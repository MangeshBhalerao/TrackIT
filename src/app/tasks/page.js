'use client'

import { useState, useEffect } from 'react'
import { Calendar } from "@/components/ui/calendar"
import TaskModal from '@/components/TaskModal'
import TaskList from '@/components/TaskList'
import RealTimeClock from '@/components/RealTimeClock'
import { Button } from "@/components/ui/button"
import { format, isToday, isSameDay } from "date-fns"

export default function TasksPage() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tasks, setTasks] = useState([])
  const [editingTask, setEditingTask] = useState(null)
  const [currentDate, setCurrentDate] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)

  // Handle client-side mounting and initialization
  useEffect(() => {
    setMounted(true)
    // Set initial date after mounting to prevent hydration mismatch
    const now = new Date()
    setCurrentDate(now)
  }, [])

  // Fetch tasks from the API
  useEffect(() => {
    if (!mounted) return

    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks')
        if (!response.ok) throw new Error('Failed to fetch tasks')
        const data = await response.json()
        
        // Convert database tasks to app format
        const formattedTasks = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: task.created_at, // Use created_at as dueDate for now
          priority: 'medium', // Default priority
        }))
        
        setTasks(formattedTasks)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching tasks:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchTasks()
  }, [mounted])

  // Update current date every second
  useEffect(() => {
    if (!mounted) return

    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000) // Update every second

    return () => clearInterval(timer)
  }, [mounted])

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const handleTaskSubmit = async (task) => {
    try {
      if (editingTask) {
        // Update existing task (to be implemented)
        setTasks(tasks.map(t => t.id === editingTask.id ? { ...task, id: editingTask.id } : t))
        setEditingTask(null)
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: task.title,
            description: task.description || ''
          }),
        })

        if (!response.ok) throw new Error('Failed to create task')
        
        const newTask = await response.json()
        
        // Convert the response to app format
        const formattedTask = {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          dueDate: newTask.created_at,
          priority: 'medium', // Default priority
        }
        
        setTasks([...tasks, formattedTask])
      }
    } catch (err) {
      console.error('Error saving task:', err)
      setError(err.message)
    }
  }

  const handleTaskDelete = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      // Remove the task from state
      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (err) {
      console.error('Error deleting task:', err)
      setError(err.message)
    }
  }

  const handleTaskComplete = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task status')
      }

      const updatedTask = await response.json()

      // Update the task in state
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: 'completed' 
            } 
          : task
      ))
    } catch (err) {
      console.error('Error completing task:', err)
      setError(err.message)
    }
  }

  const handleTaskEdit = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  // Function to get tasks for a specific date
  const getTasksForDate = (date) => {
    if (!date) return []
    // Only return active tasks (non-completed) for the specified date
    return tasks.filter(task => 
      task.dueDate && 
      isSameDay(new Date(task.dueDate), date) && 
      task.status !== 'completed'
    )
  }

  // Function to check if a date has tasks
  const hasTasks = (date) => {
    if (!date) return false
    return getTasksForDate(date).length > 0
  }

  // Function to get task count for a date
  const getTaskCount = (date) => {
    if (!date) return 0
    return getTasksForDate(date).length
  }

  // Separate active and completed tasks
  const activeTasks = tasks.filter(task => task.status !== 'completed')
  const completedTasks = tasks.filter(task => task.status === 'completed')

  if (!mounted) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8" suppressHydrationWarning>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-white">Loading tasks...</div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Section */}
            <div className="w-full">
              <RealTimeClock />
              <div className="bg-black border border-zinc-800 rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Calendar</h2>
                {currentDate && (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    defaultMonth={currentDate}
                    className="mx-auto"
                    modifiers={{
                      today: (date) => isToday(date),
                      hasTasks: (date) => hasTasks(date),
                      current: (date) => isSameDay(date, currentDate),
                    }}
                    components={{
                      DayContent: ({ date, ...props }) => {
                        const taskCount = getTaskCount(date)
                        return (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <span className="z-10">{date.getDate()}</span>
                            {taskCount > 0 && (
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 z-20">
                                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                                  {taskCount}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      }
                    }}
                    showOutsideDays={true}
                  />
                )}
              </div>
            </div>

            {/* Task List Section */}
            <div className="space-y-6 w-full">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Tasks</h2>
                <Button
                  onClick={() => {
                    setSelectedDate(null)
                    setEditingTask(null)
                    setIsModalOpen(true)
                  }}
                  className="bg-gray-800/30 border-1 border-gray-800 text-white hover:bg-blue-900 transition-colors"
                >
                  Add New Task
                </Button>
              </div>
              <TaskList
                tasks={activeTasks}
                onDelete={handleTaskDelete}
                onEdit={handleTaskEdit}
                onComplete={handleTaskComplete}
              />
              
              {/* Completed Tasks Section */}
              {completedTasks.length > 0 && (
                <div className="space-y-4 mt-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Completed Tasks</h2>
                    <Button
                      variant="outline"
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="text-white border-zinc-800 bg-black hover:bg-zinc-900"
                    >
                      {showCompleted ? 'Hide' : 'Show'} ({completedTasks.length})
                    </Button>
                  </div>
                  
                  {showCompleted && (
                    <TaskList
                      tasks={completedTasks}
                      onDelete={handleTaskDelete}
                      onEdit={handleTaskEdit}
                      onComplete={handleTaskComplete}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        selectedDate={selectedDate}
        onSubmit={handleTaskSubmit}
        initialTask={editingTask}
      />
    </div>
  )
} 