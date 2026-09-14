// ─── Process Page Content Store ──────────────────────────────────────────────
// تمام محتوای صفحه فرآیند در localStorage ذخیره می‌شود
// ویرایش ادمین → بلافاصله در سایت اعمال می‌شود

export const PROCESS_STORE_KEY = 'cn_process_content_v1';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProcessStat {
  id: string;
  value: string;
  label: string;
}

export interface ProcessOverviewItem {
  id: string;
  color: string;
  title: string;
  body: string;
}

export interface TimelineStep {
  id: string;
  number: string;
  color: string;
  title: string;
  duration: string;
  desc: string;
  deliverables: string[];
  tags: string[];
}

export interface DeliverableItem {
  id: string;
  icon: string;
  color: string;
  title: string;
  desc: string;
  features: string[];
}

export interface AudienceItem {
  id: string;
  title: string;
  desc: string;
  badge: string;
  color: string;
  criteria: string[];
}

export interface CompareRow {
  id: string;
  label: string;
  before: string;
  after: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  amount: string;
  color: string;
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface ProcessHeroContent {
  badge: string;
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trustBadges: string[];
}

export interface ProcessCtaContent {
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  btnPrimary: string;
  btnSecondary: string;
  features: string[];
}

export interface ProcessContent {
  hero: ProcessHeroContent;
  stats: ProcessStat[];
  overviewEyebrow: string;
  overviewTitle: string;
  overviewSub: string;
  overviewItems: ProcessOverviewItem[];
  timelineEyebrow: string;
  timelineTitle: string;
  timelineSub: string;
  timelineSteps: TimelineStep[];
  deliverablesEyebrow: string;
  deliverablesTitle: string;
  deliverablesSub: string;
  deliverables: DeliverableItem[];
  audienceEyebrow: string;
  audienceTitle: string;
  audienceSub: string;
  audience: AudienceItem[];
  compareEyebrow: string;
  compareTitle: string;
  compareRows: CompareRow[];
  testimonialsEyebrow: string;
  testimonialsTitle: string;
  testimonials: TestimonialItem[];
  faqEyebrow: string;
  faqTitle: string;
  faqs: FaqItem[];
  cta: ProcessCtaContent;
}

// ─── Default Content (همان محتوای فعلی صفحه) ────────────────────────────────

export const DEFAULT_PROCESS_CONTENT: ProcessContent = {
  hero: {
    badge: 'فرآیند VC-Ready سازی',
    eyebrow: 'CAPITAL NETWORK PROCESS',
    titleLine1: 'مسیر حرفه‌ای',
    titleLine2: 'جذب سرمایه',
    subtitle: 'از ایده تا Term Sheet — یک فرآیند ساختاریافته برای آماده‌سازی استارتاپ شما',
    description: 'Capital Network با تجربه بیش از ۱۰۰ پروژه موفق، یک سیستم دقیق و اثبات‌شده برای VC-Ready کردن استارتاپ‌ها دارد. از ارزیابی اولیه تا معرفی به سرمایه‌گذاران بین‌المللی.',
    ctaPrimary: 'ارزیابی رایگان استارتاپ',
    ctaSecondary: 'مشاوره رایگان',
    trustBadges: ['۱۰۰+ استارتاپ موفق', 'تیم بین‌المللی', 'اتصال به VC جهانی', 'Term Sheet تضمین‌شده'],
  },
  stats: [
    { id: 's1', value: '۱۰۰+', label: 'استارتاپ VC-Ready' },
    { id: 's2', value: '$۴۸M+', label: 'سرمایه جذب‌شده' },
    { id: 's3', value: '۳–۶ ماه', label: 'میانگین زمان فرآیند' },
    { id: 's4', value: '۹۴٪', label: 'نرخ موفقیت' },
  ],
  overviewEyebrow: 'چرا این فرآیند',
  overviewTitle: 'رویکرد ساختاریافته ما',
  overviewSub: 'Capital Network یک سیستم اثبات‌شده برای آماده‌سازی استارتاپ‌ها دارد که هر مرحله آن بر اساس صدها تجربه واقعی طراحی شده است.',
  overviewItems: [
    { id: 'ov1', color: '#00BCD4', title: 'ارزیابی دقیق آمادگی', body: 'با ابزارهای اختصاصی Capital Network، میزان آمادگی استارتاپ شما برای جذب سرمایه را با دقت بالا می‌سنجیم.' },
    { id: 'ov2', color: '#8b5cf6', title: 'مستندات VC-Grade',    body: 'Pitch Deck، مدل مالی، Executive Summary و Data Room را به استانداردهای VC بین‌المللی آماده می‌کنیم.' },
    { id: 'ov3', color: '#f59e0b', title: 'شبکه سرمایه‌گذار',   body: 'دسترسی به شبکه‌ای از ۲۰۰+ سرمایه‌گذار در ایران، منطقه و اروپا برای معرفی استراتژیک.' },
    { id: 'ov4', color: '#10b981', title: 'پشتیبانی تا Term Sheet', body: 'از اولین جلسه تا امضای Term Sheet کنارتان هستیم — مذاکره، ارزش‌گذاری، و ساختار Deal.' },
  ],
  timelineEyebrow: 'مراحل فرآیند',
  timelineTitle: '۵ مرحله تا Term Sheet',
  timelineSub: 'هر مرحله با خروجی‌های مشخص، KPI قابل اندازه‌گیری و پشتیبانی اختصاصی Capital Network.',
  timelineSteps: [
    { id: 'ts1', number: '۰۱', color: '#00BCD4', title: 'ارزیابی اولیه و Fit Test',    duration: 'هفته ۱–۲',   desc: 'اولین قدم: تشخیص واقعی اینکه آیا استارتاپ شما آماده جذب سرمایه هست. بررسی Traction، تیم، بازار، مدل کسب‌وکار و Product-Market Fit.', deliverables: ['گزارش Readiness Score', 'جدول نقاط قوت/ضعف', 'نقشه راه بهبود'], tags: ['Market Analysis', 'Team Evaluation', 'PMF Assessment'] },
    { id: 'ts2', number: '۰۲', color: '#8b5cf6', title: 'ساخت مستندات VC-Ready',       duration: 'هفته ۲–۶',   desc: 'قلب فرآیند: تولید تمام مستنداتی که سرمایه‌گذار حرفه‌ای نیاز دارد. هر سند مطابق استانداردهای Sequoia، YC و سرمایه‌گذاران منطقه.', deliverables: ['Pitch Deck (۱۲–۱۸ اسلاید)', 'مدل مالی ۳–۵ ساله', 'Executive Summary', 'Data Room کامل'], tags: ['Pitch Deck', 'Financial Model', 'Data Room'] },
    { id: 'ts3', number: '۰۳', color: '#f59e0b', title: 'آماده‌سازی برای جلسات',       duration: 'هفته ۶–۸',   desc: 'یادگیری زبان سرمایه‌گذار: چگونه در ۱۰ دقیقه ذهن سرمایه‌گذار را درگیر کنید. Mock Investor Meeting، Q&A Preparation، Objection Handling.', deliverables: ['جلسات Mock Investor', 'Q&A Bank (۵۰+ سوال)', 'Storytelling Framework'], tags: ['Investor Meeting', 'Q&A Prep', 'Storytelling'] },
    { id: 'ts4', number: '۰۴', color: '#10b981', title: 'معرفی به سرمایه‌گذاران',      duration: 'هفته ۸–۱۶',  desc: 'معرفی Warm Introduction به شبکه هدفمند سرمایه‌گذاران. هر معرفی با Research دقیق انجام می‌شود — نه ایمیل انبوه، بلکه ارتباط ارزشمند.', deliverables: ['لیست ۲۰–۵۰ سرمایه‌گذار هدف', 'Warm Introductions', 'مدیریت Pipeline'], tags: ['VC Network', 'Warm Intro', 'Deal Flow'] },
    { id: 'ts5', number: '۰۵', color: '#ef4444', title: 'مذاکره و بستن Deal',           duration: 'هفته ۱۲–۲۴', desc: 'مرحله حساس: مذاکره Valuation، ساختار Term Sheet، Cap Table و شرایط سرمایه‌گذاری. Capital Network در تمام این فرآیند کنارتان است.', deliverables: ['Term Sheet Review', 'ساختار Cap Table', 'مذاکره Valuation'], tags: ['Term Sheet', 'Valuation', 'Cap Table'] },
  ],
  deliverablesEyebrow: 'خروجی‌های ما',
  deliverablesTitle: 'چه چیزی می‌سازیم؟',
  deliverablesSub: 'هر خروجی بر اساس استانداردهای Tier-1 VC ساخته می‌شود — نه template، بلکه سفارشی برای شما.',
  deliverables: [
    { id: 'd1', icon: '📊', color: '#8b5cf6', title: 'Pitch Deck حرفه‌ای',   desc: '۱۲–۱۸ اسلاید که داستان شما را به زبانی روایت می‌کند که سرمایه‌گذار می‌فهمد.', features: ['Problem / Solution واضح', 'Market Size قابل دفاع', 'Traction شفاف', 'Financial Ask دقیق'] },
    { id: 'd2', icon: '💹', color: '#10b981', title: 'مدل مالی ۵ ساله',      desc: 'مدل Bottom-Up کامل با Scenario Analysis، Unit Economics و Runway Calculator.', features: ['Revenue Model', 'Unit Economics', 'Burn Rate & Runway', 'Series A Readiness'] },
    { id: 'd3', icon: '📋', color: '#f59e0b', title: 'Executive Summary',    desc: 'یک صفحه‌ای که اول می‌فرستید — کافی‌ست ۳ دقیقه از وقت سرمایه‌گذار بگیرید.', features: ['Hook قوی', 'Key Metrics', 'Team Highlight', 'Investment Ask'] },
    { id: 'd4', icon: '🗂️', color: '#00BCD4', title: 'Data Room کامل',       desc: 'همه مدارک Due Diligence آماده: قرارداد‌ها، Patent، Cap Table، Legal Docs.', features: ['Legal Documents', 'IP & Patents', 'Financial Audits', 'Cap Table'] },
    { id: 'd5', icon: '🎯', color: '#ef4444', title: 'VC Target List',        desc: 'لیست هدفمند سرمایه‌گذارانی که با Stage، Sector و Geography شما Match دارند.', features: ['Stage Fit', 'Sector Match', 'Warm Intro Path', 'Partner Research'] },
    { id: 'd6', icon: '🤝', color: '#6366f1', title: 'Deal Support',          desc: 'پشتیبانی حقوقی و مالی در مرحله مذاکره — تا وقتی پول به حساب نرسیده، کنارتان هستیم.', features: ['Term Sheet Review', 'Valuation Support', 'Cap Table Modeling', 'Closing Checklist'] },
  ],
  audienceEyebrow: 'برای چه کسانی',
  audienceTitle: 'آیا این فرآیند برای شما مناسب است؟',
  audienceSub: 'Capital Network با استارتاپ‌ها در مراحل مختلف کار می‌کند — اما هر مرحله نیاز به رویکرد متفاوتی دارد.',
  audience: [
    { id: 'au1', title: 'استارتاپ‌های Pre-Seed', desc: 'می‌خواهید اولین سرمایه خارجی را جذب کنید اما نمی‌دانید از کجا شروع کنید. فرآیند ما مسیر را شفاف می‌کند.', badge: 'Seed Ready',   color: '#00BCD4', criteria: ['MVP آماده', 'اولین مشتریان', 'تیم بنیان‌گذار'] },
    { id: 'au2', title: 'استارتاپ‌های Series A',  desc: 'Traction دارید، حالا وقت Scale است. مستندات و ارائه شما باید سطح بالاتری داشته باشد.',                    badge: 'Growth Stage', color: '#8b5cf6', criteria: ['$100K+ MRR', 'تیم ۱۰+ نفر', 'مدل تکرارپذیر'] },
    { id: 'au3', title: 'شرکت‌های SME',           desc: 'کسب‌وکار سنتی که می‌خواهد برای رشد یا توسعه بین‌المللی، سرمایه جذب کند.',                                 badge: 'Scale Up',    color: '#f59e0b', criteria: ['سودده', 'بازار قابل توسعه', 'تیم مدیریت'] },
  ],
  compareEyebrow: 'قبل و بعد',
  compareTitle: 'تفاوت با و بدون Capital Network',
  compareRows: [
    { id: 'cr1', label: 'Pitch Deck', before: 'Canva template',    after: 'VC-Grade ۱۸ اسلاید' },
    { id: 'cr2', label: 'مدل مالی',   before: 'Excel ساده',         after: 'Bottom-up 5-Year Model' },
    { id: 'cr3', label: 'ارزش‌گذاری', before: 'حدس و گمان',         after: 'Comparable + DCF' },
    { id: 'cr4', label: 'معرفی',      before: 'Cold Email',         after: 'Warm Introduction' },
    { id: 'cr5', label: 'مذاکره',     before: 'بدون مشاور',          after: 'Capital Network همراه شما' },
    { id: 'cr6', label: 'Data Room',  before: 'پراکنده و ناقص',     after: 'Organized & Complete' },
  ],
  testimonialsEyebrow: 'نتایج واقعی',
  testimonialsTitle: 'موفقیت‌های مشتریان ما',
  testimonials: [
    { id: 'tm1', name: 'آرش محمدی',    role: 'Co-Founder', company: 'FinTech Startup', quote: 'قبل از همکاری با Capital Network، ۶ ماه وقت تلف کردم. بعد از ۴ ماه با آنها، Term Sheet از یک صندوق اروپایی گرفتم.', amount: '$1.2M Seed',  color: '#00BCD4' },
    { id: 'tm2', name: 'سارا حسینی',   role: 'CEO',        company: 'HealthTech',      quote: 'Pitch Deck ما را کاملاً بازنویسی کردند. نتیجه؟ نرخ پاسخ از ۵٪ به ۳۵٪ رسید. Capital Network سرمایه‌گذاران را می‌شناسند.', amount: '$800K Pre-A', color: '#8b5cf6' },
    { id: 'tm3', name: 'دانیال رضایی', role: 'Founder',    company: 'SaaS B2B',        quote: 'مدل مالی آنها واقعاً VC-Grade بود. در جلسه Due Diligence، مشاور صندوق گفت این بهترین مدلی‌ست که در ۳ سال دیده است.', amount: '$2M Series A', color: '#f59e0b' },
  ],
  faqEyebrow: 'سوالات متداول',
  faqTitle: 'جواب سوال‌های شما اینجاست',
  faqs: [
    { id: 'fq1', q: 'چقدر طول می‌کشد تا VC-Ready شویم?', a: 'میانگین فرآیند کامل ۳–۶ ماه است. اما اگر تیم و محصول آماده باشند، می‌توان مستندات اولیه را در ۴–۶ هفته آماده کرد.' },
    { id: 'fq2', q: 'آیا تضمین می‌دهید که سرمایه جذب کنیم?', a: 'هیچ‌کس نمی‌تواند تضمین ۱۰۰٪ بدهد. اما Capital Network تضمین می‌دهد که مستندات، شبکه و پشتیبانی کاملاً در اختیار شما قرار می‌گیرد. نرخ موفقیت مشتریان ما ۹۴٪ است.' },
    { id: 'fq3', q: 'برای چه Stage ای مناسب هستید?', a: 'اکثر مشتریان ما Pre-Seed تا Series A هستند. اما با SME ها و شرکت‌هایی که می‌خواهند Private Equity جذب کنند هم کار می‌کنیم.' },
    { id: 'fq4', q: 'چگونه با ما همکاری شروع می‌شود?', a: 'با یک جلسه ارزیابی رایگان ۴۵ دقیقه‌ای شروع می‌کنیم. در این جلسه وضعیت فعلی را بررسی می‌کنیم و یک Roadmap شخصی‌سازی‌شده ارائه می‌دهیم.' },
    { id: 'fq5', q: 'هزینه همکاری چقدر است?', a: 'مدل قیمت‌گذاری ما ترکیبی از Retainer + Success Fee است. هزینه‌های دقیق بر اساس Stage، نیاز و پیچیدگی پروژه در جلسه اولیه بررسی می‌شود.' },
    { id: 'fq6', q: 'چقدر با سرمایه‌گذار خارجی ارتباط دارید?', a: 'Capital Network دسترسی مستقیم به ۲۰۰+ صندوق و سرمایه‌گذار در ایران، منطقه MENA، اروپا و آمریکا دارد. معرفی‌های ما Warm و هدفمند است.' },
  ],
  cta: {
    badge: 'شروع کنید',
    title: 'آماده‌اید مسیر جذب سرمایه را ',
    titleHighlight: 'جدی بگیرید؟',
    description: 'یک جلسه ارزیابی رایگان ۴۵ دقیقه‌ای — وضعیت فعلی، شکاف‌ها و نقشه راه شخصی‌سازی‌شده شما.',
    btnPrimary: 'ارزیابی رایگان استارتاپم',
    btnSecondary: 'تماس با تیم ما',
    features: ['بدون تعهد اولیه', 'جلسه ۴۵ دقیقه‌ای', 'نقشه راه رایگان', 'پاسخ در ۲۴ ساعت'],
  },
};

// ─── Store helpers ────────────────────────────────────────────────────────────

export function loadProcessContent(): ProcessContent {
  try {
    const raw = localStorage.getItem(PROCESS_STORE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_PROCESS_CONTENT));
    return JSON.parse(raw) as ProcessContent;
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_PROCESS_CONTENT));
  }
}

export function saveProcessContent(content: ProcessContent): void {
  localStorage.setItem(PROCESS_STORE_KEY, JSON.stringify(content));
  window.dispatchEvent(new StorageEvent('storage', { key: PROCESS_STORE_KEY }));
}

export function resetProcessContent(): void {
  localStorage.removeItem(PROCESS_STORE_KEY);
  window.dispatchEvent(new StorageEvent('storage', { key: PROCESS_STORE_KEY }));
}
