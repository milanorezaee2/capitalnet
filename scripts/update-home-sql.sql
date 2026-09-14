-- ============================================================================
-- تحدیث محتوای صفحه Home بطور حرفه‌ای
-- کپیتال نتورک - به‌روزرسانی تمام سکشن‌های صفحه Home
-- ============================================================================

-- ── Hero Section ──────────────────────────────────────────────────────────
UPDATE site_settings SET value = 'اتصال مستقیم به ۱۲۸+ VC Tier-1' WHERE key = 'home_hero_badge';
UPDATE site_settings SET value = 'سرمایه‌گذاری درست، در زمان درست' WHERE key = 'home_hero_tagline';
UPDATE site_settings SET value = 'ما استارتاپ‌های ممتاز را به شبکه اختصاصی سرمایه‌گذاران Tier-1 معرفی می‌کنیم. از آماده‌سازی VC-Ready تا بستن توافق، کنارتان هستیم.' WHERE key = 'home_hero_desc';
UPDATE site_settings SET value = 'شروع فرآیند جذب سرمایه' WHERE key = 'home_hero_cta1';
UPDATE site_settings SET value = 'درخواست مشاوره فوری' WHERE key = 'home_hero_cta2';

-- Home Stats
UPDATE site_settings SET value = '[{"value":"۱۲۸+","label":"شبکه اختصاصی VC در ۵ قاره"},{"value":"۴۰ روز","label":"میانگین رسیدن به Term Sheet"},{"value":"۹۲٪","label":"نرخ موفقیت معرفی‌های ما"}]' WHERE key = 'home_stats';

-- ── Network Section ───────────────────────────────────────────────────────
UPDATE site_settings SET value = 'شبکه جهانی سرمایه‌گذاران' WHERE key = 'home_network_title';
UPDATE site_settings SET value = 'دسترسی مستقیم به سرمایه‌گذاران Tier-1 و استراتژیک در 5 قاره. بیش از ۱۲۸ VC فعال با روابط درون شرکتی و تاریخ قابل‌اعتماد.' WHERE key = 'home_network_desc';
UPDATE site_settings SET value = '[{"value":"۵ قاره","label":"حضور جهانی شبکه"},{"value":"۱۲۸+","label":"سرمایه‌گذار Tier-1 فعال"},{"value":"$۲۵B+","label":"اختیار سرمایه کل"}]' WHERE key = 'home_network_stats';

-- ── Services Section ──────────────────────────────────────────────────────
UPDATE site_settings SET value = 'خدمات یکپارچه' WHERE key = 'home_services_badge';
UPDATE site_settings SET value = 'از آماده‌سازی تا بستن معامله' WHERE key = 'home_services_title';
UPDATE site_settings SET value = 'ما فقط معرفی‌کننده نیستیم. کل فرآیند جذب سرمایه را مهندسی می‌کنیم تا با بهترین Valuation و حداقل Dilution راند را ببندید.' WHERE key = 'home_services_desc';

-- ── WhyUs Section ─────────────────────────────────────────────────────────
UPDATE site_settings SET value = 'چرا کپیتال نتورک؟' WHERE key = 'home_why_us_badge';
UPDATE site_settings SET value = 'متفاوت از هر چیزی که تا‌کنون دیده‌اید' WHERE key = 'home_why_us_title';
UPDATE site_settings SET value = 'ما یک پل هستیم. بین استارتاپ‌های آماده رشد و سرمایه‌گذارانی که به دنبال فرصت‌های واقعی می‌گردند.' WHERE key = 'home_why_us_desc';

UPDATE site_settings SET value = '[
  {"title":"شبکه اختصاصی","desc":"دسترسی مستقیم به ۱۲۸+ VC و CVC با روابط واقعی و تاریخ قابل‌اعتماد، نه فهرست‌های عمومی."},
  {"title":"تطابق هوشمند","desc":"معرفی بر اساس Thesis واقعی، Stage رشد و چکسایز هر سرمایه‌گذار — نه ایمیل کور."},
  {"title":"همراهی تا بستن","desc":"از Term Sheet تا امضای نهایی کنارتان هستیم. مذاکره، Due Diligence و Closing."},
  {"title":"سرعت اثبات‌شده","desc":"میانگین ۴۰ روز از معرفی اول تا Term Sheet. ۹۲٪ نرخ موفقیت معرفی‌های ما."}
]' WHERE key = 'home_why_us';

-- ── Process Section ───────────────────────────────────────────────────────
UPDATE site_settings SET value = 'فرآیند جذب سرمایه' WHERE key = 'home_process_section_badge';
UPDATE site_settings SET value = 'از جلسه اول تا بستن Term Sheet' WHERE key = 'home_process_section_title';
UPDATE site_settings SET value = 'فرآیند شفاف، مرحله‌به‌مرحله. میانگین ۴۰ روز تا بستن معامله — بدون اتلاف وقت شما و سرمایه‌گذار.' WHERE key = 'home_process_section_desc';
UPDATE site_settings SET value = 'درخواست مشاوره رایگان' WHERE key = 'home_process_section_cta';
UPDATE site_settings SET value = '۳۰-۴۰ روز' WHERE key = 'home_process_avg_days';

