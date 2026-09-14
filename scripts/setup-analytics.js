// Setup: analytics table + policies
import https from 'https';

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'ycrimgysqiyqysfhsooa';

function q(sql, label) {
  return new Promise(resolve => {
    const body = JSON.stringify({ query: sql });
    const opts = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const ok = res.statusCode === 200 || res.statusCode === 201;
        console.log(ok ? `  ✅ ${label}` : `  ❌ ${label}: ${d.slice(0,120)}`);
        resolve(ok);
      });
    });
    req.on('error', e => { console.log(`  ❌ ${label}: ${e.message}`); resolve(false); });
    req.write(body); req.end();
  });
}

async function main() {
  console.log('🚀 Setting up analytics table...\n');

  await q(`
    create table if not exists public.page_views (
      id          uuid        primary key default gen_random_uuid(),
      created_at  timestamptz not null default now(),
      page        text        not null,
      session_id  text,
      referrer    text,
      user_agent  text
    );
  `, 'page_views table');

  await q(`alter table public.page_views enable row level security;`, 'RLS on page_views');
  await q(`drop policy if exists anon_insert on public.page_views;`, 'drop old policy');
  await q(`drop policy if exists admin_read  on public.page_views;`, 'drop old policy');

  await q(`
    create policy anon_insert on public.page_views
      for insert with check (true);
  `, 'page_views → anon insert');

  await q(`
    create policy admin_read on public.page_views
      for select using (auth.role() = 'authenticated');
  `, 'page_views → admin read');

  console.log('\n✅ Analytics setup complete!');
}

main().catch(console.error);
