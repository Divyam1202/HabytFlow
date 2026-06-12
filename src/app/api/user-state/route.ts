import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import UserState from '@/models/UserState'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const userState = await UserState.findOne({ userId: session.user.id })
    
    if (!userState) {
      return NextResponse.json({ stateData: null })
    }
    
    return NextResponse.json({ stateData: userState.stateData })
  } catch (error) {
    console.error('Error fetching user state:', error)
    return NextResponse.json({ error: 'Failed to fetch user state' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { stateData } = await req.json()

    if (!stateData) {
      return NextResponse.json({ error: 'stateData is required' }, { status: 400 })
    }

    await connectToDatabase()
    
    // Upsert the user state
    await UserState.findOneAndUpdate(
      { userId: session.user.id },
      { stateData },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving user state:', error)
    return NextResponse.json({ error: 'Failed to save user state' }, { status: 500 })
  }
}