UPDATE site_settings SET value = '[
  {"title":"ارزیابی و آماده‌سازی","text":"جلسه استراتژیک شامل بررسی شاخص‌ها، شناسایی Gaps و ساخت پکیج سرمایه‌بندی کامل.","icon":"layers"},
  {"title":"معرفی و جلسات","text":"معرفی هدفمند به سرمایه‌گذاران مناسب، هماهنگی جلسات و آماده‌سازی Pitch.","icon":"users"},
  {"title":"مذاکره و بستن","text":"مذاکره روی شرایط Term Sheet، تحلیل Red Flags و همراهی حقوقی تا Closing.","icon":"check"}
]' WHERE key = 'home_process_steps';

-- ── Ready Section ─────────────────────────────────────────────────────────
UPDATE site_settings SET value = 'آمادگی برای راند بعدی؟' WHERE key = 'home_ready_title';
UPDATE site_settings SET value = 'تیم ما با ۱۵+ سال تجربه در تامین مالی، استراتژی و مذاکره، همراه شما تا رسیدن به اهداف سرمایه‌گذاری است.' WHERE key = 'home_ready_desc';

-- ── Blog Preview Section ──────────────────────────────────────────────────
UPDATE site_settings SET value = 'آخرین مقالات و بینش' WHERE key = 'home_blog_preview_badge';
UPDATE site_settings SET value = 'دانش، تجربه و استراتژی سرمایه‌گذاری' WHERE key = 'home_blog_preview_title';
UPDATE site_settings SET value = 'دیدن تمام مقالات' WHERE key = 'home_blog_preview_btn';

-- ── FAQ Section ───────────────────────────────────────────────────────────
UPDATE site_settings SET value = 'سوالات متداول' WHERE key = 'home_faq_badge';
UPDATE site_settings SET value = 'هر چیزی که باید بدانید' WHERE key = 'home_faq_title';
UPDATE site_settings SET value = 'پاسخ‌های کامل به سوالات رایج استارتاپ‌ها درباره فرآیند جذب سرمایه.' WHERE key = 'home_faq_desc';

UPDATE site_settings SET value = '[
  {"q":"کپیتال نتورک چه خدماتی ارائه می‌دهد؟","a":"ما یک شریک استراتژیک برای استارتاپ‌های در حال رشد هستیم. Pitch Deck حرفه‌ای، مدل مالی دقیق، Data Room آماده، معرفی هدفمند به VC‌های Tier-1 و پشتیبانی کامل در مذاکره و بستن معامله را ارائه می‌دهیم."},
  {"q":"آیا برای تمام مراحل رشد مناسب هستید؟","a":"بله. ما استارتاپ‌ها را از Pre-Seed تا Series B پشتیبانی می‌کنیم. بسته خدمات بر اساس مرحله رشد، نیاز سرمایه و اهداف استراتژیک هر شرکت سفارشی می‌شود."},
  {"q":"فرآیند همکاری چگونه شروع می‌شود؟","a":"اول یک جلسه ارزیابی رایگان ۳۰ دقیقه‌ای برگزار می‌کنیم. سپس وضعیت فعلی را بررسی می‌کنیم، Gaps را شناسایی می‌کنیم و یک نقشه راه سفارشی برای VC-Ready شدن تهیه می‌کنیم."},
  {"q":"میانگین زمان بستن راند چقدر است؟","a":"با کمک کپیتال نتورک، میانگین ۴۰ روز از اولین جلسه تا Term Sheet است — در حالی که میانگین صنعت ۶ تا ۹ ماه می‌باشد."},
  {"q":"با چه نوع سرمایه‌گذارانی در ارتباط هستید؟","a":"ما با ۱۲۸+ سرمایه‌گذار Tier-1 در MENA، اروپا و آمریکا در ارتباط فعال‌اند. شبکه ما صندوق‌های VC، Family Offices، Corporate VCs و Strategic Investors را شامل می‌شود."},
  {"q":"هزینه خدمات چقدر است؟","a":"بسته‌های خدماتی ما متفاوت است. در جلسه ارزیابی رایگان، نیاز‌های شما را بررسی می‌کنیم و بهترین و مقرون‌به‌صرفه‌ترین گزینه را پیشنهاد می‌دهیم."}
]' WHERE key = 'home_faq_items';

-- ── Testimonials (اختیاری) ───────────────────────────────────────────────
UPDATE site_settings SET value = 'نظرات و تجربیات' WHERE key = 'home_testimonials_badge';
UPDATE site_settings SET value = '۵۰+ شرکت موفق از خدمات کپیتال نتورک استفاده کردند' WHERE key = 'home_testimonials_heading';
UPDATE site_settings SET value = 'بنیان‌گذاران و سرمایه‌گذاران موفق بر سرعت، حرفه‌ای‌گری و اثربخشی خدمات ما تاکید می‌کنند.' WHERE key = 'home_testimonials_desc';

-- ============================================================================
-- تکمیل: تمام محتوای صفحه Home به‌روزرسانی شد
-- ============================================================================
