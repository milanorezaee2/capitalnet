// ─── Site Settings API ────────────────────────────────────────────────────────
import type { ReactNode } from 'react';
import { supabase } from './supabaseApi';

// ── Popup Ads ─────────────────────────────────────────────────────────────────
export type PopupTrigger = 'on_load' | 'on_exit' | 'on_scroll' | 'on_section';
export type PopupPosition = 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center';
export type PopupAnimation = 'zoom' | 'slide-up' | 'slide-down' | 'fade' | 'flip';

/** سکشن‌های قابل هدف‌گیری روی سایت */
export type SiteSection =
  | 'home:hero'
  | 'home:network'
  | 'home:services'
  | 'home:why-us'
  | 'home:cta'
  | 'home:process'
  | 'home:client-showcase'
  | 'home:testimonials'
  | 'home:blog-preview'
  | 'home:faq'
  | 'page:services'
  | 'page:process'
  | 'page:blog'
  | 'page:about'
  | 'page:contact'
  | 'page:evaluation'
  | 'global';

export interface PopupAd {
  id:          string;
  title:       string;
  body:        string;
  /** لینک دکمه (اختیاری) */
  cta_text?:   string;
  cta_url?:    string;
  /** رنگ برند (hex) */
  accent_color: string;
  /** باج / برچسب کوچک بالای پاپ‌آپ */
  badge?:      string;
  /** emoji یا آیکون */
  icon?:       string;
  /** نمایش فعال؟ */
  visible:     boolean;
  /** تریگر نمایش */
  trigger:     PopupTrigger;
  /** چند ثانیه بعد از تریگر نمایش داده شود (برای on_load / on_scroll) */
  delay_sec:   number;
  /** محل نمایش */
  position:    PopupPosition;
  /** انیمیشن ورود */
  animation:   PopupAnimation;
  /** سکشن‌هایی که این پاپ‌آپ در آن‌ها نمایش داده می‌شود */
  sections:    SiteSection[];
  /** حداکثر دفعات نمایش به هر کاربر (0 = بی‌نهایت) */
  max_shows:   number;
  /** روزهایی که پاپ آپ نمایش داده می‌شود (0=هر روز) */
  show_every_days: number;
}

// ── Font-size type ────────────────────────────────────────────────────────────
export type FontSize =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30;

// ── Social network icon type ──────────────────────────────────────────────────
export type SocialNetwork = 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'telegram' | 'whatsapp' | 'facebook' | 'tiktok';

export interface SocialFloatItem {
  network: SocialNetwork;
  url: string;
  active: boolean;
}

// ── Home Section Builder types ────────────────────────────────────────────────

/** کلیدهای سکشن‌های ثابت (built-in) صفحه Home */
export type BuiltInSectionKey =
  | 'hero'
  | 'network'
  | 'services'
  | 'branding'
  | 'why-us'
  | 'evaluation'
  | 'cta'
  | 'process'
  | 'client-showcase'
  | 'testimonials'
  | 'blog-preview'
  | 'faq';

const ALL_BUILT_IN_SECTION_KEYS: BuiltInSectionKey[] = [
  'hero',
  'network',
  'services',
  'branding',
  'why-us',
  'evaluation',
  'cta',
  'process',
  'client-showcase',
  'testimonials',
  'blog-preview',
  'faq',
];

function asArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function asFontSize(value: unknown, fallback: FontSize): FontSize {
  if (typeof value === 'number') return value as FontSize;
  if (typeof value === 'string' && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(value)) {
    return value as FontSize;
  }
  return fallback;
}

function asTextAlign(value: unknown, fallback: TextAlign): TextAlign {
  return value === 'right' || value === 'center' || value === 'left' ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item): item is string => typeof item === 'string');
}

function asPageStats(value: unknown, fallback: PageStat[]): PageStat[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      value: asString(item.value, ''),
      label: asString(item.label, ''),
      value_fs: asFontSize(item.value_fs, 'h3'),
      value_align: asTextAlign(item.value_align, 'right'),
      label_fs: asFontSize(item.label_fs, 'p'),
      label_align: asTextAlign(item.label_align, 'right'),
    }));
}

function asWhyUsItems(value: unknown, fallback: WhyUsItem[]): WhyUsItem[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      title: asString(item.title, ''),
      desc: asString(item.desc, ''),
      title_fs: asFontSize(item.title_fs, 'h4'),
      title_align: asTextAlign(item.title_align, 'right'),
      desc_fs: asFontSize(item.desc_fs, 'p'),
      desc_align: asTextAlign(item.desc_align, 'right'),
    }));
}

function asProcessSteps(value: unknown, fallback: ProcessStep[]): ProcessStep[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      title: asString(item.title, ''),
      text: asString(item.text, ''),
      icon: typeof item.icon === 'string' ? item.icon : undefined,
      title_fs: asFontSize(item.title_fs, 'h4'),
      title_align: asTextAlign(item.title_align, 'right'),
      text_fs: asFontSize(item.text_fs, 'p'),
      text_align: asTextAlign(item.text_align, 'right'),
    }));
}

function asServiceCards(value: unknown, fallback: ServiceCard[]): ServiceCard[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      phase: asString(item.phase, ''),
      title: asString(item.title, ''),
      desc: asString(item.desc, ''),
      features: Array.isArray(item.features)
        ? item.features.filter((feature): feature is string => typeof feature === 'string')
        : [],
      popular: asBoolean(item.popular, false),
      icon: item.icon as ReactNode | undefined,
      align: asTextAlign(item.align, 'right'),
      phase_fs: asFontSize(item.phase_fs, 'h6'),
      phase_align: asTextAlign(item.phase_align, 'right'),
      title_fs: asFontSize(item.title_fs, 'h3'),
      title_align: asTextAlign(item.title_align, 'right'),
      desc_fs: asFontSize(item.desc_fs, 'p'),
      desc_align: asTextAlign(item.desc_align, 'right'),
    }));
}

function asServicePackages(value: unknown, fallback: ServicePackage[]): ServicePackage[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      title: asString(item.title, ''),
      description: asString(item.description, ''),
      items: Array.isArray(item.items)
        ? item.items.filter((entry): entry is string => typeof entry === 'string')
        : [],
      title_fs: asFontSize(item.title_fs, 'h4'),
      title_align: asTextAlign(item.title_align, 'right'),
      description_fs: asFontSize(item.description_fs, 'p'),
      description_align: asTextAlign(item.description_align, 'right'),
    }));
}

function asAboutCard(value: unknown, fallback: AboutCard): AboutCard {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;
  const item = value as Record<string, unknown>;
  return {
    title: asString(item.title, ''),
    text: asString(item.text, ''),
    title_fs: asFontSize(item.title_fs, 'h4'),
    title_align: asTextAlign(item.title_align, 'right'),
    text_fs: asFontSize(item.text_fs, 'p'),
    text_align: asTextAlign(item.text_align, 'right'),
  };
}

function asFaqItems(value: unknown, fallback: FaqItem[]): FaqItem[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      q: asString(item.q, ''),
      a: asString(item.a, ''),
      q_fs: asFontSize(item.q_fs, 'h5'),
      q_align: asTextAlign(item.q_align, 'right'),
      a_fs: asFontSize(item.a_fs, 'p'),
      a_align: asTextAlign(item.a_align, 'right'),
    }));
}

function asShowcaseCards(value: unknown, fallback: ShowcaseCardData[]): ShowcaseCardData[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      name: asString(item.name, ''),
      brandSlogan: asString(item.brandSlogan, ''),
      tagline: asString(item.tagline, ''),
      badge: asString(item.badge, ''),
      stat: asString(item.stat, ''),
      statLabel: asString(item.statLabel, ''),
      domain: asString(item.domain, ''),
      backTitle: asString(item.backTitle, ''),
      backDesc: asString(item.backDesc, ''),
      accentColor: asString(item.accentColor, '#14b8a6'),
    }));
}

function asCyjSteps(value: unknown, fallback: CyjStep[]): CyjStep[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      id: asString(item.id, ''),
      title: asString(item.title, ''),
      desc: asString(item.desc, ''),
    }));
}

function asCyjCards(value: unknown, fallback: CyjCard[]): CyjCard[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      id: asString(item.id, ''),
      title: asString(item.title, ''),
      desc: asString(item.desc, ''),
      icon: asString(item.icon, ''),
      link: asString(item.link, ''),
      visible: asBoolean(item.visible, true),
    }));
}

function asHomeSections(value: unknown, fallback: HomeSection[]): HomeSection[] {
  if (!Array.isArray(value)) return fallback;

  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item, index) => ({
      id: typeof item.id === 'string' && item.id ? item.id : `section-${index}`,
      type: typeof item.type === 'string' ? item.type : 'custom',
      label: typeof item.label === 'string' ? item.label : 'Section',
      visible: typeof item.visible === 'boolean' ? item.visible : true,
      blocks: Array.isArray(item.blocks) ? (item.blocks as HomeSectionBlock[]) : [],
    }));
}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type TextAlign = 'right' | 'center' | 'left';

/** یک بلاک محتوایی داخل یک سکشن */
export type HomeSectionBlock =
  | { type: 'heading';  id: string; text: string; level: HeadingLevel; align: TextAlign }
  | { type: 'text';     id: string; text: string; level?: HeadingLevel; align: TextAlign }
  | { type: 'badge';    id: string; text: string; align?: TextAlign }
  | { type: 'stat';     id: string; value: string; label: string; align?: TextAlign }
  | { type: 'button';   id: string; text: string; variant: 'primary'|'outline'; href: string; align?: TextAlign }
  | { type: 'divider';  id: string }
  | { type: 'media';    id: string; src: string; alt: string; kind: 'emoji'|'gif'|'sticker'|'image'; align?: TextAlign }
  | { type: 'cards';    id: string; items: Array<{ title: string; desc: string; titleLevel?: HeadingLevel; align?: TextAlign }>; align?: TextAlign }
  | { type: 'steps';    id: string; items: Array<{ title: string; text: string; titleLevel?: HeadingLevel; align?: TextAlign }>; align?: TextAlign }
  | {
      type: 'video';
      id: string;
      /** URL یوتیوب، ویمئو، یا فایل مستقیم mp4 */
      src: string;
      /** عنوان نمایشی (اختیاری) */
      caption?: string;
      /** نسبت تصویر: 16:9 | 9:16 | 4:3 | 1:1 */
      ratio: '16:9' | '9:16' | '4:3' | '1:1';
      /** نمایش در همان صفحه (embed) یا لینک خارجی */
      displayMode: 'embed' | 'lightbox';
      align?: TextAlign;
    }
  | {
      type: 'image-gallery';
      id: string;
      /** حالت نمایش: single یا slider */
      mode: 'single' | 'slider';
      items: Array<{
        src: string;
        alt: string;
        caption?: string;
      }>;
      /** نسبت تصویر */
      ratio: '16:9' | '4:3' | '1:1' | 'free';
      /** نمایش با lightbox روی کلیک */
      lightbox: boolean;
      align?: TextAlign;
    };

/** یک سکشن کامل در صفحه Home */
export interface HomeSection {
  id:       string;   // uuid تولید شده در ادمین
  type:     string;   // نوع پیش‌ساخته: 'hero' | 'stats' | 'why-us' | 'process' | 'cta' | 'custom'
  label:    string;   // نام نمایشی در ادمین
  visible:  boolean;  // نمایش داده شود؟
  blocks:   HomeSectionBlock[];
}

export interface FooterLink {
  label: string;
  page: string;
  visible: boolean;
  anchor?: string;
  category?: string;
}

export interface FooterTermsModalSection {
  title: string;
  body: string;
}

export interface FooterColumnGroup {
  title: string;
  links: FooterLink[];
}

export interface MobilePalette {
  primary: string;
  accent: string;
  glass: string;
}

// ── Page content types ────────────────────────────────────────────────────────
export interface PageStat {
  value:        string;
  label:        string;
  value_fs?:    FontSize;
  value_align?: TextAlign;
  label_fs?:    FontSize;
  label_align?: TextAlign;
}

export interface WhyUsItem {
  title:       string;
  desc:        string;
  title_fs?:   FontSize;
  title_align?: TextAlign;
  desc_fs?:    FontSize;
  desc_align?: TextAlign;
}

export interface ProcessStep {
  title:       string;
  text:        string;
  icon?:       string;   // نام آیکون: 'layers' | 'users' | 'check' | 'target' | 'zap' | 'star' | 'shield' | 'trending'
  title_fs?:   FontSize;
  title_align?: TextAlign;
  text_fs?:    FontSize;
  text_align?: TextAlign;
}

export interface ServicePackage {
  title:             string;
  description:       string;
  items:             string[];
  title_fs?:         FontSize;
  title_align?:      TextAlign;
  description_fs?:   FontSize;
  description_align?: TextAlign;
}

export interface ServiceCard {
  phase:         string;
  title:         string;
  desc:          string;
  features:      string[];
  popular:       boolean;
  icon?:         ReactNode;
  align?:        TextAlign;
  phase_fs?:     FontSize;
  phase_align?:  TextAlign;
  title_fs?:     FontSize;
  title_align?:  TextAlign;
  desc_fs?:      FontSize;
  desc_align?:   TextAlign;
}

export interface AboutCard {
  title:        string;
  text:         string;
  title_fs?:    FontSize;
  title_align?: TextAlign;
  text_fs?:     FontSize;
  text_align?:  TextAlign;
}

export interface FaqItem {
  q:        string;
  a:        string;
  q_fs?:    FontSize;
  q_align?: TextAlign;
  a_fs?:    FontSize;
  a_align?: TextAlign;
}

// ── About Page full-content types ────────────────────────────────────────────
export interface AboutPageParagraph {
  id:      string;
  text:    string;
  visible: boolean;
}

export interface AboutPageSection {
  id:         string;
  title:      string;
  icon:       string;   // key: 'target' | 'users' | 'trending' | 'briefcase' | 'shield' | 'star' | 'check' | 'book'
  accent:     boolean;  // amber (true) vs cyan (false)
  paragraphs: AboutPageParagraph[];
  visible:    boolean;
  quoteText?: string;   // متن quote box (اختیاری)
  quoteAccent?: boolean; // رنگ quote (amber اگر true، cyan اگر false)
}

export interface TeamMemberFull {
  id:      string;
  name:    string;
  role:    string;
  bio:     string;
  avatar?: string;
  visible: boolean;
}

// ── Contact Page full-content types ──────────────────────────────────────────
export interface ContactStatItem {
  id:      string;
  icon:    string;   // 'clock' | 'check' | 'shield' | 'users' | 'zap' | 'phone'
  label:   string;
  value:   string;
  color:   string;   // hex color for the icon bg
  visible: boolean;
}

// ── Showcase Card (Founders & VCs) ────────────────────────────────────────────
export interface ShowcaseCardData {
  name:         string;
  brandSlogan:  string;
  tagline:      string;
  badge:        string;
  stat:         string;
  statLabel:    string;
  domain:       string;
  backTitle:    string;
  backDesc:     string;
  accentColor:  string;   // hex color
}

// ── Evaluation Form Config ────────────────────────────────────────────────────

/** یک گزینه در dropdown یا کارت انتخابی */
export interface FormOption {
  value: string;
  label: string;
  label_level?: HeadingTag;
  label_align?: TextAlign;
  sub?:  string;   // توضیح زیر عنوان (فقط برای کارت‌های انتخابی)
  sub_level?: HeadingTag;
  sub_align?: TextAlign;
}

/** تنظیمات کامل محتوای فرم ارزیابی */
export interface EvalFormConfig {
  // ── مرحله ۱: پروفایل ────────────────────────────────────────────────────
  step1_title:       string;
  step1_title_level: HeadingTag;
  step1_title_align: TextAlign;
  step1_subtitle:    string;
  step1_subtitle_level: HeadingTag;
  step1_subtitle_align: TextAlign;
  profile_types:     Array<{
    value: string;   // 'founder' | 'investor'
    label: string;
    label_level?: HeadingTag;
    label_align?: TextAlign;
    sub:   string;
    sub_level?: HeadingTag;
    sub_align?: TextAlign;
  }>;

  // ── مرحله ۲: اطلاعات تماس ───────────────────────────────────────────────
  step2_title:    string;
  step2_title_level: HeadingTag;
  step2_title_align: TextAlign;
  step2_subtitle: string;
  step2_subtitle_level: HeadingTag;
  step2_subtitle_align: TextAlign;

