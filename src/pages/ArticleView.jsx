import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowRight, Tag, Calendar, RefreshCw } from 'lucide-react'
import { supabase } from '../services/supabase.js'

function sanitizeHtml(html) {
  if (!html) return ''
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/ on[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}

export default function ArticleView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('articles').select('*').eq('id', id).eq('published', true).single()
    setArticle(data || null)
    setLoading(false)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}><RefreshCw size={22} style={{ animation: 'spin 1s linear infinite' }} /></div>
  if (!article) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>המאמר לא נמצא או לא פורסם</div>

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <button onClick={() => navigate('/articles')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', marginBottom: '1.5rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}>
        <ArrowRight size={14} /> חזרה למאמרים
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {article.category && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.78rem', fontWeight: 600, color: '#f5a623', background: 'rgba(245,166,35,0.1)', padding: '4px 11px', borderRadius: 14 }}>
            <Tag size={11} />{article.category}
          </span>
        )}
        {article.created_at && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.78rem', color: 'var(--color-text-muted)' }}>
            <Calendar size={11} />
            {new Date(article.created_at).toLocaleDateString('he-IL')}
          </span>
        )}
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.3, margin: '0 0 1.2rem', color: 'var(--color-text-primary)' }}>{article.title}</h1>
      {article.summary && <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', margin: '0 0 1.5rem', fontWeight: 500 }}>{article.summary}</p>}

      {article.image_url && (
        <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: '2rem', background: 'var(--color-bg2)' }}>
          <img src={article.image_url} alt={article.title} style={{ width: '100%', height: 'auto', display: 'block' }} onError={e => e.target.parentElement.style.display = 'none'} />
        </div>
      )}

      <div className="article-content" style={{ fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--color-text-primary)' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content || '') }} />
    </div>
  )
}
