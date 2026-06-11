'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { LineChart, Line, BarChart, Bar, YAxis, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'

const DynamicResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)
import { useHabitContext } from '@/contexts/habit-context'

const MOCK_MONTHLY_DATA = [
  { month: 'Jan', rate: 45 },
  { month: 'Feb', rate: 52 },
  { month: 'Mar', rate: 68 },
  { month: 'Apr', rate: 74 },
  { month: 'May', rate: 82 },
  { month: 'Jun', rate: 85 }
]

const FAKE_REPORTS = [
  {
    id: 'jun-2026',
    date: 'June 2026',
    completionRate: 94,
    activeDays: 28,
    bestHabit: 'Reading (100%)',
    worstHabit: 'No Spend (60%)',
    insights: 'Excellent momentum this month. Gym consistency improved by 15% compared to May. Week 3 saw a minor dip due to travel, but recovery was immediate.'
  },
  {
    id: 'may-2026',
    date: 'May 2026',
    completionRate: 85,
    activeDays: 26,
    bestHabit: 'Meditation (90%)',
    worstHabit: 'Gym (50%)',
    insights: 'Solid foundational month. Meditation streak reached 20 days. Gym attendance suffered in the first half of the month but picked up significantly in Week 4.'
  }
]

export default function AnalyticsPage() {
  const [selectedReport, setSelectedReport] = useState(FAKE_REPORTS[0].id)
  const { gridData, todayActivity } = useHabitContext()

  const pieDataRaw = gridData.reduce((acc, h) => {
    const completedCount = h.days.filter(d => d.completed).length;
    const existing = acc.find(a => a.name === h.category);
    if (existing) existing.value += completedCount;
    else acc.push({ name: h.category, value: completedCount });
    return acc;
  }, [] as {name: string, value: number}[]);

  if (todayActivity.sportsLog.length > 0) {
    pieDataRaw.push({ name: 'Sports', value: todayActivity.sportsLog.length });
  }

  const COLORS = ['#ffffff', '#a1a1aa', '#52525b', '#27272a', '#18181b', '#09090b'];

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-24 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Analytics</h1>
          <p className="text-zinc-500 mt-2 text-sm">Deep dive into your consistency metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 border border-zinc-900 bg-black p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Report Archive</h3>
          <div className="flex flex-col gap-2 h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-2">
            {FAKE_REPORTS.map(report => (
              <button 
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-3 text-left border rounded-[1px] transition-colors uppercase tracking-wider text-[10px] font-bold ${selectedReport === report.id ? 'border-white bg-zinc-900 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'}`}
              >
                {report.date}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Detailed Report View */}
          {FAKE_REPORTS.filter(r => r.id === selectedReport).map(report => (
            <div key={report.id} className="border border-zinc-900 bg-black p-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                <h2 className="text-xl font-bold uppercase tracking-tight text-white">{report.date} Summary</h2>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-3 py-1 border border-zinc-800 bg-zinc-950">Official Report</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="border border-zinc-800 p-4">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Completion</div>
                  <div className="text-2xl font-black text-white tabular-nums">{report.completionRate}%</div>
                </div>
                <div className="border border-zinc-800 p-4">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Active Days</div>
                  <div className="text-2xl font-black text-white tabular-nums">{report.activeDays}</div>
                </div>
                <div className="border border-zinc-800 p-4">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Top Habit</div>
                  <div className="text-sm font-bold text-green-500 uppercase tracking-tight mt-1">{report.bestHabit}</div>
                </div>
                <div className="border border-zinc-800 p-4">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Needs Work</div>
                  <div className="text-sm font-bold text-red-500 uppercase tracking-tight mt-1">{report.worstHabit}</div>
                </div>
              </div>

              <div className="border border-zinc-800 p-6 bg-zinc-950">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-3">AI Insights</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  {report.insights}
                </p>
              </div>
            </div>
          ))}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-zinc-900 bg-black p-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">6-Month Trajectory</h3>
              <div className="h-48 w-full -ml-4">
                <DynamicResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_MONTHLY_DATA}>
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={v => `${v}%`} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} dy={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #27272a' }} itemStyle={{ color: '#fff' }} />
                    <Line type="stepAfter" dataKey="rate" stroke="#ffffff" strokeWidth={2} dot={false} />
                  </LineChart>
                </DynamicResponsiveContainer>
              </div>
            </div>

            <div className="border border-zinc-900 bg-black p-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">Monthly Volume</h3>
              <div className="h-48 w-full -ml-4">
                <DynamicResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_MONTHLY_DATA}>
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={v => `${v}%`} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} dy={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #27272a', borderRadius: '0px' }} itemStyle={{ color: '#fff' }} cursor={{ fill: '#18181b' }} />
                    <Bar dataKey="rate" fill="#ffffff" radius={0} />
                  </BarChart>
                </DynamicResponsiveContainer>
              </div>
            </div>

            <div className="border border-zinc-900 bg-black p-6 flex flex-col">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">Category Spread</h3>
              <div className="flex-1 min-h-[160px] w-full relative -ml-4">
                <DynamicResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataRaw}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      label={({ name, percent }: any) => (percent && percent > 0) ? `${name} ${(percent * 100).toFixed(0)}%` : null}
                      labelLine={{ stroke: '#52525b', strokeWidth: 1 }}
                      style={{ fontSize: '10px', fill: '#a1a1aa' }}
                    >
                      {pieDataRaw.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #27272a', borderRadius: '2px', fontSize: '10px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </DynamicResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
