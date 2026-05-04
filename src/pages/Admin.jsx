import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase.js'
import { Plus, Edit2, Trash2, Save, X, Users, FileText, BookOpen, ChevronDown, ChevronUp, Eye, EyeOff, Image as ImageIcon, Bold, Italic, Heading2, Heading3, List, Quote, Link as LinkIcon, Loader } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TiptapLink from '@tiptap/extension-link'

const ADMIN_EMAIL = 'gilbitan2000@gmail.com'

export default function Admin({ user }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('articles')
  const [articles, setArticles] = useState([])
  const [academy, setAcademy] = useState([])
  const [users, setUsers] = useState([])
  const [editItem, setEditItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Guard: only admin
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) { navigate('/dashboard'); return }
    loadAll()
  }, [user])

  async function loadAll() {
    setLoading(true)
    const [a, ac, u] = await Promise.all([
      supabase.from('articles').select('*').order('created_at', {ascending:false}),
      supabase.from('academy_items').select('*').order('sort_order'),
      supabase.from('profiles').select('*').order('created_at', {ascending:false})
    ])
    if (a.data) setArticles(a.data)
    if (ac.data) setAcademy(ac.data)
    if (u.data) setUsers(u.data)
    setLoading(false)
  }

  async function saveArticle(data) {
    setLoading(true)
    const now = new Date().toISOString()
    if (data.id) {
      await supabase.from('articles').update({...data, updated_at:now}).eq('id', data.id)
    } else {
      await supabase.from('articles').insert({...data, created_at:now, updated_at:now})
    }
    setMsg('נשמר!'); setTimeout(()=>setMsg(''),2000)
    setShowForm(false); setEditItem(null)
    loadAll(); setLoading(false)
  }

  async function deleteArticle(id) {
    if (!confirm('למחוק מאמר זה?')) return
    await supabase.from('articles').delete().eq('id', id)
    setMsg('נמחק'); setTimeout(()=>setMsg(''),2000); loadAll()
  }

  async function saveAcademy(data) {
    setLoading(true)
    const now = new Date().toISOString()
    if (data.id) {
      await supabase.from('academy_items').update({...data, updated_at:now}).eq('id', data.id)
    } else {
      await supabase.from('academy_items').insert({...data, created_at:now, updated_at:now})
    }
    setMsg('נשמר!'); setTimeout(()=>setMsg(''),2000)
    setShowForm(false); setEditItem(null)
    loadAll(); setLoading(false)
  }

  async function deleteAcademy(id) {
    if (!confirm('למחוק פריט זה?')) return
    await supabase.from('academy_items').delete().eq('id', id)
    setMsg('נמחק'); setTimeout(()=>setMsg(''),2000); loadAll()
  }

  const tabStyle = (t) => ({
    padding:'8px 18px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit',
    fontWeight:tab===t?700:500, fontSize:'.88rem',
    background:tab===t?'rgba(245,166,35,0.15)':'transparent',
    color:tab===t?'#f5a623':'var(--color-text-secondary)',
    borderBottom:tab===t?'2px solid #f5a623':'2px solid transparent',
    transition:'all 180ms'
  })

  return (
    <div style={{maxWidth:1000,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
        <div>
          <h1 style={{fontSize:'1.5rem',fontWeight:800,margin:'0 0 4px',color:'#f5a623'}}>פאנל ניהול</h1>
          <p style={{margin:0,fontSize:'.82rem',color:'var(--color-text-muted)'}}>גישת מנהל — {ADMIN_EMAIL}</p>
        </div>
        {msg && <div style={{background:'rgba(45,216,122,0.15)',border:'1px solid rgba(45,216,122,0.3)',color:'#2dd87a',padding:'6px 16px',borderRadius:20,fontSize:'.85rem',fontWeight:600}}>{msg}</div>}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:'1.5rem',borderBottom:'1px solid var(--color-border)',paddingBottom:0}}>
        <button style={tabStyle('articles')} onClick={()=>{setTab('articles');setShowForm(false);setEditItem(null)}}>
          <FileText size={14} style={{marginLeft:6}}/> מאמרים ({articles.length})
        </button>
        <button style={tabStyle('academy')} onClick={()=>{setTab('academy');setShowForm(false);setEditItem(null)}}>
          <BookOpen size={14} style={{marginLeft:6}}/> אקדמיה ({academy.length})
        </button>
        <button style={tabStyle('users')} onClick={()=>{setTab('users');setShowForm(false);setEditItem(null)}}>
          <Users size={14} style={{marginLeft:6}}/> משתמשים ({users.length})
        </button>
      </div>

      {loading && <div style={{textAlign:'center',padding:'2rem',color:'var(--color-text-muted)'}}>טוען...</div>}

      {/* ARTICLES TAB */}
      {tab==='articles' && !loading && (
        <div>
          <div style={{display:'flex',justifyContent:'flex-start',marginBottom:'1rem'}}>
            <button onClick={()=>{setShowForm(true);setEditItem({title:'',summary:'',url:'',category:'כללי',published:true})}}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'1px solid rgba(245,166,35,0.4)',background:'rgba(245,166,35,0.1)',color:'#f5a623',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'.85rem'}}>
              <Plus size={15}/> מאמר חדש
            </button>
          </div>

          {showForm && (
            <ArticleForm
              data={editItem}
              onSave={saveArticle}
              onCancel={()=>{setShowForm(false);setEditItem(null)}}
            />
          )}

          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {articles.map(a=>(
              <div key={a.id} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:12,padding:'1rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span style={{fontWeight:700,fontSize:'.92rem'}}>{a.title}</span>
                    {!a.published && <span style={{fontSize:'.7rem',background:'rgba(224,82,82,0.15)',color:'#e05252',padding:'2px 8px',borderRadius:8}}>טיוטה</span>}
                    <span style={{fontSize:'.7rem',background:'rgba(245,166,35,0.1)',color:'#f5a623',padding:'2px 8px',borderRadius:8}}>{a.category}</span>
                  </div>
                  <p style={{margin:0,fontSize:'.78rem',color:'var(--color-text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.summary}</p>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',padding:6,borderRadius:7,color:'var(--color-text-muted)',border:'1px solid var(--color-border)',textDecoration:'none'}}><Eye size={14}/></a>}
                  <button onClick={()=>{setEditItem(a);setShowForm(true)}}
                    style={{display:'flex',alignItems:'center',padding:6,borderRadius:7,border:'1px solid rgba(245,166,35,0.3)',background:'rgba(245,166,35,0.08)',color:'#f5a623',cursor:'pointer'}}>
                    <Edit2 size={14}/>
                  </button>
                  <button onClick={()=>deleteArticle(a.id)}
                    style={{display:'flex',alignItems:'center',padding:6,borderRadius:7,border:'1px solid rgba(224,82,82,0.3)',background:'rgba(224,82,82,0.08)',color:'#e05252',cursor:'pointer'}}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
            {articles.length===0 && <p style={{textAlign:'center',color:'var(--color-text-muted)',padding:'2rem'}}>אין מאמרים עדיין. לחץ "מאמר חדש" להוסיף.</p>}
          </div>
        </div>
      )}

      {/* ACADEMY TAB */}
      {tab==='academy' && !loading && (
        <div>
          <div style={{display:'flex',justifyContent:'flex-start',marginBottom:'1rem'}}>
            <button onClick={()=>{setShowForm(true);setEditItem({term:'',definition:'',example:'',category:'כללי',sort_order:0,published:true})}}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'1px solid rgba(245,166,35,0.4)',background:'rgba(245,166,35,0.1)',color:'#f5a623',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'.85rem'}}>
              <Plus size={15}/> מושג חדש
            </button>
          </div>

          {showForm && (
            <AcademyForm
              data={editItem}
              onSave={saveAcademy}
              onCancel={()=>{setShowForm(false);setEditItem(null)}}
            />
          )}

          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {academy.map(a=>(
              <div key={a.id} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:12,padding:'1rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span style={{fontWeight:700,fontSize:'.92rem'}}>{a.term}</span>
                    {!a.published && <span style={{fontSize:'.7rem',background:'rgba(224,82,82,0.15)',color:'#e05252',padding:'2px 8px',borderRadius:8}}>טיוטה</span>}
                  </div>
                  <p style={{margin:0,fontSize:'.78rem',color:'var(--color-text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.definition}</p>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <button onClick={()=>{setEditItem(a);setShowForm(true)}}
                    style={{display:'flex',alignItems:'center',padding:6,borderRadius:7,border:'1px solid rgba(245,166,35,0.3)',background:'rgba(245,166,35,0.08)',color:'#f5a623',cursor:'pointer'}}>
                    <Edit2 size={14}/>
                  </button>
                  <button onClick={()=>deleteAcademy(a.id)}
                    style={{display:'flex',alignItems:'center',padding:6,borderRadius:7,border:'1px solid rgba(224,82,82,0.3)',background:'rgba(224,82,82,0.08)',color:'#e05252',cursor:'pointer'}}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
            {academy.length===0 && <p style={{textAlign:'center',color:'var(--color-text-muted)',padding:'2rem'}}>אין מושגים עדיין.</p>}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {tab==='users' && !loading && (
        <div>
          <div style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:12,overflow:'hidden'}}>
            <div style={{padding:'1rem 1.25rem',borderBottom:'1px solid var(--color-border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{margin:0,fontSize:'.9rem',fontWeight:700}}>משתמשים רשומים</h3>
              <span style={{fontSize:'.8rem',color:'var(--color-text-muted)'}}>{users.length} סה"כ</span>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.83rem'}}>
              <thead>
                <tr style={{background:'rgba(245,166,35,0.05)'}}>
                  {['מייל','תאריך הצטרפות','ימי ניסיון'].map(h=>(
                    <th key={h} style={{padding:'.65rem 1rem',textAlign:'right',fontWeight:600,color:'var(--color-text-muted)',borderBottom:'1px solid var(--color-border)'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u=>{
                  const joined = new Date(u.created_at)
                  const daysAgo = Math.floor((Date.now()-joined.getTime())/86400000)
                  const trialLeft = Math.max(0, 14-daysAgo)
                  return (
                    <tr key={u.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <td style={{padding:'.65rem 1rem'}}>{u.email}</td>
                      <td style={{padding:'.65rem 1rem',color:'var(--color-text-muted)'}}>{joined.toLocaleDateString('he-IL')}</td>
                      <td style={{padding:'.65rem 1rem'}}>
                        <span style={{color:trialLeft>0?'#f5a623':'#e05252',fontWeight:600}}>{trialLeft>0?trialLeft+' ימים':'פג'}</span>
                      </td>
                    </tr>
                  )
                })}
                {users.length===0 && <tr><td colSpan={3} style={{padding:'2rem',textAlign:'center',color:'var(--color-text-muted)'}}>אין משתמשים עדיין</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuBar({ editor, onUploadImage }) {
  if (!editor) return null
  const fileInput = useRef(null)
  const btn=(active,onClick,children,title)=>(
    <button type="button" onClick={onClick} title={title}
      style={{padding:'6px 8px',borderRadius:6,border:'1px solid var(--color-border)',background:active?'#f5a623':'var(--color-bg2)',color:active?'#0d0f14':'var(--color-text-primary)',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontSize:'.78rem'}}>{children}</button>
  )
  return (
    <div style={{display:'flex',gap:5,flexWrap:'wrap',padding:8,borderBottom:'1px solid var(--color-border)',background:'var(--color-bg2)',borderTopLeftRadius:8,borderTopRightRadius:8}}>
      {btn(editor.isActive('bold'),()=>editor.chain().focus().toggleBold().run(),<Bold size={14}/>,'מודגש')}
      {btn(editor.isActive('italic'),()=>editor.chain().focus().toggleItalic().run(),<Italic size={14}/>,'נטוי')}
      {btn(editor.isActive('heading',{level:2}),()=>editor.chain().focus().toggleHeading({level:2}).run(),<Heading2 size={14}/>,'כותרת 2')}
      {btn(editor.isActive('heading',{level:3}),()=>editor.chain().focus().toggleHeading({level:3}).run(),<Heading3 size={14}/>,'כותרת 3')}
      {btn(editor.isActive('bulletList'),()=>editor.chain().focus().toggleBulletList().run(),<List size={14}/>,'רשימה')}
      {btn(editor.isActive('blockquote'),()=>editor.chain().focus().toggleBlockquote().run(),<Quote size={14}/>,'ציטוט')}
      {btn(editor.isActive('link'),()=>{const url=window.prompt('הזן URL:');if(url)editor.chain().focus().setLink({href:url}).run();else if(url==='')editor.chain().focus().unsetLink().run()},<LinkIcon size={14}/>,'קישור')}
      <input type="file" ref={fileInput} accept="image/*" style={{display:'none'}} onChange={async(e)=>{const f=e.target.files?.[0];if(f){await onUploadImage(f);e.target.value=''}}}/>
      {btn(false,()=>fileInput.current?.click(),<ImageIcon size={14}/>,'הוסף תמונה')}
    </div>
  )
}

function ArticleForm({ data, onSave, onCancel }) {
  const [form, setForm] = useState({...data})
  const [savedAt, setSavedAt] = useState(null)
  const [saving, setSaving] = useState(false)
  const skipNextAutosave = useRef(true)
  const formRef = useRef(form)
  formRef.current = form

  // Upload image to Supabase Storage and return public URL
  const uploadImage = useCallback(async (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
    const { error } = await supabase.storage.from('article-images').upload(path, file, { cacheControl:'3600', upsert:false })
    if (error) { alert('שגיאה בהעלאת תמונה: '+error.message); return null }
    const { data:{ publicUrl } } = supabase.storage.from('article-images').getPublicUrl(path)
    return publicUrl
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({ HTMLAttributes:{ style:'max-width:100%;height:auto;border-radius:8px;margin:1rem 0;display:block' } }),
      Placeholder.configure({ placeholder:'התחל לכתוב את המאמר... גרור תמונות לתוך הטקסט או השתמש בכפתור התמונה למעלה' }),
      TiptapLink.configure({ openOnClick:false, HTMLAttributes:{ style:'color:#f5a623;text-decoration:underline' } })
    ],
    content: data.content || '',
    onUpdate: ({ editor }) => {
      setForm(f => ({...f, content: editor.getHTML()}))
    },
    editorProps: {
      attributes: { dir:'rtl', style:'min-height:400px;padding:1rem;outline:none;line-height:1.7;color:var(--color-text-primary);font-size:1rem' },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            uploadImage(file).then(url => {
              if (url) editor.chain().focus().setImage({ src:url }).run()
            })
            return true
          }
        }
        return false
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (items) {
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile()
              if (file) {
                event.preventDefault()
                uploadImage(file).then(url => {
                  if (url) editor.chain().focus().setImage({ src:url }).run()
                })
                return true
              }
            }
          }
        }
        return false
      }
    }
  })

  const insertImageFromUpload = useCallback(async (file) => {
    if (!editor) return
    const url = await uploadImage(file)
    if (url) editor.chain().focus().setImage({ src:url }).run()
  }, [editor, uploadImage])

  // Autosave: every 2s after change, persist draft to Supabase (NEVER auto-publishes)
  useEffect(() => {
    if (skipNextAutosave.current) { skipNextAutosave.current = false; return }
    const t = setTimeout(async () => {
      const f = formRef.current
      if (!f.title && !f.content) return
      setSaving(true)
      const now = new Date().toISOString()
      const payload = {...f, updated_at:now}
      // Always save as draft on autosave - never auto-publish
      if (f.id) {
        await supabase.from('articles').update(payload).eq('id', f.id)
      } else {
        const insertPayload = {...payload, published:false, created_at:now}
        const { data:row } = await supabase.from('articles').insert(insertPayload).select().single()
        if (row) setForm(prev => ({...prev, id:row.id}))
      }
      setSavedAt(new Date())
      setSaving(false)
    }, 2000)
    return () => clearTimeout(t)
  }, [form.title, form.summary, form.content, form.image_url, form.url, form.category])

  const inp = (label, key, type='text', placeholder='') => (
    <div style={{marginBottom:'1rem'}}>
      <label style={{display:'block',fontSize:'.82rem',fontWeight:600,color:'var(--color-text-secondary)',marginBottom:5}}>{label}</label>
      {type==='textarea'
        ? <textarea value={form[key]||''} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder} rows={3}
            style={{width:'100%',padding:10,borderRadius:8,border:'1px solid var(--color-border2)',background:'var(--color-bg2)',color:'var(--color-text-primary)',fontFamily:'inherit',fontSize:'.9rem',resize:'vertical'}}/>
        : <input type={type} value={form[key]||''} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder}
            style={{width:'100%',padding:10,borderRadius:8,border:'1px solid var(--color-border2)',background:'var(--color-bg2)',color:'var(--color-text-primary)',fontFamily:'inherit',fontSize:'.9rem'}}/>
      }
    </div>
  )

  const statusLabel = saving ? <span style={{color:'#f5a623',fontSize:'.78rem',display:'flex',alignItems:'center',gap:5}}><Loader size={12} className="spin"/> שומר...</span>
    : savedAt ? <span style={{color:'#2dd87a',fontSize:'.78rem'}}>✓ נשמר ב-{savedAt.toLocaleTimeString('he-IL')}</span>
    : <span style={{color:'var(--color-text-secondary)',fontSize:'.78rem'}}>לא נשמר עדיין</span>

  return (
    <div style={{background:'var(--color-surface)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:12,padding:'1.5rem',marginBottom:'1rem'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.2rem'}}>
        <h3 style={{margin:0,fontSize:'.95rem',fontWeight:700,color:'#f5a623'}}>{form.id?'עריכת מאמר':'מאמר חדש'}</h3>
        {statusLabel}
      </div>
      {inp('כותרת','title','text','כותרת המאמר')}
      {inp('תקציר','summary','textarea','תקציר קצר...')}
      {inp('תמונה ראשית (URL)','image_url','url','https://...')}
      {inp('קישור חיצוני (אופציונלי)','url','url','https://...')}
      <div style={{marginBottom:'1rem'}}>
        <label style={{display:'block',fontSize:'.82rem',fontWeight:600,color:'var(--color-text-secondary)',marginBottom:5}}>קטגוריה</label>
        <select value={form.category||'כללי'} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
          style={{width:'100%',padding:10,borderRadius:8,border:'1px solid var(--color-border2)',background:'var(--color-bg2)',color:'var(--color-text-primary)',fontFamily:'inherit',fontSize:'.9rem'}}>
          {['כללי','ניתוח','דו"ח','חינוך','השקעות','מאקרו','גיאופוליטי'].map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {/* RICH TEXT EDITOR */}
      <div style={{marginBottom:'1rem'}}>
        <label style={{display:'block',fontSize:'.82rem',fontWeight:600,color:'var(--color-text-secondary)',marginBottom:5}}>תוכן המאמר</label>
        <div style={{border:'1px solid var(--color-border2)',borderRadius:8,background:'var(--color-bg2)'}}>
          <MenuBar editor={editor} onUploadImage={insertImageFromUpload}/>
          <EditorContent editor={editor}/>
        </div>
        <p style={{fontSize:'.72rem',color:'var(--color-text-secondary)',marginTop:6}}>טיפ: אפשר לגרור תמונות מהמחשב לתוך העורך, או להדביק תמונה מהקליפבורד.</p>
      </div>

      <div style={{marginBottom:'1.2rem',display:'flex',alignItems:'center',gap:10,padding:'.8rem',background:form.published?'rgba(45,216,122,.08)':'rgba(245,166,35,.08)',borderRadius:8,border:'1px solid '+(form.published?'rgba(45,216,122,.2)':'rgba(245,166,35,.2)')}}>
        <input type="checkbox" id="pub_art" checked={form.published||false} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} style={{width:18,height:18,cursor:'pointer'}}/>
        <label htmlFor="pub_art" style={{fontSize:'.88rem',fontWeight:600,cursor:'pointer'}}>{form.published?'✓ מאמר מפורסם — גלוי לציבור':'טיוטה — שמור בענן, לא מוצג בציבור'}</label>
      </div>
      <div style={{display:'flex',gap:10}}>
        <button onClick={()=>onSave(formRef.current)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 18px',borderRadius:9,border:'none',background:'#f5a623',color:'#0d0f14',cursor:'pointer',fontWeight:700,fontSize:'.88rem'}}>
          <Save size={14}/> {form.published?'שמור ופרסם':'שמור טיוטה'}
        </button>
        <button onClick={onCancel} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:9,border:'1px solid var(--color-border)',background:'transparent',color:'var(--color-text-primary)',cursor:'pointer',fontWeight:600,fontSize:'.88rem'}}>
          <X size={14}/> סגור
        </button>
      </div>
    </div>
  )
}


function AcademyForm({ data, onSave, onCancel }) {
  const [form, setForm] = useState({...data})
  const inp = (label, key, type='text', placeholder='') => (
    <div style={{marginBottom:'1rem'}}>
      <label style={{display:'block',fontSize:'.82rem',fontWeight:600,color:'var(--color-text-secondary)',marginBottom:5}}>{label}</label>
      {type==='textarea'
        ? <textarea value={form[key]||''} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder} rows={3}
            style={{width:'100%',padding:10,borderRadius:8,border:'1px solid var(--color-border2)',background:'var(--color-bg2)',color:'var(--color-text-primary)',fontFamily:'inherit',fontSize:'.88rem',resize:'vertical'}}/>
        : <input value={form[key]||''} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder}
            style={{width:'100%',padding:10,borderRadius:8,border:'1px solid var(--color-border2)',background:'var(--color-bg2)',color:'var(--color-text-primary)',fontFamily:'inherit',fontSize:'.88rem'}}/>
      }
    </div>
  )
  return (
    <div style={{background:'var(--color-surface)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:12,padding:'1.5rem',marginBottom:'1rem'}}>
      <h3 style={{margin:'0 0 1.2rem',fontSize:'.95rem',fontWeight:700,color:'#f5a623'}}>{form.id?'עריכת מושג':'מושג חדש'}</h3>
      {inp('מונח','term','text','לדוגמה: P/E Ratio')}
      {inp('הגדרה','definition','textarea','הסבר המושג...')}
      {inp('דוגמה (אופציונלי)','example','textarea','דוגמה מעשית...')}
      <div style={{marginBottom:'1rem',display:'flex',gap:12}}>
        <div style={{flex:1}}>
          <label style={{display:'block',fontSize:'.82rem',fontWeight:600,color:'var(--color-text-secondary)',marginBottom:5}}>קטגוריה</label>
          <select value={form.category||'כללי'} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
            style={{width:'100%',padding:10,borderRadius:8,border:'1px solid var(--color-border2)',background:'var(--color-bg2)',color:'var(--color-text-primary)',fontFamily:'inherit'}}>
            {['כללי','ניתוח בסיסי','ניתוח טכני','אגרות חוב','נגזרים','מאקרו'].map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{display:'block',fontSize:'.82rem',fontWeight:600,color:'var(--color-text-secondary)',marginBottom:5}}>סדר הצגה</label>
          <input type="number" value={form.sort_order||0} onChange={e=>setForm(f=>({...f,sort_order:parseInt(e.target.value)||0}))}
            style={{width:80,padding:10,borderRadius:8,border:'1px solid var(--color-border2)',background:'var(--color-bg2)',color:'var(--color-text-primary)',fontFamily:'inherit'}}/>
        </div>
      </div>
      <div style={{marginBottom:'1.2rem',display:'flex',alignItems:'center',gap:10}}>
        <input type="checkbox" id="pub_ac" checked={form.published||false} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} style={{width:16,height:16}}/>
        <label htmlFor="pub_ac" style={{fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>פורסם</label>
      </div>
      <div style={{display:'flex',gap:10}}>
        <button onClick={()=>onSave(form)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 18px',borderRadius:9,border:'none',background:'#f5a623',color:'#0d0f14',cursor:'pointer',fontFamily:'inherit',fontWeight:700,fontSize:'.88rem'}}>
          <Save size={14}/> שמור
        </button>
        <button onClick={onCancel} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:9,border:'1px solid var(--color-border)',background:'transparent',color:'var(--color-text-muted)',cursor:'pointer',fontFamily:'inherit',fontSize:'.88rem'}}>
          <X size={14}/> ביטול
        </button>
      </div>
    </div>
  )
}