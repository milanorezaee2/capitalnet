// try-all-endpoints.mjs — Explore every possible Supabase SQL endpoint
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

function call(hostname, path, method, headers, body) {
  return new Promise((res) => {
    const buf = body ? Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const h = { ...headers, ...(buf ? { 'Content-Length': buf.length } : {}) };
    const r = https.request({ hostname, path, method, headers: h }, (resp) => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ s: resp.statusCode, b: d.slice(0, 300) }));
    });
    r.on('error', e => res({ s: 0, b: e.message }));
    if (buf) r.write(buf);
    r.end();
  });
}

const svcHeaders = { 'apikey': SVC, 'Authorization': `Bearer ${SVC}`, 'Content-Type': 'application/json' };
const sql = 'SELECT 1 as test';
const sqlBody = JSON.stringify({ query: sql });

const endpoints = [
  // Supabase Management API
  ['api.supabase.com', `/v1/projects/${REF}/database/query`, 'POST', { 'Authorization': `Bearer ${SVC}`, 'Content-Type': 'application/json' }, sqlBody],
  // PostgREST
  [`${REF}.supabase.co`, '/rest/v1/rpc/query', 'POST', svcHeaders, sqlBody],
  // Direct database endpoint
  [`db.${REF}.supabase.co`, '/sql', 'POST', svcHeaders, sqlBody],
  [`${REF}.supabase.co`, '/sql', 'POST', svcHeaders, sqlBody],
  // pg-meta
  [`${REF}.supabase.co`, '/pg/query', 'POST', svcHeaders, sqlBody],
  // Studio API
  [`${REF}.supabase.co`, '/studio/sql', 'POST', svcHeaders, sqlBody],
];

for (const [h, p, m, headers, body] of endpoints) {
  const r = await call(h, p, m, headers, body);
  console.log(`[${r.s}] ${h}${p} → ${r.b}`);
}
