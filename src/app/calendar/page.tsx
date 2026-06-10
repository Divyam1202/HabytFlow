'use client'

import React from 'react'

export default function CalendarPage() {
  const days = Array.from({ length: 35 }).map((_, i) => i - 3)

  return (
    <div className="max-w-[1000px] mx-auto px-6 pt-12 pb-24 space-y-12">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">Calendar View</h1>
          <p className="text-zinc-500 mt-2 text-sm">Monthly overview of all your daily ticks.</p>
        </div>
        <div className="text-xl font-bold uppercase tracking-widest text-white">
          June 2026
        </div>
      </div>

      <div className="border border-zinc-800 bg-black">
        <div className="grid grid-cols-7 border-b border-zinc-800">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="py-4 text-center text-xs font-bold uppercase tracking-widest text-zinc-500 border-r border-zinc-800 last:border-0">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const isCurrentMonth = day > 0 && day <= 30
            const isToday = day === 7
            const completionClass = isToday ? 'bg-white text-black' : isCurrentMonth ? 'hover:bg-zinc-900 cursor-pointer text-white' : 'text-zinc-700 bg-zinc-950'
            
            return (
              <div 
                key={idx} 
                className={`min-h-[120px] p-4 border-r border-b border-zinc-800 last:border-r-0 ${completionClass}`}
              >
                <div className={`text-sm font-bold ${isToday ? 'text-black' : ''}`}>
                  {day > 0 ? (day > 30 ? day - 30 : day) : 31 + day}
                </div>
                {isCurrentMonth && day % 3 === 0 && (
                  <div className="mt-4 space-y-1">
                    <div className="h-1.5 w-full bg-zinc-800" />
                    <div className="h-1.5 w-3/4 bg-zinc-800" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
