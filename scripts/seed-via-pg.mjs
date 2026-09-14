// seed-via-pg.mjs — Direct PostgreSQL connection to create table + seed posts
// Run: node scripts/seed-via-pg.mjs
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Client } = pkg;

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

// Supabase direct DB connection
// URL format: postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
const REF = env.VITE_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
const DB_PASS = env.SUPABASE_DB_PASSWORD || env.SUPABASE_SERVICE_ROLE; // fallback

if (!REF) {
  console.error('Could not extract project ref from VITE_SUPABASE_URL');
  process.exit(1);
}

// Supabase pooler connection string (Session mode, port 5432)
const connectionString = `postgres://postgres.${REF}:${DB_PASS}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`;

console.log('🔗 Connecting to:', `postgres://postgres.${REF}:***@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`);

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('✅ Connected!\n');
} catch (err) {
  console.error('❌ Connection failed:', err.message);
  console.log('\nTrying us-east region...');
  const cs2 = `postgres://postgres.${REF}:${DB_PASS}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;
  try {
    await new Client({ connectionString: cs2, ssl: { rejectUnauthorized: false } }).connect();
  } catch (err2) {
    console.error('❌ US-East also failed:', err2.message);
    process.exit(1);
  }
}

// Create table
console.log('📋 Creating blog_posts table...');
await client.query(`
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE,
  category      TEXT,
  tags          TEXT[],
  excerpt       TEXT NOT NULL DEFAULT '',
  content       TEXT NOT NULL DEFAULT '',
  cover_image   TEXT,
  author_name   TEXT NOT NULL DEFAULT 'تیم CapNet',
  author_role   TEXT NOT NULL DEFAULT '',
  published_at  TIMESTAMPTZ,
  read_time     TEXT NOT NULL DEFAULT '5 min',
  featured      BOOLEAN NOT NULL DEFAULT FALSE,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled')),
  views         INTEGER NOT NULL DEFAULT 0,
  likes         INTEGER NOT NULL DEFAULT 0
);
`);
console.log('✅ Table created/verified\n');

// Seed posts
const now = Date.now();
const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

const POSTS = [
  {
    title: 'چطور یک Deck VC-Ready بسازیم؟',
    slug: 'vc-ready-deck-guide',
    category: 'investment',
    tags: ['Pitch Deck', 'VC-Ready', 'Executive Summary'],
    excerpt: 'ساختار داستان سرمایه‌گذاری، نکات استراتژیک و ماتریکس‌های مالی که سرمایه‌گذار را قانع می‌کند.',
    content: `یک Pitch Deck VC-Ready فقط مجموعه‌ای از اسلایدها نیست؛ بلکه داستان استراتژیک کسب‌وکار شماست که باید در کمتر از ۱۰ دقیقه سرمایه‌گذار را قانع کند.

**ساختار استاندارد Pitch Deck**

۱. **اسلاید عنوان**: نام شرکت، تگ‌لاین و لوگو.
۲. **مشکل**: چه مشکلی را حل می‌کنید؟ با آمار واقعی.
۳. **راه‌حل**: محصول شما چگونه مشکل را حل می‌کند؟
۴. **بازار**: اندازه بازار (TAM, SAM, SOM) با داده‌های معتبر.
۵. **مدل کسب‌وکار**: چگونه درآمد کسب می‌کنید؟
۶. **ترکشن**: دستاوردها، کاربران و شاخص‌های کلیدی.
۷. **رقبا**: چه کسانی رقیب شما هستند؟
۸. **مزیت رقابتی**: چرا شما برنده می‌شوید؟
۹. **تیم**: چه کسی پشت این پروژه است؟
۱۰. **پیش‌بینی مالی**: ۳ تا ۵ سال آینده.
۱۱. **درخواست**: چقدر سرمایه نیاز دارید؟

**نکات استراتژیک**
- داستان‌گویی: با مشکل شروع کنید.
- سادگی: از اصطلاحات فنی پیچیده پرهیز کنید.
- داده‌محور: هر ادعایی با داده پشتیبانی شود.

**ماتریکس‌های مالی کلیدی**
- CAC (هزینه جذب مشتری)
- LTV (ارزش طول عمر مشتری)
- Churn Rate (نرخ ریزش مشتری)
- MRR/ARR (درآمد تکرارپذیر)
- Gross Margin (حاشیه سود خالص)

