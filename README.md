# کپیتال نتورک (CapitalNetwork)

وب‌سایت سرمایه‌گذاری «کپیتال نتورک» — فرانت‌اند React + Vite + TypeScript با مدیریت محتوا و دیتابیس Supabase.

---

## ۱. پیش‌نیازها

| ابزار | نسخه |
|-------|------|
| Node.js | `18.19.0` (مطابق `.nvmrc`) یا بالاتر |
| npm | 10 به بالا |
| پروژه Supabase | برای بخش‌های پویا (بلاگ، خدمات، فرم‌ها، پنل ادمین) |

---

## ۲. نصب و اجرا

```bash
npm install          # نصب وابستگی‌ها
npm run dev          # اجرای سرور توسعه روی http://localhost:5173
```

دستورات دیگر:

```bash
npm run build        # ساخت نسخه production در پوشه dist
npm run preview      # اجرای نسخه ساخته‌شده (بعد از build)
npm run lint         # بررسی کد با ESLint
npm run typecheck    # بررسی تایپ‌ها با TypeScript
npm run db:check     # بررسی اتصال و جداول Supabase
```

> **نکته:** سرور توسعه روی همهٔ رابط‌های شبکه (`0.0.0.0`) گوش می‌دهد و هاست‌های پراکسی‌شده را می‌پذیرد، بنابراین در داکر، محیط‌های ابری و پیش‌نمایش‌ها هم در دسترس است. باز شدن خودکار مرورگر غیرفعال شده است.

بدون تنظیم Supabase هم سایت بالا می‌آید و صفحات اصلی با محتوای پیش‌فرض نمایش داده می‌شوند — اما بلاگ، خدمات، فرم‌ها و پنل ادمین بدون داده خواهند بود.

---

## ۳. تنظیم Supabase

### ۳.۱ ساخت فایل `.env`

در ریشه پروژه فایل `.env` بسازید (این فایل در `.gitignore` است و کامیت نمی‌شود):

```env
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# اختیاری — فقط برای اسکریپت‌های مدیریتی (ساخت ادمین، سید داده)
SUPABASE_SERVICE_ROLE=eyJhbGci...
```

مقادیر را از **Supabase Dashboard → Settings → API** بردارید:
- `VITE_SUPABASE_URL` ← بخش *Project URL*
- `VITE_SUPABASE_ANON_KEY` ← بخش *Project API keys → anon / public*
- `SUPABASE_SERVICE_ROLE` ← بخش *Project API keys → service_role* (محرمانه!)

> هر بار که `.env` را تغییر دادید، سرور توسعه را یک‌بار متوقف و دوباره اجرا کنید.

### ۳.۲ ساخت جداول دیتابیس

وارد **Supabase Dashboard → SQL Editor** شوید و فایل‌های زیر را **به همین ترتیب** اجرا کنید:

| # | فایل | محتوا |
|---|------|-------|
| ۱ | `scripts/setup-new-project.sql` | جداول پایه (settings، users، admins و …) |
| ۲ | `supabase-migration.sql` | کلیدهای پیش‌فرض تنظیمات (چت، شبکه‌های اجتماعی و …) |
| ۳ | `blog-posts-migration.sql` | جداول و داده‌های بلاگ |
| ۴ | `supabase-migrations-process-page.sql` | صفحهٔ فرایند (Process) و خبرنامه |
| ۵ | `scripts/create-notifications-table.sql` | جدول اعلان‌ها |
| ۶ | `scripts/fix-users-complete.sql` | ستون‌ها و سیاست‌های RLS جدول کاربران |
| ۷ | `scripts/add-user-trigger.sql` | تریگر همگام‌سازی `auth.users` → `public.users` |

بعد از اجرا، وضعیت را با دستور زیر بررسی کنید:

```bash
npm run db:check
```

این اسکریپت اتصال را تست می‌کند و می‌گوید کدام جداول وجود ندارند یا به‌خاطر سیاست‌های RLS قابل خواندن نیستند (و دستور SQL لازم برای رفع آن را چاپ می‌کند).

### ۳.۳ (اختیاری) سید دادهٔ نمونه

