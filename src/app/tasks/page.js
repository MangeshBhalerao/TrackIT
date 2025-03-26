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
  const [currentDate, setCurrentDate] = useState(new Date())

  // Update current date every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000) // Update every second

    return () => clearInterval(timer)
  }, [])

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const handleTaskSubmit = (task) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...task, id: editingTask.id } : t))
      setEditingTask(null)
    } else {
      setTasks([...tasks, { ...task, id: Date.now() }])
    }
  }

  const handleTaskDelete = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const handleTaskEdit = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  // Function to get tasks for a specific date
  const getTasksForDate = (date) => {
    return tasks.filter(task => isSameDay(new Date(task.dueDate), date))
  }

  // Function to check if a date has tasks
  const hasTasks = (date) => {
    return getTasksForDate(date).length > 0
  }

  // Function to get task count for a date
  const getTaskCount = (date) => {
    return getTasksForDate(date).length
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <div className="space-y-6">
          <RealTimeClock />
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Calendar</h2>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              defaultMonth={currentDate}
              className="bg-white/5 border-white/10 rounded-md"
              modifiers={{
                today: (date) => isToday(date),
                hasTasks: (date) => hasTasks(date),
                current: (date) => isSameDay(date, currentDate),
              }}
              modifiersStyles={{
                today: {
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#60A5FA',
                  fontWeight: 'bold',
                },
                hasTasks: {
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  color: '#A78BFA',
                },
                current: {
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  fontWeight: 'bold',
                  border: '2px solid #34D399',
                },
              }}
              components={{
                DayContent: ({ date, ...props }) => {
                  const taskCount = getTaskCount(date)
                  return (
                    <div className="relative">
                      <div {...props} />
                      {taskCount > 0 && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                          <span className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {taskCount}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                }
              }}
            />
          </div>
        </div>

        {/* Task List Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Tasks</h2>
            <Button
              onClick={() => {
                setSelectedDate(null)
                setEditingTask(null)
                setIsModalOpen(true)
              }}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Add New Task
            </Button>
          </div>
          <TaskList
            tasks={tasks}
            onDelete={handleTaskDelete}
            onEdit={handleTaskEdit}
          />
        </div>
      </div>

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