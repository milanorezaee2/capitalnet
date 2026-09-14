import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Eye, EyeOff, Save, ChevronRight,
  Megaphone, Palette, Settings2, Target, Clock, Layers,
  CheckCircle2, XCircle, Edit3, Copy, AlertTriangle,
} from 'lucide-react';
import { fetchSettings, saveSetting } from '../../lib/settingsApi';
import type {
  PopupAd, PopupTrigger, PopupPosition, PopupAnimation, SiteSection,
} from '../../lib/settingsApi';

// ─────────────────────────────────────────────────────────────────────────────
// Constants / metadata
// ─────────────────────────────────────────────────────────────────────────────

const SITE_SECTIONS: Array<{ key: SiteSection; label: string; group: string }> = [
  { key: 'home:hero',           label: 'هرو (Hero)',              group: 'صفحه اصلی' },
  { key: 'home:network',        label: 'شبکه جهانی',              group: 'صفحه اصلی' },
  { key: 'home:services',       label: 'خدمات',                   group: 'صفحه اصلی' },
  { key: 'home:why-us',         label: 'چرا ما؟',                 group: 'صفحه اصلی' },
  { key: 'home:cta',            label: 'آماده‌ای؟ (CTA)',          group: 'صفحه اصلی' },
  { key: 'home:process',        label: 'فرآیند',                  group: 'صفحه اصلی' },
  { key: 'home:client-showcase',label: 'نمونه‌ها',                group: 'صفحه اصلی' },
  { key: 'home:testimonials',   label: 'نظرات',                   group: 'صفحه اصلی' },
  { key: 'home:blog-preview',   label: 'پیش‌نمایش بلاگ',          group: 'صفحه اصلی' },
  { key: 'home:faq',            label: 'سوالات متداول',           group: 'صفحه اصلی' },
  { key: 'page:services',       label: 'صفحه خدمات',              group: 'صفحات' },
  { key: 'page:process',        label: 'صفحه فرآیند',             group: 'صفحات' },
  { key: 'page:blog',           label: 'صفحه بلاگ',               group: 'صفحات' },
  { key: 'page:about',          label: 'صفحه درباره ما',           group: 'صفحات' },
  { key: 'page:contact',        label: 'صفحه تماس',               group: 'صفحات' },
  { key: 'page:evaluation',     label: 'صفحه ارزیابی',            group: 'صفحات' },
  { key: 'global',              label: '🌐 همه صفحات (سراسری)',    group: 'سراسری' },
];

const TRIGGER_LABELS: Record<PopupTrigger, string> = {
  on_load:    '⏱ بارگذاری صفحه',
  on_exit:    '🚪 خروج کاربر',
  on_scroll:  '📜 اسکرول صفحه',
  on_section: '📍 ورود به سکشن',
};

const POSITION_LABELS: Record<PopupPosition, string> = {
  'center':        '↕ مرکز صفحه',
  'bottom-right':  '↘ پایین راست',
  'bottom-left':   '↙ پایین چپ',
  'top-right':     '↗ بالا راست',
  'top-left':      '↖ بالا چپ',
  'bottom-center': '↓ پایین مرکز',
};

const ANIMATION_LABELS: Record<PopupAnimation, string> = {
  zoom:       '🔭 زوم',
  'slide-up': '⬆ اسلاید بالا',
  'slide-down':'⬇ اسلاید پایین',
  fade:       '🌫 محو',
  flip:       '🔄 فلیپ',
};

const ACCENT_PRESETS = [
  '#00BCD4', '#3b82f6', '#f59e0b', '#10b981', '#ec4899',
  '#8b5cf6', '#ef4444', '#f97316', '#14b8a6', '#a3e635',
];

