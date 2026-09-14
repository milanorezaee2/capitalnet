#!/usr/bin/env node

/**
 * Update Home Page Content - Professional Overhaul
 * ================================================
 * یک‌پارچه به‌روزرسانی حرفه‌ای متن‌های صفحه Home
 * بر اساس بخش‌بندی کامل و محتوای استراتژیک
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
  { key: 'home_network_title', value: 'شبکه جهانی سرمایه‌گذاران' },
  {
    key: 'home_network_desc',
    value: 'دسترسی مستقیم به سرمایه‌گذاران Tier-1 و استراتژیک در 5 قاره. بیش از ۱۲۸ VC فعال با روابط درون شرکتی و تاریخ قابل‌اعتماد.',
  },
  {
    key: 'home_network_stats',
    value: JSON.stringify([
      { value: '۵ قاره', label: 'حضور جهانی شبکه' },
      { value: '۱۲۸+', label: 'سرمایه‌گذار Tier-1 فعال' },
      { value: '$۲۵B+', label: 'اختیار سرمایه کل' },
    ]),
  },

  // ── Services Section ──────────────────────────────────────────────────────
  { key: 'home_services_badge', value: 'خدمات یکپارچه' },
  { key: 'home_services_title', value: 'از آماده‌سازی تا بستن معامله' },
  {
    key: 'home_services_desc',
    value: 'ما فقط معرفی‌کننده نیستیم. کل فرآیند جذب سرمایه را مهندسی می‌کنیم تا با بهترین Valuation و حداقل Dilution راند را ببندید.',
  },

  // ── WhyUs Section ─────────────────────────────────────────────────────────
  { key: 'home_why_us_badge', value: 'چرا کپیتال نتورک؟' },
  { key: 'home_why_us_title', value: 'متفاوت از هر چیزی که تا‌کنون دیده‌اید' },
  {
    key: 'home_why_us_desc',
    value: 'ما یک پل هستیم. بین استارتاپ‌های آماده رشد و سرمایه‌گذارانی که به دنبال فرصت‌های واقعی می‌گردند.',
  },
  {
    key: 'home_why_us',
    value: JSON.stringify([
      {
        title: 'شبکه اختصاصی',
        desc: 'دسترسی مستقیم به ۱۲۸+ VC و CVC با روابط واقعی و تاریخ قابل‌اعتماد، نه فهرست‌های عمومی.',
      },
      {
        title: 'تطابق هوشمند',
        desc: 'معرفی بر اساس Thesis واقعی، Stage رشد و چکسایز هر سرمایه‌گذار — نه ایمیل کور.',
      },
      {
        title: 'همراهی تا بستن',
        desc: 'از Term Sheet تا امضای نهایی کنارتان هستیم. مذاکره، Due Diligence و Closing.',
      },
      {
        title: 'سرعت اثبات‌شده',
        desc: 'میانگین ۴۰ روز از معرفی اول تا Term Sheet. ۹۲٪ نرخ موفقیت معرفی‌های ما.',
      },
    ]),
  },

  // ── Process Section ───────────────────────────────────────────────────────
  { key: 'home_process_section_badge', value: 'فرآیند جذب سرمایه' },
  { key: 'home_process_section_title', value: 'از جلسه اول تا بستن Term Sheet' },
  {
    key: 'home_process_section_desc',
    value: 'فرآیند شفاف، مرحله‌به‌مرحله. میانگین ۴۰ روز تا بستن معامله — بدون اتلاف وقت شما و سرمایه‌گذار.',
  },
  { key: 'home_process_section_cta', value: 'درخواست مشاوره رایگان' },
  { key: 'home_process_avg_days', value: '۳۰-۴۰ روز' },
  {
    key: 'home_process_steps',
    value: JSON.stringify([
      {
        title: 'ارزیابی و آماده‌سازی',
        text: 'جلسه استراتژیک شامل بررسی شاخص‌ها، شناسایی Gaps و ساخت پکیج سرمایه‌بندی کامل.',
        icon: 'layers',
      },
      {
        title: 'معرفی و جلسات',
        text: 'معرفی هدفمند به سرمایه‌گذاران مناسب، هماهنگی جلسات و آماده‌سازی Pitch.',
        icon: 'users',
      },
      {
        title: 'مذاکره و بستن',
        text: 'مذاکره روی شرایط Term Sheet، تحلیل Red Flags و همراهی حقوقی تا Closing.',
        icon: 'check',
      },
    ]),
  },

  // ── Ready Section ─────────────────────────────────────────────────────────
  { key: 'home_ready_title', value: 'آمادگی برای راند بعدی؟' },
  {
    key: 'home_ready_desc',
    value: 'تیم ما با ۱۵+ سال تجربه در تامین مالی، استراتژی و مذاکره، همراه شما تا رسیدن به اهداف سرمایه‌گذاری است.',
  },

  // ── Blog Preview Section ──────────────────────────────────────────────────
  { key: 'home_blog_preview_badge', value: 'آخرین مقالات و بینش' },
  { key: 'home_blog_preview_title', value: 'دانش، تجربه و استراتژی سرمایه‌گذاری' },
  { key: 'home_blog_preview_btn', value: 'دیدن تمام مقالات' },

  // ── FAQ Section ───────────────────────────────────────────────────────────
  { key: 'home_faq_badge', value: 'سوالات متداول' },
  { key: 'home_faq_title', value: 'هر چیزی که باید بدانید' },
  {
    key: 'home_faq_desc',
    value: 'پاسخ‌های کامل به سوالات رایج استارتاپ‌ها درباره فرآیند جذب سرمایه.',
  },
  {
    key: 'home_faq_items',
    value: JSON.stringify([
      {
        q: 'کپیتال نتورک چه خدماتی ارائه می‌دهد؟',
        a: 'ما یک شریک استراتژیک برای استارتاپ‌های در حال رشد هستیم. Pitch Deck حرفه‌ای، مدل مالی دقیق، Data Room آماده، معرفی هدفمند به VC‌های Tier-1 و پشتیبانی کامل در مذاکره و بستن معامله را ارائه می‌دهیم.',
      },
      {
        q: 'آیا برای تمام مراحل رشد مناسب هستید؟',
        a: 'بله. ما استارتاپ‌ها را از Pre-Seed تا Series B پشتیبانی می‌کنیم. بسته خدمات بر اساس مرحله رشد، نیاز سرمایه و اهداف استراتژیک هر شرکت سفارشی می‌شود.',
      },
      {
        q: 'فرآیند همکاری چگونه شروع می‌شود؟',
        a: 'اول یک جلسه ارزیابی رایگان ۳۰ دقیقه‌ای برگزار می‌کنیم. سپس وضعیت فعلی را بررسی می‌کنیم، Gaps را شناسایی می‌کنیم و یک نقشه راه سفارشی برای VC-Ready شدن تهیه می‌کنیم.',
      },
      {
        q: 'میانگین زمان بستن راند چقدر است؟',
        a: 'با کمک کپیتال نتورک، میانگین ۴۰ روز از اولین جلسه تا Term Sheet است — در حالی که میانگین صنعت ۶ تا ۹ ماه می‌باشد.',
      },
      {
        q: 'با چه نوع سرمایه‌گذارانی در ارتباط هستید؟',
        a: 'ما با ۱۲۸+ سرمایه‌گذار Tier-1 در MENA، اروپا و آمریکا در ارتباط فعال‌اند. شبکه ما صندوق‌های VC، Family Offices، Corporate VCs و Strategic Investors را شامل می‌شود.',
      },
      {
        q: 'هزینه خدمات چقدر است؟',
        a: 'بسته‌های خدماتی ما متفاوت است. در جلسه ارزیابی رایگان، نیاز‌های شما را بررسی می‌کنیم و بهترین و مقرون‌به‌صرفه‌ترین گزینه را پیشنهاد می‌دهیم.',
      },
    ]),
  },

  // ── Testimonials (اختیاری) ───────────────────────────────────────────────
  { key: 'home_testimonials_badge', value: 'نظرات و تجربیات' },
  {
    key: 'home_testimonials_heading',
    value: '۵۰+ شرکت موفق از خدمات کپیتال نتورک استفاده کردند',
  },
  {
    key: 'home_testimonials_desc',
    value: 'بنیان‌گذاران و سرمایه‌گذاران موفق بر سرعت، حرفه‌ای‌گری و اثربخشی خدمات ما تاکید می‌کنند.',
  },
];

async function updateHomeContent() {
  console.log('🚀 شروع به‌روزرسانی محتوای صفحه Home...\n');

  let successCount = 0;
  let errorCount = 0;

  try {
    for (const update of homeContentUpdates) {
      // بررسی وجود کلید
      const { data: existing, error: checkError } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', update.key)
        .single();

      if (checkError?.code === 'PGRST116' || !existing) {
        // درج کردن
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert([{ key: update.key, value: update.value }]);

        if (insertError) {
          console.error(`❌ خطا در درج '${update.key}': ${insertError.message}`);
          errorCount++;
        } else {
          console.log(`✅ درج شد: ${update.key}`);
          successCount++;
        }
      } else {
        // به‌روزرسانی
        const { error: updateError } = await supabase
          .from('site_settings')
          .update({ value: update.value })
          .eq('key', update.key);

        if (updateError) {
          console.error(`❌ خطا در به‌روزرسانی '${update.key}': ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`✅ به‌روزرسانی شد: ${update.key}`);
          successCount++;
        }
      }
    }

    console.log(`\n✨ نتیجه نهایی:`);
    console.log(`   ✅ موفق: ${successCount}/${homeContentUpdates.length}`);
    if (errorCount > 0) {
      console.log(`   ❌ خطا: ${errorCount}/${homeContentUpdates.length}`);
    }

    if (errorCount === 0) {
      console.log('\n✨ به‌روزرسانی محتوای صفحه Home به‌طور کامل و موفق انجام شد!');
    }
  } catch (error) {
    console.error('❌ خطای کلی:', error);
    process.exit(1);
  }
}

updateHomeContent();
