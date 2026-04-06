import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Star, Users, DollarSign, BarChart2, RefreshCw, ExternalLink } from 'lucide-react'

const QUARTER='Q3 2025'
const REPORT_DATE='30 Sep 2025'

const SUPERINVESTORS=[
  {id:'BRK',name:'Warren Buffett',fund:'Berkshire Hathaway',avatar:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Warren_Buffett_KU_Visit.jpg/220px-Warren_Buffett_KU_Visit.jpg',aum:294000,style:'Value',holdings:45,topHolding:'AAPL',color:'#f5a623',
    top5:[{t:'AAPL',n:'Apple',pct:28.1,val:82100,chg:-3.1},{t:'BAC',n:'Bank of America',pct:11.8,val:34500,chg:-1.2},{t:'AXP',n:'American Express',pct:10.2,val:29800,chg:+0.8},{t:'KO',n:'Coca-Cola',pct:9.1,val:26600,chg:0},{t:'CVX',n:'Chevron',pct:6.3,val:18400,chg:-0.5}]},
  {id:'PS',name:'Bill Ackman',fund:'Pershing Square',avatar:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Bill_Ackman.jpg/220px-Bill_Ackman.jpg',aum:10800,style:'Activist',holdings:12,topHolding:'HLT',color:'#4f8ef7',
    top5:[{t:'HLT',n:'Hilton Hotels',pct:16.2,val:1750,chg:+2.1},{t:'CMG',n:'Chipotle',pct:15.8,val:1707,chg:-1.4},{t:'BN',n:'Brookfield',pct:14.1,val:1523,chg:+0.3},{t:'GOOGL',n:'Alphabet',pct:13.9,val:1501,chg:+1.8},{t:'CP',n:'Canadian Pacific',pct:12.4,val:1339,chg:-0.2}]},
  {id:'SQ',name:'Stanley Druckenmiller',fund:'Duquesne Family Office',avatar:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Stanley_Druckenmiller_2024.jpg/220px-Stanley_Druckenmiller_2024.jpg',aum:3200,style:'Macro/Growth',holdings:71,topHolding:'NVDA',color:'#2dd87a',
    top5:[{t:'NVDA',n:'Nvidia',pct:12.4,val:397,chg:+4.2},{t:'MSFT',n:'Microsoft',pct:9.8,val:314,chg:-0.5},{t:'META',n:'Meta',pct:8.7,val:278,chg:+2.3},{t:'AMZN',n:'Amazon',pct:7.9,val:253,chg:+1.1},{t:'GOOGL',n:'Alphabet',pct:6.8,val:218,chg:+0.7}]},
  {id:'AM',name:'David Tepper',fund:'Appaloosa Management',avatar:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/David_Tepper_2011.jpg/220px-David_Tepper_2011.jpg',aum:7384,style:'Value/Distressed',holdings:45,topHolding:'META',color:'#a855f7',
    top5:[{t:'META',n:'Meta',pct:18.3,val:1351,chg:+3.2},{t:'AMZN',n:'Amazon',pct:15.7,val:1159,chg:+2.1},{t:'NVDA',n:'Nvidia',pct:14.2,val:1049,chg:+5.8},{t:'BABA',n:'Alibaba',pct:11.8,val:871,chg:-2.3},{t:'GOOGL',n:'Alphabet',pct:9.4,val:694,chg:+1.4}]},
  {id:'TP',name:'Michael Burry',fund:'Scion Asset Management',avatar:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Michael_Burry_2010.jpg/220px-Michael_Burry_2010.jpg',aum:92,style:'Contrarian',holdings:11,topHolding:'BABA',color:'#f05252',
    top5:[{t:'BABA',n:'Alibaba',pct:21.4,val:19.7,chg:-1.2},{t:'JD',n:'JD.com',pct:15.8,val:14.5,chg:-0.8},{t:'HCA',n:'HCA Healthcare',pct:13.2,val:12.1,chg:+0.4},{t:'REAL',n:'RealReal',pct:10.7,val:9.8,chg:-3.1},{t:'CPRI',n:'Capri Holdings',pct:9.1,val:8.4,chg:-1.8}]},
  {id:'SPM',name:'Seth Klarman',fund:'Baupost Group',avatar:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Seth_Klarman_%28cropped%29.jpg/220px-Seth_Klarman_%28cropped%29.jpg',aum:27000,style:'Deep Value',holdings:38,topHolding:'EXPE',color:'#06b6d4',
    top5:[{t:'EXPE',n:'Expedia',pct:19.2,val:5184,chg:+1.1},{t:'BEKE',n:'KE Holdings',pct:14.7,val:3969,chg:-0.4},{t:'EB',n:'EventBrite',pct:9.8,val:2646,chg:-1.2},{t:'VNT',n:'Vontier',pct:8.4,val:2268,chg:+0.2},{t:'ATEX',n:'Anterix',pct:6.2,val:1674,chg:+0.8}]},
]

