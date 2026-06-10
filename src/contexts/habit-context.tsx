'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'

export type NutritionState = {
  hydration: number; hydrationGoal: number;
  calories: number; caloriesGoal: number;
  protein: number; proteinGoal: number;
  carbs: number; carbsGoal: number;
}

export type ActivityState = {
  activeMetric: 'sports' | 'hr' | null;
  sportsLog: Array<{ id: string; name: string; duration: number }>;
  hrAverage: number | null;
}

type HabitDef = { id: number; name: string; category: string; time: string }
export type GridHabit = HabitDef & { days: {day: number; completed: boolean}[] }

export type HabitContextType = {
  currentSystemDate: string;
  todayHabits: number[];
  toggleTodayHabit: (id: number) => void;
  
  todayNutrition: NutritionState;
  updateNutrition: (updater: (prev: NutritionState) => NutritionState) => void;
  
  todayActivity: ActivityState;
  updateActivity: (updater: (prev: ActivityState) => ActivityState) => void;
  
  gridData: GridHabit[];
  toggleGridHabit: (habitId: number, dayNum: number) => void;
  
  heatmapData: Array<{ id: number; count: number }>;
}

const HabitContext = createContext<HabitContextType | null>(null)

export const useHabitContext = () => {
  const ctx = useContext(HabitContext)
  if (!ctx) throw new Error("useHabitContext must be used within HabitProvider")
  return ctx
}

// --- Initial Seed Data ---
const MOCK_HABITS: HabitDef[] = [
  { id: 1, name: "Gym", category: "Fitness", time: "18:00" },
  { id: 2, name: "Reading", category: "Mind", time: "21:30" },
  { id: 3, name: "Coding", category: "Work", time: "09:00" },
  { id: 4, name: "Meditation", category: "Mind", time: "07:00" },
  { id: 5, name: "No Spend", category: "Finance", time: "" }
]

const SEED_GRID_DATA = MOCK_HABITS.map(habit => ({
  ...habit,
  days: Array.from({ length: 30 }).map((_, i) => ({
    day: i + 1,
    completed: (i + habit.id) % 3 === 0 || (i + habit.id) % 7 === 0
  }))
}))

const SEED_HEATMAP = Array.from({ length: 364 }).map((_, i) => {
  let count = 0
  if (i >= 50 && i < 195) {
    count = (i % 3 === 0) ? 4 : (i % 2 === 0) ? 2 : 1
  } else {
    if (i % 8 === 0) count = 5
    else if (i % 5 === 0) count = 3
    else if (i % 2 === 0) count = 1
  }
  return { id: i, count }
})

const INITIAL_NUTRITION: NutritionState = {
  hydration: 0, hydrationGoal: 2500,
  calories: 0, caloriesGoal: 2000,
  protein: 0, proteinGoal: 150,
  carbs: 0, carbsGoal: 250
}

const INITIAL_ACTIVITY: ActivityState = {
  activeMetric: null,
  sportsLog: [],
  hrAverage: null
}

