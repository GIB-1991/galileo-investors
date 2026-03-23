import pkg from 'pg';
const { Client } = pkg;

export default async function handler(req, res) {
  const secret = req.query.secret;
  if (secret !== 'galileo2024init') {
    return res.status(403).json({ error: 'forbidden' });
  }

  const connectionString = process.env.SUPABASE_DB_URL || 
    'postgresql://postgres:' + (process.env.SUPABASE_DB_PASS||'') + '@db.hihmkuaxnizvufwrtmgm.supabase.co:5432/postgres';

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.articles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        summary text,
        url text,
        image_url text,
        category text DEFAULT 'כללי',
        published boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.academy_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        term text NOT NULL,
        definition text NOT NULL,
        example text,
        category text DEFAULT 'כללי',
        sort_order integer DEFAULT 0,
        published boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `);

    await client.query(`ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY`);
    await client.query(`ALTER TABLE public.academy_items ENABLE ROW LEVEL SECURITY`);
    
    // Policies (ignore errors if exist)
    for (const sql of [
      `CREATE POLICY "read_articles" ON public.articles FOR SELECT USING (published = true)`,
      `CREATE POLICY "admin_articles" ON public.articles FOR ALL USING (auth.email() = 'gilbitan2000@gmail.com')`,
      `CREATE POLICY "read_academy" ON public.academy_items FOR SELECT USING (published = true)`,
      `CREATE POLICY "admin_academy" ON public.academy_items FOR ALL USING (auth.email() = 'gilbitan2000@gmail.com')`
    ]) {
      await client.query(sql).catch(()=>{});
    }

    await client.end();
    res.status(200).json({ success: true, message: 'Tables created!' });
  } catch(e) {
    await client.end().catch(()=>{});
    res.status(500).json({ error: e.message });
  }
}