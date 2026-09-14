# Admin Panel — فهرست کامل ورودی‌ها (Input Reference)

این فایل فهرست تمام ورودی‌های (`input`, `textarea`, `select`) پنل ادمین را به شکل شفاف و دسته‌بندی‌شده نگه می‌دارد.

---

## ۱. صفحه ورود — `AdminLogin.tsx`

| # | نوع | برچسب (label) | Placeholder | متغیر state |
|---|-----|---------------|-------------|-------------|
| 1 | `input[type=email]` | ایمیل | `admin@capnet.io` | `email` |
| 2 | `input[type=password/text]` | رمز عبور | `••••••••` | `password` |

---

## ۲. تنظیمات سایت — `AdminSettingsPage.tsx`

### تب: اطلاعات تماس

| # | نوع | برچسب | Placeholder | کلید settings |
|---|-----|-------|-------------|---------------|
| 1 | `input[text]` | ایمیل | `invest@capitalnetwork.ir` | `contact_email` |
| 2 | `input[text]` | تلفن | `+98 21 1234 5678` | `contact_phone` |
| 3 | `input[text]` | واتساپ | `+98 21 9100 1200` | `contact_whatsapp` |
| 4 | `input[text]` | ساعات کاری | `شنبه تا چهارشنبه: ۹ صبح تا ۶ عصر` | `working_hours` |
| 5 | `input[text]` | عنوان اصلی Hero | `شریک استراتژیک شما در مسیر جذب سرمایه` | `hero_title` |

### تب: شبکه‌های اجتماعی

| # | نوع | برچسب | Placeholder | کلید settings |
|---|-----|-------|-------------|---------------|
| 6 | `input[text]` | Twitter / X | `https://twitter.com/...` | `social_twitter` |
| 7 | `input[text]` | LinkedIn | `https://linkedin.com/company/...` | `social_linkedin` |
| 8 | `input[text]` | Instagram | `https://instagram.com/...` | `social_instagram` |
| 9 | `input[text]` | YouTube | `https://youtube.com/...` | `social_youtube` |

### تب: چت‌بات (Quick Replies)

| # | نوع | برچسب | Placeholder | متغیر state |
|---|-----|-------|-------------|-------------|
| 10 | `input[text]` | پاسخ سریع جدید | `پاسخ سریع جدید...` | `newReply` |

### تب: تیم (هر عضو)

| # | نوع | برچسب | Placeholder | فیلد شیء |
|---|-----|-------|-------------|----------|
| 11 | `input[text]` | نام | `نام کامل` | `member.name` |
| 12 | `input[text]` | سمت | `Senior Advisor` | `member.role` |
| 13 | `textarea` | بیوگرافی | `توضیح کوتاه...` | `member.bio` |
| 14 | `input[text]` | لینک عکس پروفایل (URL) | `https://...` | `member.avatar` |

---

## ۳. ویرایشگر بلاگ — `BlogEditor.tsx`

| # | نوع | برچسب | Placeholder | کلید form |
|---|-----|-------|-------------|----------|
| 1 | `input[file]` | آپلود تصویر کاور (hidden) | — | `cover_image` |
| 2 | `input[text]` | عنوان پست * | `عنوان پست را بنویسید...` | `title` |
| 3 | `input[text]` | Slug (آدرس URL) | `post-url-slug` | `slug` |
| 4 | `select` | دسته‌بندی * | — | `category` |
| 5 | `select` | وضعیت | — | `status` |
| 6 | `input[text]` | زمان مطالعه | `۵ دقیقه` | `read_time` |
| 7 | `input[text]` | نام نویسنده | `نام و نام خانوادگی` | `author_name` |
| 8 | `input[text]` | نقش نویسنده | `Senior VC Advisor` | `author_role` |
| 9 | `input[text]` | تگ‌ها (با کاما جدا کنید) | `VC, Startup, Investment` | `tags` |
| 10 | `textarea` | خلاصه (excerpt) | `خلاصه کوتاه پست...` | `excerpt` |
| 11 | `textarea` | محتوای پست * | `محتوای کامل پست را اینجا بنویسید...` | `content` |

#### گزینه‌های `select` دسته‌بندی:
- `investment` → سرمایه‌گذاری
- `strategy` → استراتژی
- `case-study` → مطالعه موردی
- `market-analysis` → تحلیل بازار
- `negotiation` → مذاکره
- `financial-modeling` → مدل‌سازی مالی

