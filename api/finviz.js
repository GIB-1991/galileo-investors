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

    // Two patterns: data-boxover-html="LABEL" (Beta) or snapshot-td-label text (Short Float, Avg Volume, Market Cap)
    function cell(label){
      let idx=html.indexOf('data-boxover-html="'+label+'"');
      if(idx===-1){
        // fallback: find label in snapshot-td-label div
        const labelTag='>'+label+'<';
        idx=html.indexOf(labelTag);
        if(idx===-1)return null;
      }
      // value is in next <b>...</b> within 600 chars
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

    res.setHeader('Cache-Control','public,max-age=3600');
    res.json({beta,shortFloat,avgVolume,marketCap:marketCap||null});
  }catch(e){res.status(500).json({error:e.message});}
}