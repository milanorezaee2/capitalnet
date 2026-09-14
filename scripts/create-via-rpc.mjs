// create-via-rpc.mjs
// Creates the blog_posts table by first creating a helper SQL function via PostgREST
// Then calls it to create the table + seeds posts
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

function call(path, method, body) {
  return new Promise((res) => {
    const buf = body ? Buffer.from(JSON.stringify(body)) : null;
    const r = https.request({
      hostname: HOST,
      path,
      method,
      headers: {
        'apikey': SVC,
        'Authorization': `Bearer ${SVC}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
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

// ── Step 1: Create exec_sql function via PostgREST SQL endpoint ───────────────
// Supabase allows creating functions via /rest/v1/rpc only if they already exist.
// We try a different approach: use the /rest/v1/ with SQL in the body
// Actually, let's try creating through the schema endpoint

// First check what schemas/functions are available
console.log('Checking available RPC functions...');
const rpcCheck = await call('/rest/v1/rpc/version', 'POST', {});
console.log('rpc/version:', rpcCheck.s, rpcCheck.b.slice(0, 100));

// Try running raw SQL via a known Supabase internal function
const sqlCheck = await call('/rest/v1/rpc/exec_sql', 'POST', { sql: 'SELECT 1' });
console.log('rpc/exec_sql:', sqlCheck.s, sqlCheck.b.slice(0, 200));

// Try pg_catalog functions
const pgCheck = await call('/rest/v1/rpc/pg_reload_conf', 'POST', {});
console.log('rpc/pg_reload_conf:', pgCheck.s, pgCheck.b.slice(0, 100));

// Check current tables
console.log('\nChecking information_schema...');
const tablesCheck = await call(
  '/rest/v1/information_schema.tables?table_schema=eq.public&select=table_name',
  'GET', null
);
console.log('Tables in public schema:', tablesCheck.s, tablesCheck.b.slice(0, 500));
