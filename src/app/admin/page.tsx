import { connectToDatabase } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import SupportRequest from '@/models/SupportRequest'
import mongoose from 'mongoose'
import { Users, Activity, Clock, MessageSquare, ShieldAlert } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: headers() })

  if (!session || session.user.email !== 'habytflow@gmail.com') {
    redirect('/')
  }

  await connectToDatabase()

  const db = mongoose.connection.db
  if (!db) throw new Error("No db connection")

  const usersCollection = db.collection('user')
  const sessionsCollection = db.collection('session')

  const totalUsers = await usersCollection.countDocuments()
  const activeSessions = await sessionsCollection.countDocuments({
    expiresAt: { $gt: new Date() }
  })

  const rawRequests = await SupportRequest.find().sort({ createdAt: -1 }).lean()
  const supportRequests = rawRequests.map(req => ({
    _id: req._id?.toString(),
    email: req.email,
    message: req.message,
    status: req.status,
    createdAt: (req.createdAt as Date).toLocaleDateString()
  }))

  const launchDate = new Date('2026-06-11')
  const daysLive = Math.max(1, Math.floor((Date.now() - launchDate.getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-24 space-y-12">
      <div className="flex items-center gap-4">
        <ShieldAlert className="w-8 h-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Admin Operations</h1>
          <p className="text-zinc-500 text-sm font-bold tracking-widest uppercase mt-1">Classified Dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-zinc-800 bg-black p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Users size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Total Users</span>
            </div>
            <span className="text-4xl font-black text-white">{totalUsers}</span>
          </div>
        </div>

        <div className="border border-zinc-800 bg-black p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Activity size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Active Sessions</span>
            </div>
            <span className="text-4xl font-black text-white">{activeSessions}</span>
          </div>
        </div>

        <div className="border border-zinc-800 bg-black p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Clock size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Days Live</span>
            </div>
            <span className="text-4xl font-black text-white">{daysLive}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare size={20} />
          <h2 className="text-xl font-bold uppercase tracking-tight">Support Requests</h2>
        </div>

        <div className="border border-zinc-800 bg-black overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/50">
                <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-zinc-500">Date</th>
                <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-zinc-500">Email</th>
                <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-zinc-500">Message</th>
                <th className="py-4 px-6 text-xs font-bold tracking-widest uppercase text-zinc-500">Status</th>
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
                  <td className="py-4 px-6 text-sm text-zinc-400 whitespace-nowrap">{req.createdAt}</td>
                  <td className="py-4 px-6 text-sm text-white font-medium">{req.email}</td>
                  <td className="py-4 px-6 text-sm text-zinc-300 max-w-md truncate">{req.message}</td>
                  <td className="py-4 px-6">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