  // ── مرحله ۳-الف: جزئیات فاندر ───────────────────────────────────────────
  step3f_title:    string;
  step3f_title_level: HeadingTag;
  step3f_title_align: TextAlign;
  step3f_subtitle: string;
  step3f_subtitle_level: HeadingTag;
  step3f_subtitle_align: TextAlign;
  sector_options:  string[];
  stage_options:   string[];
  capital_options: string[];

  // ── مرحله ۳-ب: جزئیات سرمایه‌گذار ─────────────────────────────────────
  step3i_title:       string;
  step3i_title_level: HeadingTag;
  step3i_title_align: TextAlign;
  step3i_subtitle:    string;
  step3i_subtitle_level: HeadingTag;
  step3i_subtitle_align: TextAlign;
  ticket_options:     string[];
  stage_pref_options: string[];

  // ── مرحله ۴: مستندات ────────────────────────────────────────────────────
  step4_title:    string;
  step4_title_level: HeadingTag;
  step4_title_align: TextAlign;
  step4_subtitle: string;
  step4_subtitle_level: HeadingTag;
  step4_subtitle_align: TextAlign;
  confidence_options: Array<{ value: string; label: string; label_level?: HeadingTag; label_align?: TextAlign; sub: string; sub_level?: HeadingTag; sub_align?: TextAlign }>;

  // ── مرحله ۵: تأیید ──────────────────────────────────────────────────────
  step5_title:    string;
  step5_title_level: HeadingTag;
  step5_title_align: TextAlign;
  step5_subtitle: string;
  step5_subtitle_level: HeadingTag;
  step5_subtitle_align: TextAlign;
  step5_notice:   string;   // متن نوتیس زرد رنگ

  // ── صفحه موفقیت ─────────────────────────────────────────────────────────
  success_title:    string;
  success_title_level: HeadingTag;
  success_title_align: TextAlign;
  success_subtitle: string;
  success_subtitle_level: HeadingTag;
  success_subtitle_align: TextAlign;
  success_btn:      string;
  success_btn_align: TextAlign;

  // ── برچسب‌های مشترک ─────────────────────────────────────────────────────
  tab_steps: string[];   // ['پروفایل','اطلاعات','جزئیات','مستندات','تأیید']
}

export const DEFAULT_EVAL_FORM: EvalFormConfig = {
  step1_title:    'به کپیتال نتورک خوش آمدید',
  step1_title_level: 'h1',
  step1_title_align: 'right',
  step1_subtitle: 'برای شروع، نوع همکاری خود را انتخاب کنید.',
  step1_subtitle_level: 'h2',
  step1_subtitle_align: 'right',
  profile_types: [
    { value: 'founder',  label: 'فاندر / استارتاپ',  label_level: 'h3', label_align: 'right', sub: 'به دنبال جذب سرمایه Seed تا Series B هستم', sub_level: 'h5', sub_align: 'right' },
    { value: 'investor', label: 'سرمایه‌گذار / VC',   label_level: 'h3', label_align: 'right', sub: 'به دنبال Deal Flow باکیفیت هستم', sub_level: 'h5', sub_align: 'right' },
  ],

  step2_title:    'اطلاعات تماس',
  step2_title_level: 'h2',
  step2_title_align: 'right',
  step2_subtitle: 'اطلاعات شخصی خود را وارد کنید.',
  step2_subtitle_level: 'h3',
  step2_subtitle_align: 'right',

  step3f_title:    'اطلاعات استارتاپ',
  step3f_title_level: 'h2',
  step3f_title_align: 'right',
  step3f_subtitle: 'جزئیات شرکت و نیاز سرمایه‌گذاری خود را وارد کنید.',
  step3f_subtitle_level: 'h3',
  step3f_subtitle_align: 'right',
  sector_options: [
    'SaaS / B2B Software', 'Fintech / Payment', 'AI / Data / ML',
    'HealthTech / BioTech', 'E-commerce / D2C', 'Marketplace', 'CleanTech', 'Other',
  ],
  stage_options:   ['Pre-Seed / MVP', 'Seed', 'Series A', 'Series B'],
  capital_options: [
    '200M–350M تومان', '350M–500M تومان', '500M–750M تومان', '750M–1B تومان',
    '€500K – €2M', '€2M – €5M', '€5M – €15M', '€15M+',
  ],

  step3i_title:       'پروفایل سرمایه‌گذاری',
  step3i_title_level: 'h2',
  step3i_title_align: 'right',
  step3i_subtitle:    'جزئیات صندوق یا سازمان سرمایه‌گذاری خود را وارد کنید.',
  step3i_subtitle_level: 'h3',
  step3i_subtitle_align: 'right',
  ticket_options:     ['€500K – €2M', '€2M – €5M', '€5M – €15M', '€15M+'],
  stage_pref_options: ['Seed', 'Series A', 'Series B', 'Growth', 'Flexible'],

  step4_title:    'مستندات و توضیحات',
  step4_title_level: 'h2',
  step4_title_align: 'right',
  step4_subtitle: 'اطلاعات تکمیلی و میزان آمادگی خود را وارد کنید.',
  step4_subtitle_level: 'h3',
  step4_subtitle_align: 'right',
  confidence_options: [
    { value: 'high', label: 'کاملاً آماده',      label_level: 'h4', label_align: 'right', sub: 'مدارک و اطلاعات کامل دارم', sub_level: 'h5', sub_align: 'right' },
    { value: 'low',  label: 'نیاز به راهنمایی',   label_level: 'h4', label_align: 'right', sub: 'در مراحل اولیه هستم', sub_level: 'h5', sub_align: 'right' },
  ],

  step5_title:    'تأیید و ارسال',
  step5_title_level: 'h2',
  step5_title_align: 'right',
  step5_subtitle: 'اطلاعات زیر را بررسی کرده و سپس ارسال کنید.',
  step5_subtitle_level: 'h3',
  step5_subtitle_align: 'right',
  step5_notice:   'با ارسال این فرم، تیم کپیتال نتورک ظرف ۲ تا ۵ روز کاری با شما تماس خواهد گرفت.',

  success_title:    'درخواست شما ثبت شد',
  success_title_level: 'h2',
  success_title_align: 'center',
  success_subtitle: 'تیم کپیتال نتورک فرم شما را دریافت کرد و ظرف ۲ تا ۵ روز کاری با شما تماس خواهد گرفت.',
  success_subtitle_level: 'h3',
  success_subtitle_align: 'center',
  success_btn:      'ثبت درخواست جدید',
  success_btn_align: 'center',

  tab_steps: ['پروفایل', 'اطلاعات', 'جزئیات', 'مستندات', 'تأیید'],
};

// ── Inline Banners ────────────────────────────────────────────────────────────

/** صفحات سایت که بنر می‌تواند در آن‌ها نمایش داده شود */
export type BannerPage =
  | 'home'
  | 'services'
  | 'process'
  | 'blog'
  | 'about'
  | 'contact'
  | 'evaluation';

/** استایل بنر */
export type BannerStyle = 'strip' | 'card';

/** موقعیت بنر در صفحه */
export type BannerPosition = 'top' | 'after-hero' | 'middle' | 'before-footer' | 'bottom';

/**
 * حالت نمایش بنر:
 * - inline  → داخل جریان صفحه (پیش‌فرض)
 * - fixed   → شناور روی صفحه با موقعیت ثابت
 */
export type BannerDisplayMode = 'inline' | 'fixed';

/**
 * گوشه / جهت نمایش بنر fixed:
 *   NW ── N ── NE
 *   │           │
 *   W           E
 *   │           │
 *   SW ── S ── SE
 */
export type BannerCorner =
  | 'top-left'     | 'top-center'    | 'top-right'
  | 'middle-left'  | 'middle-right'
  | 'bottom-left'  | 'bottom-center' | 'bottom-right';

export const BANNER_CORNER_LABELS: Record<BannerCorner, string> = {
  'top-left':      'شمال غربی ↖',
  'top-center':    'شمال ↑',
  'top-right':     'شمال شرقی ↗',
  'middle-left':   'غرب ←',
  'middle-right':  'شرق →',
  'bottom-left':   'جنوب غربی ↙',
  'bottom-center': 'جنوب ↓',
  'bottom-right':  'جنوب شرقی ↘',
};

/** سکشن‌های قابل انتخاب برای هر صفحه */
export const PAGE_SECTIONS: Record<BannerPage, Array<{ key: string; label: string }>> = {
  home: [
    { key: 'top',            label: 'بالای صفحه (قبل از Hero)' },
    { key: 'after-hero',     label: 'بعد از Hero' },
    { key: 'after-network',  label: 'بعد از شبکه جهانی' },
    { key: 'after-services', label: 'بعد از خدمات' },
    { key: 'after-why-us',   label: 'بعد از چرا ما' },
    { key: 'after-process',  label: 'بعد از فرآیند' },
    { key: 'before-footer',  label: 'قبل از فوتر' },
  ],
  services: [
    { key: 'top',            label: 'بالای صفحه' },
    { key: 'after-hero',     label: 'بعد از Hero' },
    { key: 'after-cards',    label: 'بعد از کارت‌های خدمات' },
    { key: 'before-footer',  label: 'قبل از فوتر' },
  ],
  process: [
    { key: 'top',            label: 'بالای صفحه' },
    { key: 'after-hero',     label: 'بعد از Hero' },
    { key: 'after-steps',    label: 'بعد از مراحل' },
    { key: 'before-footer',  label: 'قبل از فوتر' },
  ],
  blog: [
    { key: 'top',            label: 'بالای صفحه' },
    { key: 'after-featured', label: 'بعد از پست برگزیده' },
    { key: 'mid-list',       label: 'وسط لیست مقالات' },
    { key: 'before-footer',  label: 'قبل از فوتر' },
  ],
  about: [
    { key: 'top',            label: 'بالای صفحه' },
    { key: 'after-hero',     label: 'بعد از Hero' },
    { key: 'after-team',     label: 'بعد از تیم' },
    { key: 'before-footer',  label: 'قبل از فوتر' },
  ],
  contact: [
    { key: 'top',            label: 'بالای صفحه' },
    { key: 'after-hero',     label: 'بعد از Hero' },
    { key: 'before-footer',  label: 'قبل از فوتر' },
  ],
  evaluation: [
    { key: 'top',    label: 'بالای فرم' },
    { key: 'bottom', label: 'پایین فرم' },
  ],
};

export interface InlineBanner {
  id:             string;
  /** شناسه قالب انتخاب‌شده از BANNER_TEMPLATES */
  template_id:    string;
  /** عنوان اصلی بنر */
  title:          string;
  /** توضیح / زیرنویس */
  description:    string;
  /** متن دکمه CTA */
  cta_text:       string;
  /** لینک مقصد (خارجی یا داخلی) */
  cta_url:        string;
  /** باز شدن در تب جدید */
  open_new_tab:   boolean;
  /** رنگ برند hex (override قالب) */
  accent_color:   string;
  /** برچسب کوچک بالا */
  badge:          string;
  /** emoji یا متن آیکون */
  icon:           string;
  /** URL عکس یا GIF */
  image_url:      string;
  /** نمایش عکس؟ */
  show_image:     boolean;
  /** کلیک روی کل بنر لینک می‌دهد؟ */
  full_clickable: boolean;
  /** فعال بودن */
  visible:        boolean;
  /**
   * حالت نمایش:
   * - 'inline' → داخل جریان صفحه در سکشن مشخص‌شده (پیش‌فرض)
   * - 'fixed'  → شناور روی صفحه با position: fixed
   */
  display_mode:   BannerDisplayMode;
  /**
   * فقط برای display_mode = 'fixed':
   * گوشه / جهت نمایش روی صفحه
   */
  corner:         BannerCorner;
  /**
   * عرض بنر fixed (px یا % — e.g. '360px' یا '30%')
   * پیش‌فرض: '360px'
   */
  fixed_width:    string;
  /** صفحاتی که این بنر در آن‌ها نمایش داده می‌شود: { page → sections[] } */
  placements:     Partial<Record<BannerPage, string[]>>;
}

// ── ۲۰ قالب بنر پیش‌فرض ─────────────────────────────────────────────────────
export interface BannerTemplate {
  id:          string;
  name:        string;       // نام نمایشی
  category:    string;       // دسته‌بندی
  accent:      string;       // رنگ پیش‌فرض
  gradient:    string;       // گرادیان پس‌زمینه (CSS)
  icon:        string;
  badge:       string;
  title:       string;
  description: string;
  cta_text:    string;
}

