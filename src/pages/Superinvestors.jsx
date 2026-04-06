import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, Star, Users, DollarSign, BarChart2, RefreshCw, ExternalLink, ArrowUp, ArrowDown } from 'lucide-react'

const QUARTER='Q3 2025'
const REPORT_DATE='30 Sep 2025'

const INV=[
  {id:'BRK',name:'Warren Buffett',fund:'Berkshire Hathaway',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Warren_Buffett_KU_Visit.jpg/100px-Warren_Buffett_KU_Visit.jpg',aum:294000,style:'Value',n:45,color:'#f5a623',
    top5:[{t:'AAPL',n:'Apple',p:28.1,c:-3.1},{t:'BAC',n:'Bank of America',p:11.8,c:-1.2},{t:'AXP',n:'Amer. Express',p:10.2,c:+0.8},{t:'KO',n:'Coca-Cola',p:9.1,c:0},{t:'CVX',n:'Chevron',p:6.3,c:-0.5}]},
  {id:'PS',name:'Bill Ackman',fund:'Pershing Square',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Bill_Ackman.jpg/100px-Bill_Ackman.jpg',aum:10800,style:'Activist',n:12,color:'#4f8ef7',
    top5:[{t:'HLT',n:'Hilton',p:16.2,c:+2.1},{t:'CMG',n:'Chipotle',p:15.8,c:-1.4},{t:'BN',n:'Brookfield',p:14.1,c:+0.3},{t:'GOOGL',n:'Alphabet',p:13.9,c:+1.8},{t:'CP',n:'Canadian Pacific',p:12.4,c:-0.2}]},
  {id:'DQ',name:'Stanley Druckenmiller',fund:'Duquesne Family Office',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Stanley_Druckenmiller_2024.jpg/100px-Stanley_Druckenmiller_2024.jpg',aum:3200,style:'Macro',n:71,color:'#2dd87a',
    top5:[{t:'NVDA',n:'Nvidia',p:12.4,c:+4.2},{t:'MSFT',n:'Microsoft',p:9.8,c:-0.5},{t:'META',n:'Meta',p:8.7,c:+2.3},{t:'AMZN',n:'Amazon',p:7.9,c:+1.1},{t:'GOOGL',n:'Alphabet',p:6.8,c:+0.7}]},
  {id:'AM',name:'David Tepper',fund:'Appaloosa Management',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/David_Tepper_2011.jpg/100px-David_Tepper_2011.jpg',aum:7384,style:'Value',n:45,color:'#a855f7',
    top5:[{t:'META',n:'Meta',p:18.3,c:+3.2},{t:'AMZN',n:'Amazon',p:15.7,c:+2.1},{t:'NVDA',n:'Nvidia',p:14.2,c:+5.8},{t:'BABA',n:'Alibaba',p:11.8,c:-2.3},{t:'GOOGL',n:'Alphabet',p:9.4,c:+1.4}]},
  {id:'SC',name:'Michael Burry',fund:'Scion Asset Management',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Michael_Burry_2010.jpg/100px-Michael_Burry_2010.jpg',aum:92,style:'Contrarian',n:11,color:'#f05252',
    top5:[{t:'BABA',n:'Alibaba',p:21.4,c:-1.2},{t:'JD',n:'JD.com',p:15.8,c:-0.8},{t:'HCA',n:'HCA Healthcare',p:13.2,c:+0.4},{t:'REAL',n:'RealReal',p:10.7,c:-3.1},{t:'CPRI',n:'Capri',p:9.1,c:-1.8}]},
  {id:'BG',name:'Seth Klarman',fund:'Baupost Group',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Seth_Klarman_%28cropped%29.jpg/100px-Seth_Klarman_%28cropped%29.jpg',aum:27000,style:'Deep Value',n:38,color:'#06b6d4',
    top5:[{t:'EXPE',n:'Expedia',p:19.2,c:+1.1},{t:'BEKE',n:'KE Holdings',p:14.7,c:-0.4},{t:'EB',n:'EventBrite',p:9.8,c:-1.2},{t:'VNT',n:'Vontier',p:8.4,c:+0.2},{t:'ATEX',n:'Anterix',p:6.2,c:+0.8}]},
]