**نتیجه‌گیری**
اگر این اصول را رعایت کنید، شانس جذب سرمایه به شدت افزایش می‌یابد.`,
    published_at: daysAgo(15),
    read_time: '۶ دقیقه',
    featured: true,
    status: 'published',
    views: 2450,
    likes: 0,
    author_name: 'علی رضایی',
    author_role: 'Senior VC Advisor',
  },
  {
    title: 'چه زمانی باید با VCها صحبت کرد؟',
    slug: 'when-to-talk-to-vcs',
    category: 'strategy',
    tags: ['Timing', 'VC Relations', 'Fundraising Strategy'],
    excerpt: 'تشخیص سیگنال‌های رشد، نقاط ورود و آماده‌سازی زمان‌بندی برای تماس با سرمایه‌گذار.',
    content: `زمان‌بندی صحیح برای شروع مذاکرات با VCها یکی از حیاتی‌ترین تصمیمات جذب سرمایه است.

**سیگنال‌های آمادگی**
۱. ترکشن واقعی: رشد مداوم در ۳ تا ۶ ماه
۲. مدل کسب‌وکار تاییدشده: درآمدزایی واقعی
۳. تیم کامل: نقش‌های کلیدی پوشش داده شده
۴. شناخت بازار: درک عمیق از مشتریان و رقبا

**نقاط ورود**
- Seed Stage: محصول ساخته و ترکشن اولیه دارید
- Series A: مدل کسب‌وکار تایید شده
- Series B: در بازار تثبیت شده‌اید

**زمان‌بندی**
- ۶ ماه قبل: آماده‌سازی Deck و مدل مالی
- ۳ ماه قبل: شناسایی VCهای هدف
- ۲ ماه قبل: تماس‌های اولیه
- ۱ ماه قبل: جلسات Pitch

**نتیجه‌گیری**
زمان مناسب وقتی است که ترکیب ترکشن، تیم و چشم‌انداز داشته باشید.`,
    published_at: daysAgo(20),
    read_time: '۴ دقیقه',
    featured: true,
    status: 'published',
    views: 1890,
    likes: 0,
    author_name: 'فاطمه محمدی',
    author_role: 'Investment Strategist',
  },
  {
    title: 'مهم‌ترین نکات مذاکره با سرمایه‌گذار',
    slug: 'negotiation-tips-with-investors',
    category: 'negotiation',
    tags: ['Term Sheet', 'Negotiation', 'Valuation'],
    excerpt: 'چک‌لیست شروط کلیدی term sheet و تاکتیک‌های محافظت از مالکیت مؤسسین در مذاکره.',
    content: `مذاکره با سرمایه‌گذاران یکی از حساس‌ترین مراحل جذب سرمایه است.

**شروط کلیدی Term Sheet**
۱. Valuation: Pre-money و Post-money را بشناسید.
۲. Liquidation Preference: از 1x Non-participating دفاع کنید.
۳. Anti-dilution: Weighted Average را ترجیح دهید.
۴. Board Seats: تعادل قدرت را حفظ کنید.
۵. Vesting: 4 سال با Cliff 1 سال استاندارد است.

**تاکتیک‌ها**
- مشاور حقوقی داشته باشید
- فقط روی Valuation تمرکز نکنید
- روی شروط حیاتی ایستادگی کنید
- واقعیت‌ها را صادقانه بیان کنید

**نتیجه‌گیری**
مذاکره موفق نیاز به آمادگی، دانش و استراتژی دارد.`,
    published_at: daysAgo(25),
    read_time: '۷ دقیقه',
    featured: false,
    status: 'published',
    views: 1560,
    likes: 0,
    author_name: 'علی رضایی',
    author_role: 'Senior VC Advisor',
  },
  {
    title: 'چطور یک استارتاپ fintech در ۶ هفته وارد مذاکره شد',
    slug: 'fintech-case-study',
    category: 'case-study',
    tags: ['Fintech', 'Case Study', 'Success Story'],
    excerpt: 'چالش: تماس‌های پراکنده و decks ضعیف — راهکار: بازنویسی روایت و مدل مالی روشن؛ نتیجه: Term Sheet در ۶ هفته.',
    content: `این مطالعه موردی نشان می‌دهد چگونه یک استارتاپ fintech در ۶ هفته به Term Sheet رسید.

**چالش اولیه**
- تماس‌های پراکنده با VCها بدون استراتژی
- Pitch Deck ضعیف و بدون داستان منسجم
- عدم شفافیت در مدل مالی
- ۳ ماه بدون نتیجه

**راهکار**
۱. بازنویسی روایت با تمرکز روی مشکل و راه‌حل
۲. مدل مالی شفاف با پیش‌بینی ۳ ساله
۳. شناسایی ۲۰ VC مرتبط با fintech

**نتایج**
- نرخ دعوت به جلسه: از ۱۵٪ به ۵۰٪
- ۳ پیشنهاد Term Sheet از VCهای Tier-1
- ارزش‌گذاری ۲۰٪ بالاتر از انتظار

