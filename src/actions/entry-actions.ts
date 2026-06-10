'use server'

import { revalidatePath } from 'next/cache'
import { connectToDatabase } from '@/lib/db'
import Habit from '@/models/Habit'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function toggleHabitEntry(habitId: string, dateStr: string, newStatus: boolean) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) throw new Error("Unauthorized")

    await connectToDatabase()

    const habit = await Habit.findOne({ _id: habitId, userId: session.user.id })
    if (!habit) throw new Error("Habit not found")

    if (newStatus) {
      habit.history.set(dateStr, true)
    } else {
      habit.history.delete(dateStr)
    }

    await habit.save()

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('toggleHabitEntry Error:', error)
    return { success: false, error: 'Failed to update habit entry.' }
  }
}
