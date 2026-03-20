import { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

const TERMS = [
  {
    term:'השקעה לטווח ארוך', english:'Long-term Investing', category:'אסטרטגיה', color:'#2dd87a',
    short:'החזקת נכסים למשך שנים תוך התעלמות מתנודות קצרות. תשואה מטרה: 100%+ על פני 5-10 שנים.',
    detail:`השקעה לטווח ארוך מבוססת על עיקרון פשוט: הכלכלה צומחת לאורך זמן, ולכן מי שמחזיק נכסים לאורך שנים נהנה מהצמיחה הזו.

**למה זה עובד?**
S&P 500 עלה בממוצע 10% לשנה בעשורים האחרונים. אם השקעת $10,000 לפני 30 שנה — היום היית עם ~$175,000.

**העקרונות:**
• קנה חברות טובות במחיר סביר ותחזיק לאורך זמן (Warren Buffett)
• אל תמכור בשוק יורד — תנודות הן חלק נורמלי
• השקע רק כסף שלא תצטרך לטווח קצר
• פזר על פני מגזרים ומדינות
• השקע בקביעות גם בירידות (Dollar Cost Averaging)

**הטעות הנפוצה ביותר:**
רוב המשקיעים מוכרים בבהלה כשהשוק יורד, ומפסידים את ההתאוששות. המחקר מראה שמשקיע שהחמיץ רק את 10 הימים הטובים ביותר בשנה — איבד חצי מהתשואה.`
  },
  {
    term:'ריבית דריבית', english:'Compound Interest', category:'מושג יסוד', color:'#f5a623',
    short:'הרווח שמרוויח רווח. אלברט איינשטיין קרא לזה "הכוח הגדול ביותר ביקום".',
    detail:`ריבית דריבית היא הסיבה שהשקעה מוקדמת שווה הרבה יותר מהשקעה מאוחרת.

**דוגמה מספרית:**
• $10,000 ב-10% לשנה — אחרי 10 שנה: $25,937
• $10,000 ב-10% לשנה — אחרי 20 שנה: $67,275  
• $10,000 ב-10% לשנה — אחרי 30 שנה: $174,494

**כלל 72:**
חלק 72 בתשואה השנתית — זמן ההכפלה. ב-10% לשנה = 7.2 שנים להכפיל. ב-6% = 12 שנים.

**ההשפעה של עמלות:**
קרן עם דמי ניהול 1% לעומת 0.1% — על פני 30 שנה ו-$100,000 ראשוני — ההבדל הוא מעל $100,000!

**מסקנה:** התחל להשקיע כמה שיותר מוקדם, גם בסכומים קטנים. זמן הוא הנכס הכי חשוב שלך.`
  },
  {
    term:'מכפיל רווח (P/E)', english:'Price-to-Earnings Ratio', category:'ניתוח פונדמנטלי', color:'#a855f7',
    short:'היחס בין מחיר המניה לרווח השנתי. P/E 25 = משלמים $25 על כל $1 רווח שנתי.',
    detail:`P/E הוא המדד הנפוץ ביותר לבדיקת תמחור מניה.

**חישוב:**
P/E = מחיר מניה ÷ רווח למניה (EPS)
לדוגמה: מניה במחיר $150, EPS=$6 → P/E = 25

**פרשנות:**
• P/E מתחת ל-15: בדרך כלל "זול" — שוק מצפה לצמיחה נמוכה
• P/E 15-25: תמחור "רגיל" לחברה מבוגרת ויציבה
• P/E 30-60: "יקר" — שוק מצפה לצמיחה גבוהה
• P/E מעל 100: ספקולציה — חברת צמיחה כמו TSLA בשיא

**אל תשתמש ב-P/E לבד!**
• תמיד השווה לחברות באותו סקטור
• P/E גבוה לא בהכרח רע אם הצמיחה מצדיקה
• Forward P/E (על רווחים עתידיים) לעיתים רלוונטי יותר
• חברות בצמיחה מהירה כמו NVDA, AMZN — P/E גבוה יכול להיות מוצדק

**Forward vs Trailing:**
Trailing P/E = מבוסס על רווחים שהיו (12 חודשים אחרונים)
Forward P/E = מבוסס על תחזיות רווח לשנה הבאה`
  },
  {
    term:'תנודתיות — Beta', english:'Beta', category:'ניתוח פונדמנטלי', color:'#4f8ef7',
    short:'מדד תנודתיות ביחס לשוק. Beta 1 = כמו השוק. Beta 2 = פי שניים תנודתי.',
    detail:`Beta מודד כמה מניה מגיבה לתנועות השוק הכללי (S&P 500).

**דוגמאות:**
• TSLA Beta ~2.3: אם S&P עולה 1%, TSLA עולה בממוצע 2.3%
• AAPL Beta ~1.2: קצת יותר תנודתי מהשוק
• JNJ Beta ~0.55: הרבה פחות תנודתי — מניה "דפנסיבית"
• זהב Beta ~(-0.1): בדרך כלל הפוך לשוק המניות

**מה להעדיף?**
• משקיע שמרני: Beta נמוך (0.5-0.8) — שינויים קטנים יותר
• משקיע אגרסיבי: Beta גבוה (1.5+) — פוטנציאל לרווחים (והפסדים) גדולים יותר
• תיק מאוזן: Beta ממוצע בסביבות 1.0-1.2

**הגבלות של Beta:**
Beta מחושב על ביצועי עבר ולא מנבא בהכרח את העתיד. בזמן משברים כל המניות עולות בקורלציה.`
  },
  {
    term:'מסחר יומי', english:'Day Trading', category:'אסטרטגיה', color:'#f05252',
    short:'קנייה ומכירה של ניירות ערך ביום מסחר אחד. מסוכן מאוד — 80%+ מהסוחרים מפסידים.',
    detail:`מסחר יומי פירושו פתיחה וסגירה של פוזיציות באותו יום מסחר, ללא החזקת פוזיציות בלילה.

**למה רוב האנשים מפסידים?**
• עמלות: כל קנייה+מכירה עולה — נצבר הרבה על פני זמן
• מרווח Bid-Ask: קונים במחיר גבוה יותר ממה שמוכרים
• פסיכולוגיה: קשה מאוד לשמור על משמעת רגשית
• מידע: מתחרים נגד אלגוריתמים ומוסדיים מקצועיים
• מחקרים: 70-80% מהסוחרים היומיים מפסידים על פני שנה

**מה נדרש כדי להצליח (אם בכלל):**
• יכולת ניתוח טכני מעמיקה
• משמעת פסיכולוגית ברזל
• הון מספיק לספוג הפסדים
• זמן מלא — זו עבודה קשה, לא הכנסה פסיבית

**חלופה טובה יותר:** Swing Trading — החזקה של ימים עד שבועות.`
  },
  {
    term:'שורט', english:'Short Selling', category:'מושג יסוד', color:'#f05252',
    short:'הימור שמחיר המניה ירד. שואלים מניות, מוכרים, ואם המחיר ירד — קונים בחזרה ברווח.',
    detail:`Short Selling הוא מנגנון שמאפשר להרוויח כשמניה יורדת.

**איך זה עובד:**
1. שואלים 100 מניות של חברה X מהברוקר
2. מוכרים אותן ב-$50 ← מקבלים $5,000
3. מחיר יורד ל-$30
4. קונים בחזרה 100 מניות ב-$3,000
5. מחזירים לברוקר — רווח: $2,000

**הסיכון הגדול:**
בלונג המקסימום שתפסיד הוא 100% (אם המניה יורדת לאפס).
בשורט — אין מגבלה על ההפסד! אם המניה עולה מ-$50 ל-$200, הפסדת 300%.

**Short Squeeze:**
כשהרבה שורטיסטים מכסים בבת אחת — המניה מזנקת בחדות (GME, AMC ב-2021).

**Short Float:**
מדד לכמה % ממניות החברה נמכרו בשורט.
• מעל 10%: סיכון גבוה לסחיטת שורטיסטים
• מעל 20%: מניה עם אינטרס שורט גבוה מאוד`
  },
  {
    term:'הנפקה ראשונה', english:'IPO', category:'מושג יסוד', color:'#fbbf24',
    short:'כשחברה נסחרת בבורסה לראשונה ומגייסת הון מהציבור.',
    detail:`IPO (Initial Public Offering) הוא התהליך שבו חברה פרטית הופכת לציבורית.

**תהליך ה-IPO:**
1. חברה בוחרת בנקים להנפקה (Underwriters)
2. בנקים קובעים טווח מחיר ומשווקים למוסדיים
3. קובעים מחיר סופי ערב ההנפקה
4. ביום ראשון למסחר — המניה פתוחה לציבור הרחב

**IPO Lock-up Period:**
עובדים ומשקיעים מוקדמים בדרך כלל לא יכולים למכור 90-180 יום. כשתקופה זו מסתיימת — לעיתים יש לחץ מכירה.

**האם להשקיע ב-IPO?**
• מניות IPO תנודתיות מאוד ביום הראשון
• הרבה IPOs מאכזבים בשנה הראשונה
• עדיף לחכות רבעון-שניים לראות ביצועים
• כלל אצבע: חברות רווחיות בהנפקה טובות יותר מחברות גירעוניות

**SPAC:**
סוג מיוחד של IPO — "חברת צ'ק ריק" שמגייסת כסף ואז מוזגת עם חברה פרטית.`
  },
  {
    term:'דוחות כספיים', english:'Earnings Reports', category:'ניתוח פונדמנטלי', color:'#2dd87a',
    short:'כל רבעון חברות ציבוריות מפרסמות תוצאות. ימי הדוח הם הימים הכי תנודתיים.',
    detail:`כל חברה ציבורית חייבת לפרסם דוח כספי כל 3 חודשים (Q1/Q2/Q3/Q4).

**מה לבדוק בדוח:**
• **Revenue (הכנסות):** האם גדל לעומת השנה הקודמת?
• **EPS (רווח למניה):** האם עמד בציפיות או הכה אותן?
• **Guidance:** תחזיות ההנהלה לרבעון הבא
• **Gross Margin:** שולי הרווח הגולמי

**Beat vs Miss:**
• "Beat": חברה עברה את תחזיות האנליסטים → בדרך כלל עולה
• "Miss": חברה לא עמדה בתחזיות → בדרך כלל יורדת
• "In-line": עמדה בתחזיות → תגובה מעורבת

**Earnings Season:**
4 פעמים בשנה — כל החברות מפרסמות יחסית בו זמנית:
Q1: אפריל-מאי | Q2: יולי-אוגוסט | Q3: אוקטובר-נובמבר | Q4: ינואר-פברואר

**"Buy the rumor, sell the news":**
לפעמים מניה עולה לפני הדוח ויורדת ביום הדוח גם אם התוצאות טובות.`
  },
  {
    term:'הפד — מדיניות מוניטרית', english:'The Fed & Monetary Policy', category:'מאקרו', color:'#fbbf24',
    short:'הבנק המרכזי של ארה"ב קובע את ריבית הבסיס ומשפיע ישירות על שוקי ההון.',
    detail:`הפד (Federal Reserve) הוא הבנק המרכזי של ארה"ב, ולהחלטותיו יש השפעה עצומה על שוק ההון.

**כלי הפד העיקריים:**
• **ריבית Federal Funds Rate:** הריבית שבנקים מלווים ביניהם ללילה
• **QE (Quantitative Easing):** הפד קונה אג"ח — מדפיס כסף → מוריד תשואות
• **QT (Quantitative Tightening):** הפד מוכר — מייקר אשראי

**השפעה על שוק המניות:**
• ריבית עולה → הלוואות יקרות → חברות מרוויחות פחות → מניות יורדות
• ריבית יורדת → אשראי זול → צמיחה כלכלית → מניות עולות
• ריבית גבוהה → אג"ח אטרקטיבי → כסף עובר מקמניות לאג"ח

**FOMC:**
הוועדה הקובעת את הריבית — מתכנסת 8 פעמים בשנה. ההחלטה יוצאת ב-14:00 EST.

**"Don't fight the Fed":**
כשהפד מהדק (מעלה ריבית) — קשה לשוק לעלות. כשמקל — רוח גבית חזקה.`
  },
  {
    term:'ETF — קרן סל', english:'Exchange Traded Fund', category:'מושג יסוד', color:'#818cf8',
    short:'סל של מניות הנסחר כמניה בודדת. QQQ = Nasdaq 100, SPY = S&P 500.',
    detail:`ETF הוא מכשיר השקעה שמאפשר לקנות סל שלם של מניות בעסקה אחת.

**היתרונות:**
• **פיזור מיידי:** SPY = 500 חברות בקנייה אחת
• **דמי ניהול נמוכים:** 0.03%-0.20% לשנה לעומת 1%+ בקרנות מנוהלות
• **נזילות:** נסחר בבורסה כמו מניה רגילה
• **שקיפות:** ניתן לראות את ההחזקות בכל עת

**ETF פופולריים:**
• SPY/VOO: S&P 500 — 500 חברות הגדולות בארה"ב
• QQQ: Nasdaq 100 — 100 חברות הטכנולוגיה הגדולות
• IWM: Russell 2000 — 2000 חברות קטנות
• GLD: זהב פיזי
• TLT: אג"ח ממשלתי ל-20 שנה

**ETF vs קרן מחקה:**
ETF = נסחר בבורסה בזמן אמת
קרן מחקה = נפדית פעם ביום לפי מחיר סגירה

**כפילות חשיפה:**
אם יש לך QQQ ו-AAPL בנפרד — יש לך כפילות חשיפה ל-AAPL (שהיא ~9% מ-QQQ)!`
  },
  {
    term:'ניתוח טכני', english:'Technical Analysis', category:'ניתוח פונדמנטלי', color:'#06b6d4',
    short:'ניתוח גרפים ותבניות מחיר לחיזוי תנועות עתידיות. כלי נפוץ בקרב סוחרים.',
    detail:`ניתוח טכני מבוסס על ההנחה שמחירי העבר מכילים מידע על העתיד.

**כלים עיקריים:**
• **Moving Average (ממוצע נע):** MA50, MA200 — קו חלק של מחירים
• **RSI (Relative Strength Index):** 0-100. מעל 70 = קנוי יתר. מתחת 30 = מכור יתר
• **MACD:** מעקב אחר תנע המחיר
• **Support/Resistance:** רמות מחיר שהמניה "מתקשה" לשבור

**תבניות מפורסמות:**
• Head & Shoulders: סימן לתיקון כלפי מטה
• Cup & Handle: בדרך כלל סימן לעלייה
• Double Top/Bottom: שתי פסגות/שפלים באותה רמה

**האם זה עובד?**
• שנוי במחלוקת — מחקרים אקדמיים לא מראים עדיפות ברורה
• שימושי יותר לקביעת timing מאשר בחירת מניות
• Hedge funds מוסדיים עושים בו שימוש נרחב
• תחזית עצמית: כשמשקיעים רבים מאמינים בתבנית — היא מתממשת`
  },
  {
    term:'דיבידנד', english:'Dividend', category:'מושג יסוד', color:'#2dd87a',
    short:'חלוקת רווחים לבעלי המניות. חברות כמו JNJ, KO חולקות דיבידנד כל רבעון.',
    detail:`דיבידנד הוא חלק מרווחי החברה שמחולק לבעלי המניות.

**Dividend Yield:**
אחוז הדיבידנד השנתי ממחיר המניה.
מניה ב-$100 עם דיבידנד שנתי $4 = Yield של 4%

**Payout Ratio:**
אחוז הרווח שהחברה מחלקת כדיבידנד.
Payout Ratio של 60% = חברה מחלקת 60% מהרווח, שומרת 40% לצמיחה.

**מתי חברות מחלקות דיבידנד:**
• חברות מבוגרות ויציבות: JNJ, KO, PG, T
• בדרך כלל פחות צמיחה עתידית
• חברות צמיחה כמו AMZN, GOOGL — לא מחלקות דיבידנד

**Dividend Aristocrats:**
חברות שהגדילו את הדיבידנד 25+ שנה ברצף. נחשבות להשקעה יציבה.
דוגמאות: JNJ (60+ שנה), KO (60+ שנה), PG (65+ שנה)

**DRIP (Dividend Reinvestment):**
השקעה חוזרת אוטומטית של הדיבידנד ברכישת מניות נוספות — ריבית דריבית בפעולה!`
  },
  {
    term:'שעות מסחר', english:'Trading Hours', category:'פרקטי', color:'#f0f0f0',
    short:'NYSE ו-NASDAQ פתוחים 09:30-16:00 EST = בישראל 16:30-23:00 (קיץ) / 17:30-00:00 (חורף).',
    detail:`שוק המניות האמריקאי פועל לפי שעון המזרחי (EST/EDT).

**שעות מסחר רגיל:**
09:30 - 16:00 EST
**בישראל (שעון קיץ):** 16:30 - 23:00
**בישראל (שעון חורף):** 17:30 - 00:00

**Pre-Market (לפני פתיחה):**
04:00 - 09:30 EST — נפח נמוך, תנודתיות גבוהה
**בישראל:** 11:00 - 16:30 (קיץ)

**After-Hours (אחרי סגירה):**
16:00 - 20:00 EST — נפח נמוך, לעיתים תנועות חדות
**בישראל:** 23:00 - 03:00 (קיץ)

**מתי לצפות לתנודות גדולות:**
• פתיחת המסחר (09:30-10:00): תנודתי ביותר
• סגירת המסחר (15:30-16:00): נפח גבוה
• ימי דוחות: לפני ואחרי פרסום
• ימי FOMC: 14:00 EST — החלטת ריבית

**ימי חג בארה"ב:**
שוק סגור ב-Thanksgiving, Christmas, Independence Day, Labor Day ועוד.`
  },
]

const CATS = ['הכל','אסטרטגיה','מושג יסוד','ניתוח פונדמנטלי','מאקרו','פרקטי']

export default function Academy(){
  const [openId, setOpenId] = useState(null)
  const [cat, setCat]       = useState('הכל')
  const [search, setSearch] = useState('')

  const filtered = TERMS.filter(t => {
    const matchCat = cat === 'הכל' || t.category === cat
    const matchSearch = !search || t.term.includes(search) || t.english.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:800,margin:'0 0 6px',color:'var(--color-text-primary)'}}>אקדמיה</h1>
        <p style={{color:'var(--color-text-muted)',margin:0,fontSize:'.875rem'}}>{TERMS.length} מושגי השקעה בעברית — עם הסברים מעמיקים</p>
      </div>

      {/* Search */}
      <div style={{position:'relative',marginBottom:'1rem'}}>
        <input className="input" placeholder="חפש מושג..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{paddingRight:'1rem'}}/>
      </div>

      {/* Category filter */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1.5rem'}}>
        {CATS.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{padding:'5px 14px',borderRadius:20,fontSize:'.82rem',fontWeight:500,border:'1px solid',cursor:'pointer',fontFamily:'Heebo,sans-serif',
            background:cat===c?'var(--color-accent)':'transparent',
            color:cat===c?'#0d0f14':'var(--color-text-secondary)',
            borderColor:cat===c?'var(--color-accent)':'var(--color-border2)',
            transition:'all 180ms'}}>
            {c} {cat===c && c!=='הכל' && `(${filtered.length})`}
          </button>
        ))}
      </div>

      {/* Terms */}
      <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
        {filtered.map(item => (
          <div key={item.term} style={{background:'var(--color-surface)',border:'1px solid var(--color-border)',borderRadius:14,overflow:'hidden',cursor:'pointer',transition:'border-color 200ms'}}
            onClick={()=>setOpenId(openId===item.term?null:item.term)}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-border2)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor=openId===item.term?'rgba(245,166,35,0.3)':'var(--color-border)'}>
            
            {/* Header */}
            <div style={{padding:'1rem 1.25rem',display:'flex',alignItems:'center',gap:'1rem'}}>
              <div style={{width:4,height:44,background:item.color,borderRadius:2,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3,flexWrap:'wrap'}}>
                  <span style={{fontWeight:700,fontSize:'.95rem',color:'var(--color-text-primary)'}}>{item.term}</span>
                  <span style={{fontSize:'.75rem',color:'var(--color-text-muted)',fontFamily:"'IBM Plex Mono',monospace"}}>{item.english}</span>
                  <span style={{fontSize:'.7rem',background:'var(--color-bg)',padding:'2px 8px',borderRadius:10,color:'var(--color-text-muted)',border:'1px solid var(--color-border)',marginRight:'auto'}}>{item.category}</span>
                </div>
                <p style={{margin:0,fontSize:'.85rem',color:'var(--color-text-secondary)',lineHeight:1.5}}>{item.short}</p>
              </div>
              <div style={{flexShrink:0,color:'var(--color-text-muted)'}}>
                {openId===item.term ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </div>
            </div>

            {/* Expanded content */}
            {openId===item.term && (
              <div style={{borderTop:'1px solid var(--color-border)',padding:'1.25rem 1.5rem',background:'var(--color-bg2)'}}>
                {item.detail.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h4 key={i} style={{margin:'1rem 0 .4rem',fontSize:'.875rem',fontWeight:700,color:'var(--color-accent)'}}>{line.replace(/\*\*/g,'')}</h4>
                  }
                  if (line.startsWith('• ')) {
                    return <div key={i} style={{display:'flex',gap:8,marginBottom:4,paddingRight:8}}>
                      <span style={{color:'var(--color-accent)',flexShrink:0}}>•</span>
                      <span style={{fontSize:'.875rem',color:'var(--color-text-secondary)',lineHeight:1.65}} dangerouslySetInnerHTML={{__html:line.substring(2).replace(/\*\*(.+?)\*\*/g,'<strong style="color:var(--color-text-primary)">$1</strong>')}}/>
                    </div>
                  }
                  if (line.trim() === '') return <div key={i} style={{height:6}}/>
                  return <p key={i} style={{margin:'0 0 .5rem',fontSize:'.875rem',color:'var(--color-text-secondary)',lineHeight:1.75}} dangerouslySetInnerHTML={{__html:line.replace(/\*\*(.+?)\*\*/g,'<strong style="color:var(--color-text-primary)">$1</strong>')}}/>
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{textAlign:'center',padding:'3rem',color:'var(--color-text-muted)'}}>לא נמצאו מושגים</div>
      )}
    </div>
  )
}