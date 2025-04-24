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
    <div className="bg-black/5 backdrop-blur-md border mb-4 border-white/10 rounded-lg p-4">
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-white">
          {format(currentTime, 'h:mm:ss a')}
        </div>
        <div className="text-white/70">
          {format(currentTime, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>
    </div>
  )
} 