import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase, onAuthStateChange } from './services/supabase.js'
import AppShell from './components/layout/AppShell.jsx'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Academy from './pages/Academy.jsx'
import Screener from './pages/Screener.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Articles from './pages/Articles.jsx'
import ArticleView from './pages/ArticleView.jsx'
import Calculator from './pages/Calculator.jsx'
import Superinvestors from './pages/Superinvestors.jsx'
import Admin from './pages/Admin.jsx'
import Pricing from './pages/Pricing.jsx'
import { useAccess } from './hooks/useAccess.js'

const ADMIN_EMAIL = 'gilbitan2000@gmail.com'

// Wraps a route — requires the user to have access (admin / active trial / paid). Otherwise redirects to /pricing.
function RequireAccess({ user, children }) {
  const access = useAccess(user)
  if (access.loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'#f5a623',fontSize:'1.2rem'}}>...</div></div>
  if (!access.hasAccess) return <Navigate to="/pricing" replace/>
  return children
}

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

  // Helper to wrap a page with AppShell + access guard
  const guarded = (Page, props={}) => (
    <RequireAccess user={user}>
      <AppShell user={user}><Page user={user} {...props}/></AppShell>
    </RequireAccess>
  )

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard"/> : <Landing/>}/>
      <Route path="/auth" element={user ? <Navigate to="/dashboard"/> : <Auth/>}/>
      {user ? (
        <>
          {/* Pricing — accessible without access guard */}
          <Route path="/pricing" element={<AppShell user={user}><Pricing user={user}/></AppShell>}/>

          {/* Articles list is accessible to anyone logged in (basic content) */}
          <Route path="/articles" element={<AppShell user={user}><Articles/></AppShell>}/>
          <Route path="/articles/:id" element={<AppShell user={user}><ArticleView/></AppShell>}/>

          {/* Premium routes — require active access */}
          <Route path="/dashboard" element={guarded(Dashboard)}/>
          <Route path="/screener" element={guarded(Screener)}/>
          <Route path="/portfolio" element={guarded(Portfolio)}/>
          <Route path="/calculator" element={guarded(Calculator)}/>
          <Route path="/superinvestors" element={guarded(Superinvestors)}/>
          <Route path="/academy" element={guarded(Academy)}/>

          {/* Admin only */}
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
