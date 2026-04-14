export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.status(200).end();
  // Accept any method for debugging
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
  const path=body?.path;
  const b64=body?.b64;
  const message=body?.message||'upload';
  if(!path||!b64)return res.status(400).json({error:'missing',method:req.method,bodyType:typeof req.body,bodyKeys:Object.keys(body||{})});
  const token=process.env.GH_TOKEN;
  const repo='GIB-1991/galileo-investors';
  if(!token)return res.status(500).json({error:'no GH_TOKEN env var'});
  let existSha;
  try{const c=await fetch('https://api.github.com/repos/'+repo+'/contents/'+path,{headers:{'Authorization':'token '+token,'User-Agent':'g'}});if(c.ok)existSha=(await c.json()).sha;}catch(e){}
  const ghBody={message,content:b64};
  if(existSha)ghBody.sha=existSha;
  const r=await fetch('https://api.github.com/repos/'+repo+'/contents/'+path,{method:'PUT',headers:{'Authorization':'token '+token,'User-Agent':'g','Content-Type':'application/json'},body:JSON.stringify(ghBody)});
  const d=await r.json();
  res.status(200).json({ghStatus:r.status,name:d.content?.name,err:d.message});
}