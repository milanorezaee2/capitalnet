import https from 'https';

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'fgqpixsdqkxzjxylpmoo';

function runQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Setting up assessments table and RLS on project', PROJECT_REF);

  const sql = `
    create table if not exists public.assessments (
      id text primary key default gen_random_uuid()::text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      profile_type text,
      full_name text,
      email text,
      phone text,
      linkedin text,
      company_name text,
      sector text,
      stage text,
      capital_required text,
      one_liner text,
      org_name text,
      ticket_size text,
      stage_pref text,
      geo_pref text,
      confidence text check (confidence in ('high','low')),
      message text,
      deck_url text,
      status text not null default 'new' check (status in ('new','in_review','approved','rejected')),
      admin_notes text default ''
    );

    alter table public.assessments enable row level security;

    create policy if not exists assessments_public_insert on public.assessments
      for insert to anon, authenticated with check (true);

    create policy if not exists assessments_select_own on public.assessments
      for select to authenticated using (email = auth.email());

    create policy if not exists assessments_update_own on public.assessments
      for update to authenticated using (email = auth.email());
  `;

  const result = await runQuery(sql);
  console.log('Result status:', result.statusCode);
  console.log(result.body);
}

main().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
