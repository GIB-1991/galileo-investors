import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import { ToastProvider } from './components/alerts/ToastSystem.jsx'
import AppShell from './components/layout/AppShell.jsx'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Academy from './pages/Academy.jsx'
import Screener from './pages/Screener.jsx'
import Portfolio from './pages/Portfolio.jsx'
function AuthGuard({user,children}){if(!user)return <Navigate to="/auth" replace/>;return children}
export default function App(){
const {user,loading}=useAuth()
if(loading)return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--color-bg)'}}><div style={{textAlign:'center'}}><div style={{width:44,height:44,background:'var(--color-text-primary)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}><span style={{color:'white',fontSize:22,fontWeight:700}}>G</span></div><p style={{color:'var(--color-text-muted)',fontSize:'.875rem'}}>טוען...</p></div></div>)
return(<ToastProvider><Routes>
<Route path="/" element={user?<Navigate to="/dashboard"/>:<Landing/>}/>
<Route path="/auth" element={user?<Navigate to="/dashboard"/>:<Auth/>}/>
<Route path="/dashboard" element={<AuthGuard user={user}><AppShell user={user}><Dashboard user={user}/></AppShell></AuthGuard>}/>
<Route path="/academy" element={<AuthGuard user={user}><AppShell user={user}><Academy/></AppShell></AuthGuard>}/>
<Route path="/screener" element={<AuthGuard user={user}><AppShell user={user}><Screener/></AppShell></AuthGuard>}/>
<Route path="/portfolio" element={<AuthGuard user={user}><AppShell user={user}><Portfolio user={user}/></AppShell></AuthGuard>}/>
<Route path="*" element={<Navigate to="/"/>}/>
</Routes></ToastProvider>)}