'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import Note from '@/models/Note'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const noteSchema = z.object({
  dateStr: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  text: z.string().max(2000),
})

export async function saveDayNote(dateStr: string, text: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) throw new Error("Unauthorized")

    const validatedData = noteSchema.parse({ dateStr, text })

    await connectToDatabase()

    if (!validatedData.text.trim()) {
      await Note.findOneAndDelete({ userId: session.user.id, date: validatedData.dateStr })
    } else {
      await Note.findOneAndUpdate(
        { userId: session.user.id, date: validatedData.dateStr },
        { content: validatedData.text },
        { upsert: true, new: true }
      )
    }

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('saveDayNote Error:', error)
    return { success: false, error: 'Failed to save note.' }
  }
}