export const BANNER_TEMPLATES: BannerTemplate[] = [
  // ── تک‌رنگ سیانی ──────────────────────────────────────────────────────────
  {
    id: 'cyan-glow',
    name: 'سیان درخشان',
    category: 'مدرن',
    accent: '#00BCD4',
    gradient: 'linear-gradient(135deg,#032030 0%,#05364f 50%,#012030 100%)',
    icon: '🚀',
    badge: '⚡ پیشنهاد ویژه',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'مشاهده بیشتر',
  },
  // ── بنفش گلکسی ───────────────────────────────────────────────────────────
  {
    id: 'purple-galaxy',
    name: 'بنفش کهکشان',
    category: 'مدرن',
    accent: '#a855f7',
    gradient: 'linear-gradient(135deg,#160a2e 0%,#2e1065 50%,#130826 100%)',
    icon: '💎',
    badge: '✨ اکسکلوسیو',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'همین حالا شروع کنید',
  },
  // ── طلایی لاکچری ──────────────────────────────────────────────────────────
  {
    id: 'gold-luxury',
    name: 'طلایی لاکچری',
    category: 'لاکچری',
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg,#1a1000 0%,#2d1f00 50%,#1a1000 100%)',
    icon: '👑',
    badge: '🏆 ویژه',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'کشف کنید',
  },
  // ── قرمز انرژی ──────────────────────────────────────────────────────────
  {
    id: 'red-energy',
    name: 'قرمز انرژی',
    category: 'پرانرژی',
    accent: '#ef4444',
    gradient: 'linear-gradient(135deg,#1f0505 0%,#3b0a0a 50%,#1f0505 100%)',
    icon: '🔥',
    badge: '🔴 فوری',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'عجله کنید!',
  },
  // ── سبز موفقیت ────────────────────────────────────────────────────────────
  {
    id: 'green-success',
    name: 'سبز موفقیت',
    category: 'رسمی',
    accent: '#10b981',
    gradient: 'linear-gradient(135deg,#021a0e 0%,#063d22 50%,#021a0e 100%)',
    icon: '✅',
    badge: '🌿 تأیید شده',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'شروع کنید',
  },
  // ── آبی اقیانوس ──────────────────────────────────────────────────────────
  {
    id: 'ocean-blue',
    name: 'آبی اقیانوس',
    category: 'مدرن',
    accent: '#3b82f6',
    gradient: 'linear-gradient(135deg,#030d1f 0%,#0c2255 50%,#030d1f 100%)',
    icon: '🌊',
    badge: '💫 جدید',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'بیشتر بدانید',
  },
  // ── صورتی نئون ────────────────────────────────────────────────────────────
  {
    id: 'pink-neon',
    name: 'صورتی نئون',
    category: 'پرانرژی',
    accent: '#ec4899',
    gradient: 'linear-gradient(135deg,#1f0315 0%,#4a0a2a 50%,#1f0315 100%)',
    icon: '💖',
    badge: '🌸 محبوب',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'همین حالا',
  },
  // ── نارنجی غروب ──────────────────────────────────────────────────────────
  {
    id: 'sunset-orange',
    name: 'نارنجی غروب',
    category: 'پرانرژی',
    accent: '#f97316',
    gradient: 'linear-gradient(135deg,#1f0a00 0%,#3d1600 50%,#1f0a00 100%)',
    icon: '🌅',
    badge: '🔆 پیشنهاد روز',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'دریافت کنید',
  },
  // ── فیروزه‌ای مینت ────────────────────────────────────────────────────────
  {
    id: 'teal-mint',
    name: 'فیروزه‌ای مینت',
    category: 'مدرن',
    accent: '#14b8a6',
    gradient: 'linear-gradient(135deg,#011a18 0%,#023d38 50%,#011a18 100%)',
    icon: '🌊',
    badge: '🌿 تازه',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'کشف کنید',
  },
  // ── ایندیگو کیهانی ────────────────────────────────────────────────────────
  {
    id: 'indigo-cosmos',
    name: 'ایندیگو کیهانی',
    category: 'لاکچری',
    accent: '#6366f1',
    gradient: 'linear-gradient(135deg,#08051f 0%,#1e1b5e 50%,#08051f 100%)',
    icon: '🌌',
    badge: '⭐ ستاره',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'کاوش کنید',
  },
  // ── سفید یخی (light) ──────────────────────────────────────────────────────
  {
    id: 'ice-white',
    name: 'یخ سفید',
    category: 'مینیمال',
    accent: '#38bdf8',
    gradient: 'linear-gradient(135deg,#050d18 0%,#0c2235 50%,#050d18 100%)',
    icon: '❄️',
    badge: '🔷 پریمیوم',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'اطلاعات بیشتر',
  },
  // ── لایم ── ───────────────────────────────────────────────────────────────
  {
    id: 'lime-fresh',
    name: 'لایم تازه',
    category: 'پرانرژی',
    accent: '#84cc16',
    gradient: 'linear-gradient(135deg,#0a1500 0%,#1a2f00 50%,#0a1500 100%)',
    icon: '⚡',
    badge: '🟢 فعال',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'شروع کنید',
  },
  // ── قرمز-آبی دو رنگ ──────────────────────────────────────────────────────
  {
    id: 'dual-fire-ice',
    name: 'آتش و یخ',
    category: 'درامتیک',
    accent: '#f43f5e',
    gradient: 'linear-gradient(135deg,#1f0510 0%,#1a0a3d 100%)',
    icon: '🎯',
    badge: '🔴 داغ',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'اکنون اقدام کنید',
  },
  // ── مس-برنز ───────────────────────────────────────────────────────────────
  {
    id: 'copper-bronze',
    name: 'مس و برنز',
    category: 'لاکچری',
    accent: '#d97706',
    gradient: 'linear-gradient(135deg,#160c00 0%,#2d1a00 50%,#160c00 100%)',
    icon: '🏅',
    badge: '🥉 برگزیده',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'همکاری کنید',
  },
  // ── آبی آسمانی ───────────────────────────────────────────────────────────
  {
    id: 'sky-blue',
    name: 'آبی آسمانی',
    category: 'مدرن',
    accent: '#0ea5e9',
    gradient: 'linear-gradient(135deg,#020f1f 0%,#062040 50%,#020f1f 100%)',
    icon: '✈️',
    badge: '🔵 جدید',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'پرواز کنید',
  },
  // ── گل رز ─────────────────────────────────────────────────────────────────
  {
    id: 'rose-bloom',
    name: 'گل رز',
    category: 'درامتیک',
    accent: '#fb7185',
    gradient: 'linear-gradient(135deg,#1f0510 0%,#3b0a1e 50%,#1f0510 100%)',
    icon: '🌹',
    badge: '🌸 محدود',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'اکنون ببینید',
  },
  // ── چند رنگ رنگین‌کمان ────────────────────────────────────────────────────
  {
    id: 'aurora',
    name: 'شفق قطبی',
    category: 'درامتیک',
    accent: '#22d3ee',
    gradient: 'linear-gradient(135deg,#030d1a 0%,#0c1f3d 40%,#1a0a2e 100%)',
    icon: '🌈',
    badge: '🌟 اورا',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'تجربه کنید',
  },
  // ── سبز جنگل تیره ─────────────────────────────────────────────────────────
  {
    id: 'dark-forest',
    name: 'جنگل تاریک',
    category: 'مینیمال',
    accent: '#4ade80',
    gradient: 'linear-gradient(135deg,#011205 0%,#032810 50%,#011205 100%)',
    icon: '🌲',
    badge: '🍃 طبیعی',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'بیشتر بدانید',
  },
  // ── پلاتینیوم ─────────────────────────────────────────────────────────────
  {
    id: 'platinum',
    name: 'پلاتینیوم',
    category: 'مینیمال',
    accent: '#94a3b8',
    gradient: 'linear-gradient(135deg,#0a0c10 0%,#1a1f2e 50%,#0a0c10 100%)',
    icon: '💠',
    badge: '⬛ پریمیوم',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'مشاهده کنید',
  },
  // ── آتشفشان ───────────────────────────────────────────────────────────────
  {
    id: 'volcano',
    name: 'آتشفشان',
    category: 'درامتیک',
    accent: '#ff6b35',
    gradient: 'linear-gradient(135deg,#1f0500 0%,#3d0f00 40%,#200500 100%)',
    icon: '🌋',
    badge: '🔥 داغ‌ترین',
    title: 'عنوان اصلی بنر',
    description: 'توضیح کوتاه درباره این پیشنهاد را اینجا بنویسید',
    cta_text: 'اکنون اقدام کنید',
  },
];

export function emptyBanner(): InlineBanner {
  return {
    id:             crypto.randomUUID(),
    template_id:    'cyan-glow',
    title:          '',
    description:    '',
    cta_text:       '',
    cta_url:        '',
    open_new_tab:   true,
    accent_color:   '#00BCD4',
    badge:          '',
    icon:           '🎯',
    image_url:      '',
    show_image:     false,
    full_clickable: true,
    visible:        true,
    display_mode:   'inline',
    corner:         'bottom-right',
    fixed_width:    '360px',
    placements:     {},
  };
}

export interface SiteSettings {
  // اطلاعات تماس
  contact_email:         string;
  contact_phone:         string;
  contact_whatsapp:      string;
  contact_address:       string;
  contact_working_days:  string;
  contact_working_hours: string;
  contact_form_title:    string;
  contact_form_desc:     string;
  contact_success_msg:   string;
  working_hours:         string;
  chat_quick_replies: string[];
  // team members
  team: Array<{ name: string; role: string; bio: string; avatar?: string }>;
  // social links (footer)
  social_twitter:     string;
  social_linkedin:    string;
  social_instagram:   string;
  social_youtube:     string;
  // شبکه‌های اجتماعی شناور (جایگزین چت — حداکثر 4 عدد)
  social_float_items:   SocialFloatItem[];
  social_float_enabled: boolean;
  // تنظیمات هدر/ناوبار
  header_logo_text:       string;
  header_logo_url:        string;
  header_nav_links:       Array<{ label: string; page: string; visible: boolean }>;
  header_cta_text:        string;
  header_cta_visible:     boolean;
  header_login_text:      string;
  header_login_visible:   boolean;
  header_login_style:     'text' | 'outline' | 'filled';
  header_login_color:     string;
  header_bg_color:        string;
  // ── تنظیمات فوتر ─────────────────────────────────────────────────────────
  footer_brand_tagline:   string;   // متن توضیح زیر لوگو در فوتر
  footer_newsletter_title: string;  // عنوان بخش خبرنامه
  footer_newsletter_desc: string;   // توضیح خبرنامه
  footer_newsletter_placeholder: string; // placeholder ایمیل
  footer_newsletter_btn:  string;   // متن دکمه خبرنامه
  footer_newsletter_visible: boolean;  // نمایش/مخفی بخش خبرنامه
  footer_copyright:       string;   // متن کپی‌رایت پایین فوتر
  footer_bottom_left_text:  string;   // متن سمت چپ/راست در نوار پایین فوتر
  footer_bottom_right_text: string;   // متن سمت مقابل در نوار پایین فوتر
  footer_bottom_order:     'copyright-first' | 'social-first';
  footer_col1_groups: Array<FooterColumnGroup>;
  footer_col2_groups: Array<FooterColumnGroup>;
  footer_col3_groups: Array<FooterColumnGroup>;
  // آمارهای بالای فوتر (Quick Stats - 4 عدد)
  footer_stats: Array<{ value: string; label: string; accent: string; visible?: boolean }>;
  // ستون اول: خدمات
  footer_col1_title: string;
  footer_col1_links: Array<{ label: string; page: string; anchor?: string; visible: boolean }>;
  // ستون دوم: منابع
  footer_col2_title: string;
  footer_col2_links: Array<{ label: string; page: string; category?: string; visible: boolean }>;
  // ستون سوم: شرکت
  footer_col3_title: string;
  footer_col3_links: Array<{ label: string; page: string; anchor?: string; visible: boolean }>;
  footer_col1_show_terms: boolean;  // نمایش لینک قوانین و مقررات در ستون ۱
  footer_col2_show_terms: boolean;  // نمایش لینک قوانین و مقررات در ستون ۲
  footer_col3_show_terms: boolean;  // نمایش لینک قوانین و مقررات در ستون ۳
  footer_terms_link_label: string;
  footer_terms_modal_title: string;
  footer_terms_modal_subtitle: string;
  footer_terms_modal_sections: FooterTermsModalSection[];
  footer_terms_modal_accept_text: string;
  footer_terms_modal_footer_note: string;
  // ستون چهارم: تماس (از contact_ fields استفاده می‌شود + موارد اضافه)
  footer_col4_title: string;
  footer_col4_show_email:      boolean;
  footer_col4_show_phone:      boolean;
  footer_col4_show_whatsapp:   boolean;
  footer_col4_show_hours:      boolean;
  footer_col4_show_response:   boolean;
  footer_col4_response_label:  string;  // متن پاسخگویی (پیش‌فرض: پاسخگویی تا ۲۴ ساعته)
  mobile_palette:            MobilePalette;
  // ── محتوای صفحه Home ─────────────────────────────────────────────────────
  home_why_us_badge:       string;
  home_why_us_title:       string;   home_why_us_title_fs:   FontSize;   home_why_us_title_align:   TextAlign;
  home_why_us_desc:        string;   home_why_us_desc_fs:    FontSize;   home_why_us_desc_align:    TextAlign;
  home_services_badge:     string;
  home_services_title:     string;   home_services_title_fs: FontSize;   home_services_title_align: TextAlign;
  home_services_desc:      string;   home_services_desc_fs:  FontSize;   home_services_desc_align:  TextAlign;
  home_hero_badge:   string;
  home_hero_title:   string;   home_hero_title_fs:   FontSize;   home_hero_title_align:   TextAlign;
  home_hero_tagline: string;   home_hero_tagline_fs: FontSize;   home_hero_tagline_align: TextAlign;
  home_hero_desc:    string;   home_hero_desc_fs:    FontSize;   home_hero_desc_align:    TextAlign;
  home_hero_cta1:    string;   home_hero_cta1_align: TextAlign;
  home_hero_cta2:    string;   home_hero_cta2_align: TextAlign;
  /** تگ‌های ویژگی Hero — Feature Pills */
  home_hero_feature_pills: Array<{ label: string; visible: boolean }>;
  home_stats:         PageStat[];
  home_why_us:        WhyUsItem[];
  home_process_steps: ProcessStep[];
  home_ready_title:   string;   home_ready_title_fs: FontSize;   home_ready_title_align: TextAlign;
  home_ready_desc:    string;   home_ready_desc_fs:  FontSize;   home_ready_desc_align:  TextAlign;
  // ── عنوان و توضیح بخش ProcessSteps (timeline) در Home ────────────────────
  home_process_section_badge:  string;
  home_process_section_title:  string;   home_process_section_title_fs: FontSize;   home_process_section_title_align: TextAlign;
  home_process_section_desc:   string;   home_process_section_desc_fs:  FontSize;   home_process_section_desc_align:  TextAlign;
  home_process_section_cta:    string;   home_process_section_cta_align: TextAlign;
  home_process_avg_days:       string;
  // ── آمارهای GlobalNetwork ──────────────────────────────────────────────────
  home_network_title:  string;   home_network_title_fs: FontSize;   home_network_title_align: TextAlign;
  home_network_desc:   string;   home_network_desc_fs:  FontSize;   home_network_desc_align:  TextAlign;
  home_network_stats:  PageStat[];
  // ── Testimonials ──────────────────────────────────────────────────────────
  home_testimonials_badge:   string;
  home_testimonials_heading: string;   home_testimonials_heading_fs: FontSize;   home_testimonials_heading_align: TextAlign;
  home_testimonials_desc:    string;   home_testimonials_desc_fs:   FontSize;    home_testimonials_desc_align:    TextAlign;
  // ── Blog Preview بخش پیش‌نمایش بلاگ در صفحه اصلی ────────────────────────
  home_blog_preview_badge:       string;
  home_blog_preview_title:       string;   home_blog_preview_title_fs: FontSize;   home_blog_preview_title_align: TextAlign;
  home_blog_preview_btn:         string;
  // ── FAQ سوالات متداول ──────────────────────────────────────────────────────
  home_faq_badge:   string;
  home_faq_title:   string;   home_faq_title_fs: FontSize;   home_faq_title_align: TextAlign;
  home_faq_desc:    string;   home_faq_desc_fs:  FontSize;   home_faq_desc_align:  TextAlign;
  home_faq_items:   FaqItem[];
  // ── Showcase — کارت‌های فاندرها و سرمایه‌گذاران ──────────────────────────────
  home_showcase_badge:       string;
  home_showcase_badge_fs:    FontSize;
  home_showcase_badge_align: TextAlign;
  home_showcase_title:       string;
  home_showcase_title_fs:    FontSize;
  home_showcase_title_align: TextAlign;
  home_showcase_desc:        string;
  home_showcase_desc_fs:     FontSize;
  home_showcase_desc_align:  TextAlign;
  home_showcase_founders:    ShowcaseCardData[];
  home_showcase_founders_label:      string;
  home_showcase_founders_label_fs:   FontSize;
  home_showcase_founders_label_align: TextAlign;
  home_showcase_founders_label_bold: boolean;
  home_showcase_founders_label_sub:      string;
  home_showcase_founders_label_sub_fs:   FontSize;
  home_showcase_founders_label_sub_align: TextAlign;
  home_showcase_founders_label_sub_bold: boolean;
  home_showcase_vcs:         ShowcaseCardData[];
  home_showcase_vcs_label:      string;
  home_showcase_vcs_label_fs:   FontSize;
  home_showcase_vcs_label_align: TextAlign;
  home_showcase_vcs_label_bold: boolean;
  home_showcase_vcs_label_sub:      string;
  home_showcase_vcs_label_sub_fs:   FontSize;
  home_showcase_vcs_label_sub_align: TextAlign;
  home_showcase_vcs_label_sub_bold: boolean;
  /** ترتیب نمایش سکشن‌های ثابت (built-in) صفحه Home */
  home_section_order: BuiltInSectionKey[];
  /** سکشن‌های دینامیک صفحه Home — Section Builder */
  home_sections:      HomeSection[];
  // ── محتوای صفحه خدمات ────────────────────────────────────────────────────
  services_hero_title: string;   services_hero_title_fs: FontSize;   services_hero_title_align: TextAlign;
  services_hero_desc:  string;   services_hero_desc_fs:  FontSize;   services_hero_desc_align:  TextAlign;
  services_highlights: PageStat[];      // ۳ آمار بالای صفحه
  services_cards:      ServiceCard[];   // ۳ کارت اصلی (فازها)
  services_packages:   ServicePackage[]; // ۳ پکیج
  services_sections:   HomeSection[];   // سکشن‌های اضافی دینامیک صفحه خدمات
  // ── محتوای صفحه فرآیند ───────────────────────────────────────────────────
  process_hero_title: string;   process_hero_title_fs: FontSize;   process_hero_title_align: TextAlign;
  process_hero_desc:  string;   process_hero_desc_fs:  FontSize;   process_hero_desc_align:  TextAlign;
  process_steps:      ProcessStep[];  // ۴ مرحله اصلی
  process_sections:   HomeSection[];  // سکشن‌های اضافی دینامیک صفحه فرآیند
  // ── محتوای صفحه درباره ما ────────────────────────────────────────────────
  about_hero_title:   string;   about_hero_title_fs: FontSize;   about_hero_title_align: TextAlign;
  about_hero_desc:    string;   about_hero_desc_fs:  FontSize;   about_hero_desc_align:  TextAlign;
  about_mission:      AboutCard;  // کارت ماموریت
  about_experience:   AboutCard;  // کارت تجربه
  about_values:       AboutCard;  // کارت ارزش‌ها
  about_story_title:  string;   about_story_title_fs: FontSize;   about_story_title_align: TextAlign;
  about_story_desc:   string;   about_story_desc_fs:  FontSize;   about_story_desc_align:  TextAlign;
  about_story_items:  string[];
  about_why_title:    string;   about_why_title_fs: FontSize;   about_why_title_align: TextAlign;
  about_why_desc:     string;   about_why_desc_fs:  FontSize;   about_why_desc_align:  TextAlign;
  about_sections:     HomeSection[];  // سکشن‌های اضافی دینامیک صفحه درباره ما
  // ── سکشن‌های کامل صفحه درباره ما (ویرایشگر جدید CMS) ────────────────────
  about_page_sections:  AboutPageSection[];
  about_page_team:      TeamMemberFull[];
  about_intro_paragraphs: AboutPageParagraph[];
  // ── محتوای صفحه تماس ─────────────────────────────────────────────────────
  contact_hero_title: string;   contact_hero_title_fs: FontSize;   contact_hero_title_align: TextAlign;
  contact_hero_desc:  string;   contact_hero_desc_fs:  FontSize;   contact_hero_desc_align:  TextAlign;
  contact_sections:   HomeSection[];  // سکشن‌های اضافی دینامیک صفحه تماس
  // ── تنظیمات کامل صفحه تماس (ویرایشگر جدید CMS) ─────────────────────────
  contact_stat_items:  ContactStatItem[];
  contact_address_label: string;  // برچسب آدرس در کارت تماس (مثلاً «آدرس دفتر»)
  // ── سکشن‌های اضافی پیش‌نمایش بلاگ ──────────────────────────────────────
  blog_preview_sections: HomeSection[];
  // ── تنظیمات فرم ارزیابی ──────────────────────────────────────────────────
  eval_form_config: EvalFormConfig;
  // ── تنظیمات SEO ──────────────────────────────────────────────────────────
  seo_site_name:           string;
  seo_default_og_image:    string;
  seo_google_verification: string;
  seo_bing_verification:   string;
  seo_robots_txt:          string;
  seo_pages: Record<string, {
    title:          string;
    description:    string;
    keywords:       string;
    og_title:       string;
    og_description: string;
    og_image:       string;
    canonical:      string;
    robots:         string;
    noindex:        boolean;
  }>;
  seo_redirects: Array<{ from: string; to: string; code: 301 | 302; active: boolean }>;
  // ── Popup Ads ────────────────────────────────────────────────────────────────
  popup_ads: PopupAd[];
  // ── Inline Banners ───────────────────────────────────────────────────────────
  inline_banners: InlineBanner[];
  // ── Continue Your Journey ────────────────────────────────────────────────────
  cyj_main_title:   string;
  cyj_steps: CyjStep[];
  cyj_main_image:   string;  // URL to main right-side image
  cyj_btn1_text:    string;
  cyj_btn1_url:     string;
  cyj_btn1_enabled: boolean;
  cyj_btn2_text:    string;
  cyj_btn2_url:     string;
  cyj_btn2_enabled: boolean;
  cyj_cards: CyjCard[];
}