const TOP10=[
  {r:1,t:'AAPL',n:'Apple Inc.',inv:28,pct:24.1,logo:'https://logo.clearbit.com/apple.com',c:+2.3,mc:'3.4T',sec:'טכנולוגיה'},
  {r:2,t:'MSFT',n:'Microsoft',inv:24,pct:19.8,logo:'https://logo.clearbit.com/microsoft.com',c:+1.8,mc:'3.1T',sec:'טכנולוגיה'},
  {r:3,t:'GOOGL',n:'Alphabet',inv:22,pct:18.4,logo:'https://logo.clearbit.com/google.com',c:+3.1,mc:'2.1T',sec:'טכנולוגיה'},
  {r:4,t:'AMZN',n:'Amazon',inv:20,pct:16.2,logo:'https://logo.clearbit.com/amazon.com',c:+2.7,mc:'2.3T',sec:'טכנולוגיה'},
  {r:5,t:'META',n:'Meta Platforms',inv:19,pct:15.7,logo:'https://logo.clearbit.com/meta.com',c:+4.2,mc:'1.5T',sec:'טכנולוגיה'},
  {r:6,t:'NVDA',n:'Nvidia Corp.',inv:18,pct:14.9,logo:'https://logo.clearbit.com/nvidia.com',c:+8.1,mc:'3.3T',sec:'טכנולוגיה'},
  {r:7,t:'BRK.B',n:'Berkshire Hathaway',inv:15,pct:12.3,logo:'https://logo.clearbit.com/berkshirehathaway.com',c:+0.4,mc:'970B',sec:'פיננסים'},
  {r:8,t:'BAC',n:'Bank of America',inv:14,pct:11.8,logo:'https://logo.clearbit.com/bankofamerica.com',c:-0.8,mc:'340B',sec:'פיננסים'},
  {r:9,t:'BABA',n:'Alibaba Group',inv:13,pct:10.4,logo:'https://logo.clearbit.com/alibaba.com',c:-2.1,mc:'220B',sec:'טכנולוגיה'},
  {r:10,t:'UNH',n:'UnitedHealth',inv:12,pct:9.7,logo:'https://logo.clearbit.com/unitedhealthgroup.com',c:-1.2,mc:'500B',sec:'בריאות'},
]

const SECTORS=[
  {name:'טכנולוגיה',value:38,color:'#4f8ef7'},{name:'פיננסים',value:18,color:'#f5a623'},
  {name:'בריאות',value:12,color:'#2dd87a'},{name:'צריכה',value:10,color:'#a855f7'},
  {name:'תעשייה',value:8,color:'#f05252'},{name:'אנרגיה',value:7,color:'#06b6d4'},
  {name:'נדל"ן',value:4,color:'#fb923c'},{name:'אחר',value:3,color:'#8b5cf6'},
]

const ACTIVITY=[
  {q:'Q4 2024',קניות:312,מכירות:198},{q:'Q1 2025',קניות:287,מכירות:224},
  {q:'Q2 2025',קניות:334,מכירות:187},{q:'Q3 2025',קניות:298,מכירות:210},
]

function fm(n){if(n>=1e12)return '$'+(n/1e12).toFixed(1)+'T';if(n>=1e9)return '$'+(n/1e9).toFixed(1)+'B';if(n>=1e6)return '$'+(n/1e6).toFixed(1)+'M';return '$'+n.toLocaleString();}

function Circle({label,value,sub,color}){
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
      <div style={{width:100,height:100,borderRadius:'50%',border:'3px solid '+color,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:color+'15',flexShrink:0}}>
        <div style={{fontWeight:800,fontSize:'1.1rem',color,fontFamily:"'IBM Plex Mono',monospace",textAlign:'center',lineHeight:1.1}}>{value}</div>
        {sub&&<div style={{fontSize:'.6rem',color:'var(--color-text-muted)',marginTop:1,textAlign:'center'}}>{sub}</div>}
      </div>
      <div style={{fontSize:'.72rem',color:'var(--color-text-secondary)',textAlign:'center',maxWidth:95}}>{label}</div>
    </div>
  )
}