#### گزینه‌های `select` وضعیت:
- `draft` → پیش‌نویس
- `published` → منتشر شده
- `scheduled` → زمان‌بندی شده

---

## ۴. مدیریت نظرات — `AdminTestimonialsPage.tsx`

(مودال ویرایش/ایجاد نظر — `EditModal`)

| # | نوع | برچسب | Placeholder | کلید form |
|---|-----|-------|-------------|----------|
| 1 | `input[text]` | نام * | `علی رضایی` | `name` |
| 2 | `input[text]` | شرکت | `StartupX` | `company` |
| 3 | `input[text]` | سمت / نقش * | `بنیان‌گذار و CEO` | `role` |
| 4 | `textarea` | متن نظر * | `نظر کامل...` | `text` |
| 5 | Toggle (custom) | نمایش در سایت | — | `is_active` |

---

## ۵. مدیریت لیدها — `AdminLeadsPage.tsx`

| # | نوع | برچسب | Placeholder | متغیر state |
|---|-----|-------|-------------|-------------|
| 1 | `input[text]` | جستجو | `جستجو نام، ایمیل، شرکت...` | `search` |
| 2 | `textarea` | یادداشت داخلی | `یادداشت‌های خصوصی...` | `notes` |
| 3 | `input[checkbox]` | انتخاب همه / انتخاب تک‌ردیف | — | `selectedIds` |

---

## ۶. مدیریت پیام‌ها — `AdminMessagesPage.tsx`

| # | نوع | برچسب | Placeholder | متغیر state |
|---|-----|-------|-------------|-------------|
| 1 | `input[text]` | جستجو | — | `search` |
| 2 | `textarea` | پاسخ داخلی (یادداشت) | `پاسخ یا یادداشت داخلی...` | `reply` |
| 3 | `input[checkbox]` | انتخاب همه / انتخاب تک‌ردیف | — | `selectedIds` |

---

## ۷. مدیریت کاربران — `AdminUsersPage.tsx`

| # | نوع | برچسب | Placeholder | متغیر state |
|---|-----|-------|-------------|-------------|
| 1 | `input[text]` | جستجو | `جستجو نام، ایمیل، شرکت، تلفن...` | `search` |
| 2 | `input[checkbox]` | انتخاب همه / انتخاب تک‌ردیف | — | `selectedIds` |

---

## ۸. چت زنده — `AdminLiveChatPage.tsx`

| # | نوع | برچسب | Placeholder | متغیر state |
|---|-----|-------|-------------|-------------|
| 1 | `input[text]` | پاسخ به کاربر | `پاسخ خود را بنویسید...` | `replyText` |

---

## خلاصه آماری

| صفحه | تعداد input | تعداد textarea | تعداد select |
|------|------------|----------------|--------------|
| AdminLogin | 2 | 0 | 0 |
| AdminSettingsPage | 9+1 | 1 | 0 |
| BlogEditor | 8+1(file) | 2 | 2 |
| AdminTestimonialsPage | 2 | 1 | 0 |
| AdminLeadsPage | 1+n(checkbox) | 1 | 0 |
| AdminMessagesPage | 1+n(checkbox) | 1 | 0 |
| AdminUsersPage | 1+n(checkbox) | 0 | 0 |
| AdminLiveChatPage | 1 | 0 | 0 |
| **جمع کل** | **~26** | **5** | **2** |

---

## مسیر فایل‌های اصلی

```
src/components/admin/
├── AdminLogin.tsx            ← ورود ادمین
├── AdminSettingsPage.tsx     ← تنظیمات سایت (اطلاعات تماس، شبکه‌های اجتماعی، چت، تیم)
├── BlogEditor.tsx            ← ویرایشگر پست بلاگ
├── AdminTestimonialsPage.tsx ← مدیریت نظرات
├── AdminLeadsPage.tsx        ← مدیریت لیدها
├── AdminMessagesPage.tsx     ← مدیریت پیام‌ها
├── AdminUsersPage.tsx        ← مدیریت کاربران
├── AdminLiveChatPage.tsx     ← چت زنده با کاربران
└── admin-inputs/
    └── README.md             ← این فایل (فهرست کامل ورودی‌ها)
```
