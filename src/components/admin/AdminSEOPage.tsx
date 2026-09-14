import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import {
  TrendingUp, Save, RefreshCw, CheckCircle, AlertTriangle, XCircle,
  Globe, FileText, Link2, Image, BarChart3, Zap, Eye,
  Copy, Download, Plus, Trash2, ExternalLink, ChevronDown, ChevronUp,
  ArrowLeft, ArrowRight, Shield, Repeat, Settings, Code, BookOpen,
  Users, Phone,
} from 'lucide-react';
import { fetchSettings, saveSettings } from '../../lib/settingsApi';
import { supabase } from '../../lib/supabaseApi';
import { generateSitemapXML, generateRobotsTxt } from '../../lib/seoGenerator';

// ── style constants ───────────────────────────────────────────────────────────
const card     = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 };
const inputS   = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', outline: 'none', width: '100%', padding: '8px 12px', fontSize: 13 } as React.CSSProperties;
const textareaS= { ...inputS, resize: 'vertical' as const, fontFamily: 'inherit', lineHeight: 1.6 };
const tealBtn  = { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 } as React.CSSProperties;
const ghostBtn = { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 } as React.CSSProperties;
const redBtn   = { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 } as React.CSSProperties;
const lbl      = { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 4, display: 'block' } as React.CSSProperties;

type TabId = 'overview' | 'meta' | 'technical' | 'schema' | 'audit' | 'redirects';

const TABS: Array<{ id: TabId; label: string; labelEn: string; icon: React.ReactNode; color: string }> = [
  { id: 'overview',  label: 'نمای کلی',      labelEn: 'Overview',       icon: <BarChart3 size={16} />, color: '#00BCD4' },
  { id: 'meta',      label: 'Meta Tags',      labelEn: 'Meta & OG',      icon: <FileText  size={16} />, color: '#a78bfa' },
  { id: 'technical', label: 'Technical SEO',  labelEn: 'Sitemap & Robots',icon: <Settings  size={16} />, color: '#f59e0b' },
  { id: 'schema',    label: 'Schema & OG',    labelEn: 'JSON-LD',        icon: <Code      size={16} />, color: '#22c55e' },
  { id: 'audit',     label: 'Audit',          labelEn: 'SEO Checker',    icon: <Eye       size={16} />, color: '#ef4444' },
  { id: 'redirects', label: 'Redirects',      labelEn: 'URL Manager',    icon: <Repeat    size={16} />, color: '#fb923c' },
];

const PAGE_LABELS: Record<string, string> = {
  home: 'صفحه اصلی', services: 'خدمات', process: 'فرآیند',
  blog: 'بلاگ', about: 'درباره ما', contact: 'تماس',
};

type SchemaType = 'WebSite' | 'Organization' | 'WebPage' | 'AboutPage' | 'ContactPage' | 'Service' | 'Blog' | 'CollectionPage';

type PageSEO = {
  title: string; description: string; keywords: string;
  og_title: string; og_description: string; og_image: string;
  canonical: string; robots: string; noindex: boolean;
  schema_type?: SchemaType;
  schema_name?: string;
  schema_description?: string;
  schema_image?: string;
  schema_telephone?: string;
  schema_email?: string;
  schema_address?: string;
  schema_service_type?: string;
  schema_price_range?: string;
  schema_area_served?: string;
};
type AuditItem = { label: string; status: 'pass' | 'warn' | 'fail'; detail: string };

