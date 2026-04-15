export default async function handler(req,res){
  const t=(req.query.ticker||"").toUpperCase();
  if(!t)return res.status(400).json({error:"no ticker"});
  try{
    const r=await fetch("https://finviz.com/quote.ashx?t="+t,{
      headers:{"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36","Accept":"text/html","Referer":"https://finviz.com/"}
    });
    const html=await r.text();
    const bidx=html.indexOf(">Beta<");
    const snip=bidx>=0?html.substring(bidx,bidx+250).replace(/</g,"["):"NOT_FOUND";
    function extr(lbl){
      const re1=new RegExp(">"+lbl+"</td>[^<]*<td[^>]*>[^<]*<b>([^<]+)</b>","i");
      const m1=html.match(re1); if(m1)return m1[1].trim();
      const re2=new RegExp(">"+lbl+"</td>[^<]*<td[^>]*>([^<\\s][^<]*)<","i");
      const m2=html.match(re2); if(m2){const v=m2[1].trim();if(v&&v!=="-")return v;}
      return null;
    }
    const bs=extr("Beta"),ss=extr("Short Float"),vs=extr("Avg Volume"),ms=extr("Market Cap");
    const beta=bs&&bs!=="-"?parseFloat(bs):null;
    const sf=ss?parseFloat(ss.replace("%",""))||0:0;
    let av=0; if(vs){const v=parseFloat(vs); av=vs.includes("B")?Math.round(v*1e9):vs.includes("M")?Math.round(v*1e6):vs.includes("K")?Math.round(v*1e3):parseInt(vs.replace(/,/g,""))||0;}
    let mc=null; if(ms&&ms!=="-"){const v=parseFloat(ms); mc=ms.includes("T")?v*1e12:ms.includes("B")?v*1e9:ms.includes("M")?v*1e6:null;}
    res.setHeader("Cache-Control","public,max-age=1800");
    res.json({beta,shortFloat:sf,avgVolume:av,marketCap:mc,_debug:{snip,htmlLen:html.length,bs,ss,vs,ms}});
  }catch(e){res.status(500).json({error:e.message});}
}