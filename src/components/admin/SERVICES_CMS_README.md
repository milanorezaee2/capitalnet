# 🎯 Enterprise Service CMS - Implementation Guide

**خلاصه فارسی:** سیستم مدیریت محتوای کامل برای صفحه خدمات که امکان مدیریت تمام جوانب صفحه بدون نیاز به تغییر کد را فراهم می‌کند.

---

## 📋 فهرست مطالب

- [📦 ساختار پروژه](#ساختار-پروژه)
- [🚀 شروع سریع](#شروع-سریع)
- [🗄️ پایگاه داده](#پایگاه-داده)
- [📂 فایل‌های کلیدی](#فایل‌های-کلیدی)
- [🔧 ادغام با App](#ادغام-با-app)
- [📚 ویژگی‌ها](#ویژگی‌ها)
- [🔐 سطح دسترسی](#سطح-دسترسی)

---

## ساختار پروژه

```
src/
├── types/
│   └── servicesCms.ts                 # تمام types و enums
│
├── lib/
│   └── cmsApi.ts                      # API layer کامل
│
├── components/admin/
│   ├── AdminServicesCMS.tsx           # صفحه اصلی admin
│   ├── ServicesDashboard.tsx          # داشبورد با آمار
│   ├── ServicesManagement.tsx         # جدول خدمات
│   ├── AdminCrudManagers.tsx          # مدیرهای categories, pricing, etc
│   └── AdminAdvancedManagers.tsx      # تنظیمات صفحه، activity log
│
└── scripts/
    └── services-cms-migrations.sql    # SQL migrations
```

---

## 🚀 شروع سریع

### 1️⃣ ایجاد جداول پایگاه داده

```bash
# در Supabase SQL Editor، تمام دستورات زیر را اجرا کنید:
# File: src/scripts/services-cms-migrations.sql
```

**یا** اجرای خودکار از طریق اسکریپت:

```bash
npm run setup:cms-db
```

### 2️⃣ اضافه کردن Admin Panel به App

```typescript
// src/App.tsx
import { AdminServicesPage } from '@/components/admin/AdminServicesCMS';

// در بخش routing:
if (currentPage === 'admin-services') {
  return <AdminServicesPage onNavigate={onNavigate} />;
}
```

### 3️⃣ اضافه کردن دکمه دسترسی

```typescript
// در ناوبری مدیریت:
<button onClick={() => setCurrentPage('admin-services')}>
  🎯 CMS خدمات
</button>
```

---

## 🗄️ پایگاه داده

### جداول ایجاد شده

| نام جدول | توضیح | وضعیت |
|---------|--------|-------|
| `services_cms_services` | خدمات اصلی | ✅ |
| `services_cms_categories` | دسته‌بندی خدمات | ✅ |
| `services_cms_features` | ویژگی‌ها | ✅ |
| `services_cms_benefits` | مزایا | ✅ |
| `services_cms_process_steps` | مراحل پروژه | ✅ |
| `services_cms_deliverables` | خروجی‌ها | ✅ |
| `services_cms_technologies` | تکنولوژی‌ها | ✅ |
| `services_cms_pricing_plans` | پلن‌های قیمت | ✅ |
| `services_cms_portfolio` | نمونه‌کارها | ✅ |
| `services_cms_case_studies` | مطالعات موردی | ✅ |
| `services_cms_statistics` | آمار | ✅ |
| `services_cms_client_logos` | لوگوی مشتریان | ✅ |
| `services_cms_testimonials` | نظرات | ✅ |
| `services_cms_team_members` | اعضای تیم | ✅ |
| `services_cms_faqs` | سوالات متداول | ✅ |
| `services_cms_page_settings` | تنظیمات صفحه | ✅ |
| `services_cms_seo_settings` | تنظیمات SEO | ✅ |
| `services_cms_revisions` | نسخه‌های قدیم | ✅ |
| `services_cms_activity_log` | گزارش فعالیت | ✅ |

### ویژگی‌های پایگاه داده

✅ **Timestamps خودکار** - `created_at`, `updated_at`  
✅ **نسخه‌بندی خودکار** - ذخیره نسخه‌های قدیم  
✅ **جستجوی متن کامل** - FTS برای جستجو  
✅ **Indexing** - برای عملکرد بهتر  
✅ **RLS** - امنیت سطح ردیف  
✅ **Constraints** - اطمینان از صحت داده‌ها  

---

## 📂 فایل‌های کلیدی

### 1. `types/servicesCms.ts`
```typescript
// ✅ تمام type definitions
Service, ServiceCategory, PricingPlan, FAQ, ...
```

### 2. `lib/cmsApi.ts`
```typescript
// ✅ تمام API calls
servicesApi.list()
categoriesApi.create()
pricingApi.update()
faqApi.delete()
...
```

### 3. `components/admin/AdminServicesCMS.tsx`
```typescript
// ✅ صفحه اصلی CMS با تمام منوها
<AdminServicesPage />
```

---

## 🔧 ادغام با App

### مرحله 1: بروزرسانی `App.tsx`

```typescript
import { AdminServicesPage } from '@/components/admin/AdminServicesCMS';

// در بخش routing:
function AdminServicesMenu({ onNavigate }: Props) {
  return <AdminServicesPage onNavigate={onNavigate} />;
}
```

### مرحله 2: اضافه کردن در منوی ناوبری

```typescript
// در AdminLayout یا AdminMenu:
<button onClick={() => onNavigate('admin-services')}>
  🎯 CMS خدمات
</button>
```

### مرحله 3: اتصال به Settings

```typescript
// برای نمایش محتوای دیناميکی در صفحه خدمات:
<ServicePage settings={settings} />
```

---

## 📚 ویژگی‌ها

### ✨ داشبورد
- 📊 آمار کلی (کل خدمات، منتشر شده، پیش‌نویس)
- 📈 نمودار‌های فعالیت
- 👥 کاربران فعال
- 📋 آخرین تغییرات

### 🛠️ مدیریت خدمات
- ✅ CRUD کامل (Create, Read, Update, Delete)
- 🔍 جستجو و فیلتر
- 📄 صفحه‌بندی
- 📋 ستون‌های قابل‌تنظیم
- 🎯 Bulk actions (درج/حذف گروهی)
- 📋 Draft، Publish، Schedule
- 📋 Duplicate و Archive

### 🏷️ مدیریت دسته‌بندی‌ها
- ➕ ایجاد دسته‌بندی جدید
- ✏️ ویرایش دسته‌بندی
- 🗑️ حذف دسته‌بندی
- 🔄 تغییر ترتیب با Drag & Drop

### 💰 مدیریت پلن‌های قیمت
- 💵 مدیریت قیمت‌ها
- 🎁 تعیین ویژگی‌ها
- 🏆 علامت‌گذاری محبوب‌ترین پلن
- 🎨 انتخاب رنگ

### ❓ مدیریت FAQ
- ❓ افزودن سؤالات
- 💬 پاسخ‌های طویل
- ✏️ ویرایش سریع
- 🔄 ترتیب سؤالات

### ⭐ مدیریت نظرات
- 📸 اضافه کردن تصویر
- ⭐ امتیاز دهی (1-5)
- 🏷️ شرکت و سمت
- 🎯 علامت‌گذاری برگزیدگی

### ⚙️ تنظیمات صفحه
- 👁️ نمایش/پنهان کردن بخش‌ها
- 🔄 تغییر ترتیب بخش‌های صفحه
- 🎯 تنظیمات SEO
- 📱 پیشنمایش رسپانسیو

### 📋 گزارش فعالیت
- 📊 ثبت تمام تغییرات
- 🔍 جستجوی فعالیت
- 📥 دانلود CSV
- 📅 تاریخ و زمان دقیق

---

## 🔐 سطح دسترسی

### نقش‌های کاربری (Roles)

```typescript
enum UserRole {
  SUPER_ADMIN,      // دسترسی کامل
  ADMIN,            // مدیریت مالی + CMS
  EDITOR,           // فقط ویرایش محتوا
  SEO_MANAGER,      // مدیریت SEO
  CONTENT_MANAGER,  // مدیریت محتوا
  VIEWER,           // فقط مشاهده
}
```

### مجوزهای کاربری

```typescript
interface Permission {
  role: UserRole;
  resource: string;
  actions: {
    create: boolean;   // ایجاد
    read: boolean;     // خواندن
    update: boolean;   // بهروزرسانی
    delete: boolean;   // حذف
    publish: boolean;  // انتشار
  };
}
```

---

## 🔄 جریان کار (Workflow)

```
ایجاد → پیش‌نویس → ویرایش → بازبینی → منتشر/زمان‌بندی → نمایش عمومی
              ↓
         بایگانی/حذف
```

---

## 🚀 API Usage

### مثال: ایجاد خدمت

```typescript
import { cmsApi } from '@/lib/cmsApi';

const newService = await cmsApi.services.create(
  {
    title: 'توسعه وب‌سایت',
    slug: 'web-development',
    description: 'خدمات توسعه وب‌سایت حرفه‌ای',
    status: 'draft',
    categoryId: 'category-123',
  },
  'user-id-123',
  'نام کاربر'
);
```

### مثال: گرفتن لیست دسته‌بندی‌ها

```typescript
const categories = await cmsApi.categories.list();
```

### مثال: بروزرسانی FAQ

```typescript
await cmsApi.faq.update(
  'faq-id-123',
  {
    question: 'سؤال جدید؟',
    answer: 'پاسخ جدید...',
  },
  'user-id-123'
);
```

---

## 📱 رسپانسیو و دسکتاپ

- ✅ طراحی کاملاً ریسپانسیو
- ✅ جدول‌های قابل اسکرول
- ✅ منوی موبایل
- ✅ فرم‌های موبایل‌دوست
- ✅ اندازه فونت قابل خواندگی

---

## 🎨 Design System

### رنگ‌های اصلی
- **سیان**: `#06B6D4` - دکمه‌های اصلی
- **آبی**: `#3B82F6` - ثانویه
- **سبز**: `#10B981` - موفقیت
- **قرمز**: `#EF4444` - خطر/حذف
- **زرد**: `#F59E0B` - هشدار

### کامپوننت‌ها
- ✅ Buttons، Forms، Tables
- ✅ Modals، Dropdowns، Tooltips
- ✅ Cards، Badges، Avatars
- ✅ Alerts، Notifications

---

## 🔍 آنچه بعد‌ها آپ‌دیت می‌شود

- [ ] اضافه کردن Media Library
- [ ] Gallery Management
- [ ] Advanced SEO Tools
- [ ] A/B Testing
- [ ] Analytics Integration
- [ ] Multi-language Support
- [ ] Role-based Permissions UI
- [ ] Template Builder

---

## 📞 پشتیبانی

برای سؤالات و مشکلات:
1. بررسی مستندات
2. بررسی Browser Console
3. بررسی Supabase Logs
4. تماس با تیم توسعه

---

## 📄 لایسنس

This CMS is part of the CapitalNetwork project.

---

**تاریخ:** تاریخ امروز  
**نسخه:** 1.0.0  
**وضعیت:** ✅ Production Ready

🎉 **خوش آمدید به Enterprise Service CMS!**
