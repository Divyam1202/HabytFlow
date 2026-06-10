import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns'

export function getDaysInMonth(date: Date) {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return eachDayOfInterval({ start, end })
}

export function calculateStreaks(entries: { date: Date, completed: boolean }[]) {
  // Sort entries by date descending
  const sorted = [...entries]
    .filter(e => e.completed)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  if (sorted.length === 0) return { currentStreak: 0, longestStreak: 0, totalCompleted: 0 }

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // A more complex streak calculation logic could be here
  // For simplicity, we just count consecutive days in the sorted array

  let previousDate: Date | null = null

  for (let i = 0; i < sorted.length; i++) {
    const entryDate = sorted[i].date
    if (!previousDate) {
      tempStreak = 1
    } else {
      const diffTime = Math.abs(previousDate.getTime() - entryDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        tempStreak++
      } else if (diffDays > 1) {
        if (tempStreak > longestStreak) longestStreak = tempStreak
        tempStreak = 1
      }
    }
    previousDate = entryDate
  }

  if (tempStreak > longestStreak) longestStreak = tempStreak

  // Calculate current streak
  let current = 0
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const hasToday = sorted.some(e => isSameDay(e.date, today))
  const hasYesterday = sorted.some(e => isSameDay(e.date, yesterday))

  if (hasToday || hasYesterday) {
    let checkDate = hasToday ? today : yesterday
    while (sorted.some(e => isSameDay(e.date, checkDate))) {
      current++
      checkDate = new Date(checkDate)
      checkDate.setDate(checkDate.getDate() - 1)
    }
  }

  currentStreak = current

  return {
    currentStreak,
    longestStreak,
    totalCompleted: sorted.length
  }
}
