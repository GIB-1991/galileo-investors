export default async function handler(req, res) {
  try { await fetch('https://hihmkuaxnizvufwrtmgm.supabase.co/rest/v1/', { method: 'HEAD' }); } catch (e) {}
  res.status(200).json({ ok: true, ts: Date.now() });
}
