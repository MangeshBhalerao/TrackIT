'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Tag, Clock, Bell } from 'lucide-react'

export default function TaskList({ tasks, onDelete, onEdit, onComplete }) {
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  const filteredTasks = tasks.filter(task => {
    // Filter by status
    if (filter !== 'all' && task.status !== filter) return false
    
    // Filter by category
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false
    
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate)
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return 0
  })

  // Get all unique categories from tasks
  const categories = ['all', ...new Set(tasks.map(task => task.category || 'general').filter(Boolean))];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full bg-black border-zinc-800 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-black border-zinc-800 text-white">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full bg-black border-zinc-800 text-white">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="bg-black border-zinc-800 text-white">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.filter(cat => cat !== 'all').map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full bg-black border-zinc-800 text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-black border-zinc-800 text-white">
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="bg-black border border-zinc-800 rounded-lg p-6 text-center">
            <p className="text-zinc-300">No tasks found. Add a new task to get started!</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-black border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4 sm:items-center transition-all hover:border-zinc-700 ${
                task.status === 'completed' ? 'border-l-4 border-l-green-600' : ''
              }`}
            >
              <div className="space-y-1 flex-1">
                <h3 className="text-white font-medium text-lg">{task.title}</h3>
                <p className="text-zinc-400 text-sm">{task.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm mt-2">
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-black/40 border border-zinc-800">
                    <Clock className="h-3 w-3 text-zinc-400" />
                    <span className="text-zinc-300">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'Not set'}
                      {!task.isAllDay && task.dueTime && (
                        <span className="ml-1 text-blue-300">• {task.dueTime}</span>
                      )}
                      {task.isAllDay && (
                        <span className="ml-1 text-zinc-500">• All day</span>
                      )}
                    </span>
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-950 text-red-300' :
                    task.priority === 'medium' ? 'bg-yellow-950 text-yellow-300' :
                    'bg-green-950 text-green-300'
                  }`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed' ? 'bg-green-950 text-green-300' :
                    task.status === 'in-progress' ? 'bg-blue-950 text-blue-300' :
                    'bg-orange-950 text-orange-300'
                  }`}>
                    {task.status}
                  </span>
                  {task.category && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-950 text-purple-300">
                      <Tag size={12} />
                      {task.category}
                    </span>
                  )}
                  {task.hasReminder && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-950 text-blue-300">
                      <Bell size={12} />
                      Reminder
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {task.status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onComplete(task.id)}
                    className="text-white border-zinc-800 bg-black hover:bg-green-950 hover:text-green-200"
                  >
                    Complete
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="text-white border-zinc-800 bg-black hover:bg-zinc-900 hover:border-zinc-700"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                  className="text-white border-zinc-800 bg-black hover:bg-red-950 hover:text-red-200"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 