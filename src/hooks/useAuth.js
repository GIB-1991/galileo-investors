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

const TRIAL_DAYS = 7

// Returns { daysLeft, plan, isAdmin } from profile.
// Backwards-compatible: existing callers that read { daysLeft } still work.
export function useTrialTimer(user) {
  const [state, setState] = useState({ daysLeft: TRIAL_DAYS, plan: 'trial', isAdmin: false })
  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (cancelled || !p) return
      if (p.is_admin) { setState({ daysLeft: Infinity, plan: 'admin', isAdmin: true }); return }
      // Active paid subscription
      if ((p.subscription_plan === 'monthly' || p.subscription_plan === 'yearly') && p.subscription_expires_at) {
        const exp = new Date(p.subscription_expires_at)
        if (exp > new Date()) {
          const days = Math.ceil((exp - new Date()) / 86400000)
          setState({ daysLeft: days, plan: p.subscription_plan, isAdmin: false })
          return
        }
      }
      // Trial
      const trialStart = p.trial_start ? new Date(p.trial_start) : (p.created_at ? new Date(p.created_at) : new Date())
      const trialEnd = new Date(trialStart.getTime() + TRIAL_DAYS * 86400000)
      const diff = Math.ceil((trialEnd - new Date()) / 86400000)
      setState({ daysLeft: Math.max(0, diff), plan: 'trial', isAdmin: false })
    })()
    return () => { cancelled = true }
  }, [user?.id])
  return state
}
