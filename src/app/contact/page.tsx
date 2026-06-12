'use client'

import React, { useState } from 'react'
import { Rocket, Send, ArrowLeft, Bug, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ContactPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [type, setType] = useState('issue')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !message) return

    setStatus('loading')

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type, message })
      })

      if (res.ok) {
        setStatus('success')
        setEmail('')
        setMessage('')
      } else {
        setStatus('error')
      }
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 pt-12 pb-24 space-y-12">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-zinc-500 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Contact Us</h1>
        <p className="text-zinc-500 mt-2 text-sm">Have an issue or a feature request? Let us know.</p>
      </div>

      <div className="border border-zinc-800 bg-black p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Your Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              required
              className="bg-zinc-950 border border-zinc-800 text-white p-4 text-sm focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Request Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-white p-4 text-sm focus:outline-none focus:border-white transition-colors uppercase tracking-widest"
            >
              <option value="issue">Issue / Bug Report</option>
              <option value="feature_request">Feature Request</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help you?"
              required
              rows={5}
              className="bg-zinc-950 border border-zinc-800 text-white p-4 text-sm focus:outline-none focus:border-white transition-colors resize-y"
            />
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Sending...' : 'Submit Request'}
            <Send size={16} />
          </button>

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center gap-3 mt-6 p-6 border border-green-900/50 bg-green-950/20 text-green-500 text-xs font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              {type === 'issue' ? (
                <>
                  <Bug size={28} className="animate-bounce text-green-400" />
                  <span>Stay tuned, your bugs will get fixed soon!</span>
                </>
              ) : (
                <>
                  <Sparkles size={28} className="animate-pulse text-green-400" />
                  <span>Stay tuned to see your feature updated!</span>
                </>
              )}
            </div>
          )}
          {status === 'error' && (
            <div className="text-red-500 text-xs font-bold uppercase tracking-widest text-center mt-4">
              Failed to send request. Try again.
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
