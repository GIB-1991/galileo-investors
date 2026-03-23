import { useState, useEffect } from 'react'
import { ExternalLink, RefreshCw, Tag } from 'lucide-react'
import { supabase } from '../services/supabase.js'

export default function Articles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('הכל')

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles() {
    setLoading(true)
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    if (data) setArticles(data)
    setLoading(false)
  }

  const categories = ['הכל', ...new Set(articles.map(a => a.category).filter(Boolean))]
  const filtered = activeCategory === 'הכל' ? articles : articles.filter(a => a.category === activeCategory)

  return (
    <div>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:800,margin:'0 0 6px'}}>מאמרים</h1>
        <p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>תוכן עדכני על שוק ההון והשקעות</p>
      </div>

      {/* Category filter */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.5rem'}}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{padding:'5px 14px',borderRadius:20,border:'1px solid '+(activeCategory===cat?'rgba(245,166,35,0.5)':'var(--color-border)'),background:activeCategory===cat?'rgba(245,166,35,0.12)':'transparent',color:activeCategory===cat?'#f5a623':'var(--color-text-secondary)',cursor:'pointer',fontFamily:'inherit',fontSize:'.8rem',fontWeight:activeCategory===cat?700:400,transition:'all 180ms'}}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'3rem',color:'var(--color-text-muted)'}}>
          <RefreshCw size={20} style={{animation:'spin 1s linear infinite',marginBottom:8}}/>
          <p style={{margin:0}}>טוען מאמרים...</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:'1.25rem'}}>
          {filtered.map(article => (
            <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer"
              style={{display:'block',background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,padding:'1.25rem',textDecoration:'none',color:'inherit',transition:'all 200ms'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(245,166,35,0.3)';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--color-border)';e.currentTarget.style.transform='translateY(0)'}}>
              {article.image_url && (
                <div style={{height:160,borderRadius:8,overflow:'hidden',marginBottom:'1rem',background:'var(--color-bg2)'}}>
                  <img src={article.image_url} alt={article.title} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.parentElement.style.display='none'}/>
                </div>
              )}
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                {article.category && (
                  <span style={{display:'flex',alignItems:'center',gap:4,fontSize:'.72rem',fontWeight:600,color:'#f5a623',background:'rgba(245,166,35,0.1)',padding:'2px 8px',borderRadius:8}}>
                    <Tag size={10}/>{article.category}
                  </span>
                )}
                {article.created_at && (
                  <span style={{fontSize:'.72rem',color:'var(--color-text-muted)'}}>
                    {new Date(article.created_at).toLocaleDateString('he-IL')}
                  </span>
                )}
              </div>
              <h3 style={{margin:'0 0 8px',fontSize:'1rem',fontWeight:700,lineHeight:1.45,color:'var(--color-text-primary)'}}>{article.title}</h3>
              {article.summary && <p style={{margin:'0 0 12px',fontSize:'.84rem',color:'var(--color-text-secondary)',lineHeight:1.6}}>{article.summary}</p>}
              <div style={{display:'flex',alignItems:'center',gap:4,fontSize:'.8rem',color:'#f5a623',fontWeight:600}}>
                <ExternalLink size={13}/> קרא עוד
              </div>
            </a>
          ))}
          {filtered.length === 0 && (
            <div style={{gridColumn:'1/-1',textAlign:'center',padding:'3rem',color:'var(--color-text-muted)'}}>
              אין מאמרים בקטגוריה זו
            </div>
          )}
        </div>
      )}
    </div>
  )
}