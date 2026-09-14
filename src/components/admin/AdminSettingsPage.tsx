import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Mail, Phone, MessageCircle, Clock, Globe, Users, MessageSquare,
  Plus, Trash2, HardDrive, AlertTriangle, Layout, Eye, EyeOff, Type,
  Twitter, Linkedin, Instagram, Youtube, Send as SendIcon, Facebook,
  ChevronUp, ChevronDown, GripVertical, AlignLeft, Link2,
  Newspaper, Shield, Hash, ToggleLeft, ToggleRight, Columns,
} from 'lucide-react';
import { fetchSettings, saveSettings } from '../../lib/settingsApi';
import { normalizeExternalUrl } from '../../lib/urlHelpers';
import { IMAGE_FORMAT_META, uploadImage } from '../../lib/mediaUploadApi';
import type { FooterColumnGroup, FooterLink, FooterTermsModalSection, SiteSettings, SocialFloatItem, SocialNetwork } from '../../lib/settingsApi';
import type { ImageFormat, UploadProgress } from '../../lib/mediaUploadApi';

type TabId = 'header' | 'footer' | 'contact' | 'social' | 'chat' | 'team' | 'system';

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode; badge?: string }> = [
  { id: 'header',  label: 'هدر',               icon: <Layout size={15} />,       badge: 'لوگو + ناوبار' },
  { id: 'footer',  label: 'فوتر',               icon: <Columns size={15} />,      badge: '۴ ستون + محتوا' },
  { id: 'contact', label: 'اطلاعات تماس',       icon: <Phone size={15} /> },
  { id: 'social',  label: 'شبکه‌های اجتماعی',   icon: <Globe size={15} /> },
  { id: 'chat',    label: 'چت‌بات',             icon: <MessageSquare size={15} /> },
  { id: 'team',    label: 'تیم',                icon: <Users size={15} /> },
  { id: 'system',  label: 'سیستم',              icon: <HardDrive size={15} /> },
];

const ADMIN_LOCAL_KEYS = [
  { key: 'admin-current-page',  label: 'صفحه جاری پنل ادمین' },
  { key: 'dev-admin-session',   label: 'Session توسعه (DEV)' },
];

