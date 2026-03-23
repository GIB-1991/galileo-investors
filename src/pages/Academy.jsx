import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Search, BookOpen } from 'lucide-react'
import { supabase } from '../services/supabase.js'

export default function Academy() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('הכל')

  useEffect(() => { loadAcademy() }, [])

  async function loadAcademy() {
    setLoading(true)
    const { data } = await supabase.from('academy_items').select('*').eq('published', true).order('sort_order')
    if (data) setItems(data)
    setLoading(false)
  }

  const categories = ['הכל', ...new Set(items.map(i => i.category).filter(Boolean))]
  const filtered = items.filter(item => {
    const matchCat = activeCategory === 'הכל' || item.category === activeCategory
    const matchSearch = !search || item.term.toLowerCase().includes(search.toLowerCase()) || item.definition.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:800,margin:'0 0 6px'}}>אקדמיה</h1>
        <p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>מילון מושגים פיננסיים מרחיב</p>
      </div>
      <div style={{position:'relative',marginBottom:'1rem'}}>
        <Search size={15} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--color-text-muted)'}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="חפש מושג..."
          style={{width:'100%',padding:'10px 36px 10px 12px',borderRadius:10,border:'1px solid var(--color-border2)',background:'var(--color-surface)',color:'var(--color-text-primary)',fontFamily:'inherit',fontSize:'.9rem',outline:'none',direction:'rtl'}}/>
      </div>
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
          <BookOpen size={20} style={{marginBottom:8,opacity:.5}}/><p style={{margin:0}}>טוען...</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {filtered.map(item => (
            <div key={item.id} style={{background:'var(--color-surface)',border:'1px solid '+(open===item.id?'rgba(245,166,35,0.25)':'var(--color-border)'),borderRadius:12,overflow:'hidden',transition:'border-color 200ms'}}>
              <button onClick={() => setOpen(open===item.id ? null : item.id)}
                style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.25rem',background:'none',border:'none',cursor:'pointer',color:'inherit',fontFamily:'inherit',textAlign:'right'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  {open===item.id ? <ChevronUp size={16} style={{color:'#f5a623',flexShrink:0}}/> : <ChevronDown size={16} style={{color:'var(--color-text-muted)',flexShrink:0}}/>}
                  {item.category && <span style={{fontSize:'.7rem',fontWeight:600,color:'#f5a623',background:'rgba(245,166,35,0.1)',padding:'2px 8px',borderRadius:8}}>{item.category}</span>}
                </div>
                <span style={{fontWeight:700,fontSize:'.95rem'}}>{item.term}</span>
              </button>
              {open===item.id && (
                <div style={{padding:'0 1.25rem 1.25rem',borderTop:'1px solid var(--color-border)'}}>
                  <p style={{margin:'1rem 0 0',fontSize:'.88rem',lineHeight:1.7,color:'var(--color-text-secondary)'}}>{item.definition}</p>
                  {item.example && (
                    <div style={{marginTop:'.75rem',background:'rgba(245,166,35,0.06)',border:'1px solid rgba(245,166,35,0.15)',borderRadius:8,padding:'.75rem 1rem'}}>
                      <p style={{margin:0,fontSize:'.83rem',color:'var(--color-text-muted)',lineHeight:1.6}}><strong style={{color:'#f5a623'}}>דוגמה: </strong>{item.example}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div style={{textAlign:'center',padding:'3rem',color:'var(--color-text-muted)'}}>לא נמצאו מושגים</div>}
        </div>
      )}
    </div>
  )
}