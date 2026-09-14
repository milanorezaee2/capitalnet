
import { t } from '@/i18n';

// ─── Service Sub-Page Store ────────────────────────────────────────────────────
// Manages dynamically created service sub-pages (e.g. "مشاوره مالی", "Pitch Deck")
// Persisted in localStorage. Used by both the admin panel and the public site.

export type SectionType =
  | 'hero'
  | 'introduction'
  | 'categories'
  | 'features'
  | 'benefits'
  | 'whyChooseUs'
  | 'process'
  | 'deliverables'
  | 'technologies'
  | 'pricing'
  | 'comparison'
  | 'portfolio'
  | 'caseStudies'
  | 'statistics'
  | 'clientLogos'
  | 'testimonials'
  | 'team'
  | 'faq'
  | 'cta'
  | 'newsletter'
  | 'richText'
  | 'imageGallery'
  | 'videoEmbed'
  | 'divider';

export interface SubPageSection {
  id: string;
  type: SectionType;
  visible: boolean;
  /** Arbitrary per-section content blob */
  data: Record<string, unknown>;
}

export interface ServiceSubPage {
  id: string;
  slug: string;
  name: string;          // نام نمایشی (در منو و عنوان)
  description: string;   // توضیح کوتاه
  icon: string;          // emoji یا نام آیکون
  color: string;         // رنگ تم (hex)
  visible: boolean;      // نمایش در منو
  sections: SubPageSection[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'cn_service_subpages_v1';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadSubPages(): ServiceSubPage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ServiceSubPage[];
  } catch {
    return [];
  }
}

