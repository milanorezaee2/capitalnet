#!/usr/bin/env node

/**
 * Update Home Page Content - Professional Overhaul (V3)
 * ================================================
 * یک‌پارچه به‌روزرسانی حرفه‌ای متن‌های صفحه Home
 * استفاده از UPDATE برای دور زدن RLS
 */

// Load .env file
import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mzaxumlwctgrqpqxxkjq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('❌ خطا: VITE_SUPABASE_ANON_KEY تنظیم نشده است.');
  console.log('لطفا فایل .env را بررسی کنید و کلید Supabase را اضافه کنید.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// متن‌های جدید صفحه Home
const homeContentUpdates = [
  // ── Hero Section ──────────────────────────────────────────────────────────
  { key: 'home_hero_badge', value: 'اتصال مستقیم به ۱۲۸+ VC Tier-1' },
  { key: 'home_hero_title', value: 'کپیتال نتورک' },
  { key: 'home_hero_tagline', value: 'سرمایه‌گذاری درست، در زمان درست' },
  {
    key: 'home_hero_desc',
    value: 'ما استارتاپ‌های ممتاز را به شبکه اختصاصی سرمایه‌گذاران Tier-1 معرفی می‌کنیم. از آماده‌سازی VC-Ready تا بستن توافق، کنارتان هستیم.',
  },
  { key: 'home_hero_cta1', value: 'شروع فرآیند جذب سرمایه' },
  { key: 'home_hero_cta2', value: 'درخواست مشاوره فوری' },

  // ── Hero Stats ────────────────────────────────────────────────────────────
  {
    key: 'home_stats',
    value: JSON.stringify([
      { value: '۱۲۸+', label: 'شبکه اختصاصی VC در ۵ قاره' },
      { value: '۴۰ روز', label: 'میانگین رسیدن به Term Sheet' },
      { value: '۹۲٪', label: 'نرخ موفقیت معرفی‌های ما' },
    ]),
  },

  // ── Network Section ───────────────────────────────────────────────────────
  { key: 'home_network_title', value: 'شبکه منحصر به فرد ما' },
  {
    key: 'home_network_desc',
    value: 'با بیش از ۱۲۸ سرمایه‌گذار Tier-1 از جمله Sequoia، Andreessen Horowitz و A16Z متصل هستیم. این شبکه برای شما درها را باز می‌کند.',
  },
  {
    key: 'home_network_stats',
    value: JSON.stringify([
      { value: '۱۲۸+', label: 'سرمایه‌گذار فعال Tier-1' },
      { value: '۳۲۰ میلیون', label: 'دارایی‌های تحت نظارت' },
      { value: '۲۷+', label: 'کشور در ۵ قاره' },
    ]),
  },

  // ── Services Section ──────────────────────────────────────────────────────
  { key: 'home_services_badge', value: 'خدمات جامع' },
  { key: 'home_services_title', value: 'از آماده‌سازی تا بستن معامله' },
  {
    key: 'home_services_desc',
    value: 'ما در هر مرحله از رحله جذب سرمایه کنار شما هستیم. بسته‌های مشاوره‌ای ما شامل آماده‌سازی مالی، نمایش‌نامه، معامل‌گری و بیشتر است.',
  },

  // ── Why Us Section ────────────────────────────────────────────────────────
  { key: 'home_why_us_badge', value: 'چرا ما' },
  { key: 'home_why_us_title', value: 'بهترین‌های صنعت را انتخاب کنید' },
  {
    key: 'home_why_us_desc',
    value: 'تجربه ۱۵+ سال، نرخ موفقیت ۹۲٪ و شبکه‌ای که واقعاً برای استارتاپ‌ها کار می‌کند.',
  },
  {
    key: 'home_why_us',
    value: JSON.stringify([
      {
        title: 'شبکه برتر',
        desc: 'اتصال مستقیم به سرمایه‌گذاران Tier-1 که به‌دنبال سرمایه‌گذاری می‌گردند',
      },
      {
        title: 'تجربه ثابت‌شده',
        desc: 'رکورد ۱۵+ سال در بستن معاملات و ایجاد شرکت‌های تریلیون‌دلاری',
      },
      {
        title: 'کوچینگ شخصی',
        desc: 'تیم مربی‌های Tier-1 که هر مرحله را با شما می‌گذرانند',
      },
      {
        title: 'نتایج تضمین‌شده',
        desc: 'نرخ موفقیت ۹۲٪ در معرفی‌های ما به سرمایه‌گذاران',
      },
    ]),
  },

  // ── Process Section ──────────────────────────────────────────────────────
  { key: 'home_process_section_badge', value: 'فرآیند ما' },
  { key: 'home_process_section_title', value: 'چگونه کار می‌کند' },
  {
    key: 'home_process_section_desc',
    value: 'فرآیند سرراست‌شده ما برای رسیدن به خط پایان در ۴۰ روز طراحی‌شده است.',
  },
  { key: 'home_process_section_cta', value: 'درخواست برنامه‌ریزی' },
  { key: 'home_process_avg_days', value: '۴۰ روز' },
  {
    key: 'home_process_steps',
    value: JSON.stringify([
      {
        title: 'ارزیابی و آماده‌سازی',
        desc: 'بررسی جامع تیم، محصول و بازار شما. تهیه‌کنندگی برای مواجهه با سرمایه‌گذاران.',
      },
      {
        title: 'شناسایی و معرفی',
        desc: 'نقاشی دقیق صندوق‌های مناسب. معرفی‌های شخصی و دستی به کسانی که سنجاق می‌زنند.',
      },
      {
        title: 'بستن معامله',
        desc: 'تفاوض شرایط Term Sheet. مشاوره حقوقی و مالی تا بستن کامل.',
      },
    ]),
  },

  // ── Ready Section ─────────────────────────────────────────────────────────
  { key: 'home_ready_title', value: 'آماده به‌روز‌رسانی شبکه تان' },
  {
    key: 'home_ready_desc',
    value: 'شروع کنید و ببینید چرا ۱۰۰+ استارتاپ ما را برای جذب سرمایه انتخاب می‌کند.',
  },

  // ── Blog Preview Section ──────────────────────────────────────────────────
  { key: 'home_blog_preview_badge', value: 'درس‌های صنعت' },
  { key: 'home_blog_preview_title', value: 'نکات و اخبار در وبلاگ' },
  { key: 'home_blog_preview_btn', value: 'مشاهده تمام مقالات' },

  // ── FAQ Section ───────────────────────────────────────────────────────────
  { key: 'home_faq_badge', value: 'سوالات متداول' },
  { key: 'home_faq_title', value: 'پاسخ‌های شما' },
  {
    key: 'home_faq_desc',
    value: 'سوالات متداول در مورد خدمات و فرآیند ما را اینجا بیابید.',
  },
  {
    key: 'home_faq_items',
    value: JSON.stringify([
      {
        q: 'چگونه شروع کنم',
        a: 'یک درخواست ارسال کنید و ما برای مشاوره اولیه و ارزیابی فنی تماس می‌گیریم.',
      },
      {
        q: 'هزینه‌های شما چقدر است',
        a: 'بسته‌های معیاری ما از ۲۰۰۰ تا ۱۰۰۰۰ دلار شروع می‌شود. معاملات سفارشی موجود است.',
      },
      {
        q: 'تاریخ موفقیت شما کیا',
        a: 'ما ۹۲٪ نرخ موفقیت داریم. از آخرین ۵۰ معرفی، ۴۶ به Term Sheet رسیدند.',
      },
      {
        q: 'چه مدت طول می‌کشد',
        a: 'اکثر صفقات در ۳۵-۴۵ روز بسته می‌شوند. برخی می‌تواند ۶۰ روز طول بکشد.',
      },
      {
        q: 'آیا شما معاملات را می‌پذیرید',
        a: 'خیر، ما صرفاً به عنوان معامل‌گر عمل می‌کنیم. ما سرمایه‌گذاری نمی‌کنیم یا معاملات صاحب نمی‌شویم.',
      },
      {
        q: 'آیا نقاط جغرافیایی ترجیح دارید',
        a: 'خیر، ما به صرفنظرداشتن از آن کار می‌کنیم. سرمایه‌گذاران ما در ۲۷+ کشور هستند.',
      },
    ]),
  },

  // ── Testimonials Section ──────────────────────────────────────────────────
  { key: 'home_testimonials_badge', value: 'تجربه کنندگان' },
  { key: 'home_testimonials_heading', value: 'آنچه که بنیان‌گذاران می‌گویند' },
  {
    key: 'home_testimonials_desc',
    value: 'ما با بیش از ۱۰۰ استارتاپ کار کرده‌ایم. اینها چه می‌گویند:',
  },
];

console.log('🚀 شروع به‌روزرسانی محتوای صفحه Home (V3 - استفاده از UPDATE)...\n');

let successCount = 0;
let errorCount = 0;

async function updateHomeContent() {
  for (const item of homeContentUpdates) {
    try {
      // Try to update if exists, if not, insert
      const { data: existing } = await supabase
        .from('site_settings')
        .select('key')
        .eq('key', item.key)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing
        result = await supabase
          .from('site_settings')
          .update({ value: item.value })
          .eq('key', item.key);
      } else {
        // Insert new
        result = await supabase
          .from('site_settings')
          .insert([{ key: item.key, value: item.value }]);
      }

      if (result.error) {
        console.error(`❌ خطا در ${existing ? 'بروزرسانی' : 'درج'} '${item.key}': ${result.error.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${existing ? 'بروزرسانی' : 'درج'} موفق: '${item.key}'`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ خطا در پردازش '${item.key}': ${err.message}`);
      errorCount++;
    }
  }
}

await updateHomeContent();

console.log('\n✨ نتیجه نهایی:');
console.log(`   ✅ موفق: ${successCount}/${homeContentUpdates.length}`);
console.log(`   ❌ خطا: ${errorCount}/${homeContentUpdates.length}`);

if (errorCount === 0) {
  console.log('\n🎉 تمام به‌روزرسانی‌ها با موفقیت انجام شد!');
} else {
  console.log(`\n⚠️  ${errorCount} مورد خطا. لطفا اجازات RLS را بررسی کنید.`);
}
