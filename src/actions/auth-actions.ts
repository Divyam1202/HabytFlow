'use server'

import { connectToDatabase } from '@/lib/db'

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  if (!username || username.length < 6) return false
  
  try {
    const mongoose = await connectToDatabase()
    const db = mongoose.connection.db
    if (!db) {
      console.error('Database connection not established properly')
      return false
    }

    // Better Auth stores users in the 'user' collection
    const existingUser = await db.collection('user').findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    })
    
    // If user is null, username is available (true)
    return existingUser === null
  } catch (error) {
    console.error('Failed to check username:', error)
    return false // Fail safe
  }
}
