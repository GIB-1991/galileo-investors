import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase, onAuthStateChange } from './services/supabase.js'
import AppShell from './components/layout/AppShell.jsx'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Academy from './pages/Academy.jsx'
import Screener from './pages/Screener.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Articles from './pages/Articles.jsx'
import Calculator from './pages/Calculator.jsx'
import Admin from './pages/Admin.jsx'

const ADMIN_EMAIL = 'gilbitan2000@gmail.com'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#080c14'}}>
      <div style={{color:'#f5a623',fontSize:'1.5rem',fontWeight:800}}>G</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard"/> : <Landing/>}/>
      <Route path="/auth" element={user ? <Navigate to="/dashboard"/> : <Auth/>}/>
      {user ? (
        <>
          <Route path="/dashboard" element={<AppShell user={user}><Dashboard user={user}/></AppShell>}/>
          <Route path="/screener" element={<AppShell user={user}><Screener/></AppShell>}/>
          <Route path="/portfolio" element={<AppShell user={user}><Portfolio/></AppShell>}/>
          <Route path="/calculator" element={<AppShell user={user}><Calculator/></AppShell>}/>
          <Route path="/academy" element={<AppShell user={user}><Academy/></AppShell>}/>
          <Route path="/articles" element={<AppShell user={user}><Articles/></AppShell>}/>
          {user.email === ADMIN_EMAIL && (
            <Route path="/admin" element={<AppShell user={user}><Admin user={user}/></AppShell>}/>
          )}
          <Route path="*" element={<Navigate to="/dashboard"/>}/>
        </>
      ) : (
        <Route path="*" element={<Navigate to="/"/>}/>
      )}
    </Routes>
  )
}