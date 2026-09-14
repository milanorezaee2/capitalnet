// Script: Setup Supabase tables for CapNet Admin Panel
import https from 'https';

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'ycrimgysqiyqysfhsooa';

function runQuery(sql, label) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`  ✅ ${label}`);
          resolve({ ok: true });
        } else {
          let msg = data;
          try { msg = JSON.parse(data).message || data; } catch (_) {}
          console.log(`  ❌ ${label}: ${msg}`);
          resolve({ ok: false, error: msg });
        }
      });
    });
    req.on('error', (e) => { console.log(`  ❌ ${label}: ${e.message}`); resolve({ ok: false }); });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('🚀 CapNet — Supabase Setup\n');

  // ── Step 1: Drop & recreate all tables clean ───────────────────────────────
  console.log('── Step 1: Creating tables...');

  await runQuery(`
    create table if not exists public.leads (
      id               uuid        primary key default gen_random_uuid(),
      created_at       timestamptz not null default now(),
      profile_type     text        not null check (profile_type in ('founder','investor')),
      full_name        text        not null,
      email            text        not null,
      phone            text,
      linkedin         text,
      company_name     text,
      sector           text,
      stage            text,
      capital_required text,
      one_liner        text,
      org_name         text,
      ticket_size      text,
      stage_pref       text,
      geo_pref         text,
      confidence       text check (confidence in ('high','low')),
      message          text,
      deck_url         text,
      status           text not null default 'new' check (status in ('new','in_review','approved','rejected')),
      admin_notes      text
    );
  `, 'leads table');

  await runQuery(`
    create table if not exists public.contact_messages (
      id          uuid        primary key default gen_random_uuid(),
      created_at  timestamptz not null default now(),
      full_name   text        not null,
      email       text        not null,
      subject     text,
      message     text        not null,
      status      text        not null default 'unread' check (status in ('unread','read','replied','archived')),
      admin_reply text,
      replied_at  timestamptz
    );
  `, 'contact_messages table');

  await runQuery(`
    create table if not exists public.blog_posts (
      id           uuid        primary key default gen_random_uuid(),
      created_at   timestamptz not null default now(),
      updated_at   timestamptz not null default now(),
      title        text        not null,
      slug         text        not null unique,
      category     text        not null,
      tags         text[]      default '{}',
      excerpt      text        not null,
      content      text        not null,
      author_name  text        not null,
      author_role  text        not null default '',
      published_at timestamptz,
      read_time    text        not null default '5 دقیقه',
      featured     boolean     default false,
      status       text        not null default 'draft' check (status in ('draft','published','scheduled')),
      views        integer     default 0,
      likes        integer     default 0,
      cover_image  text
    );
  `, 'blog_posts table');

  await runQuery(`
    create table if not exists public.site_settings (
      id         uuid        primary key default gen_random_uuid(),
      key        text        not null unique,
      value      jsonb       not null default '{}',
      updated_at timestamptz not null default now()
    );
  `, 'site_settings table');

  await runQuery(`
    create table if not exists public.testimonials (
      id         uuid        primary key default gen_random_uuid(),
      created_at timestamptz not null default now(),
      name       text        not null,
      role       text        not null,
      company    text,
      text       text        not null,
      avatar_url text,
      sort_order integer     default 0,
      is_active  boolean     default true
    );
  `, 'testimonials table');

  // ── Step 2: Enable RLS ─────────────────────────────────────────────────────
  console.log('\n── Step 2: Enabling Row Level Security...');
  for (const t of ['leads','contact_messages','blog_posts','site_settings','testimonials']) {
    await runQuery(`alter table public.${t} enable row level security;`, `RLS on ${t}`);
  }

  // ── Step 3: Drop old policies (clean slate) ────────────────────────────────
  console.log('\n── Step 3: Cleaning old policies...');
  const dropPolicies = [
    `drop policy if exists public_read_published on public.blog_posts;`,
    `drop policy if exists public_read_active    on public.testimonials;`,
    `drop policy if exists anon_insert           on public.leads;`,
    `drop policy if exists anon_insert           on public.contact_messages;`,
    `drop policy if exists admin_all             on public.leads;`,
    `drop policy if exists admin_all             on public.contact_messages;`,
    `drop policy if exists admin_all             on public.blog_posts;`,
    `drop policy if exists admin_all             on public.site_settings;`,
    `drop policy if exists admin_all             on public.testimonials;`,
  ];
  for (const sql of dropPolicies) {
    await runQuery(sql, sql.split('on public.')[1]?.replace(';','') ?? sql.slice(0,40));
  }

  // ── Step 4: Create policies ────────────────────────────────────────────────
  console.log('\n── Step 4: Creating RLS policies...');

  await runQuery(`
    create policy public_read_published on public.blog_posts
      for select using (status = 'published');
  `, 'blog_posts → public read published');

  await runQuery(`
    create policy public_read_active on public.testimonials
      for select using (is_active = true);
  `, 'testimonials → public read active');

  await runQuery(`
    create policy anon_insert on public.leads
      for insert with check (true);
  `, 'leads → anon insert');

  await runQuery(`
    create policy anon_insert on public.contact_messages
      for insert with check (true);
  `, 'contact_messages → anon insert');

  for (const t of ['leads','contact_messages','blog_posts','site_settings','testimonials']) {
    await runQuery(`
      create policy admin_all on public.${t}
        for all using (auth.role() = 'authenticated');
    `, `${t} → admin full access`);
  }

  // ── Step 5: Seed default site_settings ────────────────────────────────────
  console.log('\n── Step 5: Seeding default site_settings...');
  await runQuery(`
    insert into public.site_settings (key, value) values
      ('contact_email',  '"invest@capitalnetwork.ir"'),
      ('contact_phone',  '"+98 21 1234 5678"'),
      ('contact_whatsapp', '"+98 21 9100 1200"'),
      ('working_hours', '"شنبه تا چهارشنبه: ۹ صبح تا ۶ عصر"'),
      ('hero_title',    '"شریک استراتژیک شما در مسیر جذب سرمایه"'),
      ('chat_quick_replies', '["خدمات VC-Ready سازی","نحوه همکاری","تماس با تیم"]')
    on conflict (key) do nothing;
  `, 'default site_settings rows');

  // ── Step 6: Verify ─────────────────────────────────────────────────────────
  console.log('\n── Step 6: Verifying tables...');
  const verify = await runQuery(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('leads','contact_messages','blog_posts','site_settings','testimonials')
    order by table_name;
  `, 'table existence check');

  console.log('\n🎉 Setup complete!');
  console.log('\nNext steps:');
  console.log('  1. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
  console.log('  2. Get them from: https://supabase.com/dashboard/project/ycrimgysqiyqysfhsooa/settings/api');
  console.log('  3. Create an admin user at: https://supabase.com/dashboard/project/ycrimgysqiyqysfhsooa/auth/users');
  console.log('  4. Go to /admin on your site and login!');
}

main().catch(console.error);
