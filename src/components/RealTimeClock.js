'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export default function RealTimeClock() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000) // Update every second

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg p-6 shadow-lg">
      <div className="text-center space-y-3">
        <div className="text-3xl font-bold text-white">
          {format(currentTime, 'h:mm:ss a')}
        </div>
        <div className="text-slate-300 font-medium">
          {format(currentTime, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>
    </div>
  )
} 