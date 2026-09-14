// create-table-direct.mjs — run: node scripts/create-table-direct.mjs
// Uses Supabase Management API with service_role key to create blog_posts table
import { readFileSync } from 'fs';
import https from 'https';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(resolve(__dirname, '../.env'), 'utf8');
const env = {};
for (const line of raw.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq === -1) continue;
  env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SVC_KEY = env.SUPABASE_SERVICE_ROLE;
const REF = SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];

function req(hostname, path, method, headers, body) {
  return new Promise((resolve) => {
    const opts = { hostname, path, method, headers };
    const r = https.request(opts, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => resolve({ status: resp.statusCode, body: d }));
    });
    r.on('error', e => resolve({ status: 0, body: e.message }));
    if (body) r.write(body);
    r.end();
  });
}

// Try Supabase Management API — POST /v1/projects/{ref}/database/query
const createSQL = `
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE,
  category      TEXT,
  tags          TEXT[],
  excerpt       TEXT NOT NULL DEFAULT '',
  content       TEXT NOT NULL DEFAULT '',
  cover_image   TEXT,
  author_name   TEXT NOT NULL DEFAULT 'تیم CapNet',
  author_role   TEXT NOT NULL DEFAULT '',
  published_at  TIMESTAMPTZ,
  read_time     TEXT NOT NULL DEFAULT '5 min',
  featured      BOOLEAN NOT NULL DEFAULT FALSE,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled')),
  views         INTEGER NOT NULL DEFAULT 0,
  likes         INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_published" ON public.blog_posts;
CREATE POLICY "anon_read_published" ON public.blog_posts
  FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "svc_full_access" ON public.blog_posts;
CREATE POLICY "svc_full_access" ON public.blog_posts
  FOR ALL USING (true) WITH CHECK (true);
`;

const bodyStr = JSON.stringify({ query: createSQL });

console.log('Trying Management API at api.supabase.com...');
const mgmtRes = await req(
  'api.supabase.com',
  `/v1/projects/${REF}/database/query`,
  'POST',
  {
    'Authorization': `Bearer ${SVC_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(bodyStr),
  },
  bodyStr
);
console.log('Management API:', mgmtRes.status, mgmtRes.body.slice(0, 300));

// Also try the pg meta endpoint
console.log('\nTrying pg meta endpoint...');
const pgMetaRes = await req(
  REF + '.supabase.co',
  '/pg/query',
  'POST',
  {
    'apikey': SVC_KEY,
    'Authorization': `Bearer ${SVC_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(bodyStr),
  },
  bodyStr
);
console.log('PG Meta:', pgMetaRes.status, pgMetaRes.body.slice(0, 300));