// ── helpers ─────────────────────────────────────────────────────────────────────
const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };
const rowStyle  = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' };
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
const tealBtn  = { background: 'rgba(0,188,212,0.1)',   color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' };
const tealActive = { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' };
const amberBtn = { background: 'rgba(251,191,36,0.1)',  color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' };

// ── SectionAccordion — خارج از component تا در هر render دوباره ساخته نشود ──
type FooterSectionId = 'stats' | 'col1' | 'col2' | 'col3' | 'col4' | 'brand' | 'bottom';
const SectionAccordion = ({ id, label, icon, children, openId, onToggle }: {
  id: FooterSectionId;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  openId: FooterSectionId;
  onToggle: (id: FooterSectionId) => void;
}) => {
  const open = openId === id;
  return (
    <div className="rounded-2xl overflow-hidden" style={cardStyle}>
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={e => { onToggle(open ? 'stats' : id); (e.currentTarget as HTMLButtonElement).blur(); }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ color: '#00BCD4' }}>{icon}</span>
          <span className="text-sm font-semibold text-white">{label}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('header');
  const [newReply, setNewReply] = useState('');
  const [localKeys, setLocalKeys] = useState<Record<string, string | null>>({});
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearDone, setClearDone]       = useState(false);
  const [logoUploadProgress, setLogoUploadProgress] = useState<UploadProgress | null>(null);
  const [logoUploadError, setLogoUploadError] = useState('');
  const [logoFormat, setLogoFormat] = useState<ImageFormat>('png24');

  // footer: expanded sections
  const [footerSection, setFooterSection] = useState<'stats' | 'col1' | 'col2' | 'col3' | 'col4' | 'brand' | 'bottom'>('stats');

  useEffect(() => { fetchSettings().then(s => { setSettings(s); setLoading(false); }); }, []);

  useEffect(() => {
    if (activeTab !== 'system') return;
    const snap: Record<string, string | null> = {};
    for (const { key } of ADMIN_LOCAL_KEYS) snap[key] = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    setLocalKeys(snap);
    setClearConfirm(false);
    setClearDone(false);
  }, [activeTab]);

  const handleClearLocalStorage = () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    for (const { key } of ADMIN_LOCAL_KEYS) window.localStorage.removeItem(key);
    const snap: Record<string, string | null> = {};
    for (const { key } of ADMIN_LOCAL_KEYS) snap[key] = null;
    setLocalKeys(snap);
    setClearConfirm(false);
    setClearDone(true);
    setTimeout(() => setClearDone(false), 3000);
  };

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);

  const getFooterGroups = (groups: FooterColumnGroup[], fallbackLinks: FooterLink[]) =>
    (groups && groups.length > 0) ? groups : [{ title: '', links: fallbackLinks }];

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true); setError('');
    const norm = {
      ...settings,
      social_twitter:   normalizeExternalUrl(settings.social_twitter),
      social_linkedin:  normalizeExternalUrl(settings.social_linkedin),
      social_instagram: normalizeExternalUrl(settings.social_instagram),
      social_youtube:   normalizeExternalUrl(settings.social_youtube),
    };
    const ok = await saveSettings(norm);
    setSaving(false);
    if (ok) { setSettings(norm); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    else setError('خطا در ذخیره‌سازی');
  };

  const addReply = () => {
    if (!newReply.trim() || !settings) return;
    set('chat_quick_replies', [...settings.chat_quick_replies, newReply.trim()]);
    setNewReply('');
  };
  const removeReply = (i: number) => settings && set('chat_quick_replies', settings.chat_quick_replies.filter((_, idx) => idx !== i));
  const addTeamMember = () => settings && set('team', [...settings.team, { name: '', role: '', bio: '' }]);
  const addTermsSection = () => settings && set('footer_terms_modal_sections', [
    ...(settings.footer_terms_modal_sections ?? []),
    { title: 'بند جدید', body: 'متن بند جدید...' } as FooterTermsModalSection,
  ]);
  const updateTermsSection = (index: number, field: 'title' | 'body', value: string) => {
    if (!settings) return;
    const next = [...(settings.footer_terms_modal_sections ?? [])];
    next[index] = { ...next[index], [field]: value };
    set('footer_terms_modal_sections', next);
  };
  const removeTermsSection = (index: number) => {
    if (!settings) return;
    const next = [...(settings.footer_terms_modal_sections ?? [])];
    next.splice(index, 1);
    set('footer_terms_modal_sections', next);
  };
  const updateTeamMember = (i: number, field: string, value: string) =>
    settings && set('team', settings.team.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  const removeTeamMember = (i: number) => settings && set('team', settings.team.filter((_, idx) => idx !== i));

  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const handleLogoUpload = async (file: File) => {
    setLogoUploadError('');
    setLogoUploadProgress({ percent: 0, phase: 'reading' });
    const result = await uploadImage(file, logoFormat, (progress) => {
      setLogoUploadProgress(progress);
      if (progress.phase === 'error' && progress.error) setLogoUploadError(progress.error);
    });
    if (result?.url) {
      set('header_logo_url', result.url);
      setLogoUploadProgress(null);
      setLogoUploadError('');
    } else if (!result) {
      setLogoUploadError('آپلود لوگو ناموفق بود. لطفا دوباره تلاش کنید.');
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
    if (e.target) e.target.value = '';
  };

  const removeLogo = () => set('header_logo_url', '');

  // ── Footer column groups helpers ──────────────────────────────────────────
  const normalizeGroups = (groups: FooterColumnGroup[]): FooterColumnGroup[] => {
    return groups.filter(g => g.links && g.links.length > 0 || g.title).map(g => ({
      title: g.title || '',
      links: (g.links || []).filter(l => l && l.label && l.page),
    }));
  };

  const updateFooterColumnGroups = (key: string, groups: FooterColumnGroup[]) => {
    set(key as keyof SiteSettings, normalizeGroups(groups) as any);
  };

  const inputCls = 'w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors';
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = 'rgba(0,188,212,0.5)');
  const onBlur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)');

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <span className="w-7 h-7 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );
  if (!settings) return null;

  return (
    <div className="space-y-5 max-w-3xl" dir="rtl">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">تنظیمات سایت</h1>
          <p className="text-sm text-slate-400 mt-0.5">تغییرات فوری در سایت اعمال می‌شود</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
          style={saved
            ? { background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.4)' }
            : { background: 'linear-gradient(135deg,#00BCD4,#00838F)', color: '#fff', border: 'none' }}>
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
          {saving ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : 'ذخیره همه تغییرات'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
          {error}
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={activeTab === tab.id ? tealActive : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {tab.icon}{tab.label}
            {tab.badge && activeTab === tab.id && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-0.5" style={{ background: 'rgba(0,188,212,0.15)', color: '#5eead4' }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB: HEADER ─────────────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'header' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

          {/* ─ لوگو ──────────────────────────────────────────────────────── */}
          <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
            <div className="flex items-center gap-2 mb-1">
              <Type size={15} className="text-teal-400" />
              <h3 className="text-sm font-bold text-white">لوگو</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">متن نام سایت</label>
                <input value={settings.header_logo_text ?? ''}
                  onChange={e => set('header_logo_text', e.target.value)}
                  placeholder="Capital Network"
                  className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">رنگ پس‌زمینه هدر</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.header_bg_color ?? '#0B1628'}
                    onChange={e => set('header_bg_color', e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0.5 flex-shrink-0" />
                  <input value={settings.header_bg_color ?? '#0B1628'}
                    onChange={e => set('header_bg_color', e.target.value)}
                    placeholder="#0B1628"
                    className={`${inputCls} flex-1`} style={{ ...inputStyle, direction: 'ltr' }} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">URL تصویر لوگو <span className="text-slate-600">(اختیاری — خالی = SVG پیش‌فرض)</span></label>
              <input value={settings.header_logo_url ?? ''}
                onChange={e => set('header_logo_url', e.target.value)}
                placeholder="https://..."
                className={inputCls} style={{ ...inputStyle, direction: 'ltr' }} onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="rounded-2xl p-4 border border-white/10 bg-white/5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">لوگوی فعلی</p>
                  <p className="text-xs text-slate-400">اگر لوگوی سفارشی دارید، اینجا نمایش داده می‌شود.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                    style={{ background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }}
                  >
                    آپلود / جایگزینی لوگو
                  </button>
                  <button
                    type="button"
                    onClick={removeLogo}
                    disabled={!settings.header_logo_url}
                    className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                    style={settings.header_logo_url ? { background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.25)' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    حذف لوگوی فعلی
                  </button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-[auto,1fr] items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-slate-950 overflow-hidden">
                  {settings.header_logo_url ? (
                    <img
                      src={settings.header_logo_url}
                      alt={settings.header_logo_text ?? 'پیش‌نمایش لوگو'}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-300 px-3">
                      <span className="text-xs text-center">هیچ لوگوی سفارشی‌ای بارگذاری نشده است.</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">لوگو در هدر و فوتر یکسان استفاده می‌شود.</p>
                  {settings.header_logo_url ? (
                    <p className="text-xs text-slate-400">برای تغییر، ابتدا لوگوی فعلی را حذف کنید یا دکمه آپلود را بزنید.</p>
                  ) : (
                    <p className="text-xs text-slate-400">برای افزودن لوگوی جدید، از دکمه آپلود / جایگزینی استفاده کنید.</p>
                  )}
                </div>
              </div>
              <input
                type="file"
                accept={IMAGE_FORMAT_META[logoFormat].accept}
                ref={logoFileInputRef}
                className="hidden"
                onChange={handleLogoFileChange}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">فرمت تصویر</label>
                  <select
                    value={logoFormat}
                    onChange={(e) => setLogoFormat(e.target.value as ImageFormat)}
                    className="w-full rounded-xl px-3 py-2 text-sm text-white bg-slate-950 border border-white/10 outline-none"
                  >
                    {Object.entries(IMAGE_FORMAT_META).map(([key, meta]) => (
                      <option key={key} value={key} className="bg-slate-950 text-white">
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">وضعیت آپلود</label>
                  <div className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-xs text-slate-300 min-h-[52px]">
                    {logoUploadProgress ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{logoUploadProgress.phase === 'reading' ? 'خواندن فایل...' : logoUploadProgress.phase === 'uploading' ? 'در حال آپلود...' : logoUploadProgress.phase === 'done' ? 'آپلود انجام شد' : 'خطا در آپلود'}</span>
                          <span>{logoUploadProgress.percent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-teal-400" style={{ width: `${logoUploadProgress.percent}%` }} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400">برای آپلود لوگو، دکمه بالا را بزنید.</p>
                    )}
                    {logoUploadError && <p className="text-xs text-rose-300 mt-2">{logoUploadError}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─ لینک‌های ناوبار ───────────────────────────────────────────── */}
          <div className="rounded-2xl p-6 space-y-3" style={cardStyle}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Layout size={15} className="text-teal-400" />
                <h3 className="text-sm font-bold text-white">لینک‌های ناوبار</h3>
              </div>
              <span className="text-xs text-slate-500">{(settings.header_nav_links ?? []).filter(l => l.visible).length} فعال</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">چشم = نمایش/مخفی — متن = تغییر برچسب — کد‌خاکستری = صفحه مقصد</p>

            <div className="space-y-2">
              {(settings.header_nav_links ?? []).map((link, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl group" style={rowStyle}>
                  {/* toggle visibility */}
                  <button
                    title={link.visible ? 'مخفی کن' : 'نمایش بده'}
                    onClick={() => {
                      const links = [...(settings.header_nav_links ?? [])];
                      links[i] = { ...links[i], visible: !links[i].visible };
                      set('header_nav_links', links);
                    }}
                    className="flex-shrink-0 transition-colors p-1.5 rounded-lg hover:bg-white/10"
                    style={{ color: link.visible ? '#00BCD4' : 'rgba(255,255,255,0.25)' }}>
                    {link.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>

                  {/* label — ورودی کاملاً واضح با border */}
                  <input
                    value={link.label}
                    onChange={e => {
                      const links = [...(settings.header_nav_links ?? [])];
                      links[i] = { ...links[i], label: e.target.value };
                      set('header_nav_links', links);
                    }}
                    className="flex-1 rounded-lg px-3 py-1.5 text-sm text-white outline-none min-w-0 transition-colors"
                    placeholder="برچسب لینک"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      opacity: link.visible ? 1 : 0.5,
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />

                  {/* page badge */}
                  <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {link.page}
                  </span>

                  {/* move up/down — همیشه نمایش داده می‌شود */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      disabled={i === 0}
                      onClick={() => {
                        const links = [...(settings.header_nav_links ?? [])];
                        [links[i - 1], links[i]] = [links[i], links[i - 1]];
                        set('header_nav_links', links);
                      }}
                      className="p-0.5 rounded text-slate-500 hover:text-white disabled:opacity-20 transition-colors">
                      <ChevronUp size={12} />
                    </button>
                    <button
                      disabled={i === (settings.header_nav_links ?? []).length - 1}
                      onClick={() => {
                        const links = [...(settings.header_nav_links ?? [])];
                        [links[i + 1], links[i]] = [links[i], links[i + 1]];
                        set('header_nav_links', links);
                      }}
                      className="p-0.5 rounded text-slate-500 hover:text-white disabled:opacity-20 transition-colors">
                      <ChevronDown size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─ دکمه ورود ─────────────────────────────────────────────────── */}
          <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type size={15} className="text-teal-400" />
                <h3 className="text-sm font-bold text-white">دکمه ورود / Login</h3>
              </div>
              <button
                onClick={() => set('header_login_visible', !(settings.header_login_visible ?? true))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={(settings.header_login_visible ?? true) ? tealBtn : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {(settings.header_login_visible ?? true) ? <Eye size={12} /> : <EyeOff size={12} />}
                {(settings.header_login_visible ?? true) ? 'نمایش' : 'مخفی'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">متن دکمه</label>
                <input value={settings.header_login_text ?? 'ورود'}
                  onChange={e => set('header_login_text', e.target.value)}
                  placeholder="ورود" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">رنگ</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.header_login_color ?? '#7dd3fc'}
                    onChange={e => set('header_login_color', e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0.5 flex-shrink-0" />
                  <input value={settings.header_login_color ?? '#7dd3fc'}
                    onChange={e => set('header_login_color', e.target.value)}
                    className={`${inputCls} flex-1`} style={{ ...inputStyle, direction: 'ltr' }} onFocus={onFocus} onBlur={onBlur} />
                  <span className="text-xs font-bold flex-shrink-0 px-2.5 py-1.5 rounded-xl border border-white/10"
                    style={{ color: settings.header_login_color ?? '#7dd3fc' }}>ورود</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-2 block">استایل دکمه</label>
              <div className="flex gap-2">
                {(['text', 'outline', 'filled'] as const).map(s => (
                  <button key={s} onClick={() => set('header_login_style', s)}
                    className="px-4 py-2 rounded-xl text-xs font-medium transition-all flex-1"
                    style={(settings.header_login_style ?? 'text') === s ? tealActive : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {s === 'text' ? 'متن ساده' : s === 'outline' ? 'کادردار' : 'پُر شده'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─ دکمه CTA ──────────────────────────────────────────────────── */}
          <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type size={15} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">دکمه CTA اصلی</h3>
              </div>
              <button
                onClick={() => set('header_cta_visible', !(settings.header_cta_visible ?? true))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={(settings.header_cta_visible ?? true) ? amberBtn : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {(settings.header_cta_visible ?? true) ? <Eye size={12} /> : <EyeOff size={12} />}
                {(settings.header_cta_visible ?? true) ? 'نمایش' : 'مخفی'}
              </button>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">متن دکمه</label>
              <input value={settings.header_cta_text ?? 'درخواست ارزیابی'}
                onChange={e => set('header_cta_text', e.target.value)}
                placeholder="درخواست ارزیابی" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB: FOOTER ─────────────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'footer' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

          {/* ─ ستون ۱: خدمات ─────────────────────────────────────────────── */}
          <SectionAccordion id="col1" label="ستون ۱ — خدمات" icon={<Columns size={15} />} openId={footerSection} onToggle={setFooterSection}>
            <div className="mb-3">
              <label className="text-xs text-slate-400 mb-1.5 block">عنوان ستون</label>
              <input value={settings.footer_col1_title ?? 'خدمات'}
                onChange={e => set('footer_col1_title', e.target.value)}
                className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <p className="text-xs text-slate-500 mb-2">لینک‌های ستون اول — برچسب قابل ویرایش است</p>
            <div className="space-y-4">
              {getFooterGroups(settings.footer_col1_groups, settings.footer_col1_links ?? []).map((group, gi) => (
                <div key={gi} className="rounded-2xl border border-white/10 p-3 space-y-3" style={rowStyle}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 mb-1 block">عنوان زیرستون (اختیاری)</label>
                      <input
                        value={group.title}
                        onChange={e => {
                          const groups = getFooterGroups(settings.footer_col1_groups, settings.footer_col1_links ?? []);
                          const next = groups.map((g, idx) => idx === gi ? { ...g, title: e.target.value } : g);
                          updateFooterColumnGroups('footer_col1_groups', normalizeGroups(next));
                        }}
                        className={inputCls}
                        style={{ ...inputStyle, fontSize: '13px' }}
                        onFocus={onFocus} onBlur={onBlur}
                        placeholder="عنوان زیرستون"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const groups = getFooterGroups(settings.footer_col1_groups, settings.footer_col1_links ?? []);
                        updateFooterColumnGroups('footer_col1_groups', normalizeGroups(groups.filter((_, idx) => idx !== gi)));
                      }}
                      className="text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
                      disabled={getFooterGroups(settings.footer_col1_groups, settings.footer_col1_links ?? []).length === 1}
                    >حذف زیرستون</button>
                  </div>

                  {(group.links ?? []).map((link, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <label className="text-[10px] text-slate-500 mb-1 block">برچسب</label>
                        <input
                          value={link.label}
                          onChange={e => {
                            const groups = getFooterGroups(settings.footer_col1_groups, settings.footer_col1_links ?? []);
                            const next = groups.map((g, gidx) => gidx !== gi ? g : {
                              ...g,
                              links: g.links.map((l, li) => li === i ? { ...l, label: e.target.value } : l),
                            });
                            updateFooterColumnGroups('footer_col1_groups', normalizeGroups(next));
                          }}
                          className={inputCls}
                          style={{ ...inputStyle, fontSize: '13px' }}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="برچسب لینک"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-500 mb-1 block">صفحه</label>
                        <input
                          value={link.page}
                          onChange={e => {
                            const groups = getFooterGroups(settings.footer_col1_groups, settings.footer_col1_links ?? []);
                            const next = groups.map((g, gidx) => gidx !== gi ? g : {
                              ...g,
                              links: g.links.map((l, li) => li === i ? { ...l, page: e.target.value } : l),
                            });
                            updateFooterColumnGroups('footer_col1_groups', normalizeGroups(next));
                          }}
                          className={inputCls}
                          style={{ ...inputStyle, fontSize: '13px' }}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="services"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 mb-1 block">#anchor</label>
                        <input
                          value={link.anchor ?? ''}
                          onChange={e => {
                            const groups = getFooterGroups(settings.footer_col1_groups, settings.footer_col1_links ?? []);
                            const next = groups.map((g, gidx) => gidx !== gi ? g : {
                              ...g,
                              links: g.links.map((l, li) => li === i ? { ...l, anchor: e.target.value || undefined } : l),
                            });
                            updateFooterColumnGroups('footer_col1_groups', normalizeGroups(next));
                          }}
                          className={inputCls}
                          style={{ ...inputStyle, fontSize: '13px' }}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="vc-ready"
                        />
                      </div>
                      <div className="col-span-1 flex items-end">
                        <button
                          onClick={() => {
                            const groups = getFooterGroups(settings.footer_col1_groups, settings.footer_col1_links ?? []);
                            const next = groups.map((g, gidx) => gidx !== gi ? g : {
                              ...g,
                              links: g.links.filter((_, li) => li !== i),
                            });
                            updateFooterColumnGroups('footer_col1_groups', normalizeGroups(next));
                          }}
                          className="w-full h-10 rounded-xl bg-white/5 text-red-400 hover:bg-white/10 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const groups = getFooterGroups(settings.footer_col1_groups, settings.footer_col1_links ?? []);
                      const next = groups.map((g, gidx) => gidx !== gi ? g : {
                        ...g,
                        links: [...g.links, { label: 'لینک جدید', page: 'services', visible: true }],
                      });
                      updateFooterColumnGroups('footer_col1_groups', normalizeGroups(next));
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:opacity-80"
                    style={tealBtn}
                  >
                    <Plus size={13} /> افزودن لینک به زیرستون
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const groups = getFooterGroups(settings.footer_col1_groups, settings.footer_col1_links ?? []);
                updateFooterColumnGroups('footer_col1_groups', normalizeGroups([...groups, { title: '', links: [] }]));
              }}
              className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:opacity-80"
              style={tealBtn}
            >
              <Plus size={13} /> افزودن زیرستون
            </button>

            {/* toggle terms link — col1 */}
            <div className="mt-3 px-3 py-2.5 rounded-xl" style={rowStyle}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield size={13} className="text-amber-400" />
                  <span className="text-xs text-slate-300">لینک قوانین و مقررات در این ستون</span>
                </div>
                <button
                  onClick={() => set('footer_col1_show_terms', !(settings.footer_col1_show_terms ?? false))}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={(settings.footer_col1_show_terms ?? false) ? amberBtn : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {(settings.footer_col1_show_terms ?? false) ? <Eye size={11} /> : <EyeOff size={11} />}
                  {(settings.footer_col1_show_terms ?? false) ? 'فعال' : 'غیرفعال'}
                </button>
              </div>
            </div>
          </SectionAccordion>

          {/* ─ ستون ۲: منابع ─────────────────────────────────────────────── */}
          <SectionAccordion id="col2" label="ستون ۲ — منابع (بلاگ)" icon={<Columns size={15} />} openId={footerSection} onToggle={setFooterSection}>
            <div className="mb-3">
              <label className="text-xs text-slate-400 mb-1.5 block">عنوان ستون</label>
              <input value={settings.footer_col2_title ?? 'منابع'}
                onChange={e => set('footer_col2_title', e.target.value)}
                className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <p className="text-xs text-slate-500 mb-2">لینک‌های ستون دوم — برچسب قابل ویرایش است</p>
            <div className="space-y-4">
              {getFooterGroups(settings.footer_col2_groups, settings.footer_col2_links ?? []).map((group, gi) => (
                <div key={gi} className="rounded-2xl border border-white/10 p-3 space-y-3" style={rowStyle}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 mb-1 block">عنوان زیرستون (اختیاری)</label>
                      <input
                        value={group.title}
                        onChange={e => {
                          const groups = getFooterGroups(settings.footer_col2_groups, settings.footer_col2_links ?? []);
                          const next = groups.map((g, idx) => idx === gi ? { ...g, title: e.target.value } : g);
                          updateFooterColumnGroups('footer_col2_groups', normalizeGroups(next));
                        }}
                        className={inputCls}
                        style={{ ...inputStyle, fontSize: '13px' }}
                        onFocus={onFocus} onBlur={onBlur}
                        placeholder="عنوان زیرستون"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const groups = getFooterGroups(settings.footer_col2_groups, settings.footer_col2_links ?? []);
                        updateFooterColumnGroups('footer_col2_groups', normalizeGroups(groups.filter((_, idx) => idx !== gi)));
                      }}
                      className="text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
                      disabled={getFooterGroups(settings.footer_col2_groups, settings.footer_col2_links ?? []).length === 1}
                    >حذف زیرستون</button>
                  </div>

                  {(group.links ?? []).map((link, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <label className="text-[10px] text-slate-500 mb-1 block">برچسب</label>
                        <input
                          value={link.label}
                          onChange={e => {
                            const groups = getFooterGroups(settings.footer_col2_groups, settings.footer_col2_links ?? []);
                            const next = groups.map((g, gidx) => gidx !== gi ? g : {
                              ...g,
                              links: g.links.map((l, li) => li === i ? { ...l, label: e.target.value } : l),
                            });
                            updateFooterColumnGroups('footer_col2_groups', normalizeGroups(next));
                          }}
                          className={inputCls}
                          style={{ ...inputStyle, fontSize: '13px' }}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="برچسب لینک"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-500 mb-1 block">صفحه</label>
                        <input
                          value={link.page}
                          onChange={e => {
                            const groups = getFooterGroups(settings.footer_col2_groups, settings.footer_col2_links ?? []);
                            const next = groups.map((g, gidx) => gidx !== gi ? g : {
                              ...g,
                              links: g.links.map((l, li) => li === i ? { ...l, page: e.target.value } : l),
                            });
                            updateFooterColumnGroups('footer_col2_groups', normalizeGroups(next));
                          }}
                          className={inputCls}
                          style={{ ...inputStyle, fontSize: '13px' }}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="blog"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 mb-1 block">دسته</label>
                        <input
                          value={link.category ?? ''}
                          onChange={e => {
                            const groups = getFooterGroups(settings.footer_col2_groups, settings.footer_col2_links ?? []);
                            const next = groups.map((g, gidx) => gidx !== gi ? g : {
                              ...g,
                              links: g.links.map((l, li) => li === i ? { ...l, category: e.target.value || undefined } : l),
                            });
                            updateFooterColumnGroups('footer_col2_groups', normalizeGroups(next));
                          }}
                          className={inputCls}
                          style={{ ...inputStyle, fontSize: '13px' }}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="all"
                        />
                      </div>
                      <div className="col-span-1 flex items-end">
                        <button
                          onClick={() => {
                            const groups = getFooterGroups(settings.footer_col2_groups, settings.footer_col2_links ?? []);
                            const next = groups.map((g, gidx) => gidx !== gi ? g : {
                              ...g,
                              links: g.links.filter((_, li) => li !== i),
                            });
                            updateFooterColumnGroups('footer_col2_groups', normalizeGroups(next));
                          }}
                          className="w-full h-10 rounded-xl bg-white/5 text-red-400 hover:bg-white/10 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const groups = getFooterGroups(settings.footer_col2_groups, settings.footer_col2_links ?? []);
                      const next = groups.map((g, gidx) => gidx !== gi ? g : {
                        ...g,
                        links: [...g.links, { label: 'لینک جدید', page: 'blog', category: 'all', visible: true }],
                      });
                      updateFooterColumnGroups('footer_col2_groups', normalizeGroups(next));
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:opacity-80"
                    style={tealBtn}
                  >
                    <Plus size={13} /> افزودن لینک به زیرستون
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const groups = getFooterGroups(settings.footer_col2_groups, settings.footer_col2_links ?? []);
                updateFooterColumnGroups('footer_col2_groups', normalizeGroups([...groups, { title: '', links: [] }]));
              }}
              className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:opacity-80"
              style={tealBtn}
            >
              <Plus size={13} /> افزودن زیرستون
            </button>

            {/* toggle terms link — col2 */}
            <div className="mt-3 px-3 py-2.5 rounded-xl" style={rowStyle}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield size={13} className="text-amber-400" />
                  <span className="text-xs text-slate-300">لینک قوانین و مقررات در این ستون</span>
                </div>
                <button
                  onClick={() => set('footer_col2_show_terms', !(settings.footer_col2_show_terms ?? false))}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={(settings.footer_col2_show_terms ?? false) ? amberBtn : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {(settings.footer_col2_show_terms ?? false) ? <Eye size={11} /> : <EyeOff size={11} />}
                  {(settings.footer_col2_show_terms ?? false) ? 'فعال' : 'غیرفعال'}
                </button>
              </div>
            </div>
          </SectionAccordion>

          {/* ─ ستون ۳: شرکت ─────────────────────────────────────────────── */}
          <SectionAccordion id="col3" label="ستون ۳ — شرکت" icon={<Columns size={15} />} openId={footerSection} onToggle={setFooterSection}>
            <div className="mb-3">
              <label className="text-xs text-slate-400 mb-1.5 block">عنوان ستون</label>
              <input value={settings.footer_col3_title ?? 'شرکت'}
                onChange={e => set('footer_col3_title', e.target.value)}
                className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <p className="text-xs text-slate-500 mb-2">لینک‌های ستون سوم — برچسب قابل ویرایش است</p>
            <div className="space-y-4">
              {getFooterGroups(settings.footer_col3_groups, settings.footer_col3_links ?? []).map((group, gi) => (
                <div key={gi} className="rounded-2xl border border-white/10 p-3 space-y-3" style={rowStyle}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 mb-1 block">عنوان زیرستون (اختیاری)</label>
                      <input
                        value={group.title}
                        onChange={e => {
                          const groups = getFooterGroups(settings.footer_col3_groups, settings.footer_col3_links ?? []);
                          const next = groups.map((g, idx) => idx === gi ? { ...g, title: e.target.value } : g);
                          updateFooterColumnGroups('footer_col3_groups', normalizeGroups(next));
                        }}
                        className={inputCls}
                        style={{ ...inputStyle, fontSize: '13px' }}
                        onFocus={onFocus} onBlur={onBlur}
                        placeholder="عنوان زیرستون"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const groups = getFooterGroups(settings.footer_col3_groups, settings.footer_col3_links ?? []);
                        updateFooterColumnGroups('footer_col3_groups', normalizeGroups(groups.filter((_, idx) => idx !== gi)));
                      }}
                      className="text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
                      disabled={getFooterGroups(settings.footer_col3_groups, settings.footer_col3_links ?? []).length === 1}
                    >حذف زیرستون</button>
                  </div>

                  {(group.links ?? []).map((link, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <label className="text-[10px] text-slate-500 mb-1 block">برچسب</label>
                        <input
                          value={link.label}
                          onChange={e => {
                            const groups = getFooterGroups(settings.footer_col3_groups, settings.footer_col3_links ?? []);
                            const next = groups.map((g, gidx) => gidx !== gi ? g : {
                              ...g,
                              links: g.links.map((l, li) => li === i ? { ...l, label: e.target.value } : l),
                            });
                            updateFooterColumnGroups('footer_col3_groups', normalizeGroups(next));
                          }}
                          className={inputCls}
                          style={{ ...inputStyle, fontSize: '13px' }}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="برچسب لینک"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-500 mb-1 block">صفحه</label>
                        <input
                          value={link.page}
                          onChange={e => {
                            const groups = getFooterGroups(settings.footer_col3_groups, settings.footer_col3_links ?? []);
                            const next = groups.map((g, gidx) => gidx !== gi ? g : {
                              ...g,
                              links: g.links.map((l, li) => li === i ? { ...l, page: e.target.value } : l),
                            });
                            updateFooterColumnGroups('footer_col3_groups', normalizeGroups(next));
                          }}
                          className={inputCls}
                          style={{ ...inputStyle, fontSize: '13px' }}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="about"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 mb-1 block">#anchor</label>
                        <input
                          value={link.anchor ?? ''}
                          onChange={e => {
                            const groups = getFooterGroups(settings.footer_col3_groups, settings.footer_col3_links ?? []);
                            const next = groups.map((g, gidx) => gidx !== gi ? g : {
                              ...g,
                              links: g.links.map((l, li) => li === i ? { ...l, anchor: e.target.value || undefined } : l),
                            });
                            updateFooterColumnGroups('footer_col3_groups', normalizeGroups(next));
                          }}
                          className={inputCls}
                          style={{ ...inputStyle, fontSize: '13px' }}
                          onFocus={onFocus} onBlur={onBlur}
                          placeholder="team"
                        />
                      </div>
                      <div className="col-span-1 flex items-end">
                        <button
                          onClick={() => {
                            const groups = getFooterGroups(settings.footer_col3_groups, settings.footer_col3_links ?? []);
                            const next = groups.map((g, gidx) => gidx !== gi ? g : {
                              ...g,
                              links: g.links.filter((_, li) => li !== i),
                            });
                            updateFooterColumnGroups('footer_col3_groups', normalizeGroups(next));
                          }}
                          className="w-full h-10 rounded-xl bg-white/5 text-red-400 hover:bg-white/10 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const groups = getFooterGroups(settings.footer_col3_groups, settings.footer_col3_links ?? []);
                      const next = groups.map((g, gidx) => gidx !== gi ? g : {
                        ...g,
                        links: [...g.links, { label: 'لینک جدید', page: 'about', visible: true }],
                      });
                      updateFooterColumnGroups('footer_col3_groups', normalizeGroups(next));
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:opacity-80"
                    style={tealBtn}
                  >
                    <Plus size={13} /> افزودن لینک به زیرستون
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const groups = getFooterGroups(settings.footer_col3_groups, settings.footer_col3_links ?? []);
                updateFooterColumnGroups('footer_col3_groups', normalizeGroups([...groups, { title: '', links: [] }]));
              }}
              className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:opacity-80"
              style={tealBtn}
            >
              <Plus size={13} /> افزودن زیرستون
            </button>

            {/* toggle terms link */}
            <div className="mt-3 px-3 py-2.5 rounded-xl" style={rowStyle}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield size={13} className="text-amber-400" />
                  <span className="text-xs text-slate-300">متن و وضعیت لینک قوانین و مقررات</span>
                </div>
                <button
                  onClick={() => set('footer_col3_show_terms', !(settings.footer_col3_show_terms ?? true))}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={(settings.footer_col3_show_terms ?? true) ? amberBtn : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {(settings.footer_col3_show_terms ?? true) ? <Eye size={11} /> : <EyeOff size={11} />}
                  {(settings.footer_col3_show_terms ?? true) ? 'حذف لینک' : 'افزودن لینک'}
                </button>
              </div>
              <div className="mt-2">
                <label className="text-[10px] text-slate-500 mb-1 block">متن لینک</label>
                <input
                  value={settings.footer_terms_link_label ?? 'قوانین و مقررات'}
                  onChange={e => set('footer_terms_link_label', e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="قوانین و مقررات"
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 p-3 space-y-3" style={rowStyle}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-300">محتوای مودال قوانین و مقررات</div>
                  <div className="text-[10px] text-slate-500 mt-1">متن‌ها را ویرایش، حذف یا اضافه کنید</div>
                </div>
                <button onClick={addTermsSection} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all" style={tealBtn}>
                  <Plus size={11} /> افزودن بند
                </button>
              </div>

              <div className="grid gap-2">
                <label className="text-[10px] text-slate-500">عنوان مودال</label>
                <input
                  value={settings.footer_terms_modal_title ?? 'قوانین و مقررات'}
                  onChange={e => set('footer_terms_modal_title', e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <label className="text-[10px] text-slate-500">زیرعنوان</label>
                <input
                  value={settings.footer_terms_modal_subtitle ?? 'کپیتال نتورک — ویرایش ۱۴۰۴'}
                  onChange={e => set('footer_terms_modal_subtitle', e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              {(settings.footer_terms_modal_sections ?? []).map((section, index) => (
                <div key={index} className="rounded-xl p-3 space-y-2" style={cardStyle}>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] text-slate-500">عنوان بند {index + 1}</label>
                    <button onClick={() => removeTermsSection(index)} className="text-red-400 text-[10px] px-2 py-1 rounded-lg hover:bg-white/10 transition-all">حذف بند</button>
                  </div>
                  <input
                    value={section.title}
                    onChange={e => updateTermsSection(index, 'title', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <label className="text-[10px] text-slate-500">متن بند</label>
                  <textarea
                    value={section.body}
                    onChange={e => updateTermsSection(index, 'body', e.target.value)}
                    rows={4}
                    className={`${inputCls} resize-none`}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
              ))}

              <div className="grid gap-2">
                <label className="text-[10px] text-slate-500">متن تأیید در پایین مودال</label>
                <textarea
                  value={settings.footer_terms_modal_accept_text ?? ''}
                  onChange={e => set('footer_terms_modal_accept_text', e.target.value)}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <label className="text-[10px] text-slate-500">متن پایین مودال</label>
                <textarea
                  value={settings.footer_terms_modal_footer_note ?? ''}
                  onChange={e => set('footer_terms_modal_footer_note', e.target.value)}
                  rows={2}
                  className={`${inputCls} resize-none`}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </div>
          </SectionAccordion>

          {/* ─ ستون ۴: تماس ─────────────────────────────────────────────── */}
          <SectionAccordion id="col4" label="ستون ۴ — تماس" icon={<Phone size={15} />} openId={footerSection} onToggle={setFooterSection}>
            <div className="mb-3">
              <label className="text-xs text-slate-400 mb-1.5 block">عنوان ستون</label>
              <input value={settings.footer_col4_title ?? 'تماس'}
                onChange={e => set('footer_col4_title', e.target.value)}
                className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <p className="text-xs text-slate-500 mb-2">اطلاعات تماس از تب «اطلاعات تماس» خوانده می‌شوند — اینجا فقط نمایش/مخفی را کنترل کنید</p>

            {([
              { key: 'footer_col4_show_email',    label: 'ایمیل',           icon: <Mail size={13} /> },
              { key: 'footer_col4_show_phone',    label: 'تلفن',            icon: <Phone size={13} /> },
              { key: 'footer_col4_show_whatsapp', label: 'واتساپ',          icon: <MessageCircle size={13} /> },
              { key: 'footer_col4_show_hours',    label: 'ساعات کاری',      icon: <Clock size={13} /> },
              { key: 'footer_col4_show_response', label: 'متن پاسخگویی',    icon: <Hash size={13} /> },
            ] as const).map(item => (
              <div key={item.key} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={rowStyle}>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-slate-500">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </div>
                <button
                  onClick={() => set(item.key as keyof SiteSettings, !(settings[item.key as keyof SiteSettings]) as any)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={(settings[item.key as keyof SiteSettings] ?? true) ? tealBtn : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {(settings[item.key as keyof SiteSettings] ?? true) ? <Eye size={11} /> : <EyeOff size={11} />}
                  {(settings[item.key as keyof SiteSettings] ?? true) ? 'نمایش' : 'مخفی'}
                </button>
              </div>
            ))}

            <div className="mt-3">
              <label className="text-xs text-slate-400 mb-1.5 block">متن پاسخگویی</label>
              <input value={settings.footer_col4_response_label ?? 'پاسخگویی تا ۲۴ ساعته'}
                onChange={e => set('footer_col4_response_label', e.target.value)}
                className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </SectionAccordion>

          {/* ─ برند + خبرنامه ────────────────────────────────────────────── */}
          <SectionAccordion id="brand" label="برند + خبرنامه (وسط فوتر)" icon={<Newspaper size={15} />} openId={footerSection} onToggle={setFooterSection}>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">متن توضیح زیر لوگو</label>
              <textarea value={settings.footer_brand_tagline ?? ''}
                onChange={e => set('footer_brand_tagline', e.target.value)}
                rows={2} className={`${inputCls} resize-none`} style={inputStyle}
                onFocus={onFocus} onBlur={onBlur}
                placeholder="اتصال استارتاپ از Seed تا Series B..." />
            </div>

            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={rowStyle}>
              <div className="flex items-center gap-2">
                <Newspaper size={13} className="text-teal-400" />
                <span className="text-xs text-slate-300">نمایش بخش خبرنامه</span>
              </div>
              <button
                onClick={() => set('footer_newsletter_visible', !(settings.footer_newsletter_visible ?? true))}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                style={(settings.footer_newsletter_visible ?? true) ? tealBtn : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {(settings.footer_newsletter_visible ?? true) ? <Eye size={11} /> : <EyeOff size={11} />}
                {(settings.footer_newsletter_visible ?? true) ? 'نمایش' : 'مخفی'}
              </button>
            </div>

            {(settings.footer_newsletter_visible ?? true) && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">توضیح خبرنامه</label>
                    <textarea value={settings.footer_newsletter_desc ?? ''}
                      onChange={e => set('footer_newsletter_desc', e.target.value)}
                      rows={2} className={`${inputCls} resize-none`} style={{ ...inputStyle, fontSize: '12px' }}
                      onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">placeholder ایمیل</label>
                      <input value={settings.footer_newsletter_placeholder ?? ''}
                        onChange={e => set('footer_newsletter_placeholder', e.target.value)}
                        className={inputCls} style={{ ...inputStyle, fontSize: '12px' }} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">متن دکمه</label>
                      <input value={settings.footer_newsletter_btn ?? 'عضویت'}
                        onChange={e => set('footer_newsletter_btn', e.target.value)}
                        className={inputCls} style={{ ...inputStyle, fontSize: '12px' }} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SectionAccordion>

          {/* ─ نوار پایین فوتر ───────────────────────────────────────────── */}
          <SectionAccordion id="bottom" label="نوار پایین فوتر — متن و ترتیب" icon={<AlignLeft size={15} />} openId={footerSection} onToggle={setFooterSection}>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">متن اول نوار پایین</label>
                <input value={settings.footer_bottom_left_text ?? ''}
                  onChange={e => set('footer_bottom_left_text', e.target.value)}
                  placeholder="© 2026 Capital Network..."
                  className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">متن دوم نوار پایین</label>
                <input value={settings.footer_bottom_right_text ?? ''}
                  onChange={e => set('footer_bottom_right_text', e.target.value)}
                  placeholder="ما را دنبال کنید:" 
                  className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">ترتیب نمایش</label>
                <select value={settings.footer_bottom_order ?? 'copyright-first'}
                  onChange={e => set('footer_bottom_order', e.target.value as 'copyright-first' | 'social-first')}
                  className={`${inputCls} bg-slate-950`} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                  <option value="copyright-first">کپی‌رایت اول / شبکه‌های اجتماعی دوم</option>
                  <option value="social-first">شبکه‌های اجتماعی اول / کپی‌رایت دوم</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">آیکون‌های شبکه‌های اجتماعی از تب «شبکه‌های اجتماعی» خوانده شده و ترتیب آنها ثابت است. برای درج آیکون‌ها در متن دوم، از توکن <code>[social]</code> استفاده کنید.</p>
          </SectionAccordion>

        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB: CONTACT ────────────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'contact' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 space-y-4" style={cardStyle}>
          <h3 className="text-sm font-bold text-white mb-4">اطلاعات تماس</h3>
          {([
            { key: 'contact_email',    label: 'ایمیل',      icon: <Mail size={14} />,          placeholder: 'invest@capitalnetwork.ir' },
            { key: 'contact_phone',    label: 'تلفن',       icon: <Phone size={14} />,         placeholder: '+98 21 1234 5678' },
            { key: 'contact_whatsapp', label: 'واتساپ',     icon: <MessageCircle size={14} />, placeholder: '+98 21 9100 1200' },
            { key: 'working_hours',    label: 'ساعات کاری', icon: <Clock size={14} />,         placeholder: 'شنبه تا چهارشنبه: ۹ صبح تا ۶ عصر' },
          ] as const).map(field => (
            <div key={field.key}>
              <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">{field.icon}{field.label}</label>
              <input value={(settings as any)[field.key]}
                onChange={e => set(field.key as keyof SiteSettings, e.target.value as any)}
                placeholder={field.placeholder}
                className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          ))}
        </motion.div>
      )}

      {/* ── TAB: SOCIAL ─────────────────────────────────────────────────── */}
      {activeTab === 'social' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 space-y-4" style={cardStyle}>
          <h3 className="text-sm font-bold text-white mb-2">لینک‌های شبکه‌های اجتماعی</h3>

          <div className="text-xs text-slate-400">لینک‌های فوتر (نمایش در پایین صفحه)</div>
          {([
            { key: 'social_twitter',   label: 'Twitter / X',  placeholder: 'https://twitter.com/...' },
            { key: 'social_linkedin',  label: 'LinkedIn',     placeholder: 'https://linkedin.com/company/...' },
            { key: 'social_instagram', label: 'Instagram',    placeholder: 'https://instagram.com/...' },
            { key: 'social_youtube',   label: 'YouTube',      placeholder: 'https://youtube.com/...' },
          ] as const).map(field => (
            <div key={field.key} className="mt-3">
              <label className="block text-xs text-slate-400 mb-1.5">{field.label}</label>
              <input value={(settings as any)[field.key] ?? ''}
                onChange={e => set(field.key as keyof SiteSettings, e.target.value as any)}
                placeholder={field.placeholder}
                className={inputCls} style={{ ...inputStyle, direction: 'ltr' }} onFocus={onFocus} onBlur={onBlur} />
            </div>
          ))}

          <hr className="border-t border-white/5 my-4" />

          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">شبکه‌های شناور (ویجت)</h4>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">فعال</label>
              <button onClick={() => set('social_float_enabled', !(settings.social_float_enabled ?? false))}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={(settings.social_float_enabled ?? false) ? tealBtn : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {(settings.social_float_enabled ?? false) ? 'روشن' : 'خاموش'}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">آیتم‌های شناور در گوشه پایین سایت نمایش داده می‌شوند. حداکثر 4 آیتم.</p>

          <div className="space-y-3 mt-2">
            {(settings.social_float_items ?? []).map((item, i) => (
              <div key={i} className="rounded-xl p-3" style={rowStyle}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#0000', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {/* simple preview icon */}
                    {(() => {
                      switch (item.network as SocialNetwork) {
                        case 'twitter': return <Twitter size={18} />;
                        case 'linkedin': return <Linkedin size={18} />;
                        case 'instagram': return <Instagram size={18} />;
                        case 'youtube': return <Youtube size={18} />;
                        case 'telegram': return <SendIcon size={18} />;
                        case 'whatsapp': return <MessageCircle size={18} />;
                        case 'facebook': return <Facebook size={18} />;
                        case 'tiktok': return <span className="text-xs">TT</span>;
                        default: return null;
                      }
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-3 gap-2">
                      <select value={item.network}
                        onChange={e => {
                          const arr = [...(settings.social_float_items ?? [])];
                          arr[i] = { ...arr[i], network: e.target.value as SocialNetwork };
                          set('social_float_items', arr);
                        }}
                        className="rounded-xl px-3 py-2 text-sm text-white bg-slate-950 border border-white/10 outline-none">
                        {(['twitter','linkedin','instagram','youtube','telegram','whatsapp','facebook','tiktok'] as SocialNetwork[]).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>

                      <input value={item.url}
                        onChange={e => {
                          const arr = [...(settings.social_float_items ?? [])];
                          arr[i] = { ...arr[i], url: e.target.value };
                          set('social_float_items', arr);
                        }}
                        placeholder="https://..."
                        className="col-span-2 rounded-xl px-3 py-2 text-sm text-white bg-slate-950 border border-white/10 outline-none" style={{ direction: 'ltr' }} />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => {
                        const arr = [...(settings.social_float_items ?? [])]; arr[i] = { ...arr[i], active: !(arr[i].active ?? false) }; set('social_float_items', arr);
                      }} className="px-3 py-1 rounded-xl text-xs" style={(item.active ?? false) ? tealBtn : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {(item.active ?? false) ? 'فعال' : 'غیرفعال'}
                      </button>
                      <div className="flex items-center gap-1 ml-auto">
                        <button disabled={i===0} onClick={() => {
                          const arr = [...(settings.social_float_items ?? [])]; [arr[i-1], arr[i]] = [arr[i], arr[i-1]]; set('social_float_items', arr);
                        }} className="p-1 rounded hover:bg-white/5"><ChevronUp size={14} /></button>
                        <button disabled={i === (settings.social_float_items ?? []).length - 1} onClick={() => {
                          const arr = [...(settings.social_float_items ?? [])]; [arr[i+1], arr[i]] = [arr[i], arr[i+1]]; set('social_float_items', arr);
                        }} className="p-1 rounded hover:bg-white/5"><ChevronDown size={14} /></button>
                        <button onClick={() => {
                          const arr = [...(settings.social_float_items ?? [])].filter((_, idx) => idx !== i); set('social_float_items', arr);
                        }} className="p-1 rounded text-rose-400 hover:bg-white/5"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex">
              <button onClick={() => {
                const arr = [...(settings.social_float_items ?? [])];
                arr.push({ network: 'telegram', url: '', active: true });
                set('social_float_items', arr);
              }} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={tealBtn}>
                <Plus size={13} /> افزودن آیتم
              </button>
              <div className="text-xs text-slate-500 mr-3 self-center">حداکثر 4 آیتم نمایش داده می‌شود</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB: CHAT ───────────────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 space-y-4" style={cardStyle}>
          <h3 className="text-sm font-bold text-white mb-1">پاسخ‌های سریع چت‌بات</h3>
          <p className="text-xs text-slate-500 mb-4">دکمه‌های پیشنهادی در ویجت چت</p>
          <div className="space-y-2">
            {settings.chat_quick_replies.map((reply, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-xl text-sm text-white"
                  style={{ background: 'rgba(0,188,212,0.08)', border: '1px solid rgba(0,188,212,0.2)' }}>
                  {reply}
                </div>
                <button onClick={() => removeReply(i)}
                  className="text-red-400/60 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input value={newReply} onChange={e => setNewReply(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addReply()}
              placeholder="پاسخ سریع جدید..."
              className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none" style={inputStyle}
              onFocus={onFocus} onBlur={onBlur} />
            <button onClick={addReply}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm transition-all hover:opacity-80" style={tealBtn}>
              <Plus size={14} /> اضافه
            </button>
          </div>
        </motion.div>
      )}

      {/* ── TAB: TEAM ───────────────────────────────────────────────────── */}
      {activeTab === 'team' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">اعضای تیم</h3>
            <button onClick={addTeamMember}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80" style={tealBtn}>
              <Plus size={14} /> عضو جدید
            </button>
          </div>
          {settings.team.length === 0 && (
            <div className="text-center py-10 rounded-2xl" style={cardStyle}>
              <Users size={32} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">هنوز عضو تیمی اضافه نشده</p>
            </div>
          )}
          {settings.team.map((member, i) => (
            <div key={i} className="rounded-2xl p-5 space-y-3" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">عضو {i + 1}</span>
                <button onClick={() => removeTeamMember(i)}
                  className="text-red-400/60 hover:text-red-400 p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">نام</label>
                  <input value={member.name} onChange={e => updateTeamMember(i, 'name', e.target.value)}
                    placeholder="نام کامل" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">سمت</label>
                  <input value={member.role} onChange={e => updateTeamMember(i, 'role', e.target.value)}
                    placeholder="Senior Advisor" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">بیوگرافی</label>
                <textarea value={member.bio} onChange={e => updateTeamMember(i, 'bio', e.target.value)}
                  rows={2} placeholder="توضیح کوتاه..."
                  className={`${inputCls} resize-none`} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">لینک عکس پروفایل (URL)</label>
                <input value={member.avatar ?? ''} onChange={e => updateTeamMember(i, 'avatar', e.target.value)}
                  placeholder="https://..." className={inputCls} style={{ ...inputStyle, direction: 'ltr' }} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── TAB: SYSTEM ─────────────────────────────────────────────────── */}
      {activeTab === 'system' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
            <div className="flex items-center gap-2 mb-1">
              <HardDrive size={15} className="text-teal-400" />
              <h3 className="text-sm font-bold text-white">مدیریت حافظه مرورگر (localStorage)</h3>
            </div>
            <p className="text-xs text-slate-500">داده‌های زیر فقط در مرورگر فعلی ذخیره‌اند و پاک کردن آن‌ها به دیتابیس آسیب نمی‌زند.</p>
            <div className="space-y-2">
              {ADMIN_LOCAL_KEYS.map(({ key, label }) => {
                const val = localKeys[key]; const hasData = val !== null && val !== undefined;
                return (
                  <div key={key} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl" style={rowStyle}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${hasData ? 'bg-amber-400' : 'bg-slate-600'}`} />
                      <div className="min-w-0">
                        <p className="text-xs text-white font-medium">{label}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5" dir="ltr">{key}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-semibold ${hasData ? 'text-amber-300' : 'text-slate-500'}`}
                      style={{ background: hasData ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)' }}>
                      {hasData ? 'دارد داده' : 'خالی'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="pt-2 flex items-center gap-3">
              {clearDone ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                  ✓ همه داده‌های local پاک شدند
                </div>
              ) : (
                <>
                  <button onClick={handleClearLocalStorage}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={clearConfirm
                      ? { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.35)' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {clearConfirm ? <><AlertTriangle size={14} /> تأیید می‌کنم — پاک کن</> : <><Trash2 size={14} /> پاک کردن داده‌های local</>}
                  </button>
                  {clearConfirm && (
                    <button onClick={() => setClearConfirm(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">انصراف</button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
