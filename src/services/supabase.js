import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } })
export const signInWithEmail = (email, password) => supabase.auth.signInWithPassword({ email, password })
export const signUpWithEmail = (email, password) => supabase.auth.signUp({ email, password })
export const signOut = () => supabase.auth.signOut()
export const getCurrentUser = () => supabase.auth.getUser()