export function saveSubPages(pages: ServiceSubPage[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}

export function createSubPage(name: string): ServiceSubPage {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
    .slice(0, 60)
    || `service-${uid()}`;

  const page: ServiceSubPage = {
    id: uid(),
    slug,
    name,
    description: '',
    icon: '📄',
    color: '#00BCD4',
    visible: true,
    sections: [
      makeDefaultSection('hero'),
      makeDefaultSection('introduction'),
      makeDefaultSection('features'),
      makeDefaultSection('cta'),
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const all = loadSubPages();
  all.push(page);
  saveSubPages(all);
  return page;
}

export function updateSubPage(updated: ServiceSubPage): void {
  const all = loadSubPages().map(p =>
    p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p
  );
  saveSubPages(all);
}

export function deleteSubPage(id: string): void {
  saveSubPages(loadSubPages().filter(p => p.id !== id));
}

// ─── Default section data per type ──────────────────────────────────────────
export function makeDefaultSection(type: SectionType): SubPageSection {
  const defaults: Record<SectionType, Record<string, unknown>> = {
    hero: {
      badge: t("خدمات تخصصی"),
      eyebrow: 'CAPITAL NETWORK',
      title: t("عنوان صفحه خدمت"),
      subtitle: t("زیرعنوان جذاب برای این خدمت"),
      description: t("توضیحات کامل‌تر درباره این خدمت و ارزشی که ارائه می‌دهد."),
      ctaPrimary: t("شروع رایگان"),
      ctaSecondary: t("تماس با ما"),
      trustBadges: [t("امنیت کامل"), t("پشتیبانی ۲۴/۷"), t("تضمین کیفیت")],
    },
    introduction: {
      title: t("معرفی خدمت"),
      description: t("توضیحات مفصل درباره این خدمت و مزایای آن."),
      uses: [t("کاربرد اول"), t("کاربرد دوم")],
      audience: [t("استارتاپ‌ها"), t("شرکت‌های نوپا")],
      value: [t("ارزش اول"), t("ارزش دوم")],
      advantages: [t("مزیت اول"), t("مزیت دوم")],
    },
    categories: { items: [] },
    features: { items: [] },
    benefits: { items: [] },
    whyChooseUs: {
      title: t("چرا ما را انتخاب کنید؟"),
      description: t("دلایل انتخاب ما"),
      items: [],
    },
    process: { steps: [] },
    deliverables: { items: [] },
    technologies: { items: [] },
    pricing: { plans: [] },
    comparison: {
      title: t("مقایسه پلن‌ها"),
      description: '',
      columns: [t("ویژگی"), t("پایه"), t("حرفه‌ای"), t("سازمانی")],
      rows: [],
    },
    portfolio: { items: [] },
    caseStudies: { items: [] },
    statistics: { items: [] },
    clientLogos: { items: [] },
    testimonials: { items: [] },
    team: { members: [] },
    faq: { items: [] },
    cta: {
      title: t("آماده شروع هستید؟"),
      description: t("همین امروز با ما تماس بگیرید."),
      primaryLabel: t("شروع رایگان"),
      primaryLink: '/evaluation',
      secondaryLabel: t("تماس با ما"),
      secondaryLink: '/contact',
      enabled: true,
    },
    newsletter: {
      title: t("عضویت در خبرنامه"),
      description: t("آخرین اخبار را دریافت کنید."),
      placeholder: t("ایمیل شما..."),
      buttonLabel: t("عضویت"),
      enabled: true,
    },
    richText: {
      content: t("<p>متن دلخواه خود را اینجا بنویسید...</p>"),
    },
    imageGallery: {
      images: [],
      columns: 3,
    },
    videoEmbed: {
      url: '',
      caption: '',
    },
    divider: {
      style: 'line',
      spacing: 'md',
    },
  };

  return {
    id: uid(),
    type,
    visible: true,
    data: defaults[type] ?? {},
  };
}

export const SECTION_META: Record<SectionType, { label: string; icon: string; color: string }> = {
  hero:         { label: 'هدر / Hero',          icon: '🌟', color: '#8b5cf6' },
  introduction: { label: 'معرفی خدمت',           icon: '📝', color: '#3b82f6' },
  categories:   { label: 'دسته‌بندی‌ها',          icon: '🏷️', color: '#06b6d4' },
  features:     { label: 'ویژگی‌ها',             icon: '⚡', color: '#f59e0b' },
  benefits:     { label: 'مزایا',                icon: '✨', color: '#10b981' },
  whyChooseUs:  { label: 'چرا ما؟',              icon: '🛡️', color: '#6366f1' },
  process:      { label: 'فرآیند کار',            icon: '🔄', color: '#f97316' },
  deliverables: { label: 'خروجی‌ها',             icon: '📦', color: '#14b8a6' },
  technologies: { label: 'تکنولوژی‌ها',           icon: '⚙️', color: '#64748b' },
  pricing:      { label: 'قیمت‌گذاری',            icon: '💰', color: '#22c55e' },
  comparison:   { label: 'جدول مقایسه',           icon: '📊', color: '#ec4899' },
  portfolio:    { label: 'نمونه‌کارها',           icon: '🖼️', color: '#f43f5e' },
  caseStudies:  { label: 'مطالعات موردی',         icon: '📈', color: '#1d4ed8' },
  statistics:   { label: 'آمار و ارقام',          icon: '📉', color: '#059669' },
  clientLogos:  { label: 'لوگوی مشتریان',        icon: '🏢', color: '#6b7280' },
  testimonials: { label: 'نظرات مشتریان',         icon: '💬', color: '#a855f7' },
  team:         { label: 'تیم ما',               icon: '👥', color: '#0891b2' },
  faq:          { label: 'سوالات متداول',         icon: '❓', color: '#ca8a04' },
  cta:          { label: 'CTA / فراخوان',        icon: '🚀', color: '#ef4444' },
  newsletter:   { label: 'خبرنامه',              icon: '📧', color: '#f97316' },
  richText:     { label: 'متن آزاد',             icon: '✍️', color: '#64748b' },
  imageGallery: { label: 'گالری تصاویر',         icon: '🖼️', color: '#8b5cf6' },
  videoEmbed:   { label: 'ویدیو',                icon: '▶️', color: '#dc2626' },
  divider:      { label: 'خط جداکننده',          icon: '➖', color: '#374151' },
};