// ── Continue Your Journey types ───────────────────────────────────────────────
export interface CyjStep {
  id:    string;
  title: string;
  desc:  string;
}

export interface CyjCard {
  id:      string;
  title:   string;
  desc:    string;
  icon:    string;
  link:    string;
  visible: boolean;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  // تماس
  contact_email:         'invest@capitalnetwork.ir',
  contact_phone:         '+98 21 1234 5678',
  contact_whatsapp:      '+98 21 9100 1200',
  contact_address:       '',
  contact_working_days:  'شنبه تا چهارشنبه',
  contact_working_hours: '۹ صبح تا ۶ عصر',
  contact_form_title:    'ارسال پیام',
  contact_form_desc:     'پیام خود را برای ما بفرستید — در کمتر از ۲۴ ساعت پاسخ می‌دهیم.',
  contact_success_msg:   'پیام شما با موفقیت ارسال شد. به زودی با شما تماس می‌گیریم.',
  contact_address_label: 'آدرس دفتر',
  working_hours:         'شنبه تا چهارشنبه: ۹ صبح تا ۶ عصر',
  chat_quick_replies: ['خدمات VC-Ready سازی', 'نحوه همکاری', 'تماس با تیم'],
  team:               [],
  // شبکه‌های اجتماعی
  social_twitter:     '',
  social_linkedin:    '',
  social_instagram:   '',
  social_youtube:     '',
  social_float_items: [],
  social_float_enabled: false,
  // هدر
  header_logo_text:     'Capital Network',
  header_logo_url:      '',
  header_nav_links: [
    { label: 'خانه',      page: 'home',       visible: true },
    { label: 'خدمات',     page: 'services',   visible: true },
    { label: 'فرایند',    page: 'process',    visible: true },
    { label: 'بلاگ',      page: 'blog',       visible: true },
    { label: 'درباره ما', page: 'about',      visible: true },
    { label: 'تماس',      page: 'contact',    visible: true },
  ],
  header_cta_text:      'درخواست ارزیابی',
  header_cta_visible:   true,
  header_login_text:    'ورود',
  header_login_visible: true,
  header_login_style:   'text',
  header_login_color:   '#7dd3fc',
  header_bg_color:      '#0B1628',
  // ── Footer ────────────────────────────────────────────────────────────────
  footer_brand_tagline:   'اتصال استارتاپ از Seed تا Series B به شبکه جهانی سرمایه‌گذاران Tier-1 در ۵ قاره.',
  footer_newsletter_title: 'خبرنامه هفتگی',
  footer_newsletter_desc: 'هفته‌ای یک بار، بهترین فرصت‌های سرمایه‌گذاری و insights از دنیای VC را دریافت کنید.',
  footer_newsletter_placeholder: 'ایمیل شما...',
  footer_newsletter_btn:  'عضویت',
  footer_newsletter_visible: true,
  footer_copyright:       '© 2026 Capital Network. All rights reserved 2026 ®',
  footer_bottom_left_text:  '© 2026 Capital Network. All rights reserved 2026 ®',
  footer_bottom_right_text: 'ما را دنبال کنید:',
  footer_bottom_order:     'copyright-first',
  footer_col1_groups: [
    {
      title: '',
      links: [
        { label: 'VC-Ready سازی',    page: 'services', anchor: 'vc-ready',    visible: true },
        { label: 'معرفی هدفمند به VC', page: 'services', anchor: 'matching',   visible: true },
        { label: 'پشتیبانی مذاکره',   page: 'services', anchor: 'negotiation', visible: true },
        { label: 'ارزیابی رایگان',    page: 'evaluation',                      visible: true },
      ],
    },
  ],
  footer_col2_groups: [
    {
      title: '',
      links: [
        { label: 'همه مقالات',           page: 'blog', category: 'all',               visible: true },
        { label: 'مطالعه موردی',          page: 'blog', category: 'case-study',        visible: true },
        { label: 'تحلیل بازار',           page: 'blog', category: 'market-analysis',   visible: true },
        { label: 'مدل‌سازی مالی',         page: 'blog', category: 'financial-modeling', visible: true },
        { label: 'استراتژی سرمایه‌گذاری', page: 'blog', category: 'strategy',          visible: true },
      ],
    },
  ],
  footer_col3_groups: [
    {
      title: '',
      links: [
        { label: 'درباره ما',   page: 'about',   anchor: 'about',   visible: true },
        { label: 'تیم ما',      page: 'about',   anchor: 'team',    visible: true },
        { label: 'فرآیند کار',  page: 'process',                    visible: true },
        { label: 'تماس با ما',  page: 'contact',                    visible: true },
      ],
    },
  ],
  footer_stats: [
    { value: '+128',   label: 'سرمایه‌گذار Tier-1',   accent: 'teal',  visible: true },
    { value: '$50M+',  label: 'سرمایه جذب‌شده',       accent: 'amber', visible: true },
    { value: '40 روز', label: 'میانگین بستن راند',    accent: 'teal',  visible: true },
    { value: '92%',    label: 'نرخ موفقیت',           accent: 'amber', visible: true },
  ],
  footer_col1_title: 'خدمات',
  footer_col1_links: [
    { label: 'VC-Ready سازی',    page: 'services', anchor: 'vc-ready',    visible: true },
    { label: 'معرفی هدفمند به VC', page: 'services', anchor: 'matching',   visible: true },
    { label: 'پشتیبانی مذاکره',   page: 'services', anchor: 'negotiation', visible: true },
    { label: 'ارزیابی رایگان',    page: 'evaluation',                      visible: true },
  ],
  footer_col2_title: 'منابع',
  footer_col2_links: [
    { label: 'همه مقالات',           page: 'blog', category: 'all',               visible: true },
    { label: 'مطالعه موردی',          page: 'blog', category: 'case-study',        visible: true },
    { label: 'تحلیل بازار',           page: 'blog', category: 'market-analysis',   visible: true },
    { label: 'مدل‌سازی مالی',         page: 'blog', category: 'financial-modeling', visible: true },
    { label: 'استراتژی سرمایه‌گذاری', page: 'blog', category: 'strategy',          visible: true },
  ],
  footer_col3_title: 'شرکت',
  footer_col3_links: [
    { label: 'درباره ما',   page: 'about',   anchor: 'about',   visible: true },
    { label: 'تیم ما',      page: 'about',   anchor: 'team',    visible: true },
    { label: 'فرآیند کار',  page: 'process',                    visible: true },
    { label: 'تماس با ما',  page: 'contact',                    visible: true },
  ],
  footer_col1_show_terms: false,
  footer_col2_show_terms: false,
  footer_col3_show_terms: true,
  footer_terms_link_label: 'قوانین و مقررات',
  footer_terms_modal_title: 'قوانین و مقررات',
  footer_terms_modal_subtitle: 'کپیتال نتورک — ویرایش ۱۴۰۴',
  footer_terms_modal_sections: [
    { title: '۱. پذیرش شرایط', body: 'استفاده از خدمات، وب‌سایت و پلتفرم کپیتال نتورک (از این پس «پلتفرم») به‌منزله مطالعه، درک و پذیرش کامل این قوانین است. در صورت عدم پذیرش هر بخش، باید استفاده از پلتفرم را متوقف کنید. کپیتال نتورک حق اصلاح این شرایط را در هر زمان برای خود محفوظ می‌دارد و تغییرات با انتشار در همین صفحه اعمال می‌شوند.' },
    { title: '۲. ماهیت خدمات', body: 'کپیتال نتورک یک پلتفرم تسهیل‌گر ارتباط میان استارتاپ‌ها و سرمایه‌گذاران است. خدمات شامل ارزیابی اولیه آمادگی سرمایه‌پذیری، معرفی هدفمند به شبکه VC، مشاوره تهیه مستندات و پشتیبانی مذاکره می‌باشد. این خدمات به‌هیچ‌وجه ضمانت جذب سرمایه نبوده و تصمیم نهایی سرمایه‌گذاری صرفاً بر عهده طرفین قرارداد است.' },
    { title: '۳. محرمانگی و حریم خصوصی', body: 'تمامی اطلاعات، مستندات و Pitch Deck های ارائه‌شده توسط متقاضیان در محیطی امن و رمزنگاری‌شده نگهداری می‌شوند. اطلاعات هیچ‌گاه بدون رضایت صریح کتبی شما به اشخاص ثالث خارج از شبکه سرمایه‌گذاری پلتفرم منتقل نمی‌شود. با ثبت درخواست، اجازه اشتراک‌گذاری اطلاعات استارتاپ با سرمایه‌گذاران هدفمند درون شبکه را اعطا می‌کنید.' },
    { title: '۴. صحت اطلاعات', body: 'کاربر متعهد است تمام اطلاعات ارائه‌شده از جمله داده‌های مالی، ساختار شرکت، مالکیت معنوی و مرحله رشد را با صداقت کامل وارد کند. ارائه اطلاعات نادرست، مبالغه‌آمیز یا گمراه‌کننده موجب حذف فوری از پلتفرم و در صورت اثبات تقصیر، پیگیری قانونی خواهد شد.' },
    { title: '۵. مالکیت معنوی', body: 'تمام محتوای پلتفرم شامل متون، تصاویر، الگوریتم‌های مچینگ و روش‌شناسی ارزیابی متعلق به کپیتال نتورک بوده و تکثیر یا استفاده تجاری از آن‌ها بدون مجوز کتبی ممنوع است. مستندات ارائه‌شده توسط استارتاپ در مالکیت کامل صاحب اثر باقی می‌ماند.' },
    { title: '۶. کارمزد و پرداخت', body: 'ارزیابی اولیه کاملاً رایگان است. در صورت ورود به فاز عملیاتی (معرفی فعال به VC، حضور در جلسات Due Diligence)، کارمزد مبتنی بر موفقیت (Success Fee) با توافق کتبی طرفین تعیین می‌شود. هیچ هزینه‌ای پیش از عقد قرارداد رسمی دریافت نمی‌گردد.' },
    { title: '۷. محدودیت مسئولیت', body: 'کپیتال نتورک در قبال تصمیمات سرمایه‌گذاری نهایی، نوسانات بازار، تغییر شرایط اقتصادی یا عدم تحقق پیش‌بینی‌های مالی هیچ مسئولیتی نمی‌پذیرد. خدمات پلتفرم صرفاً تسهیل‌گرانه بوده و ریسک تجاری بر عهده طرفین اصلی قرارداد سرمایه‌گذاری است.' },
    { title: '۸. حل اختلاف', body: 'هرگونه اختلاف ناشی از این قرارداد در وهله اول از طریق مذاکره مستقیم و در صورت عدم توافق از طریق داوری حل‌وفصل می‌شود. قوانین حاکم، قوانین جمهوری اسلامی ایران و مرجع داوری، مرکز داوری اتاق بازرگانی ایران است.' },
    { title: '۹. تغییر و فسخ', body: 'کپیتال نتورک حق تعلیق یا خاتمه دادن به خدمات برای هر کاربری که این شرایط را نقض کند، بدون اطلاع قبلی را داراست. کاربر نیز می‌تواند هر زمان با ارسال درخواست کتبی، حذف اطلاعات خود را از پایگاه داده پلتفرم درخواست دهد.' },
  ],
  footer_terms_modal_accept_text: 'قوانین و مقررات کپیتال نتورک را به‌طور کامل مطالعه کردم و با تمام بندهای آن موافقم.',
  footer_terms_modal_footer_note: 'آخرین به‌روزرسانی: خرداد ۱۴۰۴ — جهت سؤالات حقوقی با legal@capitalnetwork.io تماس بگیرید.',
  footer_col4_title:          'تماس',
  footer_col4_show_email:     true,
  footer_col4_show_phone:     true,
  footer_col4_show_whatsapp:  true,
  footer_col4_show_hours:     true,
  footer_col4_show_response:  true,
  footer_col4_response_label: 'پاسخگویی تا ۲۴ ساعته',
  // ── Home ──────────────────────────────────────────────────────────────────
  home_why_us_badge:         'چرا کپیتال نتورک؟',
  home_why_us_title:         'متفاوت از هر چیزی که دیده‌اید',   home_why_us_title_fs: 'h2',   home_why_us_title_align: 'center',
  home_why_us_desc:          'ما یک پل هستیم. بین استارتاپ‌های آماده رشد و سرمایه‌گذارانی که دنبال فرصت مناسب می‌گردند.',   home_why_us_desc_fs: 'p',   home_why_us_desc_align: 'center',
  home_services_badge:       'خدمات',
  home_services_title:       'از آماده‌سازی تا بستن راند',   home_services_title_fs: 'h2',   home_services_title_align: 'center',
  home_services_desc:        'ما فقط معرفی نمی‌زنیم. کل فرآیند جذب سرمایه را مهندسی می‌کنیم تا با بهترین Valuation و کمترین Dilution راند را ببندید.',   home_services_desc_fs: 'p',   home_services_desc_align: 'center',
  home_hero_badge:   'متصل مستقیم به VC‌های Tier-1',
  home_hero_title:   'کپیتال نتورک',   home_hero_title_fs:   'h1',   home_hero_title_align:   'right',
  home_hero_tagline: 'سرمایه‌گذاری درست، در زمان درست',   home_hero_tagline_fs: 'h2',   home_hero_tagline_align: 'right',
  home_hero_desc:    'ما استارتاپ‌های ممتاز را به شبکه اختصاصی سرمایه‌گذاران Tier-1 معرفی می‌کنیم.',   home_hero_desc_fs: 'p',   home_hero_desc_align: 'right',
  home_hero_cta1:    'شروع فرآیند جذب سرمایه',   home_hero_cta1_align: 'right',
  home_hero_cta2:    'مشاوره فوری',               home_hero_cta2_align: 'right',
  home_hero_feature_pills: [
    { label: 'Pitch Deck حرفه‌ای',       visible: true },
    { label: 'مدل مالی دقیق',             visible: true },
    { label: 'ارتباط با VC‌های Tier-1',   visible: true },
    { label: 'پشتیبانی مذاکره',          visible: true },
    { label: 'Data Room آماده',           visible: true },
  ],
  home_stats: [
    { value: 'Tier-1', label: 'شبکه اختصاصی VC' },
    { value: '+40 روز', label: 'میانگین بستن راند' },
    { value: '$50M+',  label: 'سرمایه جذب‌شده' },
  ],
  home_why_us: [
    { title: 'شبکه اختصاصی',  desc: 'دسترسی مستقیم به +128 VC و CVC در ۵ قاره با روابط واقعی، نه فهرست‌های عمومی.' },
    { title: 'مچینگ هوشمند',  desc: 'معرفی بر اساس Thesis واقعی، Stage و چکسایز هر سرمایه‌گذار، نه ایمیل کور.' },
    { title: 'همراهی تا بستن', desc: 'از Term Sheet تا امضای نهایی کنارتان هستیم. مذاکره، DD و Closing.' },
    { title: 'سرعت اثبات‌شده', desc: 'میانگین ۴۰ روز از اولین معرفی تا Term Sheet. ۹۲٪ نرخ موفقیت معرفی.' },
  ],
  home_process_steps: [
    { title: 'ارزیابی و آماده‌سازی', text: 'جلسه استراتژی، بررسی ماتریس‌ها، شناسایی Gaps و ساخت پکیج سرمایه‌بندی کامل.', icon: 'layers' },
    { title: 'معرفی و جلسات',         text: 'هماهنگی جلسات، آماده‌سازی Pitch، پیگیری تا دریافت بازخورد و Warm intro.',         icon: 'users' },
    { title: 'مذاکره و بستن',          text: 'مذاکره و همراهی حقوقی Due Diligence، مدل Valuation و شرایط Term Sheet.',          icon: 'check' },
  ],
  home_ready_title: 'آمادگی برای راند بعدی؟',   home_ready_title_fs: 'h2',   home_ready_title_align: 'center',
  home_ready_desc:  'تیم ما با تجربه بیش از ۱۵ سال در زمینه تامین مالی، همراه شما تا رسیدن به اهداف مالی هستیم.',   home_ready_desc_fs: 'p',   home_ready_desc_align: 'center',
  // ProcessSteps section header
  home_process_section_badge:  'فرآیند جذب سرمایه',
  home_process_section_title:  'از اولین جلسه تا Term Sheet',   home_process_section_title_fs: 'h2',   home_process_section_title_align: 'center',
  home_process_section_desc:   'فرآیند شفاف و مرحله‌به‌مرحله. میانگین 40 روز تا بستن، بدون اتلاف وقت شما و سرمایه‌گذار.',   home_process_section_desc_fs: 'p',   home_process_section_desc_align: 'center',
  home_process_section_cta:    'درخواست مشاوره رایگان',   home_process_section_cta_align: 'center',
  home_process_avg_days:       '30-40 روز',
  // GlobalNetwork
  home_network_title:  'شبکه جهانی سرمایه‌گذاران',   home_network_title_fs: 'h2',   home_network_title_align: 'center',
  home_network_desc:   'دسترسی مستقیم به سرمایه‌گذاران Tier-1 در 5 قاره',   home_network_desc_fs: 'p',   home_network_desc_align: 'center',
  home_network_stats: [
    { value: '40 روز', label: 'میانگین رسیدن به Term Sheet' },
    { value: '92%',    label: 'نرخ موفقیت معرفی' },
    { value: '$50M+',  label: 'سرمایه جذب‌شده' },
  ],
  // Testimonials
  home_testimonials_badge:   'نظرات کلیدی',
  home_testimonials_heading: 'بیش از ۵۰ شرکت موفق‌ترین سریع از کپیتال نتورک استفاده کردند',   home_testimonials_heading_fs: 'h2',   home_testimonials_heading_align: 'center',
  home_testimonials_desc:    'بنیان‌گذاران و سرمایه‌گذاران موفق بر سرعت و کیفیت خدمات ما تاکید می‌کنند',   home_testimonials_desc_fs: 'p',   home_testimonials_desc_align: 'center',
  // Blog Preview
  home_blog_preview_badge: 'آخرین مقالات',
  home_blog_preview_title: 'دانش، تجربه و بینش سرمایه‌گذاری',   home_blog_preview_title_fs: 'h2',   home_blog_preview_title_align: 'center',
  home_blog_preview_btn:   'مشاهده همه مقالات',
  // FAQ
  home_faq_badge: 'سوالات متداول',
  home_faq_title: 'هر چیزی که باید بدانید',   home_faq_title_fs: 'h2',   home_faq_title_align: 'center',
  home_faq_desc:  'پاسخ رایج‌ترین سوالات استارتاپ‌ها درباره فرآیند جذب سرمایه',   home_faq_desc_fs: 'p',   home_faq_desc_align: 'center',
  home_faq_items: [
    { q: 'کپیتال نتورک چه خدماتی ارائه می‌دهد؟',           a: 'کپیتال نتورک یک شریک استراتژیک برای استارتاپ‌هایی است که به دنبال جذب سرمایه هستند. ما Pitch Deck حرفه‌ای، مدل مالی دقیق، Data Room آماده، معرفی هدفمند به سرمایه‌گذاران Tier-1 و پشتیبانی کامل در فرآیند مذاکره ارائه می‌دهیم.' },
    { q: 'آیا برای همه مراحل رشد مناسب هستید؟',            a: 'بله. ما استارتاپ‌ها را از مرحله Pre-Seed تا Series B پشتیبانی می‌کنیم. استراتژی و بسته خدماتی بر اساس مرحله رشد و نیازهای خاص هر استارتاپ تنظیم می‌شود.' },
    { q: 'فرآیند همکاری چگونه شروع می‌شود؟',               a: 'اول یک جلسه ارزیابی رایگان برگزار می‌کنیم تا وضعیت فعلی استارتاپ را بررسی کنیم. سپس یک نقشه راه سفارشی برای VC-Ready شدن طراحی می‌کنیم و اجرای آن را با شما همراه می‌شویم.' },
    { q: 'میانگین زمان بستن یک راند سرمایه‌گذاری چقدر است؟', a: 'با کمک کپیتال نتورک، میانگین زمان از اولین جلسه تا دریافت Term Sheet حدود ۴۰ روز است — در حالی که میانگین صنعت ۶ تا ۹ ماه می‌باشد.' },
    { q: 'با چه نوع سرمایه‌گذارانی شبکه دارید؟',           a: 'ما با بیش از ۱۲۸ سرمایه‌گذار Tier-1 در سطح منطقه MENA، اروپا و آمریکا ارتباط فعال داریم. این شبکه شامل صندوق‌های VC، Family Offices، Corporate VCs و Angel Investors می‌شود.' },
    { q: 'هزینه خدمات شما چقدر است؟',                      a: 'بسته‌های خدماتی ما بر اساس مرحله رشد و نیاز استارتاپ متفاوت است. جزئیات قیمت‌گذاری را در جلسه ارزیابی رایگان با هم بررسی می‌کنیم تا بهترین گزینه برای شما را شناسایی کنیم.' },
  ],
  // ── Showcase defaults ─────────────────────────────────────────────────────
  home_showcase_badge: 'موفقیت‌های ما',
  home_showcase_badge_fs: 'h6',
  home_showcase_badge_align: 'center',
  home_showcase_title: 'بنیان‌گذاران و سرمایه‌گذارانی که به ما اعتماد کردند',
  home_showcase_title_fs: 'h2',
  home_showcase_title_align: 'center',
  home_showcase_desc:  'روی هر کارت کلیک کنید تا داستان موفقیت را ببینید',
  home_showcase_desc_fs: 'p',
  home_showcase_desc_align: 'center',
  home_showcase_founders_label: 'فاندرها',
  home_showcase_founders_label_fs: 'h4',
  home_showcase_founders_label_align: 'center',
  home_showcase_founders_label_bold: false,
  home_showcase_founders_label_sub: 'استارتاپ‌های موفق',
  home_showcase_founders_label_sub_fs: 'p',
  home_showcase_founders_label_sub_align: 'center',
  home_showcase_founders_label_sub_bold: false,
  home_showcase_founders: [
    { name: 'نوآوران فینووِیو',   brandSlogan: 'FINOWVIEW™',   tagline: 'پلتفرم مدیریت هوشمند دارایی برای خانواده‌های سرمایه‌گذار',                    badge: 'Fintech · Series A',   stat: '$3.2M',  statLabel: 'جذب سرمایه',        domain: 'هوش مالی',          backTitle: 'چرا به ما پیوستند؟',   backDesc: 'در ۳۸ روز با ۲ VC Tier-1 به Term Sheet رسیدیم. Pitch Deck و مدل مالی توسط کپیتال نتورک آماده شد.',                                       accentColor: '#14b8a6' },
    { name: 'پارس‌تِک رایان',     brandSlogan: 'PARSTECH·RY',  tagline: 'زیرساخت داده‌محور برای کسب‌وکارهای B2B در بازارهای نوظهور',                    badge: 'SaaS · Seed',          stat: '$1.8M',  statLabel: 'جذب سرمایه',        domain: 'داده‌کاوی',         backTitle: 'نتیجه همکاری',        backDesc: 'پس از بازسازی کامل Data Room، در کمتر از ۴۵ روز قرارداد Seed با صندوق بین‌المللی امضا شد.',                                           accentColor: '#f59e0b' },
    { name: 'مِدیکار نبض',        brandSlogan: 'MEDIKAR·NZ',   tagline: 'سیستم هوش مصنوعی تشخیص پیشگیرانه برای بیمارستان‌های منطقه‌ای',               badge: 'HealthTech · Pre-A',   stat: '$900K',  statLabel: 'جذب سرمایه',        domain: 'سلامت دیجیتال',     backTitle: 'مسیر موفقیت',         backDesc: 'با استراتژی معرفی هدفمند، ۳ سرمایه‌گذار تخصصی HealthTech شناسایی و در ۵۰ روز به نهایی‌سازی رسیدیم.',                                   accentColor: '#38bdf8' },
    { name: 'آروین لاجیک',        brandSlogan: 'ARVIN·LG',     tagline: 'پلتفرم لجستیک هوشمند برای زنجیره تأمین صنعتی در بازارهای خاورمیانه',          badge: 'LogTech · Seed',       stat: '$1.2M',  statLabel: 'جذب سرمایه',        domain: 'لجستیک هوشمند',     backTitle: 'داستان جذب سرمایه',   backDesc: 'با بازطراحی کامل Pitch Deck و مدل درآمدی، ظرف ۳۵ روز دو صندوق Seed موافقت اولیه دادند.',                                               accentColor: '#a78bfa' },
    { name: 'سپهر ادتِک',         brandSlogan: 'SEPAHR·ED',    tagline: 'سیستم یادگیری تطبیقی مبتنی بر هوش مصنوعی برای آموزش عالی دیجیتال',           badge: 'EdTech · Series A',    stat: '$2.4M',  statLabel: 'جذب سرمایه',        domain: 'آموزش دیجیتال',     backTitle: 'رشد با کپیتال',       backDesc: 'معرفی دقیق به ۴ سرمایه‌گذار تخصصی EdTech باعث شد ارزش‌گذاری ما ۳۰٪ بالاتر از انتظار تعیین شود.',                                      accentColor: '#34d399' },
    { name: 'کلین‌ انرژی نو',     brandSlogan: 'CLEAN·EN',     tagline: 'راه‌حل‌های انرژی پاک و ذخیره‌سازی برای مجتمع‌های صنعتی و مسکونی',            badge: 'CleanTech · Pre-A',    stat: '$750K',  statLabel: 'جذب سرمایه',        domain: 'انرژی پاک',          backTitle: 'تأثیر مشارکت',        backDesc: 'کپیتال نتورک مناسب‌ترین Impact VC را شناسایی کرد. مذاکره از جلسه اول تا term sheet در ۴۲ روز.',                                        accentColor: '#fb923c' },
  ],
  home_showcase_vcs_label: 'سرمایه‌گذاران',
  home_showcase_vcs_label_fs: 'h4',
  home_showcase_vcs_label_align: 'center',
  home_showcase_vcs_label_bold: false,
  home_showcase_vcs_label_sub: 'صندوق‌های VC',
  home_showcase_vcs_label_sub_fs: 'p',
  home_showcase_vcs_label_sub_align: 'center',
  home_showcase_vcs_label_sub_bold: false,
  home_showcase_vcs: [
    { name: 'آلفا‌ونچر پارتنرز',  brandSlogan: 'ALPHA·VP',     tagline: 'صندوق سرمایه‌گذاری خطرپذیر با تمرکز بر استارتاپ‌های مرحله رشد در MENA',      badge: 'Tier-1 VC · $120M',   stat: '18+',    statLabel: 'پورتفولیو فعال',    domain: 'SaaS · Fintech',     backTitle: 'همکاری با کپیتال',    backDesc: 'از طریق کپیتال نتورک با ۶ استارتاپ برگزیده آشنا شدیم. نرخ تبدیل معرفی به deal ما ۷۱٪ بود.',                                          accentColor: '#8b5cf6' },
    { name: 'سدیر کپیتال گروپ',   brandSlogan: 'SADIR·CAP',    tagline: 'سرمایه‌گذاری استراتژیک در استارتاپ‌های فناورمحور از Seed تا Series B',        badge: 'Multi-Stage · $85M',  stat: '12+',    statLabel: 'سرمایه‌گذاری فعال', domain: 'HealthTech · B2B',   backTitle: 'ارزش کپیتال',         backDesc: 'کیفیت Data Room و Pitch Deck استارتاپ‌های معرفی‌شده به وضوح بالاتر از میانگین بازار بود.',                                             accentColor: '#10b981' },
    { name: 'نیو‌هورایزن فاند',   brandSlogan: 'NEWHORIZON',   tagline: 'پورتفولیوی تخصصی در حوزه اقتصاد دیجیتال و اینفراستراکچر هوشمند',            badge: 'Impact VC · $60M',    stat: '9+',     statLabel: 'خروج موفق',         domain: 'CleanTech · AI',     backTitle: 'چرا کپیتال نتورک؟',   backDesc: 'سرعت و دقت معرفی‌ها به ما اجازه داد فرصت‌های نادر را سریع‌تر از رقبا ارزیابی و lock کنیم.',                                           accentColor: '#f43f5e' },
    { name: 'آریا ونچرز',         brandSlogan: 'ARYA·VC',      tagline: 'سرمایه‌گذاری تخصصی در حوزه هوش مصنوعی و Deep Tech در منطقه MENA و اروپا',    badge: 'Deep Tech · $95M',    stat: '15+',    statLabel: 'سرمایه‌گذاری فعال', domain: 'AI · DeepTech',      backTitle: 'تجربه همکاری',        backDesc: 'پایپ‌لاین ارجاعی کپیتال نتورک باکیفیت‌ترین deal flow در میان intermediaries بود که با آن کار کرده‌ایم.',                                accentColor: '#06b6d4' },
    { name: 'مِناروس کپیتال',     brandSlogan: 'MENAROS·CAP',  tagline: 'صندوق رشد با تمرکز بر بازار MENA و اتصال به شبکه سرمایه‌گذاران اروپایی',     badge: 'Growth · $150M',      stat: '22+',    statLabel: 'پورتفولیو فعال',    domain: 'Marketplace · B2B', backTitle: 'شراکت استراتژیک',     backDesc: 'کپیتال نتورک نه‌تنها deal معرفی کرد، بلکه context کاملی از بازار داد که DD ما را تسریع بخشید.',                                       accentColor: '#eab308' },
    { name: 'تِرا فاند پارتنرز',  brandSlogan: 'TERRA·FP',     tagline: 'سرمایه‌گذاری مرحله اولیه در استارتاپ‌های فین‌تک و رگ‌تک منطقه خاورمیانه',   badge: 'Early-Stage · $45M',  stat: '11+',    statLabel: 'سرمایه‌گذاری فعال', domain: 'Fintech · RegTech',  backTitle: 'کیفیت ارجاعات',       backDesc: 'به‌واسطه کپیتال نتورک با دو استارتاپ برگزیده وارد مذاکره شدیم که هر دو به نهایی‌سازی رسیدند.',                                        accentColor: '#a3e635' },
  ],
  // Default homepage section order (matches provided admin screenshot):
  // Hero, Network, Services, Branding, WhyUs, Evaluation, CTA, Process, Client Showcase, Testimonials, Blog Preview, FAQ
  // Inserted 'evaluation' to render the EvaluationSection between WhyUs and Process sections.
  home_section_order: ['hero', 'network', 'services', 'branding', 'why-us', 'evaluation', 'cta', 'process', 'client-showcase', 'testimonials', 'blog-preview', 'faq'],
  home_sections: [],   // سکشن‌های دینامیک اضافه‌شده توسط ادمین
  // ── Services ──────────────────────────────────────────────────────────────
  services_hero_title: 'از آماده‌سازی VC-Ready تا بستن معامله با استراتژی مشخص',   services_hero_title_fs: 'h1',   services_hero_title_align: 'center',
  services_hero_desc:  'خدمات ما فراتر از ارتباط‌سازی است؛ ما مسیر ساختاریافته‌ای ایجاد می‌کنیم که سرمایه‌گذار مناسب را با سند، داده و داستان قوی به جلسه می‌آورد.',   services_hero_desc_fs: 'p',   services_hero_desc_align: 'center',
  services_highlights: [
    { value: '+128 VC', label: 'شبکه Tier-1' },
    { value: '40 روز',  label: 'میانگین زمان تا Term Sheet' },
    { value: '92%',     label: 'نرخ موفقیت معرفی' },
  ],
  services_cards: [
    {
      phase: 'فاز اول', title: 'آماده‌سازی VC-Ready',
      desc: 'پیتاروم، مدل مالی، Executive Summary و Pitch Deck‌ها را به استاندارد McKinsey می‌سازیم.',
      features: ['بازنویسی ES و Narrative', 'ساخت دیتاروم کامل + Metrics', 'مدل مالی و Valuation'],
      popular: false,
    },
    {
      phase: 'فاز دوم', title: 'معرفی هدفمند به Tier-1',
      desc: 'دسترسی مستقیم به بیش از +200 VC و CVC. بر اساس Thesis، چکسایز و Stage معرفی می‌شوید.',
      features: ['مچینگ با VC‌های مرتبط با Thesis', 'Warm Intro + ایمیل شخصی Partner', 'پیگیری تا جلسه اول'],
      popular: true,
    },
    {
      phase: 'فاز سوم', title: 'پشتیبانی مذاکره و بستن',
      desc: 'از Term Sheet تا Closing کنارتان هستیم. روی Valuation، Liquidation Preference و Board Seat مذاکره می‌کنیم.',
      features: ['تحلیل Term Sheet و Red Flag', 'استراتژی مذاکره Valuation', 'همراهی تا امضای قرارداد'],
      popular: false,
    },
  ],
  services_packages: [
    { title: 'VC-Ready کامل',    description: 'Pitch Deck، One-Pager، مدل مالی و Narrative سرمایه‌گذاری با استاندارد جهانی.', items: ['روایت استراتژیک', 'مدل مالی شفاف', 'دیتاروم آماده VC'] },
    { title: 'مچینگ هدفمند',     description: 'انتخاب سرمایه‌گذار مرتبط، ایمیل گرم و معرفی‌های دقیق بر اساس thesis و stage شما.', items: ['لیست سرمایه‌گذار هدفمند', 'Warm Intro اختصاصی', 'Follow-up حرفه‌ای'] },
    { title: 'پشتیبانی مذاکره', description: 'تحلیل term sheet، شبیه‌سازی شرایط و همراهی حقوقی تا بستن توافق.', items: ['بررسی Term Sheet', 'استراتژی مذاکره', 'حفاظت مالکیت بنیان‌گذاران'] },
  ],
  services_sections: [],
  // ── Process ───────────────────────────────────────────────────────────────
  process_hero_title: 'مسیر مرحله‌ای برای تبدیل شانس به توافق قطعی',   process_hero_title_fs: 'h1',   process_hero_title_align: 'center',
  process_hero_desc:  'هر مرحله از فرآیند با رویکردی ساختاریافته، اولویت‌های شما را به سرمایه‌گذار منتقل می‌کند و تا مرحله Term Sheet پشتیبانی کامل ارائه می‌دهد.',   process_hero_desc_fs: 'p',   process_hero_desc_align: 'center',
  process_steps: [
    { title: 'تشخیص و تعریف دقیق موقعیت',   text: 'تحلیل ارزش پیشنهادی، نقشه بازار و نقاط قوت تیم برای مشخص کردن اولویت‌های استراتژیک جذب سرمایه.' },
    { title: 'ساختن داستان سرمایه‌گذاری',    text: 'آماده‌سازی pitch deck، one-pager و مدل مالی به‌گونه‌ای که سرمایه‌گذار را از ابتدا با roadmap شما همراه کند.' },
    { title: 'هدف‌گذاری و معرفی هوشمند',     text: 'انتخاب VCهای مرتبط، طراحی تماس‌های شخصی و معرفی هدفمند به جای ارسال گسترده و کم اثر.' },
    { title: 'پشتیبانی مذاکره تا بستن',      text: 'همراهی در جلسات، تحلیل term sheet و چک‌لیست حقوقی تا سرمایه‌گذاری با شرایط قابل‌اعتماد بسته شود.' },
  ],
  process_sections: [],
  // ── About ─────────────────────────────────────────────────────────────────
  about_hero_title:  'تیمی که سرمایه‌گذاری شما را با نظم، داده و تجربه می‌سازد',   about_hero_title_fs: 'h1',   about_hero_title_align: 'center',
  about_hero_desc:   'ترکیبی از سابقه VC، مذاکره‌کنندگان حرفه‌ای و تحلیل‌گران مالی که مسیر بسته‌شدن راند را برای شما هموار می‌کنند.',   about_hero_desc_fs: 'p',   about_hero_desc_align: 'center',
  about_mission:    { title: 'ماموریت',  text: 'کمک به استارتاپ‌ها برای دستیابی به سرمایه با شرایط عادلانه و سرعت مناسب.' },
  about_experience: { title: 'تجربه',   text: 'بیش از ۵۰ راند موفق، کار با VCهای Tier-1 و تجربه بین‌المللی.' },
  about_values:     { title: 'ارزش‌ها', text: 'شفافیت، همراستا بودن انگیزه‌ها و تمرکز روی رشد بلندمدت.' },
  about_story_title: 'تجمیع تجربه سرمایه‌گذاری و عملیات برای نتایج پایدار',   about_story_title_fs: 'h2',   about_story_title_align: 'right',
  about_story_desc:  'ما از تجربه‌های عملی یاد گرفته‌ایم که آماده‌سازی صحیح و مچینگ هدفمند، تفاوت بین جذب سرمایه و اتلاف زمان است.',   about_story_desc_fs: 'p',   about_story_desc_align: 'right',
  about_story_items: ['استراتژی ورود به بازار', 'آماده‌سازی مستندات سطح جهانی', 'پشتیبانی تا بستن قرارداد'],
  about_why_title:   'چرا این رویکرد جواب می‌دهد',   about_why_title_fs: 'h2',   about_why_title_align: 'right',
  about_why_desc:    'ما همزمان روی روایت، اعداد و ارتباطات کار می‌کنیم؛ این سه ستون باعث می‌شوند که سرمایه‌گذار نه تنها متقاعد شود، بلکه برای تعامل ادامه‌دار آماده باشد.',   about_why_desc_fs: 'p',   about_why_desc_align: 'right',
  about_sections: [],
  about_intro_paragraphs: [
    { id: 'ap1', text: 'کپیتال نتورک یک پلتفرم تخصصی در حوزه جذب سرمایه، سرمایه‌گذاری هوشمند و اتصال حرفه‌ای میان سرمایه‌گذاران و سرمایه‌پذیران است. ما فقط یک واسطه معرفی نیستیم؛ مأموریت ما این است که مسیر سرمایه‌گذاری را از مرحله ارزیابی اولیه تا آماده‌سازی مدارک، بررسی فرصت، معرفی هدفمند، رایزنی، مذاکره و همراهی تا مراحل نهایی، به‌صورت حرفه‌ای مدیریت کنیم.', visible: true },
    { id: 'ap2', text: 'کپیتال نتورک با رهبری دکتر حامد مهدی‌زاده، به‌عنوان اولین Capital Strategist در ایران، شکل گرفته است. تجربه ما محدود به بازار داخلی نیست.', visible: true },
    { id: 'ap3', text: 'ما باور داریم جذب سرمایه فقط پیدا کردن یک سرمایه‌گذار نیست. یک سرمایه‌گذاری درست زمانی شکل می‌گیرد که فرصت به‌درستی بررسی شده باشد.', visible: true },
    { id: 'ap4', text: 'کپیتال نتورک برای همین هدف ایجاد شده است: ساده‌تر کردن، حرفه‌ای‌تر کردن و امن‌تر کردن مسیر جذب سرمایه و سرمایه‌گذاری، هم برای کسب‌وکارها و هم برای سرمایه‌گذاران.', visible: true },
  ],
  about_page_sections: [
    {
      id: 'aps-what', title: 'ما چه کاری انجام می‌دهیم؟', icon: 'target', accent: false, visible: true,
      paragraphs: [
        { id: 'p1', text: 'کپیتال نتورک بستری تخصصی برای دو گروه اصلی است.', visible: true },
        { id: 'p2', text: 'ما بین این دو طرف فقط ارتباط ایجاد نمی‌کنیم. قبل از هر معرفی، بررسی می‌کنیم که آیا این ارتباط واقعاً منطقی، حرفه‌ای، قابل دفاع و قابل پیگیری است یا نه.', visible: true },
      ],
    },
    {
      id: 'aps-team', title: 'تیم کپیتال نتورک', icon: 'users', accent: false, visible: true,
      paragraphs: [
        { id: 'p1', text: 'کپیتال نتورک مجموعه‌ای از متخصصان باتجربه در حوزه‌های مختلف کسب‌وکار، سرمایه‌گذاری و توسعه است.', visible: true },
      ],
    },
    {
      id: 'aps-diff', title: 'تفاوت کپیتال نتورک چیست؟', icon: 'trending', accent: true, visible: true,
      quoteText: 'کپیتال نتورک این فاصله را مدیریت می‌کند.',
      quoteAccent: false,
      paragraphs: [
        { id: 'p1', text: 'تفاوت اصلی کپیتال نتورک در این است که ما صرفاً معرفی انجام نمی‌دهیم.', visible: true },
        { id: 'p2', text: 'ما قبل از معرفی، بررسی می‌کنیم. قبل از مذاکره، آماده‌سازی انجام می‌دهیم.', visible: true },
      ],
    },
    {
      id: 'aps-biz', title: 'برای کسب‌وکارها و سرمایه‌پذیران', icon: 'briefcase', accent: false, visible: true,
      paragraphs: [
        { id: 'p1', text: 'اگر شما صاحب یک استارتاپ، کسب‌وکار خصوصی، شرکت در حال رشد، پروژه توسعه‌ای یا ایده‌ای مستند و قابل دفاع هستید و به دنبال جذب سرمایه می‌گردید، کپیتال نتورک می‌تواند مسیر شما را ساختارمندتر کند.', visible: true },
      ],
    },
    {
      id: 'aps-inv', title: 'برای سرمایه‌گذاران', icon: 'trending', accent: false, visible: true,
      paragraphs: [
        { id: 'p1', text: 'اگر سرمایه‌گذار هستید و می‌خواهید فرصت‌های سرمایه‌گذاری را با دقت، اطمینان و دید حرفه‌ای‌تری بررسی کنید، کپیتال نتورک بستری امن و تخصصی برای شما فراهم می‌کند.', visible: true },
      ],
    },
    {
      id: 'aps-secure', title: 'بستر امن برای کسب‌وکارها و سرمایه‌گذاران', icon: 'shield', accent: true, visible: true,
      paragraphs: [
        { id: 'p1', text: 'کپیتال نتورک برای کسب‌وکارها، شرکت‌های خصوصی، مجموعه‌های شرکتی، پروژه‌های دولتی یا نیمه‌دولتی، صندوق‌ها، مؤسسات، سرمایه‌گذاران خصوصی و مجموعه‌های سرمایه‌گذاری بستری امن و بدون دغدغه فراهم می‌کند.', visible: true },
      ],
    },
    {
      id: 'aps-capital', title: 'نگاه ما به سرمایه', icon: 'star', accent: false, visible: true,
      quoteText: 'اما سرمایه زمانی ارزش واقعی ایجاد می‌کند که در جای درست، با ساختار درست و در زمان درست وارد شود.',
      quoteAccent: true,
      paragraphs: [
        { id: 'p1', text: 'از نگاه ما، سرمایه فقط پول نیست. سرمایه می‌تواند مسیر رشد، توسعه بازار، ورود به کشور جدید، تکمیل تیم، افزایش ظرفیت تولید، توسعه محصول، ایجاد زیرساخت، تقویت فروش یا ساخت آینده‌ای بزرگ‌تر برای یک کسب‌وکار باشد.', visible: true },
      ],
    },
    {
      id: 'aps-goal', title: 'هدف ما', icon: 'check', accent: false, visible: true,
      quoteText: 'ما مسیر را کوتاه‌تر نمی‌کنیم؛ مسیر را حرفه‌ای‌تر، شفاف‌تر و قابل اعتمادتر می‌کنیم.',
      quoteAccent: false,
      paragraphs: [
        { id: 'p1', text: 'هدف کپیتال نتورک ایجاد یک مسیر قابل اعتماد، حرفه‌ای و هوشمند برای جذب سرمایه و سرمایه‌گذاری است.', visible: true },
        { id: 'p2', text: 'کپیتال نتورک برای کسانی ساخته شده است که سرمایه را جدی می‌گیرند.', visible: true },
      ],
    },
  ],
  about_page_team: [],
  // ── Contact ───────────────────────────────────────────────────────────────
  contact_hero_title: 'با ما در تماس باشید',   contact_hero_title_fs: 'h1',   contact_hero_title_align: 'center',
  contact_hero_desc:  'برای هرگونه سوال یا درخواست مشاوره، از طریق راه‌های زیر با ما ارتباط برقرار کنید.',   contact_hero_desc_fs: 'p',   contact_hero_desc_align: 'center',
  contact_sections: [],
  contact_stat_items: [
    { id: 'cs1', icon: 'clock',  label: 'زمان پاسخ',    value: '۲۴ ساعت',      color: '#00BCD4', visible: true },
    { id: 'cs2', icon: 'check',  label: 'مشاوره اولیه', value: 'رایگان',        color: '#22c55e', visible: true },
    { id: 'cs3', icon: 'shield', label: 'محرمانگی',     value: 'تضمین‌شده',    color: '#a78bfa', visible: true },
    { id: 'cs4', icon: 'users',  label: 'تیم متخصص',   value: 'در دسترس',      color: '#f59e0b', visible: true },
  ],
  // ── Blog Preview اضافی ───────────────────────────────────────────────────
  blog_preview_sections: [],
  // ── Eval Form ────────────────────────────────────────────────────────────
  eval_form_config: DEFAULT_EVAL_FORM,
  // ── SEO ──────────────────────────────────────────────────────────────────
  seo_site_name:           'Capital Network | شبکه سرمایه‌گذاری',
  seo_default_og_image:    '/og-image.png',
  seo_google_verification: '',
  seo_bing_verification:   '',
  seo_robots_txt: `User-agent: *\nAllow: /\nDisallow: /admin\nCrawl-delay: 1\nSitemap: https://capitalnetwork.ir/sitemap.xml`,
  seo_pages: {
    home:     { title: 'Capital Network | شبکه سرمایه‌گذاری هوشمند', description: 'شریک استراتژیک شما در مسیر جذب سرمایه — آماده‌سازی استارتاپ‌ها برای VC از Seed تا Series B', keywords: 'سرمایه‌گذاری, استارتاپ, VC, جذب سرمایه', og_title: 'Capital Network', og_description: 'شریک استراتژیک شما در مسیر جذب سرمایه', og_image: '/og-image.png', canonical: 'https://capitalnetwork.ir/', robots: 'index, follow', noindex: false },
    services: { title: 'خدمات | Capital Network', description: 'خدمات VC-Ready سازی، معرفی هدفمند به سرمایه‌گذاران و پشتیبانی مذاکره تا بستن راند', keywords: 'VC-Ready, خدمات سرمایه‌گذاری, Pitch Deck', og_title: 'خدمات Capital Network', og_description: 'خدمات VC-Ready سازی تا بستن راند', og_image: '/og-image.png', canonical: 'https://capitalnetwork.ir/services', robots: 'index, follow', noindex: false },
    process:  { title: 'فرآیند | Capital Network', description: 'فرآیند مرحله‌ای از آماده‌سازی تا Term Sheet — میانگین ۴۰ روز', keywords: 'فرآیند جذب سرمایه, Term Sheet, مراحل', og_title: 'فرآیند Capital Network', og_description: 'مسیر شفاف از آماده‌سازی تا Term Sheet', og_image: '/og-image.png', canonical: 'https://capitalnetwork.ir/process', robots: 'index, follow', noindex: false },
    blog:     { title: 'بلاگ | Capital Network', description: 'مقالات تخصصی در حوزه سرمایه‌گذاری، استراتژی و مدل‌سازی مالی', keywords: 'بلاگ, مقاله, سرمایه‌گذاری, VC', og_title: 'بلاگ Capital Network', og_description: 'آخرین مقالات و بینش‌های سرمایه‌گذاری', og_image: '/og-image.png', canonical: 'https://capitalnetwork.ir/blog', robots: 'index, follow', noindex: false },
    about:    { title: 'درباره ما | Capital Network', description: 'آشنایی با تیم Capital Network و رویکرد ما در کمک به جذب سرمایه', keywords: 'درباره ما, تیم, Capital Network', og_title: 'درباره Capital Network', og_description: 'تیمی با تجربه بیش از ۱۵ سال در جذب سرمایه', og_image: '/og-image.png', canonical: 'https://capitalnetwork.ir/about', robots: 'index, follow', noindex: false },
    contact:  { title: 'تماس با ما | Capital Network', description: 'برای مشاوره رایگان و شروع فرآیند جذب سرمایه با ما تماس بگیرید', keywords: 'تماس, مشاوره, Capital Network', og_title: 'تماس با Capital Network', og_description: 'با ما در تماس باشید', og_image: '/og-image.png', canonical: 'https://capitalnetwork.ir/contact', robots: 'index, follow', noindex: false },
  },
  seo_redirects: [],
  popup_ads: [],
  inline_banners: [],
  // Mobile palette (optional) — used by MobileAppShell and mobile components
  mobile_palette: { primary: '#06b6d4', accent: '#f59e0b', glass: 'rgba(255,255,255,0.06)' },
  // ── Continue Your Journey ────────────────────────────────────────────────────
  cyj_main_title: 'هیچ فرصتی بدون ارزیابی تخصصی معرفی نمی‌شود',
  cyj_steps: [
    { id: '1', title: 'بررسی اولیه و ارزیابی تخصصی',    desc: 'پیش از هر معرفی، تمامی درخواست‌ها با دقت بررسی می‌شوند. هر پروژه توسط متخصصان ارزیابی می‌شود و تنها موارد واجد شرایط به مرحله بعد می‌رسند.' },
    { id: '2', title: 'تحلیل اطلاعات دقیق',             desc: 'تمامی اطلاعات، مدارک و جزئیات مورد نیاز بررسی و تحلیل دقیق می‌شوند تا بهترین نتیجه ممکن حاصل شود.' },
    { id: '3', title: 'ارائه مسیر مناسب',               desc: 'بر اساس نتایج ارزیابی، مناسب‌ترین راه‌حل و مسیر برای کمک به تصمیم‌گیری آگاهانه کاربران ارائه می‌شود.' },
    { id: '4', title: 'پیگیری فرآیند',                  desc: 'تمامی مراحل پیشرفت زیر نظر است و در طول کل فرآیند اطلاعات مورد نیاز در اختیار قرار می‌گیرد.' },
    { id: '5', title: 'خدمات اختصاصی',                  desc: 'راه‌حل‌ها و خدمات شخصی‌سازی‌شده بر اساس نیازهای خاص هر کاربر ارائه می‌شود.' },
    { id: '6', title: 'مدیریت اطلاعات قابل اعتماد',     desc: 'تمامی اطلاعات با دقت بررسی، مدیریت و ارائه می‌شوند تا کاربران مسیر خود را با اطمینان ادامه دهند.' },
  ],
  cyj_main_image:   '',
  cyj_btn1_text:    'درخواست مشاوره',
  cyj_btn1_url:     '/contact',
  cyj_btn1_enabled: true,
  cyj_btn2_text:    'درباره ما',
  cyj_btn2_url:     '/about',
  cyj_btn2_enabled: true,
  cyj_cards: [
    { id: 'c1', title: 'تحقیق',      desc: 'بررسی جامع بازار و فرصت‌ها',           icon: '🔍', link: '', visible: true },
    { id: 'c2', title: 'دینامیکس',   desc: 'تحلیل پویا و چابک',                    icon: '⚡', link: '', visible: true },
    { id: 'c3', title: 'موضع برند',  desc: 'جایگاه‌سازی و هویت برند',              icon: '🎯', link: '', visible: true },
    { id: 'c4', title: 'پیام',       desc: 'پیام‌رسانی موثر به سرمایه‌گذار',       icon: '💬', link: '', visible: true },
    { id: 'c5', title: 'هویت',       desc: 'هویت سازمانی و برندینگ',               icon: '🏷', link: '', visible: true },
    { id: 'c6', title: 'هدف',        desc: 'تعریف و تنظیم هدف‌های استراتژیک',      icon: '🎪', link: '', visible: true },
    { id: 'c7', title: 'استراتژی',   desc: 'طراحی مسیر رشد',                       icon: '📈', link: '', visible: true },
    { id: 'c8', title: 'طراحی',      desc: 'طراحی بصری و تجربه کاربری',            icon: '🎨', link: '', visible: true },
    { id: 'c9', title: 'معماری',     desc: 'ساختار فنی و معماری سیستم',            icon: '🏗', link: '', visible: true },
    { id: 'c10', title: 'رشد',       desc: 'برنامه‌ریزی رشد پایدار',               icon: '🌱', link: '', visible: true },
    { id: 'c11', title: 'وضوح',      desc: 'شفافیت در ارتباط و گزارش‌دهی',         icon: '💡', link: '', visible: true },
    { id: 'c12', title: 'معیارها',   desc: 'سنجش و ارزیابی KPIها',                 icon: '📊', link: '', visible: true },
  ],
};

