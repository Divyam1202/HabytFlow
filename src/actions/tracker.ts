'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import Habit from '@/models/Habit'
import DailyMetric from '@/models/DailyMetric'
import SportsLog from '@/models/SportsLog'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const dailyMetricsSchema = z.object({
  hydration: z.number().min(0).max(100).optional(),
  protein: z.number().min(0).max(1000).optional(),
  carbs: z.number().min(0).max(2000).optional(),
  fat: z.number().min(0).max(1000).optional(),
})

export async function toggleHabitTick(userId: string, habitId: string, dateStr: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user || session.user.id !== userId) throw new Error("Unauthorized")

    await connectToDatabase()

    const habit = await Habit.findOne({ _id: habitId, userId })
    if (!habit) throw new Error("Habit not found")

    // Toggle logic
    if (habit.history.get(dateStr)) {
      habit.history.delete(dateStr)
    } else {
      habit.history.set(dateStr, true)
    }

    await habit.save()

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('toggleHabitTick Error:', error)
    return { success: false, error: 'Failed to update habit tracking.' }
  }
}

export async function updateDailyMetrics(
  userId: string, 
  dateStr: string, 
  inputs: { hydration?: number; protein?: number; carbs?: number; fat?: number }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user || session.user.id !== userId) throw new Error("Unauthorized")

    const validatedInputs = dailyMetricsSchema.parse(inputs)

    await connectToDatabase()

    let metric = await DailyMetric.findOne({ userId, date: dateStr })
    if (!metric) {
      metric = new DailyMetric({ userId, date: dateStr })
    }

    if (validatedInputs.protein !== undefined) metric.protein = validatedInputs.protein
    if (validatedInputs.carbs !== undefined) metric.carbs = validatedInputs.carbs
    if (validatedInputs.fat !== undefined) metric.fat = validatedInputs.fat
    if (validatedInputs.hydration !== undefined) metric.hydration = validatedInputs.hydration

    metric.calories = (metric.protein * 4) + (metric.carbs * 4) + (metric.fat * 9)

    await metric.save()

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('updateDailyMetrics Error:', error)
    return { success: false, error: 'Failed to update daily metrics.' }
  }
}

export async function addSportsLog(userId: string, dateStr: string, name: string, durationHours: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user || session.user.id !== userId) throw new Error("Unauthorized")

    if (!name.trim() || durationHours <= 0 || durationHours > 24) {
      throw new Error("Invalid inputs")
    }

    await connectToDatabase()

    await SportsLog.create({
      userId,
      date: dateStr,
      name: name.trim().toUpperCase(),
      durationHours
    })

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('addSportsLog Error:', error)
    return { success: false, error: 'Failed to add sports log.' }
  }
}

export async function clearAllSportsLogs(userId: string, dateStr: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user || session.user.id !== userId) throw new Error("Unauthorized")

    await connectToDatabase()

    await SportsLog.deleteMany({ userId, date: dateStr })

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('clearAllSportsLogs Error:', error)
    return { success: false, error: 'Failed to clear sports logs.' }
  }
}
