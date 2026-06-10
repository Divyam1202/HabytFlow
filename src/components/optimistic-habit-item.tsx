'use client'

import React, { useOptimistic, startTransition } from 'react'
import { toggleHabitTick } from '@/actions/tracker'
import { useAuth } from '@/contexts/auth-context'

interface OptimisticHabitItemProps {
  userId: string;
  habitId: string;
  name: string;
  category: string;
  dateStr: string;
  isCompletedOnServer: boolean;
}

export function OptimisticHabitItem({
  userId,
  habitId,
  name,
  category,
  dateStr,
  isCompletedOnServer
}: OptimisticHabitItemProps) {
  const { requireAuth } = useAuth()
  
  // React 19 useOptimistic Hook implementation
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    isCompletedOnServer,
    (state: boolean, newCompletionState: boolean) => newCompletionState
  )

  const handleToggle = () => {
    // Intercept with Auth Gatekeeper first
    requireAuth(() => {
      const targetState = !optimisticCompleted
      
      // 1. Immediately apply the optimistic update to the UI
      startTransition(() => {
        setOptimisticCompleted(targetState)
      })

      // 2. Fire the background Server Action to the Neon Database
      // If the action fails, React automatically reverts the optimistic state 
      // when the component re-renders from the server cache invalidation.
      toggleHabitTick(userId, habitId, dateStr)
        .then(res => {
          if (!res.success) {
            console.error("Failed to sync habit:", res.error)
            // React handles the rollback if revalidatePath brings back old data,
            // but we can manually manage error toasts here.
          }
        })
    })
  }

  return (
    <div 
      className="flex items-center justify-between p-3 border-b border-zinc-900 group cursor-pointer hover:bg-zinc-900/50 transition-colors"
      onClick={handleToggle}
    >
      <div className="flex flex-col gap-1">
        <span className={`text-sm font-bold uppercase tracking-wider transition-colors duration-200 ${optimisticCompleted ? 'text-zinc-600 line-through' : 'text-white'}`}>
          {name}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
          {category}
        </span>
      </div>
      
      <div className={`w-5 h-5 flex items-center justify-center border transition-all duration-200 ${
        optimisticCompleted 
          ? 'bg-white border-white' 
          : 'bg-transparent border-zinc-700 group-hover:border-zinc-500'
      }`}>
        {optimisticCompleted && (
          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  )
}
