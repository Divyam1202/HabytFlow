import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import SupportRequest from '@/models/SupportRequest'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, message } = await req.json()

    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 })
    }

    await connectToDatabase()
    
    const newRequest = new SupportRequest({
      email,
      message
    })
    
    await newRequest.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Support request error:', error)
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check if admin
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session || session.user.email !== 'habytflow@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connectToDatabase()
    
    const requests = await SupportRequest.find().sort({ createdAt: -1 })
    
    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching support requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}