// ── Fetch all settings → merge with defaults ──────────────────────────────────
export async function fetchSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await (supabase as any)
      .from('site_settings')
      .select('key, value');

    if (error || !data) return { ...DEFAULT_SETTINGS };

    const map: Record<string, any> = {};
    for (const row of data) {
      map[row.key] = row.value;
    }

    const D = DEFAULT_SETTINGS;
    const footer_col1_groups = asArray(map['footer_col1_groups'], map['footer_col1_links'] ? [{ title: '', links: asArray(map['footer_col1_links'], D.footer_col1_links) }] : D.footer_col1_groups);
    const footer_col2_groups = asArray(map['footer_col2_groups'], map['footer_col2_links'] ? [{ title: '', links: asArray(map['footer_col2_links'], D.footer_col2_links) }] : D.footer_col2_groups);
    const footer_col3_groups = asArray(map['footer_col3_groups'], map['footer_col3_links'] ? [{ title: '', links: asArray(map['footer_col3_links'], D.footer_col3_links) }] : D.footer_col3_groups);
    const homeSectionOrder = (() => {
      const raw = asArray<unknown>(map['home_section_order'], D.home_section_order);
      const normalized = raw.filter((k): k is BuiltInSectionKey => typeof k === 'string' && ALL_BUILT_IN_SECTION_KEYS.includes(k as BuiltInSectionKey));
      const result = [...D.home_section_order];

      normalized.forEach(k => {
        if (!result.includes(k)) result.push(k);
      });

      if (!result.includes('cta')) {
        const idx = result.indexOf('why-us');
        result.splice(idx >= 0 ? idx + 1 : result.length, 0, 'cta');
      }

      return result;
    })();

    return {
    // تماس
    contact_email:         map['contact_email']         ?? D.contact_email,
    contact_phone:         map['contact_phone']          ?? D.contact_phone,
    contact_whatsapp:      map['contact_whatsapp']       ?? D.contact_whatsapp,
    contact_address:       map['contact_address']        ?? D.contact_address,
    contact_working_days:  map['contact_working_days']   ?? D.contact_working_days,
    contact_working_hours: map['contact_working_hours']  ?? D.contact_working_hours,
    contact_form_title:    map['contact_form_title']     ?? D.contact_form_title,
    contact_form_desc:     map['contact_form_desc']      ?? D.contact_form_desc,
    contact_success_msg:   map['contact_success_msg']    ?? D.contact_success_msg,
    contact_address_label: map['contact_address_label']  ?? D.contact_address_label,
    working_hours:         map['working_hours']           ?? D.working_hours,
    chat_quick_replies: asStringArray(map['chat_quick_replies'], D.chat_quick_replies),
    team:               asArray(map['team'], D.team),
    // شبکه‌های اجتماعی
    social_twitter:     map['social_twitter']       ?? '',
    social_linkedin:    map['social_linkedin']       ?? '',
    social_instagram:   map['social_instagram']      ?? '',
    social_youtube:     map['social_youtube']        ?? '',
    social_float_items:   asArray(map['social_float_items'], D.social_float_items),
    social_float_enabled: asBoolean(map['social_float_enabled'], D.social_float_enabled),
    // هدر
    header_logo_text:     map['header_logo_text']     ?? D.header_logo_text,
    header_logo_url:      map['header_logo_url']      ?? '',
    header_nav_links:     asArray(map['header_nav_links'], D.header_nav_links),
    header_cta_text:      map['header_cta_text']      ?? D.header_cta_text,
    header_cta_visible:   map['header_cta_visible']   ?? D.header_cta_visible,
    header_login_text:    map['header_login_text']    ?? D.header_login_text,
    header_login_visible: map['header_login_visible'] ?? D.header_login_visible,
    header_login_style:   map['header_login_style']   ?? D.header_login_style,
    header_login_color:   map['header_login_color']   ?? D.header_login_color,
    header_bg_color:      map['header_bg_color']      ?? D.header_bg_color,
    // Footer
    footer_brand_tagline:      map['footer_brand_tagline']      ?? D.footer_brand_tagline,
    footer_newsletter_title:   map['footer_newsletter_title']   ?? D.footer_newsletter_title,
    footer_newsletter_desc:    map['footer_newsletter_desc']    ?? D.footer_newsletter_desc,
    footer_newsletter_placeholder: map['footer_newsletter_placeholder'] ?? D.footer_newsletter_placeholder,
    footer_newsletter_btn:     map['footer_newsletter_btn']     ?? D.footer_newsletter_btn,
    footer_newsletter_visible: asBoolean(map['footer_newsletter_visible'], D.footer_newsletter_visible),
    footer_copyright:          map['footer_copyright']          ?? D.footer_copyright,
    footer_bottom_left_text:   map['footer_bottom_left_text']   ?? D.footer_bottom_left_text,
    footer_bottom_right_text:  map['footer_bottom_right_text']  ?? D.footer_bottom_right_text,
    footer_bottom_order:       map['footer_bottom_order']       ?? D.footer_bottom_order,
    footer_col1_groups:        footer_col1_groups,
    footer_col2_groups:        footer_col2_groups,
    footer_col3_groups:        footer_col3_groups,
    footer_stats:              asArray(map['footer_stats'], D.footer_stats),
    footer_col1_title:         map['footer_col1_title']         ?? D.footer_col1_title,
    footer_col1_links:         asArray(map['footer_col1_links'], D.footer_col1_links),
    footer_col2_title:         map['footer_col2_title']         ?? D.footer_col2_title,
    footer_col2_links:         asArray(map['footer_col2_links'], D.footer_col2_links),
    footer_col3_title:         map['footer_col3_title']         ?? D.footer_col3_title,
    footer_col3_links:         asArray(map['footer_col3_links'], D.footer_col3_links),
    footer_col1_show_terms:    asBoolean(map['footer_col1_show_terms'], D.footer_col1_show_terms),
    footer_col2_show_terms:    asBoolean(map['footer_col2_show_terms'], D.footer_col2_show_terms),
    footer_col3_show_terms:    asBoolean(map['footer_col3_show_terms'], D.footer_col3_show_terms),
    footer_terms_link_label:   map['footer_terms_link_label']   ?? D.footer_terms_link_label,
    footer_terms_modal_title: map['footer_terms_modal_title'] ?? D.footer_terms_modal_title,
    footer_terms_modal_subtitle: map['footer_terms_modal_subtitle'] ?? D.footer_terms_modal_subtitle,
    footer_terms_modal_sections: asArray(map['footer_terms_modal_sections'], D.footer_terms_modal_sections),
    footer_terms_modal_accept_text: map['footer_terms_modal_accept_text'] ?? D.footer_terms_modal_accept_text,
    footer_terms_modal_footer_note: map['footer_terms_modal_footer_note'] ?? D.footer_terms_modal_footer_note,
    footer_col4_title:         map['footer_col4_title']         ?? D.footer_col4_title,
    footer_col4_show_email:    asBoolean(map['footer_col4_show_email'], D.footer_col4_show_email),
    footer_col4_show_phone:    asBoolean(map['footer_col4_show_phone'], D.footer_col4_show_phone),
    footer_col4_show_whatsapp: asBoolean(map['footer_col4_show_whatsapp'], D.footer_col4_show_whatsapp),
    footer_col4_show_hours:    asBoolean(map['footer_col4_show_hours'], D.footer_col4_show_hours),
    footer_col4_show_response: asBoolean(map['footer_col4_show_response'], D.footer_col4_show_response),
    footer_col4_response_label: map['footer_col4_response_label'] ?? D.footer_col4_response_label,
    mobile_palette:            map['mobile_palette']            ?? D.mobile_palette,
    // Home
    home_why_us_badge:         map['home_why_us_badge']         ?? D.home_why_us_badge,
    home_why_us_title:         map['home_why_us_title']         ?? D.home_why_us_title,
    home_why_us_title_fs:      map['home_why_us_title_fs']      ?? D.home_why_us_title_fs,
    home_why_us_title_align:   map['home_why_us_title_align']   ?? D.home_why_us_title_align,
    home_why_us_desc:          map['home_why_us_desc']          ?? D.home_why_us_desc,
    home_why_us_desc_fs:       map['home_why_us_desc_fs']       ?? D.home_why_us_desc_fs,
    home_why_us_desc_align:    map['home_why_us_desc_align']    ?? D.home_why_us_desc_align,
    home_services_badge:       map['home_services_badge']       ?? D.home_services_badge,
    home_services_title:       map['home_services_title']       ?? D.home_services_title,
    home_services_title_fs:    map['home_services_title_fs']    ?? D.home_services_title_fs,
    home_services_title_align: map['home_services_title_align'] ?? D.home_services_title_align,
    home_services_desc:        map['home_services_desc']        ?? D.home_services_desc,
    home_services_desc_fs:     map['home_services_desc_fs']     ?? D.home_services_desc_fs,
    home_services_desc_align:  map['home_services_desc_align']  ?? D.home_services_desc_align,
    home_hero_badge:       map['home_hero_badge']       ?? D.home_hero_badge,
    home_hero_title:         map['home_hero_title']         ?? D.home_hero_title,
    home_hero_title_fs:      map['home_hero_title_fs']      ?? D.home_hero_title_fs,
    home_hero_title_align:   map['home_hero_title_align']   ?? D.home_hero_title_align,
    home_hero_tagline:       map['home_hero_tagline']       ?? D.home_hero_tagline,
    home_hero_tagline_fs:    map['home_hero_tagline_fs']    ?? D.home_hero_tagline_fs,
    home_hero_tagline_align: map['home_hero_tagline_align'] ?? D.home_hero_tagline_align,
    home_hero_desc:          map['home_hero_desc']          ?? D.home_hero_desc,
    home_hero_desc_fs:       map['home_hero_desc_fs']       ?? D.home_hero_desc_fs,
    home_hero_desc_align:    map['home_hero_desc_align']    ?? D.home_hero_desc_align,
    home_hero_cta1:              map['home_hero_cta1']              ?? D.home_hero_cta1,
    home_hero_cta1_align:        map['home_hero_cta1_align']        ?? D.home_hero_cta1_align,
    home_hero_cta2:              map['home_hero_cta2']              ?? D.home_hero_cta2,
    home_hero_cta2_align:        map['home_hero_cta2_align']        ?? D.home_hero_cta2_align,
    home_hero_feature_pills:     asArray(map['home_hero_feature_pills'], D.home_hero_feature_pills),
    home_stats:            asPageStats(map['home_stats'], D.home_stats),
    home_why_us:           asWhyUsItems(map['home_why_us'], D.home_why_us),
    home_process_steps:    asProcessSteps(map['home_process_steps'], D.home_process_steps),
    home_ready_title:           map['home_ready_title']           ?? D.home_ready_title,
    home_ready_title_fs:        map['home_ready_title_fs']        ?? D.home_ready_title_fs,
    home_ready_title_align:     map['home_ready_title_align']     ?? D.home_ready_title_align,
    home_ready_desc:            map['home_ready_desc']            ?? D.home_ready_desc,
    home_ready_desc_fs:         map['home_ready_desc_fs']         ?? D.home_ready_desc_fs,
    home_ready_desc_align:      map['home_ready_desc_align']      ?? D.home_ready_desc_align,
    // ProcessSteps section header
    home_process_section_badge:        map['home_process_section_badge']        ?? D.home_process_section_badge,
    home_process_section_title:        map['home_process_section_title']        ?? D.home_process_section_title,
    home_process_section_title_fs:     map['home_process_section_title_fs']     ?? D.home_process_section_title_fs,
    home_process_section_title_align:  map['home_process_section_title_align']  ?? D.home_process_section_title_align,
    home_process_section_desc:         map['home_process_section_desc']         ?? D.home_process_section_desc,
    home_process_section_desc_fs:      map['home_process_section_desc_fs']      ?? D.home_process_section_desc_fs,
    home_process_section_desc_align:   map['home_process_section_desc_align']   ?? D.home_process_section_desc_align,
    home_process_section_cta:          map['home_process_section_cta']          ?? D.home_process_section_cta,
    home_process_section_cta_align:    map['home_process_section_cta_align']    ?? D.home_process_section_cta_align,
    home_process_avg_days:             map['home_process_avg_days']             ?? D.home_process_avg_days,
    // GlobalNetwork
    home_network_title:       map['home_network_title']       ?? D.home_network_title,
    home_network_title_fs:    map['home_network_title_fs']    ?? D.home_network_title_fs,
    home_network_title_align: map['home_network_title_align'] ?? D.home_network_title_align,
    home_network_desc:        map['home_network_desc']        ?? D.home_network_desc,
    home_network_desc_fs:     map['home_network_desc_fs']     ?? D.home_network_desc_fs,
    home_network_desc_align:  map['home_network_desc_align']  ?? D.home_network_desc_align,
    home_network_stats:       asPageStats(map['home_network_stats'], D.home_network_stats),
    // Testimonials
    home_testimonials_badge:         map['home_testimonials_badge']         ?? D.home_testimonials_badge,
    home_testimonials_heading:       map['home_testimonials_heading']       ?? D.home_testimonials_heading,
    home_testimonials_heading_fs:    map['home_testimonials_heading_fs']    ?? D.home_testimonials_heading_fs,
    home_testimonials_heading_align: map['home_testimonials_heading_align'] ?? D.home_testimonials_heading_align,
    home_testimonials_desc:          map['home_testimonials_desc']          ?? D.home_testimonials_desc,
    home_testimonials_desc_fs:       map['home_testimonials_desc_fs']       ?? D.home_testimonials_desc_fs,
    home_testimonials_desc_align:    map['home_testimonials_desc_align']    ?? D.home_testimonials_desc_align,
    // Blog Preview
    home_blog_preview_badge:       map['home_blog_preview_badge']       ?? D.home_blog_preview_badge,
    home_blog_preview_title:       map['home_blog_preview_title']       ?? D.home_blog_preview_title,
    home_blog_preview_title_fs:    map['home_blog_preview_title_fs']    ?? D.home_blog_preview_title_fs,
    home_blog_preview_title_align: map['home_blog_preview_title_align'] ?? D.home_blog_preview_title_align,
    home_blog_preview_btn:         map['home_blog_preview_btn']         ?? D.home_blog_preview_btn,
    // FAQ
    home_faq_badge:       map['home_faq_badge']       ?? D.home_faq_badge,
    home_faq_title:       map['home_faq_title']       ?? D.home_faq_title,
    home_faq_title_fs:    map['home_faq_title_fs']    ?? D.home_faq_title_fs,
    home_faq_title_align: map['home_faq_title_align'] ?? D.home_faq_title_align,
    home_faq_desc:        map['home_faq_desc']        ?? D.home_faq_desc,
    home_faq_desc_fs:     map['home_faq_desc_fs']     ?? D.home_faq_desc_fs,
    home_faq_desc_align:  map['home_faq_desc_align']  ?? D.home_faq_desc_align,
    home_faq_items:       asFaqItems(map['home_faq_items'], D.home_faq_items),
    // Showcase
    home_showcase_badge:     map['home_showcase_badge']     ?? D.home_showcase_badge,
    home_showcase_badge_fs:  map['home_showcase_badge_fs']  ?? D.home_showcase_badge_fs,
    home_showcase_badge_align: map['home_showcase_badge_align'] ?? D.home_showcase_badge_align,
    home_showcase_title:     map['home_showcase_title']     ?? D.home_showcase_title,
    home_showcase_title_fs:  map['home_showcase_title_fs']  ?? D.home_showcase_title_fs,
    home_showcase_title_align: map['home_showcase_title_align'] ?? D.home_showcase_title_align,
    home_showcase_desc:      map['home_showcase_desc']      ?? D.home_showcase_desc,
    home_showcase_desc_fs:   map['home_showcase_desc_fs']   ?? D.home_showcase_desc_fs,
    home_showcase_desc_align: map['home_showcase_desc_align'] ?? D.home_showcase_desc_align,
    home_showcase_founders:  asShowcaseCards(map['home_showcase_founders'], D.home_showcase_founders),
    home_showcase_founders_label: map['home_showcase_founders_label'] ?? D.home_showcase_founders_label,
    home_showcase_founders_label_fs: map['home_showcase_founders_label_fs'] ?? D.home_showcase_founders_label_fs,
    home_showcase_founders_label_align: map['home_showcase_founders_label_align'] ?? D.home_showcase_founders_label_align,
    home_showcase_founders_label_bold: map['home_showcase_founders_label_bold'] ?? D.home_showcase_founders_label_bold,
    home_showcase_founders_label_sub: map['home_showcase_founders_label_sub'] ?? D.home_showcase_founders_label_sub,
    home_showcase_founders_label_sub_fs: map['home_showcase_founders_label_sub_fs'] ?? D.home_showcase_founders_label_sub_fs,
    home_showcase_founders_label_sub_align: map['home_showcase_founders_label_sub_align'] ?? D.home_showcase_founders_label_sub_align,
    home_showcase_founders_label_sub_bold: map['home_showcase_founders_label_sub_bold'] ?? D.home_showcase_founders_label_sub_bold,
    home_showcase_vcs:       asShowcaseCards(map['home_showcase_vcs'], D.home_showcase_vcs),
    home_showcase_vcs_label: map['home_showcase_vcs_label'] ?? D.home_showcase_vcs_label,
    home_showcase_vcs_label_fs: map['home_showcase_vcs_label_fs'] ?? D.home_showcase_vcs_label_fs,
    home_showcase_vcs_label_align: map['home_showcase_vcs_label_align'] ?? D.home_showcase_vcs_label_align,
    home_showcase_vcs_label_bold: map['home_showcase_vcs_label_bold'] ?? D.home_showcase_vcs_label_bold,
    home_showcase_vcs_label_sub: map['home_showcase_vcs_label_sub'] ?? D.home_showcase_vcs_label_sub,
    home_showcase_vcs_label_sub_fs: map['home_showcase_vcs_label_sub_fs'] ?? D.home_showcase_vcs_label_sub_fs,
    home_showcase_vcs_label_sub_align: map['home_showcase_vcs_label_sub_align'] ?? D.home_showcase_vcs_label_sub_align,
    home_showcase_vcs_label_sub_bold: map['home_showcase_vcs_label_sub_bold'] ?? D.home_showcase_vcs_label_sub_bold,
    home_section_order: homeSectionOrder,
    home_sections:         asHomeSections(map['home_sections'], D.home_sections),
    // Services
    services_hero_title:       map['services_hero_title']       ?? D.services_hero_title,
    services_hero_title_fs:    map['services_hero_title_fs']    ?? D.services_hero_title_fs,
    services_hero_title_align: map['services_hero_title_align'] ?? D.services_hero_title_align,
    services_hero_desc:        map['services_hero_desc']        ?? D.services_hero_desc,
    services_hero_desc_fs:     map['services_hero_desc_fs']     ?? D.services_hero_desc_fs,
    services_hero_desc_align:  map['services_hero_desc_align']  ?? D.services_hero_desc_align,
    services_highlights:       asPageStats(map['services_highlights'], D.services_highlights),
    services_cards:            asServiceCards(map['services_cards'], D.services_cards),
    services_packages:         asServicePackages(map['services_packages'], D.services_packages),
    services_sections:         asHomeSections(map['services_sections'], D.services_sections),
    // Process
    process_hero_title:       map['process_hero_title']       ?? D.process_hero_title,
    process_hero_title_fs:    map['process_hero_title_fs']    ?? D.process_hero_title_fs,
    process_hero_title_align: map['process_hero_title_align'] ?? D.process_hero_title_align,
    process_hero_desc:        map['process_hero_desc']        ?? D.process_hero_desc,
    process_hero_desc_fs:     map['process_hero_desc_fs']     ?? D.process_hero_desc_fs,
    process_hero_desc_align:  map['process_hero_desc_align']  ?? D.process_hero_desc_align,
    process_steps:            asProcessSteps(map['process_steps'], D.process_steps),
    process_sections:         asHomeSections(map['process_sections'], D.process_sections),
    // About
    about_hero_title:        map['about_hero_title']        ?? D.about_hero_title,
    about_hero_title_fs:     map['about_hero_title_fs']     ?? D.about_hero_title_fs,
    about_hero_title_align:  map['about_hero_title_align']  ?? D.about_hero_title_align,
    about_hero_desc:         map['about_hero_desc']         ?? D.about_hero_desc,
    about_hero_desc_fs:      map['about_hero_desc_fs']      ?? D.about_hero_desc_fs,
    about_hero_desc_align:   map['about_hero_desc_align']   ?? D.about_hero_desc_align,
    about_mission:           asAboutCard(map['about_mission'], D.about_mission),
    about_experience:        asAboutCard(map['about_experience'], D.about_experience),
    about_values:            asAboutCard(map['about_values'], D.about_values),
    about_story_title:       map['about_story_title']       ?? D.about_story_title,
    about_story_title_fs:    map['about_story_title_fs']    ?? D.about_story_title_fs,
    about_story_title_align: map['about_story_title_align'] ?? D.about_story_title_align,
    about_story_desc:        map['about_story_desc']        ?? D.about_story_desc,
    about_story_desc_fs:     map['about_story_desc_fs']     ?? D.about_story_desc_fs,
    about_story_desc_align:  map['about_story_desc_align']  ?? D.about_story_desc_align,
    about_story_items:       asStringArray(map['about_story_items'], D.about_story_items),
    about_why_title:         map['about_why_title']         ?? D.about_why_title,
    about_why_title_fs:      map['about_why_title_fs']      ?? D.about_why_title_fs,
    about_why_title_align:   map['about_why_title_align']   ?? D.about_why_title_align,
    about_why_desc:          map['about_why_desc']          ?? D.about_why_desc,
    about_why_desc_fs:       map['about_why_desc_fs']       ?? D.about_why_desc_fs,
    about_why_desc_align:    map['about_why_desc_align']    ?? D.about_why_desc_align,
    about_sections:          asHomeSections(map['about_sections'], D.about_sections),
    about_intro_paragraphs:  asArray(map['about_intro_paragraphs'], D.about_intro_paragraphs),
    about_page_sections:     asArray(map['about_page_sections'], D.about_page_sections),
    about_page_team:         asArray(map['about_page_team'], D.about_page_team),
    // Contact
    contact_hero_title:       map['contact_hero_title']       ?? D.contact_hero_title,
    contact_hero_title_fs:    map['contact_hero_title_fs']    ?? D.contact_hero_title_fs,
    contact_hero_title_align: map['contact_hero_title_align'] ?? D.contact_hero_title_align,
    contact_hero_desc:        map['contact_hero_desc']        ?? D.contact_hero_desc,
    contact_hero_desc_fs:     map['contact_hero_desc_fs']     ?? D.contact_hero_desc_fs,
    contact_hero_desc_align:  map['contact_hero_desc_align']  ?? D.contact_hero_desc_align,
    contact_sections:         asHomeSections(map['contact_sections'], D.contact_sections),
    contact_stat_items:       asArray(map['contact_stat_items'], D.contact_stat_items),
    blog_preview_sections:    asHomeSections(map['blog_preview_sections'], D.blog_preview_sections),
    // Eval Form
    eval_form_config: map['eval_form_config']
      ? { ...DEFAULT_EVAL_FORM, ...map['eval_form_config'] }
      : D.eval_form_config,
    // SEO
    seo_site_name:           map['seo_site_name']           ?? D.seo_site_name,
    seo_default_og_image:    map['seo_default_og_image']    ?? D.seo_default_og_image,
    seo_google_verification: map['seo_google_verification'] ?? D.seo_google_verification,
    seo_bing_verification:   map['seo_bing_verification']   ?? D.seo_bing_verification,
    seo_robots_txt:          map['seo_robots_txt']          ?? D.seo_robots_txt,
    seo_pages:               map['seo_pages']               ?? D.seo_pages,
    seo_redirects:           asArray(map['seo_redirects'], D.seo_redirects),
    popup_ads:               asArray(map['popup_ads'], D.popup_ads),
    // normalize هر بنر ذخیره‌شده — داده‌های قدیمی ممکن است display_mode/corner/fixed_width نداشته باشند
    inline_banners:          asArray(map['inline_banners'], D.inline_banners).map((b: any) => ({
      ...b,
      display_mode:  b.display_mode  ?? 'inline',
      corner:        b.corner        ?? 'bottom-right',
      fixed_width:   b.fixed_width   ?? '360px',
      placements:    b.placements    ?? {},
      visible:       b.visible       ?? true,
      open_new_tab:  b.open_new_tab  ?? true,
      full_clickable: b.full_clickable ?? false,
      show_image:    b.show_image    ?? false,
    })) as InlineBanner[],
    // Continue Your Journey
    cyj_main_title:   map['cyj_main_title']   ?? D.cyj_main_title,
    cyj_steps:        asCyjSteps(map['cyj_steps'], D.cyj_steps),
    cyj_main_image:   map['cyj_main_image']   ?? D.cyj_main_image,
    cyj_btn1_text:    map['cyj_btn1_text']    ?? D.cyj_btn1_text,
    cyj_btn1_url:     map['cyj_btn1_url']     ?? D.cyj_btn1_url,
    cyj_btn1_enabled: map['cyj_btn1_enabled'] ?? D.cyj_btn1_enabled,
    cyj_btn2_text:    map['cyj_btn2_text']    ?? D.cyj_btn2_text,
    cyj_btn2_url:     map['cyj_btn2_url']     ?? D.cyj_btn2_url,
    cyj_btn2_enabled: map['cyj_btn2_enabled'] ?? D.cyj_btn2_enabled,
    cyj_cards:        asCyjCards(map['cyj_cards'], D.cyj_cards),
  };
  } catch (error) {
    console.error('[fetchSettings]', error);
    return { ...DEFAULT_SETTINGS };
  }
}

// ── Upsert a single setting key ───────────────────────────────────────────────
export async function saveSetting(key: string, value: any): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('site_settings')
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  if (error) { console.error('[saveSetting]', key, error.message); return false; }
  return true;
}

// ── Save multiple settings at once ────────────────────────────────────────────
export async function saveSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await (supabase as any)
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' });

  if (error) { console.error('[saveSettings]', error.message); return false; }
  return true;
}
