export default async function handler(req, res) {
  if (req.query.secret !== 'galileo2024init') {
    return res.status(403).json({ error: 'forbidden' });
  }

  const SUPA_URL = process.env.VITE_SUPABASE_URL;
  const SUPA_KEY = process.env.VITE_SUPABASE_ANON_KEY;
  const results = [];

  // Use Supabase RPC to create tables
  // First create articles
  const sqls = [
    `CREATE TABLE IF NOT EXISTS public.articles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL, summary text, url text, image_url text,
      category text DEFAULT 'כללי', published boolean DEFAULT true,
      created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS public.academy_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      term text NOT NULL, definition text NOT NULL, example text,
      category text DEFAULT 'כללי', sort_order integer DEFAULT 0,
      published boolean DEFAULT true,
      created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
    )`,
    `DO $$ BEGIN ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN END $$`,
    `DO $$ BEGIN ALTER TABLE public.academy_items ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN END $$`,
    `DO $$ BEGIN CREATE POLICY "read_articles" ON public.articles FOR SELECT USING (published = true); EXCEPTION WHEN duplicate_object THEN END $$`,
    `DO $$ BEGIN CREATE POLICY "admin_articles" ON public.articles FOR ALL USING (auth.email() = 'gilbitan2000@gmail.com'); EXCEPTION WHEN duplicate_object THEN END $$`,
    `DO $$ BEGIN CREATE POLICY "read_academy" ON public.academy_items FOR SELECT USING (published = true); EXCEPTION WHEN duplicate_object THEN END $$`,
    `DO $$ BEGIN CREATE POLICY "admin_academy" ON public.academy_items FOR ALL USING (auth.email() = 'gilbitan2000@gmail.com'); EXCEPTION WHEN duplicate_object THEN END $$`
  ];

  for (const sql of sqls) {
    try {
      const r = await fetch(SUPA_URL + '/rest/v1/rpc/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPA_KEY,
          'Authorization': 'Bearer ' + SUPA_KEY
        },
        body: JSON.stringify({ sql })
      });
      results.push({ sql: sql.substring(0,40), status: r.status });
    } catch(e) {
      results.push({ sql: sql.substring(0,40), error: e.message });
    }
  }

  res.status(200).json({ results });
}