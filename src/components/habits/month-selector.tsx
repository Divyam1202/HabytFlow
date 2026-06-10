'use client'

import { useHabitStore } from '@/stores/habit-store'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export function MonthSelector() {
  const { activeMonth, nextMonth, prevMonth, setActiveMonth } = useHabitStore()

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="icon" onClick={prevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="w-40 text-center font-semibold text-lg">
        {format(activeMonth, 'MMMM yyyy')}
      </div>
      <Button variant="outline" size="icon" onClick={nextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button variant="ghost" onClick={() => setActiveMonth(new Date())} className="ml-2">
        Today
      </Button>
    </div>
  )
}
