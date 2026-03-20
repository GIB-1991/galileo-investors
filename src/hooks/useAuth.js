import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase.js'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])
  return { user, loading }
}

export function useTrialTimer(user) {
  const [daysLeft, setDaysLeft] = useState(30)
  useEffect(() => {
    if (!user) return
    const trialStart = user.created_at ? new Date(user.created_at) : new Date()
    const trialEnd = new Date(trialStart.getTime() + 30 * 24 * 60 * 60 * 1000)
    const now = new Date()
    const diff = Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000))
    setDaysLeft(Math.max(0, diff))
  }, [user])
  return daysLeft
}
