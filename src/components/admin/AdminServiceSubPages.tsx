// ─── Admin: Service Sub-Page Manager ─────────────────────────────────────────
// Allows admins to create, name, reorder, and fully edit service sub-pages.
// Each sub-page gets its own slug, appears in the site nav under "خدمات",
// and has a full section-builder editor.

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, Eye, EyeOff, Save, ArrowRight,
  GripVertical, ChevronUp, ChevronDown, X, Check,
  Copy, ExternalLink, AlertCircle, Globe, Layout,
  Layers, Zap, Star, DollarSign, MessageSquare,
  HelpCircle, Users, BarChart3, Image as ImageIcon,
  FileText, Settings, Shield, TrendingUp, BookOpen,
  Bell, Link, Video, Minus, ArrowLeft, RotateCcw,
} from 'lucide-react';
import {
  loadSubPages, saveSubPages, createSubPage, updateSubPage,
  deleteSubPage, makeDefaultSection, SECTION_META,
  type ServiceSubPage, type SubPageSection, type SectionType,
} from '../../features/services/data/serviceSubPageStore';

// ─── Theme tokens ────────────────────────────────────────────────────────────
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

// ─── Shared input styles ─────────────────────────────────────────────────────
const inp = [
  'w-full px-3 py-2 text-sm rounded-lg transition-all',
  'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]',
  'text-slate-200 placeholder-slate-500',
  'focus:outline-none focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4]',
].join(' ');
const lbl = 'block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest';

const FInput = ({ label: l, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) => (
  <div>
    <label className={lbl}>{l}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} className={inp} />
  </div>
);

const FTextarea = ({ label: l, value, onChange, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  rows?: number; placeholder?: string;
}) => (
  <div>
    <label className={lbl}>{l}</label>
    <textarea value={value} onChange={e => onChange(e.target.value)}
      rows={rows} placeholder={placeholder} className={`${inp} resize-none`} />
  </div>
);

const FToggle = ({ label: l, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <button type="button" onClick={() => onChange(!value)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
      style={{ background: value ? T.accent : 'rgba(255,255,255,0.15)' }}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-1'}`} />
    </button>
    {l && <span className="text-sm font-medium text-slate-300">{l}</span>}
  </label>
);

const FTagsEditor = ({ label: l, items, onChange }: {
  label: string; items: string[]; onChange: (v: string[]) => void;
}) => {
  const [draft, setDraft] = useState('');
  return (
    <div>
      <label className={lbl}>{l}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full"
            style={{ background: T.accentBg, border: `1px solid ${T.accentBdr}`, color: T.accent }}>
            {item}
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="ml-0.5">
              <X size={9} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && draft.trim()) { onChange([...items, draft.trim()]); setDraft(''); e.preventDefault(); } }}
          placeholder="تایپ کنید و Enter بزنید..." className={`${inp} flex-1 text-xs`} />
        <button onClick={() => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(''); } }}
          className="px-3 py-2 text-white text-xs font-bold rounded-lg" style={{ background: T.accent }}>
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
};

// ─── Icon map for section types ──────────────────────────────────────────────
const SECTION_ICON_MAP: Record<SectionType, React.ReactNode> = {
  hero:         <Star size={14} />,
  introduction: <FileText size={14} />,
  categories:   <Layers size={14} />,
  features:     <Zap size={14} />,
  benefits:     <Star size={14} />,
  whyChooseUs:  <Shield size={14} />,
  process:      <Settings size={14} />,
  deliverables: <Check size={14} />,
  technologies: <Settings size={14} />,
  pricing:      <DollarSign size={14} />,
  comparison:   <Layout size={14} />,
  portfolio:    <ImageIcon size={14} />,
  caseStudies:  <BarChart3 size={14} />,
  statistics:   <TrendingUp size={14} />,
  clientLogos:  <Users size={14} />,
  testimonials: <MessageSquare size={14} />,
  team:         <Users size={14} />,
  faq:          <HelpCircle size={14} />,
  cta:          <Link size={14} />,
  newsletter:   <Bell size={14} />,
  richText:     <BookOpen size={14} />,
  imageGallery: <ImageIcon size={14} />,
  videoEmbed:   <Video size={14} />,
  divider:      <Minus size={14} />,
};

