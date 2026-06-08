// api/superinvestors.js — live 13F holdings from Dataroma (auto-refresh each quarter)
// Parses Dataroma manager pages; cached at the edge so it refreshes automatically
// when new 13F filings appear (~45 days after each quarter end).

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

// Tracked superinvestors. code = Dataroma manager code.
const MANAGERS = [
  { id:'BRK', code:'BRK',     name:'Warren Buffett',   fund:'Berkshire Hathaway',   style:'Value',      color:'#f5a623', img:'/api/imgproxy?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fd%2Fd4%2FWarren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%2528cropped%2529.jpg%2F330px-Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%2528cropped%2529.jpg' },
  { id:'PS',  code:'psc',     name:'Bill Ackman',      fund:'Pershing Square',      style:'Activist',   color:'#4f8ef7', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Valeant_Pharmaceuticals%27_Business_Model_%28headshot%29.jpg/250px-Valeant_Pharmaceuticals%27_Business_Model_%28headshot%29.jpg' },
  { id:'AM',  code:'AM',      name:'David Tepper',     fund:'Appaloosa Management', style:'Value',      color:'#a855f7', img:'/api/imgproxy?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F3%2F3d%2FDavid_Tepper_01.jpg%2F330px-David_Tepper_01.jpg' },
  { id:'SC',  code:'SAM',     name:'Michael Burry',    fund:'Scion Asset Management', style:'Contrarian', color:'#f05252', img:'https://hihmkuaxnizvufwrtmgm.supabase.co/storage/v1/object/public/investors/rJvBIAyOK_0_175_3000_1688_0_x-large.jpg' },
  { id:'BG',  code:'BAUPOST', name:'Seth Klarman',     fund:'Baupost Group',        style:'Deep Value', color:'#06b6d4', img:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Seth_Klarman_at_147th_Preakness_Stakes.jpg/250px-Seth_Klarman_at_147th_Preakness_Stakes.jpg' },
  { id:'TP',  code:'tp',      name:'Daniel Loeb',      fund:'Third Point',          style:'Activist',   color:'#fb923c', img:'https://ui-avatars.com/api/?name=Daniel+Loeb&size=120&background=fb923c&color=fff&bold=true' },
];

const SECTOR_HE = {
  'Technology':'טכנולוגיה','Information Technology':'טכנולוגיה','Communication Services':'תקשורת',
  'Financials':'פיננסים','Financial':'פיננסים','Health Care':'בריאות','Healthcare':'בריאות',
  'Consumer Staples':'צריכה בסיסית','Consumer Discretionary':'צריכה','Consumer Goods':'צריכה',
  'Industrials':'תעשייה','Industrial Goods':'תעשייה','Energy':'אנרגיה','Materials':'חומרים',
  'Real Estate':'נדל"ן','Utilities':'תשתיות','Services':'שירותים','Telecommunications':'תקשורת',
};

const SECTOR_COLORS = ['#4f8ef7','#f5a623','#2dd87a','#a855f7','#f05252','#06b6d4','#fb923c','#8b5cf6','#ec4899','#14b8a6'];

function strip(s){ return s.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim(); }

function grab(txt, re){ const m = txt.match(re); return m ? m[1].trim() : null; }

function parseManager(html){
  const txt = html.replace(/<[^>]+>/g,'\n').replace(/&amp;/g,'&');
  const period   = grab(txt, /Period:\s*\n*\s*([^\n]+)/);
  const repDate  = grab(txt, /Portfolio date:\s*\n*\s*([^\n]+)/);
  const numStk   = grab(txt, /No\. of stocks:\s*\n*\s*([^\n]+)/);
  const valStr   = grab(txt, /Portfolio value:\s*\n*\s*([^\n]+)/);
  const aum      = valStr ? parseInt(valStr.replace(/[^\d]/g,''),10) : null;

  // Holdings table (#grid)
  const gi = html.indexOf('id="grid"');
  let holdings = [];
  if (gi >= 0){
    const ts = html.lastIndexOf('<table', gi);
    const te = html.indexOf('</table>', gi);
    const tbl = html.slice(ts, te);
    const trs = tbl.split(/<tr[^>]*>/i).slice(1);
    for (const tr of trs){
      const tds = (tr.match(/<td[^>]*>[\s\S]*?<\/td>/gi)||[]).map(strip);
      if (tds.length < 10) continue;
      const stock = tds[1] || '';
      const d = stock.indexOf(' - ');
      if (d < 0) continue;
      const chg = parseFloat((tds[9]||'').replace('%',''));
      holdings.push({
        t: stock.slice(0,d),
        n: stock.slice(d+3),
        p: parseFloat(tds[2]),
        act: tds[3] || '',
        c: isNaN(chg) ? 0 : +chg.toFixed(1),
      });
    }
  }

  // Sector breakdown
  const si = txt.indexOf('Sector % analysis');
  const ei = txt.indexOf('Articles & Commentaries');
  const secChunk = si >= 0 ? txt.slice(si, ei > si ? ei : si + 800) : '';
  const secRe = /([A-Za-z][A-Za-z &]+?)\s*\n+\s*([\d.]+)\s*\n/g;
  const sectors = []; let m;
  while ((m = secRe.exec(secChunk))){
    if (m[1].trim() === 'Sector % analysis') continue;
    sectors.push({ name: m[1].trim(), value: parseFloat(m[2]) });
  }

  return { period, repDate, numStk: numStk ? parseInt(numStk,10) : holdings.length, aum, holdings, sectors };
}

async function fetchManager(mgr){
  try {
    const r = await fetch('https://www.dataroma.com/m/holdings.php?m=' + mgr.code, {
      headers: { 'User-Agent': UA, 'Accept':'text/html', 'Accept-Language':'en-US,en;q=0.9' }
    });
    if (!r.ok) return null;
    const html = await r.text();
    const parsed = parseManager(html);
    if (!parsed.holdings.length) return null;
    return { ...mgr, ...parsed };
  } catch { return null; }
}

// derive filing date label from report date (13F filed within 45 days of quarter end)
function filingLabel(repDate){
  if (!repDate) return '';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = repDate.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (!m) return '';
  let mi = months.indexOf(m[2]); let yr = parseInt(m[3],10);
  // quarter ends Mar/Jun/Sep/Dec -> filed in May/Aug/Nov/Feb
  const fileMonth = { 2:'May', 5:'Aug', 8:'Nov', 11:'Feb' }[mi];
  if (mi === 11) yr += 1;
  return fileMonth ? fileMonth + ' ' + yr : '';
}

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Cache 12h at edge, serve stale up to 7 days while revalidating.
  // 13F data only changes quarterly, so this auto-refreshes when new filings land.
  res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=604800');

  try {
    const results = (await Promise.all(MANAGERS.map(fetchManager))).filter(Boolean);
    if (!results.length) return res.status(502).json({ error: 'No data from source' });

    // Determine the most recent quarter present (use the max report date)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dnum = d => { const m=(d||'').match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/); return m?parseInt(m[3])*100+months.indexOf(m[2]):0; };
    let latest = results[0];
    for (const r of results) if (dnum(r.repDate) > dnum(latest.repDate)) latest = r;
    const quarter = latest.period || '';
    const reportDate = latest.repDate || '';
    const filingDate = filingLabel(latest.repDate);

    // Investor cards (top 5 holdings each)
    const investors = results.map(r => ({
      id:r.id, name:r.name, fund:r.fund, style:r.style, color:r.color, img:r.img,
      aum:r.aum, n:r.numStk, period:r.period, repDate:r.repDate,
      top5: r.holdings.slice(0,5).map(h=>({ t:h.t, n:h.n, p:h.p, c:h.c })),
    }));

    // Aggregate most-owned across investors
    const agg = {};
    for (const r of results){
      for (const h of r.holdings){
        const key = h.t;
        if (!agg[key]) agg[key] = { t:h.t, n:h.n, inv:0, pctSum:0, cSum:0, cCount:0, secCount:{} };
        agg[key].inv += 1;
        agg[key].pctSum += h.p || 0;
        if (typeof h.c === 'number'){ agg[key].cSum += h.c; agg[key].cCount += 1; }
      }
    }
    // sector lookup per ticker from each manager's sector list is per-portfolio, not per-stock,
    // so derive a coarse sector label from aggregate where unavailable.
    const top10 = Object.values(agg)
      .sort((a,b)=> b.inv - a.inv || b.pctSum - a.pctSum)
      .slice(0,10)
      .map((s,i)=>({
        r:i+1, t:s.t, n:s.n, inv:s.inv,
        pct:+(s.pctSum / s.inv).toFixed(1),
        c: s.cCount ? +(s.cSum/s.cCount).toFixed(1) : 0,
        logo:'https://logo.clearbit.com/'+s.t.toLowerCase().replace(/[^a-z]/g,'')+'.com',
      }));

    // AUM-weighted sector breakdown across investors (more representative than a simple mean)
    const secAgg = {};
    for (const r of results){
      const w = r.aum || 0;
      for (const s of r.sectors){
        const he = SECTOR_HE[s.name] || s.name;
        if (!secAgg[he]) secAgg[he] = { sum:0 };
        secAgg[he].sum += (s.value/100) * w;
      }
    }
    let sectors = Object.entries(secAgg)
      .map(([name,v])=>({ name, value:v.sum }))
      .sort((a,b)=> b.value - a.value);
    const sumSec = sectors.reduce((s,x)=>s+x.value,0) || 1;
    sectors = sectors.slice(0,8).map((s,i)=>({ name:s.name, value:Math.round(s.value/sumSec*100), color:SECTOR_COLORS[i%SECTOR_COLORS.length] }));

    // Activity: count buys vs sells (Add/Buy vs Reduce/Sell) for the latest quarter
    let buys=0, sells=0;
    for (const r of results){
      for (const h of r.holdings){
        const a=(h.act||'').toLowerCase();
        if (a.includes('buy')||a.includes('add')) buys++;
        else if (a.includes('sell')||a.includes('reduce')) sells++;
      }
    }

    const totalAUM = results.reduce((s,r)=> s + (r.aum||0), 0);
    const leadSector = sectors[0] ? sectors[0].name : '';

    return res.status(200).json({
      quarter, reportDate, filingDate,
      stats: {
        totalAUM, managers: results.length,
        holdings: investors.reduce((s,i)=>s+(i.n||0),0),
        buys, sells, leadSector,
        leadSectorPct: sectors[0] ? sectors[0].value : 0,
      },
      investors, top10, sectors,
      source: 'Dataroma · SEC 13F',
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