// ── helpers ───────────────────────────────────────────────────────────────────
function calcScore(pages: Record<string, PageSEO>): number {
  const keys = Object.keys(PAGE_LABELS);
  let total = 0; const max = keys.length * 10;
  for (const k of keys) {
    const p = pages[k]; if (!p) continue; let s = 0;
    if (p.title && p.title.length >= 30 && p.title.length <= 65) s += 3; else if (p.title) s += 1;
    if (p.description && p.description.length >= 100 && p.description.length <= 165) s += 3; else if (p.description) s += 1;
    if (p.og_image) s += 2; if (p.canonical) s += 1; if (!p.noindex) s += 1;
    total += s;
  }
  return Math.round((total / max) * 100);
}
function scoreColor(s: number) { return s >= 80 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444'; }
function calcDensity(text: string, kw: string): number {
  if (!text || !kw) return 0;
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  return words.length ? parseFloat(((words.filter(w => w.includes(kw.toLowerCase())).length / words.length) * 100).toFixed(1)) : 0;
}
function calcReadability(text: string): { score: number; label: string } {
  if (!text) return { score: 0, label: 'نامشخص' };
  const sentences = text.split(/[.!?؟]+/).filter(s => s.trim()).length || 1;
  const avg = (text.trim().split(/\s+/).filter(Boolean).length || 1) / sentences;
  if (avg <= 12) return { score: 90, label: 'خیلی آسان' };
  if (avg <= 17) return { score: 70, label: 'آسان' };
  if (avg <= 22) return { score: 55, label: 'متوسط' };
  if (avg <= 30) return { score: 35, label: 'دشوار' };
  return { score: 20, label: 'خیلی دشوار' };
}
function findDuplicates(pages: Record<string, PageSEO>): string[] {
  const seen = new Map<string, string>(); const dupes: string[] = [];
  for (const [key, p] of Object.entries(pages)) {
    const t = p.title?.trim().toLowerCase(); const d = p.description?.trim().toLowerCase();
    if (t) { if (seen.has(t)) dupes.push(`عنوان مشابه: "${PAGE_LABELS[key]}" و "${PAGE_LABELS[seen.get(t)!] ?? seen.get(t)}"`); else seen.set(t, key); }
    if (d) { if (seen.has(d)) dupes.push(`توضیح مشابه: "${PAGE_LABELS[key]}" و "${PAGE_LABELS[seen.get(d)!] ?? seen.get(d)}"`); else seen.set(d, key); }
  }
  return dupes;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminSEOPage() {
  const [activeTab, setActiveTab]   = useState<TabId>('overview');
  const [settings, setSettings]     = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState('');
  const [activePage, setActivePage] = useState<string>('home');
  const [blogPosts, setBlogPosts]   = useState<any[]>([]);
  const [kwInput, setKwInput]       = useState('');
  const [kwText, setKwText]         = useState('');
  const [readText, setReadText]     = useState('');
  const [sitemapXml, setSitemapXml] = useState('');
  const [sitemapBuilt, setSitemapBuilt]   = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [copiedRobots, setCopiedRobots]   = useState(false);
  const [copiedSchema, setCopiedSchema]   = useState(false);
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [schemaPage, setSchemaPage]       = useState<string>('home');
  const [copiedPageSchema, setCopiedPageSchema] = useState<string | null>(null);
  // ── Schema tab state ──────────────────────────────────────────────────────
  const [activeSchemaTab, setActiveSchemaTab] = useState<string>('home');
  const [copiedSchemaKey, setCopiedSchemaKey] = useState<string | null>(null);
  const [expandedSchemaIdx, setExpandedSchemaIdx] = useState<number>(0);
  // ── Technical SEO Schema Workshop state ──────────────────────────────────
  const [techSchemaPage, setTechSchemaPage] = useState<string>('home');
  const [techSchemaExpanded, setTechSchemaExpanded] = useState<number>(0);
  const [copiedTechSchema, setCopiedTechSchema] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings().then(s => { setSettings(s); setLoading(false); });
    supabase.from('blog_posts').select('id,title,excerpt,content,cover_image,slug').then(({ data }) => setBlogPosts(data ?? []));
  }, []);

  const handleSave = useCallback(async () => {
    if (!settings) return;
    setSaving(true); setError('');
    const ok = await saveSettings({
      seo_site_name: settings.seo_site_name, seo_default_og_image: settings.seo_default_og_image,
      seo_google_verification: settings.seo_google_verification, seo_bing_verification: settings.seo_bing_verification,
      seo_robots_txt: settings.seo_robots_txt, seo_pages: settings.seo_pages, seo_redirects: settings.seo_redirects,
    });
    setSaving(false);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); } else setError('خطا در ذخیره‌سازی');
  }, [settings]);

  const updatePage = (pageKey: string, field: string, value: any) =>
    setSettings((prev: any) => ({ ...prev, seo_pages: { ...prev.seo_pages, [pageKey]: { ...prev.seo_pages[pageKey], [field]: value } } }));

  const buildSitemap = useCallback(() => {
    const xml = generateSitemapXML('https://capitalnetwork.ir', blogPosts as any,
      ['investment','strategy','case-study','market-analysis','negotiation','financial-modeling'] as any,
      [...new Set(blogPosts.map((p: any) => p.author_name).filter(Boolean))]);
    setSitemapXml(xml); setSitemapBuilt(true);
  }, [blogPosts]);

  const AI_TITLES: Record<string, string> = {
    home: 'Capital Network | شبکه سرمایه‌گذاری هوشمند — از Seed تا Series B',
    services: 'خدمات جذب سرمایه حرفه‌ای | Capital Network',
    process: 'فرآیند جذب سرمایه در ۴۰ روز | Capital Network',
    blog: 'بلاگ سرمایه‌گذاری و استارتاپ | Capital Network',
    about: 'درباره Capital Network | تیم متخصص جذب سرمایه',
    contact: 'تماس با Capital Network | مشاوره رایگان',
  };
  const AI_DESCS: Record<string, string> = {
    home: 'شریک استراتژیک استارتاپ‌های ایرانی در مسیر جذب سرمایه. دسترسی به +۱۲۸ VC در ۵ قاره، میانگین ۴۰ روز تا Term Sheet با نرخ موفقیت ۹۲٪.',
    services: 'VC-Ready سازی کامل، معرفی هدفمند به سرمایه‌گذاران Tier-1 و پشتیبانی مذاکره. از Pitch Deck تا بستن راند با Capital Network.',
    process: 'فرآیند شفاف و مرحله‌به‌مرحله از ارزیابی تا Term Sheet. میانگین ۴۰ روز، بدون اتلاف وقت با بهترین Valuation.',
    blog: 'آخرین مقالات تخصصی درباره سرمایه‌گذاری VC، استراتژی جذب سرمایه، مدل‌سازی مالی و تحلیل بازار از متخصصان Capital Network.',
    about: 'Capital Network ترکیبی از تجربه VC، مذاکره‌کنندگان حرفه‌ای و تحلیل‌گران مالی است که مسیر بستن راند را برای استارتاپ‌ها هموار می‌کند.',
    contact: 'برای مشاوره رایگان و شروع فرآیند جذب سرمایه با تیم Capital Network تماس بگیرید. پاسخگویی در کمتر از ۲۴ ساعت.',
  };

  const generateOrgSchema = () => JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Organization',
    name: settings?.seo_site_name ?? 'Capital Network', url: 'https://capitalnetwork.ir',
    logo: 'https://capitalnetwork.ir/logo.svg',
    description: 'شریک استراتژیک استارتاپ‌ها در مسیر جذب سرمایه',
    email: settings?.contact_email ?? '', telephone: settings?.contact_phone ?? '',
    sameAs: [settings?.social_linkedin, settings?.social_twitter, settings?.social_instagram, settings?.social_youtube].filter(Boolean),
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: settings?.contact_email ?? '' },
  }, null, 2);

  const generateWebsiteSchema = () => JSON.stringify({
    '@context': 'https://schema.org', '@type': 'WebSite',
    name: settings?.seo_site_name ?? 'Capital Network', url: 'https://capitalnetwork.ir',
    potentialAction: { '@type': 'SearchAction', target: 'https://capitalnetwork.ir/blog?q={search_term_string}', 'query-input': 'required name=search_term_string' },
  }, null, 2);

  // ── Default schema types per page ───────────────────────────────────────
  const PAGE_DEFAULT_SCHEMA: Record<string, SchemaType> = {
    home: 'WebSite', services: 'Service', process: 'WebPage',
    blog: 'Blog', about: 'AboutPage', contact: 'ContactPage',
  };

  const generatePageSchema = (pageKey: string): object => {
    const p: PageSEO = settings?.seo_pages?.[pageKey] ?? {} as PageSEO;
    const schemaType: SchemaType = p.schema_type ?? PAGE_DEFAULT_SCHEMA[pageKey] ?? 'WebPage';
    const siteName = settings?.seo_site_name ?? 'Capital Network';
    const pageUrl = pageKey === 'home' ? 'https://capitalnetwork.ir' : `https://capitalnetwork.ir/${pageKey}`;
    const name = p.schema_name || p.title || PAGE_LABELS[pageKey] || siteName;
    const description = p.schema_description || p.description || '';
    const image = p.schema_image || p.og_image || settings?.seo_default_og_image || 'https://capitalnetwork.ir/og-image.png';

    const base: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      name,
      description,
      url: pageUrl,
      inLanguage: 'fa-IR',
    };

    if (image) base.image = image;

    if (schemaType === 'WebSite') {
      base.potentialAction = {
        '@type': 'SearchAction',
        target: 'https://capitalnetwork.ir/blog?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      };
    }

    if (schemaType === 'Organization' || schemaType === 'Service') {
      if (p.schema_telephone || settings?.contact_phone) base.telephone = p.schema_telephone || settings?.contact_phone;
      if (p.schema_email || settings?.contact_email) base.email = p.schema_email || settings?.contact_email;
      base.logo = { '@type': 'ImageObject', url: 'https://capitalnetwork.ir/logo.svg' };
      base.sameAs = [settings?.social_linkedin, settings?.social_twitter, settings?.social_instagram].filter(Boolean);
    }

    if (schemaType === 'Service') {
      base['@type'] = 'Service';
      base.serviceType = p.schema_service_type || 'Investment Consulting';
      if (p.schema_price_range) base.offers = { '@type': 'Offer', priceRange: p.schema_price_range };
      if (p.schema_area_served) base.areaServed = p.schema_area_served;
      base.provider = {
        '@type': 'Organization',
        name: siteName,
        url: 'https://capitalnetwork.ir',
      };
    }

    if (schemaType === 'ContactPage') {
      if (p.schema_telephone || settings?.contact_phone) base.telephone = p.schema_telephone || settings?.contact_phone;
      if (p.schema_email || settings?.contact_email) base.email = p.schema_email || settings?.contact_email;
      if (p.schema_address) base.address = { '@type': 'PostalAddress', addressLocality: p.schema_address };
    }

    if (schemaType === 'AboutPage') {
      base.mainEntity = {
        '@type': 'Organization',
        name: siteName,
        description: description || 'شریک استراتژیک استارتاپ‌ها در مسیر جذب سرمایه',
        url: 'https://capitalnetwork.ir',
        logo: 'https://capitalnetwork.ir/logo.svg',
      };
    }

    if (schemaType === 'Blog') {
      base.blogPost = blogPosts.slice(0, 5).map((bp: any) => ({
        '@type': 'BlogPosting',
        headline: bp.title,
        url: `https://capitalnetwork.ir/blog/${bp.slug}`,
        datePublished: bp.created_at,
        image: bp.cover_image || image,
      }));
    }

    if (schemaType === 'WebPage' || schemaType === 'CollectionPage') {
      base.breadcrumb = {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'خانه', item: 'https://capitalnetwork.ir' },
          { '@type': 'ListItem', position: 2, name: PAGE_LABELS[pageKey] ?? pageKey, item: pageUrl },
        ],
      };
    }

    return base;
  };

  const runAudit = (): AuditItem[] => {
    if (!settings) return [];
    const pages = settings.seo_pages ?? {};
    const pageKeys = Object.keys(PAGE_LABELS);
    const items: AuditItem[] = [];
    const missingTitles = pageKeys.filter(k => !pages[k]?.title);
    const shortTitles   = pageKeys.filter(k => pages[k]?.title && pages[k].title.length < 30);
    const longTitles    = pageKeys.filter(k => pages[k]?.title && pages[k].title.length > 65);
    items.push({ label: 'Page Title Tags', status: missingTitles.length > 0 ? 'fail' : (shortTitles.length || longTitles.length) ? 'warn' : 'pass',
      detail: missingTitles.length > 0 ? `صفحات بدون عنوان: ${missingTitles.map(k => PAGE_LABELS[k]).join('، ')}`
        : shortTitles.length > 0 ? `عنوان کوتاه: ${shortTitles.map(k => PAGE_LABELS[k]).join('، ')}`
        : longTitles.length > 0 ? `عنوان طولانی: ${longTitles.map(k => PAGE_LABELS[k]).join('، ')}`
        : 'همه عنوان‌ها در محدوده ۳۰–۶۵ کاراکتر هستند' });
    const missingDescs = pageKeys.filter(k => !pages[k]?.description);
    const shortDescs   = pageKeys.filter(k => pages[k]?.description && pages[k].description.length < 100);
    const longDescs    = pageKeys.filter(k => pages[k]?.description && pages[k].description.length > 165);
    items.push({ label: 'Meta Descriptions', status: missingDescs.length > 0 ? 'fail' : (shortDescs.length || longDescs.length) ? 'warn' : 'pass',
      detail: missingDescs.length > 0 ? `صفحات بدون توضیح: ${missingDescs.map(k => PAGE_LABELS[k]).join('، ')}`
        : shortDescs.length > 0 ? `توضیح کوتاه: ${shortDescs.map(k => PAGE_LABELS[k]).join('، ')}`
        : longDescs.length > 0 ? `توضیح طولانی: ${longDescs.map(k => PAGE_LABELS[k]).join('، ')}`
        : 'همه Meta Description ها در محدوده ۱۰۰–۱۶۵ کاراکتر هستند' });
    const missingOG = pageKeys.filter(k => !pages[k]?.og_image);
    items.push({ label: 'Open Graph Image', status: missingOG.length > 0 ? 'warn' : 'pass',
      detail: missingOG.length > 0 ? `صفحات بدون og:image: ${missingOG.map(k => PAGE_LABELS[k]).join('، ')}` : 'همه صفحات دارای og:image هستند' });
    const missingCanon = pageKeys.filter(k => !pages[k]?.canonical);
    items.push({ label: 'Canonical URLs', status: missingCanon.length > 0 ? 'warn' : 'pass',
      detail: missingCanon.length > 0 ? `صفحات بدون canonical: ${missingCanon.map(k => PAGE_LABELS[k]).join('، ')}` : 'همه صفحات دارای canonical URL هستند' });
    const noindexPages = pageKeys.filter(k => pages[k]?.noindex);
    items.push({ label: 'Noindex Detection', status: noindexPages.length > 0 ? 'warn' : 'pass',
      detail: noindexPages.length > 0 ? `صفحات با noindex: ${noindexPages.map(k => PAGE_LABELS[k]).join('، ')}` : 'هیچ صفحه‌ای noindex نیست' });
    const dupes = findDuplicates(pages);
    items.push({ label: 'Duplicate Content', status: dupes.length > 0 ? 'fail' : 'pass', detail: dupes.length > 0 ? dupes.join(' | ') : 'هیچ عنوان یا توضیح تکراری یافت نشد' });
    const noBlogDesc = blogPosts.filter(p => !p.excerpt || p.excerpt.length < 20);
    items.push({ label: 'Blog Meta (Excerpt)', status: noBlogDesc.length > 3 ? 'fail' : noBlogDesc.length > 0 ? 'warn' : 'pass',
      detail: noBlogDesc.length > 0 ? `${noBlogDesc.length} پست بدون excerpt کافی` : `همه ${blogPosts.length} پست دارای excerpt هستند` });
    const noCover = blogPosts.filter(p => !p.cover_image);
    items.push({ label: 'Blog Cover Images', status: noCover.length > 3 ? 'fail' : noCover.length > 0 ? 'warn' : 'pass',
      detail: noCover.length > 0 ? `${noCover.length} پست بدون تصویر شاخص` : `همه ${blogPosts.length} پست دارای تصویر هستند` });
    const noSlug = blogPosts.filter(p => !p.slug);
    items.push({ label: 'Blog URL Slugs', status: noSlug.length > 0 ? 'warn' : 'pass',
      detail: noSlug.length > 0 ? `${noSlug.length} پست بدون slug سئو-فرندلی` : 'همه پست‌ها دارای slug هستند' });
    items.push({ label: 'Google Search Console', status: settings.seo_google_verification ? 'pass' : 'warn',
      detail: settings.seo_google_verification ? 'کد تأیید Google تنظیم شده است' : 'کد تأیید Google Search Console هنوز وارد نشده' });
    items.push({ label: 'Bing Webmaster Tools', status: settings.seo_bing_verification ? 'pass' : 'warn',
      detail: settings.seo_bing_verification ? 'کد تأیید Bing تنظیم شده است' : 'کد تأیید Bing Webmaster هنوز وارد نشده' });
    items.push({ label: 'Robots.txt', status: settings.seo_robots_txt?.includes('Sitemap:') ? 'pass' : 'warn',
      detail: settings.seo_robots_txt?.includes('Sitemap:') ? 'robots.txt تنظیم شده و شامل sitemap است' : 'robots.txt فاقد آدرس Sitemap است' });
    return items;
  };

  // ── render guards ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );
  if (!settings) return null;

  const score      = calcScore(settings.seo_pages ?? {});
  const auditItems = runAudit();
  const passCount  = auditItems.filter(i => i.status === 'pass').length;
  const warnCount  = auditItems.filter(i => i.status === 'warn').length;
  const failCount  = auditItems.filter(i => i.status === 'fail').length;
  const currentPageSEO: PageSEO = settings.seo_pages?.[activePage] ?? {
    title: '', description: '', keywords: '', og_title: '', og_description: '',
    og_image: '', canonical: '', robots: 'index, follow', noindex: false,
  };
  const activeTabMeta = TABS.find(t => t.id === activeTab)!;

  // ── main layout: sidebar + content ───────────────────────────────────────
  return (
    <div className="flex gap-0 min-h-0" style={{ minHeight: 'calc(100vh - 120px)' }} dir="rtl">

      {/* ══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR
      ══════════════════════════════════════════════════════════════════════ */}
      <aside
        className="flex-shrink-0 flex flex-col"
        style={{
          width: 200,
          background: 'rgba(4,8,18,0.6)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px 0 0 12px',
        }}
      >
        {/* Sidebar header */}
        <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(0,188,212,0.25),rgba(0,188,212,0.08))', border: '1px solid rgba(0,188,212,0.3)' }}>
              <TrendingUp size={15} color="#00BCD4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">سئو سایت</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>SEO Manager</p>
            </div>
          </div>

          {/* Score ring in sidebar */}
          <div className="flex items-center gap-3 px-1 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor(score)} strokeWidth="4"
                  strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black" style={{ color: scoreColor(score) }}>{score}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-white">SEO Score</p>
              <div className="flex gap-2 mt-0.5 text-[10px]">
                <span style={{ color: '#22c55e' }}>{passCount}✓</span>
                <span style={{ color: '#f59e0b' }}>{warnCount}⚠</span>
                <span style={{ color: '#ef4444' }}>{failCount}✗</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all"
                style={{
                  background: isActive ? `rgba(${tab.color === '#00BCD4' ? '0,188,212' : tab.color === '#a78bfa' ? '167,139,250' : tab.color === '#f59e0b' ? '245,158,11' : tab.color === '#22c55e' ? '34,197,94' : tab.color === '#ef4444' ? '239,68,68' : '251,146,60'},0.12)` : 'transparent',
                  border: isActive ? `1px solid ${tab.color}33` : '1px solid transparent',
                  color: isActive ? tab.color : 'rgba(255,255,255,0.5)',
                }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; } }}
              >
                <span className="flex-shrink-0" style={{ color: isActive ? tab.color : 'rgba(255,255,255,0.35)' }}>{tab.icon}</span>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-xs font-semibold leading-none truncate">{tab.label}</p>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: isActive ? `${tab.color}99` : 'rgba(255,255,255,0.25)' }}>{tab.labelEn}</p>
                </div>
                {isActive && <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: tab.color }} />}
              </button>
            );
          })}
        </nav>

        {/* Save button at bottom of sidebar */}
        <div className="px-2 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {saved && <p className="text-[10px] text-center mb-2 flex items-center justify-center gap-1" style={{ color: '#22c55e' }}><CheckCircle size={11} /> ذخیره شد</p>}
          {error && <p className="text-[10px] text-center mb-2 text-red-400">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(0,188,212,0.15)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.3)' }}
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            ذخیره تغییرات
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.015)', borderRadius: '0 12px 12px 0', border: '1px solid rgba(255,255,255,0.07)', borderRight: 'none' }}>

        {/* Content header strip */}
        <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
          <span style={{ color: activeTabMeta.color }}>{activeTabMeta.icon}</span>
          <div>
            <p className="text-sm font-bold text-white leading-none">{activeTabMeta.label}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{activeTabMeta.labelEn}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">

          {/* ══════════════════ TAB: OVERVIEW ══════════════════ */}
          {activeTab === 'overview' && (
            <>
              {/* Score progress bar */}
              <div style={{ ...card, padding: '14px 18px' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1" style={{ color: '#22c55e' }}><CheckCircle size={12} />{passCount} Pass</span>
                    <span className="flex items-center gap-1" style={{ color: '#f59e0b' }}><AlertTriangle size={12} />{warnCount} Warn</span>
                    <span className="flex items-center gap-1" style={{ color: '#ef4444' }}><XCircle size={12} />{failCount} Fail</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: scoreColor(score) }}>امتیاز کلی: {score}/100</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: `linear-gradient(90deg,${scoreColor(score)},${scoreColor(score)}99)` }} />
                </div>
              </div>

              {/* Per-page score cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(PAGE_LABELS).map(([key, lbl]) => {
                  const p = settings.seo_pages?.[key]; let s = 0;
                  if (p?.title && p.title.length >= 30 && p.title.length <= 65) s += 3; else if (p?.title) s += 1;
                  if (p?.description && p.description.length >= 100 && p.description.length <= 165) s += 3; else if (p?.description) s += 1;
                  if (p?.og_image) s += 2; if (p?.canonical) s += 1; if (!p?.noindex) s += 1;
                  const pct = Math.round((s / 10) * 100);
                  return (
                    <button key={key} onClick={() => { setActiveTab('meta'); setActivePage(key); }}
                      style={{ ...card, padding: '12px 14px', cursor: 'pointer', textAlign: 'right' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black" style={{ color: scoreColor(pct) }}>{pct}</span>
                        <span className="text-xs font-semibold text-white">{lbl}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: scoreColor(pct) }} />
                      </div>
                      <p className="text-[10px] mt-1.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{p?.title || 'بدون عنوان'}</p>
                    </button>
                  );
                })}
              </div>

              {/* External tools */}
              <div style={{ ...card, padding: '14px 18px' }}>
                <p className="text-xs font-bold text-white mb-3">ابزارهای خارجی</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Google Search Console', url: 'https://search.google.com/search-console', color: '#4285f4' },
                    { label: 'Bing Webmaster Tools',  url: 'https://www.bing.com/webmasters',          color: '#00809d' },
                    { label: 'PageSpeed Insights',    url: 'https://pagespeed.web.dev/',               color: '#34a853' },
                    { label: 'Rich Results Test',     url: 'https://search.google.com/test/rich-results', color: '#ea4335' },
                    { label: 'Schema Validator',      url: 'https://validator.schema.org/',            color: '#7c5cd8' },
                    { label: 'Mobile-Friendly Test',  url: 'https://search.google.com/test/mobile-friendly', color: '#fbbc04' },
                  ].map(lnk => (
                    <a key={lnk.label} href={lnk.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lnk.color }} />
                      <span className="flex-1 truncate">{lnk.label}</span>
                      <ExternalLink size={10} className="opacity-40 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Core Web Vitals */}
              <div style={{ ...card, padding: '14px 18px' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-white flex items-center gap-2"><Zap size={13} color="#f59e0b" /> Core Web Vitals</p>
                  <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, fontSize: 11, padding: '4px 9px' } as any}>بررسی <ExternalLink size={10} /></a>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ label: 'LCP', hint: '< ۲.۵s' }, { label: 'INP', hint: '< ۲۰۰ms' }, { label: 'CLS', hint: '< ۰.۱' }].map(v => (
                    <div key={v.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 12px' }}>
                      <p className="text-sm font-black text-white">{v.label}</p>
                      <p className="text-[10px] mt-1 italic" style={{ color: '#f59e0b' }}>{v.hint}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] mt-2.5" style={{ color: 'rgba(255,255,255,0.25)' }}>برای داده‌های live به PageSpeed Insights متصل شوید</p>
              </div>
            </>
          )}

          {/* ══════════════════ TAB: META TAGS ══════════════════ */}
          {activeTab === 'meta' && (
            <>
              {/* Page selector */}
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(PAGE_LABELS).map(([key, lbl]) => (
                  <button key={key} onClick={() => setActivePage(key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: activePage === key ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: activePage === key ? '#a78bfa' : 'rgba(255,255,255,0.5)', border: activePage === key ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>{lbl}</button>
                ))}
              </div>

              {/* Google Snippet Preview */}
              <div style={{ ...card, padding: '14px 18px' }}>
                <p className="text-xs font-bold text-white flex items-center gap-2 mb-3"><Eye size={13} color="#4285f4" /> پیش‌نمایش در گوگل</p>
                <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', direction: 'ltr' }}>
                  <p style={{ color: '#1a0dab', fontSize: 17, fontFamily: 'Arial,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentPageSEO.title || 'عنوان صفحه را وارد کنید'}</p>
                  <p style={{ color: '#006621', fontSize: 12, fontFamily: 'Arial,sans-serif' }}>capitalnetwork.ir{activePage === 'home' ? '' : `/${activePage}`}</p>
                  <p style={{ color: '#545454', fontSize: 12, fontFamily: 'Arial,sans-serif', lineHeight: 1.4, marginTop: 2 }}>{currentPageSEO.description ? (currentPageSEO.description.length > 160 ? currentPageSEO.description.slice(0, 157) + '...' : currentPageSEO.description) : 'متن توضیحات صفحه را وارد کنید...'}</p>
                </div>
              </div>

              {/* Fields */}
              <div style={{ ...card, padding: '18px' }} className="space-y-4">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px]" style={{ color: currentPageSEO.title.length > 65 ? '#ef4444' : currentPageSEO.title.length >= 30 ? '#22c55e' : '#f59e0b' }}>{currentPageSEO.title.length}/65</span>
                    <span style={lbl}>عنوان صفحه (Title Tag)</span>
                  </div>
                  <div className="flex gap-2">
                    <input value={currentPageSEO.title} onChange={e => updatePage(activePage, 'title', e.target.value)} placeholder="مثال: Capital Network | شبکه سرمایه‌گذاری" style={inputS} />
                    <button onClick={() => updatePage(activePage, 'title', AI_TITLES[activePage] ?? '')} style={{ ...tealBtn, flexShrink: 0, padding: '7px 10px' }} title="AI توضیح"><Zap size={13} /></button>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((currentPageSEO.title.length / 65) * 100, 100)}%`, background: currentPageSEO.title.length > 65 ? '#ef4444' : currentPageSEO.title.length >= 30 ? '#22c55e' : '#f59e0b' }} />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px]" style={{ color: currentPageSEO.description.length > 165 ? '#ef4444' : currentPageSEO.description.length >= 100 ? '#22c55e' : '#f59e0b' }}>{currentPageSEO.description.length}/165</span>
                    <span style={lbl}>Meta Description</span>
                  </div>
                  <div className="flex gap-2">
                    <textarea value={currentPageSEO.description} onChange={e => updatePage(activePage, 'description', e.target.value)} rows={3} placeholder="توضیح جذاب و شامل کلیدواژه اصلی..." style={textareaS} />
                    <button onClick={() => updatePage(activePage, 'description', AI_DESCS[activePage] ?? '')} style={{ ...tealBtn, flexShrink: 0, padding: '7px 10px', alignSelf: 'flex-start' }} title="AI توضیح"><Zap size={13} /></button>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((currentPageSEO.description.length / 165) * 100, 100)}%`, background: currentPageSEO.description.length > 165 ? '#ef4444' : currentPageSEO.description.length >= 100 ? '#22c55e' : '#f59e0b' }} />
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <span style={lbl}>کلیدواژه‌ها (با کاما جدا کنید)</span>
                  <input value={currentPageSEO.keywords} onChange={e => updatePage(activePage, 'keywords', e.target.value)} placeholder="سرمایه‌گذاری, استارتاپ, VC" style={inputS} />
                </div>

                {/* OG fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><span style={lbl}>OG Title</span><input value={currentPageSEO.og_title} onChange={e => updatePage(activePage, 'og_title', e.target.value)} placeholder="عنوان برای شبکه‌های اجتماعی" style={inputS} /></div>
                  <div><span style={lbl}>OG Image URL</span><input value={currentPageSEO.og_image} onChange={e => updatePage(activePage, 'og_image', e.target.value)} placeholder="/og-image.png" style={{ ...inputS, direction: 'ltr' }} /></div>
                </div>
                <div><span style={lbl}>OG Description</span><textarea value={currentPageSEO.og_description} onChange={e => updatePage(activePage, 'og_description', e.target.value)} rows={2} placeholder="توضیح برای اشتراک‌گذاری" style={textareaS} /></div>

                {/* OG preview card */}
                {currentPageSEO.og_image && (
                  <div><span style={lbl}>پیش‌نمایش OG Card</span>
                    <div style={{ background: '#1e2432', border: '1px solid #3d4458', borderRadius: 8, overflow: 'hidden', maxWidth: 360 }}>
                      <div style={{ height: 70, background: 'rgba(0,188,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Image size={24} color="rgba(255,255,255,0.15)" /></div>
                      <div style={{ padding: '8px 12px' }}>
                        <p style={{ fontSize: 10, color: '#8892a4', direction: 'ltr' }}>capitalnetwork.ir</p>
                        <p style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 700 }}>{currentPageSEO.og_title || currentPageSEO.title}</p>
                        <p style={{ fontSize: 11, color: '#8892a4', marginTop: 2 }}>{currentPageSEO.og_description || currentPageSEO.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Canonical + Robots */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><span style={lbl}>Canonical URL</span><input value={currentPageSEO.canonical} onChange={e => updatePage(activePage, 'canonical', e.target.value)} placeholder="https://capitalnetwork.ir/" style={{ ...inputS, direction: 'ltr' }} /></div>
                  <div><span style={lbl}>Robots Directive</span>
                    <select value={currentPageSEO.robots} onChange={e => updatePage(activePage, 'robots', e.target.value)} style={{ ...inputS, cursor: 'pointer' }}>
                      <option value="index, follow">index, follow</option>
                      <option value="noindex, follow">noindex, follow</option>
                      <option value="index, nofollow">index, nofollow</option>
                      <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={currentPageSEO.noindex} onChange={e => updatePage(activePage, 'noindex', e.target.checked)} style={{ accentColor: '#a78bfa', width: 15, height: 15 }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>noindex — این صفحه در نتایج جستجو نمایش داده نشود</span>
                </label>
              </div>

              {/* Keyword Density */}
              <div style={{ ...card, padding: '14px 18px' }}>
                <p className="text-xs font-bold text-white flex items-center gap-2 mb-3"><BarChart3 size={13} color="#00BCD4" /> Keyword Density Analyzer</p>
                <input value={kwInput} onChange={e => setKwInput(e.target.value)} placeholder="کلیدواژه هدف..." style={{ ...inputS, marginBottom: 8 }} />
                <textarea value={kwText} onChange={e => setKwText(e.target.value)} rows={3} placeholder="متن محتوا را اینجا paste کنید..." style={textareaS} />
                {kwText && kwInput && (
                  <div className="mt-3 flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xl font-black" style={{ color: calcDensity(kwText, kwInput) > 3 ? '#ef4444' : calcDensity(kwText, kwInput) >= 1 ? '#22c55e' : '#f59e0b' }}>{calcDensity(kwText, kwInput)}%</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>تراکم</p>
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{calcDensity(kwText, kwInput) > 3 ? '⚠️ Keyword Stuffing' : calcDensity(kwText, kwInput) >= 1 ? '✅ محدوده مناسب (۱–۳٪)' : '📉 خیلی کم'}</p>
                  </div>
                )}
              </div>

              {/* Readability */}
              <div style={{ ...card, padding: '14px 18px' }}>
                <p className="text-xs font-bold text-white flex items-center gap-2 mb-3"><BookOpen size={13} color="#a78bfa" /> Readability Score</p>
                <textarea value={readText} onChange={e => setReadText(e.target.value)} rows={3} placeholder="متن مقاله را اینجا paste کنید..." style={textareaS} />
                {readText && (() => { const r = calcReadability(readText); return (
                  <div className="mt-3 flex items-center gap-4">
                    <div className="text-center"><p className="text-xl font-black" style={{ color: r.score >= 70 ? '#22c55e' : r.score >= 45 ? '#f59e0b' : '#ef4444' }}>{r.score}</p><p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>خوانایی</p></div>
                    <div><p className="text-sm font-bold" style={{ color: r.score >= 70 ? '#22c55e' : r.score >= 45 ? '#f59e0b' : '#ef4444' }}>{r.label}</p><p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>میانگین کلمات در جمله</p></div>
                  </div>
                ); })()}
              </div>
            </>
          )}

          {/* ══════════════════ TAB: TECHNICAL SEO ══════════════════ */}
          {activeTab === 'technical' && (
            <>
              {/* Site settings */}
              <div style={{ ...card, padding: '18px' }} className="space-y-4">
                <p className="text-xs font-bold text-white border-b border-white/5 pb-2">تنظیمات کلی سایت</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><span style={lbl}>نام سایت (Site Name)</span><input value={settings.seo_site_name ?? ''} onChange={e => setSettings((p: any) => ({ ...p, seo_site_name: e.target.value }))} placeholder="Capital Network | شبکه سرمایه‌گذاری" style={inputS} /></div>
                  <div><span style={lbl}>تصویر پیش‌فرض OG</span><input value={settings.seo_default_og_image ?? ''} onChange={e => setSettings((p: any) => ({ ...p, seo_default_og_image: e.target.value }))} placeholder="/og-image.png" style={{ ...inputS, direction: 'ltr' }} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><span style={lbl}>Google Search Console Verification</span><input value={settings.seo_google_verification ?? ''} onChange={e => setSettings((p: any) => ({ ...p, seo_google_verification: e.target.value }))} placeholder="google-site-verification=..." style={{ ...inputS, direction: 'ltr', fontFamily: 'monospace', fontSize: 12 }} /></div>
                  <div><span style={lbl}>Bing Webmaster Verification</span><input value={settings.seo_bing_verification ?? ''} onChange={e => setSettings((p: any) => ({ ...p, seo_bing_verification: e.target.value }))} placeholder="msvalidate.01=..." style={{ ...inputS, direction: 'ltr', fontFamily: 'monospace', fontSize: 12 }} /></div>
                </div>
              </div>

              {/* Sitemap */}
              <div style={{ ...card, padding: '18px' }}>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <p className="text-xs font-bold text-white flex items-center gap-2"><Globe size={13} color="#f59e0b" /> Sitemap Generator</p>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={buildSitemap} style={tealBtn}><RefreshCw size={13} /> بازسازی</button>
                    {sitemapBuilt && <>
                      <button onClick={() => { navigator.clipboard.writeText(sitemapXml); setCopiedSitemap(true); setTimeout(() => setCopiedSitemap(false), 2000); }} style={ghostBtn}>{copiedSitemap ? <CheckCircle size={13} color="#22c55e" /> : <Copy size={13} />} کپی</button>
                      <a href={`data:text/xml;charset=utf-8,${encodeURIComponent(sitemapXml)}`} download="sitemap.xml" style={ghostBtn as any}><Download size={13} /> دانلود</a>
                    </>}
                  </div>
                </div>
                {sitemapBuilt
                  ? <pre style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 12, fontSize: 11, color: '#7dd3fc', direction: 'ltr', overflow: 'auto', maxHeight: 200, lineHeight: 1.5 }}>{sitemapXml.slice(0, 800)}{sitemapXml.length > 800 ? '\n...' : ''}</pre>
                  : <div className="flex flex-col items-center justify-center py-8 gap-2" style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8 }}><Globe size={26} color="rgba(255,255,255,0.12)" /><p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>برای تولید sitemap.xml کلیک کنید</p></div>
                }
              </div>

              {/* Robots.txt */}
              <div style={{ ...card, padding: '18px' }}>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <p className="text-xs font-bold text-white flex items-center gap-2"><Shield size={13} color="#f59e0b" /> robots.txt Editor</p>
                  <div className="flex gap-2">
                    <button onClick={() => setSettings((p: any) => ({ ...p, seo_robots_txt: generateRobotsTxt('https://capitalnetwork.ir/sitemap.xml') }))} style={ghostBtn}><RefreshCw size={13} /> پیش‌فرض</button>
                    <button onClick={() => { navigator.clipboard.writeText(settings.seo_robots_txt ?? ''); setCopiedRobots(true); setTimeout(() => setCopiedRobots(false), 2000); }} style={ghostBtn}>{copiedRobots ? <CheckCircle size={13} color="#22c55e" /> : <Copy size={13} />} کپی</button>
                  </div>
                </div>
                <textarea value={settings.seo_robots_txt ?? ''} onChange={e => setSettings((p: any) => ({ ...p, seo_robots_txt: e.target.value }))} rows={9} style={{ ...textareaS, fontFamily: 'monospace', fontSize: 12, direction: 'ltr', background: 'rgba(0,0,0,0.3)' }} />
                <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>💡 محتوا را در فایل <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: 3 }}>public/robots.txt</code> کپی کنید</p>
              </div>

              {/* ── Image SEO Optimizer (real analysis) ──────────────────── */}
              {(() => {
                // parse <img> tags from post content to find missing alt
                const postsNoCover   = blogPosts.filter((p: any) => !p.cover_image);
                const postsWithCover = blogPosts.filter((p: any) =>  p.cover_image);

                // count imgs without alt in content
                const imgAltStats = blogPosts.map((p: any) => {
                  const content: string = p.content ?? '';
                  const total   = (content.match(/<img/gi) ?? []).length;
                  const noAlt   = (content.match(/<img(?![^>]*\balt\s*=\s*["'][^"']+["'])[^>]*>/gi) ?? []).length;
                  return { id: p.id, title: p.title, total, noAlt };
                }).filter(x => x.noAlt > 0);

                // detect non-webp images
                const nonWebp = blogPosts.filter((p: any) =>
                  p.cover_image && !/\.webp(\?|$)/i.test(p.cover_image)
                );

                const checks = [
                  {
                    status: postsNoCover.length === 0 ? 'pass' : postsNoCover.length <= 2 ? 'warn' : 'fail' as 'pass'|'warn'|'fail',
                    label: 'تصویر شاخص (Cover Image)',
                    value: `${postsWithCover.length} / ${blogPosts.length} پست`,
                    detail: postsNoCover.length > 0
                      ? postsNoCover.map((p: any) => p.title?.slice(0, 35)).join(' · ')
                      : 'همه پست‌ها تصویر دارند',
                  },
                  {
                    status: imgAltStats.length === 0 ? 'pass' : imgAltStats.length <= 2 ? 'warn' : 'fail' as 'pass'|'warn'|'fail',
                    label: 'Alt Text تصاویر',
                    value: imgAltStats.length === 0 ? 'بدون مشکل' : `${imgAltStats.length} پست`,
                    detail: imgAltStats.length > 0
                      ? imgAltStats.map(x => `"${x.title?.slice(0,25)}" — ${x.noAlt} img بدون alt`).join(' · ')
                      : 'همه تصاویر دارای alt text هستند',
                  },
                  {
                    status: nonWebp.length === 0 ? 'pass' : 'warn' as 'pass'|'warn'|'fail',
                    label: 'فرمت WebP',
                    value: nonWebp.length === 0 ? 'همه WebP' : `${nonWebp.length} تصویر غیر-WebP`,
                    detail: nonWebp.length > 0
                      ? `پیشنهاد: تبدیل تصاویر به WebP برای سرعت بیشتر`
                      : 'همه تصاویر از فرمت WebP استفاده می‌کنند',
                  },
                ];
                const statusIcon = (s: string) =>
                  s === 'pass' ? <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
                  : s === 'warn' ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>⚠</span>
                  : <span style={{ color: '#ef4444', fontWeight: 700 }}>✗</span>;

                return (
                  <div style={{ ...card, padding: '16px 18px' }}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        <Image size={13} color="#a78bfa" /> Image SEO Optimizer
                      </p>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {blogPosts.length} پست بررسی شد
                      </span>
                    </div>

                    <div className="space-y-3">
                      {checks.map(c => (
                        <div key={c.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px' }}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {statusIcon(c.status)}
                              <span className="text-[11px] px-2 py-0.5 rounded-full"
                                style={{
                                  background: c.status === 'pass' ? 'rgba(34,197,94,0.1)' : c.status === 'warn' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                  color:      c.status === 'pass' ? '#22c55e' : c.status === 'warn' ? '#f59e0b' : '#ef4444',
                                }}>
                                {c.value}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-white">{c.label}</span>
                          </div>
                          <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>{c.detail}</p>
                        </div>
                      ))}
                    </div>

                    {/* Tips */}
                    <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <p>💡 نام فایل تصویر باید توصیفی باشد: <code style={{ fontSize: 10 }}>capital-network-vc.webp</code></p>
                      <p>💡 ابعاد توصیه‌شده برای OG image: ۱۲۰۰×۶۳۰ پیکسل</p>
                    </div>
                  </div>
                );
              })()}

              {/* ── Internal Link Suggestions (real analysis) ─────────────── */}
              {(() => {
                // count internal links per post by scanning content for href="/..." or href="http...capitalnetwork"
                const analyzed = blogPosts.map((p: any) => {
                  const content: string = p.content ?? '';
                  const internal = (content.match(/href=["'](\/[^"']*|https?:\/\/[^"']*capitalnetwork[^"']*)["']/gi) ?? []).length;
                  const external = (content.match(/href=["']https?:\/\/[^"']*["']/gi) ?? []).length - internal;
                  const tags     = (p.tags ?? []) as string[];
                  return { id: p.id, title: p.title ?? '', slug: p.slug, internal, external: Math.max(0, external), tags };
                });

                const zeroInternal = analyzed.filter(p => p.internal === 0);
                const lowInternal  = analyzed.filter(p => p.internal === 1);
                const goodInternal = analyzed.filter(p => p.internal >= 2);

                // tag-based related posts (top 3 suggestions for each post with 0 internal links)
                const tagSuggestions = zeroInternal.slice(0, 4).map(post => {
                  const related = analyzed
                    .filter(other => other.id !== post.id && other.tags.some(t => post.tags.includes(t)))
                    .slice(0, 2);
                  return { post, related };
                });

                const overallStatus = zeroInternal.length > blogPosts.length * 0.5 ? 'fail'
                  : zeroInternal.length > 0 ? 'warn' : 'pass';

                return (
                  <div style={{ ...card, padding: '16px 18px' }}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        <Link2 size={13} color="#22c55e" /> Internal Link Suggestions
                      </p>
                      <span className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{
                          background: overallStatus === 'pass' ? 'rgba(34,197,94,0.1)' : overallStatus === 'warn' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                          color:      overallStatus === 'pass' ? '#22c55e' : overallStatus === 'warn' ? '#f59e0b' : '#ef4444',
                        }}>
                        {blogPosts.length} پست بررسی شد
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { num: goodInternal.length, lbl: 'لینک کافی (≥۲)', color: '#22c55e' },
                        { num: lowInternal.length,  lbl: 'لینک کم (۱)',     color: '#f59e0b' },
                        { num: zeroInternal.length, lbl: 'بدون لینک',      color: '#ef4444' },
                      ].map(s => (
                        <div key={s.lbl} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                          <p className="text-lg font-black" style={{ color: s.color }}>{s.num}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.lbl}</p>
                        </div>
                      ))}
                    </div>

                    {/* Posts needing attention */}
                    {zeroInternal.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[11px] font-bold mb-2" style={{ color: '#ef4444' }}>
                          پست‌های بدون لینک داخلی ({zeroInternal.length}):
                        </p>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {zeroInternal.slice(0, 6).map((p: any) => (
                            <div key={p.id} className="flex items-center gap-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                              <span style={{ color: '#ef4444', flexShrink: 0 }}>✗</span>
                              <span className="truncate flex-1">{p.title?.slice(0, 40)}{p.title?.length > 40 ? '…' : ''}</span>
                              {p.slug && (
                                <span className="flex-shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded"
                                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}>
                                  /{p.slug?.slice(0,18)}
                                </span>
                              )}
                            </div>
                          ))}
                          {zeroInternal.length > 6 && (
                            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>+{zeroInternal.length - 6} پست دیگر</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tag-based suggestions */}
                    {tagSuggestions.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[11px] font-bold mb-2" style={{ color: '#22c55e' }}>
                          پیشنهاد لینک داخلی بر اساس تگ:
                        </p>
                        <div className="space-y-2">
                          {tagSuggestions.map(({ post, related }) => related.length > 0 && (
                            <div key={post.id} style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 8, padding: '8px 12px' }}>
                              <p className="text-[11px] font-semibold text-white mb-1 truncate">
                                «{post.title?.slice(0, 35)}{post.title?.length > 35 ? '…' : ''}»
                              </p>
                              <p className="text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>لینک به:</p>
                              {related.map(r => (
                                <p key={r.id} className="text-[10px] flex items-center gap-1.5" style={{ color: '#22c55e' }}>
                                  <ArrowLeft size={9} />
                                  {r.title?.slice(0, 40)}{r.title?.length > 40 ? '…' : ''}
                                </p>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Static best-practice tips */}
                    <div className="pt-3 border-t border-white/5 space-y-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <p>📌 هر مقاله حداقل ۲–۳ لینک داخلی داشته باشد</p>
                      <p>📌 از Anchor Text توصیفی استفاده کنید، نه «کلیک کنید»</p>
                      <p>📌 در هر مقاله به صفحه خدمات لینک دهید (Conversion)</p>
                    </div>
                  </div>
                );
              })()}

              {/* ══ Schema Workshop — اختصاصی برای هر صفحه ══════════════════ */}
              {(() => {
                const BASE2 = 'https://capitalnetwork.ir';
                const sn2   = settings?.seo_site_name ?? 'Capital Network';
                const defImg2 = settings?.seo_default_og_image
                  ? (settings.seo_default_og_image.startsWith('http') ? settings.seo_default_og_image : `${BASE2}${settings.seo_default_og_image}`)
                  : `${BASE2}/og-image.png`;

                // ── تعریف هر صفحه با رنگ + icon + نوع schema اختصاصی ────────
                const TECH_PAGES: Array<{
                  key: string; label: string; url: string;
                  color: string; colorRgb: string; icon: React.ReactNode;
                  schemaTypes: string; schemaCount: number; note: string;
                }> = [
                  { key: 'home',       label: 'صفحه اصلی',      url: '/',           color: '#00BCD4', colorRgb: '0,188,212',   icon: <Globe size={13} />,      schemaTypes: 'WebSite + Organization + WebPage + FAQPage',        schemaCount: 4, note: 'SearchAction + سازمان + صفحه اصلی + FAQ' },
                  { key: 'services',   label: 'خدمات',           url: '/services',   color: '#f59e0b', colorRgb: '245,158,11',  icon: <Zap size={13} />,        schemaTypes: 'ProfessionalService + ItemList + CollectionPage',    schemaCount: 4, note: 'خدمات + لیست سرویس‌ها + کاتالوگ خدمات' },
                  { key: 'process',    label: 'فرآیند',           url: '/process',    color: '#a78bfa', colorRgb: '167,139,250', icon: <ArrowRight size={13} />, schemaTypes: 'HowTo + WebPage + BreadcrumbList',                   schemaCount: 3, note: 'فرآیند گام‌به‌گام + زمان + ابزار' },
                  { key: 'about',      label: 'درباره ما',        url: '/about',      color: '#22c55e', colorRgb: '34,197,94',   icon: <Users size={13} />,      schemaTypes: 'Organization + AboutPage + Person[] + ItemList',     schemaCount: 4, note: 'سازمان + تیم + اعضا + ماموریت' },
                  { key: 'contact',    label: 'تماس با ما',       url: '/contact',    color: '#fb923c', colorRgb: '251,146,60',  icon: <Phone size={13} />,      schemaTypes: 'Organization + LocalBusiness + ContactPage',         schemaCount: 4, note: 'کسب‌وکار محلی + تماس + آدرس' },
                  { key: 'evaluation', label: 'ارزیابی',          url: '/evaluation', color: '#ef4444', colorRgb: '239,68,68',   icon: <FileText size={13} />,   schemaTypes: 'WebPage(ApplyAction) + Service + BreadcrumbList',    schemaCount: 3, note: 'فرم ارزیابی + Offer رایگان' },
                ];

                // ── تولید Schema واقعی برای هر صفحه ─────────────────────────
                const buildTechSchemas = (pk: string): object[] => {
                  const p     = settings?.seo_pages?.[pk] ?? {} as any;
                  const url   = pk === 'home' ? `${BASE2}/` : `${BASE2}/${pk}`;
                  const title = p.title  || sn2;
                  const desc  = p.description || 'شریک استراتژیک استارتاپ‌ها در مسیر جذب سرمایه';
                  const pgImg = p.og_image ? (p.og_image.startsWith('http') ? p.og_image : `${BASE2}${p.og_image}`) : defImg2;

                  const orgNode2: Record<string, any> = {
                    '@type': ['Organization','ProfessionalService'], '@id': `${BASE2}/#organization`,
                    name: sn2, alternateName: 'Capital Network Iran', url: BASE2, inLanguage: 'fa-IR',
                    logo: { '@type': 'ImageObject', '@id': `${BASE2}/#logo`, url: `${BASE2}/logo.svg`, width: 600, height: 120, caption: sn2 },
                    description: 'شریک استراتژیک استارتاپ‌ها در مسیر جذب سرمایه از Seed تا Series B',
                    foundingDate: '2020', knowsAbout: ['Venture Capital','Startup Investment','Financial Modeling','Pitch Deck','Term Sheet'],
                    areaServed: ['IR','Middle East','Global'],
                    ...(settings?.contact_phone ? { telephone: settings.contact_phone } : {}),
                    ...(settings?.contact_email ? { email: settings.contact_email } : {}),
                    ...([settings?.social_linkedin, settings?.social_twitter, settings?.social_instagram, settings?.social_youtube].filter(Boolean).length > 0
                      ? { sameAs: [settings?.social_linkedin, settings?.social_twitter, settings?.social_instagram, settings?.social_youtube].filter(Boolean) }
                      : {}),
                    ...(settings?.working_hours ? { openingHoursSpecification: { '@type': 'OpeningHoursSpecification', description: settings.working_hours } } : {}),
                  };

                  const crumb2 = (lbl2: string, cu: string) => ({
                    '@context': 'https://schema.org', '@type': 'BreadcrumbList', '@id': `${cu}#breadcrumb`,
                    itemListElement: [
                      { '@type': 'ListItem', position: 1, name: 'خانه', item: { '@type': 'WebPage', '@id': `${BASE2}/`, url: `${BASE2}/`, name: 'خانه' } },
                      { '@type': 'ListItem', position: 2, name: lbl2, item: { '@type': 'WebPage', '@id': cu, url: cu, name: lbl2 } },
                    ],
                  });

                  if (pk === 'home') {
                    const schemas: object[] = [
                      { '@context': 'https://schema.org', ...orgNode2 },
                      { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${BASE2}/#website`, name: sn2, alternateName: 'کپیتال نتورک', url: BASE2, description: desc, inLanguage: 'fa-IR', publisher: { '@id': `${BASE2}/#organization` }, image: { '@type': 'ImageObject', '@id': `${BASE2}/#primaryImage`, url: pgImg, width: 1200, height: 630 }, potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${BASE2}/blog?q={search_term_string}` }, 'query-input': 'required name=search_term_string' } },
                      { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${BASE2}/`, url: `${BASE2}/`, name: title, description: desc, isPartOf: { '@id': `${BASE2}/#website` }, about: { '@id': `${BASE2}/#organization` }, inLanguage: 'fa-IR', breadcrumb: { '@id': `${BASE2}/#breadcrumb` }, potentialAction: { '@type': 'ReadAction', target: [`${BASE2}/`] } },
                      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', '@id': `${BASE2}/#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'خانه', item: { '@type': 'WebPage', '@id': `${BASE2}/`, url: `${BASE2}/`, name: 'خانه' } }] },
                    ];
                    const fq = settings?.home_faq_items ?? [];
                    if (fq.length > 0) schemas.push({ '@context': 'https://schema.org', '@type': 'FAQPage', '@id': `${BASE2}/#faq`, url: `${BASE2}/`, name: 'سوالات متداول جذب سرمایه', mainEntity: fq.slice(0,10).map((f: any) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
                    return schemas;
                  }

                  if (pk === 'services') {
                    const cards = (settings?.services_cards ?? []).slice(0,6);
                    const hl    = (settings?.services_highlights ?? []).slice(0,3);
                    const mainSvc: Record<string, any> = {
                      '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': `${url}#main-service`,
                      name: sn2, url, description: desc, image: pgImg, inLanguage: 'fa-IR',
                      provider: { '@id': `${BASE2}/#organization` },
                      serviceType: p.schema_service_type || 'Startup Investment Advisory & Fundraising',
                      category: 'Financial Services', areaServed: ['IR','Middle East','Global'],
                      audience: { '@type': 'Audience', audienceType: 'Startups seeking venture capital' },
                      ...(hl.length > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', bestRating: '5', worstRating: '1', ratingCount: hl[0]?.value?.replace(/[^0-9]/g,'') || '50', reviewCount: hl[0]?.value?.replace(/[^0-9]/g,'') || '50', description: hl.map((h: any) => `${h.value} — ${h.label}`).join(' | ') } } : {}),
                      ...(p.schema_price_range ? { priceRange: p.schema_price_range } : {}),
                      ...(p.schema_area_served ? { areaServed: p.schema_area_served.split(',').map((s: string) => s.trim()) } : {}),
                    };
                    const svcList = cards.length > 0 ? {
                      '@context': 'https://schema.org', '@type': 'ItemList', '@id': `${url}#service-list`,
                      name: 'خدمات Capital Network', url, numberOfItems: cards.length,
                      itemListElement: cards.map((c: any, i: number) => ({
                        '@type': 'ListItem', position: i+1,
                        item: { '@type': 'Service', '@id': `${url}#service-${i+1}`, name: c.title, description: c.desc, url, serviceType: 'Investment Advisory', provider: { '@id': `${BASE2}/#organization` }, areaServed: ['IR','Middle East'], ...(c.features?.length > 0 ? { hasOfferCatalog: { '@type': 'OfferCatalog', name: `ویژگی‌های ${c.title}`, itemListElement: c.features.map((f: string, j: number) => ({ '@type': 'Offer', position: j+1, name: f })) } } : {}) },
                      })),
                    } : null;
                    return [
                      { '@context': 'https://schema.org', ...orgNode2 },
                      mainSvc,
                      ...(svcList ? [svcList] : []),
                      { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url, url, name: title, description: desc, isPartOf: { '@id': `${BASE2}/#website` }, inLanguage: 'fa-IR' },
                      crumb2('خدمات', url),
                    ];
                  }

                  if (pk === 'process') {
                    const steps   = (settings?.process_steps ?? []).slice(0,8);
                    const avgDays = settings?.home_process_avg_days ?? '40 روز';
                    const defSteps = [
                      { '@type': 'HowToStep', position: 1, name: 'ارزیابی اولیه', text: 'تیم Capital Network استارتاپ شما را ارزیابی می‌کند', url: `${url}#step-1` },
                      { '@type': 'HowToStep', position: 2, name: 'آماده‌سازی مستندات', text: 'Pitch Deck، مدل مالی و مستندات VC-Ready آماده می‌شوند', url: `${url}#step-2` },
                      { '@type': 'HowToStep', position: 3, name: 'معرفی به سرمایه‌گذاران', text: 'معرفی هدفمند به VCهای مناسب از شبکه ۱۲۸+ سرمایه‌گذار', url: `${url}#step-3` },
                      { '@type': 'HowToStep', position: 4, name: 'پشتیبانی تا Term Sheet', text: 'پشتیبانی کامل تا بستن قرارداد', url: `${url}#step-4` },
                    ];
                    return [
                      { '@context': 'https://schema.org', '@type': 'HowTo', '@id': `${url}#howto`, name: title, description: desc, url, inLanguage: 'fa-IR', image: { '@type': 'ImageObject', url: pgImg, width: 1200, height: 630 }, totalTime: `P${avgDays.replace(/[^0-9-]/g,'').split('-')[1] ?? '40'}D`, estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0', description: 'مشاوره اولیه رایگان' }, supply: [{ '@type': 'HowToSupply', name: 'Pitch Deck' }, { '@type': 'HowToSupply', name: 'Financial Model' }, { '@type': 'HowToSupply', name: 'Cap Table' }], tool: [{ '@type': 'HowToTool', name: 'Capital Network Platform' }, { '@type': 'HowToTool', name: 'VC Network +128' }], step: steps.length > 0 ? steps.map((s: any, i: number) => ({ '@type': 'HowToStep', '@id': `${url}#step-${i+1}`, position: i+1, name: s.title, text: s.text, url: `${url}#step-${i+1}`, image: { '@type': 'ImageObject', url: pgImg } })) : defSteps },
                      { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url, url, name: title, description: desc, isPartOf: { '@id': `${BASE2}/#website` }, inLanguage: 'fa-IR' },
                      crumb2('فرآیند', url),
                    ];
                  }

                  if (pk === 'about') {
                    const team    = (settings?.team ?? []).slice(0,10);
                    const persons = team.map((m: any, i: number) => ({ '@type': 'Person', '@id': `${url}#person-${i+1}`, name: m.name, jobTitle: m.role, description: m.bio ?? '', worksFor: { '@id': `${BASE2}/#organization` }, url, ...(m.avatar ? { image: { '@type': 'ImageObject', url: m.avatar } } : {}) }));
                    const result: object[] = [
                      { '@context': 'https://schema.org', ...orgNode2, slogan: settings?.about_mission?.text ?? 'شریک استراتژیک استارتاپ‌ها', ...(persons.length > 0 ? { employee: persons } : {}) },
                      { '@context': 'https://schema.org', '@type': 'AboutPage', '@id': url, url, name: title, description: desc, image: pgImg, inLanguage: 'fa-IR', isPartOf: { '@id': `${BASE2}/#website` }, about: { '@id': `${BASE2}/#organization` }, mainEntity: { '@id': `${BASE2}/#organization` }, breadcrumb: { '@id': `${url}#breadcrumb` }, speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1','h2'] } },
                    ];
                    if (persons.length > 0) result.push({ '@context': 'https://schema.org', '@type': 'ItemList', '@id': `${url}#team-list`, name: 'تیم Capital Network', url, numberOfItems: persons.length, itemListElement: persons.map((pn: any, i: number) => ({ '@type': 'ListItem', position: i+1, item: pn })) });
                    result.push(crumb2('درباره ما', url));
                    return result;
                  }

                  if (pk === 'contact') {
                    const cpts: object[] = [];
                    if (settings?.contact_email)    cpts.push({ '@type': 'ContactPoint', contactType: 'customer support', email: settings.contact_email, availableLanguage: [{ '@type': 'Language', name: 'Persian', alternateName: 'fa' },{ '@type': 'Language', name: 'English', alternateName: 'en' }], areaServed: 'IR' });
                    if (settings?.contact_phone)    cpts.push({ '@type': 'ContactPoint', contactType: 'customer support', telephone: settings.contact_phone, hoursAvailable: { '@type': 'OpeningHoursSpecification', description: settings.working_hours ?? 'شنبه تا چهارشنبه ۹–۱۸' }, areaServed: 'IR' });
                    if (settings?.contact_whatsapp) cpts.push({ '@type': 'ContactPoint', contactType: 'sales', telephone: settings.contact_whatsapp, contactOption: 'TollFree', description: 'واتساپ — پاسخگویی سریع' });
                    return [
                      { '@context': 'https://schema.org', ...orgNode2, ...(cpts.length > 0 ? { contactPoint: cpts } : {}) },
                      { '@context': 'https://schema.org', '@type': ['LocalBusiness','FinancialService'], '@id': `${url}#local-business`, name: sn2, url, description: desc, image: pgImg, inLanguage: 'fa-IR', priceRange: p.schema_price_range || '$$$', currenciesAccepted: 'IRR, USD', paymentAccepted: 'Bank Transfer', ...(settings?.contact_phone ? { telephone: settings.contact_phone } : {}), ...(settings?.contact_email ? { email: settings.contact_email } : {}), ...(settings?.working_hours ? { openingHoursSpecification: { '@type': 'OpeningHoursSpecification', description: settings.working_hours, dayOfWeek: ['Saturday','Sunday','Monday','Tuesday','Wednesday'], opens: '09:00', closes: '18:00' } } : {}), ...(cpts.length > 0 ? { contactPoint: cpts } : {}), geo: { '@type': 'GeoCoordinates', latitude: '35.6892', longitude: '51.3890' }, hasMap: 'https://maps.google.com/?q=Tehran,+Iran' },
                      { '@context': 'https://schema.org', '@type': 'ContactPage', '@id': url, url, name: title, description: desc, image: pgImg, inLanguage: 'fa-IR', isPartOf: { '@id': `${BASE2}/#website` }, about: { '@id': `${BASE2}/#organization` }, mainEntity: { '@id': `${BASE2}/#organization` }, breadcrumb: { '@id': `${url}#breadcrumb` } },
                      crumb2('تماس با ما', url),
                    ];
                  }

                  if (pk === 'evaluation') {
                    const today2 = new Date().toISOString().split('T')[0];
                    return [
                      { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url, url, name: title, description: desc, image: pgImg, inLanguage: 'fa-IR', isPartOf: { '@id': `${BASE2}/#website` }, about: { '@id': `${BASE2}/#organization` }, breadcrumb: { '@id': `${url}#breadcrumb` }, potentialAction: { '@type': 'ApplyAction', name: 'درخواست ارزیابی استارتاپ', description: 'درخواست ارزیابی رایگان استارتاپ توسط تیم Capital Network', target: { '@type': 'EntryPoint', urlTemplate: url, actionAccessibilityRequirement: { '@type': 'ActionAccessSpecification', category: 'Free', availabilityStarts: today2, eligibleRegion: { '@type': 'Country', name: 'Iran' } } }, result: { '@type': 'Service', name: 'ارزیابی آمادگی برای جذب سرمایه', provider: { '@id': `${BASE2}/#organization` } } } },
                      { '@context': 'https://schema.org', '@type': 'Service', '@id': `${url}#evaluation-service`, name: 'ارزیابی رایگان آمادگی برای جذب سرمایه', alternateName: 'Free Startup Investment Readiness Evaluation', url, description: desc, serviceType: 'Startup Evaluation & Investment Readiness Assessment', category: 'Financial Advisory', provider: { '@id': `${BASE2}/#organization` }, audience: { '@type': 'Audience', audienceType: 'Startups at Seed to Series B stage' }, areaServed: ['IR','Middle East'], offers: { '@type': 'Offer', name: 'ارزیابی رایگان', price: '0', priceCurrency: 'IRR', availability: 'https://schema.org/InStock', validFrom: today2, seller: { '@id': `${BASE2}/#organization` } }, hasOfferCatalog: { '@type': 'OfferCatalog', name: 'آنچه در ارزیابی بررسی می‌شود', itemListElement: [{ '@type': 'Offer', position: 1, name: 'بررسی Market Fit' },{ '@type': 'Offer', position: 2, name: 'ارزیابی تیم و مدل کسب‌وکار' },{ '@type': 'Offer', position: 3, name: 'آمادگی مستندات (Pitch Deck، مدل مالی)' },{ '@type': 'Offer', position: 4, name: 'تعیین استراتژی جذب سرمایه' }] } },
                      crumb2('درخواست ارزیابی', url),
                    ];
                  }

                  return [{ '@context': 'https://schema.org', '@type': 'WebPage', '@id': url, url, name: title, description: desc, inLanguage: 'fa-IR', isPartOf: { '@id': `${BASE2}/#website` } }];
                };

                const TC2: Record<string, string> = { 'WebSite': '#00BCD4', 'Organization': '#22c55e', 'ProfessionalService': '#22c55e', 'WebPage': '#a78bfa', 'AboutPage': '#a78bfa', 'ContactPage': '#fb923c', 'CollectionPage': '#a78bfa', 'HowTo': '#f59e0b', 'FAQPage': '#f59e0b', 'ItemList': '#7dd3fc', 'Service': '#f59e0b', 'BreadcrumbList': '#6b7280', 'LocalBusiness': '#fb923c', 'FinancialService': '#fb923c' };

                const activeTechPage  = TECH_PAGES.find(pg => pg.key === techSchemaPage)!;
                const techSchemas     = buildTechSchemas(techSchemaPage);
                const sp2: PageSEO    = settings.seo_pages?.[techSchemaPage] ?? {} as PageSEO;

                return (
                  <div style={{ ...card, padding: '18px' }}>

                    {/* ─── Header ────────────────────────────────────────── */}
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-2">
                          <Code size={13} color="#22c55e" /> Schema Workshop
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          Schema.org JSON-LD 2026 — اختصاصی برای هر صفحه، واقعی از Supabase
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer"
                          style={{ ...ghostBtn, textDecoration: 'none', fontSize: 11 } as any}>
                          <ExternalLink size={11} /> Rich Results
                        </a>
                        <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer"
                          style={{ ...ghostBtn, textDecoration: 'none', fontSize: 11 } as any}>
                          <ExternalLink size={11} /> Validator
                        </a>
                      </div>
                    </div>

                    {/* ─── Page Tabs ─────────────────────────────────────── */}
                    <div className="flex gap-1.5 flex-wrap mb-4">
                      {TECH_PAGES.map(pg => (
                        <button key={pg.key}
                          onClick={() => { setTechSchemaPage(pg.key); setTechSchemaExpanded(0); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: techSchemaPage === pg.key ? `rgba(${pg.colorRgb},0.15)` : 'rgba(255,255,255,0.04)',
                            color: techSchemaPage === pg.key ? pg.color : 'rgba(255,255,255,0.5)',
                            border: techSchemaPage === pg.key ? `1px solid ${pg.color}44` : '1px solid rgba(255,255,255,0.08)',
                          }}>
                          <span style={{ color: techSchemaPage === pg.key ? pg.color : 'rgba(255,255,255,0.3)' }}>{pg.icon}</span>
                          {pg.label}
                          <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: `rgba(${pg.colorRgb},0.15)`, color: pg.color }}>
                            {techSchemas.length > 0 ? techSchemas.length : pg.schemaCount}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* ─── Page Info Strip ───────────────────────────────── */}
                    <div className="flex items-start gap-3 mb-4 p-3 rounded-xl" style={{ background: `rgba(${activeTechPage.colorRgb},0.06)`, border: `1px solid ${activeTechPage.color}22` }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${activeTechPage.color}18`, border: `1px solid ${activeTechPage.color}33` }}>
                        <span style={{ color: activeTechPage.color }}>{activeTechPage.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-bold text-white">{activeTechPage.label}</p>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${activeTechPage.color}15`, color: activeTechPage.color }}>{techSchemas.length} schema block</span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', direction: 'ltr' }}>{activeTechPage.url}</span>
                        </div>
                        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{activeTechPage.note}</p>
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: `${activeTechPage.color}88` }}>{activeTechPage.schemaTypes}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(techSchemas.map(s => JSON.stringify(s, null, 2)).join('\n\n'));
                            setCopiedTechSchema(techSchemaPage + '_all');
                            setTimeout(() => setCopiedTechSchema(null), 2000);
                          }}
                          style={{ ...ghostBtn, padding: '5px 10px', fontSize: 11 }}>
                          {copiedTechSchema === techSchemaPage + '_all' ? <CheckCircle size={11} color="#22c55e" /> : <Copy size={11} />} همه
                        </button>
                      </div>
                    </div>

                    {/* ─── فیلدهای ویرایش اختصاصی هر صفحه ─────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="md:col-span-2">
                        <p className="text-[11px] font-bold mb-2" style={{ color: activeTechPage.color }}>
                          فیلدهای Schema — {activeTechPage.label}
                        </p>
                      </div>

                      {/* فیلدهای مشترک همه صفحات */}
                      <div>
                        <span style={lbl}>نام Schema (name)</span>
                        <input value={sp2.schema_name ?? ''} onChange={e => updatePage(techSchemaPage, 'schema_name', e.target.value)} placeholder={sp2.title || activeTechPage.label} style={inputS} />
                      </div>
                      <div>
                        <span style={lbl}>تصویر Schema (image)</span>
                        <input value={sp2.schema_image ?? ''} onChange={e => updatePage(techSchemaPage, 'schema_image', e.target.value)} placeholder="/og-image.png" style={{ ...inputS, direction: 'ltr' }} />
                      </div>
                      <div className="md:col-span-2">
                        <span style={lbl}>توضیح Schema (description)</span>
                        <textarea value={sp2.schema_description ?? ''} onChange={e => updatePage(techSchemaPage, 'schema_description', e.target.value)} rows={2} placeholder={sp2.description || 'توضیح اختصاصی برای این Schema'} style={textareaS} />
                      </div>

                      {/* فیلدهای اختصاصی صفحه خدمات */}
                      {techSchemaPage === 'services' && (
                        <>
                          <div>
                            <span style={lbl}>نوع سرویس (serviceType)</span>
                            <input value={sp2.schema_service_type ?? ''} onChange={e => updatePage(techSchemaPage, 'schema_service_type', e.target.value)} placeholder="Startup Investment Advisory & Fundraising" style={{ ...inputS, direction: 'ltr' }} />
                          </div>
                          <div>
                            <span style={lbl}>محدوده قیمت (priceRange)</span>
                            <input value={sp2.schema_price_range ?? ''} onChange={e => updatePage(techSchemaPage, 'schema_price_range', e.target.value)} placeholder="$$$" style={{ ...inputS, direction: 'ltr' }} />
                          </div>
                          <div>
                            <span style={lbl}>منطقه خدمات (areaServed)</span>
                            <input value={sp2.schema_area_served ?? ''} onChange={e => updatePage(techSchemaPage, 'schema_area_served', e.target.value)} placeholder="Iran, Middle East, Global" style={{ ...inputS, direction: 'ltr' }} />
                          </div>
                        </>
                      )}

                      {/* فیلدهای اختصاصی صفحه تماس */}
                      {techSchemaPage === 'contact' && (
                        <>
                          <div>
                            <span style={lbl}>تلفن (از settings)</span>
                            <input value={settings?.contact_phone ?? ''} onChange={e => setSettings((p: any) => ({ ...p, contact_phone: e.target.value }))} placeholder="+98 21 XXXX XXXX" style={{ ...inputS, direction: 'ltr' }} />
                          </div>
                          <div>
                            <span style={lbl}>ایمیل (از settings)</span>
                            <input value={settings?.contact_email ?? ''} onChange={e => setSettings((p: any) => ({ ...p, contact_email: e.target.value }))} placeholder="info@capitalnetwork.ir" style={{ ...inputS, direction: 'ltr' }} />
                          </div>
                          <div>
                            <span style={lbl}>واتساپ (از settings)</span>
                            <input value={settings?.contact_whatsapp ?? ''} onChange={e => setSettings((p: any) => ({ ...p, contact_whatsapp: e.target.value }))} placeholder="+989XXXXXXXXX" style={{ ...inputS, direction: 'ltr' }} />
                          </div>
                          <div>
                            <span style={lbl}>ساعات کاری (از settings)</span>
                            <input value={settings?.working_hours ?? ''} onChange={e => setSettings((p: any) => ({ ...p, working_hours: e.target.value }))} placeholder="شنبه تا چهارشنبه ۹–۱۸" style={inputS} />
                          </div>
                          <div>
                            <span style={lbl}>محدوده قیمت LocalBusiness</span>
                            <input value={sp2.schema_price_range ?? ''} onChange={e => updatePage(techSchemaPage, 'schema_price_range', e.target.value)} placeholder="$$$" style={{ ...inputS, direction: 'ltr' }} />
                          </div>
                        </>
                      )}

                      {/* فیلدهای اختصاصی صفحه اصلی */}
                      {techSchemaPage === 'home' && (
                        <div className="md:col-span-2">
                          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            💡 FAQ برای FAQPage schema از <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 4px', borderRadius: 3 }}>settings.home_faq_items</code> خوانده می‌شود
                            {(settings?.home_faq_items?.length ?? 0) > 0
                              ? <span style={{ color: '#22c55e' }}> — {settings.home_faq_items.length} سوال یافت شد ✓</span>
                              : <span style={{ color: '#f59e0b' }}> — سوالی ثبت نشده (FAQPage اضافه نخواهد شد)</span>
                            }
                          </p>
                        </div>
                      )}

                      {/* فیلدهای اختصاصی صفحه درباره ما */}
                      {techSchemaPage === 'about' && (
                        <div className="md:col-span-2">
                          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            👥 اعضای تیم از <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 4px', borderRadius: 3 }}>settings.team</code> خوانده می‌شوند
                            {(settings?.team?.length ?? 0) > 0
                              ? <span style={{ color: '#22c55e' }}> — {settings.team.length} عضو یافت شد ✓</span>
                              : <span style={{ color: '#f59e0b' }}> — عضوی ثبت نشده (ItemList تیم اضافه نخواهد شد)</span>
                            }
                          </p>
                        </div>
                      )}

                      {/* فیلدهای اختصاصی صفحه فرآیند */}
                      {techSchemaPage === 'process' && (
                        <div className="md:col-span-2">
                          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            ⚙️ مراحل از <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 4px', borderRadius: 3 }}>settings.process_steps</code> خوانده می‌شوند
                            {(settings?.process_steps?.length ?? 0) > 0
                              ? <span style={{ color: '#22c55e' }}> — {settings.process_steps.length} مرحله یافت شد ✓ · میانگین {settings?.home_process_avg_days ?? '40 روز'}</span>
                              : <span style={{ color: '#f59e0b' }}> — مرحله‌ای ثبت نشده (از مراحل پیش‌فرض استفاده می‌شود)</span>
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ─── Schema Blocks Accordion ───────────────────────── */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] font-bold" style={{ color: activeTechPage.color }}>Schema Blocks — {techSchemas.length} block</p>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>واقعی از Supabase — در &lt;head&gt; inject می‌شود</span>
                      </div>
                      {techSchemas.map((schema: any, idx: number) => {
                        const sj2   = JSON.stringify(schema, null, 2);
                        const st2   = schema['@type'];
                        const stl2  = Array.isArray(st2) ? st2.join(' + ') : (st2 ?? 'Schema');
                        const tc2   = TC2[Array.isArray(st2) ? st2[0] : st2] ?? '#94a3b8';
                        const isOpen2 = techSchemaExpanded === idx;
                        return (
                          <div key={idx} style={{ ...card, overflow: 'hidden' }}>
                            <button
                              onClick={() => setTechSchemaExpanded(isOpen2 ? -1 : idx)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-right"
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                                style={{ background: `${tc2}18`, border: `1px solid ${tc2}33`, color: tc2 }}>{idx + 1}</div>
                              <div className="flex-1 text-right">
                                <p className="text-xs font-bold" style={{ color: tc2 }}>{stl2}</p>
                                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                  {schema['@id'] ? schema['@id'].replace('https://capitalnetwork.ir', '') : `block ${idx + 1}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${tc2}15`, color: tc2 }}>
                                  {sj2.split('\n').length} lines
                                </span>
                                <button
                                  onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(sj2); setCopiedTechSchema(`${techSchemaPage}_${idx}`); setTimeout(() => setCopiedTechSchema(null), 2000); }}
                                  style={{ ...ghostBtn, padding: '4px 8px', fontSize: 10 }}>
                                  {copiedTechSchema === `${techSchemaPage}_${idx}` ? <CheckCircle size={10} color="#22c55e" /> : <Copy size={10} />}
                                </button>
                                {isOpen2 ? <ChevronUp size={13} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={13} color="rgba(255,255,255,0.3)" />}
                              </div>
                            </button>
                            {isOpen2 && (
                              <div className="px-4 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <a
                                    href={`https://validator.schema.org/#url=data:application/ld%2Bjson,${encodeURIComponent(sj2)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    style={{ ...ghostBtn, padding: '4px 10px', fontSize: 10, textDecoration: 'none' } as any}>
                                    <ExternalLink size={10} /> اعتبارسنجی
                                  </a>
                                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                    داده واقعی — اعمال‌شده در &lt;head&gt;
                                  </span>
                                </div>
                                <pre style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${tc2}22`, borderRadius: 8, padding: 12, fontSize: 11, color: tc2 === '#6b7280' ? '#94a3b8' : tc2, direction: 'ltr', overflow: 'auto', maxHeight: 340, lineHeight: 1.55, margin: 0 }}>
                                  {sj2}
                                </pre>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* ─── وضعیت کلی همه صفحات ──────────────────────────── */}
                    <div className="pt-3 border-t border-white/5">
                      <p className="text-[11px] font-bold text-white mb-2">وضعیت Schema همه صفحات</p>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {TECH_PAGES.map(pg => {
                          const pgs2: PageSEO = settings.seo_pages?.[pg.key] ?? {} as PageSEO;
                          const hasTitle = !!pgs2.title;
                          const hasDesc  = !!pgs2.description;
                          const hasCust  = !!pgs2.schema_type;
                          const health   = (hasTitle ? 1 : 0) + (hasDesc ? 1 : 0) + (hasCust ? 1 : 0);
                          const healthColor = health >= 2 ? '#22c55e' : health === 1 ? '#f59e0b' : '#ef4444';
                          return (
                            <button key={pg.key} onClick={() => { setTechSchemaPage(pg.key); setTechSchemaExpanded(0); }}
                              style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${techSchemaPage === pg.key ? pg.color + '44' : 'rgba(255,255,255,0.06)'}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer', textAlign: 'center' }}>
                              <div className="flex items-center justify-center mb-1.5" style={{ color: techSchemaPage === pg.key ? pg.color : 'rgba(255,255,255,0.35)' }}>{pg.icon}</div>
                              <p className="text-[10px] font-semibold" style={{ color: techSchemaPage === pg.key ? pg.color : 'rgba(255,255,255,0.6)' }}>{pg.label}</p>
                              <div className="flex gap-0.5 justify-center mt-1.5">
                                {[hasTitle, hasDesc, hasCust].map((ok, i2) => (
                                  <div key={i2} className="w-1.5 h-1.5 rounded-full" style={{ background: ok ? healthColor : 'rgba(255,255,255,0.1)' }} />
                                ))}
                              </div>
                              <p className="text-[9px] mt-1" style={{ color: healthColor }}>{health === 3 ? '✓ کامل' : health === 2 ? '◐ متوسط' : '○ ناقص'}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })()}
            </>
          )}

          {/* ══════════════════ TAB: SCHEMA & OG ══════════════════ */}
          {activeTab === 'schema' && (() => {
            // ── schema data (no hooks — uses component-level state) ──────────
            const BASE = 'https://capitalnetwork.ir';
            const sn   = settings?.seo_site_name ?? 'Capital Network';
            const img  = settings?.seo_default_og_image
              ? (settings.seo_default_og_image.startsWith('http') ? settings.seo_default_og_image : `${BASE}${settings.seo_default_og_image}`)
              : `${BASE}/og-image.png`;

            const SCHEMA_PAGES = [
              { key: 'home',       label: 'صفحه اصلی',       icon: <Globe      size={13} />, color: '#00BCD4', type: 'WebSite + Organization + WebPage + FAQPage',              desc: 'سایت‌مپ، SearchAction و هویت سازمانی' },
              { key: 'services',   label: 'خدمات',            icon: <Zap        size={13} />, color: '#f59e0b', type: 'ProfessionalService + ItemList + CollectionPage',          desc: 'خدمات با AggregateRating و OfferCatalog' },
              { key: 'process',    label: 'فرآیند',            icon: <ArrowRight size={13} />, color: '#a78bfa', type: 'HowTo + WebPage + BreadcrumbList',                        desc: 'فرآیند قدم به قدم با HowToStep و زمان تخمینی' },
              { key: 'about',      label: 'درباره ما',         icon: <Users      size={13} />, color: '#22c55e', type: 'AboutPage + Organization + Person[] + ItemList',           desc: 'تیم کلیدی، ماموریت و هویت سازمانی' },
              { key: 'contact',    label: 'تماس با ما',        icon: <Phone      size={13} />, color: '#fb923c', type: 'ContactPage + LocalBusiness + Organization',               desc: 'کانال‌های تماس، ساعات کاری و موقعیت' },
              { key: 'evaluation', label: 'درخواست ارزیابی',  icon: <FileText   size={13} />, color: '#ef4444', type: 'WebPage (ApplyAction) + Service + Offer',                  desc: 'فرم ارزیابی رایگان با ActionAccessSpecification' },
            ];

            const orgNode = {
              '@type': ['Organization','ProfessionalService'], '@id': `${BASE}/#organization`,
              name: sn, alternateName: 'Capital Network Iran', url: BASE,
              logo: { '@type': 'ImageObject', '@id': `${BASE}/#logo`, url: `${BASE}/logo.svg`, width: 600, height: 120 },
              description: 'شریک استراتژیک استارتاپ‌ها در مسیر جذب سرمایه از Seed تا Series B',
              foundingDate: '2020', inLanguage: 'fa-IR',
              knowsAbout: ['Venture Capital','Startup Investment','Financial Modeling','Pitch Deck','Term Sheet'],
              areaServed: ['IR','Middle East','Global'],
              ...(settings?.contact_phone  ? { telephone: settings.contact_phone }  : {}),
              ...(settings?.contact_email  ? { email:     settings.contact_email }  : {}),
              ...(settings?.working_hours  ? { openingHoursSpecification: { '@type': 'OpeningHoursSpecification', description: settings.working_hours } } : {}),
              ...([settings?.social_linkedin, settings?.social_twitter, settings?.social_instagram, settings?.social_youtube].filter(Boolean).length > 0
                ? { sameAs: [settings?.social_linkedin, settings?.social_twitter, settings?.social_instagram, settings?.social_youtube].filter(Boolean) } : {}),
            };

            const buildSchemas = (pk: string): object[] => {
              const p     = settings?.seo_pages?.[pk] ?? {} as any;
              const url   = pk === 'home' ? `${BASE}/` : `${BASE}/${pk}`;
              const title = p.title || sn;
              const desc  = p.description || 'شریک استراتژیک استارتاپ‌ها در مسیر جذب سرمایه';
              const pgImg = p.og_image ? (p.og_image.startsWith('http') ? p.og_image : `${BASE}${p.og_image}`) : img;
              const crumb = (lbl: string, cu: string) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'خانه', item: { '@type': 'WebPage', '@id': `${BASE}/`, url: `${BASE}/`, name: 'خانه' } }, { '@type': 'ListItem', position: 2, name: lbl, item: { '@type': 'WebPage', '@id': cu, url: cu, name: lbl } }] });
              if (pk === 'home') {
                const s: object[] = [
                  { '@context': 'https://schema.org', ...orgNode },
                  { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${BASE}/#website`, name: sn, alternateName: 'کپیتال نتورک', url: BASE, description: desc, inLanguage: 'fa-IR', publisher: { '@id': `${BASE}/#organization` }, image: { '@type': 'ImageObject', '@id': `${BASE}/#primaryImage`, url: pgImg, width: 1200, height: 630 }, potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/blog?q={search_term_string}` }, 'query-input': 'required name=search_term_string' } },
                  { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${BASE}/`, url: `${BASE}/`, name: title, description: desc, isPartOf: { '@id': `${BASE}/#website` }, about: { '@id': `${BASE}/#organization` }, inLanguage: 'fa-IR', breadcrumb: { '@id': `${BASE}/#breadcrumb` }, potentialAction: { '@type': 'ReadAction', target: [`${BASE}/`] } },
                  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', '@id': `${BASE}/#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'خانه', item: { '@type': 'WebPage', '@id': `${BASE}/`, url: `${BASE}/`, name: 'خانه' } }] },
                ];
                const fq = settings?.home_faq_items ?? [];
                if (fq.length > 0) s.push({ '@context': 'https://schema.org', '@type': 'FAQPage', '@id': `${BASE}/#faq`, url: `${BASE}/`, name: 'سوالات متداول جذب سرمایه', mainEntity: fq.slice(0,10).map((f: any) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
                return s;
              }
              if (pk === 'services') {
                const cards = (settings?.services_cards ?? []).slice(0,6);
                const hl    = (settings?.services_highlights ?? []).slice(0,3);
                return [
                  { '@context': 'https://schema.org', ...orgNode },
                  { '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': `${url}#main-service`, name: sn, url, description: desc, image: pgImg, inLanguage: 'fa-IR', provider: { '@id': `${BASE}/#organization` }, serviceType: 'Startup Investment Advisory & Fundraising', category: 'Financial Services', areaServed: ['IR','Middle East','Global'], audience: { '@type': 'Audience', audienceType: 'Startups seeking venture capital' }, ...(hl.length > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', bestRating: '5', worstRating: '1', ratingCount: hl[0]?.value?.replace(/[^0-9]/g,'') || '50', description: hl.map((h: any) => `${h.value} — ${h.label}`).join(' | ') } } : {}) },
                  ...(cards.length > 0 ? [{ '@context': 'https://schema.org', '@type': 'ItemList', '@id': `${url}#service-list`, name: 'خدمات Capital Network', url, numberOfItems: cards.length, itemListElement: cards.map((c: any, i: number) => ({ '@type': 'ListItem', position: i+1, item: { '@type': 'Service', '@id': `${url}#service-${i+1}`, name: c.title, description: c.desc, url, serviceType: 'Investment Advisory', provider: { '@id': `${BASE}/#organization` }, areaServed: ['IR','Middle East'], ...(c.features?.length > 0 ? { hasOfferCatalog: { '@type': 'OfferCatalog', name: `ویژگی‌های ${c.title}`, itemListElement: c.features.map((f: string, j: number) => ({ '@type': 'Offer', position: j+1, name: f })) } } : {}) } })) }] : []),
                  { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url, url, name: title, description: desc, isPartOf: { '@id': `${BASE}/#website` }, inLanguage: 'fa-IR' },
                  crumb('خدمات', url),
                ];
              }
              if (pk === 'process') {
                const steps   = (settings?.process_steps ?? []).slice(0,8);
                const avgDays = settings?.home_process_avg_days ?? '40 روز';
                const defSteps = [
                  { '@type': 'HowToStep', position: 1, name: 'ارزیابی اولیه', text: 'تیم Capital Network استارتاپ شما را ارزیابی می‌کند', url: `${url}#step-1` },
                  { '@type': 'HowToStep', position: 2, name: 'آماده‌سازی مستندات', text: 'Pitch Deck، مدل مالی و مستندات VC-Ready آماده می‌شوند', url: `${url}#step-2` },
                  { '@type': 'HowToStep', position: 3, name: 'معرفی به سرمایه‌گذاران', text: 'معرفی هدفمند به VCهای مناسب از شبکه ۱۲۸+ سرمایه‌گذار', url: `${url}#step-3` },
                  { '@type': 'HowToStep', position: 4, name: 'پشتیبانی تا Term Sheet', text: 'پشتیبانی کامل تا بستن قرارداد', url: `${url}#step-4` },
                ];
                return [
                  { '@context': 'https://schema.org', '@type': 'HowTo', '@id': `${url}#howto`, name: title, description: desc, url, inLanguage: 'fa-IR', image: { '@type': 'ImageObject', url: pgImg, width: 1200, height: 630 }, totalTime: `P${avgDays.replace(/[^0-9-]/g,'').split('-')[1] ?? '40'}D`, estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0', description: 'مشاوره اولیه رایگان' }, supply: [{ '@type': 'HowToSupply', name: 'Pitch Deck' }, { '@type': 'HowToSupply', name: 'Financial Model' }, { '@type': 'HowToSupply', name: 'Cap Table' }], tool: [{ '@type': 'HowToTool', name: 'Capital Network Platform' }, { '@type': 'HowToTool', name: 'VC Network +128' }], step: steps.length > 0 ? steps.map((s: any, i: number) => ({ '@type': 'HowToStep', '@id': `${url}#step-${i+1}`, position: i+1, name: s.title, text: s.text, url: `${url}#step-${i+1}`, image: { '@type': 'ImageObject', url: pgImg } })) : defSteps },
                  { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url, url, name: title, description: desc, isPartOf: { '@id': `${BASE}/#website` }, inLanguage: 'fa-IR' },
                  crumb('فرآیند', url),
                ];
              }
              if (pk === 'about') {
                const team    = (settings?.team ?? []).slice(0,10);
                const persons = team.map((m: any, i: number) => ({ '@type': 'Person', '@id': `${url}#person-${i+1}`, name: m.name, jobTitle: m.role, description: m.bio ?? '', worksFor: { '@id': `${BASE}/#organization` }, url, ...(m.avatar ? { image: { '@type': 'ImageObject', url: m.avatar } } : {}) }));
                const result: object[] = [
                  { '@context': 'https://schema.org', ...orgNode, slogan: settings?.about_mission?.text ?? 'شریک استراتژیک استارتاپ‌ها', ...(persons.length > 0 ? { employee: persons } : {}) },
                  { '@context': 'https://schema.org', '@type': 'AboutPage', '@id': url, url, name: title, description: desc, image: pgImg, inLanguage: 'fa-IR', isPartOf: { '@id': `${BASE}/#website` }, about: { '@id': `${BASE}/#organization` }, mainEntity: { '@id': `${BASE}/#organization` }, breadcrumb: { '@id': `${url}#breadcrumb` }, speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1','h2'] } },
                ];
                if (persons.length > 0) result.push({ '@context': 'https://schema.org', '@type': 'ItemList', '@id': `${url}#team-list`, name: 'تیم Capital Network', url, numberOfItems: persons.length, itemListElement: persons.map((p: any, i: number) => ({ '@type': 'ListItem', position: i+1, item: p })) });
                result.push(crumb('درباره ما', url));
                return result;
              }
              if (pk === 'contact') {
                const cpts: object[] = [];
                if (settings?.contact_email)   cpts.push({ '@type': 'ContactPoint', contactType: 'customer support', email: settings.contact_email, availableLanguage: [{ '@type': 'Language', name: 'Persian', alternateName: 'fa' }, { '@type': 'Language', name: 'English', alternateName: 'en' }], areaServed: 'IR' });
                if (settings?.contact_phone)   cpts.push({ '@type': 'ContactPoint', contactType: 'customer support', telephone: settings.contact_phone, hoursAvailable: { '@type': 'OpeningHoursSpecification', description: settings.working_hours ?? 'شنبه تا چهارشنبه ۹–۱۸' }, areaServed: 'IR' });
                if (settings?.contact_whatsapp) cpts.push({ '@type': 'ContactPoint', contactType: 'sales', telephone: settings.contact_whatsapp, contactOption: 'TollFree', description: 'واتساپ — پاسخگویی سریع' });
                return [
                  { '@context': 'https://schema.org', ...orgNode, ...(cpts.length > 0 ? { contactPoint: cpts } : {}) },
                  { '@context': 'https://schema.org', '@type': ['LocalBusiness','FinancialService'], '@id': `${url}#local-business`, name: sn, url, description: desc, image: pgImg, inLanguage: 'fa-IR', priceRange: '$$$', currenciesAccepted: 'IRR, USD', paymentAccepted: 'Bank Transfer', ...(settings?.contact_phone ? { telephone: settings.contact_phone } : {}), ...(settings?.contact_email ? { email: settings.contact_email } : {}), ...(settings?.working_hours ? { openingHoursSpecification: { '@type': 'OpeningHoursSpecification', description: settings.working_hours, dayOfWeek: ['Saturday','Sunday','Monday','Tuesday','Wednesday'], opens: '09:00', closes: '18:00' } } : {}), ...(cpts.length > 0 ? { contactPoint: cpts } : {}), geo: { '@type': 'GeoCoordinates', latitude: '35.6892', longitude: '51.3890' }, hasMap: 'https://maps.google.com/?q=Tehran,+Iran' },
                  { '@context': 'https://schema.org', '@type': 'ContactPage', '@id': url, url, name: title, description: desc, image: pgImg, inLanguage: 'fa-IR', isPartOf: { '@id': `${BASE}/#website` }, about: { '@id': `${BASE}/#organization` }, mainEntity: { '@id': `${BASE}/#organization` }, breadcrumb: { '@id': `${url}#breadcrumb` } },
                  crumb('تماس با ما', url),
                ];
              }
              if (pk === 'evaluation') {
                const today = new Date().toISOString().split('T')[0];
                return [
                  { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url, url, name: title, description: desc, image: pgImg, inLanguage: 'fa-IR', isPartOf: { '@id': `${BASE}/#website` }, about: { '@id': `${BASE}/#organization` }, breadcrumb: { '@id': `${url}#breadcrumb` }, potentialAction: { '@type': 'ApplyAction', name: 'درخواست ارزیابی استارتاپ', description: 'درخواست ارزیابی رایگان استارتاپ توسط تیم Capital Network', target: { '@type': 'EntryPoint', urlTemplate: url, actionAccessibilityRequirement: { '@type': 'ActionAccessSpecification', category: 'Free', availabilityStarts: today, eligibleRegion: { '@type': 'Country', name: 'Iran' } } }, result: { '@type': 'Service', name: 'ارزیابی آمادگی برای جذب سرمایه', provider: { '@id': `${BASE}/#organization` } } } },
                  { '@context': 'https://schema.org', '@type': 'Service', '@id': `${url}#evaluation-service`, name: 'ارزیابی رایگان آمادگی برای جذب سرمایه', alternateName: 'Free Startup Investment Readiness Evaluation', url, description: desc, serviceType: 'Startup Evaluation & Investment Readiness Assessment', category: 'Financial Advisory', provider: { '@id': `${BASE}/#organization` }, audience: { '@type': 'Audience', audienceType: 'Startups at Seed to Series B stage' }, areaServed: ['IR','Middle East'], offers: { '@type': 'Offer', name: 'ارزیابی رایگان', price: '0', priceCurrency: 'IRR', availability: 'https://schema.org/InStock', validFrom: today, seller: { '@id': `${BASE}/#organization` } }, hasOfferCatalog: { '@type': 'OfferCatalog', name: 'آنچه در ارزیابی بررسی می‌شود', itemListElement: [{ '@type': 'Offer', position: 1, name: 'بررسی Market Fit' }, { '@type': 'Offer', position: 2, name: 'ارزیابی تیم و مدل کسب‌وکار' }, { '@type': 'Offer', position: 3, name: 'آمادگی مستندات (Pitch Deck، مدل مالی)' }, { '@type': 'Offer', position: 4, name: 'تعیین استراتژی جذب سرمایه' }] }, review: { '@type': 'Review', reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' }, author: { '@type': 'Person', name: 'موسس استارتاپ' }, reviewBody: 'ارزیابی سریع و دقیق. دید واضحی از آمادگی‌مان پیدا کردیم.' } },
                  crumb('درخواست ارزیابی', url),
                ];
              }
              return [{ '@context': 'https://schema.org', '@type': 'WebPage', '@id': url, url, name: title, description: desc, inLanguage: 'fa-IR', isPartOf: { '@id': `${BASE}/#website` } }];
            };

            // uses component-level state (no hooks here)
            const activePageSchemas = buildSchemas(activeSchemaTab);
            const activeDef = SCHEMA_PAGES.find(pg => pg.key === activeSchemaTab)!;
            const TC: Record<string, string> = { 'WebSite': '#00BCD4', 'Organization': '#22c55e', 'ProfessionalService': '#22c55e', 'WebPage': '#a78bfa', 'AboutPage': '#a78bfa', 'ContactPage': '#fb923c', 'CollectionPage': '#a78bfa', 'HowTo': '#f59e0b', 'FAQPage': '#f59e0b', 'ItemList': '#7dd3fc', 'Service': '#f59e0b', 'BreadcrumbList': '#6b7280', 'LocalBusiness': '#fb923c', 'FinancialService': '#fb923c' };
            const colorRgb = (hex: string) => hex === '#00BCD4' ? '0,188,212' : hex === '#f59e0b' ? '245,158,11' : hex === '#a78bfa' ? '167,139,250' : hex === '#22c55e' ? '34,197,94' : hex === '#fb923c' ? '251,146,60' : '239,68,68';

            return (
              <>
                {/* ── Header + Page Tabs ────────────────────────────────── */}
                <div style={{ ...card, padding: '14px 18px' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-2"><Code size={13} color="#22c55e" /> Page Schema Browser</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Schema.org JSON-LD 2026 — هر صفحه یک Schema اختصاصی کامل و واقعی</p>
                    </div>
                    <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, textDecoration: 'none', fontSize: 11 } as any}><ExternalLink size={11} /> Rich Results Test</a>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {SCHEMA_PAGES.map(pg => (
                      <button key={pg.key} onClick={() => { setActiveSchemaTab(pg.key); setExpandedSchemaIdx(0); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: activeSchemaTab === pg.key ? `rgba(${colorRgb(pg.color)},0.15)` : 'rgba(255,255,255,0.04)', color: activeSchemaTab === pg.key ? pg.color : 'rgba(255,255,255,0.5)', border: activeSchemaTab === pg.key ? `1px solid ${pg.color}44` : '1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ color: activeSchemaTab === pg.key ? pg.color : 'rgba(255,255,255,0.3)' }}>{pg.icon}</span>
                        {pg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Active page info strip ────────────────────────────── */}
                <div style={{ background: `rgba(${colorRgb(activeDef.color)},0.06)`, border: `1px solid ${activeDef.color}22`, borderRadius: 10, padding: '12px 16px' }} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${activeDef.color}18`, border: `1px solid ${activeDef.color}33` }}>
                    <span style={{ color: activeDef.color }}>{activeDef.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-white">{activeDef.label}</p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${activeDef.color}15`, color: activeDef.color }}>{activePageSchemas.length} schema block</span>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{activeDef.desc}</p>
                    <p className="text-[10px] mt-1 font-mono" style={{ color: `${activeDef.color}88` }}>{activeDef.type}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => { navigator.clipboard.writeText(activePageSchemas.map(s => JSON.stringify(s, null, 2)).join('\n\n')); setCopiedSchemaKey(activeSchemaTab + '_all'); setTimeout(() => setCopiedSchemaKey(null), 2000); }} style={{ ...ghostBtn, padding: '5px 10px', fontSize: 11 }}>
                      {copiedSchemaKey === activeSchemaTab + '_all' ? <CheckCircle size={11} color="#22c55e" /> : <Copy size={11} />} همه
                    </button>
                    <a href={`https://validator.schema.org/#url=data:application/ld%2Bjson,${encodeURIComponent(JSON.stringify(activePageSchemas[0] ?? {}))}`} target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, padding: '5px 10px', fontSize: 11, textDecoration: 'none' } as any}><ExternalLink size={11} /> تست</a>
                  </div>
                </div>

                {/* ── Schema blocks accordion ───────────────────────────── */}
                {activePageSchemas.map((schema: any, idx: number) => {
                  const sj  = JSON.stringify(schema, null, 2);
                  const st  = schema['@type'];
                  const stl = Array.isArray(st) ? st.join(' + ') : (st ?? 'Schema');
                  const tc  = TC[Array.isArray(st) ? st[0] : st] ?? '#94a3b8';
                  const isOpen = expandedSchemaIdx === idx;
                  return (
                    <div key={idx} style={{ ...card, overflow: 'hidden' }}>
                      <button onClick={() => setExpandedSchemaIdx(isOpen ? -1 : idx)} className="w-full flex items-center gap-3 px-4 py-3 text-right" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black" style={{ background: `${tc}18`, border: `1px solid ${tc}33`, color: tc }}>{idx + 1}</div>
                        <div className="flex-1 text-right">
                          <p className="text-xs font-bold" style={{ color: tc }}>{stl}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{schema['@id'] ? schema['@id'].replace('https://capitalnetwork.ir', '') : `block ${idx + 1}`}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${tc}15`, color: tc }}>{sj.split('\n').length} lines</span>
                          <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(sj); setCopiedSchemaKey(`${activeSchemaTab}_${idx}`); setTimeout(() => setCopiedSchemaKey(null), 2000); }} style={{ ...ghostBtn, padding: '4px 8px', fontSize: 10 }}>
                            {copiedSchemaKey === `${activeSchemaTab}_${idx}` ? <CheckCircle size={10} color="#22c55e" /> : <Copy size={10} />}
                          </button>
                          {isOpen ? <ChevronUp size={13} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={13} color="rgba(255,255,255,0.3)" />}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <a href={`https://validator.schema.org/#url=data:application/ld%2Bjson,${encodeURIComponent(sj)}`} target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, padding: '4px 10px', fontSize: 10, textDecoration: 'none' } as any}><ExternalLink size={10} /> اعتبارسنجی این block</a>
                            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>واقعی — داده از settings بارگذاری می‌شود</span>
                          </div>
                          <pre style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${tc}22`, borderRadius: 8, padding: 12, fontSize: 11, color: tc === '#6b7280' ? '#94a3b8' : tc, direction: 'ltr', overflow: 'auto', maxHeight: 360, lineHeight: 1.55, margin: 0 }}>{sj}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* ── Footer ───────────────────────────────────────────── */}
                <div style={{ ...card, padding: '12px 16px' }}>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    💡 این Schema‌ها از <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 3 }}>useSEO()</code> hook به‌صورت خودکار در <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 3 }}>&lt;head&gt;</code> هر صفحه inject می‌شوند.
                    داده‌ها از <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 3 }}>settings</code> Supabase به‌صورت Real-time بارگذاری می‌شوند.
                  </p>
                </div>
              </>
            );
          })()}

          {/* ══════════════════ TAB: AUDIT ══════════════════ */}
          {activeTab === 'audit' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{auditItems.length} چک — {passCount} Pass / {warnCount} Warn / {failCount} Fail</p>
                <button onClick={() => setExpandedAudit(null)} style={ghostBtn}>بستن همه <ChevronUp size={13} /></button>
              </div>
              <div className="space-y-2">
                {auditItems.map(item => (
                  <div key={item.label} style={{ ...card, overflow: 'hidden' }}>
                    <button onClick={() => setExpandedAudit(expandedAudit === item.label ? null : item.label)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-right transition-all"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      <span className="flex-shrink-0">{item.status === 'pass' ? <CheckCircle size={15} color="#22c55e" /> : item.status === 'warn' ? <AlertTriangle size={15} color="#f59e0b" /> : <XCircle size={15} color="#ef4444" />}</span>
                      <span className="flex-1 text-sm font-semibold text-right" style={{ color: 'rgba(255,255,255,0.85)' }}>{item.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: item.status === 'pass' ? 'rgba(34,197,94,0.12)' : item.status === 'warn' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)', color: item.status === 'pass' ? '#22c55e' : item.status === 'warn' ? '#f59e0b' : '#ef4444' }}>
                        {item.status === 'pass' ? 'Pass' : item.status === 'warn' ? 'Warning' : 'Fail'}
                      </span>
                      {expandedAudit === item.label ? <ChevronUp size={13} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={13} color="rgba(255,255,255,0.3)" />}
                    </button>
                    {expandedAudit === item.label && (
                      <div className="px-4 pb-3 pt-0">
                        <div className="pt-2 border-t border-white/5">
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.detail}</p>
                          {item.status !== 'pass' && item.label === 'Google Search Console' && (
                            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs" style={{ color: '#00BCD4' }}>باز کردن Search Console <ExternalLink size={11} /></a>
                          )}
                          {item.status !== 'pass' && item.label === 'Page Title Tags' && (
                            <button onClick={() => { setActiveTab('meta'); setActivePage('home'); }} className="inline-flex items-center gap-1.5 mt-2 text-xs" style={{ color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>رفتن به Meta Tags <ArrowRight size={11} /></button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ ...card, padding: '14px 18px' }}>
                <p className="text-xs font-bold text-white flex items-center gap-2 mb-2"><Link2 size={13} color="#f59e0b" /> Broken Link Checker</p>
                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>بررسی لینک‌های شکسته نیاز به backend دارد. از ابزارهای زیر استفاده کنید:</p>
                <div className="flex gap-2 flex-wrap">
                  {[{ label: 'Ahrefs Site Audit', url: 'https://ahrefs.com/site-audit' }, { label: 'Screaming Frog', url: 'https://www.screamingfrog.co.uk/' }].map(t => (
                    <a key={t.label} href={t.url} target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, textDecoration: 'none', fontSize: 11 } as any}>{t.label} <ExternalLink size={11} /></a>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══════════════════ TAB: REDIRECTS ══════════════════ */}
          {activeTab === 'redirects' && (
            <div style={{ ...card, padding: '18px' }}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <p className="text-xs font-bold text-white">Redirect Manager</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>مدیریت ۳۰۱/۳۰۲ — تنظیمات Redirect</p>
                </div>
                <button onClick={() => setSettings((prev: any) => ({ ...prev, seo_redirects: [...(prev.seo_redirects ?? []), { from: '', to: '', code: 301, active: true }] }))} style={tealBtn}>
                  <Plus size={13} /> افزودن
                </button>
              </div>

              {(!settings.seo_redirects || settings.seo_redirects.length === 0)
                ? <div className="flex flex-col items-center justify-center py-10 gap-2" style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8 }}><Repeat size={26} color="rgba(255,255,255,0.1)" /><p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>هنوز ریدایرکتی تعریف نشده</p></div>
                : (
                  <div className="space-y-2">
                    <div className="grid gap-2 text-[10px] font-bold px-1" style={{ color: 'rgba(255,255,255,0.35)', gridTemplateColumns: '1fr 1fr 65px 55px 32px' }}>
                      <span className="text-right">از (From)</span><span className="text-right">به (To)</span><span className="text-right">کد</span><span className="text-right">فعال</span><span />
                    </div>
                    {(settings.seo_redirects ?? []).map((r: any, i: number) => (
                      <div key={i} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 1fr 65px 55px 32px' }}>
                        <input value={r.from} onChange={e => { const a = [...settings.seo_redirects]; a[i] = { ...a[i], from: e.target.value }; setSettings((p: any) => ({ ...p, seo_redirects: a })); }} placeholder="/old-url" style={{ ...inputS, direction: 'ltr', fontSize: 12, padding: '6px 10px' }} />
                        <input value={r.to} onChange={e => { const a = [...settings.seo_redirects]; a[i] = { ...a[i], to: e.target.value }; setSettings((p: any) => ({ ...p, seo_redirects: a })); }} placeholder="/new-url" style={{ ...inputS, direction: 'ltr', fontSize: 12, padding: '6px 10px' }} />
                        <select value={r.code} onChange={e => { const a = [...settings.seo_redirects]; a[i] = { ...a[i], code: Number(e.target.value) }; setSettings((p: any) => ({ ...p, seo_redirects: a })); }} style={{ ...inputS, padding: '6px 8px', fontSize: 12, cursor: 'pointer' }}>
                          <option value={301}>301</option><option value={302}>302</option>
                        </select>
                        <label className="flex items-center justify-center cursor-pointer">
                          <input type="checkbox" checked={r.active} onChange={e => { const a = [...settings.seo_redirects]; a[i] = { ...a[i], active: e.target.checked }; setSettings((p: any) => ({ ...p, seo_redirects: a })); }} style={{ accentColor: '#00BCD4', width: 15, height: 15 }} />
                        </label>
                        <button onClick={() => setSettings((p: any) => ({ ...p, seo_redirects: p.seo_redirects.filter((_: any, j: number) => j !== i) }))} style={redBtn as any}><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                )
              }

              {settings.seo_redirects?.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-white">خروجی .htaccess</p>
                    <button onClick={() => { const active = (settings.seo_redirects ?? []).filter((r: any) => r.active && r.from && r.to); navigator.clipboard.writeText(active.map((r: any) => `Redirect ${r.code} ${r.from} ${r.to}`).join('\n')); }} style={ghostBtn}>
                      <Copy size={13} /> کپی htaccess
                    </button>
                  </div>
                  <pre style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 12, fontSize: 11, color: '#86efac', direction: 'ltr', lineHeight: 1.7 }}>
                    {(settings.seo_redirects ?? []).filter((r: any) => r.active && r.from && r.to).map((r: any) => `Redirect ${r.code} ${r.from} ${r.to}`).join('\n') || '# هنوز ریدایرکت فعالی وجود ندارد'}
                  </pre>
                  <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>💡 این کد را در <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: 3 }}>.htaccess</code> سرور اضافه کنید</p>
                </div>
              )}
            </div>
          )}

        </div>{/* /p-5 */}
      </div>{/* /main content */}
    </div>
  );
}
