import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
const TERMS=[
{term:'השקעה לטווח ארוך',english:'Long-term Investing',category:'אסטרטגיה',short:'החזקת נכסים למשך שנים. תשואה מטרה: 100%+',detail:'השקעה לטווח ארוך מבוססת על הרעיון שלמרות תנודות, על פני זמן הכלכלה צומחת. מחזיקים מניות שנים ומתעלמים מרעש יומיומי.',color:'#dcfce7'},
{term:'מסחר יומי',english:'Day Trading',category:'אסטרטגיה',short:'קנייה ומכירה ביום אחד. תנודתי מאוד. סיכון גבוה מאוד',detail:'Day Trader פותח וסוגר פוזיציות באותו יום. דורש ריכוז גבוה וסובלנות לסיכון. הרוב המוחלט מפסיד.',color:'#fee2e2'},
{term:'ריבית דריבית',english:'Compound Interest',category:'מושג יסוד',short:'הרווח שמרוויח רווח. הכוח הגדול ביותר בהשקעות.',detail:'$10,000 ב-10% לשנה: אחרי 30 שנה = $174,494. כל תשואה מצטרפת לקרן ומרוויחה גם היא.',color:'#fef3c7'},
{term:'שורט',english:'Short Selling',category:'מושג יסוד',short:'הימור שמניה תרד. Short Float מעל 10% — אזהרה.',detail:'שואלים מניות, מוכרים, קונים בחזרה בזול. Short Float מעל 10% — סיכון ל-Short Squeeze.',color:'#ede9fe'},
{term:'הנפקה ראשונה',english:'IPO',category:'מושג יסוד',short:'כשחברה נסחרת בבורסה לראשונה.',detail:'החברה מגייסת הון מהציבור. לרוב המחיר ביום הראשון תנודתי מאוד. כדאי לחכות לייצוב.',color:'#fce7f3'},
{term:'סימול מסחרי',english:'Ticker',category:'מושג יסוד',short:'AAPL = Apple, MSFT = Microsoft, NVDA = NVIDIA',detail:'כל חברה מקבלת Ticker ייחודי. ETF גם כן: SPY = S&P 500, QQQ = Nasdaq 100.',color:'#f5f5f4'},
{term:'הפד',english:'The Fed',category:'מאקרו',short:'הבנק המרכזי של ארה"ב. קובע ריבית ומשפיע על כל השווקים.',detail:'ריבית עולה → שוק לרוב יורד. ריבית יורדת → שוק לרוב עולה. FOMC מתכנס 8 פעמים בשנה.',color:'#fef9c3'},
{term:'שעות מסחר',english:'Trading Hours',category:'פרקטי',short:'NYSE פתוח 09:30-16:00 EST = 16:30-23:00 ישראל',detail:'שעות ישראל: Pre-Market 11:00-16:30, Regular 16:30-23:00, After-Hours 23:00-03:00.',color:'#f0fdf4'},
{term:'מכפיל רווח',english:'P/E Ratio',category:'ניתוח פונדמנטלי',short:'Price/Earnings. P/E 25 = משלמים $25 על $1 רווח.',detail:'P/E נמוך (<15) = זול. P/E גבוה (>40) = ציפיות צמיחה. השווה תמיד לחברות באותו סקטור.',color:'#fdf4ff'},
{term:'תנודתיות',english:'Beta',category:'ניתוח פונדמנטלי',short:'Beta 1 = כמו השוק. Beta 2 = פי 2 תנודתי.',detail:'Beta >1.5 תנודתי (TSLA=2.3). Beta <0.8 יציב (JNJ=0.55). תיק מאוזן = Beta ממוצע 1-1.2.',color:'#fff7ed'},
{term:'פיצול מניה',english:'Stock Split',category:'מושג יסוד',short:'מחלקים מניה ל-2+. המחיר יורד, השווי נשאר.',detail:'AAPL ב-$400, Split 4:1 → 4 מניות ב-$100. מנגיש למשקיעים קטנים.',color:'#eff6ff'},
{term:'דוחות כספיים',english:'Quarterly Reports',category:'ניתוח פונדמנטלי',short:'כל חברה מדווחת כל 3 חודשים. ימי הדוח = הכי תנודתיים.',detail:'Beat ציפיות → עולה. Miss → יורדת. Q1/Q2/Q3/Q4. EPS ו-Revenue הם המדדים החשובים.',color:'#f8fafc'},
]
const CATS=['הכל','אסטרטגיה','מושג יסוד','ניתוח פונדמנטלי','מאקרו','פרקטי']
export default function Academy(){
const [openId,setOpenId]=useState(null);const [cat,setCat]=useState('הכל')
const filtered=cat==='הכל'?TERMS:TERMS.filter(t=>t.category===cat)
return(<div>
<div style={{marginBottom:'2rem'}}><h1 style={{fontSize:'1.5rem',fontWeight:700,margin:'0 0 6px'}}>אקדמיה</h1><p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>מושגי השקעה בעברית ברורה</p></div>
<div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.5rem'}}>{CATS.map(c=>(<button key={c} onClick={()=>setCat(c)} style={{padding:'5px 14px',borderRadius:20,fontSize:'.82rem',fontWeight:500,border:'1px solid',cursor:'pointer',fontFamily:'Heebo,sans-serif',background:cat===c?'var(--color-text-primary)':'white',color:cat===c?'white':'var(--color-text-secondary)',borderColor:cat===c?'var(--color-text-primary)':'var(--color-border)'}}>{c}</button>))}</div>
<div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>{filtered.map(item=>(<div key={item.term} className="card" style={{padding:0,overflow:'hidden',cursor:'pointer'}} onClick={()=>setOpenId(openId===item.term?null:item.term)}>
<div style={{padding:'1rem 1.25rem',display:'flex',alignItems:'center',gap:'1rem'}}>
<div style={{width:4,height:40,background:item.color,borderRadius:2,flexShrink:0,filter:'saturate(3)'}}/>
<div style={{flex:1}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}><span style={{fontWeight:600,fontSize:'.95rem'}}>{item.term}</span><span className="ltr-term" style={{fontSize:'.78rem',color:'var(--color-text-muted)'}}>{item.english}</span><span style={{fontSize:'.7rem',background:'var(--color-bg)',padding:'2px 8px',borderRadius:10,color:'var(--color-text-muted)',marginRight:'auto'}}>{item.category}</span></div><p style={{margin:0,fontSize:'.85rem',color:'var(--color-text-secondary)'}}>{item.short}</p></div>
{openId===item.term?<ChevronUp size={16} style={{color:'var(--color-text-muted)',flexShrink:0}}/>:<ChevronDown size={16} style={{color:'var(--color-text-muted)',flexShrink:0}}/>}</div>
{openId===item.term&&<div style={{borderTop:'1px solid var(--color-border)',padding:'1rem 1.25rem',background:'var(--color-bg)'}}><p style={{margin:0,fontSize:'.875rem',lineHeight:1.75,color:'var(--color-text-secondary)'}}>{item.detail}</p></div>}</div>))}</div></div>)}