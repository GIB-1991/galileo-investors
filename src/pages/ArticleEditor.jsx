import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../services/supabase.js'
import { Bold, Italic, Heading2, Quote, List, Image as ImageIcon, Save, Eye, ArrowRight, Trash2, Check } from 'lucide-react'

// Simple HTML sanitizer — strip script/style/event handlers, keep safe tags
function sanitizeHtml(html) {
  if (!html) return ''
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/ on[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}

// Upload an image File to Supabase Storage and return its public URL
async function uploadImage(file) {
  const ext = (file.name?.split('.').pop() || 'png').toLowerCase()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('article-images').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) { alert('שגיאה בהעלאה: ' + error.message); return null }
  const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(path)
  return publicUrl
}

const CATEGORIES = ['כללי', 'ניתוח', 'דו"ח', 'חינוך', 'השקעות', 'מאקרו', 'גיאופוליטי']

export default function ArticleEditor() {
  const { id } = useParams() // 'new' for new article, otherwise UUID
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  // Form state — initialized once and never re-fetched (truly static).
  const [form, setForm] = useState({
    title: '',
    summary: '',
    image_url: '',
    category: 'כללי',
    content: '',
    published: false
  })
  const [loaded, setLoaded] = useState(isNew) // for existing: don't show editor until loaded
  const [recordId, setRecordId] = useState(isNew ? null : id)
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [imageBusy, setImageBusy] = useState(false)

  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const heroFileInputRef = useRef(null)

  // Load existing article ONCE on mount (only when editing existing)
  useEffect(() => {
    if (isNew) return
    let cancelled = false
    ;(async () => {
      const { data } = await supabase.from('articles').select('*').eq('id', id).single()
      if (cancelled) return
      if (data) {
        setForm({
          title: data.title || '',
          summary: data.summary || '',
          image_url: data.image_url || '',
          category: data.category || 'כללי',
          content: data.content || '',
          published: !!data.published
        })
        setRecordId(data.id)
        // Set the contenteditable HTML once (after paint)
        setTimeout(() => {
          if (editorRef.current) editorRef.current.innerHTML = sanitizeHtml(data.content || '')
        }, 0)
      }
      setLoaded(true)
    })()
    return () => { cancelled = true }
  }, [id, isNew])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  // ---------- Editor commands ----------
  function exec(cmd, value) {
    document.execCommand(cmd, false, value)
    syncFromEditor()
    editorRef.current?.focus()
  }
  function syncFromEditor() {
    if (editorRef.current) {
      set('content', editorRef.current.innerHTML)
    }
  }
  function insertImageAtCursor(url) {
    const img = `<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:10px;margin:1rem 0;display:block"/>`
    document.execCommand('insertHTML', false, img + '<p><br/></p>')
    syncFromEditor()
  }

  // ---------- Image upload handlers ----------
  async function onChooseImage(file) {
    if (!file) return
    setImageBusy(true)
    const url = await uploadImage(file)
    setImageBusy(false)
    if (url) insertImageAtCursor(url)
  }
  async function onPaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type && item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          e.preventDefault()
          await onChooseImage(file)
          return
        }
      }
    }
  }
  async function onDrop(e) {
    const file = e.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('image/')) {
      e.preventDefault()
      await onChooseImage(file)
    }
  }
  async function onChooseHero(file) {
    if (!file) return
    setImageBusy(true)
    const url = await uploadImage(file)
    setImageBusy(false)
    if (url) set('image_url', url)
  }

  // ---------- Save handlers ----------
  async function save({ publish }) {
    if (!form.title.trim()) { alert('יש להזין כותרת'); return }
    setSaving(true)
    const now = new Date().toISOString()
    const payload = {
      title: form.title.trim(),
      summary: form.summary,
      image_url: form.image_url,
      category: form.category,
      content: form.content,
      published: publish !== undefined ? publish : form.published,
      updated_at: now
    }
    let result
    if (recordId) {
      result = await supabase.from('articles').update(payload).eq('id', recordId).select().single()
    } else {
      result = await supabase.from('articles').insert({ ...payload, created_at: now }).select().single()
      if (result.data) setRecordId(result.data.id)
    }
    setSaving(false)
    if (result.error) { alert('שגיאה בשמירה: ' + result.error.message); return }
    if (publish !== undefined) set('published', publish)
    setSavedMessage(publish === true ? 'פורסם' : publish === false ? 'הוסר מפרסום' : 'נשמר')
    setTimeout(() => setSavedMessage(''), 2500)
  }

  // ---------- Preview HTML ----------
  const previewHtml = useMemo(() => sanitizeHtml(form.content || ''), [form.content])

  if (!loaded) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>טוען...</div>

  // ---------- UI ----------
  const tbBtn = (active, onClick, children, title) => (
    <button type="button" onClick={onClick} title={title}
      style={{ padding: '6px 9px', borderRadius: 6, border: '1px solid var(--color-border)', background: active ? '#f5a623' : 'var(--color-bg2)', color: active ? '#0d0f14' : 'var(--color-text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.78rem', fontWeight: 600 }}>{children}</button>
  )

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}>
          <ArrowRight size={14} /> חזרה
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {savedMessage && <span style={{ color: '#2dd87a', fontSize: '.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={13} /> {savedMessage}</span>}
          <button onClick={() => setShowPreview(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: showPreview ? 'rgba(245,166,35,0.1)' : 'transparent', color: showPreview ? '#f5a623' : 'var(--color-text-primary)', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}>
            <Eye size={14} /> {showPreview ? 'עריכה' : 'תצוגה מקדימה'}
          </button>
          <button onClick={() => save({})} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg2)', color: 'var(--color-text-primary)', cursor: saving ? 'wait' : 'pointer', fontSize: '.85rem', fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
            <Save size={14} /> {saving ? 'שומר...' : 'שמור טיוטה'}
          </button>
          {form.published ? (
            <button onClick={() => save({ publish: false })} disabled={saving} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#7a1f1f', color: '#fff', cursor: saving ? 'wait' : 'pointer', fontSize: '.85rem', fontWeight: 700 }}>
              הסר מפרסום
            </button>
          ) : (
            <button onClick={() => save({ publish: true })} disabled={saving} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#f5a623', color: '#0d0f14', cursor: saving ? 'wait' : 'pointer', fontSize: '.85rem', fontWeight: 700 }}>
              פרסם
            </button>
          )}
        </div>
      </div>

      {/* Status pill */}
      <div style={{ marginBottom: '1.2rem' }}>
        <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 12, fontSize: '.72rem', fontWeight: 700, background: form.published ? 'rgba(45,216,122,.12)' : 'rgba(245,166,35,.12)', color: form.published ? '#2dd87a' : '#f5a623', border: '1px solid ' + (form.published ? 'rgba(45,216,122,.3)' : 'rgba(245,166,35,.3)') }}>
          {form.published ? '● מפורסם' : '○ טיוטה'}
        </span>
      </div>

      {showPreview ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '2rem' }}>
          {form.image_url && <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}><img src={form.image_url} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} /></div>}
          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.3, margin: '0 0 1rem' }}>{form.title || 'ללא כותרת'}</h1>
          {form.summary && <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', fontWeight: 500 }}>{form.summary}</p>}
          <div className="article-content" style={{ fontSize: '1.05rem', lineHeight: 1.85 }} dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="opacity:.5">[ אין תוכן עדיין ]</p>' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Title */}
          <input
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="כותרת המאמר"
            style={{ width: '100%', padding: 12, fontSize: '1.5rem', fontWeight: 700, background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'inherit' }}
          />

          {/* Summary */}
          <textarea
            value={form.summary}
            onChange={e => set('summary', e.target.value)}
            placeholder="תקציר קצר (יוצג בכרטיס המאמר ברשימה)"
            rows={2}
            style={{ width: '100%', padding: 10, fontSize: '.95rem', background: 'var(--color-bg2)', border: '1px solid var(--color-border2)', borderRadius: 8, color: 'var(--color-text-primary)', fontFamily: 'inherit', resize: 'vertical' }}
          />

          {/* Hero image + category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 10 }}>
            <div>
              <label style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>תמונה ראשית</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  value={form.image_url}
                  onChange={e => set('image_url', e.target.value)}
                  placeholder="URL תמונה ראשית, או העלה למטה"
                  style={{ flex: 1, padding: 8, fontSize: '.85rem', background: 'var(--color-bg2)', border: '1px solid var(--color-border2)', borderRadius: 7, color: 'var(--color-text-primary)' }}
                />
                <input type="file" ref={heroFileInputRef} accept="image/*" style={{ display: 'none' }} onChange={e => { onChooseHero(e.target.files?.[0]); e.target.value = '' }} />
                <button type="button" onClick={() => heroFileInputRef.current?.click()} style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'var(--color-bg2)', color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: '.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ImageIcon size={13} /> העלה
                </button>
              </div>
              {form.image_url && (
                <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
                  <img src={form.image_url} alt="" style={{ maxWidth: 220, maxHeight: 120, borderRadius: 8, display: 'block', border: '1px solid var(--color-border)' }} onError={e => { e.target.style.display = 'none' }} />
                  <button type="button" onClick={() => set('image_url', '')} title="הסר תמונה ראשית" style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.7)', color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>קטגוריה</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                style={{ width: '100%', padding: 8, fontSize: '.85rem', background: 'var(--color-bg2)', border: '1px solid var(--color-border2)', borderRadius: 7, color: 'var(--color-text-primary)' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', padding: 8, background: 'var(--color-bg2)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
            {tbBtn(false, () => exec('bold'), <Bold size={14} />, 'מודגש (Ctrl+B)')}
            {tbBtn(false, () => exec('italic'), <Italic size={14} />, 'נטוי (Ctrl+I)')}
            {tbBtn(false, () => exec('formatBlock', 'h2'), <Heading2 size={14} />, 'כותרת')}
            {tbBtn(false, () => exec('formatBlock', 'blockquote'), <Quote size={14} />, 'ציטוט')}
            {tbBtn(false, () => exec('insertUnorderedList'), <List size={14} />, 'רשימה')}
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={e => { onChooseImage(e.target.files?.[0]); e.target.value = '' }} />
            {tbBtn(false, () => fileInputRef.current?.click(), <ImageIcon size={14} />, 'הוסף תמונה')}
            {imageBusy && <span style={{ marginInlineStart: 'auto', fontSize: '.75rem', color: '#f5a623', alignSelf: 'center' }}>מעלה תמונה...</span>}
          </div>

          {/* Content editor */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncFromEditor}
            onPaste={onPaste}
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            dir="auto"
            style={{ minHeight: 400, padding: '1rem 1.2rem', background: 'var(--color-bg2)', border: '1px solid var(--color-border2)', borderRadius: 8, color: 'var(--color-text-primary)', fontSize: '1rem', lineHeight: 1.7, outline: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          />
          <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
            כתוב כאן את גוף המאמר. ניתן להדביק תמונות ישירות (Ctrl+V), לגרור מהמחשב, או ללחוץ על אייקון התמונה. הכל נשאר במצבו עד שאתה לוחץ "שמור" או "פרסם".
          </p>
        </div>
      )}
    </div>
  )
}
