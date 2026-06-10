'use client'

import { useState, useTransition, useEffect } from 'react'
import { useHabitStore } from '@/stores/habit-store'
import { getDaysInMonth } from '@/utils/date-utils'
import { format, isSameDay } from 'date-fns'
import { toggleHabitEntry } from '@/actions/entry-actions'
import { deleteHabit } from '@/actions/habit-actions'
import { HabitFormModal } from './habit-form-modal'
import { Check, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface HabitTrackerGridProps {
  initialHabits: any[]
}

export function HabitTrackerGrid({ initialHabits }: HabitTrackerGridProps) {
  const { activeMonth } = useHabitStore()
  const days = getDaysInMonth(activeMonth)
  const [isPending, startTransition] = useTransition()

  const [optimisticEntries, setOptimisticEntries] = useState<Record<string, boolean>>({})

  // Reset optimistic state when initialHabits change to avoid stale state, 
  // but be careful not to reset while a transition is pending.
  useEffect(() => {
    if (!isPending) {
      setOptimisticEntries({})
    }
  }, [initialHabits, isPending])

  const handleToggle = async (habitId: string, date: Date, currentStatus: boolean) => {
    const dateStr = date.toISOString().split('T')[0]
    const key = `${habitId}-${dateStr}`
    const newStatus = !currentStatus

    // Optimistic update
    setOptimisticEntries(prev => ({ ...prev, [key]: newStatus }))

    // Server action
    startTransition(() => {
      toggleHabitEntry(habitId, dateStr, newStatus)
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(id)
    }
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="sticky left-0 bg-muted/50 p-4 text-left font-medium min-w-[250px] shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b] z-20">
                Habit
              </th>
              {days.map(day => (
                <th key={day.toISOString()} className="p-2 text-center font-medium min-w-[40px]">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">{format(day, 'EEE')}</span>
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full mt-1 ${isSameDay(day, new Date()) ? 'bg-indigo-600 text-white' : ''}`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialHabits.map(habit => (
              <tr key={habit.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="sticky left-0 bg-background hover:bg-muted/50 p-4 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b] z-10 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${habit.color}`} />
                      <div>
                        <div className="font-medium">{habit.name}</div>
                        {habit.description && <div className="text-xs text-muted-foreground truncate w-32">{habit.description}</div>}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <HabitFormModal habit={habit} trigger={<DropdownMenuItem onSelect={e => e.preventDefault()}><Edit2 className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>} />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(habit.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>

                {days.map(day => {
                  const dateStr = day.toISOString().split('T')[0]
                  const key = `${habit.id}-${dateStr}`

                  // In Prisma, dates come back as Date objects if we fetch them directly, but Server Actions might serialize them as strings.
                  // We'll normalize to ISO strings for comparison.
                  const dbEntry = habit.entries.find((e: any) => {
                    const eDate = e.date instanceof Date ? e.date.toISOString() : new Date(e.date).toISOString()
                    return eDate.split('T')[0] === dateStr
                  })

                  const isCompletedInDb = dbEntry?.completed || false
                  const isCompleted = optimisticEntries[key] !== undefined ? optimisticEntries[key] : isCompletedInDb

                  return (
                    <td key={dateStr} className="p-1 text-center">
                      <button
                        onClick={() => handleToggle(habit.id, day, isCompleted)}
                        className={`w-8 h-8 rounded-md mx-auto flex items-center justify-center transition-all ${isCompleted
                            ? `${habit.color} text-white shadow-sm scale-100`
                            : 'bg-muted/30 hover:bg-muted/80 scale-95 hover:scale-100'
                          }`}
                      >
                        {isCompleted && <Check className="h-4 w-4" />}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
            {initialHabits.length === 0 && (
              <tr>
                <td colSpan={days.length + 1} className="p-8 text-center text-muted-foreground">
                  No habits found. Create your first habit to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
