import { createContext, useContext, useState, useCallback } from 'react'
import { AlertTriangle, AlertCircle, CheckCircle, Info, X } from 'lucide-react'
const ToastContext = createContext(null)
export function ToastProvider({children}){
  const [toasts,setToasts]=useState([])
  const addToast=useCallback((toast)=>{
    const id=Date.now()+Math.random()
    setToasts(p=>[...p,{...toast,id}])
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),toast.duration||5000)
  },[])
  const removeToast=useCallback((id)=>setToasts(p=>p.filter(t=>t.id!==id)),[])
  return(<ToastContext.Provider value={{addToast}}>{children}<div className="toast-container">{toasts.map(t=>(<Toast key={t.id} toast={t} onClose={()=>removeToast(t.id)}/>))}</div></ToastContext.Provider>)
}
function Toast({toast,onClose}){
  const icons={warning:<AlertTriangle size={18}/>,danger:<AlertCircle size={18}/>,success:<CheckCircle size={18}/>,info:<Info size={18}/>}
  return(<div className={`toast toast-${toast.type||'info'}`} dir="rtl">{icons[toast.type||'info']}<div style={{flex:1}}>{toast.title&&<div style={{fontWeight:600,marginBottom:2}}>{toast.title}</div>}<div style={{opacity:.85,fontSize:'.82rem'}}>{toast.message}</div></div><button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',opacity:.5,padding:0}}><X size={14}/></button></div>)
}
export function useToast(){const ctx=useContext(ToastContext);if(!ctx)throw new Error('useToast must be used within ToastProvider');return ctx}