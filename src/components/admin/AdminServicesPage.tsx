// ─── Enterprise Services Admin Page — Full WordPress-Grade CMS ───────────────
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Eye, Plus, Trash2, ChevronDown, ChevronUp,
  GripVertical, Edit3, X, Check, AlertCircle, ExternalLink,
  Sparkles, DollarSign,
  Image as ImageIcon, MessageSquare, HelpCircle, Globe,
  BookOpen, Bell,
  RotateCcw, Copy, Link,
  Layout, MoveUp, MoveDown, Type, AlignLeft, Divide,
  Star, MousePointerClick, Columns2, CreditCard, Highlighter,
  Smile, Maximize2, ArrowUpDown, SlidersHorizontal,
  ListChecks,
} from 'lucide-react';
import { enterpriseServiceContent } from '../../features/services/data/enterpriseContent';
import { loadServiceContent, saveServiceContent, resetServiceContent } from '../../features/services/data/serviceContentStore';
import type { EnterpriseServicePageContent, CustomSection, CustomBlock, CustomBlockType } from '../../features/services/types/enterprise';

// ─── Theme tokens (matches AdminLayout dark theme) ────────────────────────────
const T = {
  bg:         '#07111e',
  surface:    'rgba(255,255,255,0.04)',
  surfaceHov: 'rgba(255,255,255,0.07)',
  border:     'rgba(255,255,255,0.08)',
  borderSub:  'rgba(255,255,255,0.05)',
  text:       '#e2e8f0',
  textMuted:  'rgba(255,255,255,0.45)',
  textSub:    'rgba(255,255,255,0.25)',
  accent:     '#00BCD4',
  accentBg:   'rgba(0,188,212,0.12)',
  accentBdr:  'rgba(0,188,212,0.2)',
};

// ─── Shared input primitives ──────────────────────────────────────────────────
const inp = [
  'w-full px-3 py-2 text-sm rounded-lg transition-all',
  'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]',
  'text-slate-200 placeholder-slate-500',
  'focus:outline-none focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4]',
].join(' ');

const labelCls = 'block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest';

const FInput = ({ label: l, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) => (
  <div>
    <label className={labelCls}>{l}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} className={inp} />
  </div>
);

