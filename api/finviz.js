export default async function handler(req,res){
  const{ticker}=req.query;
  if(!ticker)return res.status(400).json({error:'no ticker'});
  try{
    const r=await fetch('https://finviz.com/quote.ashx?t='+ticker.toUpperCase(),{
      headers:{
        'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language':'en-US,en;q=0.5',
        'Accept-Encoding':'gzip, deflate, br',
        'Referer':'https://finviz.com/',
        'Connection':'keep-alive'
      }
    });
    const html=await r.text();

    // Finviz snapshot table: <td class="snapshot-td2-cp">Beta</td><td class="snapshot-td2"><b>1.23</b></td>
    function extract(label){
      // Try snapshot table pattern first
      const re1=new RegExp('<td[^>]*>'+label+'<\/td>\s*<td[^>]*><b>([^<]+)<\/b>','i');
      const m1=html.match(re1);
      if(m1)return m1[1].trim();
      // Try plain td pattern
      const re2=new RegExp('<td[^>]*>'+label+'<\/td>\s*<td[^>]*>([^<]+)<','i');
      const m2=html.match(re2);
      if(m2)return m2[1].trim();
      return null;
    }

    const betaStr=extract('Beta');
    const shortStr=extract('Short Float');
    const volStr=extract('Avg Volume');
    const mcStr=extract('Market Cap');

    const beta=betaStr?parseFloat(betaStr):null;
    const shortFloat=shortStr?parseFloat(shortStr.replace('%',''))||0:0;

    // Parse volume like 4.51M, 250K, 1.2B
    let avgVolume=0;
    if(volStr){
      const v=parseFloat(volStr);
      if(volStr.includes('B'))avgVolume=Math.round(v*1e9);
      else if(volStr.includes('M'))avgVolume=Math.round(v*1e6);
      else if(volStr.includes('K'))avgVolume=Math.round(v*1e3);
      else avgVolume=parseInt(volStr.replace(/,/g,''))||0;
    }

    let marketCap=null;
    if(mcStr){
      const v=parseFloat(mcStr);
      if(mcStr.includes('T'))marketCap=v*1e12;
      else if(mcStr.includes('B'))marketCap=v*1e9;
      else if(mcStr.includes('M'))marketCap=v*1e6;
    }

    res.setHeader('Cache-Control','public,max-age=1800');
    res.json({beta,shortFloat,avgVolume,marketCap,
      _debug:{betaStr,shortStr,volStr,mcStr,htmlLen:html.length}});
  }catch(e){
    res.status(500).json({error:e.message});
  }
}