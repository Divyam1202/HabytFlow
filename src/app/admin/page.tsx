import { connectToDatabase } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import SupportRequest from '@/models/SupportRequest'
import TelemetryEvent from '@/models/TelemetryEvent'
import mongoose from 'mongoose'
import { Users, Activity, Clock, MessageSquare, ShieldAlert, BarChart3, Database } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminDashboard(props: Props) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.email !== 'habytflow@gmail.com') {
    redirect('/')
  }

  const searchParams = await props.searchParams
  const activeTab = typeof searchParams.tab === 'string' ? searchParams.tab : 'users'

  await connectToDatabase()

  const db = mongoose.connection.db
  if (!db) throw new Error("No db connection")

  // --- GLOBAL METRICS ---
  const launchDate = new Date('2026-06-11')
  const daysLive = Math.max(1, Math.floor((Date.now() - launchDate.getTime()) / (1000 * 60 * 60 * 24)))

  // --- TAB: USERS ---
  let usersList: any[] = []
  if (activeTab === 'users') {
    const usersCollection = db.collection('user')
    const rawUsers = await usersCollection.find().sort({ createdAt: -1 }).toArray()
    usersList = rawUsers.map(u => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'
    }))
  }

  // --- TAB: SUPPORT ---
  let supportRequests: any[] = []
  if (activeTab === 'support') {
    const rawRequests = await SupportRequest.find().sort({ createdAt: -1 }).lean()
    supportRequests = rawRequests.map(req => ({
      _id: req._id?.toString(),
      email: req.email,
      type: req.type || 'issue',
      message: req.message,
      status: req.status,
      createdAt: (req.createdAt as Date).toLocaleDateString()
    }))
  }

  // --- TAB: ANALYTICS ---
  let analytics = {
    totalJourneys: 0,
    topHabits: [] as any[],
    topCategories: [] as any[],
    activeSessions: 0
  }
  if (activeTab === 'analytics') {
    const sessionsCollection = db.collection('session')
    analytics.activeSessions = await sessionsCollection.countDocuments({
      expiresAt: { $gt: new Date() }
    })

    analytics.totalJourneys = await TelemetryEvent.countDocuments({ eventType: 'journey_started' })

    const topHabitsAgg = await TelemetryEvent.aggregate([
      { $match: { eventType: { $in: ['habit_created', 'habit_completed'] } } },
      { $group: { _id: "$metadata.habitName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])
    analytics.topHabits = topHabitsAgg

    const topCategoriesAgg = await TelemetryEvent.aggregate([
      { $match: { eventType: { $in: ['habit_created', 'habit_completed'] }, "metadata.category": { $ne: null } } },
      { $group: { _id: "$metadata.category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])
    analytics.topCategories = topCategoriesAgg
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-24 space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Admin Operations</h1>
            <p className="text-zinc-500 text-sm font-bold tracking-widest uppercase mt-1">Classified Dashboard • {daysLive} Days Live</p>
          </div>
        </div>
        <Link href="/" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
          Exit to App
        </Link>
      </div>

      <div className="flex border-b border-zinc-800">
        <Link 
          href="?tab=users" 
          className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'users' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Users size={16} /> Users
        </Link>
        <Link 
          href="?tab=support" 
          className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'support' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <MessageSquare size={16} /> Support Desk
        </Link>
        <Link 
          href="?tab=analytics" 
          className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'analytics' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <BarChart3 size={16} /> Analytics
        </Link>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold uppercase tracking-tight">Registered Users</h2>
          <div className="border border-zinc-800 bg-black overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50">
                  <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-zinc-500">Name</th>
                  <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-zinc-500">Email</th>
                  <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-zinc-500">Joined</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
                      No users found
                    </td>
                  </tr>
                )}
                {usersList.map(u => (
                  <tr key={u._id} className="border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6 text-sm text-white font-medium">{u.name}</td>
                    <td className="py-4 px-6 text-sm text-zinc-400">{u.email}</td>
                    <td className="py-4 px-6 text-sm text-zinc-500">{u.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold uppercase tracking-tight">Support & Feature Requests</h2>
          <div className="border border-zinc-800 bg-black overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50">
                  <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-zinc-500">Date</th>
                  <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-zinc-500">Email</th>
                  <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-zinc-500">Type</th>
                  <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-zinc-500">Message</th>
                </tr>
              </thead>
              <tbody>
                {supportRequests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
                      No support requests found
                    </td>
                  </tr>
                )}
                {supportRequests.map(req => (
                  <tr key={req._id} className="border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6 text-sm text-zinc-500 whitespace-nowrap">{req.createdAt}</td>
                    <td className="py-4 px-6 text-sm text-white font-medium">{req.email}</td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${req.type === 'feature_request' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                        {req.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-zinc-300 max-w-md truncate">{req.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-zinc-800 bg-black p-6 relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                  <Activity size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Active Sessions</span>
                </div>
                <span className="text-4xl font-black text-white">{analytics.activeSessions}</span>
              </div>
            </div>

            <div className="border border-zinc-800 bg-black p-6 relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                  <Database size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Journeys Initiated</span>
                </div>
                <span className="text-4xl font-black text-white">{analytics.totalJourneys}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Top Habits Tracked</h3>
              <div className="space-y-4">
                {analytics.topHabits.length === 0 ? (
                  <p className="text-sm text-zinc-500">No telemetry data yet.</p>
                ) : (
                  analytics.topHabits.map((habit, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-white">{habit._id || 'Unnamed Habit'}</span>
                      <span className="text-xs font-bold text-zinc-500">{habit.count} events</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Top Categories</h3>
              <div className="space-y-4">
                {analytics.topCategories.length === 0 ? (
                  <p className="text-sm text-zinc-500">No telemetry data yet.</p>
                ) : (
                  analytics.topCategories.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-white">{cat._id || 'Uncategorized'}</span>
                      <span className="text-xs font-bold text-zinc-500">{cat.count} events</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