const FTextarea = ({ label: l, value, onChange, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) => (
  <div>
    <label className={labelCls}>{l}</label>
    <textarea value={value} onChange={e => onChange(e.target.value)}
      rows={rows} className={`${inp} resize-none`} />
  </div>
);

const FToggle = ({ label: l, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
      style={{ background: value ? '#00BCD4' : 'rgba(255,255,255,0.15)' }}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-1'}`} />
    </button>
    {l && <span className="text-sm font-medium text-slate-300">{l}</span>}
  </label>
);

const FImageUpload = ({ label: l, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) => (
  <div>
    <label className={labelCls}>{l}</label>
    <div className="flex gap-2">
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder="https://... یا /images/..." className={`${inp} flex-1`} />
      <button className="shrink-0 px-3 py-2 text-xs font-semibold rounded-lg text-slate-300 flex items-center gap-1 transition-colors"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <ImageIcon size={13} /> انتخاب
      </button>
    </div>
    {value && (
      <div className="mt-2 relative h-28 rounded-lg overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
        <img src={value} alt="" className="h-full w-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
        <button onClick={() => onChange('')} className="absolute top-1 left-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
          <X size={10} />
        </button>
      </div>
    )}
  </div>
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card = ({ children, title, subtitle, badge }: {
  children: React.ReactNode; title: string; subtitle?: string; badge?: string;
}) => (
  <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
    <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.borderSub}`, background: 'rgba(0,188,212,0.04)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-200 text-sm">{title}</h3>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>{subtitle}</p>}
        </div>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}` }}>
            {badge}
          </span>
        )}
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── Collapsible item row ─────────────────────────────────────────────────────
const ItemRow = ({ title, subtitle, onDelete, onDuplicate, children, accent = '#00BCD4' }: {
  title: string; subtitle?: string; accent?: string;
  onDelete: () => void; onDuplicate?: () => void;
  children?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer"
        style={{ background: open ? 'rgba(0,188,212,0.06)' : T.surface }}>
        <GripVertical size={14} style={{ color: T.textSub }} className="shrink-0" />
        <div className="w-1 h-7 rounded-full shrink-0" style={{ background: accent }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">{title}</p>
          {subtitle && <p className="text-xs truncate" style={{ color: T.textMuted }}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onDuplicate && (
            <button onClick={onDuplicate} className="p-1.5 rounded-lg transition-all"
              style={{ color: T.textMuted }} title="کپی"
              onMouseEnter={e => (e.currentTarget.style.color = T.text)}
              onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}>
              <Copy size={13} />
            </button>
          )}
          <button onClick={onDelete} className="p-1.5 rounded-lg transition-all"
            style={{ color: T.textMuted }} title="حذف"
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}>
            <Trash2 size={13} />
          </button>
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg transition-all"
            style={{ color: T.textMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = T.accent)}
            onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
      {open && children && (
        <div className="p-4 grid gap-4" style={{ borderTop: `1px solid ${T.borderSub}`, background: 'rgba(0,0,0,0.15)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV = [
  { id: 'hero',              label: 'Hero / معرفی',         icon: Sparkles,    color: 'text-violet-500' },
  { id: 'services_overview', label: 'خدمات ما',             icon: ListChecks,  color: 'text-cyan-400'   },
  { id: 'pricing',           label: 'قیمت‌گذاری',           icon: DollarSign,  color: 'text-green-500'  },
  { id: 'testimonials',      label: 'نظرات مشتریان',        icon: MessageSquare, color: 'text-purple-500' },
  { id: 'faq',               label: 'سوالات متداول',         icon: HelpCircle,  color: 'text-yellow-600' },
  { id: 'cta',               label: 'CTA / فراخوان',        icon: Link,        color: 'text-red-500'    },
  { id: 'newsletter',        label: 'خبرنامه',              icon: Bell,        color: 'text-orange-400' },
  { id: 'seo',               label: 'تنظیمات SEO',          icon: Globe,       color: 'text-teal-600'   },
  { id: 'visibility',        label: 'نمایش / پنهان‌سازی',   icon: Eye,         color: 'text-gray-600'   },
  { id: 'custom_sections',   label: '✦ سکشن‌ساز',          icon: Layout,      color: 'text-cyan-400'   },
] as const;

type NavId = typeof NAV[number]['id'];

// ─── Notification ─────────────────────────────────────────────────────────────
const Notif = ({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
  >
    {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
    {msg}
    <button onClick={onClose}><X size={14} /></button>
  </motion.div>
);

// ─── String array editor (tags) ───────────────────────────────────────────────
const TagsEditor = ({ label: l, items, onChange }: {
  label: string; items: string[]; onChange: (v: string[]) => void;
}) => {
  const [draft, setDraft] = useState('');
  return (
    <div>
      <label className={labelCls}>{l}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full"
            style={{ background: T.accentBg, border: `1px solid ${T.accentBdr}`, color: T.accent }}>
            {item}
            <button onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="transition-colors" style={{ color: T.accent }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = T.accent)}>
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && draft.trim()) { onChange([...items, draft.trim()]); setDraft(''); e.preventDefault(); } }}
          placeholder="تایپ کنید و Enter بزنید..." className={`${inp} flex-1`} />
        <button onClick={() => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(''); } }}
          className="px-3 py-2 text-white text-xs font-bold rounded-lg transition-colors"
          style={{ background: T.accent }}>
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── Unique ID helper ─────────────────────────────────────────────────────────
const uid = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function AdminServicesPage() {
  const [data, setData] = useState<EnterpriseServicePageContent>(
    () => loadServiceContent()
  );
  const [active, setActive] = useState<NavId>('hero');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notif, setNotif] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Re-hydrate if another tab changes the store
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'cn_enterprise_service_content_v1') {
        setData(loadServiceContent());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const update = useCallback(<K extends keyof EnterpriseServicePageContent>(
    key: K, val: EnterpriseServicePageContent[K]
  ) => {
    setData(d => ({ ...d, [key]: val }));
    setDirty(true);
  }, []);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3500);
  };

  const handleSave = () => {
    setSaving(true);
    // Persist to localStorage — this is the real save
    saveServiceContent(data);
    setSaving(false);
    setDirty(false);
    notify('تمام تغییرات با موفقیت ذخیره شد ✓');
  };

  const handleReset = () => {
    if (!window.confirm('همه تغییرات از دست می‌رود. ادامه می‌دهید؟')) return;
    resetServiceContent();
    setData(loadServiceContent());
    setDirty(false);
    notify('داده‌ها به حالت اولیه برگشتند');
  };

  // ── Render section content ────────────────────────────────────────────────
  const renderSection = () => {
    switch (active) {

      // ── HERO ───────────────────────────────────────────────────────────────
      case 'hero': return (
        <div className="space-y-5">
          <Card title="محتوای اصلی Hero" subtitle="عنوان، زیرعنوان و توضیحات" badge="Hero">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FInput label="بج (Badge)" value={data.hero.badge} onChange={v => update('hero', { ...data.hero, badge: v })} />
                <FInput label="Eyebrow" value={data.hero.eyebrow} onChange={v => update('hero', { ...data.hero, eyebrow: v })} />
              </div>
              <FInput label="عنوان اصلی" value={data.hero.title} onChange={v => update('hero', { ...data.hero, title: v })} />
              <FInput label="زیرعنوان" value={data.hero.subtitle} onChange={v => update('hero', { ...data.hero, subtitle: v })} />
              <FTextarea label="توضیحات" value={data.hero.description} onChange={v => update('hero', { ...data.hero, description: v })} rows={3} />
              <div className="grid grid-cols-2 gap-4">
                <FInput label="متن دکمه اصلی (CTA)" value={data.hero.ctaPrimary} onChange={v => update('hero', { ...data.hero, ctaPrimary: v })} />
                <FInput label="متن دکمه ثانویه" value={data.hero.ctaSecondary} onChange={v => update('hero', { ...data.hero, ctaSecondary: v })} />
              </div>
            </div>
          </Card>

          <Card title="آمار Hero" subtitle="مقادیر عددی نمایش داده شده در Hero">
            <div className="space-y-3">
              {data.hero.stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <FInput label="مقدار" value={stat.value} onChange={v => { const s = [...data.hero.stats]; s[i] = { ...s[i], value: v }; update('hero', { ...data.hero, stats: s }); }} />
                    <FInput label="برچسب" value={stat.label} onChange={v => { const s = [...data.hero.stats]; s[i] = { ...s[i], label: v }; update('hero', { ...data.hero, stats: s }); }} />
                  </div>
                  <button onClick={() => { const s = data.hero.stats.filter((_, j) => j !== i); update('hero', { ...data.hero, stats: s }); }} className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg mt-4">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button onClick={() => update('hero', { ...data.hero, stats: [...data.hero.stats, { label: '', value: '' }] })}
                className="w-full py-2 border-2 border-dashed border-white/15 text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> افزودن آمار
              </button>
            </div>
          </Card>

          <Card title="Trust Badges" subtitle="نشان‌های اعتماد نمایش داده شده در Hero">
            <TagsEditor label="Trust Badges" items={data.hero.trustBadges} onChange={v => update('hero', { ...data.hero, trustBadges: v })} />
          </Card>
        </div>
      );


      // ── SERVICES OVERVIEW ─────────────────────────────────────────────────
      case 'services_overview': {
        const so = data.servicesOverview;
        const soUid = () => `svc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        const ACCENT_PRESETS = [
          '#10b981','#6366f1','#f59e0b','#06b6d4',
          '#ec4899','#8b5cf6','#f97316','#ef4444',
          '#3b82f6','#14b8a6','#a3e635','#fb923c',
        ];

        const updateSO = (patch: Partial<typeof so>) =>
          update('servicesOverview', { ...so, ...patch });

        const updateItem = (idx: number, patch: Partial<typeof so.items[0]>) => {
          const items = so.items.map((it, i) => i === idx ? { ...it, ...patch } : it);
          updateSO({ items });
        };

        const deleteItem = (idx: number) =>
          updateSO({ items: so.items.filter((_, i) => i !== idx) });

        const duplicateItem = (idx: number) => {
          const clone = { ...so.items[idx], id: soUid(), sortOrder: so.items.length + 1 };
          updateSO({ items: [...so.items, clone] });
        };

        const moveItem = (idx: number, dir: -1 | 1) => {
          const items = [...so.items];
          const swap = idx + dir;
          if (swap < 0 || swap >= items.length) return;
          [items[idx], items[swap]] = [items[swap], items[idx]];
          updateSO({ items: items.map((it, i) => ({ ...it, sortOrder: i + 1 })) });
        };

        const sorted = [...so.items].sort((a, b) => a.sortOrder - b.sortOrder);

        return (
          <div className="space-y-5">

            {/* ── Section header settings ── */}
            <Card title="تنظیمات سکشن خدمات" subtitle="عنوان، متن معرفی و نکته پایانی" badge="خدمات ما">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: so.enabled ? 'rgba(0,188,212,0.07)' : T.surface, border: `1px solid ${so.enabled ? T.accentBdr : T.border}` }}>
                  <span className="text-sm font-semibold" style={{ color: so.enabled ? T.accent : T.textMuted }}>
                    {so.enabled ? '✓ سکشن فعال و در حال نمایش است' : '✕ سکشن پنهان است'}
                  </span>
                  <FToggle label="" value={so.enabled} onChange={v => updateSO({ enabled: v })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FInput
                    label="برچسب بالای عنوان (Eyebrow)"
                    value={so.eyebrow}
                    onChange={v => updateSO({ eyebrow: v })}
                    placeholder="خدمات"
                  />
                  <FInput
                    label="عنوان سکشن"
                    value={so.heading}
                    onChange={v => updateSO({ heading: v })}
                    placeholder="خدمات کپیتال نتورک"
                  />
                </div>
                <FTextarea
                  label="متن معرفی (زیر عنوان)"
                  value={so.intro}
                  onChange={v => updateSO({ intro: v })}
                  rows={3}
                />
                <FTextarea
                  label="نکته پایانی (کادر آبی پایین سکشن)"
                  value={so.bottomNote}
                  onChange={v => updateSO({ bottomNote: v })}
                  rows={3}
                />
              </div>
            </Card>

            {/* ── Item count badge ── */}
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: T.textMuted }}>
                آیتم‌های خدمات
                <span className="mr-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}` }}>
                  {so.items.length} مورد
                </span>
              </p>
            </div>

            {/* ── Items list ── */}
            <div className="space-y-3">
              {sorted.map((item, displayIdx) => {
                const realIdx = so.items.findIndex(it => it.id === item.id);
                return (
                  <ItemRow
                    key={item.id}
                    title={item.title || 'خدمت بدون عنوان'}
                    subtitle={item.description.slice(0, 70) + (item.description.length > 70 ? '…' : '')}
                    accent={item.accent}
                    onDelete={() => deleteItem(realIdx)}
                    onDuplicate={() => duplicateItem(realIdx)}
                  >
                    {/* Move controls */}
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => moveItem(realIdx, -1)}
                        disabled={displayIdx === 0}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                        style={{ background: T.surface, color: T.textMuted, border: `1px solid ${T.border}` }}
                      >
                        <MoveUp size={11} /> بالاتر
                      </button>
                      <button
                        onClick={() => moveItem(realIdx, 1)}
                        disabled={displayIdx === sorted.length - 1}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                        style={{ background: T.surface, color: T.textMuted, border: `1px solid ${T.border}` }}
                      >
                        <MoveDown size={11} /> پایین‌تر
                      </button>
                      <span className="mr-auto text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${item.accent}18`, color: item.accent, border: `1px solid ${item.accent}30` }}>
                        #{displayIdx + 1}
                      </span>
                    </div>

                    <FInput
                      label="عنوان خدمت"
                      value={item.title}
                      onChange={v => updateItem(realIdx, { title: v })}
                      placeholder="مثلاً: آمادگی جذب سرمایه را ارزیابی می‌کنیم"
                    />
                    <FTextarea
                      label="توضیحات خدمت"
                      value={item.description}
                      onChange={v => updateItem(realIdx, { description: v })}
                      rows={4}
                    />

                    {/* Accent color picker */}
                    <div>
                      <label className={labelCls}>رنگ accent کارت</label>
                      <div className="flex items-center gap-3 mt-1">
                        <input
                          type="color"
                          value={item.accent}
                          onChange={e => updateItem(realIdx, { accent: e.target.value })}
                          className="h-9 w-9 rounded-lg cursor-pointer border-0 bg-transparent p-0.5"
                          style={{ outline: `2px solid ${item.accent}60` }}
                        />
                        <input
                          value={item.accent}
                          onChange={e => updateItem(realIdx, { accent: e.target.value })}
                          className={`${inp} flex-1 font-mono`}
                          placeholder="#10b981"
                        />
                      </div>
                      {/* Quick preset swatches */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ACCENT_PRESETS.map(color => (
                          <button
                            key={color}
                            onClick={() => updateItem(realIdx, { accent: color })}
                            className="h-6 w-6 rounded-full transition-transform hover:scale-110 active:scale-95"
                            style={{
                              background: color,
                              outline: item.accent === color ? '2px solid white' : '2px solid transparent',
                              outlineOffset: 2,
                            }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Mini live preview */}
                    <div className="rounded-xl p-4 mt-1"
                      style={{ background: `${item.accent}10`, border: `1px solid ${item.accent}28` }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: item.accent }}>پیش‌نمایش کارت</p>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black"
                          style={{ background: `${item.accent}20`, color: item.accent }}>
                          {String(displayIdx + 1).padStart(2, '0')}
                        </div>
                        <p className="text-sm font-bold text-white truncate">{item.title || '—'}</p>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </ItemRow>
                );
              })}
            </div>

            {/* ── Add new item ── */}
            <button
              onClick={() => updateSO({
                items: [...so.items, {
                  id: soUid(),
                  title: '',
                  description: '',
                  accent: ACCENT_PRESETS[so.items.length % ACCENT_PRESETS.length],
                  sortOrder: so.items.length + 1,
                }],
              })}
              className="w-full py-3 border-2 border-dashed text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              style={{ borderColor: 'rgba(0,188,212,0.35)', color: T.textMuted }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = T.accent;
                (e.currentTarget as HTMLElement).style.color = T.accent;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,188,212,0.35)';
                (e.currentTarget as HTMLElement).style.color = T.textMuted;
              }}
            >
              <Plus size={15} /> افزودن خدمت جدید
            </button>

            {/* ── Tip ── */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-xs font-bold text-amber-400 mb-1">💡 راهنما</p>
              <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>
                کارت‌ها بر اساس ترتیب (sortOrder) در صفحه نمایش داده می‌شوند. با دکمه‌های «بالاتر/پایین‌تر» ترتیب را تغییر دهید. رنگ accent در شماره کارت، خط hover بالایی و نوار تزئینی پایین استفاده می‌شود. فراموش نکنید پس از ویرایش «ذخیره» کنید.
              </p>
            </div>

          </div>
        );
      }


      // ── PRICING ───────────────────────────────────────────────────────────
      case 'pricing': return (
        <div className="space-y-4">
          {data.pricingPlans.map((plan, i) => (
            <ItemRow key={plan.id} title={plan.name} subtitle={`${plan.price.toLocaleString()} ${plan.currency} / ${plan.interval}`} accent="#22c55e"
              onDelete={() => update('pricingPlans', data.pricingPlans.filter((_, j) => j !== i))}
              onDuplicate={() => update('pricingPlans', [...data.pricingPlans, { ...plan, id: uid() }])}>
              <div className="grid grid-cols-3 gap-3">
                <FInput label="نام پلن" value={plan.name} onChange={v => { const a = [...data.pricingPlans]; a[i] = { ...a[i], name: v }; update('pricingPlans', a); }} />
                <FInput label="قیمت (عدد)" value={String(plan.price)} onChange={v => { const a = [...data.pricingPlans]; a[i] = { ...a[i], price: Number(v) || 0 }; update('pricingPlans', a); }} type="number" />
                <FInput label="واحد پول" value={plan.currency} onChange={v => { const a = [...data.pricingPlans]; a[i] = { ...a[i], currency: v }; update('pricingPlans', a); }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>بازه پرداخت</label>
                  <select value={plan.interval} onChange={e => { const a = [...data.pricingPlans]; a[i] = { ...a[i], interval: e.target.value as any }; update('pricingPlans', a); }} className={inp} style={{ colorScheme: 'dark' }}>
                    <option value="monthly">ماهانه</option>
                    <option value="yearly">سالانه</option>
                    <option value="one_time">یکبار</option>
                  </select>
                </div>
                <FInput label="متن دکمه CTA" value={plan.ctaLabel} onChange={v => { const a = [...data.pricingPlans]; a[i] = { ...a[i], ctaLabel: v }; update('pricingPlans', a); }} />
              </div>
              <FTextarea label="توضیحات" value={plan.description} onChange={v => { const a = [...data.pricingPlans]; a[i] = { ...a[i], description: v }; update('pricingPlans', a); }} rows={2} />
              <FToggle label="پلن ویژه (highlight)" value={plan.featured} onChange={v => { const a = [...data.pricingPlans]; a[i] = { ...a[i], featured: v }; update('pricingPlans', a); }} />
              {/* Pricing features */}
              <div>
                <label className={labelCls}>ویژگی‌های پلن</label>
                <div className="space-y-2 mt-1">
                  {plan.features.map((pf, fi) => (
                    <div key={pf.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <FToggle label="" value={pf.included} onChange={v => { const a = [...data.pricingPlans]; a[i].features[fi] = { ...pf, included: v }; update('pricingPlans', a); }} />
                      <input value={pf.title} onChange={e => { const a = [...data.pricingPlans]; a[i].features[fi] = { ...pf, title: e.target.value }; update('pricingPlans', a); }} className={`${inp} flex-1`} placeholder="ویژگی..." />
                      <button onClick={() => { const a = [...data.pricingPlans]; a[i].features = a[i].features.filter((_, k) => k !== fi); update('pricingPlans', a); }} className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  <button onClick={() => { const a = [...data.pricingPlans]; a[i].features.push({ id: uid(), title: '', included: true }); update('pricingPlans', a); }}
                    className="w-full py-1.5 border border-dashed border-white/15 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/40 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1">
                    <Plus size={11} /> ویژگی
                  </button>
                </div>
              </div>
            </ItemRow>
          ))}
          <button onClick={() => update('pricingPlans', [...data.pricingPlans, { id: uid(), name: 'پلن جدید', type: 'basic' as any, price: 0, currency: 'تومان', interval: 'monthly', description: '', features: [], limitations: [], featured: false, sortOrder: data.pricingPlans.length + 1, ctaLabel: 'شروع' }])}
            className="w-full py-3 border-2 border-dashed border-white/15 text-slate-500 hover:border-green-400 hover:text-green-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
            <Plus size={15} /> افزودن پلن قیمتی
          </button>
        </div>
      );

      // ── TESTIMONIALS ──────────────────────────────────────────────────────
      case 'testimonials': return (
        <div className="space-y-4">
          {data.testimonials.map((t, i) => (
            <ItemRow key={t.id} title={t.name} subtitle={`${t.role} · ${t.company}`} accent="#a855f7"
              onDelete={() => update('testimonials', data.testimonials.filter((_, j) => j !== i))}
              onDuplicate={() => update('testimonials', [...data.testimonials, { ...t, id: uid() }])}>
              <div className="grid grid-cols-3 gap-3">
                <FInput label="نام" value={t.name} onChange={v => { const a = [...data.testimonials]; a[i] = { ...a[i], name: v }; update('testimonials', a); }} />
                <FInput label="نقش" value={t.role} onChange={v => { const a = [...data.testimonials]; a[i] = { ...a[i], role: v }; update('testimonials', a); }} />
                <FInput label="شرکت" value={t.company} onChange={v => { const a = [...data.testimonials]; a[i] = { ...a[i], company: v }; update('testimonials', a); }} />
              </div>
              <FTextarea label="نظر" value={t.quote} onChange={v => { const a = [...data.testimonials]; a[i] = { ...a[i], quote: v }; update('testimonials', a); }} rows={3} />
              <div className="flex items-center gap-6">
                <div>
                  <label className={labelCls}>امتیاز (۱-۵)</label>
                  <input type="number" min={1} max={5} value={t.rating} onChange={e => { const a = [...data.testimonials]; a[i] = { ...a[i], rating: Number(e.target.value) as any }; update('testimonials', a); }} className={`${inp} w-20`} />
                </div>
                <FToggle label="نمایش ویژه" value={t.featured ?? false} onChange={v => { const a = [...data.testimonials]; a[i] = { ...a[i], featured: v }; update('testimonials', a); }} />
              </div>
              <FImageUpload label="آواتار" value={t.avatar?.url || ''} onChange={v => { const a = [...data.testimonials]; a[i] = { ...a[i], avatar: { id: uid(), type: 'image' as any, url: v, alt: t.name } }; update('testimonials', a); }} />
            </ItemRow>
          ))}
          <button onClick={() => update('testimonials', [...data.testimonials, { id: uid(), name: '', role: '', company: '', quote: '', rating: 5, featured: false, sortOrder: data.testimonials.length + 1 }])}
            className="w-full py-3 border-2 border-dashed border-white/15 text-slate-500 hover:border-purple-400 hover:text-purple-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
            <Plus size={15} /> افزودن نظر
          </button>
        </div>
      );

      // ── FAQ ───────────────────────────────────────────────────────────────
      case 'faq': return (
        <div className="space-y-4">
          {data.faqs.map((faq, i) => (
            <ItemRow key={faq.id} title={faq.question} accent="#ca8a04"
              onDelete={() => update('faqs', data.faqs.filter((_, j) => j !== i))}
              onDuplicate={() => update('faqs', [...data.faqs, { ...faq, id: uid() }])}>
              <FInput label="سوال" value={faq.question} onChange={v => { const a = [...data.faqs]; a[i] = { ...a[i], question: v }; update('faqs', a); }} />
              <FTextarea label="جواب" value={faq.answer} onChange={v => { const a = [...data.faqs]; a[i] = { ...a[i], answer: v }; update('faqs', a); }} rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <FInput label="دسته‌بندی" value={faq.category || ''} onChange={v => { const a = [...data.faqs]; a[i] = { ...a[i], category: v }; update('faqs', a); }} />
                <FToggle label="نمایش ویژه" value={faq.featured} onChange={v => { const a = [...data.faqs]; a[i] = { ...a[i], featured: v }; update('faqs', a); }} />
              </div>
            </ItemRow>
          ))}
          <button onClick={() => update('faqs', [...data.faqs, { id: uid(), question: 'سوال جدید', answer: '', category: 'general', featured: false, sortOrder: data.faqs.length + 1 }])}
            className="w-full py-3 border-2 border-dashed border-white/15 text-slate-500 hover:border-yellow-400 hover:text-yellow-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
            <Plus size={15} /> افزودن سوال
          </button>
        </div>
      );

      // ── CTA ───────────────────────────────────────────────────────────────
      case 'cta': return (
        <Card title="بخش CTA / فراخوان عمل">
          <div className="grid gap-4">
            <FInput label="عنوان" value={data.cta.title} onChange={v => update('cta', { ...data.cta, title: v })} />
            <FTextarea label="توضیحات" value={data.cta.description} onChange={v => update('cta', { ...data.cta, description: v })} rows={2} />
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(0,188,212,0.06)', border: '1px solid rgba(0,188,212,0.18)' }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#00BCD4' }}>دکمه اصلی</p>
                <FInput label="متن دکمه" value={data.cta.primaryButton.label} onChange={v => update('cta', { ...data.cta, primaryButton: { ...data.cta.primaryButton, label: v } })} />
                <FInput label="لینک" value={data.cta.primaryButton.link} onChange={v => update('cta', { ...data.cta, primaryButton: { ...data.cta.primaryButton, link: v } })} />
              </div>
              <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">دکمه ثانویه</p>
                <FInput label="متن دکمه" value={data.cta.secondaryButton?.label || ''} onChange={v => update('cta', { ...data.cta, secondaryButton: { label: v, link: data.cta.secondaryButton?.link || '' } })} />
                <FInput label="لینک" value={data.cta.secondaryButton?.link || ''} onChange={v => update('cta', { ...data.cta, secondaryButton: { label: data.cta.secondaryButton?.label || '', link: v } })} />
              </div>
            </div>
            <FToggle label="فعال‌سازی بخش CTA" value={data.cta.enabled} onChange={v => update('cta', { ...data.cta, enabled: v })} />
          </div>
        </Card>
      );

      // ── NEWSLETTER ────────────────────────────────────────────────────────
      case 'newsletter': return (
        <Card title="خبرنامه">
          <div className="grid gap-4">
            <FInput label="عنوان" value={data.newsletter.title} onChange={v => update('newsletter', { ...data.newsletter, title: v })} />
            <FTextarea label="توضیحات" value={data.newsletter.description} onChange={v => update('newsletter', { ...data.newsletter, description: v })} rows={2} />
            <div className="grid grid-cols-2 gap-4">
              <FInput label="Placeholder ایمیل" value={data.newsletter.placeholder} onChange={v => update('newsletter', { ...data.newsletter, placeholder: v })} />
              <FInput label="متن دکمه" value={data.newsletter.buttonLabel} onChange={v => update('newsletter', { ...data.newsletter, buttonLabel: v })} />
            </div>
            <FToggle label="فعال‌سازی خبرنامه" value={data.newsletter.enabled} onChange={v => update('newsletter', { ...data.newsletter, enabled: v })} />
          </div>
        </Card>
      );

      // ── SEO ───────────────────────────────────────────────────────────────
      case 'seo': return (
        <Card title="تنظیمات SEO" subtitle="متا تگ‌ها، Open Graph و نمایه‌سازی" badge="SEO">
          <div className="grid gap-4">
            <FInput label="Meta Title" value={data.hero.title} onChange={v => update('hero', { ...data.hero, title: v })} />
            <FTextarea label="Meta Description" value={data.hero.description} onChange={v => update('hero', { ...data.hero, description: v })} rows={3} />
            <TagsEditor label="Keywords" items={data.hero.trustBadges} onChange={v => update('hero', { ...data.hero, trustBadges: v })} />
            <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-xs font-bold text-amber-400 mb-1 uppercase tracking-wide">⚠ توجه</p>
              <p className="text-xs text-amber-500/80">تنظیمات کامل‌تر SEO (OG، Twitter Card، canonical) از فایل‌های پیکربندی جداگانه مدیریت می‌شوند.</p>
            </div>
          </div>
        </Card>
      );

      // ── VISIBILITY ────────────────────────────────────────────────────────
      case 'visibility': {
        const secs = data.settings.sections;
        const LABELS: Record<string, string> = {
          pricing: 'قیمت‌گذاری', testimonials: 'نظرات مشتریان',
          faq: 'سوالات متداول', cta: 'CTA', contact: 'فرم تماس', newsletter: 'خبرنامه',
        };
        return (
          <Card title="نمایش / پنهان‌سازی سکشن‌ها" subtitle="کنترل کنید کدام بخش‌ها در صفحه نمایش داده شوند" badge="Visibility">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(secs).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl transition-all"
                  style={{
                    background: val ? 'rgba(0,188,212,0.07)' : T.surface,
                    border: `1px solid ${val ? T.accentBdr : T.border}`,
                  }}>
                  <span className="text-sm font-medium" style={{ color: val ? T.accent : T.textMuted }}>{LABELS[key] || key}</span>
                  <FToggle label="" value={val} onChange={v => update('settings', { ...data.settings, sections: { ...secs, [key]: v } })} />
                </div>
              ))}
            </div>
          </Card>
        );
      }

      // ══════════════════════════════════════════════════════════════════════
      // ✦ CUSTOM SECTIONS BUILDER
      // ══════════════════════════════════════════════════════════════════════
      case 'custom_sections': {
        const sections: CustomSection[] = data.customSections ?? [];

        // ── uid helper (local) ────────────────────────────────────────────
        const csUid = () => `cs-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;

        // ── update a specific custom section ──────────────────────────────
        const updateSection = (idx: number, patch: Partial<CustomSection>) => {
          const next = sections.map((s, i) => i === idx ? { ...s, ...patch } : s);
          update('customSections', next);
        };

        // ── update a specific block inside a section ───────────────────────
        const updateBlock = (sIdx: number, bIdx: number, patch: Partial<CustomBlock>) => {
          const next = sections.map((s, i) => {
            if (i !== sIdx) return s;
            const blocks = s.blocks.map((b, j) => j === bIdx ? { ...b, ...patch } : b);
            return { ...s, blocks };
          });
          update('customSections', next);
        };

        // ── move section up/down ───────────────────────────────────────────
        const moveSection = (idx: number, dir: -1 | 1) => {
          const next = [...sections];
          const swap = idx + dir;
          if (swap < 0 || swap >= next.length) return;
          [next[idx], next[swap]] = [next[swap], next[idx]];
          update('customSections', next);
        };

        // ── move block up/down within a section ───────────────────────────
        const moveBlock = (sIdx: number, bIdx: number, dir: -1 | 1) => {
          const swap = bIdx + dir;
          const s = sections[sIdx];
          if (swap < 0 || swap >= s.blocks.length) return;
          const blocks = [...s.blocks];
          [blocks[bIdx], blocks[swap]] = [blocks[swap], blocks[bIdx]];
          updateSection(sIdx, { blocks });
        };

        // ── delete a block ────────────────────────────────────────────────
        const deleteBlock = (sIdx: number, bIdx: number) => {
          const blocks = sections[sIdx].blocks.filter((_, j) => j !== bIdx);
          updateSection(sIdx, { blocks });
        };

        // ── add a block of given type ─────────────────────────────────────
        const addBlock = (sIdx: number, type: CustomBlockType) => {
          const base: CustomBlock = { id: csUid(), type, paddingY: 'sm' };
          const defaults: Partial<CustomBlock> = {
            heading:   { content: 'عنوان جدید', level: 'h2', align: 'right' },
            text:      { content: 'متن خود را اینجا وارد کنید...', align: 'right' },
            image:     { imageUrl: '', imageAlt: '', imageCaption: '' },
            icon:      { icon: '⭐', iconSize: 'md', iconColor: '#00BCD4' },
            sticker:   { sticker: '🎯', stickerSize: 'lg' },
            badge:     { content: 'برچسب', badgeColor: '#00BCD4', align: 'right' },
            button:    { content: 'کلیک کنید', buttonUrl: '#', buttonVariant: 'primary', align: 'right' },
            divider:   { dividerStyle: 'line' },
            spacer:    { spacerSize: 'md' },
            two_col:   { colLeft: 'ستون چپ...', colRight: 'ستون راست...' },
            card:      { content: 'متن کارت', cardAccent: '#00BCD4', cardSubtitle: 'زیرعنوان' },
            highlight: { content: 'این متن هایلایت می‌شود.', bgColor: '#f59e0b' },
          }[type] ?? {};
          const blocks = [...sections[sIdx].blocks, { ...base, ...defaults }];
          updateSection(sIdx, { blocks });
        };

        // ── Page position slots ───────────────────────────────────────────
        const POSITION_SLOTS = [
          { value: 5,  label: 'قبل از قیمت‌گذاری' },
          { value: 15, label: 'بعد از قیمت‌گذاری' },
          { value: 25, label: 'بعد از نظرات' },
          { value: 35, label: 'بعد از سوالات متداول' },
          { value: 45, label: 'بعد از فرم تماس' },
          { value: 55, label: 'بعد از خبرنامه (انتها)' },
        ];

        // ── Block type palette ────────────────────────────────────────────
        const BLOCK_TYPES: { type: CustomBlockType; label: string; emoji: string }[] = [
          { type: 'heading',   label: 'عنوان',      emoji: '𝗛' },
          { type: 'text',      label: 'متن',        emoji: '¶' },
          { type: 'image',     label: 'عکس',        emoji: '🖼' },
          { type: 'icon',      label: 'آیکون',      emoji: '★' },
          { type: 'sticker',   label: 'استیکر',     emoji: '🎯' },
          { type: 'badge',     label: 'برچسب',      emoji: '🏷' },
          { type: 'button',    label: 'دکمه',       emoji: '⬛' },
          { type: 'divider',   label: 'خط جدا',     emoji: '—' },
          { type: 'spacer',    label: 'فاصله',      emoji: '⬚' },
          { type: 'two_col',   label: 'دو ستون',    emoji: '⊞' },
          { type: 'card',      label: 'کارت',       emoji: '🃏' },
          { type: 'highlight', label: 'هایلایت',    emoji: '✏' },
        ];

        // ── Block editor for a single block ───────────────────────────────
        const BlockEditor = ({ block, sIdx, bIdx }: { block: CustomBlock; sIdx: number; bIdx: number }) => {
          const [open, setOpen] = useState(false);
          const typeEmoji = BLOCK_TYPES.find(b => b.type === block.type)?.emoji ?? '●';
          const typeLabel = BLOCK_TYPES.find(b => b.type === block.type)?.label ?? block.type;
          return (
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
              {/* Block row header */}
              <div className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors"
                style={{ background: open ? 'rgba(0,188,212,0.06)' : T.surface }}
                onClick={() => setOpen(o => !o)}>
                <GripVertical size={12} style={{ color: T.textSub }} />
                <span className="text-base select-none w-6 text-center">{typeEmoji}</span>
                <span className="text-xs font-bold flex-1 truncate" style={{ color: T.accent }}>{typeLabel}</span>
                {block.content && (
                  <span className="text-xs truncate max-w-[120px]" style={{ color: T.textMuted }}>
                    {block.content.slice(0, 40)}
                  </span>
                )}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={e => { e.stopPropagation(); moveBlock(sIdx, bIdx, -1); }}
                    className="p-1 rounded hover:bg-white/10 transition-colors" style={{ color: T.textMuted }}>
                    <MoveUp size={11} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); moveBlock(sIdx, bIdx, 1); }}
                    className="p-1 rounded hover:bg-white/10 transition-colors" style={{ color: T.textMuted }}>
                    <MoveDown size={11} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteBlock(sIdx, bIdx); }}
                    className="p-1 rounded hover:bg-red-900/40 transition-colors" style={{ color: T.textMuted }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}>
                    <Trash2 size={11} />
                  </button>
                  {open ? <ChevronUp size={12} style={{ color: T.textMuted }} /> : <ChevronDown size={12} style={{ color: T.textMuted }} />}
                </div>
              </div>

              {/* Block fields */}
              {open && (
                <div className="p-3 grid gap-3" style={{ background: 'rgba(0,0,0,0.2)', borderTop: `1px solid ${T.borderSub}` }}>

                  {/* ── heading ── */}
                  {block.type === 'heading' && <>
                    <FInput label="متن عنوان" value={block.content ?? ''} onChange={v => updateBlock(sIdx, bIdx, { content: v })} />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>سطح عنوان</label>
                        <select value={block.level ?? 'h2'} onChange={e => updateBlock(sIdx, bIdx, { level: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                          <option value="h2">H2 — بزرگ</option>
                          <option value="h3">H3 — متوسط</option>
                          <option value="h4">H4 — کوچک</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>تراز متن</label>
                        <select value={block.align ?? 'right'} onChange={e => updateBlock(sIdx, bIdx, { align: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                          <option value="right">راست</option>
                          <option value="center">وسط</option>
                          <option value="left">چپ</option>
                        </select>
                      </div>
                    </div>
                    <FInput label="رنگ متن (hex)" value={block.textColor ?? ''} onChange={v => updateBlock(sIdx, bIdx, { textColor: v })} placeholder="#ffffff" />
                  </>}

                  {/* ── text ── */}
                  {block.type === 'text' && <>
                    <FTextarea label="متن" value={block.content ?? ''} onChange={v => updateBlock(sIdx, bIdx, { content: v })} rows={4} />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>تراز متن</label>
                        <select value={block.align ?? 'right'} onChange={e => updateBlock(sIdx, bIdx, { align: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                          <option value="right">راست</option>
                          <option value="center">وسط</option>
                          <option value="left">چپ</option>
                        </select>
                      </div>
                      <FInput label="رنگ متن (hex)" value={block.textColor ?? ''} onChange={v => updateBlock(sIdx, bIdx, { textColor: v })} placeholder="#cbd5e1" />
                    </div>
                  </>}

                  {/* ── image ── */}
                  {block.type === 'image' && <>
                    <FImageUpload label="آدرس عکس" value={block.imageUrl ?? ''} onChange={v => updateBlock(sIdx, bIdx, { imageUrl: v })} />
                    <div className="grid grid-cols-2 gap-3">
                      <FInput label="Alt text" value={block.imageAlt ?? ''} onChange={v => updateBlock(sIdx, bIdx, { imageAlt: v })} placeholder="توضیح عکس" />
                      <FInput label="کپشن (زیرعکس)" value={block.imageCaption ?? ''} onChange={v => updateBlock(sIdx, bIdx, { imageCaption: v })} />
                    </div>
                  </>}

                  {/* ── icon ── */}
                  {block.type === 'icon' && <>
                    <div className="grid grid-cols-3 gap-3">
                      <FInput label="آیکون (Emoji)" value={block.icon ?? '⭐'} onChange={v => updateBlock(sIdx, bIdx, { icon: v })} placeholder="⭐ 🚀 💡 ..." />
                      <div>
                        <label className={labelCls}>اندازه</label>
                        <select value={block.iconSize ?? 'md'} onChange={e => updateBlock(sIdx, bIdx, { iconSize: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                          <option value="sm">کوچک</option>
                          <option value="md">متوسط</option>
                          <option value="lg">بزرگ</option>
                          <option value="xl">خیلی بزرگ</option>
                        </select>
                      </div>
                      <FInput label="رنگ آیکون (hex)" value={block.iconColor ?? ''} onChange={v => updateBlock(sIdx, bIdx, { iconColor: v })} placeholder="#00BCD4" />
                    </div>
                    {/* Preview */}
                    <div className="flex items-center justify-center py-3 rounded-xl" style={{ background: T.surface }}>
                      <span style={{ fontSize: block.iconSize === 'xl' ? 80 : block.iconSize === 'lg' ? 56 : block.iconSize === 'sm' ? 24 : 40, color: block.iconColor ?? '#00BCD4' }}>
                        {block.icon ?? '⭐'}
                      </span>
                    </div>
                  </>}

                  {/* ── sticker ── */}
                  {block.type === 'sticker' && <>
                    <div className="grid grid-cols-2 gap-3">
                      <FInput label="استیکر (Emoji)" value={block.sticker ?? '🎯'} onChange={v => updateBlock(sIdx, bIdx, { sticker: v })} placeholder="🎯 🏆 💎 🚀 ..." />
                      <div>
                        <label className={labelCls}>اندازه</label>
                        <select value={block.stickerSize ?? 'lg'} onChange={e => updateBlock(sIdx, bIdx, { stickerSize: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                          <option value="md">متوسط</option>
                          <option value="lg">بزرگ</option>
                          <option value="xl">خیلی بزرگ</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-center py-4 rounded-xl" style={{ background: T.surface }}>
                      <span style={{ fontSize: block.stickerSize === 'xl' ? 96 : block.stickerSize === 'md' ? 48 : 72 }}>
                        {block.sticker ?? '🎯'}
                      </span>
                    </div>
                  </>}

                  {/* ── badge ── */}
                  {block.type === 'badge' && <>
                    <div className="grid grid-cols-2 gap-3">
                      <FInput label="متن برچسب" value={block.content ?? ''} onChange={v => updateBlock(sIdx, bIdx, { content: v })} placeholder="برچسب" />
                      <FInput label="رنگ (hex)" value={block.badgeColor ?? '#00BCD4'} onChange={v => updateBlock(sIdx, bIdx, { badgeColor: v })} placeholder="#00BCD4" />
                    </div>
                    <div>
                      <label className={labelCls}>تراز</label>
                      <select value={block.align ?? 'right'} onChange={e => updateBlock(sIdx, bIdx, { align: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                        <option value="right">راست</option>
                        <option value="center">وسط</option>
                        <option value="left">چپ</option>
                      </select>
                    </div>
                  </>}

                  {/* ── button ── */}
                  {block.type === 'button' && <>
                    <div className="grid grid-cols-2 gap-3">
                      <FInput label="متن دکمه" value={block.content ?? ''} onChange={v => updateBlock(sIdx, bIdx, { content: v })} />
                      <FInput label="لینک (URL)" value={block.buttonUrl ?? '#'} onChange={v => updateBlock(sIdx, bIdx, { buttonUrl: v })} placeholder="https://..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>استایل دکمه</label>
                        <select value={block.buttonVariant ?? 'primary'} onChange={e => updateBlock(sIdx, bIdx, { buttonVariant: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                          <option value="primary">پُر (primary)</option>
                          <option value="outline">خطی (outline)</option>
                          <option value="ghost">شفاف (ghost)</option>
                        </select>
                      </div>
                      <FInput label="رنگ (hex)" value={block.bgColor ?? '#00BCD4'} onChange={v => updateBlock(sIdx, bIdx, { bgColor: v })} placeholder="#00BCD4" />
                    </div>
                    <div>
                      <label className={labelCls}>تراز</label>
                      <select value={block.align ?? 'right'} onChange={e => updateBlock(sIdx, bIdx, { align: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                        <option value="right">راست</option>
                        <option value="center">وسط</option>
                        <option value="left">چپ</option>
                      </select>
                    </div>
                  </>}

                  {/* ── divider ── */}
                  {block.type === 'divider' && <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>نوع خط</label>
                        <select value={block.dividerStyle ?? 'line'} onChange={e => updateBlock(sIdx, bIdx, { dividerStyle: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                          <option value="line">خط ساده</option>
                          <option value="dots">نقطه‌ها</option>
                          <option value="wave">موجی</option>
                        </select>
                      </div>
                      <FInput label="رنگ (hex)" value={block.bgColor ?? ''} onChange={v => updateBlock(sIdx, bIdx, { bgColor: v })} placeholder="rgba(255,255,255,0.08)" />
                    </div>
                  </>}

                  {/* ── spacer ── */}
                  {block.type === 'spacer' && (
                    <div>
                      <label className={labelCls}>اندازه فاصله</label>
                      <select value={block.spacerSize ?? 'md'} onChange={e => updateBlock(sIdx, bIdx, { spacerSize: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                        <option value="xs">خیلی کم (8px)</option>
                        <option value="sm">کم (16px)</option>
                        <option value="md">متوسط (32px)</option>
                        <option value="lg">زیاد (56px)</option>
                      </select>
                    </div>
                  )}

                  {/* ── two_col ── */}
                  {block.type === 'two_col' && <>
                    <FTextarea label="ستون چپ (متن)" value={block.colLeft ?? ''} onChange={v => updateBlock(sIdx, bIdx, { colLeft: v })} rows={4} />
                    <FTextarea label="ستون راست (متن)" value={block.colRight ?? ''} onChange={v => updateBlock(sIdx, bIdx, { colRight: v })} rows={4} />
                  </>}

                  {/* ── card ── */}
                  {block.type === 'card' && <>
                    <div className="grid grid-cols-2 gap-3">
                      <FInput label="زیرعنوان کارت" value={block.cardSubtitle ?? ''} onChange={v => updateBlock(sIdx, bIdx, { cardSubtitle: v })} />
                      <FInput label="رنگ accent (hex)" value={block.cardAccent ?? '#00BCD4'} onChange={v => updateBlock(sIdx, bIdx, { cardAccent: v })} placeholder="#00BCD4" />
                    </div>
                    <FTextarea label="متن کارت" value={block.content ?? ''} onChange={v => updateBlock(sIdx, bIdx, { content: v })} rows={3} />
                  </>}

                  {/* ── highlight ── */}
                  {block.type === 'highlight' && <>
                    <FTextarea label="متن هایلایت" value={block.content ?? ''} onChange={v => updateBlock(sIdx, bIdx, { content: v })} rows={3} />
                    <FInput label="رنگ خط کنار (hex)" value={block.bgColor ?? '#f59e0b'} onChange={v => updateBlock(sIdx, bIdx, { bgColor: v })} placeholder="#f59e0b" />
                  </>}

                  {/* ── shared: padding Y ── */}
                  <div>
                    <label className={labelCls}>فاصله بالا/پایین بلوک</label>
                    <select value={block.paddingY ?? 'sm'} onChange={e => updateBlock(sIdx, bIdx, { paddingY: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                      <option value="none">بدون فاصله</option>
                      <option value="sm">کم</option>
                      <option value="md">متوسط</option>
                      <option value="lg">زیاد</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        };

        // ── Section editor ─────────────────────────────────────────────────
        const SectionEditor = ({ sec, sIdx }: { sec: CustomSection; sIdx: number }) => {
          const [secOpen, setSecOpen] = useState(sIdx === 0);
          const [addingBlock, setAddingBlock] = useState(false);
          return (
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${sec.enabled ? T.accentBdr : T.border}` }}>
              {/* Section header row */}
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                style={{ background: sec.enabled ? 'rgba(0,188,212,0.07)' : T.surface }}
                onClick={() => setSecOpen(o => !o)}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sec.enabled ? '#22c55e' : '#ef4444' }} />
                <span className="flex-1 text-sm font-black text-slate-200 truncate">
                  {sec.title || 'سکشن بدون نام'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: T.surface, color: T.textMuted }}>
                  {sec.blocks.length} بلوک
                </span>
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => moveSection(sIdx, -1)} className="p-1.5 rounded-lg transition-colors hover:bg-white/10" style={{ color: T.textMuted }} title="بالاتر"><MoveUp size={13} /></button>
                  <button onClick={() => moveSection(sIdx, 1)} className="p-1.5 rounded-lg transition-colors hover:bg-white/10" style={{ color: T.textMuted }} title="پایین‌تر"><MoveDown size={13} /></button>
                  <button onClick={() => updateSection(sIdx, { enabled: !sec.enabled })}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: sec.enabled ? '#22c55e' : T.textMuted }}
                    title={sec.enabled ? 'پنهان کردن' : 'نمایش دادن'}>
                    <Eye size={13} />
                  </button>
                  <button onClick={() => {
                    const clone: CustomSection = { ...JSON.parse(JSON.stringify(sec)), id: csUid(), title: sec.title + ' (کپی)' };
                    update('customSections', [...sections, clone]);
                  }} className="p-1.5 rounded-lg transition-colors hover:bg-white/10" style={{ color: T.textMuted }} title="کپی"><Copy size={13} /></button>
                  <button onClick={() => {
                    if (window.confirm('این سکشن حذف شود؟')) update('customSections', sections.filter((_, i) => i !== sIdx));
                  }} className="p-1.5 rounded-lg transition-colors" style={{ color: T.textMuted }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}>
                    <Trash2 size={13} />
                  </button>
                  {secOpen ? <ChevronUp size={14} style={{ color: T.textMuted }} /> : <ChevronDown size={14} style={{ color: T.textMuted }} />}
                </div>
              </div>

              {/* Section body */}
              {secOpen && (
                <div className="p-4 grid gap-4" style={{ borderTop: `1px solid ${T.borderSub}`, background: 'rgba(0,0,0,0.18)' }}>

                  {/* Section meta */}
                  <div className="grid grid-cols-2 gap-3">
                    <FInput label="نام سکشن (داخلی)" value={sec.title} onChange={v => updateSection(sIdx, { title: v })} />
                    <div>
                      <label className={labelCls}>موقعیت در صفحه</label>
                      <select value={sec.position} onChange={e => updateSection(sIdx, { position: Number(e.target.value) })} className={inp} style={{ colorScheme: 'dark' }}>
                        {POSITION_SLOTS.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FInput label="Eyebrow (برچسب بالایی)" value={sec.eyebrow ?? ''} onChange={v => updateSection(sIdx, { eyebrow: v })} placeholder="مثلاً: درباره ما" />
                    <FInput label="عنوان سکشن" value={sec.heading ?? ''} onChange={v => updateSection(sIdx, { heading: v })} placeholder="عنوان اصلی سکشن" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>تراز عنوان</label>
                      <select value={sec.headingAlign ?? 'right'} onChange={e => updateSection(sIdx, { headingAlign: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                        <option value="right">راست</option>
                        <option value="center">وسط</option>
                        <option value="left">چپ</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>پس‌زمینه</label>
                      <select value={sec.bgVariant ?? 'dark'} onChange={e => updateSection(sIdx, { bgVariant: e.target.value as any })} className={inp} style={{ colorScheme: 'dark' }}>
                        <option value="dark">تیره (#0d1829)</option>
                        <option value="darker">خیلی تیره (#070e1a)</option>
                        <option value="transparent">شفاف</option>
                      </select>
                    </div>
                    <FInput label="رنگ accent (hex)" value={sec.accentColor ?? '#00BCD4'} onChange={v => updateSection(sIdx, { accentColor: v })} placeholder="#00BCD4" />
                  </div>

                  {/* Divider */}
                  <div className="h-px" style={{ background: T.borderSub }} />

                  {/* Blocks list */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: T.textMuted }}>بلوک‌های محتوا</p>
                    {sec.blocks.length === 0 && (
                      <div className="py-6 text-center text-sm" style={{ color: T.textMuted, border: `1px dashed ${T.border}`, borderRadius: 12 }}>
                        هنوز بلوکی اضافه نشده. از پالت زیر انتخاب کنید ↓
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {sec.blocks.map((block, bIdx) => (
                        <BlockEditor key={block.id} block={block} sIdx={sIdx} bIdx={bIdx} />
                      ))}
                    </div>
                  </div>

                  {/* Add block palette */}
                  <div className="rounded-xl p-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-black uppercase tracking-widest" style={{ color: T.accent }}>+ افزودن بلوک</p>
                      <button onClick={() => setAddingBlock(o => !o)}
                        className="text-xs px-3 py-1 rounded-lg transition-all font-semibold"
                        style={{ background: addingBlock ? T.accentBg : T.surface, color: addingBlock ? T.accent : T.textMuted, border: `1px solid ${addingBlock ? T.accentBdr : T.border}` }}>
                        {addingBlock ? 'بستن' : 'نمایش پالت'}
                      </button>
                    </div>
                    {addingBlock && (
                      <div className="grid grid-cols-4 gap-2">
                        {BLOCK_TYPES.map(({ type, label, emoji }) => (
                          <button key={type} onClick={() => { addBlock(sIdx, type); setAddingBlock(false); }}
                            className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5"
                            style={{ background: 'rgba(0,188,212,0.06)', border: `1px solid ${T.accentBdr}`, color: T.accent }}>
                            <span className="text-xl leading-none">{emoji}</span>
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        };

        // ── Current page layout diagram ────────────────────────────────────
        const PAGE_LAYOUT = [
          { pos: -1, label: 'Hero', type: 'fixed', color: '#8b5cf6' },
          ...POSITION_SLOTS.flatMap(slot => {
            const inSlot = sections.filter(s => s.position === slot.value);
            return [
              { pos: slot.value, label: slot.label.replace('قبل از ', '↓ ').replace('بعد از ', '↓ '), type: 'slot', color: '#1e3a4a' },
              ...inSlot.map(s => ({ pos: slot.value, label: s.title, type: 'custom', color: s.enabled ? '#00BCD4' : '#475569' })),
            ];
          }),
          { pos: 100, label: 'انتهای صفحه', type: 'fixed', color: '#334155' },
        ];

        return (
          <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Layout size={20} style={{ color: T.accent }} />
                  سکشن‌ساز حرفه‌ای
                </h2>
                <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                  سکشن‌های سفارشی با بلوک‌های متن، عکس، آیکون، استیکر، دکمه و... بسازید و در هر موقعیتی از صفحه قرار دهید.
                </p>
              </div>
              <button
                onClick={() => update('customSections', [...sections, {
                  id: csUid(), title: 'سکشن جدید', eyebrow: '', heading: '', headingAlign: 'right',
                  accentColor: '#00BCD4', bgVariant: 'dark', enabled: true, position: 55, blocks: [],
                }])}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)' }}
              >
                <Plus size={15} /> سکشن جدید
              </button>
            </div>

            {/* ── Page layout map ── */}
            <div className="rounded-2xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                <ArrowUpDown size={11} className="inline ml-1" />
                نقشه ترتیب صفحه
              </p>
              <div className="space-y-1">
                {PAGE_LAYOUT.map((row, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
                    style={{
                      background: row.type === 'custom' ? 'rgba(0,188,212,0.08)' : row.type === 'fixed' ? 'rgba(255,255,255,0.03)' : 'transparent',
                      border: row.type === 'custom' ? `1px solid rgba(0,188,212,0.2)` : '1px solid transparent',
                    }}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
                    <span style={{ color: row.type === 'custom' ? T.accent : row.type === 'fixed' ? T.text : T.textSub }}>
                      {row.type === 'custom' ? `✦ ${row.label}` : row.label}
                    </span>
                    {row.type === 'slot' && sections.filter(s => s.position === row.pos).length === 0 && (
                      <span className="mr-auto text-[10px]" style={{ color: T.textSub }}>خالی</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section editors ── */}
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl gap-4"
                style={{ border: `2px dashed ${T.border}` }}>
                <Layout size={40} style={{ color: T.textSub }} />
                <p className="text-sm font-semibold" style={{ color: T.textMuted }}>هنوز سکشنی نساخته‌اید</p>
                <p className="text-xs" style={{ color: T.textSub }}>روی «سکشن جدید» کلیک کنید تا شروع کنید</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((sec, sIdx) => (
                  <SectionEditor key={sec.id} sec={sec} sIdx={sIdx} />
                ))}
              </div>
            )}
          </div>
        );
      }

      default: return null;
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen rtl overflow-hidden" dir="rtl" style={{ background: T.bg, color: T.text }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 flex flex-col shrink-0" style={{ background: 'rgba(4,8,18,0.97)', borderLeft: `1px solid ${T.borderSub}` }}>
        {/* Header */}
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.borderSub}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)' }}>
              <Edit3 size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white">مدیریت خدمات</h1>
              <p className="text-[10px] mt-0.5" style={{ color: '#00BCD4', opacity: 0.7 }}>Enterprise CMS</p>
            </div>
          </div>
          {dirty && (
            <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#f59e0b' }} />
              <span className="text-[10px] font-semibold" style={{ color: '#fbbf24' }}>تغییرات ذخیره نشده</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV.map(({ id, label: navLabel, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => setActive(id as NavId)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-right"
                style={{
                  background: isActive ? T.accentBg : 'transparent',
                  color: isActive ? T.accent : T.textMuted,
                  border: isActive ? `1px solid ${T.accentBdr}` : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = T.surfaceHov; (e.currentTarget as HTMLElement).style.color = T.text; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = T.textMuted; } }}
              >
                <Icon size={15} />
                {navLabel}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 space-y-2" style={{ borderTop: `1px solid ${T.borderSub}` }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all text-white"
            style={{
              background: dirty ? 'linear-gradient(135deg, #00BCD4, #00838F)' : 'rgba(255,255,255,0.06)',
              color: dirty ? '#fff' : T.textMuted,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />در حال ذخیره...</>
            ) : (
              <><Save size={14} />ذخیره همه تغییرات</>
            )}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleReset}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: T.surface, color: T.textMuted, border: `1px solid ${T.border}` }}
              onMouseEnter={e => (e.currentTarget.style.color = T.text)}
              onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}>
              <RotateCcw size={12} />بازنشانی
            </button>
            <a href="/services" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: T.surface, color: T.textMuted, border: `1px solid ${T.border}` }}
              onMouseEnter={e => (e.currentTarget.style.color = T.accent)}
              onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}>
              <ExternalLink size={12} />مشاهده
            </a>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="px-6 py-3.5 flex items-center justify-between shrink-0"
          style={{ background: 'rgba(7,17,30,0.95)', borderBottom: `1px solid ${T.borderSub}`, backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            {(() => { const n = NAV.find(x => x.id === active); if (!n) return null; const Icon = n.icon; return <Icon size={17} style={{ color: T.accent }} />; })()}
            <h2 className="text-base font-bold text-slate-200">
              {NAV.find(x => x.id === active)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: T.textMuted }}>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              صفحه خدمات
            </span>
            <a href="/services" target="_blank"
              className="flex items-center gap-1 font-semibold transition-colors"
              style={{ color: T.accent }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              <ExternalLink size={11} /> مشاهده در سایت
            </a>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Notification ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {notif && <Notif msg={notif.msg} type={notif.type} onClose={() => setNotif(null)} />}
      </AnimatePresence>
    </div>
  );
}