**نتیجه‌گیری**
با استراتژی صحیح، زمان جذب سرمایه به شدت کاهش می‌یابد.`,
    published_at: daysAgo(32),
    read_time: '۸ دقیقه',
    featured: true,
    status: 'published',
    views: 3200,
    likes: 0,
    author_name: 'فاطمه محمدی',
    author_role: 'Investment Strategist',
  },
  {
    title: 'تحلیل بازار VC در خاورمیانه ۱۴۰۳',
    slug: 'vc-market-analysis-middle-east',
    category: 'market-analysis',
    tags: ['Market Analysis', 'Middle East', 'VC Trends'],
    excerpt: 'بررسی روندهای سرمایه‌گذاری خطرپذیر در منطقه، فرصت‌های نوظهور و پیش‌بینی‌های ۱۴۰۴.',
    content: `بازار VC خاورمیانه در ۱۴۰۳ تحولات قابل توجهی داشت.

**وضعیت بازار**
- رشد ۲۵٪ حجم سرمایه‌گذاری
- افزایش ۳۰٪ در تعداد Dealها
- کشورهای پیشرو: امارات، عربستان، مصر، ترکیه

**روندها**
- Fintech: ۳۵٪ سرمایه‌گذاری، رشد ۴۰٪
- E-commerce: ۲۰٪، رشد ۳۵٪
- Healthtech: ۱۵٪، رشد ۵۰٪

**فرصت‌های نوظهور**
- SaaS با راه‌حل‌های محلی
- Edtech با محتوای فارسی و عربی
- Cleantech با حمایت دولتی

**نتیجه‌گیری**
بازار VC خاورمیانه در حال بلوغ است و فرصت‌های زیادی وجود دارد.`,
    published_at: daysAgo(40),
    read_time: '۵ دقیقه',
    featured: false,
    status: 'published',
    views: 1200,
    likes: 0,
    author_name: 'علی رضایی',
    author_role: 'Senior VC Advisor',
  },
  {
    title: 'مدل‌سازی مالی برای Series A',
    slug: 'financial-modeling-series-a',
    category: 'financial-modeling',
    tags: ['Financial Model', 'Series A', 'Metrics'],
    excerpt: 'ساخت مدل مالی جامع برای راند Series A شامل پیش‌بینی درآمد، هزینه‌ها و نرخ رشد.',
    content: `مدل مالی برای راند Series A یکی از مهم‌ترین مستندات جذب سرمایه است.

**اجزای کلیدی**
۱. پیش‌بینی درآمد: سناریوهای Base، Upside و Downside
۲. هزینه‌ها: ثابت، متغیر و سرمایه‌ای
۳. شاخص‌ها: CAC، LTV، Churn Rate، MRR/ARR
۴. جریان نقدی: Burn Rate و Runway

**ساختار استاندارد**
- Sheet 1: فرضیات و ورودی‌ها
- Sheet 2: پیش‌بینی درآمد
- Sheet 3: هزینه‌ها
- Sheet 4: سود و زیان
- Sheet 5: جریان نقدی

**نکات**
- واقع‌بین باشید
- فرضیات را توضیح دهید
- مدل انعطاف‌پذیر باشد

**نتیجه‌گیری**
یک مدل مالی حرفه‌ای باید واقع‌بینانه و شفاف باشد.`,
    published_at: daysAgo(45),
    read_time: '۹ دقیقه',
    featured: false,
    status: 'published',
    views: 980,
    likes: 0,
    author_name: 'فاطمه محمدی',
    author_role: 'Investment Strategist',
  },
];

console.log('🌱 Seeding blog posts...\n');
let seeded = 0, skipped = 0, errors = 0;

for (const post of POSTS) {
  // Check if slug exists
  const check = await client.query('SELECT id FROM blog_posts WHERE slug = $1 LIMIT 1', [post.slug]);
  if (check.rows.length > 0) {
    console.log(`⏭  Skipped: "${post.title}"`);
    skipped++;
    continue;
  }

  try {
    await client.query(
      `INSERT INTO blog_posts (title, slug, category, tags, excerpt, content,
        author_name, author_role, published_at, read_time, featured, status,
        views, likes, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())`,
      [
        post.title, post.slug, post.category, post.tags, post.excerpt, post.content,
        post.author_name, post.author_role, post.published_at, post.read_time,
        post.featured, post.status, post.views, post.likes,
      ]
    );
    console.log(`✅  Seeded: "${post.title}"`);
    seeded++;
  } catch (err) {
    console.error(`❌  Error "${post.title}":`, err.message);
    errors++;
  }
}

await client.end();

console.log('\n─────────────────────────────────────');
console.log(`✅  Seeded:  ${seeded} posts`);
console.log(`⏭  Skipped: ${skipped} posts`);
if (errors) console.log(`❌  Errors:  ${errors} posts`);
console.log('─────────────────────────────────────');
if (seeded > 0) console.log('\n🎉 Open admin panel → Blog to see the posts!');