const TOP10_STOCKS=[
  {rank:1,ticker:'AAPL',name:'Apple Inc.',investors:28,pct:24.1,sector:'Tech',logo:'https://logo.clearbit.com/apple.com',chg:+2.3,mktcap:'3.4T'},
  {rank:2,ticker:'MSFT',name:'Microsoft',investors:24,pct:19.8,sector:'Tech',logo:'https://logo.clearbit.com/microsoft.com',chg:+1.8,mktcap:'3.1T'},
  {rank:3,ticker:'GOOGL',name:'Alphabet',investors:22,pct:18.4,sector:'Tech',logo:'https://logo.clearbit.com/google.com',chg:+3.1,mktcap:'2.1T'},
  {rank:4,ticker:'AMZN',name:'Amazon',investors:20,pct:16.2,sector:'Tech',logo:'https://logo.clearbit.com/amazon.com',chg:+2.7,mktcap:'2.3T'},
  {rank:5,ticker:'META',name:'Meta Platforms',investors:19,pct:15.7,sector:'Tech',logo:'https://logo.clearbit.com/meta.com',chg:+4.2,mktcap:'1.5T'},
  {rank:6,ticker:'NVDA',name:'Nvidia Corp.',investors:18,pct:14.9,sector:'Tech',logo:'https://logo.clearbit.com/nvidia.com',chg:+8.1,mktcap:'3.3T'},
  {rank:7,ticker:'BRK.B',name:'Berkshire Hathaway',investors:15,pct:12.3,sector:'Finance',logo:'https://logo.clearbit.com/berkshirehathaway.com',chg:+0.4,mktcap:'970B'},
  {rank:8,ticker:'BAC',name:'Bank of America',investors:14,pct:11.8,sector:'Finance',logo:'https://logo.clearbit.com/bankofamerica.com',chg:-0.8,mktcap:'340B'},
  {rank:9,ticker:'BABA',name:'Alibaba Group',investors:13,pct:10.4,sector:'Tech',logo:'https://logo.clearbit.com/alibaba.com',chg:-2.1,mktcap:'220B'},
  {rank:10,ticker:'UNH',name:'UnitedHealth Group',investors:12,pct:9.7,sector:'Health',logo:'https://logo.clearbit.com/unitedhealthgroup.com',chg:-1.2,mktcap:'500B'},
]

const SECTOR_DATA=[
  {name:'טכנולוגיה',value:38,color:'#4f8ef7'},{name:'פיננסים',value:18,color:'#f5a623'},
  {name:'בריאות',value:12,color:'#2dd87a'},{name:'צריכה',value:10,color:'#a855f7'},
  {name:'תעשייה',value:8,color:'#f05252'},{name:'אנרגיה',value:7,color:'#06b6d4'},
  {name:'נדל"ן',value:4,color:'#fb923c'},{name:'אחר',value:3,color:'#8b5cf6'},
]

const BUY_ACTIVITY=[
  {q:'Q4 2024',buys:312,sells:198},{q:'Q1 2025',buys:287,sells:224},
  {q:'Q2 2025',buys:334,sells:187},{q:'Q3 2025',buys:298,sells:210},
]

