// test-connection.mjs — run: node scripts/test-connection.mjs
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
const ANON_KEY     = env.VITE_SUPABASE_ANON_KEY;
const SVC_KEY      = env.SUPABASE_SERVICE_ROLE;
const REF = SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];

console.log('URL:', SUPABASE_URL);
console.log('REF:', REF);
console.log('ANON prefix:', ANON_KEY?.slice(0, 40) + '...');
console.log('SVC prefix:', SVC_KEY ? SVC_KEY.slice(0, 40) + '...' : 'MISSING');

function req(opts) {
  return new Promise((res) => {
    const r = https.request(opts, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    });
    r.on('error', e => res({ status: 0, body: e.message }));
    r.end();
  });
}

// Test with service_role key
const result = await req({
  hostname: REF + '.supabase.co',
  path: '/rest/v1/blog_posts?select=id&limit=1',
  method: 'GET',
  headers: {
    'apikey': SVC_KEY || ANON_KEY,
    'Authorization': 'Bearer ' + (SVC_KEY || ANON_KEY),
  },
});
console.log('\nTable check (svc key):', result.status, result.body.slice(0, 200));

// Also test with anon key
const result2 = await req({
  hostname: REF + '.supabase.co',
  path: '/rest/v1/blog_posts?select=id&limit=1',
  method: 'GET',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': 'Bearer ' + ANON_KEY,
  },
});
console.log('Table check (anon key):', result2.status, result2.body.slice(0, 200));
