'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'

const DynamicResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)
import { Check, Flame, Rocket, ChevronLeft, ChevronRight, Minus } from 'lucide-react'
import { NutritionTracker } from '@/components/dashboard/nutrition-tracker'
import { ActivityMetricsTracker } from '@/components/dashboard/activity-metrics-tracker'
import { CanvasLoader } from '@/components/ui/canvas-loader'
import { useSettings, formatTime } from '@/hooks/useSettings'
import { useHabitContext } from '@/contexts/habit-context'
import { useAuth } from '@/contexts/auth-context'



export default function BrutalistDashboard() {
  const { timeFormat } = useSettings()
  const { gridData, heatmapData, todayHabits, toggleTodayHabit, toggleGridHabit, hasStartedJourney, initializeJourney } = useHabitContext()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState<'all' | 1 | 2 | 3 | 4>('all')
  const [animatingCells, setAnimatingCells] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const checkStagnant = () => {
      const STAGNANT_TIME = 5 * 60 * 1000; // 5 minutes
      const now = Date.now();

      const hasSeenLoader = sessionStorage.getItem('habitflow_has_seen_loader');
      const lastActiveStr = localStorage.getItem('habitflow_last_active');

      if (!hasSeenLoader) {
        // First time loading in this session
        setLoading(true);
        sessionStorage.setItem('habitflow_has_seen_loader', 'true');
      } else if (lastActiveStr) {
        // Returning user, check if stagnant
        const lastActive = parseInt(lastActiveStr, 10);
        if (now - lastActive > STAGNANT_TIME) {
          setLoading(true);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    // Check initially
    checkStagnant();

    // Check again when user refocuses tab
    const onFocus = () => checkStagnant();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Calculate daily completion rate dynamically based on grid state
  const dailyCompletionRate = Array.from({ length: 30 }).map((_, i) => {
    let completedCount = 0
    let scheduledCount = 0
    const dateForDay = new Date();
    dateForDay.setDate(dateForDay.getDate() - (30 - (i + 1)));
    const dayOfWeek = dateForDay.getDay();

    gridData.forEach(habit => {
      if (!habit.frequency || habit.frequency.includes(dayOfWeek)) {
        scheduledCount++;
        if (habit.days[i]?.completed) completedCount++;
      }
    })
    const percentage = scheduledCount ? Math.round((completedCount / scheduledCount) * 100) : 0
    return { day: i + 1, rate: percentage }
  })

  const filteredCompletionRate = selectedWeek === 'all'
    ? dailyCompletionRate
    : dailyCompletionRate.filter(d => {
      if (selectedWeek === 1) return d.day >= 1 && d.day <= 7;
      if (selectedWeek === 2) return d.day >= 8 && d.day <= 14;
      if (selectedWeek === 3) return d.day >= 15 && d.day <= 21;
      if (selectedWeek === 4) return d.day >= 22 && d.day <= 30;
      return true;
    });



  const toggleDay = (habitId: number, dayNum: number) => {
    const key = `${habitId}-${dayNum}`
    setAnimatingCells(prev => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setAnimatingCells(prev => ({ ...prev, [key]: false }))
    }, 300)

    toggleGridHabit(habitId, dayNum)
  }

  // Helper for heatmap colors
  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-zinc-900'
    if (count <= 2) return 'bg-white'
    if (count <= 4) return 'bg-green-500'
    return 'bg-green-800'
  }

  // Calculate consecutive missed days up to the most recent day in the grid window
  const getStatusColor = (days: { day: number, completed: boolean }[]) => {
    let missedDays = 0;
    for (let i = days.length - 1; i >= Math.max(0, days.length - 7); i--) {
      if (!days[i]?.completed) missedDays++;
      else break;
    }
    if (missedDays >= 7) return 'bg-red-500' // Danger zone (> 1 week)
    if (missedDays >= 1) return 'bg-yellow-500' // Losing habit (1-6 days)
    return 'bg-green-500' // Active streak
  }

  return (
    <>
      {loading && <CanvasLoader onComplete={() => setLoading(false)} />}

      <div className={`max-w-[1000px] mx-auto px-6 pt-8 pb-24 space-y-8 ${loading ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100 transition-opacity duration-700'}`}>
      
        {/* Initialize Journey Banner */}
        {isAuthenticated && !hasStartedJourney && !loading && (
          <div className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Rocket className="w-6 h-6 text-white" />
                <h2 className="text-xl font-black uppercase tracking-tighter text-white">Initialize Your Journey</h2>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                Welcome to HabytFLow. You are currently viewing simulated preview data. To begin tracking your real activity, initialize your profile. This will erase the preview data and prepare a blank slate.
              </p>
            </div>
            <button 
              onClick={() => {
                initializeJourney()
                router.push('/habits')
              }}
              className="w-full md:w-auto px-8 bg-green-500 text-black py-4 font-black uppercase tracking-widest text-sm hover:bg-green-400 transition-colors flex items-center justify-center gap-2 group relative z-10 whitespace-nowrap"
            >
              Start Tracking
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}



        {/* Section B: Today's Action Items */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {gridData.length === 0 && (
            <div className="col-span-full border border-zinc-800 bg-zinc-950 p-8 flex flex-col items-center justify-center text-center">
              <h3 className="text-white text-lg font-bold uppercase tracking-widest mb-2">No Habits Configured</h3>
              <p className="text-zinc-500 text-sm mb-6">You haven't set up any habits to track yet.</p>
              <button onClick={() => router.push('/habits')} className="bg-white text-black px-6 py-2 font-bold uppercase tracking-wider text-xs hover:bg-zinc-200 transition-colors">
                Go to Manage Habits
              </button>
            </div>
          )}
          {gridData.length > 0 && gridData.filter(h => h.frequency ? h.frequency.includes(new Date().getDay()) : true).length === 0 && (
            <div className="col-span-full border border-zinc-800 bg-zinc-950 p-8 flex flex-col items-center justify-center text-center">
              <h3 className="text-white text-lg font-bold uppercase tracking-widest mb-2">Rest Day</h3>
              <p className="text-zinc-500 text-sm">You have no habits scheduled for today.</p>
            </div>
          )}
          {gridData.filter(habit => habit.frequency ? habit.frequency.includes(new Date().getDay()) : true).map(habit => {
            const isCompleted = todayHabits.includes(habit.id);

            // Assign brutalist colors based on ID
            let colorClass = "";
            if (habit.id === 1) colorClass = "bg-[#ef4444] text-black border-[#ef4444]";
            else if (habit.id === 2) colorClass = "bg-[#3b82f6] text-black border-[#3b82f6]";
            else if (habit.id === 3) colorClass = "bg-[#eab308] text-black border-[#eab308]";
            else if (habit.id === 4) colorClass = "bg-[#a855f7] text-black border-[#a855f7]";
            else colorClass = "bg-[#22c55e] text-black border-[#22c55e]";

            if (isCompleted) {
              colorClass = "bg-zinc-900 text-zinc-600 border-zinc-800 opacity-50 grayscale";
            }

            return (
              <button
                key={habit.id}
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
                  toggleTodayHabit(habit.id);
                }}
                className={`p-4 flex flex-col justify-between min-h-[100px] border rounded-[1px] transition-all duration-300 transform active:scale-95 text-left ${colorClass}`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{habit.category}</span>
                  {habit.time && (
                    <span className="text-[10px] font-black text-white tracking-widest bg-black/30 px-1.5 py-0.5 rounded-[1px] shadow-sm">
                      {formatTime(habit.time, timeFormat)}
                    </span>
                  )}
                </div>
                <span className="text-lg font-black uppercase leading-tight mt-2">{habit.name}</span>
              </button>
            )
          })}
        </div>

        {/* Nutrition Trackers inserted above line graph */}
        <NutritionTracker />

        {/* Activity Metrics (Sports & HR) */}
        <ActivityMetricsTracker />

        {/* Compressed Monthly Habit Matrix */}
        <div className="overflow-x-auto bg-black p-4 border border-zinc-900 rounded-[1px]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-zinc-500">
                <th className="font-bold py-2 pr-4 uppercase tracking-wider w-40 text-[10px]">Habit</th>
                {Array.from({ length: 30 }).map((_, i) => (
                  <th key={i} className="font-normal w-5 text-center text-[9px] pb-2">{i + 1}</th>
                ))}
                <th className="font-bold py-2 pl-4 uppercase tracking-wider text-right text-[10px] w-20">Time</th>
              </tr>
            </thead>
            <tbody>
              {gridData.length === 0 && (
                <tr>
                  <td colSpan={32} className="text-center text-zinc-600 text-xs py-8 uppercase tracking-widest">No tracking data available</td>
                </tr>
              )}
              {gridData.map((habit) => (
                <tr key={habit.id}>
                  <td className="py-1.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="grid grid-cols-2 gap-0.5">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className={`w-[3px] h-[3px] ${getStatusColor(habit.days)}`} />
                        ))}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs leading-none">{habit.name}</div>
                        <div className="text-[9px] text-zinc-600 mt-0.5 uppercase tracking-wider">{habit.category}</div>
                      </div>
                    </div>
                  </td>
                  {habit.days.map((d, index) => {
                    const isAnimating = animatingCells[`${habit.id}-${d.day}`]
                    const dateForDay = new Date();
                    dateForDay.setDate(dateForDay.getDate() - (30 - d.day));
                    const isScheduled = habit.frequency ? habit.frequency.includes(dateForDay.getDay()) : true;

                    if (!isScheduled) {
                      return (
                        <td key={d.day || index} className="text-center p-0.5">
                          <div className="mx-auto w-4 h-4 flex items-center justify-center rounded-[1px] bg-transparent opacity-20 cursor-not-allowed">
                            <div className="w-[3px] h-[3px] bg-zinc-700 rounded-full" />
                          </div>
                        </td>
                      )
                    }

                    return (
                      <td key={d.day || index} className="text-center p-0.5 cursor-pointer" onClick={() => toggleDay(habit.id, d.day)}>
                        <div className={`mx-auto w-4 h-4 flex items-center justify-center rounded-[1px] transition-all duration-100 ease-out group ${isAnimating ? 'scale-[2] bg-white rotate-12 shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10 relative' : d.completed ? 'bg-white text-black hover:opacity-80' : 'bg-transparent border border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-white hover:scale-105'}`}>
                          {d.completed ? (
                            <>
                              <Check strokeWidth={4} size={isAnimating ? 6 : 10} className="transition-all group-hover:hidden" />
                              <Minus strokeWidth={4} size={10} className="hidden group-hover:block transition-all" />
                            </>
                          ) : (
                            <span className="text-[8px]">{d.day}</span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                  <td className="pl-4 text-right">
                    {habit.time ? (
                      <div className="inline-block text-[11px] font-black text-white bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-[1px]">
                        {formatTime(habit.time, timeFormat)}
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-700 font-bold tracking-widest">--:--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6">
          {/* Flatline Completion Graph */}
          <div className="border border-zinc-900 bg-black p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white">Completion Trend</h3>
              <div className="flex items-center gap-2">
                {(['all', 1, 2, 3, 4] as const).map(w => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-[1px] border ${selectedWeek === w ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-white transition-colors'}`}
                  >
                    {w === 'all' ? 'Month' : `Wk ${w}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-40 w-full -ml-2">
              <DynamicResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredCompletionRate} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#52525b' }}
                    dy={10}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 50, 100]}
                    tickFormatter={(val) => `${val}%`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#52525b' }}
                  />
                  <Tooltip
                    cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#ffffff', color: '#000000', border: 'none', borderRadius: '0px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ color: '#000000' }}
                    labelStyle={{ color: '#000000', marginBottom: '4px' }}
                    formatter={(value: any) => [`${value}% completed`, 'Trend']}
                    labelFormatter={(label) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (30 - Number(label)));
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    }}
                  />
                  {(selectedWeek === 'all' || selectedWeek === 4) && (
                    <ReferenceLine x={30} stroke="#52525b" strokeDasharray="3 3" />
                  )}
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#ffffff"
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#000', stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 4, fill: '#fff' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </DynamicResponsiveContainer>
            </div>
          </div>
        </div>



        {/* Micro Yearly Heatmap */}
        <div className="border border-zinc-900 bg-black p-4 overflow-x-auto">
          <div className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white">Yearly Matrix</h3>
          </div>
          <div className="flex items-start gap-3 min-w-max">
            <div className="flex flex-col justify-between text-[8px] text-zinc-600 uppercase tracking-widest h-[76px] pt-[14px] pb-1 pr-1">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-[8px] text-zinc-600 uppercase tracking-widest mb-1.5 pl-1 pr-8">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
              </div>
              <div className="grid grid-rows-7 grid-flow-col gap-[2px]">
                {heatmapData.map((day) => (
                  <div
                    key={day.id}
                    className={`w-2.5 h-2.5 rounded-[1px] transition-all duration-150 ease-out hover:scale-125 hover:bg-white hover:z-10 relative group ${getHeatmapColor(day.count)}`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-white text-black text-[10px] font-bold px-2 py-1 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                      Day {day.id + 1}: {day.count} Habits
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