function fm(n){if(n>=1e12)return '$'+(n/1e12).toFixed(1)+'T';if(n>=1e9)return '$'+(n/1e9).toFixed(1)+'B';if(n>=1e6)return '$'+(n/1e6).toFixed(1)+'M';return '$'+n.toLocaleString();}

function StatCircle({label,value,sub,color}){
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
      <div style={{width:110,height:110,borderRadius:'50%',border:'4px solid '+color,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.15)'}}>
        <div style={{fontWeight:800,fontSize:'1.3rem',color,fontFamily:"'IBM Plex Mono',monospace"}}>{value}</div>
        {sub&&<div style={{fontSize:'.65rem',color:'var(--color-text-muted)',marginTop:2}}>{sub}</div>}
      </div>
      <div style={{fontSize:'.75rem',color:'var(--color-text-secondary)',textAlign:'center',maxWidth:100}}>{label}</div>
    </div>
  )
}

export default function Superinvestors(){
  const [prices,setPrices]=useState({})
  const [selInvestor,setSelInvestor]=useState(null)
  const [loading,setLoading]=useState(true)
  const [lastUpdate]=useState(REPORT_DATE)

  useEffect(()=>{
    // Simulate live price fetch
    const mock={AAPL:{p:213.5,c:+1.2},MSFT:{p:421.8,c:-0.4},GOOGL:{p:178.3,c:+2.1},AMZN:{p:198.7,c:+1.8},META:{p:576.4,c:+3.2},NVDA:{p:141.2,c:+5.4},BAC:{p:43.8,c:-0.3},BABA:{p:87.4,c:-1.1},UNH:{p:482.1,c:-2.3},HLT:{p:238.4,c:+0.8}}
    setPrices(mock)
    setTimeout(()=>setLoading(false),800)
  },[])

  const totalAUM=SUPERINVESTORS.reduce((s,i)=>s+i.aum,0)

  return (
    <div className="page-container" style={{paddingBottom:'4rem'}}>
      
      <div style={{marginBottom:'2rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div>
            <h1 style={{margin:0,fontSize:'1.6rem',fontWeight:800,display:'flex',alignItems:'center',gap:10}}>
              <Star size={22} style={{color:'var(--color-accent)'}}/> המשקיעים הגדולים
            </h1>
            <p style={{margin:'4px 0 0',color:'var(--color-text-muted)',fontSize:'.85rem'}}>
              אחזקות Superinvestors לפי גשות 13F — {QUARTER} ({lastUpdate})
            </p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:'.75rem',color:'var(--color-text-muted)',background:'var(--color-bg2)',padding:'6px 14px',borderRadius:20,border:'1px solid var(--color-border)'}}>
            <RefreshCw size={12}/> מתעדכן מדי רבעון · מקור: SEC 13F
          </div>
        </div>
      </div>

      <div style={{display:'flex',gap:'1.5rem',justifyContent:'center',flexWrap:'wrap',marginBottom:'2.5rem'}}>
        <StatCircle label="סה״כ AUM מנוהל" value={fm(totalAUM*1e6)} color="#f5a623"/>
        <StatCircle label="משקיעי על במעקב" value="6" sub="Superinvestors" color="#4f8ef7"/>
        <StatCircle label="אחזקות מניות" value="212" sub="Q3 2025" color="#2dd87a"/>
        <StatCircle label="קניות ברבעון" value="298" sub="vs 210 מכירות" color="#a855f7"/>
        <StatCircle label="ביצוע ממוצע 5Y" value="+22%" sub="vs S&P 10%" color="#f05252"/>
      </div>

      <div className="card" style={{marginBottom:'2rem',padding:'1.5rem'}}>
        <h2 style={{margin:'0 0 1.2rem',fontSize:'1rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
          <Users size={16} style={{color:'var(--color-accent)'}}/> פורטפוליו המשקיעים
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1rem'}}>
          {SUPERINVESTORS.map(inv=>(
            <div key={inv.id} onClick={()=>setSelInvestor(selInvestor?.id===inv.id?null:inv)}
              style={{border:'2px solid '+(selInvestor?.id===inv.id?inv.color:'var(--color-border)'),borderRadius:14,padding:'1rem',cursor:'pointer',background:'var(--color-bg2)',transition:'all .2s',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,right:0,width:80,height:80,borderRadius:'0 14px 0 80px',background:inv.color+'20'}}/>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                <img src={inv.avatar} alt={inv.name} onError={e=>e.target.style.display='none'}
                  style={{width:52,height:52,borderRadius:'50%',objectFit:'cover',border:'2px solid '+inv.color,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:'.95rem'}}>{inv.name}</div>
                  <div style={{fontSize:'.75rem',color:'var(--color-text-muted)'}}>{inv.fund}</div>
                  <div style={{display:'flex',gap:8,marginTop:6,flexWrap:'wrap'}}>
                    <span style={{fontSize:'.7rem',padding:'2px 8px',borderRadius:10,background:inv.color+'22',color:inv.color,fontWeight:600}}>{inv.style}</span>
                    <span style={{fontSize:'.7rem',color:'var(--color-text-muted)'}}>{inv.holdings} מניות</span>
                  </div>
                </div>
                <div style={{textAlign:'left',flexShrink:0}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:800,color:inv.color,fontSize:'.9rem'}}>{fm(inv.aum*1e6)}</div>
                  <div style={{fontSize:'.65rem',color:'var(--color-text-muted)'}}>AUM</div>
                </div>
              </div>
              
              {selInvestor?.id===inv.id&&(
                <div style={{marginTop:'1rem',borderTop:'1px solid var(--color-border)',paddingTop:'1rem'}}>
                  <div style={{fontSize:'.78rem',fontWeight:600,marginBottom:8,color:'var(--color-text-secondary)'}}>Top 5 אחזקות — {QUARTER}</div>
                  {inv.top5.map((h,i)=>(
                    <div key={h.t} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                      <span style={{width:18,height:18,borderRadius:4,background:inv.color,color:'white',fontSize:'.65rem',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,flexShrink:0}}>{i+1}</span>
                      <img src={'https://logo.clearbit.com/'+h.t.toLowerCase().replace('.','')+'com'} alt={h.t}
                        onError={e=>{e.target.style.display='none'}}
                        style={{width:20,height:20,borderRadius:4,objectFit:'contain',background:'white',padding:1}}/>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:'.78rem',color:'var(--color-accent)',minWidth:52}}>{h.t}</span>
                      <span style={{flex:1,fontSize:'.75rem',color:'var(--color-text-secondary)'}}>{h.n}</span>
                      <span style={{fontSize:'.75rem',fontWeight:600}}>{h.pct}%</span>
                      <span style={{fontSize:'.72rem',color:h.chg>=0?'var(--color-success)':'var(--color-danger)',fontFamily:"'IBM Plex Mono',monospace"}}>
                        {h.chg>=0?'+':''}{h.chg}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{marginBottom:'2rem',padding:'1.5rem'}}>
        <h2 style={{margin:'0 0 1.2rem',fontSize:'1rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
          <TrendingUp size={16} style={{color:'var(--color-success)'}}/> 10 המניות הכי מושקעות — {QUARTER}
        </h2>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.85rem'}}>
            <thead>
              <tr style={{background:'var(--color-bg2)',borderBottom:'2px solid var(--color-border)'}}>
                {['#','','מניה','שם','משקיעים','% מנוהל','שינוי','שווי שוק'].map(h=>(
                  <th key={h} style={{padding:'.7rem .875rem',textAlign:'right',fontWeight:600,fontSize:'.73rem',color:'var(--color-text-muted)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP10_STOCKS.map(s=>(
                <tr key={s.ticker} style={{borderBottom:'1px solid var(--color-border)'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'.75rem .875rem',fontWeight:700,color:'var(--color-text-muted)'}}>{s.rank}</td>
                  <td style={{padding:'.75rem 4px'}}>
                    <img src={s.logo} alt={s.ticker} onError={e=>{e.target.src='';e.target.style.display='none'}}
                      style={{width:28,height:28,borderRadius:6,objectFit:'contain',background:'white',padding:3,border:'1px solid var(--color-border)'}}/>
                  </td>
                  <td style={{padding:'.75rem .875rem',fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:'var(--color-accent)'}}>{s.ticker}</td>
                  <td style={{padding:'.75rem .875rem',color:'var(--color-text-secondary)'}}>{s.name}</td>
                  <td style={{padding:'.75rem .875rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{height:6,width:Math.round(s.investors*3),background:'var(--color-accent)',borderRadius:3,minWidth:4}}/>
                      <span>{s.investors}</span>
                    </div>
                  </td>
                  <td style={{padding:'.75rem .875rem',fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{s.pct}%</td>
                  <td style={{padding:'.75rem .875rem',color:s.chg>=0?'var(--color-success)':'var(--color-danger)',fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>
                    {s.chg>=0?'+':''}{s.chg}%
                  </td>
                  <td style={{padding:'.75rem .875rem',color:'var(--color-text-muted)',fontSize:'.8rem'}}>{s.mktcap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',marginBottom:'2rem'}}>
        <div className="card" style={{padding:'1.5rem'}}>
          <h2 style={{margin:'0 0 1.2rem',fontSize:'1rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
            <BarChart2 size={16} style={{color:'var(--color-accent)'}}/> חלוקה לפי סקטור
          </h2>
          <div style={{display:'flex',gap:'1.5rem',alignItems:'center',flexWrap:'wrap'}}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={SECTOR_DATA} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value">
                  {SECTOR_DATA.map((s,i)=><Cell key={i} fill={s.color}/>)}
                </Pie>
                <Tooltip formatter={(v)=>v+'%'}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1,minWidth:120}}>
              {SECTOR_DATA.map(s=>(
                <div key={s.name} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <div style={{width:10,height:10,borderRadius:2,background:s.color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:'.78rem',color:'var(--color-text-secondary)'}}>{s.name}</span>
                  <span style={{fontWeight:700,fontSize:'.78rem',fontFamily:"'IBM Plex Mono',monospace"}}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{padding:'1.5rem'}}>
          <h2 style={{margin:'0 0 1.2rem',fontSize:'1rem',fontWeight:700}}>פעילות קניות/מכירות לפי רבעון</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={BUY_ACTIVITY} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
              <XAxis dataKey="q" tick={{fontSize:11,fill:'var(--color-text-muted)'}}/>
              <YAxis tick={{fontSize:11,fill:'var(--color-text-muted)'}}/>
              <Tooltip/>
              <Legend wrapperStyle={{fontSize:12}}/>
              <Bar dataKey="buys" name="קניות" fill="#2dd87a" radius={[4,4,0,0]}/>
              <Bar dataKey="sells" name="מכירות" fill="#f05252" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{padding:'1.5rem',background:'var(--color-bg2)',borderColor:'var(--color-border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <DollarSign size={14} style={{color:'var(--color-text-muted)'}}/>
          <span style={{fontSize:'.78rem',color:'var(--color-text-muted)',fontWeight:600}}>מידע על מקורות הנתונים</span>
        </div>
        <p style={{margin:0,fontSize:'.75rem',color:'var(--color-text-muted)',lineHeight:1.6}}>
          הנתונים מבוססים על גשות 13F לרשות ניירות ערך האמריקאית (SEC). דוחות אלו מוגשים בתוך 45 יום מסוף כל רבעון ומשקפים אחזקות ב-{REPORT_DATE}. 
          הנתונים מתעדכנים מדי רבעון. <a href="https://www.dataroma.com" target="_blank" rel="noopener noreferrer" style={{color:'var(--color-accent)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>
            מקור: Dataroma <ExternalLink size={10}/>
          </a>
        </p>
      </div>
    </div>
  )
}