// ─── Notification ────────────────────────────────────────────────────────────
const Notif = ({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
    {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
    {msg}
    <button onClick={onClose}><X size={14} /></button>
  </motion.div>
);

// ─── Unique id ───────────────────────────────────────────────────────────────
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ═════════════════════════════════════════════════════════════════════════════
// SECTION EDITOR — edits the `data` blob of a single section
// ═════════════════════════════════════════════════════════════════════════════
function SectionDataEditor({ section, onChange }: {
  section: SubPageSection;
  onChange: (data: Record<string, unknown>) => void;
}) {
  const d = section.data;
  const set = (key: string, val: unknown) => onChange({ ...d, [key]: val });

  // String array list editor helper
  const ListEditor = ({ dataKey, label: l }: { dataKey: string; label: string }) => {
    const items = (d[dataKey] as string[]) ?? [];
    return <FTagsEditor label={l} items={items} onChange={v => set(dataKey, v)} />;
  };

  // Generic item list editor (array of objects with title + description)
  const ItemListEditor = ({ dataKey, label: l, fields }: {
    dataKey: string;
    label: string;
    fields: Array<{ key: string; label: string; textarea?: boolean }>;
  }) => {
    const items = (d[dataKey] as Record<string, string>[]) ?? [];
    return (
      <div>
        <label className={lbl}>{l}</label>
        <div className="space-y-3 mt-1">
          {items.map((item, i) => (
            <div key={i} className="p-3 rounded-xl space-y-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">آیتم {i + 1}</span>
                <button onClick={() => set(dataKey, items.filter((_, j) => j !== i))}
                  className="p-1 text-red-400 hover:bg-red-900/30 rounded"><Trash2 size={11} /></button>
              </div>
              {fields.map(f => f.textarea ? (
                <FTextarea key={f.key} label={f.label} rows={2}
                  value={item[f.key] ?? ''}
                  onChange={v => { const a = [...items]; a[i] = { ...a[i], [f.key]: v }; set(dataKey, a); }} />
              ) : (
                <FInput key={f.key} label={f.label}
                  value={item[f.key] ?? ''}
                  onChange={v => { const a = [...items]; a[i] = { ...a[i], [f.key]: v }; set(dataKey, a); }} />
              ))}
            </div>
          ))}
          <button onClick={() => set(dataKey, [...items, fields.reduce<Record<string,string>>((acc, f) => { acc[f.key] = ''; return acc; }, {})])}
            className="w-full py-2 border-dashed border-2 border-white/15 text-slate-500 hover:border-[#00BCD4]/50 hover:text-[#00BCD4] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all">
            <Plus size={12} /> افزودن
          </button>
        </div>
      </div>
    );
  };

  switch (section.type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FInput label="Badge" value={(d.badge as string) ?? ''} onChange={v => set('badge', v)} placeholder="خدمات تخصصی" />
            <FInput label="Eyebrow" value={(d.eyebrow as string) ?? ''} onChange={v => set('eyebrow', v)} placeholder="CAPITAL NETWORK" />
          </div>
          <FInput label="عنوان اصلی" value={(d.title as string) ?? ''} onChange={v => set('title', v)} />
          <FInput label="زیرعنوان" value={(d.subtitle as string) ?? ''} onChange={v => set('subtitle', v)} />
          <FTextarea label="توضیحات" rows={3} value={(d.description as string) ?? ''} onChange={v => set('description', v)} />
          <div className="grid grid-cols-2 gap-3">
            <FInput label="دکمه اصلی" value={(d.ctaPrimary as string) ?? ''} onChange={v => set('ctaPrimary', v)} placeholder="شروع رایگان" />
            <FInput label="دکمه ثانویه" value={(d.ctaSecondary as string) ?? ''} onChange={v => set('ctaSecondary', v)} placeholder="تماس با ما" />
          </div>
          <ListEditor dataKey="trustBadges" label="نشان‌های اعتماد" />
        </div>
      );

    case 'introduction':
      return (
        <div className="space-y-4">
          <FInput label="عنوان بخش" value={(d.title as string) ?? ''} onChange={v => set('title', v)} />
          <FTextarea label="توضیحات" rows={4} value={(d.description as string) ?? ''} onChange={v => set('description', v)} />
          <div className="grid grid-cols-2 gap-4">
            <ListEditor dataKey="uses" label="کاربردها" />
            <ListEditor dataKey="audience" label="مخاطبان" />
            <ListEditor dataKey="value" label="ارزش‌ها" />
            <ListEditor dataKey="advantages" label="مزیت‌ها" />
          </div>
        </div>
      );

    case 'features':
    case 'benefits':
      return (
        <ItemListEditor
          dataKey="items"
          label={section.type === 'features' ? 'ویژگی‌ها' : 'مزایا'}
          fields={[
            { key: 'title', label: 'عنوان' },
            { key: 'description', label: 'توضیحات', textarea: true },
          ]}
        />
      );

    case 'whyChooseUs':
      return (
        <div className="space-y-4">
          <FInput label="عنوان بخش" value={(d.title as string) ?? ''} onChange={v => set('title', v)} />
          <FTextarea label="توضیحات" rows={2} value={(d.description as string) ?? ''} onChange={v => set('description', v)} />
          <ItemListEditor
            dataKey="items"
            label="موارد"
            fields={[
              { key: 'title', label: 'عنوان' },
              { key: 'description', label: 'توضیحات', textarea: true },
              { key: 'status', label: 'وضعیت/برچسب' },
            ]}
          />
        </div>
      );

    case 'process':
      return (
        <ItemListEditor
          dataKey="steps"
          label="مراحل فرآیند"
          fields={[
            { key: 'title', label: 'عنوان مرحله' },
            { key: 'description', label: 'توضیحات', textarea: true },
            { key: 'duration', label: 'مدت زمان' },
          ]}
        />
      );

    case 'deliverables':
      return (
        <ItemListEditor
          dataKey="items"
          label="خروجی‌ها"
          fields={[
            { key: 'title', label: 'عنوان' },
            { key: 'format', label: 'فرمت (PDF, Web, ...)' },
            { key: 'description', label: 'توضیحات', textarea: true },
          ]}
        />
      );

    case 'technologies':
      return (
        <ItemListEditor
          dataKey="items"
          label="تکنولوژی‌ها"
          fields={[
            { key: 'name', label: 'نام' },
            { key: 'category', label: 'دسته‌بندی' },
            { key: 'version', label: 'ورژن' },
          ]}
        />
      );

    case 'statistics':
      return (
        <ItemListEditor
          dataKey="items"
          label="آمار و ارقام"
          fields={[
            { key: 'value', label: 'مقدار' },
            { key: 'label', label: 'برچسب' },
            { key: 'prefix', label: 'پیشوند' },
            { key: 'suffix', label: 'پسوند' },
          ]}
        />
      );

    case 'pricing':
      return (
        <ItemListEditor
          dataKey="plans"
          label="پلن‌های قیمتی"
          fields={[
            { key: 'name', label: 'نام پلن' },
            { key: 'price', label: 'قیمت' },
            { key: 'currency', label: 'واحد پول' },
            { key: 'description', label: 'توضیحات', textarea: true },
            { key: 'ctaLabel', label: 'متن دکمه' },
          ]}
        />
      );

    case 'comparison':
      return (
        <div className="space-y-4">
          <FInput label="عنوان جدول" value={(d.title as string) ?? ''} onChange={v => set('title', v)} />
          <FTextarea label="توضیحات" rows={2} value={(d.description as string) ?? ''} onChange={v => set('description', v)} />
          <FTagsEditor label="ستون‌ها" items={(d.columns as string[]) ?? []} onChange={v => set('columns', v)} />
        </div>
      );

    case 'portfolio':
      return (
        <ItemListEditor
          dataKey="items"
          label="نمونه‌کارها"
          fields={[
            { key: 'title', label: 'عنوان پروژه' },
            { key: 'client', label: 'کلاینت' },
            { key: 'category', label: 'دسته‌بندی' },
            { key: 'description', label: 'توضیحات', textarea: true },
            { key: 'thumbnail', label: 'آدرس تصویر (URL)' },
          ]}
        />
      );

    case 'caseStudies':
      return (
        <ItemListEditor
          dataKey="items"
          label="مطالعات موردی"
          fields={[
            { key: 'title', label: 'عنوان' },
            { key: 'client', label: 'کلاینت' },
            { key: 'industry', label: 'صنعت' },
            { key: 'challenge', label: 'چالش', textarea: true },
            { key: 'solution', label: 'راه‌حل', textarea: true },
            { key: 'results', label: 'نتایج', textarea: true },
          ]}
        />
      );

    case 'clientLogos':
      return (
        <ItemListEditor
          dataKey="items"
          label="لوگوهای مشتریان"
          fields={[
            { key: 'name', label: 'نام شرکت' },
            { key: 'logo', label: 'آدرس لوگو (URL)' },
            { key: 'url', label: 'لینک وبسایت' },
          ]}
        />
      );

    case 'testimonials':
      return (
        <ItemListEditor
          dataKey="items"
          label="نظرات مشتریان"
          fields={[
            { key: 'name', label: 'نام' },
            { key: 'role', label: 'نقش/سمت' },
            { key: 'company', label: 'شرکت' },
            { key: 'quote', label: 'نظر', textarea: true },
          ]}
        />
      );

    case 'team':
      return (
        <ItemListEditor
          dataKey="members"
          label="اعضای تیم"
          fields={[
            { key: 'name', label: 'نام' },
            { key: 'role', label: 'نقش' },
            { key: 'bio', label: 'بیوگرافی', textarea: true },
            { key: 'avatar', label: 'تصویر (URL)' },
          ]}
        />
      );

    case 'faq':
      return (
        <ItemListEditor
          dataKey="items"
          label="سوالات متداول"
          fields={[
            { key: 'question', label: 'سوال' },
            { key: 'answer', label: 'جواب', textarea: true },
          ]}
        />
      );

    case 'cta':
      return (
        <div className="space-y-4">
          <FInput label="عنوان" value={(d.title as string) ?? ''} onChange={v => set('title', v)} />
          <FTextarea label="توضیحات" rows={2} value={(d.description as string) ?? ''} onChange={v => set('description', v)} />
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl space-y-2" style={{ background: T.accentBg, border: `1px solid ${T.accentBdr}` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.accent }}>دکمه اصلی</p>
              <FInput label="متن" value={(d.primaryLabel as string) ?? ''} onChange={v => set('primaryLabel', v)} />
              <FInput label="لینک" value={(d.primaryLink as string) ?? ''} onChange={v => set('primaryLink', v)} />
            </div>
            <div className="p-3 rounded-xl space-y-2" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">دکمه ثانویه</p>
              <FInput label="متن" value={(d.secondaryLabel as string) ?? ''} onChange={v => set('secondaryLabel', v)} />
              <FInput label="لینک" value={(d.secondaryLink as string) ?? ''} onChange={v => set('secondaryLink', v)} />
            </div>
          </div>
          <FToggle label="نمایش این بخش" value={(d.enabled as boolean) ?? true} onChange={v => set('enabled', v)} />
        </div>
      );

    case 'newsletter':
      return (
        <div className="space-y-4">
          <FInput label="عنوان" value={(d.title as string) ?? ''} onChange={v => set('title', v)} />
          <FTextarea label="توضیحات" rows={2} value={(d.description as string) ?? ''} onChange={v => set('description', v)} />
          <div className="grid grid-cols-2 gap-3">
            <FInput label="Placeholder ایمیل" value={(d.placeholder as string) ?? ''} onChange={v => set('placeholder', v)} />
            <FInput label="متن دکمه" value={(d.buttonLabel as string) ?? ''} onChange={v => set('buttonLabel', v)} />
          </div>
        </div>
      );

    case 'richText':
      return (
        <FTextarea label="محتوا (HTML)" rows={8}
          value={(d.content as string) ?? ''}
          onChange={v => set('content', v)}
          placeholder="<p>متن دلخواه...</p>" />
      );

    case 'imageGallery':
      return (
        <div className="space-y-4">
          <FTagsEditor label="لینک‌های تصاویر (URL)" items={(d.images as string[]) ?? []} onChange={v => set('images', v)} />
          <FInput label="تعداد ستون‌ها (۲-۴)" value={String((d.columns as number) ?? 3)} onChange={v => set('columns', parseInt(v) || 3)} />
        </div>
      );

    case 'videoEmbed':
      return (
        <div className="space-y-4">
          <FInput label="لینک ویدیو (YouTube/Vimeo)" value={(d.url as string) ?? ''} onChange={v => set('url', v)} placeholder="https://youtube.com/embed/..." />
          <FInput label="کپشن" value={(d.caption as string) ?? ''} onChange={v => set('caption', v)} />
        </div>
      );

    case 'divider':
      return (
        <div className="space-y-3">
          <div>
            <label className={lbl}>استایل</label>
            <select value={(d.style as string) ?? 'line'}
              onChange={e => set('style', e.target.value)}
              className={inp} style={{ colorScheme: 'dark' }}>
              <option value="line">خط ساده</option>
              <option value="dots">نقطه‌چین</option>
              <option value="space">فضای خالی</option>
            </select>
          </div>
          <div>
            <label className={lbl}>فاصله</label>
            <select value={(d.spacing as string) ?? 'md'}
              onChange={e => set('spacing', e.target.value)}
              className={inp} style={{ colorScheme: 'dark' }}>
              <option value="sm">کم</option>
              <option value="md">متوسط</option>
              <option value="lg">زیاد</option>
            </select>
          </div>
        </div>
      );

    case 'categories':
      return (
        <ItemListEditor
          dataKey="items"
          label="دسته‌بندی‌ها"
          fields={[
            { key: 'name', label: 'نام' },
            { key: 'description', label: 'توضیحات', textarea: true },
            { key: 'icon', label: 'آیکون' },
          ]}
        />
      );

    default:
      return (
        <div className="p-4 text-center" style={{ color: T.textMuted }}>
          <p className="text-sm">ویرایشگر برای این نوع سکشن در حال توسعه است.</p>
        </div>
      );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION ROW — collapsible row in the section list
// ═════════════════════════════════════════════════════════════════════════════
function SectionRow({ section, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  section: SubPageSection;
  onUpdate: (s: SubPageSection) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);
  const meta = SECTION_META[section.type];

  return (
    <div className="rounded-xl overflow-hidden transition-all" style={{ border: `1px solid ${section.visible ? T.border : 'rgba(255,255,255,0.04)'}` }}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
        style={{ background: open ? 'rgba(0,188,212,0.06)' : T.surface, opacity: section.visible ? 1 : 0.45 }}>
        {/* drag handle */}
        <GripVertical size={14} style={{ color: T.textSub }} className="shrink-0" />
        {/* color bar */}
        <div className="w-1 h-7 rounded-full shrink-0" style={{ background: meta.color }} />
        {/* icon */}
        <span style={{ color: meta.color }}>{SECTION_ICON_MAP[section.type]}</span>
        {/* label */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">{meta.label}</p>
          {section.data.title && (
            <p className="text-xs truncate" style={{ color: T.textMuted }}>{section.data.title as string}</p>
          )}
        </div>
        {/* actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onMoveUp} disabled={isFirst}
            className="p-1.5 rounded-lg transition-all disabled:opacity-25"
            style={{ color: T.textMuted }}
            onMouseEnter={e => !isFirst && ((e.currentTarget as HTMLElement).style.color = T.text)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = T.textMuted)}>
            <ChevronUp size={13} />
          </button>
          <button onClick={onMoveDown} disabled={isLast}
            className="p-1.5 rounded-lg transition-all disabled:opacity-25"
            style={{ color: T.textMuted }}
            onMouseEnter={e => !isLast && ((e.currentTarget as HTMLElement).style.color = T.text)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = T.textMuted)}>
            <ChevronDown size={13} />
          </button>
          <button onClick={() => onUpdate({ ...section, visible: !section.visible })}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: section.visible ? T.accent : T.textMuted }}
            title={section.visible ? 'پنهان کردن' : 'نمایش'}>
            {section.visible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg transition-all"
            style={{ color: T.textMuted }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ef4444')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = T.textMuted)}>
            <Trash2 size={13} />
          </button>
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg transition-all"
            style={{ color: T.textMuted }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = T.accent)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = T.textMuted)}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden">
            <div className="p-4 space-y-4" style={{ borderTop: `1px solid ${T.borderSub}`, background: 'rgba(0,0,0,0.15)' }}>
              <SectionDataEditor
                section={section}
                onChange={data => onUpdate({ ...section, data })}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADD SECTION PALETTE
// ═════════════════════════════════════════════════════════════════════════════
const ALL_SECTION_TYPES = Object.keys(SECTION_META) as SectionType[];
const SECTION_GROUPS: Array<{ label: string; types: SectionType[] }> = [
  { label: 'محتوای اصلی', types: ['hero', 'introduction', 'categories', 'features', 'benefits', 'whyChooseUs'] },
  { label: 'فرآیند و خروجی', types: ['process', 'deliverables', 'technologies'] },
  { label: 'قیمت و مقایسه', types: ['pricing', 'comparison'] },
  { label: 'نمونه‌کارها', types: ['portfolio', 'caseStudies', 'statistics'] },
  { label: 'مشتریان و تیم', types: ['clientLogos', 'testimonials', 'team'] },
  { label: 'پشتیبانی', types: ['faq', 'cta', 'newsletter'] },
  { label: 'محتوای آزاد', types: ['richText', 'imageGallery', 'videoEmbed', 'divider'] },
];

function AddSectionPalette({ onAdd, onClose }: { onAdd: (type: SectionType) => void; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
      className="rounded-2xl p-5 space-y-5" style={{ background: 'rgba(4,10,24,0.98)', border: `1px solid ${T.border}` }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">افزودن سکشن جدید</h3>
        <button onClick={onClose} style={{ color: T.textMuted }}><X size={16} /></button>
      </div>
      {SECTION_GROUPS.map(group => (
        <div key={group.label}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.textSub }}>{group.label}</p>
          <div className="grid grid-cols-3 gap-2">
            {group.types.map(type => {
              const meta = SECTION_META[type];
              return (
                <button key={type} onClick={() => { onAdd(type); onClose(); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-right transition-all"
                  style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textMuted }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.surfaceHov; (e.currentTarget as HTMLElement).style.borderColor = meta.color + '55'; (e.currentTarget as HTMLElement).style.color = T.text; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.surface; (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.textMuted; }}>
                  <span style={{ color: meta.color }}>{SECTION_ICON_MAP[type]}</span>
                  <span className="truncate">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE EDITOR — edits a single ServiceSubPage
// ═════════════════════════════════════════════════════════════════════════════
function PageEditor({ page, onSave, onBack }: {
  page: ServiceSubPage;
  onSave: (p: ServiceSubPage) => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState<ServiceSubPage>({ ...page, sections: page.sections.map(s => ({ ...s })) });
  const [dirty, setDirty] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [notif, setNotif] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const mutate = useCallback((upd: Partial<ServiceSubPage>) => {
    setDraft(d => ({ ...d, ...upd }));
    setDirty(true);
  }, []);

  const updateSection = useCallback((idx: number, s: SubPageSection) => {
    const sections = [...draft.sections];
    sections[idx] = s;
    mutate({ sections });
  }, [draft.sections, mutate]);

  const deleteSection = useCallback((idx: number) => {
    mutate({ sections: draft.sections.filter((_, i) => i !== idx) });
  }, [draft.sections, mutate]);

  const moveSection = useCallback((idx: number, dir: -1 | 1) => {
    const sections = [...draft.sections];
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    [sections[idx], sections[target]] = [sections[target], sections[idx]];
    mutate({ sections });
  }, [draft.sections, mutate]);

  const addSection = useCallback((type: SectionType) => {
    mutate({ sections: [...draft.sections, makeDefaultSection(type)] });
  }, [draft.sections, mutate]);

  const handleSave = () => {
    onSave(draft);
    setDirty(false);
    setNotif({ msg: 'تغییرات ذخیره شد ✓', type: 'success' });
    setTimeout(() => setNotif(null), 3000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: T.bg }}>
      {/* Top bar */}
      <header className="flex items-center gap-4 px-6 py-3.5 shrink-0"
        style={{ background: 'rgba(7,17,30,0.95)', borderBottom: `1px solid ${T.borderSub}`, backdropFilter: 'blur(12px)' }}>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: T.textMuted }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = T.text)}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = T.textMuted)}>
          <ArrowRight size={16} /> بازگشت به لیست
        </button>
        <div className="w-px h-5 mx-1" style={{ background: T.borderSub }} />
        <h2 className="text-sm font-bold text-slate-200 flex-1 truncate">
          ویرایش: {draft.name || 'بی‌نام'}
        </h2>
        {dirty && (
          <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            ذخیره نشده
          </span>
        )}
        <a href={`/services/${draft.slug}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
          style={{ color: T.accent }}>
          <ExternalLink size={12} /> پیش‌نمایش
        </a>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all text-white"
          style={{ background: dirty ? 'linear-gradient(135deg,#00BCD4,#00838F)' : 'rgba(255,255,255,0.06)', color: dirty ? '#fff' : T.textMuted }}>
          <Save size={14} /> ذخیره
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings sidebar */}
        <aside className="w-72 shrink-0 flex flex-col overflow-y-auto"
          style={{ background: 'rgba(4,8,18,0.97)', borderLeft: `1px solid ${T.borderSub}` }}>
          <div className="px-5 py-4 space-y-4" style={{ borderBottom: `1px solid ${T.borderSub}` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textSub }}>تنظیمات صفحه</p>
            <FInput label="نام صفحه (در منو)" value={draft.name} onChange={v => mutate({ name: v })} placeholder="مثلاً: مشاوره مالی" />
            <FInput label="Slug (در URL)" value={draft.slug} onChange={v => mutate({ slug: v.replace(/\s+/g, '-').toLowerCase() })} placeholder="financial-consulting" />
            <FTextarea label="توضیح کوتاه" rows={2} value={draft.description} onChange={v => mutate({ description: v })} placeholder="توضیح مختصر برای سئو و منو" />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="ایموجی آیکون" value={draft.icon} onChange={v => mutate({ icon: v })} placeholder="📄" />
              <div>
                <label className={lbl}>رنگ تم</label>
                <div className="flex gap-2">
                  <input type="color" value={draft.color} onChange={e => mutate({ color: e.target.value })}
                    className="h-9 w-12 rounded-lg cursor-pointer" style={{ background: 'transparent', border: `1px solid ${T.border}` }} />
                  <input value={draft.color} onChange={e => mutate({ color: e.target.value })} className={`${inp} flex-1`} />
                </div>
              </div>
            </div>
            <FToggle label="نمایش در منوی سایت" value={draft.visible} onChange={v => mutate({ visible: v })} />
          </div>

          {/* Section count */}
          <div className="px-5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.textSub }}>
              سکشن‌ها ({draft.sections.length})
            </p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {draft.sections.map((s, i) => {
                const meta = SECTION_META[s.type];
                return (
                  <button key={s.id} onClick={() => {/* scroll to section */}}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-right transition-all"
                    style={{ background: T.surface, color: s.visible ? T.text : T.textSub, opacity: s.visible ? 1 : 0.5 }}>
                    <span style={{ color: meta.color }}>{SECTION_ICON_MAP[s.type]}</span>
                    <span className="flex-1 truncate">{meta.label}</span>
                    <span className="text-[9px]" style={{ color: T.textSub }}>#{i + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Section list */}
        <main className="flex-1 overflow-y-auto p-6 space-y-3">
          {draft.sections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <Layers size={24} style={{ color: T.textMuted }} />
              </div>
              <p className="text-slate-400 font-semibold text-sm mb-1">هنوز سکشنی اضافه نشده</p>
              <p className="text-slate-600 text-xs">برای شروع، یک سکشن اضافه کنید</p>
            </div>
          )}

          {draft.sections.map((section, i) => (
            <SectionRow key={section.id}
              section={section}
              onUpdate={s => updateSection(i, s)}
              onDelete={() => deleteSection(i)}
              onMoveUp={() => moveSection(i, -1)}
              onMoveDown={() => moveSection(i, 1)}
              isFirst={i === 0}
              isLast={i === draft.sections.length - 1}
            />
          ))}

          {/* Add section button */}
          <AnimatePresence>
            {showPalette && (
              <AddSectionPalette onAdd={addSection} onClose={() => setShowPalette(false)} />
            )}
          </AnimatePresence>
          {!showPalette && (
            <button onClick={() => setShowPalette(true)}
              className="w-full py-4 border-2 border-dashed border-white/15 text-slate-500 hover:border-[#00BCD4]/50 hover:text-[#00BCD4] rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
              <Plus size={16} /> افزودن سکشن جدید
            </button>
          )}
        </main>
      </div>

      <AnimatePresence>
        {notif && <Notif msg={notif.msg} type={notif.type} onClose={() => setNotif(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SUB-PAGE LIST — main landing view
// ═════════════════════════════════════════════════════════════════════════════
function SubPageList({ pages, onEdit, onCreate, onDelete, onToggleVisible, onDuplicate }: {
  pages: ServiceSubPage[];
  onEdit: (p: ServiceSubPage) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onDuplicate: (p: ServiceSubPage) => void;
}) {
  const [confirm, setConfirm] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">صفحات خدمات</h2>
          <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
            هر صفحه در منوی "خدمات" سایت به عنوان زیر‌منو نمایش داده می‌شود
          </p>
        </div>
        <button onClick={onCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#00BCD4,#00838F)' }}>
          <Plus size={15} /> ایجاد صفحه جدید
        </button>
      </div>

      {/* Info card */}
      <div className="p-4 rounded-xl flex items-start gap-3"
        style={{ background: T.accentBg, border: `1px solid ${T.accentBdr}` }}>
        <Globe size={16} style={{ color: T.accent }} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold" style={{ color: T.accent }}>نحوه عملکرد</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(0,188,212,0.7)' }}>
            هر صفحه‌ای که ایجاد کنید در آدرس <code className="font-mono">/services/[slug]</code> در دسترس خواهد بود
            و به صورت خودکار در منوی "خدمات" سایت نمایش داده می‌شود.
          </p>
        </div>
      </div>

      {/* Empty state */}
      {pages.length === 0 && (
        <div className="py-24 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <Layout size={28} style={{ color: T.textMuted }} />
          </div>
          <p className="text-slate-300 font-bold text-base mb-2">هنوز هیچ صفحه‌ای ایجاد نشده</p>
          <p className="text-slate-600 text-sm mb-6">اولین صفحه خدمات خود را بسازید</p>
          <button onClick={onCreate}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#00BCD4,#00838F)' }}>
            <Plus size={15} /> ساخت اولین صفحه
          </button>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid gap-4">
        {pages.map(page => (
          <motion.div key={page.id} layout
            className="rounded-2xl overflow-hidden transition-all"
            style={{ background: T.surface, border: `1px solid ${page.visible ? T.border : 'rgba(255,255,255,0.04)'}` }}>
            <div className="flex items-center gap-4 px-5 py-4">
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl"
                style={{ background: page.color + '20', border: `1px solid ${page.color}30` }}>
                {page.icon || '📄'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-100">{page.name || 'بی‌نام'}</h3>
                  {!page.visible && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.05)', color: T.textSub }}>
                      پنهان
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: T.textMuted }}>
                  <span className="font-mono" style={{ color: page.color }}>/services/{page.slug}</span>
                  {page.description && <span className="mx-2 opacity-50">·</span>}
                  {page.description && <span>{page.description}</span>}
                </p>
                <p className="text-[10px] mt-1" style={{ color: T.textSub }}>
                  {page.sections.length} سکشن · آخرین ویرایش: {new Date(page.updatedAt).toLocaleDateString('fa-IR')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <a href={`/services/${page.slug}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-all" style={{ color: T.textMuted }}
                  title="مشاهده در سایت"
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = T.accent)}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = T.textMuted)}>
                  <ExternalLink size={15} />
                </a>
                <button onClick={() => onToggleVisible(page.id)}
                  className="p-2 rounded-lg transition-all" style={{ color: page.visible ? T.accent : T.textMuted }}
                  title={page.visible ? 'پنهان کردن از منو' : 'نمایش در منو'}>
                  {page.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => onDuplicate(page)}
                  className="p-2 rounded-lg transition-all" style={{ color: T.textMuted }}
                  title="کپی صفحه"
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = T.text)}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = T.textMuted)}>
                  <Copy size={15} />
                </button>
                <button onClick={() => onEdit(page)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: T.accentBg, border: `1px solid ${T.accentBdr}`, color: T.accent }}>
                  <Edit3 size={13} /> ویرایش
                </button>
                {confirm === page.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => { onDelete(page.id); setConfirm(null); }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white">
                      حذف
                    </button>
                    <button onClick={() => setConfirm(null)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: T.surface, color: T.textMuted }}>
                      لغو
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirm(page.id)}
                    className="p-2 rounded-lg transition-all" style={{ color: T.textMuted }}
                    title="حذف"
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ef4444')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = T.textMuted)}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CREATE DIALOG
// ═════════════════════════════════════════════════════════════════════════════
function CreateDialog({ onConfirm, onCancel }: { onConfirm: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{ background: '#0d1829', border: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">ایجاد صفحه خدمات جدید</h3>
          <button onClick={onCancel} style={{ color: T.textMuted }}><X size={18} /></button>
        </div>
        <FInput label="نام صفحه (مثلاً: مشاوره مالی، Pitch Deck)" value={name}
          onChange={setName} placeholder="نام صفحه را بنویسید..." />
        <p className="text-xs" style={{ color: T.textMuted }}>
          Slug به صورت خودکار ساخته می‌شود. بعداً می‌توانید آن را تغییر دهید.
        </p>
        <div className="flex gap-3">
          <button onClick={() => name.trim() && onConfirm(name.trim())}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#00BCD4,#00838F)' }}>
            ایجاد صفحه
          </button>
          <button onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: T.surface, color: T.textMuted, border: `1px solid ${T.border}` }}>
            لغو
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function AdminServiceSubPages() {
  const [pages, setPages] = useState<ServiceSubPage[]>([]);
  const [editing, setEditing] = useState<ServiceSubPage | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [notif, setNotif] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setPages(loadSubPages());
  }, []);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3500);
  };

  const handleCreate = (name: string) => {
    const page = createSubPage(name);
    setPages(loadSubPages());
    setShowCreate(false);
    setEditing(page);
    notify(`صفحه "${name}" ایجاد شد`);
  };

  const handleSave = (updated: ServiceSubPage) => {
    updateSubPage(updated);
    setPages(loadSubPages());
  };

  const handleDelete = (id: string) => {
    deleteSubPage(id);
    setPages(loadSubPages());
    notify('صفحه حذف شد');
  };

  const handleToggleVisible = (id: string) => {
    const p = pages.find(x => x.id === id);
    if (!p) return;
    const updated = { ...p, visible: !p.visible, updatedAt: new Date().toISOString() };
    updateSubPage(updated);
    setPages(loadSubPages());
  };

  const handleDuplicate = (p: ServiceSubPage) => {
    const newSlug = `${p.slug}-copy-${Math.random().toString(36).slice(2, 6)}`;
    const copy: ServiceSubPage = {
      ...p,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      slug: newSlug,
      name: `${p.name} (کپی)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: p.sections.map(s => ({
        ...s,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      })),
    };
    const all = loadSubPages();
    all.push(copy);
    saveSubPages(all);
    setPages(loadSubPages());
    notify(`صفحه "${copy.name}" کپی شد`);
  };

  // If editing a page, show the full editor
  if (editing) {
    return (
      <PageEditor
        page={editing}
        onSave={p => { handleSave(p); setEditing(p); }}
        onBack={() => { setEditing(null); setPages(loadSubPages()); }}
      />
    );
  }

  return (
    <div style={{ background: T.bg, minHeight: '100%' }}>
      <SubPageList
        pages={pages}
        onEdit={setEditing}
        onCreate={() => setShowCreate(true)}
        onDelete={handleDelete}
        onToggleVisible={handleToggleVisible}
        onDuplicate={handleDuplicate}
      />

      <AnimatePresence>
        {showCreate && (
          <CreateDialog
            onConfirm={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notif && <Notif msg={notif.msg} type={notif.type} onClose={() => setNotif(null)} />}
      </AnimatePresence>
    </div>
  );
}
