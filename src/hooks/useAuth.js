import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase.js'
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) ensureUserProfile(session.user)
    })
    return () => subscription.unsubscribe()
  }, [])
  return { user, loading }
}
async function ensureUserProfile(user) {
  const { data } = await supabase.from('profiles').select('id').eq('id', user.id).single()
  if (!data) await supabase.from('profiles').insert({ id: user.id, email: user.email, trial_start: new Date().toISOString() })
}
export function useTrialTimer(user) {
  const [daysLeft, setDaysLeft] = useState(30)
  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('trial_start').eq('id', user.id).single().then(({ data }) => {
      if (data?.trial_start) {
        const diff = Math.floor((new Date() - new Date(data.trial_start)) / 86400000)
        setDaysLeft(Math.max(0, 30 - diff))
      }
    })
  }, [user])
  return daysLeft
}