export default function Superinvestors(){
  const [sel,setSel]=useState(null)

  const totalAUM=INV.reduce((s,i)=>s+i.aum,0)

  return(
    <div className="page-container" style={{paddingBottom:'4rem',direction:'rtl'}}>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:'1.5rem'}}>
        <div>
          <h1 style={{margin:0,fontSize:'1.5rem',fontWeight:800,display:'flex',alignItems:'center',gap:10,direction:'rtl'}}>
            <Star size={20} style={{color:'var(--color-accent)',flexShrink:0}}/> המשקיעים הגדולים
          </h1>
          <p style={{margin:'4px 0 0',color:'var(--color-text-muted)',fontSize:'.82rem'}}>
            אחזקות Superinvestors לפי גשות 13F — {QUARTER} | {REPORT_DATE}
          </p>
        </div>
        <a href="https://www.dataroma.com" target="_blank" rel="noopener noreferrer"
          style={{display:'flex',alignItems:'center',gap:6,fontSize:'.75rem',color:'var(--color-accent)',background:'var(--color-bg2)',padding:'6px 14px',borderRadius:20,border:'1px solid var(--color-border)',textDecoration:'none'}}>
          <RefreshCw size={11}/> מקור: Dataroma · SEC 13F <ExternalLink size={11}/>
        </a>
      </div>

      <div style={{display:'flex',gap:'1.2rem',justifyContent:'center',flexWrap:'wrap',marginBottom:'2rem',padding:'1.5rem',background:'var(--color-bg2)',borderRadius:16,border:'1px solid var(--color-border)'}}>
        <Circle label='סה"כ AUM מנוהל' value={fm(totalAUM*1e6)} color='#f5a623'/>
        <Circle label='Superinvestors במעקב' value='6' sub='מנהלים' color='#4f8ef7'/>
        <Circle label='אחזקות מניות' value='212' sub={QUARTER} color='#2dd87a'/>
        <Circle label='קניות ברבעון' value='298' sub='vs 210 מכירות' color='#a855f7'/>
        <Circle label='ביצוע ממוצע 5Y' value='+22%' sub='vs S&P +10%' color='#f05252'/>
        <Circle label='סקטור מוביל' value='Tech' sub='38% מהאחזקות' color='#06b6d4'/>
      </div>

      <div className="card" style={{marginBottom:'1.5rem',padding:'1.5rem'}}>
        <h2 style={{margin:'0 0 1rem',fontSize:'.95rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
          <Users size={15} style={{color:'var(--color-accent)'}}/> פרופיל המשקיעים — לחץ להרחבה
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:'1rem'}}>
          {INV.map(inv=>(
            <div key={inv.id} onClick={()=>setSel(sel?.id===inv.id?null:inv)}
              style={{border:'2px solid '+(sel?.id===inv.id?inv.color:'var(--color-border)'),borderRadius:14,padding:'1rem',cursor:'pointer',background:sel?.id===inv.id?inv.color+'08':'var(--color-bg2)',transition:'all .2s'}}>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <img src={inv.img} alt={inv.name} onError={e=>e.target.style.display='none'}
                  style={{width:48,height:48,borderRadius:'50%',objectFit:'cover',border:'2px solid '+inv.color,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:'.88rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{inv.name}</div>
                  <div style={{fontSize:'.72rem',color:'var(--color-text-muted)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{inv.fund}</div>
                  <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap'}}>
                    <span style={{fontSize:'.68rem',padding:'2px 7px',borderRadius:8,background:inv.color+'25',color:inv.color,fontWeight:600}}>{inv.style}</span>
                    <span style={{fontSize:'.68rem',color:'var(--color-text-muted)'}}>{inv.n} מניות</span>
                  </div>
                </div>
                <div style={{textAlign:'left',flexShrink:0}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:800,color:inv.color,fontSize:'.85rem'}}>{fm(inv.aum*1e6)}</div>
                  <div style={{fontSize:'.6rem',color:'var(--color-text-muted)'}}>AUM</div>
                </div>
              </div>
              {sel?.id===inv.id&&(
                <div style={{marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid var(--color-border)'}}>
                  <div style={{fontSize:'.75rem',fontWeight:600,marginBottom:8,color:'var(--color-text-secondary)'}}>Top 5 אחזקות — {QUARTER}</div>
                  {inv.top5.map((h,i)=>(
                    <div key={h.t} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                      <span style={{width:16,height:16,borderRadius:3,background:inv.color,color:'white',fontSize:'.6rem',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,flexShrink:0}}>{i+1}</span>
                      <img src={'https://logo.clearbit.com/'+h.t.toLowerCase().replace(/[^a-z]/g,'')+'com'} alt="" onError={e=>e.target.style.display='none'} style={{width:18,height:18,borderRadius:3,objectFit:'contain',background:'white',padding:1,flexShrink:0}}/>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:'.75rem',color:'var(--color-accent)',minWidth:46}}>{h.t}</span>
                      <span style={{flex:1,fontSize:'.72rem',color:'var(--color-text-secondary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.n}</span>
                      <span style={{fontSize:'.75rem',fontWeight:600,fontFamily:"'IBM Plex Mono',monospace"}}>{h.p}%</span>
                      <span style={{fontSize:'.7rem',color:h.c>=0?'var(--color-success)':'var(--color-danger)',fontFamily:"'IBM Plex Mono',monospace",minWidth:40,textAlign:'left'}}>
                        {h.c>0?'+':''}{h.c!==0?h.c+'%':'—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{marginBottom:'1.5rem',padding:'1.5rem'}}>
        <h2 style={{margin:'0 0 1rem',fontSize:'.95rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
          <TrendingUp size={15} style={{color:'var(--color-success)'}}/> 10 המניות הכי מושקעות — {QUARTER}
        </h2>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.82rem',minWidth:560}}>
            <thead>
              <tr style={{background:'var(--color-bg2)',borderBottom:'2px solid var(--color-border)'}}>
                {['#','לוגו','מניה','שם','סקטור','משקיעים','% מהאחזקות','שינוי','שווי שוק'].map(h=>(
                  <th key={h} style={{padding:'.65rem .75rem',textAlign:'right',fontWeight:600,fontSize:'.7rem',color:'var(--color-text-muted)',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP10.map(s=>(
                <tr key={s.t} style={{borderBottom:'1px solid var(--color-border)',transition:'background .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'.7rem .75rem',fontWeight:700,color:'var(--color-text-muted)',width:28}}>{s.r}</td>
                  <td style={{padding:'.7rem 4px',width:36}}>
                    <img src={s.logo} alt={s.t} onError={e=>e.target.style.display='none'}
                      style={{width:26,height:26,borderRadius:5,objectFit:'contain',background:'white',padding:3,border:'1px solid var(--color-border)'}}/>
                  </td>
                  <td style={{padding:'.7rem .75rem',fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:'var(--color-accent)'}}>{s.t}</td>
                  <td style={{padding:'.7rem .75rem',color:'var(--color-text-primary)',fontWeight:500}}>{s.n}</td>
                  <td style={{padding:'.7rem .75rem'}}><span style={{fontSize:'.68rem',padding:'2px 7px',borderRadius:8,background:'var(--color-bg2)',color:'var(--color-text-muted)',border:'1px solid var(--color-border)'}}>{s.sec}</span></td>
                  <td style={{padding:'.7rem .75rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{height:5,width:Math.round(s.inv*2.5),background:'var(--color-accent)',borderRadius:3,minWidth:4,opacity:.7}}/>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{s.inv}</span>
                    </div>
                  </td>
                  <td style={{padding:'.7rem .75rem',fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{s.pct}%</td>
                  <td style={{padding:'.7rem .75rem'}}>
                    <span style={{color:s.c>=0?'var(--color-success)':'var(--color-danger)',fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,display:'flex',alignItems:'center',gap:3}}>
                      {s.c>=0?<ArrowUp size={10}/>:<ArrowDown size={10}/>}{Math.abs(s.c)}%
                    </span>
                  </td>
                  <td style={{padding:'.7rem .75rem',color:'var(--color-text-muted)',fontSize:'.78rem',fontFamily:"'IBM Plex Mono',monospace"}}>{s.mc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
        <div className="card" style={{padding:'1.5rem'}}>
          <h2 style={{margin:'0 0 1rem',fontSize:'.95rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
            <BarChart2 size={15} style={{color:'var(--color-accent)'}}/> חלוקה לפי סקטור
          </h2>
          <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'}}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart><Pie data={SECTORS} cx="50%" cy="50%" outerRadius={70} innerRadius={38} dataKey="value">
                {SECTORS.map((s,i)=><Cell key={i} fill={s.color}/>)}
              </Pie><Tooltip formatter={v=>v+'%'}/></PieChart>
            </ResponsiveContainer>
            <div style={{flex:1,minWidth:100}}>
              {SECTORS.map(s=>(
                <div key={s.name} style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
                  <div style={{width:9,height:9,borderRadius:2,background:s.color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:'.73rem',color:'var(--color-text-secondary)'}}>{s.name}</span>
                  <span style={{fontWeight:700,fontSize:'.73rem',fontFamily:"'IBM Plex Mono',monospace"}}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card" style={{padding:'1.5rem'}}>
          <h2 style={{margin:'0 0 1rem',fontSize:'.95rem',fontWeight:700}}>פעילות קניות/מכירות רבעונית</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ACTIVITY} margin={{top:0,right:0,left:-25,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
              <XAxis dataKey="q" tick={{fontSize:10,fill:'var(--color-text-muted)'}}/>
              <YAxis tick={{fontSize:10,fill:'var(--color-text-muted)'}}/>
              <Tooltip/>
              <Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="קניות" fill="#2dd87a" radius={[3,3,0,0]}/>
              <Bar dataKey="מכירות" fill="#f05252" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{padding:'1rem 1.25rem',background:'var(--color-bg2)',borderRadius:12,border:'1px solid var(--color-border)',fontSize:'.75rem',color:'var(--color-text-muted)',lineHeight:1.7,display:'flex',gap:10,alignItems:'flex-start'}}>
        <DollarSign size={13} style={{flexShrink:0,marginTop:2}}/>
        <span>הנתונים מבוססים על גשות 13F לרשות ניירות ערך האמריקאית (SEC). הדוחות מוגשים בתוך 45 יום מסוף כל רבעון ומשקפים אחזקות נכון ל-{REPORT_DATE}. הנתונים מתעדכנים מדי רבעון. המידע מיועד לצרכי לימוד בלבד ואינו מהווה המלצת השקעה.</span>
      </div>
    </div>
  )
}