```bash
node scripts/final-seed.mjs          # داده‌های پایه
node scripts/seed-testimonials.js    # نظرات مشتریان
node scripts/update-home-content.mjs # محتوای صفحه اصلی
```

---

## ۴. ورود به پنل ادمین

آدرس: `http://localhost:5173/cp-secure`

> مسیر پنل ادمین عمداً یک نشانی غیرقابل حدس (`cp-secure`) است و در `src/App.tsx` با ثابت `ADMIN_SECRET_PATH` تعریف شده است.

دو روش ورود وجود دارد:

**الف) از طریق Supabase Auth (توصیه‌شده)**
یک کاربر ادمین بسازید و آن را در جدول `admins` ثبت کنید:

```bash
SUPABASE_URL=https://XXXXXXXX.supabase.co \
SUPABASE_SERVICE_ROLE=eyJhbGci... \
node scripts/create-admin.js admin@capnet.io MyStrongPassword "نام ادمین"
```

**ب) ورود توسعه (بدون دیتابیس)**
در `.env` این دو متغیر را اضافه کنید:

```env
VITE_DEV_ADMIN_EMAIL=admin@capnet.io
VITE_DEV_ADMIN_PASSWORD=your-dev-password
```

> این اعتبارنامه‌ها فقط برای توسعهٔ محلی هستند و نباید روی محیط production قرار بگیرند.

---

## ۵. استقرار (Deploy)

### GitHub Pages

ریپو یک workflow آماده دارد (`.github/workflows/deploy.yml`) که با هر push روی شاخه `main` سایت را می‌سازد و منتشر می‌کند.

1. در **Settings → Pages**، گزینهٔ *Source* را روی **GitHub Actions** بگذارید.
2. در **Settings → Secrets and variables → Actions** دو secret اضافه کنید:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. شاخه `main` را push کنید.

نکته: چون `base` در حالت production برابر `/capitalnet/` است، سایت روی آدرسی شبیه
`https://milanorezaee2.github.io/capitalnet/` منتشر می‌شود.

### هاست شخصی / دامنه (مثل capitalnetwork.ir)

```bash
npm run build
```

محتوای پوشهٔ `dist` را در ریشهٔ هاست آپلود کنید. فایل `public/.htaccess` (اجبار HTTPS، فشرده‌سازی و SPA fallback) همراه خروجی کپی می‌شود.

اگر سایت روی ریشهٔ دامنه (نه زیرپوشه) سرو می‌شود، مقدار `base` را در `vite.config.ts` به `'/'` تغییر دهید.

---

## ۶. ساختار پروژه

```
src/
├── App.tsx              # صفحهٔ اصلی و چیدمان کلی
├── components/          # کامپوننت‌های عمومی + پنل ادمین (components/admin)
├── features/            # صفحات سنگین: blog-post، process، services، blog-cms
├── lib/                 # لایهٔ داده (supabaseApi، cmsApi، blogApi، settingsApi و …)
├── hooks/               # هوک‌های سفارشی (useSettings، useSEO و …)
├── i18n/                # چندزبانه (فارسی / انگلیسی)
├── router/              # مسیریابی مبتنی بر مسیر (SEO-friendly)
├── mobile/              # کامپوننت‌های موبایل
└── utils/               # ابزارها
```

---

## ۷. عیب‌یابی

| مشکل | راه‌حل |
|------|--------|
| پیام `[Supabase] ... is not set` در کنسول | فایل `.env` را بسازید و سرور را ری‌استارت کنید |
| صفحات بلاگ/خدمات خالی است | جداول دیتابیس ساخته نشده‌اند؛ `npm run db:check` را اجرا کنید |
| خطای «جدول وجود ندارد» برای جدولی که ساخته‌اید | سیاست RLS مانع است — دستور پیشنهادی `db:check` را در SQL Editor اجرا کنید |
| پنل ادمین باز نمی‌شود | `npm run db:check` و بررسی جدول `admins`؛ یا از ورود توسعه استفاده کنید |
| تغییرات `.env` اعمال نمی‌شود | سرور توسعه را متوقف و دوباره `npm run dev` اجرا کنید |
| خطای پورت 5173 اشغال است | `npx vite --port 5174` |
