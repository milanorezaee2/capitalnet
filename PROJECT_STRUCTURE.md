# ساختار پروژه

## 📁 سازمان فایل‌ها

```
project/
│
├── 📂 src/                          # کد منبع React
│   ├── App.tsx                      # کامپوننت اصلی
│   ├── main.tsx                     # نقطه ورود
│   ├── index.css                    # استایل‌های گلوبال
│   └── vite-env.d.ts                # تایپ‌های Vite
│
├── 📂 public/                       # فایل‌های عمومی (کپی شده به dist)
│   ├── fonts/                       # فونت‌های قلم
│   ├── images/                      # تصاویر
│   ├── robots.txt                   # دستورالعمل crawlerها
│   ├── sitemap.xml                  # نقشه سایت برای موتورهای جستجو
│   ├── favicon.svg                  # آیکون سایت
│   ├── og-image.png                 # تصویر Open Graph (1200×630)
│   └── .htaccess                    # SPA fallback برای Apache
│
├── 📂 dist/                         # خروجی build (آپلود روی سرور)
│   ├── index.html
│   └── assets/
│
├── 📄 vite.config.ts                # پیکربندی Vite
├── 📄 tailwind.config.js            # پیکربندی Tailwind CSS
├── 📄 postcss.config.js             # پیکربندی PostCSS
│
├── 📄 tsconfig.json                 # پیکربندی TypeScript (ریشه)
├── 📄 tsconfig.app.json             # پیکربندی TypeScript (اپلیکیشن)
├── 📄 tsconfig.node.json            # پیکربندی TypeScript (ابزارها)
│
├── 📄 eslint.config.js              # پیکربندی ESLint
├── 📄 package.json                  # وابستگی‌ها و اسکریپت‌ها
├── 📄 package-lock.json             # قفل نسخه‌ها
│
├── 📄 .nvmrc                        # نسخه Node.js
├── 📄 .env.example                  # نمونه متغیرهای محیط
├── 📄 .gitignore                    # فایل‌های نادیده‌ شده Git
└── 📄 index.html                    # فایل HTML اصلی
```

## 🎯 فایل‌های کلیدی استقرار

| فایل | توضیح |
|------|--------|
| **dist/** | پوشه نهایی که روی هر سرور وب آپلود می‌شود |
| **public/.htaccess** | SPA fallback برای سرورهای Apache |
| **public/robots.txt** | کنترل crawlerها و بلاک ادمین پنل |
| **public/sitemap.xml** | نقشه سایت برای Google |
| **.nvmrc** | نسخه Node.js (20) |
| **.env.example** | متغیرهای محیط (نمونه) |

## 📦 وابستگی‌های اصلی

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^12.42.0",
    "lucide-react": "^0.344.0",
    "@supabase/supabase-js": "^2.57.4"
  }
}
```

## 🔧 اسکریپت‌های موجود

```bash
npm run dev         # اجرای سرور توسعه
npm run build       # ساخت برای production
npm run preview     # پیش‌نمایش ساخت
npm run lint        # بررسی کد
npm run typecheck   # بررسی تایپ‌های TypeScript
npm run serve       # سرو dist روی localhost:5173
```

## 🚀 راهنمای استقرار

محتوای پوشه `dist/` را روی هر سرور وب (Apache، Nginx، cPanel، …) آپلود کنید.
برای سرورهای Apache، فایل `.htaccess` موجود در `public/` به صورت خودکار SPA routing را مدیریت می‌کند.
