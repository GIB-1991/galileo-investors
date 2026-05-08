import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase.js'
import { Plus, Edit2, Trash2, Save, X, Users, FileText, BookOpen, ChevronDown, ChevronUp, Eye, EyeOff, Image as ImageIcon, Send, ArrowLeft } from 'lucide-react'

const ADMIN_EMAIL = 'gilbitan2000@gmail.com'

// Markdown -> HTML for preview
function mdToHtml(src) {
  if (!src) return ''
  let s = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2"/>')
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  s = s.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  s = s.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  s = s.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
  s = s.replace(/(^- .+(\n- .+)*)/gm, m => '<ul>' + m.split('\n').map(l => '<li>' + l.replace(/^- /, '') + '</li>').join('') + '</ul>')
  const blocks = s.split(/\n{2,}/).map(b => {
    const t = b.trim()
    if (!t) return ''
    if (/^<(h[1-6]|ul|ol|blockquote|img|p|div|pre)/i.test(t)) return t
    return '<p>' + t.replace(/\n/g, '<br/>') + '</p>'
  })
  return blocks.join('\n')
}

export default function Admin({ user }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('articles')
  const [articles, setArticles] = useState([])
  const [academy, setAcademy] = useState([])
  const [users, setUsers] = useState([])
  const [editingArticle, setEditingArticle] = useState(null) // null | object (form mode)
  const [editingAcademy, setEditingAcademy] = useState(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) { navigate('/'); return }
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

  async function saveArticle(data, opts = {}) {
    setLoading(true)
    const now = new Date().toISOString()
    const payload = { ...data, updated_at: now }
    if (opts.publish !== undefined) payload.published = opts.publish
    let saved
    if (data.id) {
      const r = await supabase.from('articles').update(payload).eq('id', data.id).select().single()
      saved = r.data
    } else {
      const r = await supabase.from('articles').insert({...payload, created_at: now}).select().single()
      saved = r.data
    }
    setMsg(opts.publish ? '✓ פורסם בהצלחה' : '✓ נשמר כטיוטה')
    setTimeout(() => setMsg(''), 2500)
    await loadAll()
    setLoading(false)
    return saved
  }

  async function deleteArticle(id) {
    if (!window.confirm('למחוק את המאמר?')) return
    await supabase.from('articles').delete().eq('id', id)
    loadAll()
  }

  async function saveAcademy(data) {
    setLoading(true)
    const now = new Date().toISOString()
    if (data.id) await supabase.from('academy_items').update({...data, updated_at:now}).eq('id', data.id)
    else await supabase.from('academy_items').insert({...data, created_at:now})
    setEditingAcademy(null)
    loadAll(); setLoading(false)
  }

  async function deleteAcademy(id) {
    if (!window.confirm('למחוק?')) return
    await supabase.from('academy_items').delete().eq('id', id)
    loadAll()
  }

  // ==== EDITOR MODE: full-screen article editor ====
  if (editingArticle) {
    return <ArticleEditor article={editingArticle} onSave={saveArticle} onClose={() => setEditingArticle(null)} msg={msg} />
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>ניהול</h1>

      {msg && <div style={{ padding: '10px 14px', marginBottom: '1rem', background: 'rgba(45,216,122,.1)', border: '1px solid rgba(45,216,122,.3)', borderRadius: 8, color: '#2dd87a', fontSize: '.9rem' }}>{msg}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <button onClick={() => setTab('articles')} style={{ padding: '10px 18px', background: 'transparent', border: 'none', borderBottom: tab==='articles' ? '2px solid #f5a623' : '2px solid transparent', color: tab==='articles' ? '#f5a623' : 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '.9rem' }}>
          <FileText size={14} style={{marginLeft:6}}/> מאמרים ({articles.length})
        </button>
        <button onClick={() => setTab('academy')} style={{ padding: '10px 18px', background: 'transparent', border: 'none', borderBottom: tab==='academy' ? '2px solid #f5a623' : '2px solid transparent', color: tab==='academy' ? '#f5a623' : 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '.9rem' }}>
          <BookOpen size={14} style={{marginLeft:6}}/> אקדמיה ({academy.length})
        </button>
        <button onClick={() => setTab('users')} style={{ padding: '10px 18px', background: 'transparent', border: 'none', borderBottom: tab==='users' ? '2px solid #f5a623' : '2px solid transparent', color: tab==='users' ? '#f5a623' : 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '.9rem' }}>
          <Users size={14} style={{marginLeft:6}}/> משתמשים ({users.length})
        </button>
      </div>

      {tab === 'articles' && (
        <div>
          <button onClick={() => setEditingArticle({ title:'', summary:'', content:'', image_url:'', url:'', category:'כללי', published:false })}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px', borderRadius:9, border:'none', background:'#f5a623', color:'#0d0f14', cursor:'pointer', fontWeight:700, fontSize:'.9rem', marginBottom:'1rem' }}>
            <Plus size={14}/> מאמר חדש
          </button>

          <div style={{ display:'grid', gap:'.6rem' }}>
            {articles.map(a => (
              <div key={a.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                  <span style={{ fontSize:'.7rem', padding:'3px 8px', borderRadius:4, fontWeight:700, background: a.published ? 'rgba(45,216,122,.15)' : 'rgba(245,166,35,.15)', color: a.published ? '#2dd87a' : '#f5a623' }}>
                    {a.published ? 'מפורסם' : 'טיוטה'}
                  </span>
                  <span style={{ fontWeight:600, fontSize:'.92rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title || '(ללא כותרת)'}</span>
                  <span style={{ fontSize:'.75rem', color:'var(--color-text-muted)' }}>{a.category}</span>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => setEditingArticle(a)} style={{ padding:'6px 10px', borderRadius:7, border:'1px solid var(--color-border)', background:'transparent', color:'var(--color-text-primary)', cursor:'pointer' }}><Edit2 size={13}/></button>
                  <button onClick={() => deleteArticle(a.id)} style={{ padding:'6px 10px', borderRadius:7, border:'1px solid rgba(240,82,82,.3)', background:'transparent', color:'#f05252', cursor:'pointer' }}><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
            {articles.length === 0 && <div style={{ textAlign:'center', padding:'2rem', color:'var(--color-text-muted)' }}>אין מאמרים. לחץ "מאמר חדש" כדי להתחיל.</div>}
          </div>
        </div>
      )}

      {tab === 'academy' && (
        <div>
          <button onClick={() => setEditingAcademy({ title:'', description:'', url:'', category:'בסיסי', sort_order:0 })}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px', borderRadius:9, border:'none', background:'#f5a623', color:'#0d0f14', cursor:'pointer', fontWeight:700, fontSize:'.9rem', marginBottom:'1rem' }}>
            <Plus size={14}/> פריט חדש
          </button>
          {editingAcademy && <AcademyForm data={editingAcademy} onSave={saveAcademy} onCancel={() => setEditingAcademy(null)}/>}
          <div style={{ display:'grid', gap:'.6rem' }}>
            {academy.map(a => (
              <div key={a.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:10 }}>
                <span style={{ fontWeight:600 }}>{a.title}</span>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => setEditingAcademy(a)} style={{ padding:'6px 10px', borderRadius:7, border:'1px solid var(--color-border)', background:'transparent', cursor:'pointer' }}><Edit2 size={13}/></button>
                  <button onClick={() => deleteAcademy(a.id)} style={{ padding:'6px 10px', borderRadius:7, border:'1px solid rgba(240,82,82,.3)', background:'transparent', color:'#f05252', cursor:'pointer' }}><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div style={{ display:'grid', gap:'.5rem' }}>
          {users.map(u => (
            <div key={u.id} style={{ padding:'10px 14px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:8 }}>
              <span style={{ fontWeight:600 }}>{u.email}</span>
              <span style={{ fontSize:'.78rem', color:'var(--color-text-muted)', marginRight:10 }}>{new Date(u.created_at).toLocaleDateString('he-IL')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ FULL-SCREEN ARTICLE EDITOR ============
function ArticleEditor({ article, onSave, onClose, msg }) {
  // State held entirely locally — no autosave, no reload, no localStorage. Pure form.
  const [form, setForm] = useState({ ...article })
  const [showPreview, setShowPreview] = useState(true)
  const taRef = useRef(null)
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  // Insert text at textarea cursor
  function insertAtCursor(text) {
    const ta = taRef.current
    if (!ta) { set('content', (form.content || '') + text); return }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const cur = form.content || ''
    const next = cur.slice(0, start) + text + cur.slice(end)
    set('content', next)
    setTimeout(() => { ta.focus(); const p = start + text.length; ta.setSelectionRange(p, p) }, 0)
  }

  async function uploadAndInsert(file) {
    if (!file) return
    setUploading(true)
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
      const { error } = await supabase.storage.from('article-images').upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) { alert('שגיאה בהעלאה: ' + error.message); return }
      const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(path)
      insertAtCursor(`\n\n![](${publicUrl})\n\n`)
    } finally { setUploading(false) }
  }

  function onPaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const it of items) {
      if (it.type && it.type.startsWith('image/')) {
        const f = it.getAsFile()
        if (f) { e.preventDefault(); uploadAndInsert(f); return }
      }
    }
  }

  function onDrop(e) {
    e.preventDefault()
    const f = e.dataTransfer?.files?.[0]
    if (f && f.type.startsWith('image/')) uploadAndInsert(f)
  }

  // Extract images from content for the preview gallery
  const imgUrls = []
  {
    const re = /!\[[^\]]*\]\(([^)\s]+)\)/g
    let m
    const txt = form.content || ''
    while ((m = re.exec(txt)) !== null) imgUrls.push(m[1])
  }

  function removeImage(url) {
    if (!window.confirm('להסיר את התמונה?')) return
    const escaped = url.split('').map(ch => /[.*+?^=!:${}()|[\]\\\/]/.test(ch) ? '\\' + ch : ch).join('')
    const re = new RegExp('!\\[[^\\]]*\\]\\(' + escaped + '\\)', 'g')
    const next = (form.content || '').replace(re, '').replace(/\n{3,}/g, '\n\n')
    set('content', next)
  }

  async function handleSave(publish) {
    if (!form.title?.trim()) { alert('יש למלא כותרת'); return }
    await onSave(form, { publish })
    if (publish) onClose()
  }

  return createPortal(
    <div style={{ position:'fixed', top:72, left:0, right:0, bottom:0, background:'var(--color-bg)', zIndex:50, display:'flex', flexDirection:'column' }}>
      {/* Body: split view */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* LEFT: Editor */}
        <div style={{ flex: showPreview ? '1 1 50%' : '1 1 100%', overflow:'auto', padding:'2rem 2.5rem', borderInlineEnd: showPreview ? '1px solid var(--color-border)' : 'none' }}>
          <input type="text" value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="כותרת המאמר"
            style={{ width:'100%', padding:'8px 0', border:'none', outline:'none', background:'transparent', color:'var(--color-text-primary)', fontSize:'1.8rem', fontWeight:800, marginBottom:'1rem', borderBottom:'1px solid var(--color-border)' }}/>

          <textarea value={form.summary || ''} onChange={e => set('summary', e.target.value)} placeholder="תקציר קצר (יוצג בכרטיס המאמר)" rows={2}
            style={{ width:'100%', padding:'8px 0', border:'none', outline:'none', background:'transparent', color:'var(--color-text-secondary)', fontSize:'1rem', resize:'none', marginBottom:'1rem', borderBottom:'1px solid var(--color-border)', fontFamily:'inherit' }}/>

          <div style={{ display:'flex', gap:10, marginBottom:'1rem', flexWrap:'wrap' }}>
            <input type="url" value={form.image_url || ''} onChange={e => set('image_url', e.target.value)} placeholder="תמונה ראשית URL (אופציונלי)"
              style={{ flex:1, minWidth:200, padding:'7px 10px', borderRadius:7, border:'1px solid var(--color-border)', background:'var(--color-bg2)', color:'var(--color-text-primary)', fontSize:'.85rem' }}/>
            <select value={form.category || 'כללי'} onChange={e => set('category', e.target.value)}
              style={{ padding:'7px 10px', borderRadius:7, border:'1px solid var(--color-border)', background:'var(--color-bg2)', color:'var(--color-text-primary)', fontSize:'.85rem' }}>
              {['כללי','ניתוח','דו"ח','חינוך','השקעות','מאקרו','גיאופוליטי'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <input type="file" ref={fileRef} accept="image/*" style={{display:'none'}} onChange={e => { uploadAndInsert(e.target.files?.[0]); e.target.value='' }}/>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:7, border:'1px solid var(--color-border)', background:'var(--color-bg2)', color:'var(--color-text-primary)', cursor:'pointer', fontSize:'.78rem', fontWeight:600 }}>
              <ImageIcon size={13}/> {uploading ? 'מעלה...' : 'הוסף תמונה'}
            </button>
            <span style={{ fontSize:'.72rem', color:'var(--color-text-muted)' }}>או הדבק (Ctrl+V) / גרור לתוך העורך</span>
          </div>

          <textarea ref={taRef} value={form.content || ''} onChange={e => set('content', e.target.value)} onPaste={onPaste} onDrop={onDrop} onDragOver={e=>e.preventDefault()}
            placeholder="התחל לכתוב את המאמר כאן...&#10;&#10;Markdown נתמך:&#10;# כותרת&#10;## כותרת משנית&#10;**מודגש**  *נטוי*&#10;[קישור](https://...)&#10;> ציטוט&#10;- רשימה" dir="auto"
            style={{ width:'100%', minHeight:'60vh', padding:14, border:'1px solid var(--color-border)', borderRadius:10, background:'var(--color-bg2)', color:'var(--color-text-primary)', fontSize:'1rem', lineHeight:1.7, resize:'vertical', fontFamily:'inherit', outline:'none', unicodeBidi:'plaintext' }}/>

          {imgUrls.length > 0 && (
            <div style={{ marginTop:12, padding:10, background:'var(--color-bg2)', borderRadius:8, border:'1px solid var(--color-border)' }}>
              <div style={{ fontSize:'.75rem', fontWeight:600, color:'var(--color-text-secondary)', marginBottom:8 }}>תמונות במאמר ({imgUrls.length})</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {imgUrls.map((u, i) => (
                  <div key={u+i} style={{ position:'relative', width:80, height:80, borderRadius:6, overflow:'hidden', border:'1px solid var(--color-border)' }}>
                    <img src={u} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    <button type="button" onClick={() => removeImage(u)} style={{ position:'absolute', top:2, right:2, width:20, height:20, borderRadius:'50%', border:'none', background:'rgba(0,0,0,.75)', color:'#fff', cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Live Preview */}
        {showPreview && (
          <div style={{ flex:'1 1 50%', overflow:'auto', padding:'2rem 2.5rem', background:'var(--color-bg)' }}>
            <div style={{ maxWidth:680, margin:'0 auto' }}>
              <div style={{ fontSize:'.7rem', fontWeight:700, color:'#f5a623', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>תצוגה מקדימה</div>
              {form.image_url && <div style={{ borderRadius:12, overflow:'hidden', marginBottom:'1.5rem', background:'var(--color-bg2)' }}><img src={form.image_url} alt="" style={{ width:'100%', display:'block' }} onError={e => e.target.parentElement.style.display='none'}/></div>}
              <h1 style={{ fontSize:'1.8rem', fontWeight:800, lineHeight:1.3, margin:'0 0 1rem' }}>{form.title || <span style={{color:'var(--color-text-muted)',fontWeight:400}}>(הכותרת תופיע כאן)</span>}</h1>
              {form.summary && <p style={{ fontSize:'1.02rem', color:'var(--color-text-secondary)', lineHeight:1.55, margin:'0 0 1.5rem', fontWeight:500 }}>{form.summary}</p>}
              <div className="article-content" style={{ fontSize:'1rem', lineHeight:1.85 }} dangerouslySetInnerHTML={{ __html: mdToHtml(form.content || '') }}/>
              {!form.content && <p style={{ color:'var(--color-text-muted)', fontStyle:'italic' }}>(התוכן יופיע כאן בזמן אמת בזמן הכתיבה)</p>}
            </div>
          </div>
        )}
      </div>
      {/* Bottom action bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 24px', borderTop:'1px solid var(--color-border)', background:'var(--color-surface)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onClose} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:8, border:'1px solid var(--color-border)', background:'transparent', color:'var(--color-text-primary)', cursor:'pointer', fontSize:'.85rem' }}>
            <ArrowLeft size={14}/> סגור
          </button>
          <span style={{ fontSize:'.85rem', color:'var(--color-text-muted)' }}>
            {form.id ? 'עריכת מאמר' : 'מאמר חדש'} · {form.published ? <span style={{color:'#2dd87a',fontWeight:600}}>מפורסם</span> : <span style={{color:'#f5a623',fontWeight:600}}>טיוטה</span>}
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {msg && <span style={{ fontSize:'.8rem', color:'#2dd87a', fontWeight:600 }}>{msg}</span>}
          <button onClick={() => setShowPreview(!showPreview)} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:8, border:'1px solid var(--color-border)', background:'transparent', color:'var(--color-text-primary)', cursor:'pointer', fontSize:'.82rem' }}>
            {showPreview ? <EyeOff size={13}/> : <Eye size={13}/>} {showPreview ? 'הסתר תצוגה' : 'הצג תצוגה'}
          </button>
          <button onClick={() => handleSave(false)} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid var(--color-border)', background:'transparent', color:'var(--color-text-primary)', cursor:'pointer', fontWeight:600, fontSize:'.85rem' }}>
            שמור טיוטה
          </button>
          <button onClick={() => handleSave(true)} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 18px', borderRadius:8, border:'none', background:'#f5a623', color:'#0d0f14', cursor:'pointer', fontWeight:700, fontSize:'.88rem' }}>
            <Send size={13}/> {form.published ? 'עדכן פרסום' : 'פרסם'}
          </button>
        </div>
      </div>


    </div>
  , document.body)
}

function AcademyForm({ data, onSave, onCancel }) {
  const [form, setForm] = useState({...data})
  const set = (k, v) => setForm(f => ({...f, [k]: v}))
  return (
    <div style={{ background:'var(--color-surface)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:12, padding:'1.5rem', marginBottom:'1rem' }}>
      <h3 style={{ margin:'0 0 1rem', color:'#f5a623', fontWeight:700 }}>{form.id ? 'עריכת פריט' : 'פריט חדש'}</h3>
      <div style={{ marginBottom:10 }}>
        <input value={form.title||''} onChange={e=>set('title',e.target.value)} placeholder="כותרת"
          style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid var(--color-border2)', background:'var(--color-bg2)', color:'var(--color-text-primary)', fontSize:'.9rem' }}/>
      </div>
      <div style={{ marginBottom:10 }}>
        <textarea value={form.description||''} onChange={e=>set('description',e.target.value)} placeholder="תיאור" rows={3}
          style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid var(--color-border2)', background:'var(--color-bg2)', color:'var(--color-text-primary)', fontSize:'.9rem', fontFamily:'inherit', resize:'vertical' }}/>
      </div>
      <div style={{ marginBottom:10 }}>
        <input value={form.url||''} onChange={e=>set('url',e.target.value)} placeholder="URL"
          style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid var(--color-border2)', background:'var(--color-bg2)', color:'var(--color-text-primary)', fontSize:'.9rem' }}/>
      </div>
      <div style={{ marginBottom:10, display:'flex', gap:10 }}>
        <select value={form.category||'בסיסי'} onChange={e=>set('category',e.target.value)}
          style={{ flex:1, padding:10, borderRadius:8, border:'1px solid var(--color-border2)', background:'var(--color-bg2)', color:'var(--color-text-primary)', fontSize:'.9rem' }}>
          {['בסיסי','מתקדם','כלכלה','השקעות','ניתוח טכני'].map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" value={form.sort_order||0} onChange={e=>set('sort_order',parseInt(e.target.value)||0)} placeholder="סדר"
          style={{ width:80, padding:10, borderRadius:8, border:'1px solid var(--color-border2)', background:'var(--color-bg2)', color:'var(--color-text-primary)', fontSize:'.9rem' }}/>
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={()=>onSave(form)} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 16px', borderRadius:8, border:'none', background:'#f5a623', color:'#0d0f14', cursor:'pointer', fontWeight:700, fontSize:'.85rem' }}><Save size={13}/> שמור</button>
        <button onClick={onCancel} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:8, border:'1px solid var(--color-border)', background:'transparent', color:'var(--color-text-primary)', cursor:'pointer', fontSize:'.85rem' }}><X size={13}/> ביטול</button>
      </div>
    </div>
  )
}
