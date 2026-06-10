'use client'

import React, { useState } from 'react'
import { Plus, Settings2, Trash2, X, Clock, Bell } from 'lucide-react'
import { useSettings, formatTime } from '@/hooks/useSettings'

const INITIAL_HABITS = [
  { id: 1, name: "Gym", category: "Fitness", streak: 30, goal: "Daily", time: "18:00", notification: "30 mins" },
  { id: 2, name: "Reading", category: "Mind", streak: 12, goal: "Daily", time: "21:30", notification: "15 mins" },
  { id: 3, name: "Coding", category: "Work", streak: 7, goal: "Weekdays", time: "09:00", notification: "5 mins" },
  { id: 4, name: "Meditation", category: "Mind", streak: 45, goal: "Daily", time: "07:00", notification: "None" },
  { id: 5, name: "No Spend", category: "Finance", streak: 3, goal: "Daily", time: "", notification: "None" }
]

const NOTIFICATION_OPTIONS = ['None', '5 mins', '15 mins', '30 mins', '1 hr']

export default function HabitsPage() {
  const { timeFormat } = useSettings()
  const [habits, setHabits] = useState(INITIAL_HABITS)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Fitness')
  const [goal, setGoal] = useState('Daily')
  const [time, setTime] = useState('')
  const [notification, setNotification] = useState('None')

  const resetForm = () => {
    setName('')
    setCategory('Fitness')
    setGoal('Daily')
    setTime('')
    setNotification('None')
    setIsEditing(null)
    setShowAddForm(false)
  }

  const handleEdit = (habit: typeof INITIAL_HABITS[0]) => {
    setName(habit.name)
    setCategory(habit.category)
    setGoal(habit.goal)
    setTime(habit.time)
    setNotification(habit.notification)
    setIsEditing(habit.id)
    setShowAddForm(true)
  }

  const handleDelete = (id: number) => {
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (isEditing) {
      setHabits(prev => prev.map(h => h.id === isEditing ? { ...h, name, category, goal, time, notification } : h))
    } else {
      const newHabit = {
        id: Date.now(),
        name,
        category,
        goal,
        streak: 0,
        time,
        notification
      }
      setHabits(prev => [...prev, newHabit])
    }
    resetForm()
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 pt-12 pb-24 space-y-12 relative">

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Manage Habits</h1>
          <p className="text-zinc-500 mt-2 text-sm">Configure your routines, digital timings, and notifications.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-sm hover:bg-zinc-200 transition-colors"
        >
          <Plus size={18} /> New Habit
        </button>
      </div>

      <div className="border border-zinc-800 bg-black">
        {habits.map((habit, idx) => (
          <div key={habit.id} className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${idx !== habits.length - 1 ? 'border-b border-zinc-800' : ''}`}>
            <div>
              <h3 className="font-bold text-lg text-white">{habit.name}</h3>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-medium uppercase tracking-widest text-zinc-500">
                <span>{habit.category}</span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                <span>{habit.goal}</span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                <span className="text-white flex items-center gap-1">🔥 {habit.streak} Days</span>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
              {/* Timing & Notification Block */}
              <div className="flex items-center gap-4 border border-zinc-800 px-4 py-2 bg-zinc-950">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-zinc-500" />
                  <span className="text-xs font-black text-white tabular-nums">{formatTime(habit.time, timeFormat)}</span>
                </div>
                <div className="w-[1px] h-4 bg-zinc-800" />
                <div className="flex items-center gap-2">
                  <Bell size={14} className={habit.notification !== 'None' ? 'text-zinc-300' : 'text-zinc-700'} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${habit.notification !== 'None' ? 'text-zinc-400' : 'text-zinc-700'}`}>{habit.notification}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(habit)} className="p-3 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white transition-colors">
                  <Settings2 size={18} />
                </button>
                <button onClick={() => handleDelete(habit.id)} className="p-3 border border-zinc-800 hover:border-red-900 hover:bg-red-950 text-zinc-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {habits.length === 0 && (
          <div className="p-12 text-center text-zinc-500 uppercase tracking-widest text-xs font-bold">
            No habits configured.
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-black border border-zinc-800 w-full max-w-[500px] p-6 shadow-2xl relative">
            <button onClick={resetForm} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold uppercase tracking-tight text-white mb-6">
              {isEditing ? 'Edit Habit' : 'Create New Habit'}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Habit Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                  placeholder="e.g., Deep Work"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:outline-none focus:border-zinc-500 appearance-none"
                  >
                    <option>Fitness</option>
                    <option>Mind</option>
                    <option>Work</option>
                    <option>Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Goal Frequency</label>
                  <select
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:outline-none focus:border-zinc-500 appearance-none"
                  >
                    <option>Daily</option>
                    <option>Weekdays</option>
                    <option>Weekends</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-6 mt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2"><Clock size={14} /> Timing & Notifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Digital Time (Optional)</label>
                    <input
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Remind Before</label>
                    <select
                      value={notification}
                      onChange={e => setNotification(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:outline-none focus:border-zinc-500 appearance-none"
                    >
                      {NOTIFICATION_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-white text-black font-bold uppercase tracking-wider text-sm hover:bg-zinc-200 transition-colors">
                  {isEditing ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
