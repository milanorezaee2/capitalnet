// db-check.mjs — بررسی اتصال و سلامت دیتابیس Supabase
// اجرا: npm run db:check
//
// این اسکریپت:
//   1. فایل .env را می‌خواند (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY و در صورت وجود SUPABASE_SERVICE_ROLE)
//   2. اتصال REST به پروژه را تست می‌کند
//   3. جداول موردنیاز اپلیکیشن را چک می‌کند که وجود دارند و با کلید فعلی قابل خواندن هستند
//   4. برای هر جدولِ غایب، فایل SQL مهاجرتی که آن را می‌سازد پیشنهاد می‌دهد

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── خواندن متغیرهای محیط ────────────────────────────────────────────────────
function loadEnv() {
  const env = {};
  for (const file of ['.env', '.env.local']) {
    const p = resolve(ROOT, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

// ── جداول موردنیاز اپلیکیشن ─────────────────────────────────────────────────
const REQUIRED_TABLES = [
  // هسته سایت
  'site_settings', 'site_content', 'blog_posts', 'contact_messages',
  'newsletter_subscriptions', 'testimonials', 'media_assets',
  // ارزیابی و کاربران
  'assessments', 'users', 'admins', 'founder_submissions',
  // تحلیل و اعلان‌ها
  'page_views', 'notifications', 'audit_logs', 'roles',
  // چت زنده
  'chat_rooms', 'chat_messages',
  // صفحه فرایند
  'process_pages', 'process_submissions',
  // CMS خدمات
  'services_cms_services', 'services_cms_categories', 'services_cms_features',
  'services_cms_benefits', 'services_cms_process_steps', 'services_cms_deliverables',
  'services_cms_technologies', 'services_cms_pricing_plans', 'services_cms_comparison_tables',
  'services_cms_portfolio', 'services_cms_case_studies', 'services_cms_statistics',
  'services_cms_client_logos', 'services_cms_testimonials', 'services_cms_team_members',
  'services_cms_faqs', 'services_cms_contact_forms', 'services_cms_newsletters',
  'services_cms_related_content', 'services_cms_ctas', 'services_cms_activity_log',
  'services_cms_revisions', 'services_cms_page_settings', 'services_cms_seo_settings',
  'services_cms_media_assets',
];

// ── نقشه جدول → فایل SQL ────────────────────────────────────────────────────
function buildSqlIndex() {
  const map = {};
  const sqlFiles = [
    ...readdirSync(ROOT).filter(f => f.endsWith('.sql')),
    ...readdirSync(resolve(ROOT, 'scripts')).filter(f => f.endsWith('.sql')).map(f => `scripts/${f}`),
  ];
  for (const file of sqlFiles) {
    const content = readFileSync(resolve(ROOT, file), 'utf8');
    const names = [...content.matchAll(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:public\.)?"?([a-zA-Z_][a-zA-Z0-9_]*)"?/gi)]
      .map(m => m[1]);
    for (const n of names) if (!map[n]) map[n] = file;
  }
  return map;
}

const env = loadEnv();
const URL_ = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const ANON = env.VITE_SUPABASE_ANON_KEY;
const SVC  = env.SUPABASE_SERVICE_ROLE || env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_ || !ANON) {
  console.error(`
❌ فایل .env پیدا نشد یا ناقص است.

   یک فایل .env در ریشه پروژه بسازید با این محتوا:

     VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGci...

   مقادیر را از Supabase Dashboard → Settings → API کپی کنید.
`);
  process.exit(1);
}

const REF = URL_.match(/https:\/\/([^./]+)/)?.[1];
const headers = {
  apikey: SVC || ANON,
  Authorization: `Bearer ${SVC || ANON}`,
};

async function probe(table) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(`${URL_}/rest/v1/${table}?select=*&limit=1`, {
      headers: { ...headers, Accept: 'application/json' },
      signal: ctrl.signal,
    });
    let count = null;
    if (r.ok) {
      const range = r.headers.get('content-range');
      if (range && range.includes('/')) count = range.split('/')[1];
    }
    return { status: r.status, count };
  } catch (e) {
    return { status: 0, error: e.name === 'AbortError' ? 'timeout' : e.message };
  } finally {
    clearTimeout(t);
  }
}

console.log(`\n🔌 پروژه: ${URL_}`);
console.log(`   کلید استفاده‌شده: ${SVC ? 'service_role' : 'anon'}\n`);

const ping = await probe('site_settings');
if (ping.status === 0) {
  console.error(`❌ اتصال برقرار نشد: ${ping.error}\n   آدرس پروژه و کلید را بررسی کنید.\n`);
  process.exit(1);
}
console.log(`✅ اتصال برقرار است (HTTP ${ping.status})\n`);

const sqlIndex = buildSqlIndex();
const missing = [];
const denied = [];

console.log('── وضعیت جداول ──────────────────────────────────────────────────');
for (const table of REQUIRED_TABLES) {
  const r = await probe(table);
  if (r.status === 200) {
    console.log(`  ✅ ${table.padEnd(32)} ${r.count !== null ? `(${r.count} ردیف)` : ''}`);
  } else if (r.status === 404 || r.status === 400 || r.status === 406) {
    console.log(`  ❌ ${table.padEnd(32)} وجود ندارد`);
    missing.push(table);
  } else if (r.status === 401 || r.status === 403) {
    console.log(`  🔒 ${table.padEnd(32)} دسترسی ممنوع (RLS)`);
    denied.push(table);
  } else {
    console.log(`  ⚠️  ${table.padEnd(32)} پاسخ نامشخص (HTTP ${r.status})`);
  }
}

console.log('\n── خلاصه ────────────────────────────────────────────────────────');
console.log(`   مجموع: ${REQUIRED_TABLES.length} | موجود: ${REQUIRED_TABLES.length - missing.length - denied.length} | غایب: ${missing.length} | بدون دسترسی: ${denied.length}`);

if (missing.length) {
  console.log('\n📄 برای ساخت جداول غایب، این فایل‌های SQL را در Supabase → SQL Editor اجرا کنید:');
  const byFile = {};
  for (const t of missing) {
    const f = sqlIndex[t] || '— فایل SQL برای این جدول در ریپو نیست —';
    (byFile[f] ||= []).push(t);
  }
  for (const [file, tables] of Object.entries(byFile)) {
    console.log(`\n   ▸ ${file}`);
    console.log(`     ${tables.join(', ')}`);
  }
}

if (denied.length) {
  console.log(`\n🔒 ${denied.length} جدول به‌خاطر سیاست‌های RLS با کلید فعلی قابل خواندن نیستند.`);
  console.log('   برای فعال‌سازی دسترسی عمومی خواندن، در SQL Editor اجرا کنید:');
  console.log(denied.map(t =>
    `   CREATE POLICY "public read ${t}" ON public.${t} FOR SELECT USING (true);`
  ).join('\n'));
}

console.log('');
process.exit(0);
