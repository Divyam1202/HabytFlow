'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import Habit from '@/models/Habit'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const habitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.string().max(50),
  color: z.string().max(50).optional(),
})

export async function createHabit(data: any) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) throw new Error("Unauthorized")

    const validatedData = habitSchema.parse(data)

    await connectToDatabase()

    // Create the habit with default history map
    const newHabit = await Habit.create({
      userId: session.user.id,
      name: validatedData.name,
      description: validatedData.description || null,
      category: validatedData.category,
      color: validatedData.color || 'bg-emerald-500',
      history: new Map()
    })

    revalidatePath('/')
    return { success: true, data: JSON.parse(JSON.stringify(newHabit)) }
  } catch (error: any) {
    console.error('createHabit Error:', error)
    return { success: false, error: 'Failed to create habit.' }
  }
}

export async function updateHabit(id: string, data: any) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) throw new Error("Unauthorized")

    const validatedData = habitSchema.parse(data)

    await connectToDatabase()

    const updated = await Habit.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        name: validatedData.name,
        description: validatedData.description || null,
        category: validatedData.category,
        color: validatedData.color || 'bg-emerald-500',
      }
    )

    if (!updated) throw new Error("Habit not found or unauthorized")

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('updateHabit Error:', error)
    return { success: false, error: 'Failed to update habit.' }
  }
}

export async function deleteHabit(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) throw new Error("Unauthorized")

    await connectToDatabase()

    const deleted = await Habit.findOneAndDelete({ _id: id, userId: session.user.id })
    if (!deleted) throw new Error("Habit not found or unauthorized")

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('deleteHabit Error:', error)
    return { success: false, error: 'Failed to delete habit.' }
  }
}
