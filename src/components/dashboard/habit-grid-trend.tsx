import React, { useState } from 'react';

interface HabitTrackerProps {
  habitId: number;
  habitName: string;
  habitCategory: string;
  habitTime: string | null;
  habitColor: string; // e.g., 'bg-[#3b82f6]', 'bg-[#ef4444]'
  completedDays: number[]; 
  totalDays: number;
  onToggleDay: (habitId: number, day: number) => void;
}

export const HabitGridTrend = ({
  habitId,
  habitName,
  habitCategory,
  habitTime,
  habitColor,
  completedDays,
  totalDays = 30, // Default rolling 30 days
  onToggleDay,
}: HabitTrackerProps) => {
  
  // Create an iterable array running from [1, 2, 3, ..., 30]
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Get the current day number right now to highlight or track today
  const today = new Date().getDate(); // Note: since our grid is a rolling 30 days, "today" is always day 30.
  // Actually, in the old table, Day 30 is today.
  // Let's check `page.tsx` old table logic:
  // "Calculate consecutive missed days up to the most recent day in the grid window"
  // Actually, our old grid data was just 1-30. Let's assume day 30 is today.
  const todayDay = 30;

  const [animatingCells, setAnimatingCells] = useState<Record<number, boolean>>({});

  const handleToggle = (day: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    
    setAnimatingCells(prev => ({ ...prev, [day]: true }));
    setTimeout(() => {
      setAnimatingCells(prev => ({ ...prev, [day]: false }));
    }, 300);

    onToggleDay(habitId, day);
  };

  return (
    <div className="w-full bg-black border border-zinc-800 rounded-[1px] p-5 font-sans hover:border-zinc-600 transition-colors duration-300">
      {/* Header Info Area */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{habitCategory}</span>
          <h3 className="text-white font-black uppercase tracking-wider text-sm mt-1">{habitName}</h3>
        </div>
        <div className="flex flex-col items-end">
          {habitTime && (
            <span className="text-[10px] font-bold text-white tracking-widest bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-[1px] mb-1">
              {habitTime}
            </span>
          )}
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            {completedDays.length}/{totalDays} Days
          </span>
        </div>
      </div>

      {/* 30-Day Trend Matrix Grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysArray.map((day) => {
          // Check if this iteration step matches a completed logged token
          const isDone = completedDays.includes(day);
          const isToday = day === todayDay;
          const isAnimating = animatingCells[day];

          // Calculate actual calendar date for this square
          const dateForDay = new Date();
          dateForDay.setDate(dateForDay.getDate() - (totalDays - day));
          const actualDayOfMonth = dateForDay.getDate();

          return (
            <button
              key={day}
              onClick={() => handleToggle(day)}
              className={`
                relative aspect-square rounded-[1px] flex items-center justify-center text-[10px] font-bold transition-all duration-200 select-none cursor-pointer
                ${isAnimating ? 'scale-125 z-10 shadow-[0_0_15px_rgba(255,255,255,0.5)] bg-white text-black rotate-6' : ''}
                ${!isAnimating && isDone 
                  ? `${habitColor} text-black` // Done: Displays Habit Color
                  : !isAnimating ? 'bg-transparent border border-zinc-800 text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-600' : '' // Unchecked
                }
                ${isToday && !isDone && !isAnimating ? 'border-zinc-500' : ''}
              `}
              title={`${dateForDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${isDone ? '(Completed)' : '(Unchecked)'}`}
            >
              {isDone && !isAnimating ? '' : actualDayOfMonth}
              
              {/* Subtle indicator dot exclusively tracking "Today" if it isn't completed yet */}
              {isToday && !isDone && !isAnimating && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-zinc-500" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Visual System Footer Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-zinc-900 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-[1px] border border-zinc-800" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-[1px] ${habitColor}`} />
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};
