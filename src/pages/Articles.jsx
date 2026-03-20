import { useState } from 'react'
import { ExternalLink, Clock, Tag } from 'lucide-react'

const ARTICLES = [
  {
    id:1, title:'למה וורן באפט מעדיף לקנות מניות צמיחה לטווח ארוך',
    summary:'אסטרטגיית הקנייה והחזקה של וורן באפט: למה לקנות חברות עם יתרון תחרותי בר קיימא ולהחזיק אותן לשנים.',
    author:'וורן באפט', date:'מרץ 2024', category:'אסטרטגיה', readTime:'8 דק', color:'#f5a623',
    url:'https://www.berkshirehathaway.com/letters/letters.html'
  },
  {
    id:2, title:'הבנת ביזור סיכונים בתיק השקעות',
    summary:'מדוע פיזור אינו רק על מניות שונות, אלא גם על מגזרים, גודל הפירמה ואזורים גיאוגרפיים.',
    author:'גלילאו', date:'אפריל 2024', category:'ניהול סיכון', readTime:'5 דק', color:'#2dd87a',
    url:'https://www.investopedia.com/terms/d/diversification.asp'
  },
  {
    id:3, title:'נסרטי 2 — סוד ההשקעה לקרנות סל',
    summary:'קרנות בסל כמו QQQ ו-SPY נתנו למשקיעים פשוטים גישה לתשואות מקצועיות בעלויות נמוכות.',
    author:'גלילאו', date:'מאי 2024', category:'ETF', readTime:'6 דק', color:'#4f8ef7',
    url:'https://www.investopedia.com/terms/e/etf.asp'
  },
  {
    id:4, title:'איך לקרוא דוח רבעוני באופן נכון',
    summary:'דוחות רבעוניים עלולים לגרום תנודותיות גדולה. מדריך מעשי לקריאת הנתונים והבנת מה עומד מאחורי המספרים.',
    author:'גלילאו', date:'יוני 2024', category:'ניתוח פונדמנטלי', readTime:'10 דק', color:'#a855f7',
    url:'https://www.investopedia.com/terms/e/eps.asp'
  },
  {
    id:5, title:'הפד ושוק המניות: חיבור שאתה חייב להכיר',
    summary:'כיצד החלטות הפד משפיעות ישירות על מחירי מניות, ולמה יום הפד הוא אחד הימים הכי תנודותיים בשנה.',
    author:'גלילאו', date:'יולי 2024', category:'מאקרו', readTime:'7 דק', color:'#fbbf24',
    url:'https://www.federalreserve.gov/monetarypolicy.htm'
  },
  {
    id:6, title:'שגיאות נפוצות שמשקיעים מתחילים עושים',
    summary:'הפסדות רגשיות, מכירה בשיעורי שוק יורד ופיצור תפקיד על הסיכון — איך להימנע מהן.',
    author:'גלילאו', date:'אוגוסט 2024', category:'פסיכולוגיה', readTime:'9 דק', color:'#f05252',
    url:'https://www.investopedia.com/articles/trading/02/110502.asp'
  },
]

const ALL_CATS = ['הכל', ...[...new Set(ARTICLES.map(a=>a.category))]]

export default function Articles() {
  const [cat, setCat] = useState('הכל')
  const [search, setSearch] = useState('')

  const filtered = ARTICLES.filter(a =>
    (cat === 'הכל' || a.category === cat) &&
    (!search || a.title.includes(search) || a.summary.includes(search))
  )

  return (
    <div>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:800,margin:'0 0 6px',color:'var(--color-text-primary)'}}>מאמרים</h1>
        <p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>קריאה מעמיקת על השקעות ושוק ההון</p>
      </div>

      <div style={{marginBottom:'1rem'}}>
        <input className='input' placeholder='חפש מאמר...' value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:'1rem'}}/>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {ALL_CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{padding:'5px 14px',borderRadius:20,fontSize:'.82rem',fontWeight:500,border:'1px solid',cursor:'pointer',fontFamily:'Heebo,sans-serif',transition:'all 180ms',
              background:cat===c?'var(--color-accent)':'transparent',
              color:cat===c?'#0d0f14':'var(--color-text-secondary)',
              borderColor:cat===c?'var(--color-accent)':'var(--color-border2)'}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.25rem'}}>
        {filtered.map(a=>(
          <a key={a.id} href={a.url} target='_blank' rel='noopener noreferrer' style={{textDecoration:'none',display:'block'}}>
            <div className='card' style={{height:'100%',cursor:'pointer',transition:'all 250ms',borderLeft:'3px solid '+a.color}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.3)';e.currentTarget.style.borderColor=a.color}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'0.75rem',flexWrap:'wrap'}}>
                <span style={{fontSize:'.72rem',fontWeight:700,background:a.color+'20',color:a.color,padding:'3px 10px',borderRadius:20,border:'1px solid '+a.color+'40'}}>
                  {a.category}
                </span>
                <span style={{display:'flex',alignItems:'center',gap:4,fontSize:'.72rem',color:'var(--color-text-muted)'}}>
                  <Clock size={11}/>{a.readTime}
                </span>
              </div>
              <h3 style={{margin:'0 0 .625rem',fontSize:'.95rem',fontWeight:700,color:'var(--color-text-primary)',lineHeight:1.45}}>{a.title}</h3>
              <p style={{margin:'0 0 1rem',fontSize:'.83rem',color:'var(--color-text-secondary)',lineHeight:1.65}}>{a.summary}</p>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'auto'}}>
                <span style={{fontSize:'.75rem',color:'var(--color-text-muted)'}}>{a.author} · {a.date}</span>
                <span style={{display:'flex',alignItems:'center',gap:4,fontSize:'.75rem',color:a.color,fontWeight:600}}>
                  קרא עוד <ExternalLink size={11}/>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{textAlign:'center',padding:'3rem',color:'var(--color-text-muted)'}}>
          לא נמצאו מאמרים
        </div>
      )}
    </div>
  )
}