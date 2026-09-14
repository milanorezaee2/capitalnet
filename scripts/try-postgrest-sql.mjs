// try-postgrest-sql.mjs — test raw SQL via PostgREST
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(resolve(__dirname, '../.env'), 'utf8');
const env = {};
for (const line of raw.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq < 0) continue;
  env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
}

const SVC = env.SUPABASE_SERVICE_ROLE;
const REF = env.VITE_SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1];
const HOST = `${REF}.supabase.co`;

function call(path, method, contentType, body) {
  return new Promise((res) => {
    const buf = body ? Buffer.from(body) : null;
    const r = https.request({
      hostname: HOST, path, method,
      headers: {
        'apikey': SVC, 'Authorization': `Bearer ${SVC}`,
        'Content-Type': contentType,
        ...(buf ? { 'Content-Length': buf.length } : {}),
      }
    }, (resp) => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ s: resp.statusCode, b: d }));
    });
    r.on('error', e => res({ s: 0, b: e.message }));
    if (buf) r.write(buf);
    r.end();
  });
}

// Try raw SQL via different content types
const createSQL = `
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT,
  tags TEXT[],
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  author_name TEXT NOT NULL DEFAULT 'CapNet',
  author_role TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ,
  read_time TEXT NOT NULL DEFAULT '5 min',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled')),
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0
);
`;

// Test 1: text/plain SQL
const r1 = await call('/rest/v1/', 'POST', 'text/plain', createSQL);
console.log('[text/plain to /rest/v1/]:', r1.s, r1.b.slice(0, 200));

// Test 2: application/sql
const r2 = await call('/rest/v1/', 'POST', 'application/sql', createSQL);
console.log('[application/sql]:', r2.s, r2.b.slice(0, 200));

// Test 3: Try creating via function that wraps DDL
const fnCreate = JSON.stringify({
  sql: createSQL,
});
const r3 = await call('/rest/v1/rpc/exec_ddl', 'POST', 'application/json', fnCreate);
console.log('[rpc/exec_ddl]:', r3.s, r3.b.slice(0, 200));

// Test 4: Check if supabase_admin or postgres user is available via special header
const r4 = await call('/rest/v1/blog_posts?select=id&limit=1', 'GET', 'application/json', null);
console.log('[GET blog_posts with svc]:', r4.s, r4.b.slice(0, 200));

// Test 5: Try DB direct over pooler
console.log('\nPooler connection info for reference:');
console.log(`DB pooler: postgresql://postgres.${REF}:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`);
console.log(`DB direct: postgresql://postgres.${REF}:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`);
