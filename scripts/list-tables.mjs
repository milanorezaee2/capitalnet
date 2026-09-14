// list-tables.mjs — list ALL tables we can access
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

function get(path) {
  return new Promise((res) => {
    const r = https.request({
      hostname: HOST, path, method: 'GET',
      headers: { 'apikey': SVC, 'Authorization': `Bearer ${SVC}` }
    }, (resp) => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ s: resp.statusCode, b: d }));
    });
    r.on('error', e => res({ s: 0, b: e.message }));
    r.end();
  });
}

// List ALL accessible tables via PostgREST discovery
const disc = await get('/rest/v1/');
console.log('PostgREST root [' + disc.s + ']:');
try {
  const obj = JSON.parse(disc.b);
  const paths = Object.keys(obj.paths || {}).slice(0, 30);
  console.log(paths.join('\n'));
} catch { console.log(disc.b.slice(0, 500)); }

// Try known tables
for (const t of ['blog_posts', 'assessments', 'leads', 'users', 'site_settings', 'testimonials', 'messages']) {
  const r = await get(`/rest/v1/${t}?select=id&limit=1`);
  console.log(`  ${t}: ${r.s}`);
}