const getLocalYYYYMMDD = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { requireAuth } = useAuth()
  
  const [currentSystemDate, setCurrentSystemDate] = useState<string>(() => getLocalYYYYMMDD())
  const [todayHabits, setTodayHabits] = useState<number[]>([])
  const [todayNutrition, setTodayNutrition] = useState<NutritionState>(INITIAL_NUTRITION)
  const [todayActivity, setTodayActivity] = useState<ActivityState>(INITIAL_ACTIVITY)
  
  const [gridData, setGridData] = useState<GridHabit[]>(SEED_GRID_DATA)
  const [heatmapData, setHeatmapData] = useState<{id: number, count: number}[]>(SEED_HEATMAP)

  // Hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem('habitflow_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        setCurrentSystemDate(parsed.currentSystemDate || getLocalYYYYMMDD())
        setTodayHabits(parsed.todayHabits || [])
        setTodayNutrition(parsed.todayNutrition || INITIAL_NUTRITION)
        setTodayActivity(parsed.todayActivity || INITIAL_ACTIVITY)
        setGridData(parsed.gridData || SEED_GRID_DATA)
        setHeatmapData(parsed.heatmapData || SEED_HEATMAP)
      }
    } catch (e) {
      console.error("Failed to parse habit state", e)
    }
    setMounted(true)
  }, [])

  // Persistence & Rollover Check
  useEffect(() => {
    if (!mounted) return

    const stateToSave = {
      currentSystemDate, todayHabits, todayNutrition, todayActivity, gridData, heatmapData
    }
    localStorage.setItem('habitflow_state', JSON.stringify(stateToSave))

  }, [mounted, currentSystemDate, todayHabits, todayNutrition, todayActivity, gridData, heatmapData])

  // Midnight Rollover Engine
  useEffect(() => {
    if (!mounted) return

    const checkRollover = () => {
      const nowStr = getLocalYYYYMMDD()
      if (nowStr !== currentSystemDate) {
        console.log(`[HabitFlow Engine] Rollover triggered: ${currentSystemDate} -> ${nowStr}`);
        
        // 1. Archive: Append today's total ticks to heatmap
        const totalTicks = todayHabits.length
        setHeatmapData(prev => {
          const newMap = [...prev.slice(1)] // shift 1 day off
          newMap.push({ id: prev.length ? prev[prev.length - 1].id + 1 : 0, count: totalTicks })
          return newMap
        })

        // 2. Archive: Shift Grid 1 day forward
        setGridData(prev => prev.map(h => {
          const wasCompleted = todayHabits.includes(h.id)
          const newDays = [...h.days]
          // The last element in days is roughly "today" in the 30-day window
          // We lock yesterday's completion status into the grid if it isn't already there.
          // For a true rolling window, we drop day 0, shift everything, and add a blank day.
          newDays.shift()
          const lastDayNum = newDays[newDays.length - 1].day
          newDays.push({ day: lastDayNum + 1, completed: false })
          return { ...h, days: newDays }
        }))

        // 3. Reset Today
        setTodayHabits([])
        // Keep goals, reset actuals
        setTodayNutrition(prev => ({
          ...prev, hydration: 0, calories: 0, protein: 0, carbs: 0
        }))
        setTodayActivity({ activeMetric: null, sportsLog: [], hrAverage: null })
        
        // 4. Advance System Date
        setCurrentSystemDate(nowStr)
      }
    }

    // Check immediately on focus/mount
    checkRollover()
    window.addEventListener('focus', checkRollover)
    
    // Check every minute
    const interval = setInterval(checkRollover, 60000)

    return () => {
      window.removeEventListener('focus', checkRollover)
      clearInterval(interval)
    }
  }, [mounted, currentSystemDate, todayHabits])

  const toggleTodayHabit = (id: number) => {
    requireAuth(() => {
      setTodayHabits(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
      // Sync to gridData's "last day" which represents today
      setGridData(prev => prev.map(h => {
        if (h.id !== id) return h
        const newDays = [...h.days]
        const lastIdx = newDays.length - 1
        newDays[lastIdx] = { ...newDays[lastIdx], completed: !newDays[lastIdx].completed }
        return { ...h, days: newDays }
      }))
    })
  }

  const toggleGridHabit = (habitId: number, dayNum: number) => {
    requireAuth(() => {
      setGridData(prev => prev.map(h => {
        if (h.id !== habitId) return h
        return {
          ...h,
          days: h.days.map(d => d.day === dayNum ? { ...d, completed: !d.completed } : d)
        }
      }))
    })
  }

  const updateNutritionWrapped = (updater: (prev: NutritionState) => NutritionState) => {
    requireAuth(() => setTodayNutrition(updater))
  }

  const updateActivityWrapped = (updater: (prev: ActivityState) => ActivityState) => {
    requireAuth(() => setTodayActivity(updater))
  }

  return (
    <HabitContext.Provider value={{
      currentSystemDate,
      todayHabits, toggleTodayHabit,
      todayNutrition, updateNutrition: updateNutritionWrapped,
      todayActivity, updateActivity: updateActivityWrapped,
      gridData, toggleGridHabit,
      heatmapData
    }}>
      {children}
    </HabitContext.Provider>
  )
}
