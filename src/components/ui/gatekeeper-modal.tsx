'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { authClient } from '@/lib/auth-client'
import { X } from 'lucide-react'

export function GatekeeperModal() {
  const { showGatekeeper, setShowGatekeeper, onAuthSuccess } = useAuth()
  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [successMessage, setSuccessMessage] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otp, setOtp] = useState('')

  if (!showGatekeeper) return null

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email,
        otp
      })

      if (error) throw error
      
      setSuccessMessage('OTP Verified successfully!')
      onAuthSuccess()
    } catch (err: any) {
      setError(err.message || 'Invalid OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await authClient.signIn.email({
          email,
          password,
        })
        if (error) throw error
        onAuthSuccess()
      } else {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters')
        }
        
        const generatedUsername = username || email.split('@')[0]
        const { data, error } = await authClient.signUp.email({
          email,
          password,
          name: generatedUsername,
          username: generatedUsername,
        })
        
        if (error) throw error
        
        // Send the OTP for email verification
        const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "email-verification"
        })

        if (otpError) throw otpError

        setSuccessMessage('Email has been sent, check OTP!')
        setShowOtpInput(true)
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setShowGatekeeper(false)}
      />
      
      <div className="relative w-full max-w-md bg-black border border-zinc-800 p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={() => setShowGatekeeper(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            {isLogin ? 'Access Restricted' : 'Join HabitFlow'}
          </h2>
          <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">
            Authentication Required
          </p>
        </div>

        {!showOtpInput && (
          <div className="flex border-b border-zinc-800">
            <button
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${isLogin ? 'border-b-2 border-white text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Log In
            </button>
            <button
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${!isLogin ? 'border-b-2 border-white text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Sign Up
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950 border border-red-900 text-red-500 text-xs font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-950 border border-green-900 text-green-500 text-xs font-bold uppercase tracking-widest text-center">
            {successMessage}
          </div>
        )}

        {showOtpInput ? (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">6-Digit OTP</label>
              <input 
                type="text" 
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 text-center text-2xl tracking-[1em] focus:outline-none focus:border-white transition-colors font-mono"
                maxLength={6}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || otp.length < 6}
              className="w-full mt-2 bg-white text-black font-black uppercase tracking-widest py-3 text-xs hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Authenticate'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 text-sm focus:outline-none focus:border-white transition-colors"
              />
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Username</label>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-white text-white p-3 text-sm focus:outline-none transition-colors"
                  placeholder="Choose a unique username"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 text-sm focus:outline-none focus:border-white transition-colors tracking-widest"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-white text-black font-black uppercase tracking-widest py-3 text-xs hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Authenticate' : 'Create Account'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
