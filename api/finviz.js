export default async function handler(req,res){
  const{ticker}=req.query;
  if(!ticker)return res.status(400).json({error:'no ticker'});
  try{
    const r=await fetch('https://finviz.com/quote.ashx?t='+ticker.toUpperCase(),{
      headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36','Accept':'text/html','Accept-Language':'en-US'}
    });
    const html=await r.text();
    function extract(label){
      const re=new RegExp(label+'<\\/td>\\s*<td[^>]*>([^<]+)<','i');
      const m=html.match(re);
      return m?m[1].trim():null;
    }
    const beta=parseFloat(extract('Beta')||'0')||null;
    const shortFloat=parseFloat((extract('Short Float')||'0').replace('%',''))||0;
    const avgVolume=parseInt((extract('Avg Volume')||'0').replace(/[KMB,]/g,m=>({K:'000',M:'000000',B:'000000000'}[m]||''))||0)||0;
    const marketCap=extract('Market Cap');
    let mc=0;
    if(marketCap){
      const v=parseFloat(marketCap);
      if(marketCap.includes('T'))mc=v*1e12;
      else if(marketCap.includes('B'))mc=v*1e9;
      else if(marketCap.includes('M'))mc=v*1e6;
    }
    res.setHeader('Cache-Control','public,max-age=3600');
    res.json({beta,shortFloat,avgVolume,marketCap:mc||null});
  }catch(e){res.status(500).json({error:e.message});}
}