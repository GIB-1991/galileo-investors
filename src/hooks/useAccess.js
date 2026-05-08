import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase.js'

const TRIAL_DAYS = 7

export function useAccess(user) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setProfile(null); setLoading(false); return }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!cancelled) { setProfile(data || null); setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [user?.id])

  const status = computeStatus(profile)
  return { profile, loading, ...status }
}

export function computeStatus(profile) {
  if (!profile) {
    return { hasAccess: false, isAdmin: false, plan: 'none', daysLeft: 0, expired: false }
  }
  if (profile.is_admin) {
    return { hasAccess: true, isAdmin: true, plan: 'admin', daysLeft: Infinity, expired: false }
  }
  // Active paid subscription
  if (profile.subscription_plan === 'monthly' || profile.subscription_plan === 'yearly') {
    const exp = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : null
    if (exp && exp > new Date()) {
      const days = Math.ceil((exp - new Date()) / 86400000)
      return { hasAccess: true, isAdmin: false, plan: profile.subscription_plan, daysLeft: days, expired: false }
    }
  }
  // Trial
  const trialStart = profile.trial_start ? new Date(profile.trial_start) : (profile.created_at ? new Date(profile.created_at) : new Date())
  const trialEnd = new Date(trialStart.getTime() + TRIAL_DAYS * 86400000)
  const now = new Date()
  if (now < trialEnd) {
    const days = Math.ceil((trialEnd - now) / 86400000)
    return { hasAccess: true, isAdmin: false, plan: 'trial', daysLeft: days, expired: false }
  }
  return { hasAccess: false, isAdmin: false, plan: 'expired', daysLeft: 0, expired: true }
}
