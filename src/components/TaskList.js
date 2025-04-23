'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

export default function TaskList({ tasks, onDelete, onEdit }) {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <p className="text-white">No tasks found. Add a new task to get started!</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex justify-between items-center"
            >
              <div className="space-y-1">
                <h3 className="text-white font-medium text-lg">{task.title}</h3>
                <p className="text-slate-300 text-sm">{task.description}</p>
                <div className="flex items-center gap-2 text-sm mt-2">
                  <span className="text-slate-300">
                    Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'Not set'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-900 text-red-300' :
                    task.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-green-900 text-green-300'
                  }`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed' ? 'bg-green-900 text-green-300' :
                    task.status === 'in-progress' ? 'bg-blue-900 text-blue-300' :
                    'bg-orange-900 text-orange-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="text-white border-slate-600 hover:bg-slate-700"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                  className="text-white border-slate-600 hover:bg-red-900 hover:border-red-800"
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