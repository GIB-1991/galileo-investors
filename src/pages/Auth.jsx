import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { signInWithEmail, signUpWithEmail, supabase } from '../services/supabase.js'

const GOOGLE_CLIENT_ID = '740713160058-jki5k6rp1mnfl9ndsst4dptigiv6e640.apps.googleusercontent.com'

export default function Auth(){
  const navigate=useNavigate()
  const [params]=useSearchParams()
  const [mode,setMode]=useState(params.get('mode')==='signup'?'signup':'signin')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [showPass,setShowPass]=useState(false)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [success,setSuccess]=useState('')

  useEffect(()=>{
    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => initGoogleOneTap()
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  },[])

  function initGoogleOneTap(){
    if(!window.google) return
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      use_fedcm_for_prompt: true
    })
    window.google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'outline', size: 'large', width: 360, locale: 'he' }
    )
  }

  async function handleGoogleCredential(response){
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential
    })
    if(error){ setError(error.message); setLoading(false); return }
    navigate('/dashboard')
  }

  const handleSubmit=async(e)=>{
    e.preventDefault();setLoading(true);setError('');setSuccess('')
    if(!email||!password){setError('נא למלא אימייל וסיסמה');setLoading(false);return}
    if(mode==='signup'){
      const {error}=await signUpWithEmail(email,password)
      if(error){setError(error.message);setLoading(false);return}
      setSuccess('נשלח אימייל אישור — בדוק את תיבת הדואר שלך')
      setLoading(false)
    } else {
      const {error}=await signInWithEmail(email,password)
      if(error){setError('אימייל או סיסמה שגויים');setLoading(false);return}
      navigate('/dashboard')
    }
  }

  return(
    <div style={{minHeight:'100vh',display:'flex',direction:'rtl',background:'var(--color-bg)',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,right:0,width:500,height:500,background:'radial-gradient(circle,rgba(245,166,35,0.07) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:0,left:0,width:400,height:400,background:'radial-gradient(circle,rgba(79,142,247,0.07) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',position:'relative',zIndex:1}}>
        <div style={{width:'100%',maxWidth:420}}>
          <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
            <div style={{width:52,height:52,background:'linear-gradient(135deg,#f5a623,#e8871a)',borderRadius:14,display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:14,boxShadow:'0 0 24px rgba(245,166,35,0.35)'}}>
              <span style={{color:'#0d0f14',fontSize:26,fontWeight:800}}>G</span>
            </div>
            <h1 style={{fontSize:'1.4rem',fontWeight:800,margin:'0 0 6px',color:'var(--color-text-primary)'}}>משקיעים עם גלילאו</h1>
            <p style={{fontSize:'0.875rem',color:'var(--color-text-secondary)',margin:0}}>
              {mode==='signup'?'צור חשבון — חודש ניסיון חינם':'ברוך השב למשקיע החכם'}
            </p>
          </div>
          <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:16,padding:'2rem',boxShadow:'0 8px 40px rgba(0,0,0,0.3)'}}>
            <div id="google-btn" style={{display:'flex',justifyContent:'center',marginBottom:'1.25rem'}}/>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.25rem'}}>
              <div style={{flex:1,height:1,background:'var(--color-border)'}}/>
              <span style={{fontSize:'0.75rem',color:'var(--color-text-muted)'}}>או עם אימייל</span>
              <div style={{flex:1,height:1,background:'var(--color-border)'}}/>
            </div>
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
              <div>
                <label style={{fontSize:'0.8rem',fontWeight:600,display:'block',marginBottom:6,color:'var(--color-text-secondary)'}}>אימייל</label>
                <div style={{position:'relative'}}>
                  <Mail size={14} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--color-text-muted)'}}/>
                  <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={{paddingRight:36}} dir="ltr"/>
                </div>
              </div>
              <div>
                <label style={{fontSize:'0.8rem',fontWeight:600,display:'block',marginBottom:6,color:'var(--color-text-secondary)'}}>סיסמה</label>
                <div style={{position:'relative'}}>
                  <Lock size={14} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--color-text-muted)'}}/>
                  <input className="input" type={showPass?'text':'password'} placeholder="לפחות 8 תווים" value={password} onChange={e=>setPassword(e.target.value)} style={{paddingRight:36,paddingLeft:36}}/>
                  <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--color-text-muted)',padding:0}}>
                    {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
                  </button>
                </div>
              </div>
              {error&&<div style={{background:'rgba(240,82,82,0.1)',border:'1px solid rgba(240,82,82,0.25)',borderRadius:9,padding:'0.625rem 0.875rem',fontSize:'0.82rem',color:'#f87171'}}>{error}</div>}
              {success&&<div style={{background:'rgba(45,216,122,0.1)',border:'1px solid rgba(45,216,122,0.25)',borderRadius:9,padding:'0.625rem 0.875rem',fontSize:'0.82rem',color:'#4ade80'}}>{success}</div>}
              <button className="btn-accent" type="submit" disabled={loading} style={{width:'100%',padding:'0.8rem',fontSize:'0.95rem',opacity:loading?.7:1,marginTop:4}}>
                {loading?'טוען...':mode==='signup'?'צור חשבון':'כניסה'}
              </button>
            </form>
            <p style={{textAlign:'center',fontSize:'0.8rem',color:'var(--color-text-muted)',margin:'1.25rem 0 0'}}>
              {mode==='signup'?'כבר יש לך חשבון? ':'אין לך חשבון? '}
              <button onClick={()=>{setMode(mode==='signup'?'signin':'signup');setError('');setSuccess('')}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-accent)',fontWeight:700,fontFamily:'Heebo,sans-serif',fontSize:'0.8rem'}}>
                {mode==='signup'?'כנס כאן':'הרשם חינם'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}