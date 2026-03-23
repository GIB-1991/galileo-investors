import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow from admin
  const secret = req.headers['x-setup-secret'];
  if (secret !== 'galileo-setup-2024') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  );

  const results = [];

  // Create articles table
  const { error: e1 } = await supabase.rpc('exec_ddl', {
    sql: `CREATE TABLE IF NOT EXISTS public.articles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      summary text,
      url text,
      image_url text,
      category text DEFAULT 'כללי',
      published boolean DEFAULT true,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )`
  }).catch(() => ({ error: 'rpc not available' }));
  results.push({ table: 'articles', error: e1 });

  // Create academy_items table
  const { error: e2 } = await supabase.rpc('exec_ddl', {
    sql: `CREATE TABLE IF NOT EXISTS public.academy_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      term text NOT NULL,
      definition text NOT NULL,
      example text,
      category text DEFAULT 'כללי',
      sort_order integer DEFAULT 0,
      published boolean DEFAULT true,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )`
  }).catch(() => ({ error: 'rpc not available' }));
  results.push({ table: 'academy_items', error: e2 });

  res.status(200).json({ results });
}