const emptyAd = (): PopupAd => ({
  id:            crypto.randomUUID(),
  title:         '',
  body:          '',
  cta_text:      '',
  cta_url:       '',
  accent_color:  '#00BCD4',
  badge:         '',
  icon:          '🎯',
  visible:       true,
  trigger:       'on_load',
  delay_sec:     3,
  position:      'center',
  animation:     'zoom',
  sections:      ['global'],
  max_shows:     3,
  show_every_days: 1,
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────
const cardSt  = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };
const inputSt = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
const inputCls = 'w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors';

function onFocusIn(e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(0,188,212,0.5)';
}
function onFocusOut(e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar tab definition
// ─────────────────────────────────────────────────────────────────────────────
type TabId = 'list' | 'content' | 'display' | 'targeting' | 'timing';

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'list',      label: 'لیست آگهی‌ها', icon: <Megaphone size={16} /> },
  { id: 'content',   label: 'محتوا',         icon: <Edit3 size={16} /> },
  { id: 'display',   label: 'نمایش',         icon: <Palette size={16} /> },
  { id: 'targeting', label: 'هدف‌گیری',      icon: <Target size={16} /> },
  { id: 'timing',    label: 'زمان‌بندی',      icon: <Clock size={16} /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mini popup preview
// ─────────────────────────────────────────────────────────────────────────────
function PopupPreview({ ad }: { ad: PopupAd }) {
  return (
    <div
      className="rounded-2xl p-4 text-right relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #07111e 60%, rgba(0,0,0,0.8))',
        border: `1px solid ${ad.accent_color}40`,
        boxShadow: `0 0 24px ${ad.accent_color}22`,
        minWidth: 260,
        maxWidth: 320,
      }}
    >
      {/* glow blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: ad.accent_color }}
      />
      {ad.badge && (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
          style={{ background: `${ad.accent_color}22`, color: ad.accent_color, border: `1px solid ${ad.accent_color}40` }}
        >
          {ad.badge}
        </span>
      )}
      <div className="flex items-start gap-2 mb-2">
        {ad.icon && <span className="text-2xl mt-0.5 flex-shrink-0">{ad.icon}</span>}
        <div>
          <p className="text-white font-bold text-sm leading-snug">{ad.title || 'عنوان آگهی'}</p>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">{ad.body || 'متن آگهی اینجا نمایش داده می‌شود'}</p>
        </div>
      </div>
      {ad.cta_text && (
        <button
          className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-white transition-all"
          style={{ background: `linear-gradient(90deg, ${ad.accent_color}, ${ad.accent_color}aa)` }}
        >
          {ad.cta_text}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPopupAdsPage() {
  const [ads, setAds]           = useState<PopupAd[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('list');

  const selectedAd = ads.find(a => a.id === selected) ?? null;

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSettings().then(s => {
      setAds(s.popup_ads ?? []);
      setLoading(false);
    });
  }, []);

  // ── Save all ──────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    await saveSetting('popup_ads', ads);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [ads]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const updateSelected = (patch: Partial<PopupAd>) => {
    if (!selected) return;
    setAds(prev => prev.map(a => a.id === selected ? { ...a, ...patch } : a));
  };

  const addAd = () => {
    const a = emptyAd();
    setAds(prev => [...prev, a]);
    setSelected(a.id);
    setActiveTab('content');
  };

  const deleteAd = (id: string) => {
    setAds(prev => prev.filter(a => a.id !== id));
    if (selected === id) setSelected(null);
  };

  const duplicateAd = (ad: PopupAd) => {
    const copy = { ...ad, id: crypto.randomUUID(), title: `${ad.title} (کپی)` };
    setAds(prev => [...prev, copy]);
    setSelected(copy.id);
  };

  const toggleVisible = (id: string) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, visible: !a.visible } : a));
  };

  const toggleSection = (key: SiteSection) => {
    if (!selectedAd) return;
    const has = selectedAd.sections.includes(key);
    if (has) {
      updateSelected({ sections: selectedAd.sections.filter(s => s !== key) });
    } else {
      // اگر global انتخاب شود، بقیه را خالی کن
      if (key === 'global') {
        updateSelected({ sections: ['global'] });
      } else {
        updateSelected({ sections: [...selectedAd.sections.filter(s => s !== 'global'), key] });
      }
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Megaphone size={22} className="text-teal-400" />
            مدیریت پاپ‌آپ آگهی‌ها
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            آگهی‌های پاپ‌آپ را ایجاد، ویرایش و هدف‌گیری کنید
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{
            background: saved
              ? 'linear-gradient(90deg,#10b981,#059669)'
              : 'linear-gradient(90deg,#00BCD4,#00838F)',
            color: '#fff',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <CheckCircle2 size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'در حال ذخیره...' : saved ? 'ذخیره شد!' : 'ذخیره همه'}
        </button>
      </div>

      {/* ── Layout: Sidebar + Content ── */}
      <div className="flex gap-4 min-h-[620px]">

        {/* ── Sidebar tabs ── */}
        <div
          className="flex flex-col w-44 flex-shrink-0 rounded-2xl overflow-hidden"
          style={cardSt}
        >
          <div className="px-3 pt-4 pb-2">
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">منوی تنظیمات</p>
          </div>
          <nav className="flex-1 px-2 pb-3 space-y-0.5">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              // اگر تب نیاز به آگهی انتخاب‌شده دارد
              const needsAd = tab.id !== 'list';
              const disabled = needsAd && !selectedAd;
              return (
                <button
                  key={tab.id}
                  onClick={() => { if (!disabled) setActiveTab(tab.id); }}
                  disabled={disabled}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-right"
                  style={{
                    background: isActive ? 'rgba(0,188,212,0.12)' : 'transparent',
                    color: disabled ? 'rgba(255,255,255,0.2)' : isActive ? '#00BCD4' : 'rgba(255,255,255,0.6)',
                    border: isActive ? '1px solid rgba(0,188,212,0.2)' : '1px solid transparent',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span className="flex-shrink-0">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
          {/* Add button in sidebar */}
          <div className="px-3 pb-4">
            <button
              onClick={addAd}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: 'rgba(0,188,212,0.1)',
                color: '#00BCD4',
                border: '1px dashed rgba(0,188,212,0.3)',
              }}
            >
              <Plus size={16} />
              آگهی جدید
            </button>
          </div>
        </div>

        {/* ── Main content panel ── */}
        <div className="flex-1 rounded-2xl overflow-hidden" style={cardSt}>
          <AnimatePresence mode="wait">

            {/* ══ TAB: LIST ═══════════════════════════════════════════════════ */}
            {activeTab === 'list' && (
              <motion.div
                key="tab-list"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="p-5 h-full flex flex-col gap-4"
              >
                {ads.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(0,188,212,0.08)', border: '1px solid rgba(0,188,212,0.15)' }}
                    >
                      <Megaphone size={28} className="text-teal-400/50" />
                    </div>
                    <div>
                      <p className="text-white/50 text-base font-medium">هنوز آگهی‌ای ثبت نشده</p>
                      <p className="text-slate-500 text-xs mt-1">برای شروع روی «آگهی جدید» کلیک کنید</p>
                    </div>
                    <button
                      onClick={addAd}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                      style={{ background: 'linear-gradient(90deg,#00BCD4,#00838F)', color: '#fff' }}
                    >
                      <Plus size={16} /> ایجاد اولین آگهی
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {ads.map(ad => (
                      <motion.div
                        key={ad.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: selected === ad.id ? 'rgba(0,188,212,0.08)' : 'rgba(255,255,255,0.02)',
                          border: selected === ad.id
                            ? `1px solid rgba(0,188,212,0.3)`
                            : `1px solid rgba(255,255,255,0.06)`,
                        }}
                        onClick={() => { setSelected(ad.id); setActiveTab('content'); }}
                      >
                        {/* Icon + color dot */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                          style={{ background: `${ad.accent_color}18`, border: `1px solid ${ad.accent_color}30` }}
                        >
                          {ad.icon || '🎯'}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold text-sm truncate">
                              {ad.title || '(بدون عنوان)'}
                            </p>
                            {ad.badge && (
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                                style={{ background: `${ad.accent_color}20`, color: ad.accent_color }}
                              >
                                {ad.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-slate-500 text-xs">{TRIGGER_LABELS[ad.trigger]}</span>
                            <span className="text-slate-600 text-[10px]">•</span>
                            <span className="text-slate-500 text-xs">{POSITION_LABELS[ad.position]}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {ad.sections.slice(0, 3).map(s => {
                              const info = SITE_SECTIONS.find(x => x.key === s);
                              return (
                                <span
                                  key={s}
                                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
                                >
                                  {info?.label ?? s}
                                </span>
                              );
                            })}
                            {ad.sections.length > 3 && (
                              <span className="text-[10px] text-slate-600">+{ad.sections.length - 3}</span>
                            )}
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* نمایش / پنهان */}
                          <button
                            onClick={e => { e.stopPropagation(); toggleVisible(ad.id); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            title={ad.visible ? 'پنهان کردن' : 'نمایش دادن'}
                            style={{
                              background: ad.visible ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                              color: ad.visible ? '#10b981' : '#f87171',
                              border: ad.visible ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
                            }}
                          >
                            {ad.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          {/* Duplicate */}
                          <button
                            onClick={e => { e.stopPropagation(); duplicateAd(ad); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            title="کپی"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            <Copy size={14} />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={e => { e.stopPropagation(); deleteAd(ad.id); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            title="حذف"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ TAB: CONTENT ════════════════════════════════════════════════ */}
            {activeTab === 'content' && selectedAd && (
              <motion.div
                key="tab-content"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5 h-full"
              >
                {/* Left: form */}
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-base flex items-center gap-2">
                    <Edit3 size={16} className="text-teal-400" /> محتوای آگهی
                  </h3>
                  {/* Icon */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">آیکون / ایموجی</label>
                    <input
                      className={inputCls}
                      style={inputSt}
                      value={selectedAd.icon ?? ''}
                      onChange={e => updateSelected({ icon: e.target.value })}
                      onFocus={onFocusIn}
                      onBlur={onFocusOut}
                      placeholder="🎯"
                    />
                  </div>
                  {/* Badge */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">باج (برچسب کوچک)</label>
                    <input
                      className={inputCls}
                      style={inputSt}
                      value={selectedAd.badge ?? ''}
                      onChange={e => updateSelected({ badge: e.target.value })}
                      onFocus={onFocusIn}
                      onBlur={onFocusOut}
                      placeholder="مثال: ویژه | پیشنهاد"
                    />
                  </div>
                  {/* Title */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">عنوان</label>
                    <input
                      className={inputCls}
                      style={inputSt}
                      value={selectedAd.title}
                      onChange={e => updateSelected({ title: e.target.value })}
                      onFocus={onFocusIn}
                      onBlur={onFocusOut}
                      placeholder="عنوان جذاب آگهی"
                    />
                  </div>
                  {/* Body */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">متن</label>
                    <textarea
                      className={inputCls}
                      style={{ ...inputSt, resize: 'none' }}
                      rows={3}
                      value={selectedAd.body}
                      onChange={e => updateSelected({ body: e.target.value })}
                      onFocus={onFocusIn}
                      onBlur={onFocusOut}
                      placeholder="متن توضیحی آگهی"
                    />
                  </div>
                  {/* CTA */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">متن دکمه</label>
                      <input
                        className={inputCls}
                        style={inputSt}
                        value={selectedAd.cta_text ?? ''}
                        onChange={e => updateSelected({ cta_text: e.target.value })}
                        onFocus={onFocusIn}
                        onBlur={onFocusOut}
                        placeholder="مثال: بیشتر بدانید"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">آدرس لینک</label>
                      <input
                        className={inputCls}
                        style={inputSt}
                        value={selectedAd.cta_url ?? ''}
                        onChange={e => updateSelected({ cta_url: e.target.value })}
                        onFocus={onFocusIn}
                        onBlur={onFocusOut}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
                {/* Right: live preview */}
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-slate-500 text-xs">پیش‌نمایش زنده</p>
                  <PopupPreview ad={selectedAd} />
                  {/* Visibility toggle */}
                  <button
                    onClick={() => updateSelected({ visible: !selectedAd.visible })}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: selectedAd.visible ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: selectedAd.visible ? '#10b981' : '#f87171',
                      border: selectedAd.visible ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)',
                    }}
                  >
                    {selectedAd.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                    {selectedAd.visible ? 'فعال — در حال نمایش' : 'غیرفعال — پنهان'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══ TAB: DISPLAY ════════════════════════════════════════════════ */}
            {activeTab === 'display' && selectedAd && (
              <motion.div
                key="tab-display"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5"
              >
                <div className="space-y-5">
                  <h3 className="text-white font-bold text-base flex items-center gap-2">
                    <Palette size={16} className="text-teal-400" /> ظاهر و نمایش
                  </h3>

                  {/* Accent color */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">رنگ برند</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {ACCENT_PRESETS.map(c => (
                        <button
                          key={c}
                          onClick={() => updateSelected({ accent_color: c })}
                          className="w-8 h-8 rounded-lg transition-all"
                          style={{
                            background: c,
                            outline: selectedAd.accent_color === c ? `2px solid white` : 'none',
                            outlineOffset: 2,
                          }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={selectedAd.accent_color}
                      onChange={e => updateSelected({ accent_color: e.target.value })}
                      className="w-12 h-8 rounded-lg cursor-pointer"
                      style={{ border: 'none', background: 'none', padding: 0 }}
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">موقعیت نمایش</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(POSITION_LABELS) as PopupPosition[]).map(pos => (
                        <button
                          key={pos}
                          onClick={() => updateSelected({ position: pos })}
                          className="px-3 py-2 rounded-xl text-xs font-medium transition-all text-right"
                          style={{
                            background: selectedAd.position === pos ? 'rgba(0,188,212,0.15)' : 'rgba(255,255,255,0.04)',
                            color: selectedAd.position === pos ? '#00BCD4' : 'rgba(255,255,255,0.5)',
                            border: selectedAd.position === pos ? '1px solid rgba(0,188,212,0.3)' : '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          {POSITION_LABELS[pos]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Animation */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">انیمیشن ورود</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(ANIMATION_LABELS) as PopupAnimation[]).map(anim => (
                        <button
                          key={anim}
                          onClick={() => updateSelected({ animation: anim })}
                          className="px-3 py-2 rounded-xl text-xs font-medium transition-all text-center"
                          style={{
                            background: selectedAd.animation === anim ? 'rgba(0,188,212,0.15)' : 'rgba(255,255,255,0.04)',
                            color: selectedAd.animation === anim ? '#00BCD4' : 'rgba(255,255,255,0.5)',
                            border: selectedAd.animation === anim ? '1px solid rgba(0,188,212,0.3)' : '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          {ANIMATION_LABELS[anim]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-slate-500 text-xs">پیش‌نمایش</p>
                  <PopupPreview ad={selectedAd} />
                </div>
              </motion.div>
            )}

            {/* ══ TAB: TARGETING ══════════════════════════════════════════════ */}
            {activeTab === 'targeting' && selectedAd && (
              <motion.div
                key="tab-targeting"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="p-5 space-y-5"
              >
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <Target size={16} className="text-teal-400" /> هدف‌گیری سکشن‌ها
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  انتخاب کنید این آگهی در کدام صفحه یا سکشن سایت نمایش داده شود.
                  انتخاب «همه صفحات» باعث می‌شود در تمام سایت نمایش یابد.
                </p>

                {/* Group sections */}
                {['سراسری', 'صفحه اصلی', 'صفحات'].map(group => {
                  const items = SITE_SECTIONS.filter(s => s.group === group);
                  return (
                    <div key={group}>
                      <p
                        className="text-[10px] font-bold tracking-widest uppercase mb-2"
                        style={{ color: 'rgba(255,255,255,0.25)' }}
                      >
                        {group}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {items.map(({ key, label }) => {
                          const isSelected = selectedAd.sections.includes(key);
                          return (
                            <button
                              key={key}
                              onClick={() => toggleSection(key)}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-right"
                              style={{
                                background: isSelected ? 'rgba(0,188,212,0.12)' : 'rgba(255,255,255,0.03)',
                                color: isSelected ? '#00BCD4' : 'rgba(255,255,255,0.5)',
                                border: isSelected ? '1px solid rgba(0,188,212,0.25)' : '1px solid rgba(255,255,255,0.07)',
                              }}
                            >
                              {isSelected ? <CheckCircle2 size={13} /> : <XCircle size={13} className="opacity-30" />}
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {selectedAd.sections.length === 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
                  >
                    <AlertTriangle size={14} />
                    هیچ سکشنی انتخاب نشده — این آگهی نمایش داده نخواهد شد
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ TAB: TIMING ═════════════════════════════════════════════════ */}
            {activeTab === 'timing' && selectedAd && (
              <motion.div
                key="tab-timing"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="p-5 space-y-5"
              >
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <Clock size={16} className="text-teal-400" /> زمان‌بندی و تریگر
                </h3>

                {/* Trigger */}
                <div>
                  <label className="block text-xs text-slate-400 mb-2">رویداد نمایش</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(TRIGGER_LABELS) as PopupTrigger[]).map(t => (
                      <button
                        key={t}
                        onClick={() => updateSelected({ trigger: t })}
                        className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-right"
                        style={{
                          background: selectedAd.trigger === t ? 'rgba(0,188,212,0.15)' : 'rgba(255,255,255,0.04)',
                          color: selectedAd.trigger === t ? '#00BCD4' : 'rgba(255,255,255,0.5)',
                          border: selectedAd.trigger === t ? '1px solid rgba(0,188,212,0.3)' : '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        {TRIGGER_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delay */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    تأخیر نمایش: <span className="text-teal-400 font-bold">{selectedAd.delay_sec} ثانیه</span>
                  </label>
                  <input
                    type="range" min={0} max={60} step={1}
                    value={selectedAd.delay_sec}
                    onChange={e => updateSelected({ delay_sec: +e.target.value })}
                    className="w-full"
                    style={{ accentColor: '#00BCD4' }}
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>بی‌درنگ</span><span>۶۰ ثانیه</span>
                  </div>
                </div>

                {/* Max shows */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    حداکثر نمایش: <span className="text-teal-400 font-bold">
                      {selectedAd.max_shows === 0 ? 'بی‌نهایت' : `${selectedAd.max_shows} بار`}
                    </span>
                  </label>
                  <input
                    type="range" min={0} max={20} step={1}
                    value={selectedAd.max_shows}
                    onChange={e => updateSelected({ max_shows: +e.target.value })}
                    className="w-full"
                    style={{ accentColor: '#00BCD4' }}
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>بی‌نهایت</span><span>۲۰ بار</span>
                  </div>
                </div>

                {/* Show every N days */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    تکرار هر: <span className="text-teal-400 font-bold">
                      {selectedAd.show_every_days === 0 ? 'هر بار بازدید' : `${selectedAd.show_every_days} روز`}
                    </span>
                  </label>
                  <input
                    type="range" min={0} max={30} step={1}
                    value={selectedAd.show_every_days}
                    onChange={e => updateSelected({ show_every_days: +e.target.value })}
                    className="w-full"
                    style={{ accentColor: '#00BCD4' }}
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>هر بار</span><span>۳۰ روز</span>
                  </div>
                </div>

                {/* Summary card */}
                <div className="p-4 rounded-xl space-y-1.5" style={{ background: 'rgba(0,188,212,0.06)', border: '1px solid rgba(0,188,212,0.15)' }}>
                  <p className="text-teal-400 text-xs font-bold mb-2 flex items-center gap-1.5"><Settings2 size={13} /> خلاصه تنظیمات</p>
                  <SummaryRow label="تریگر" value={TRIGGER_LABELS[selectedAd.trigger]} />
                  <SummaryRow label="تأخیر" value={`${selectedAd.delay_sec} ثانیه`} />
                  <SummaryRow label="موقعیت" value={POSITION_LABELS[selectedAd.position]} />
                  <SummaryRow label="انیمیشن" value={ANIMATION_LABELS[selectedAd.animation]} />
                  <SummaryRow label="حداکثر نمایش" value={selectedAd.max_shows === 0 ? 'بی‌نهایت' : `${selectedAd.max_shows} بار`} />
                  <SummaryRow label="تکرار" value={selectedAd.show_every_days === 0 ? 'هر بازدید' : `هر ${selectedAd.show_every_days} روز`} />
                  <SummaryRow
                    label="سکشن‌ها"
                    value={selectedAd.sections.map(s => SITE_SECTIONS.find(x => x.key === s)?.label ?? s).join('، ')}
                  />
                </div>
              </motion.div>
            )}

            {/* Placeholder when no ad selected and not on list tab */}
            {activeTab !== 'list' && !selectedAd && (
              <motion.div
                key="no-selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-3 py-20"
              >
                <Layers size={36} className="text-slate-600" />
                <p className="text-slate-500 text-sm">ابتدا یک آگهی را از لیست انتخاب کنید</p>
                <button
                  onClick={() => setActiveTab('list')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                >
                  <ChevronRight size={14} /> رفتن به لیست
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <span className="text-slate-500 flex-shrink-0">{label}:</span>
      <span className="text-white/70 text-right">{value || '—'}</span>
    </div>
  );
}
