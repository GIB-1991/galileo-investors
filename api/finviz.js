// deploy 1777836477183
export default async function handler(req,res){
  const{ticker}=req.query;
  if(!ticker)return res.status(400).json({error:'no ticker'});
  try{
    const r=await fetch('https://finviz.com/quote.ashx?t='+ticker.toUpperCase(),{
      headers:{
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':'text/html,application/xhtml+xml',
        'Accept-Language':'en-US,en;q=0.9'
      }
    });
    const html=await r.text();

    // Find label (works for both data-boxover-html="X" and plain label text)
    // Then get the next <b>value</b> within 600 chars
    function cell(label){
      // Try data-boxover-html first (Beta)
      let idx=html.indexOf('data-boxover-html="'+label+'"');
      if(idx===-1){
        // Fallback: plain text label anywhere in HTML (Short Float, Avg Volume, Market Cap)
        idx=html.indexOf(label+'<');
        if(idx===-1) idx=html.indexOf(label+'</');
        if(idx===-1) return null;
      }
      const bStart=html.indexOf('<b>',idx);
      if(bStart===-1||bStart-idx>600)return null;
      const bEnd=html.indexOf('</b>',bStart);
      if(bEnd===-1)return null;
      return html.substring(bStart+3,bEnd).replace(/<[^>]+>/g,'').trim();
    }

    const betaRaw=cell('Beta');
    const beta=betaRaw&&betaRaw!=='-'?parseFloat(betaRaw):null;

    const sfRaw=cell('Short Float');
    const shortFloat=sfRaw&&sfRaw!=='-'?parseFloat(sfRaw.replace('%','')):0;

    const avRaw=cell('Avg Volume');
    let avgVolume=0;
    if(avRaw&&avRaw!=='-'){
      const v=parseFloat(avRaw);
      if(avRaw.includes('B'))avgVolume=v*1e9;
      else if(avRaw.includes('M'))avgVolume=v*1e6;
      else if(avRaw.includes('K'))avgVolume=v*1e3;
      else avgVolume=v||0;
    }

    const mcRaw=cell('Market Cap');
    let marketCap=0;
    if(mcRaw&&mcRaw!=='-'){
      const v=parseFloat(mcRaw);
      if(mcRaw.includes('T'))marketCap=v*1e12;
      else if(mcRaw.includes('B'))marketCap=v*1e9;
      else if(mcRaw.includes('M'))marketCap=v*1e6;
    }

    // Extract sector — known tickers first (most reliable), then HTML scrape
    let sector=null
    const KNOWN={AAPL:'Technology',MSFT:'Technology',NVDA:'Technology',AVGO:'Technology',ORCL:'Technology',CRM:'Technology',ADBE:'Technology',INTC:'Technology',AMD:'Technology',CSCO:'Technology',QCOM:'Technology',IBM:'Technology',TXN:'Technology',NOW:'Technology',PLTR:'Technology',AI:'Technology',
      GOOG:'Communication Services',GOOGL:'Communication Services',META:'Communication Services',NFLX:'Communication Services',DIS:'Communication Services',VZ:'Communication Services',T:'Communication Services',CMCSA:'Communication Services',
      AMZN:'Consumer Cyclical',TSLA:'Consumer Cyclical',HD:'Consumer Cyclical',MCD:'Consumer Cyclical',NKE:'Consumer Cyclical',SBUX:'Consumer Cyclical',LOW:'Consumer Cyclical',TJX:'Consumer Cyclical',ABNB:'Consumer Cyclical',
      WMT:'Consumer Defensive',COST:'Consumer Defensive',PG:'Consumer Defensive',KO:'Consumer Defensive',PEP:'Consumer Defensive',MO:'Consumer Defensive',PM:'Consumer Defensive',CL:'Consumer Defensive',
      JPM:'Financial',BAC:'Financial',WFC:'Financial',GS:'Financial',MS:'Financial',C:'Financial',BLK:'Financial',SPGI:'Financial','BRK.B':'Financial','BRK-B':'Financial',V:'Financial',MA:'Financial',AXP:'Financial',
      UNH:'Healthcare',JNJ:'Healthcare',LLY:'Healthcare',PFE:'Healthcare',ABBV:'Healthcare',MRK:'Healthcare',TMO:'Healthcare',ABT:'Healthcare',DHR:'Healthcare',BMY:'Healthcare',AMGN:'Healthcare',CVS:'Healthcare',
      XOM:'Energy',CVX:'Energy',COP:'Energy',SLB:'Energy',EOG:'Energy',OXY:'Energy',PSX:'Energy',
      CAT:'Industrials',BA:'Industrials',HON:'Industrials',UPS:'Industrials',GE:'Industrials',RTX:'Industrials',LMT:'Industrials',DE:'Industrials',MMM:'Industrials',RKLB:'Industrials',UBER:'Industrials',
      LIN:'Basic Materials',SHW:'Basic Materials',FCX:'Basic Materials',NEM:'Basic Materials',
      NEE:'Utilities',DUK:'Utilities',SO:'Utilities',
      AMT:'Real Estate',PLD:'Real Estate',CCI:'Real Estate',EQIX:'Real Estate',
      SPY:'ETF',QQQ:'ETF',VTI:'ETF',IWM:'ETF',DIA:'ETF',VOO:'ETF',IVV:'ETF',VGT:'ETF',XLK:'ETF',XLF:'ETF',XLE:'ETF',XLV:'ETF'}
    const tk=ticker.toUpperCase()
    if(KNOWN[tk]) sector=KNOWN[tk]
    if(!sector){
      let secMatch=html.match(/[?&]f=sec_[^"]*"[^>]*>([^<]+)</)
      if(!secMatch) secMatch=html.match(/sec_[a-z]+["'][^>]*>([A-Z][A-Za-z &]+)</)
      if(!secMatch) secMatch=html.match(/"sector"\s*:\s*"([^"]+)"/i)
      if(secMatch) sector=secMatch[1].trim()
    }

        res.setHeader('Cache-Control','no-store, max-age=0');
    res.json({beta,shortFloat,avgVolume,marketCap:marketCap||null,sector});
  }catch(e){res.status(500).json({error:e.message});}
}