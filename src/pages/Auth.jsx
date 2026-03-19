import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/supabase.js'
export default function Auth(){
const navigate=useNavigate();const [params]=useSearchParams()
const [mode,setMode]=useState(params.get('mode')==='signup'?'signup':'signin')
const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [showPass,setShowPass]=useState(false)
const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [success,setSuccess]=useState('')
const handleGoogle=async()=>{setLoading(true);setError('');const {error}=await signInWithGoogle();if(error){setError(error.message);setLoading(false)}}
const handleSubmit=async(e)=>{e.preventDefault();setLoading(true);setError('');setSuccess('')
if(!email||!password){setError('נא למלא אימייל וסיסמה');setLoading(false);return}
if(mode==='signup'){const {error}=await signUpWithEmail(email,password);if(error){setError(error.message);setLoading(false);return};setSuccess('נשלח אימייל אישור');setLoading(false)}
else{const {error}=await signInWithEmail(email,password);if(error){setError('אימייל או סיסמה שגויים');setLoading(false);return};navigate('/dashboard')}}
return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--color-bg)',padding:'1rem',direction:'rtl'}}>
<div style={{width:'100%',maxWidth:400}}>
<div style={{textAlign:'center',marginBottom:'2rem'}}>
<div style={{width:44,height:44,background:'var(--color-text-primary)',borderRadius:10,display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:12}}><span style={{color:'white',fontSize:22,fontWeight:700}}>G</span></div>
<h1 style={{fontSize:'1.3rem',fontWeight:700,margin:'0 0 4px'}}>משקיעים עם גלילאו</h1>
<p style={{fontSize:'.875rem',color:'var(--color-text-muted)',margin:0}}>{mode==='signup'?'צור חשבון — חודש ניסיון חינם':'ברוך השב'}</p></div>
<div className="card" style={{padding:'2rem'}}>
<button onClick={handleGoogle} disabled={loading} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'.7rem',border:'1px solid var(--color-border)',borderRadius:8,background:'white',cursor:'pointer',fontSize:'.9rem',fontWeight:500,fontFamily:'Heebo,sans-serif',marginBottom:'1.25rem'}}>
<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
{mode==='signup'?'הרשמה עם Google':'כניסה עם Google'}</button>
<div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.25rem'}}><div style={{flex:1,height:1,background:'var(--color-border)'}}/><span style={{fontSize:'.78rem',color:'var(--color-text-muted)'}}>או עם אימייל</span><div style={{flex:1,height:1,background:'var(--color-border)'}}/></div>
<form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'.875rem'}}>
<div><label style={{fontSize:'.82rem',fontWeight:500,display:'block',marginBottom:6}}>אימייל</label>
<div style={{position:'relative'}}><Mail size={15} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--color-text-muted)'}}/><input className="input" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={{paddingRight:36}} dir="ltr"/></div></div>
<div><label style={{fontSize:'.82rem',fontWeight:500,display:'block',marginBottom:6}}>סיסמה</label>
<div style={{position:'relative'}}><Lock size={15} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--color-text-muted)'}}/><input className="input" type={showPass?'text':'password'} placeholder="לפחות 8 תווים" value={password} onChange={e=>setPassword(e.target.value)} style={{paddingRight:36,paddingLeft:36}}/><button type="button" onClick={()=>setShowPass(!showPass)} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',padding:0}}>{showPass?<EyeOff size={15}/>:<Eye size={15}/>}</button></div></div>
{error&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'.625rem .875rem',fontSize:'.82rem',color:'#991b1b'}}>{error}</div>}
{success&&<div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,padding:'.625rem .875rem',fontSize:'.82rem',color:'#14532d'}}>{success}</div>}
<button className="btn-primary" type="submit" disabled={loading} style={{width:'100%',padding:'.75rem',fontSize:'.95rem',opacity:loading?.6:1}}>{loading?'טוען...':mode==='signup'?'צור חשבון':'כניסה'}</button></form>
<p style={{textAlign:'center',fontSize:'.82rem',color:'var(--color-text-muted)',margin:'1rem 0 0'}}>{mode==='signup'?'כבר יש לך חשבון? ':'אין לך חשבון? '}<button onClick={()=>{setMode(mode==='signup'?'signin':'signup');setError('');setSuccess('')}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-primary)',fontWeight:600,fontFamily:'Heebo,sans-serif',fontSize:'.82rem'}}>{mode==='signup'?'כנס כאן':'הרשם חינם'}</button></p></div></div></div>)}