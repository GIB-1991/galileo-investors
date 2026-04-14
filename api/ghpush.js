export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).end();
  const {path, b64, message} = req.body||{};
  if(!path||!b64) return res.status(400).json({error:'missing'});
  const token=process.env.GH_TOKEN;
  const repo=process.env.GH_REPO||'GIB-1991/galileo-investors';
  if(!token) return res.status(500).json({error:'no GH_TOKEN env'});
  let sha;
  try{
    const ck=await fetch('https://api.github.com/repos/'+repo+'/contents/'+path,{headers:{'Authorization':'token '+token,'User-Agent':'g'}});
    if(ck.ok){sha=(await ck.json()).sha;}
  }catch(e){}
  const body={message:message||'upload',content:b64};
  if(sha)body.sha=sha;
  const r=await fetch('https://api.github.com/repos/'+repo+'/contents/'+path,{method:'PUT',headers:{'Authorization':'token '+token,'User-Agent':'g','Content-Type':'application/json'},body:JSON.stringify(body)});
  const d=await r.json();
  res.json({status:r.status,name:d.content?.name,sha:d.content?.sha?.substring(0,8),err:d.message});
}