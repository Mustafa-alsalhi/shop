import React, { useState, useEffect } from 'react'

const CountdownTimer = ({ hours = 3 }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Generate a fixed end time saved in localStorage so it persists across reloads
    // If it doesn't exist or is in the past, create a new one for 'hours' ahead
    const STORAGE_KEY = 'flash_sale_end_time'
    let endTime = localStorage.getItem(STORAGE_KEY)
    const now = new Date().getTime()

    if (!endTime || parseInt(endTime) < now) {
      endTime = now + hours * 60 * 60 * 1000
      localStorage.setItem(STORAGE_KEY, endTime.toString())
    } else {
      endTime = parseInt(endTime)
    }

    const interval = setInterval(() => {
      const currentTime = new Date().getTime()
      const distance = endTime - currentTime

      if (distance < 0) {
        // Reset timer if expired
        const newEndTime = currentTime + hours * 60 * 60 * 1000
        localStorage.setItem(STORAGE_KEY, newEndTime.toString())
        return
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [hours])

  const formatTime = (time) => time.toString().padStart(2, '0')

  return (
    <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
      <div className="flex items-center gap-1.5" dir="ltr">
        <span className="bg-red-600 text-white font-bold px-2 py-1 flex items-center justify-center rounded-md min-w-[32px] text-xs sm:text-sm tabular-nums shadow-sm">
          {formatTime(timeLeft.seconds)}
        </span>
        <span className="text-red-500 font-bold">:</span>
        <span className="bg-red-600 text-white font-bold px-2 py-1 flex items-center justify-center rounded-md min-w-[32px] text-xs sm:text-sm tabular-nums shadow-sm">
          {formatTime(timeLeft.minutes)}
        </span>
        <span className="text-red-500 font-bold">:</span>
        <span className="bg-red-600 text-white font-bold px-2 py-1 flex items-center justify-center rounded-md min-w-[32px] text-xs sm:text-sm tabular-nums shadow-sm">
          {formatTime(timeLeft.hours)}
        </span>
      </div>
      <div className="flex items-center gap-1 text-red-600 font-semibold text-xs sm:text-sm pr-1 border-r border-red-200" dir="rtl">
        <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        ينتهي العرض خلال
      </div>
    </div>
  )
}

export default CountdownTimer
