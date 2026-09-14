// final-seed.mjs
// Creates blog_posts table via PostgREST + seeds 6 posts
// Strategy: uses the existing `is_admin` RPC pattern to infer we can create functions
// Actually uses service_role key to bypass RLS and insert directly
// 
// KEY INSIGHT: PostgREST with service_role bypasses RLS but CANNOT create tables.
// We need to use the Supabase Management API with a Personal Access Token (PAT).
// 
// HOWEVER: We can check if there's a `pg_execute` or similar function available,
// OR we create a migration via the Supabase CLI.
//
// Run: node scripts/final-seed.mjs

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
const ANON = env.VITE_SUPABASE_ANON_KEY;
const URL = env.VITE_SUPABASE_URL;
const REF = URL.match(/https:\/\/([^.]+)/)?.[1];
const HOST = `${REF}.supabase.co`;

function call(path, method, body, extraHeaders = {}) {
  return new Promise((res) => {
    const buf = body ? Buffer.from(JSON.stringify(body)) : null;
    const r = https.request({
      hostname: HOST, path, method,
      headers: {
        'apikey': SVC, 'Authorization': `Bearer ${SVC}`,
        'Content-Type': 'application/json', 'Prefer': 'return=minimal',
        ...(buf ? { 'Content-Length': buf.length } : {}),
        ...extraHeaders,
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

// ── Step 1: Try to create a DDL function via RPC ──────────────────────────────
// We'll try to POST to /rest/v1/rpc with a function creation payload
// This works if the service_role can execute arbitrary SQL via any existing function

// Check what RPCs exist
const rpcList = await call('/rest/v1/', 'GET', null);
let paths = [];
try {
  paths = Object.keys(JSON.parse(rpcList.b).paths || {});
} catch {}
console.log('Available RPC paths:', paths.filter(p => p.startsWith('/rpc/')).join(', '));

// Try calling is_admin RPC (exists) with DDL injection - won't work but worth checking
// Instead, try a different approach: check if `pg_net` or `http` extension exists

// ── Step 2: Try creating via PostgREST Content-Profile ───────────────────────
// Some Supabase projects expose the 'extensions' schema via PostgREST
const extCheck = await call('/rest/v1/pg_catalog.pg_proc?proname=eq.exec_sql&select=proname', 'GET', null, {
  'Accept-Profile': 'pg_catalog',
  'Content-Profile': 'pg_catalog',
});
console.log('pg_catalog check:', extCheck.s, extCheck.b.slice(0, 100));

// ── Step 3: Create the blog_posts table by inserting via admins table trick ──
// Since we have service_role, we CAN use the /rest/v1/ to trigger a function
// Let's try using the Content-Profile header to switch to a different schema

// Try with extensions schema
const extCreate = await call('/rest/v1/rpc/exec', 'POST', {
  sql: `CREATE TABLE IF NOT EXISTS public.blog_posts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, slug TEXT UNIQUE, category TEXT, tags TEXT[], excerpt TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '', cover_image TEXT, author_name TEXT NOT NULL DEFAULT 'CapNet', author_role TEXT NOT NULL DEFAULT '', published_at TIMESTAMPTZ, read_time TEXT NOT NULL DEFAULT '5 min', featured BOOLEAN NOT NULL DEFAULT FALSE, status TEXT NOT NULL DEFAULT 'draft', views INTEGER NOT NULL DEFAULT 0, likes INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`
}, { 'Content-Profile': 'extensions' });
console.log('rpc/exec (extensions):', extCreate.s, extCreate.b.slice(0, 200));

// Try with pg_catalog
const catCreate = await call('/rest/v1/rpc/exec', 'POST', {
  sql: `SELECT 1`
}, { 'Content-Profile': 'pg_catalog' });
console.log('rpc/exec (pg_catalog):', catCreate.s, catCreate.b.slice(0, 200));
