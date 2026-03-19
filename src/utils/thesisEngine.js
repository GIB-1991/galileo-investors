import { getMarketCapCategory } from '../services/stockApi.js'
const ETF_HOLDINGS={QQQ:['AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','AVGO','COST','NFLX'],SPY:['AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','BRK','LLY','JPM']}
export function analyzePortfolio(holdings,stockData){
const alerts=[];const totalValue=holdings.reduce((s,h)=>s+(h.currentValue||0),0);if(!totalValue)return alerts
for(const h of holdings){const data=stockData[h.ticker];if(!data)continue;const w=(h.currentValue||0)/totalValue;const cat=getMarketCapCategory(data.marketCap)
if(cat==='Mega Cap'&&w>0.20)alerts.push({type:'warning',ticker:h.ticker,title:'חשיפה גבוהה - '+h.ticker,message:'Mega Cap: משקל '+(w*100).toFixed(1)+'% חורג מ-20%'})
if(cat==='Large Cap'&&w>0.10)alerts.push({type:'warning',ticker:h.ticker,title:'חשיפה גבוהה - '+h.ticker,message:'Large Cap: משקל '+(w*100).toFixed(1)+'% חורג מ-10%'})
if(cat==='Mid Cap'&&w>0.05)alerts.push({type:'warning',ticker:h.ticker,title:'חשיפה גבוהה - '+h.ticker,message:'Mid Cap: משקל '+(w*100).toFixed(1)+'% חורג מ-5%'})
if(cat==='Small Cap'&&w>0.04)alerts.push({type:'danger',ticker:h.ticker,title:'סיכון גבוה - '+h.ticker,message:'Small Cap: משקל '+(w*100).toFixed(1)+'% חורג מ-4%'})
if(data.sharesFloat&&data.sharesFloat<50e6)alerts.push({type:'danger',ticker:h.ticker,title:'Float נמוך - '+h.ticker,message:'Shares Float נמוך מ-50M — מניה תנודתית'})
if(data.shortFloat&&data.shortFloat>0.10)alerts.push({type:'danger',ticker:h.ticker,title:'Short Float גבוה - '+h.ticker,message:'Short Float של '+(data.shortFloat*100).toFixed(1)+'% — מעל 10%'})
if(data.price&&data.price<10)alerts.push({type:'warning',ticker:h.ticker,title:'מחיר נמוך - '+h.ticker,message:'מחיר מתחת ל-$10 — תנודתיות גבוהה'})}
const etfs=holdings.filter(h=>stockData[h.ticker]?.sector==='ETF')
const stocks=holdings.filter(h=>stockData[h.ticker]?.sector!=='ETF')
for(const etf of etfs){const cs=ETF_HOLDINGS[etf.ticker]||[];for(const s of stocks){if(cs.includes(s.ticker)){const comb=((etf.currentValue||0)+(s.currentValue||0))/totalValue;if(comb>0.20)alerts.push({type:'warning',ticker:s.ticker,title:'כפילות חשיפה - '+s.ticker+' + '+etf.ticker,message:'חשיפה משולבת: '+(comb*100).toFixed(1)+'% חורגת מ-20%'})}}}
return alerts}
export function getPortfolioStats(holdings,stockData){
const totalValue=holdings.reduce((s,h)=>s+(h.currentValue||0),0)
const totalCost=holdings.reduce((s,h)=>s+(h.totalCost||0),0)
const totalPnl=totalValue-totalCost;const totalPnlPct=totalCost>0?(totalPnl/totalCost)*100:0
const sectorMap={};for(const h of holdings){const sec=stockData[h.ticker]?.sector||'Unknown';sectorMap[sec]=(sectorMap[sec]||0)+(h.currentValue||0)}
const sectors=Object.entries(sectorMap).map(([name,value])=>({name,value,weight:totalValue>0?(value/totalValue)*100:0}))
return{totalValue,totalCost,totalPnl,totalPnlPct,sectors}}