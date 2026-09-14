import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Plus, Trash2, Home, Wrench, RefreshCw,
  Users, Phone, ChevronDown, ChevronUp, GripVertical,
  BookOpen, HelpCircle, X, Eye, EyeOff, Navigation2,
  Link2, Image, ToggleLeft, ToggleRight, Upload,
  Target, Shield, Star, Briefcase, TrendingUp, CheckCircle2,
  Clock, Zap, AlignLeft, MessageSquare, Globe,
} from 'lucide-react';
import { DEFAULT_SETTINGS, fetchSettings, saveSettings } from '../../lib/settingsApi';
import type {
  SiteSettings, PageStat, WhyUsItem, ProcessStep,
  ServiceCard, ServicePackage, AboutCard, FontSize, FaqItem, TextAlign,
  ShowcaseCardData, CyjStep, CyjCard,
  AboutPageSection, AboutPageParagraph, TeamMemberFull, ContactStatItem,
} from '../../lib/settingsApi';
import { uploadImage } from '../../lib/mediaUploadApi';
import AdminHomeSectionBuilder from './AdminHomeSectionBuilder';
import PageSectionBuilder from './PageSectionBuilder';

// ── تب‌های صفحه ────────────────────────────────────────────────────────────────
type TabId = 'home' | 'blog-preview' | 'faq' | 'continue-journey';

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'home',              label: 'صفحه اصلی',         icon: <Home size={14} /> },
  { id: 'blog-preview',      label: 'پیش‌نمایش بلاگ',    icon: <BookOpen size={14} /> },
  { id: 'faq',               label: 'سوالات متداول',      icon: <HelpCircle size={14} /> },
  { id: 'continue-journey',  label: 'ادامه مسیر',         icon: <Navigation2 size={14} /> },
];

// ── استایل‌های مشترک ──────────────────────────────────────────────────────────
const inputCls = 'w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };
const onFocus  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  (e.target.style.borderColor = 'rgba(0,188,212,0.5)');
const onBlur   = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  (e.target.style.borderColor = 'rgba(255,255,255,0.1)');

// ── کامپوننت‌های کمکی ─────────────────────────────────────────────────────────

function SectionCard({
  title, children, defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={cardStyle}>
      {/* header — کلیک برای باز/بسته */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-right transition-colors hover:bg-white/5"
        style={{ background: open ? 'rgba(0,188,212,0.04)' : 'transparent' }}
      >
        <span className="text-sm font-bold text-teal-400">{title}</span>
        <span
          className="text-slate-500 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
        >
          ▾
        </span>
      </button>
      {/* body */}
      {open && (
        <div className="px-5 pb-5 pt-3 space-y-4"
          style={{ borderTop: '1px solid rgba(0,188,212,0.1)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder = '', textarea = false, ltr = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean; ltr?: boolean;
}) {
  const shared = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder,
    className: textarea ? `${inputCls} resize-none` : inputCls,
    style: ltr ? { ...inputStyle, direction: 'ltr' as const } : inputStyle,
    onFocus,
    onBlur,
  };
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      {textarea
        ? <textarea {...shared as any} rows={3} />
        : <input {...shared as any} />
      }
    </div>
  );
}

// ── Font-size Picker ──────────────────────────────────────────────────────────
function FontSizePicker({
  value, onChange,
}: { value: FontSize; onChange: (v: FontSize) => void }) {
  const numericValue = typeof value === 'number'
    ? value
    : (value === 'h1' ? 30
      : value === 'h2' ? 24
      : value === 'h3' ? 20
      : value === 'h4' ? 18
      : value === 'h5' ? 16
      : value === 'h6' ? 14
      : 14);
  const options = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label className="text-[10px] text-slate-500 ml-1">سایز:</label>
      <select
        value={String(numericValue)}
        onChange={(e) => onChange(Number(e.target.value) as FontSize)}
        className="rounded-lg px-2 py-1 text-[11px] font-bold bg-slate-950/80 border border-slate-700 text-white"
        style={{ minWidth: 58 }}
      >
        {options.map(size => (
          <option key={size} value={size}>{size} px</option>
        ))}
      </select>
    </div>
  );
}

// ── Bold Picker ──────────────────────────────────────────────────────────────
function BoldPicker({
  value, onChange,
}: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all"
      style={value
        ? { background: 'rgba(244,63,94,0.2)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.4)' }
        : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }
      }
      title={value ? 'بولد است' : 'بولد کن'}
    >
      B
    </button>
  );
}

// ── Align Picker ──────────────────────────────────────────────────────────────
const ALIGN_OPTIONS: Array<{ value: TextAlign; label: string }> = [
  { value: 'right',  label: 'راست چین' },
  { value: 'center', label: 'وسط چین' },
  { value: 'left',   label: 'چپ چین' },
];

function AlignPicker({
  value, onChange,
}: { value: TextAlign; onChange: (v: TextAlign) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label className="text-[10px] text-slate-500 ml-1">تراز:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TextAlign)}
        className="rounded-lg px-2 py-1 text-[11px] font-bold bg-slate-950/80 border border-slate-700 text-white"
        style={{ minWidth: 96 }}
      >
        {ALIGN_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

/** فیلد متنی + picker سایز فونت + picker تراز */
function FieldWithSize({
  label, value, onChange, fsValue, onFsChange,
  alignValue, onAlignChange,
  placeholder = '', textarea = false,
}: {
  label: string;
  value: string;          onChange: (v: string) => void;
  fsValue: FontSize;      onFsChange: (v: FontSize) => void;
  alignValue?: TextAlign; onAlignChange?: (v: TextAlign) => void;
  placeholder?: string;   textarea?: boolean;
}) {
  const shared = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder,
    className: textarea ? `${inputCls} resize-none` : inputCls,
    style: inputStyle,
    onFocus,
    onBlur,
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between flex-wrap gap-1">
        <label className="text-xs text-slate-400">{label}</label>
        <div className="flex items-center gap-2 flex-wrap">
          <FontSizePicker value={fsValue} onChange={onFsChange} />
          {alignValue !== undefined && onAlignChange && (
            <AlignPicker value={alignValue} onChange={onAlignChange} />
          )}
        </div>
      </div>
      {textarea
        ? <textarea {...shared as any} rows={3} />
        : <input {...shared as any} />
      }
    </div>
  );
}

/** فیلد متنی ساده + picker سایز فونت + picker تراز (بدون نیاز به FieldWithSize اما با کنترل‌های کامل) */
function FieldFull({
  label, value, onChange,
  fsValue, onFsChange,
  alignValue, onAlignChange,
  boldValue, onBoldChange,
  placeholder = '', textarea = false, ltr = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  fsValue: FontSize;      onFsChange: (v: FontSize) => void;
  alignValue: TextAlign;  onAlignChange: (v: TextAlign) => void;
  boldValue?: boolean;    onBoldChange?: (v: boolean) => void;
  placeholder?: string; textarea?: boolean; ltr?: boolean;
}) {
  const shared = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder,
    className: textarea ? `${inputCls} resize-none` : inputCls,
    style: ltr ? { ...inputStyle, direction: 'ltr' as const } : inputStyle,
    onFocus,
    onBlur,
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between flex-wrap gap-1">
        <label className="text-xs text-slate-400">{label}</label>
        <div className="flex items-center gap-2 flex-wrap">
          <FontSizePicker value={fsValue} onChange={onFsChange} />
          <AlignPicker value={alignValue} onChange={onAlignChange} />
          {boldValue !== undefined && onBoldChange && (
            <BoldPicker value={boldValue} onChange={onBoldChange} />
          )}
        </div>
      </div>
      {textarea
        ? <textarea {...shared as any} rows={3} />
        : <input {...shared as any} />
      }
    </div>
  );
}

function StatEditor({
  stats, onChange,
}: { stats: PageStat[]; onChange: (s: PageStat[]) => void }) {
  return (
    <div className="space-y-3">
      {stats.map((s, i) => (
        <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="block text-[10px] text-slate-500 font-mono">آمار {i + 1}</span>
          {/* مقدار */}
          <FieldFull
            label="مقدار"
            value={s.value}
            onChange={v => { const n = [...stats]; n[i] = { ...n[i], value: v }; onChange(n); }}
            fsValue={s.value_fs ?? 'h3'}
            onFsChange={v => { const n = [...stats]; n[i] = { ...n[i], value_fs: v }; onChange(n); }}
            alignValue={s.value_align ?? 'right'}
            onAlignChange={v => { const n = [...stats]; n[i] = { ...n[i], value_align: v }; onChange(n); }}
            placeholder="مثال: +$50M"
          />
          {/* برچسب */}
          <FieldFull
            label="برچسب"
            value={s.label}
            onChange={v => { const n = [...stats]; n[i] = { ...n[i], label: v }; onChange(n); }}
            fsValue={s.label_fs ?? 'p'}
            onFsChange={v => { const n = [...stats]; n[i] = { ...n[i], label_fs: v }; onChange(n); }}
            alignValue={s.label_align ?? 'right'}
            onAlignChange={v => { const n = [...stats]; n[i] = { ...n[i], label_align: v }; onChange(n); }}
            placeholder="مثال: سرمایه جذب‌شده"
          />
        </div>
      ))}
    </div>
  );
}

function WhyUsEditor({
  items, onChange,
}: { items: WhyUsItem[]; onChange: (s: WhyUsItem[]) => void }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-mono">کارت {i + 1}</span>
            <div className="flex gap-1">
              <button onClick={() => { if (i === 0) return; const n = [...items]; [n[i-1],n[i]]=[n[i],n[i-1]]; onChange(n); }}
                disabled={i === 0} className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20">
                <ChevronUp size={12} />
              </button>
              <button onClick={() => { if (i === items.length - 1) return; const n = [...items]; [n[i],n[i+1]]=[n[i+1],n[i]]; onChange(n); }}
                disabled={i === items.length - 1} className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20">
                <ChevronDown size={12} />
              </button>
              <button onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="p-1 rounded text-red-400/50 hover:text-red-400">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {/* عنوان کارت */}
          <FieldFull
            label="عنوان کارت"
            value={item.title}
            onChange={v => { const n = [...items]; n[i] = { ...n[i], title: v }; onChange(n); }}
            fsValue={item.title_fs ?? 'h4'}
            onFsChange={v => { const n = [...items]; n[i] = { ...n[i], title_fs: v }; onChange(n); }}
            alignValue={item.title_align ?? 'right'}
            onAlignChange={v => { const n = [...items]; n[i] = { ...n[i], title_align: v }; onChange(n); }}
            placeholder="عنوان کارت"
          />
          {/* توضیح کارت */}
          <FieldFull
            label="توضیح"
            value={item.desc}
            onChange={v => { const n = [...items]; n[i] = { ...n[i], desc: v }; onChange(n); }}
            fsValue={item.desc_fs ?? 'p'}
            onFsChange={v => { const n = [...items]; n[i] = { ...n[i], desc_fs: v }; onChange(n); }}
            alignValue={item.desc_align ?? 'right'}
            onAlignChange={v => { const n = [...items]; n[i] = { ...n[i], desc_align: v }; onChange(n); }}
            placeholder="توضیح"
            textarea
          />
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { title: '', desc: '' }])}
        className="w-full py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.25)' }}>
        <Plus size={13} /> افزودن کارت
      </button>
    </div>
  );
}

// ── آیکون‌های قابل انتخاب برای مراحل فرآیند ──────────────────────────────────
const STEP_ICON_OPTIONS = [
  { key: 'layers',   emoji: '🗂', label: 'لایه‌ها' },
  { key: 'users',    emoji: '👥', label: 'تیم' },
  { key: 'check',    emoji: '✅', label: 'تأیید' },
  { key: 'target',   emoji: '🎯', label: 'هدف' },
  { key: 'zap',      emoji: '⚡', label: 'سریع' },
  { key: 'star',     emoji: '⭐', label: 'برتر' },
  { key: 'shield',   emoji: '🛡', label: 'امنیت' },
  { key: 'trending', emoji: '📈', label: 'رشد' },
  { key: 'handshake',emoji: '🤝', label: 'توافق' },
  { key: 'chart',    emoji: '📊', label: 'آمار' },
  { key: 'rocket',   emoji: '🚀', label: 'رشد سریع' },
  { key: 'search',   emoji: '🔍', label: 'بررسی' },
];

function ProcessStepsEditor({
  steps, onChange,
}: { steps: ProcessStep[]; onChange: (s: ProcessStep[]) => void }) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

          {/* ── هدر کارت ── */}
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2">
              <GripVertical size={13} className="text-slate-600" />
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{ background: 'rgba(0,188,212,0.15)', color: '#00BCD4' }}>
                {i + 1}
              </span>
              <span className="text-xs text-slate-400 font-medium truncate max-w-[160px]">
                {step.title || 'مرحله جدید'}
              </span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { if (i === 0) return; const n = [...steps]; [n[i-1],n[i]]=[n[i],n[i-1]]; onChange(n); }}
                disabled={i === 0} className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20" title="انتقال به بالا">
                <ChevronUp size={12} />
              </button>
              <button onClick={() => { if (i === steps.length - 1) return; const n = [...steps]; [n[i],n[i+1]]=[n[i+1],n[i]]; onChange(n); }}
                disabled={i === steps.length - 1} className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20" title="انتقال به پایین">
                <ChevronDown size={12} />
              </button>
              <button onClick={() => onChange(steps.filter((_, j) => j !== i))}
                className="p-1 rounded text-red-400/50 hover:text-red-400" title="حذف">
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* ── فیلدها ── */}
          <div className="p-4 space-y-3">
            {/* عنوان */}
            <FieldFull
              label="عنوان مرحله"
              value={step.title}
              onChange={v => { const n = [...steps]; n[i] = { ...n[i], title: v }; onChange(n); }}
              fsValue={step.title_fs ?? 'h4'}
              onFsChange={v => { const n = [...steps]; n[i] = { ...n[i], title_fs: v }; onChange(n); }}
              alignValue={step.title_align ?? 'right'}
              onAlignChange={v => { const n = [...steps]; n[i] = { ...n[i], title_align: v }; onChange(n); }}
              placeholder="مثال: ارزیابی و آماده‌سازی"
            />

            {/* توضیح */}
            <FieldFull
              label="توضیح"
              value={step.text}
              onChange={v => { const n = [...steps]; n[i] = { ...n[i], text: v }; onChange(n); }}
              fsValue={step.text_fs ?? 'p'}
              onFsChange={v => { const n = [...steps]; n[i] = { ...n[i], text_fs: v }; onChange(n); }}
              alignValue={step.text_align ?? 'right'}
              onAlignChange={v => { const n = [...steps]; n[i] = { ...n[i], text_align: v }; onChange(n); }}
              placeholder="توضیح کوتاه این مرحله..."
              textarea
            />

            {/* انتخاب آیکون */}
            <div>
              <label className="block text-[10px] text-slate-500 mb-1.5">آیکون</label>
              <div className="flex flex-wrap gap-1.5">
                {STEP_ICON_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    title={opt.label}
                    onClick={() => { const n = [...steps]; n[i] = { ...n[i], icon: opt.key }; onChange(n); }}
                    className="w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all"
                    style={step.icon === opt.key
                      ? { background: 'rgba(0,188,212,0.2)', border: '1.5px solid rgba(0,188,212,0.5)' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    {opt.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ── دکمه افزودن ── */}
      <button
        onClick={() => onChange([...steps, { title: '', text: '', icon: 'target' }])}
        className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={14} /> افزودن مرحله جدید
      </button>
    </div>
  );
}

function ServiceCardEditor({
  cards, onChange,
}: { cards: ServiceCard[]; onChange: (s: ServiceCard[]) => void }) {
  return (
    <div className="space-y-4">
      {cards.map((card, i) => (
        <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500">پکیج {i + 1}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: card.popular ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}>
                <input type="checkbox" checked={card.popular}
                  onChange={e => { const n = [...cards]; n[i] = { ...n[i], popular: e.target.checked }; onChange(n); }}
                  className="rounded" />
                محبوب‌ترین
              </label>
              <button onClick={() => onChange(cards.filter((_, j) => j !== i))}
                className="p-1 rounded text-red-400/50 hover:text-red-400">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {/* فاز */}
          <FieldFull
            label="فاز (مثلاً: فاز اول)"
            value={card.phase}
            onChange={v => { const n = [...cards]; n[i] = { ...n[i], phase: v }; onChange(n); }}
            fsValue={card.phase_fs ?? 'h6'}
            onFsChange={v => { const n = [...cards]; n[i] = { ...n[i], phase_fs: v }; onChange(n); }}
            alignValue={card.phase_align ?? 'right'}
            onAlignChange={v => { const n = [...cards]; n[i] = { ...n[i], phase_align: v }; onChange(n); }}
            placeholder="مثلاً: فاز اول"
          />
          {/* عنوان پکیج */}
          <FieldFull
            label="عنوان پکیج"
            value={card.title}
            onChange={v => { const n = [...cards]; n[i] = { ...n[i], title: v }; onChange(n); }}
            fsValue={card.title_fs ?? 'h3'}
            onFsChange={v => { const n = [...cards]; n[i] = { ...n[i], title_fs: v }; onChange(n); }}
            alignValue={card.title_align ?? 'right'}
            onAlignChange={v => { const n = [...cards]; n[i] = { ...n[i], title_align: v }; onChange(n); }}
            placeholder="عنوان پکیج"
          />
          {/* توضیح */}
          <FieldFull
            label="توضیح"
            value={card.desc}
            onChange={v => { const n = [...cards]; n[i] = { ...n[i], desc: v }; onChange(n); }}
            fsValue={card.desc_fs ?? 'p'}
            onFsChange={v => { const n = [...cards]; n[i] = { ...n[i], desc_fs: v }; onChange(n); }}
            alignValue={card.desc_align ?? 'right'}
            onAlignChange={v => { const n = [...cards]; n[i] = { ...n[i], desc_align: v }; onChange(n); }}
            placeholder="توضیح پکیج"
            textarea
          />
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">ویژگی‌ها (هر خط یک ویژگی)</label>
            <textarea
              value={card.features.join('\n')}
              onChange={e => { const n = [...cards]; n[i] = { ...n[i], features: e.target.value.split('\n') }; onChange(n); }}
              rows={3} className={`${inputCls} resize-none`} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          {/* تراز کلی کارت */}
          <div>
            <label className="block text-[10px] text-slate-500 mb-1.5">تراز کلی کارت</label>
            <AlignPicker
              value={card.align ?? 'right'}
              onChange={v => { const n = [...cards]; n[i] = { ...n[i], align: v }; onChange(n); }}
            />
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...cards, { phase: '', title: '', desc: '', features: [], popular: false }])}
        className="w-full py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.25)' }}>
        <Plus size={13} /> افزودن پکیج
      </button>
    </div>
  );
}

function ServicePackageEditor({
  packages, onChange,
}: { packages: ServicePackage[]; onChange: (s: ServicePackage[]) => void }) {
  return (
    <div className="space-y-3">
      {packages.map((pkg, i) => (
        <div key={i} className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500">پکیج {i + 1}</span>
            <button onClick={() => onChange(packages.filter((_, j) => j !== i))}
              className="p-1 rounded text-red-400/50 hover:text-red-400">
              <Trash2 size={12} />
            </button>
          </div>
          <FieldFull
            label="عنوان پکیج"
            value={pkg.title}
            onChange={v => { const n = [...packages]; n[i] = { ...n[i], title: v }; onChange(n); }}
            fsValue={pkg.title_fs ?? 'h4'}
            onFsChange={v => { const n = [...packages]; n[i] = { ...n[i], title_fs: v }; onChange(n); }}
            alignValue={pkg.title_align ?? 'right'}
            onAlignChange={v => { const n = [...packages]; n[i] = { ...n[i], title_align: v }; onChange(n); }}
            placeholder="عنوان پکیج"
          />
          <FieldFull
            label="توضیح"
            value={pkg.description}
            onChange={v => { const n = [...packages]; n[i] = { ...n[i], description: v }; onChange(n); }}
            fsValue={pkg.description_fs ?? 'p'}
            onFsChange={v => { const n = [...packages]; n[i] = { ...n[i], description_fs: v }; onChange(n); }}
            alignValue={pkg.description_align ?? 'right'}
            onAlignChange={v => { const n = [...packages]; n[i] = { ...n[i], description_align: v }; onChange(n); }}
            placeholder="توضیح"
            textarea
          />
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">آیتم‌ها (هر خط یک مورد)</label>
            <textarea
              value={pkg.items.join('\n')}
              onChange={e => { const n = [...packages]; n[i] = { ...n[i], items: e.target.value.split('\n').filter(Boolean) }; onChange(n); }}
              rows={3} className={`${inputCls} resize-none`} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...packages, { title: '', description: '', items: [] }])}
        className="w-full py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.25)' }}>
        <Plus size={13} /> افزودن پکیج
      </button>
    </div>
  );
}

function AboutCardEditor({
  card, onChange, label,
}: { card: AboutCard; onChange: (c: AboutCard) => void; label: string }) {
  return (
    <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <span className="text-[10px] text-slate-500 font-semibold">{label}</span>
      <FieldFull
        label="عنوان"
        value={card.title}
        onChange={v => onChange({ ...card, title: v })}
        fsValue={card.title_fs ?? 'h4'}
        onFsChange={v => onChange({ ...card, title_fs: v })}
        alignValue={card.title_align ?? 'right'}
        onAlignChange={v => onChange({ ...card, title_align: v })}
        placeholder="عنوان"
      />
      <FieldFull
        label="متن"
        value={card.text}
        onChange={v => onChange({ ...card, text: v })}
        fsValue={card.text_fs ?? 'p'}
        onFsChange={v => onChange({ ...card, text_fs: v })}
        alignValue={card.text_align ?? 'right'}
        onAlignChange={v => onChange({ ...card, text_align: v })}
        placeholder="متن"
        textarea
      />
    </div>
  );
}

// ── FAQ Editor ────────────────────────────────────────────────────────────────

function FaqEditor({
  items, onChange,
}: { items: FaqItem[]; onChange: (s: FaqItem[]) => void }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

          {/* card header */}
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2">
              <GripVertical size={13} className="text-slate-600" />
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{ background: 'rgba(0,188,212,0.15)', color: '#00BCD4' }}>
                {i + 1}
              </span>
              <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
                {item.q || 'سوال جدید'}
              </span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { if (i === 0) return; const n = [...items]; [n[i-1],n[i]]=[n[i],n[i-1]]; onChange(n); }}
                disabled={i === 0} className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20" title="انتقال به بالا">
                <ChevronUp size={12} />
              </button>
              <button onClick={() => { if (i === items.length - 1) return; const n = [...items]; [n[i],n[i+1]]=[n[i+1],n[i]]; onChange(n); }}
                disabled={i === items.length - 1} className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20" title="انتقال به پایین">
                <ChevronDown size={12} />
              </button>
              <button onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="p-1 rounded text-red-400/50 hover:text-red-400" title="حذف">
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* fields */}
          <div className="p-4 space-y-3">
            <FieldFull
              label="سوال"
              value={item.q}
              onChange={v => { const n = [...items]; n[i] = { ...n[i], q: v }; onChange(n); }}
              fsValue={item.q_fs ?? 'h5'}
              onFsChange={v => { const n = [...items]; n[i] = { ...n[i], q_fs: v }; onChange(n); }}
              alignValue={item.q_align ?? 'right'}
              onAlignChange={v => { const n = [...items]; n[i] = { ...n[i], q_align: v }; onChange(n); }}
              placeholder="مثال: کپیتال نتورک چه خدماتی ارائه می‌دهد؟"
            />
            <FieldFull
              label="پاسخ"
              value={item.a}
              onChange={v => { const n = [...items]; n[i] = { ...n[i], a: v }; onChange(n); }}
              fsValue={item.a_fs ?? 'p'}
              onFsChange={v => { const n = [...items]; n[i] = { ...n[i], a_fs: v }; onChange(n); }}
              alignValue={item.a_align ?? 'right'}
              onAlignChange={v => { const n = [...items]; n[i] = { ...n[i], a_align: v }; onChange(n); }}
              placeholder="پاسخ کامل سوال را اینجا بنویسید..."
              textarea
            />
          </div>
        </div>
      ))}

      <button
        onClick={() => onChange([...items, { q: '', a: '' }])}
        className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={14} /> افزودن سوال جدید
      </button>
    </div>
  );
}

function StoryItemsEditor({
  items, onChange,
}: { items: string[]; onChange: (s: string[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={item}
            onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
            placeholder={`مورد ${i + 1}`} className={`${inputCls} flex-1`} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400">
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ''])}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.25)' }}>
        <Plus size={12} /> افزودن مورد
      </button>
    </div>
  );
}

// ── ویرایشگر کارت‌های Showcase (Founders & VCs) ──────────────────────────────
const ACCENT_PRESETS = [
  '#14b8a6', '#f59e0b', '#38bdf8', '#8b5cf6', '#10b981', '#f43f5e',
  '#a78bfa', '#06b6d4', '#34d399', '#fb923c', '#eab308', '#a3e635',
];

function ShowcaseCardEditor({
  cards, onChange, groupLabel,
}: {
  cards:       ShowcaseCardData[];
  onChange:    (c: ShowcaseCardData[]) => void;
  groupLabel:  string;
}) {
  const upd = (i: number, patch: Partial<ShowcaseCardData>) => {
    const n = [...cards];
    n[i] = { ...n[i], ...patch };
    onChange(n);
  };

  const emptyCard: ShowcaseCardData = {
    name: '', brandSlogan: '', tagline: '', badge: '', stat: '', statLabel: '',
    domain: '', backTitle: '', backDesc: '', accentColor: '#14b8a6',
  };

  return (
    <div className="space-y-3">
      {cards.map((card, i) => (
        <div key={i} className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${card.accentColor}33` }}>

          {/* ── Header row ── */}
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: card.accentColor }} />
              <span className="text-xs font-bold text-slate-300 truncate max-w-[200px]">
                {card.name || `کارت ${i + 1}`}
              </span>
              <span className="text-[10px] text-slate-500">{card.badge}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { if (i === 0) return; const n = [...cards]; [n[i-1],n[i]]=[n[i],n[i-1]]; onChange(n); }}
                disabled={i === 0} className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20" title="بالا">
                <ChevronUp size={12} />
              </button>
              <button onClick={() => { if (i === cards.length - 1) return; const n = [...cards]; [n[i],n[i+1]]=[n[i+1],n[i]]; onChange(n); }}
                disabled={i === cards.length - 1} className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20" title="پایین">
                <ChevronDown size={12} />
              </button>
              <button onClick={() => onChange(cards.filter((_, j) => j !== i))}
                className="p-1 rounded text-red-400/50 hover:text-red-400" title="حذف">
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* ── Fields ── */}
          <div className="p-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">نام شرکت / صندوق</label>
              <input value={card.name} onChange={e => upd(i, { name: e.target.value })}
                placeholder="نوآوران فینووِیو" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Brand Slogan (بالای کارت)</label>
              <input value={card.brandSlogan} onChange={e => upd(i, { brandSlogan: e.target.value })}
                placeholder="FINOWVIEW™" className={`${inputCls} font-mono`} style={{ ...inputStyle, direction: 'ltr' }} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-slate-500 mb-1">تگ‌لاین (توضیح کوتاه جلوی کارت)</label>
              <input value={card.tagline} onChange={e => upd(i, { tagline: e.target.value })}
                placeholder="پلتفرم مدیریت هوشمند دارایی..." className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Badge / دسته‌بندی</label>
              <input value={card.badge} onChange={e => upd(i, { badge: e.target.value })}
                placeholder="Fintech · Series A" className={inputCls} style={{ ...inputStyle, direction: 'ltr' }} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">حوزه کاری (Domain)</label>
              <input value={card.domain} onChange={e => upd(i, { domain: e.target.value })}
                placeholder="هوش مالی" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">آمار بزرگ (مثال: $3.2M)</label>
              <input value={card.stat} onChange={e => upd(i, { stat: e.target.value })}
                placeholder="$3.2M" className={`${inputCls} font-mono`} style={{ ...inputStyle, direction: 'ltr' }} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">برچسب زیر آمار</label>
              <input value={card.statLabel} onChange={e => upd(i, { statLabel: e.target.value })}
                placeholder="جذب سرمایه" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">عنوان پشت کارت</label>
              <input value={card.backTitle} onChange={e => upd(i, { backTitle: e.target.value })}
                placeholder="چرا به ما پیوستند؟" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">رنگ accent</label>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                {ACCENT_PRESETS.map(c => (
                  <button key={c} type="button" title={c}
                    onClick={() => upd(i, { accentColor: c })}
                    className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                    style={{
                      background: c,
                      boxShadow: card.accentColor === c ? `0 0 0 2px #111, 0 0 0 3.5px ${c}` : 'none',
                      transform: card.accentColor === c ? 'scale(1.2)' : undefined,
                    }}
                  />
                ))}
                <input type="color" value={card.accentColor}
                  onChange={e => upd(i, { accentColor: e.target.value })}
                  title="رنگ دلخواه"
                  className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent p-0"
                  style={{ outline: 'none' }}
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-slate-500 mb-1">متن پشت کارت (داستان موفقیت)</label>
              <textarea value={card.backDesc} onChange={e => upd(i, { backDesc: e.target.value })}
                placeholder="توضیح داستان موفقیت..." rows={3}
                className={`${inputCls} resize-none`} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
        </div>
      ))}

      {/* ── Add button ── */}
      <button
        onClick={() => onChange([...cards, { ...emptyCard }])}
        className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={13} /> افزودن کارت {groupLabel}
      </button>
    </div>
  );
}

// ── ویرایشگر Feature Pills بخش Hero صفحه اصلی ──────────────────────────────────
function HeroFeaturePillsEditor({
  pills, onChange,
}: { pills: Array<{ label: string; visible: boolean }>; onChange: (p: Array<{ label: string; visible: boolean }>) => void }) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= pills.length) return;
    const n = [...pills];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };

  return (
    <div className="space-y-2">
      {/* Preview row */}
      <div className="flex flex-wrap gap-1.5 p-3 rounded-xl mb-1"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[10px] text-slate-500 w-full mb-1">پیش‌نمایش تگ‌ها:</span>
        {pills.filter(p => p.visible).map((p, i) => (
          <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}>
            {p.label || '…'}
          </span>
        ))}
        {pills.filter(p => p.visible).length === 0 && (
          <span className="text-[10px] text-slate-600">هیچ تگ فعالی وجود ندارد</span>
        )}
      </div>

      {/* List of pills */}
      {pills.map((pill, i) => (
        <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${pill.visible ? 'rgba(0,188,212,0.18)' : 'rgba(255,255,255,0.05)'}` }}>

          {/* Grip icon — decorative order indicator */}
          <GripVertical size={13} className="text-slate-600 flex-shrink-0 cursor-grab" />

          {/* Visibility toggle */}
          <button
            type="button"
            onClick={() => { const n = [...pills]; n[i] = { ...n[i], visible: !n[i].visible }; onChange(n); }}
            title={pill.visible ? 'پنهان کردن' : 'نمایش دادن'}
            className="flex-shrink-0 w-8 h-4 rounded-full transition-colors relative"
            style={{ background: pill.visible ? 'rgba(0,188,212,0.35)' : 'rgba(255,255,255,0.1)', border: `1px solid ${pill.visible ? 'rgba(0,188,212,0.6)' : 'rgba(255,255,255,0.15)'}` }}>
            <span className="absolute top-0.5 rounded-full w-3 h-3 transition-all"
              style={{ background: pill.visible ? '#00BCD4' : 'rgba(255,255,255,0.3)', left: pill.visible ? '3px' : '1px' }} />
          </button>

          {/* Label input */}
          <input
            value={pill.label}
            onChange={e => { const n = [...pills]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
            placeholder={`تگ ${i + 1}`}
            className={`${inputCls} flex-1 text-xs`}
            style={{ ...inputStyle, opacity: pill.visible ? 1 : 0.45 }}
            onFocus={onFocus} onBlur={onBlur}
          />

          {/* Move up / Move down / Delete */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button onClick={() => move(i, -1)} disabled={i === 0}
              className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20" title="بالا">
              <ChevronUp size={12} />
            </button>
            <button onClick={() => move(i, 1)} disabled={i === pills.length - 1}
              className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20" title="پایین">
              <ChevronDown size={12} />
            </button>
            <button onClick={() => onChange(pills.filter((_, j) => j !== i))}
              className="p-1 rounded text-red-400/50 hover:text-red-400" title="حذف">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}

      {/* Add new pill */}
      <button
        type="button"
        onClick={() => onChange([...pills, { label: '', visible: true }])}
        className="w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={13} /> افزودن تگ جدید
      </button>
    </div>
  );
}


// ── آیکون‌های قابل انتخاب برای سکشن‌های درباره ما ─────────────────────────────
const ABOUT_ICON_OPTIONS: Array<{ key: string; label: string; node: React.ReactNode }> = [
  { key: 'target',   label: 'هدف',       node: <Target size={14} /> },
  { key: 'users',    label: 'تیم',       node: <Users size={14} /> },
  { key: 'trending', label: 'رشد',       node: <TrendingUp size={14} /> },
  { key: 'briefcase',label: 'کسب‌وکار',  node: <Briefcase size={14} /> },
  { key: 'shield',   label: 'امنیت',     node: <Shield size={14} /> },
  { key: 'star',     label: 'ستاره',     node: <Star size={14} /> },
  { key: 'check',    label: 'تأیید',     node: <CheckCircle2 size={14} /> },
  { key: 'book',     label: 'مطالعه',    node: <BookOpen size={14} /> },
  { key: 'message',  label: 'پیام',      node: <MessageSquare size={14} /> },
  { key: 'globe',    label: 'جهانی',     node: <Globe size={14} /> },
];

const CONTACT_ICON_OPTIONS: Array<{ key: string; label: string; node: React.ReactNode }> = [
  { key: 'clock',   label: 'زمان',      node: <Clock size={14} /> },
  { key: 'check',   label: 'تأیید',     node: <CheckCircle2 size={14} /> },
  { key: 'shield',  label: 'امنیت',     node: <Shield size={14} /> },
  { key: 'users',   label: 'تیم',       node: <Users size={14} /> },
  { key: 'zap',     label: 'سریع',      node: <Zap size={14} /> },
  { key: 'phone',   label: 'تلفن',      node: <Phone size={14} /> },
  { key: 'message', label: 'پیام',      node: <MessageSquare size={14} /> },
  { key: 'star',    label: 'ستاره',     node: <Star size={14} /> },
];

const COLOR_PRESETS = [
  '#00BCD4','#22c55e','#a78bfa','#f59e0b','#ef4444','#3b82f6',
  '#10b981','#f43f5e','#8b5cf6','#06b6d4','#34d399','#fb923c',
];

// ── ویرایشگر پاراگراف‌های یک سکشن ──────────────────────────────────────────
function ParagraphsEditor({
  paragraphs, onChange,
}: { paragraphs: AboutPageParagraph[]; onChange: (p: AboutPageParagraph[]) => void }) {
  const genId = () => `p-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
          پاراگراف‌ها ({paragraphs.length})
        </span>
      </div>
      <AnimatePresence initial={false}>
        {paragraphs.map((para, i) => (
          <motion.div
            key={para.id}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: para.visible ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
              border: `1px solid ${para.visible ? 'rgba(0,188,212,0.15)' : 'rgba(255,255,255,0.05)'}`,
              opacity: para.visible ? 1 : 0.5,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2">
                <GripVertical size={12} className="text-slate-600" />
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                  style={{ background: 'rgba(0,188,212,0.15)', color: '#00BCD4' }}>{i + 1}</span>
                <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {para.text.slice(0, 40) || 'پاراگراف جدید'}…
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                {/* toggle visibility */}
                <button type="button"
                  onClick={() => { const n = [...paragraphs]; n[i] = { ...n[i], visible: !n[i].visible }; onChange(n); }}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: para.visible ? '#00BCD4' : 'rgba(255,255,255,0.25)' }}
                  title={para.visible ? 'پنهان کردن' : 'نمایش دادن'}>
                  {para.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button onClick={() => { if (i === 0) return; const n = [...paragraphs]; [n[i-1],n[i]]=[n[i],n[i-1]]; onChange(n); }}
                  disabled={i === 0} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 disabled:opacity-20">
                  <ChevronUp size={12} />
                </button>
                <button onClick={() => { if (i === paragraphs.length - 1) return; const n = [...paragraphs]; [n[i],n[i+1]]=[n[i+1],n[i]]; onChange(n); }}
                  disabled={i === paragraphs.length - 1} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 disabled:opacity-20">
                  <ChevronDown size={12} />
                </button>
                <button onClick={() => onChange(paragraphs.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            {/* Textarea */}
            <div className="px-3 py-2.5">
              <textarea
                value={para.text}
                onChange={e => { const n = [...paragraphs]; n[i] = { ...n[i], text: e.target.value }; onChange(n); }}
                rows={3}
                className={`${inputCls} resize-none text-sm`}
                style={inputStyle}
                onFocus={onFocus} onBlur={onBlur}
                placeholder="متن پاراگراف را اینجا بنویسید..."
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <button
        onClick={() => onChange([...paragraphs, { id: genId(), text: '', visible: true }])}
        className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={13} /> افزودن پاراگراف جدید
      </button>
    </div>
  );
}

// ── ویرایشگر سکشن‌های صفحه درباره ما ────────────────────────────────────────
function AboutSectionsEditor({
  sections, onChange,
}: { sections: AboutPageSection[]; onChange: (s: AboutPageSection[]) => void }) {
  const [expanded, setExpanded] = useState<string | null>(sections[0]?.id ?? null);
  const genId = () => `sec-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {sections.map((sec, i) => {
          const isOpen = expanded === sec.id;
          return (
            <motion.div
              key={sec.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${sec.visible ? (sec.accent ? 'rgba(245,158,11,0.2)' : 'rgba(0,188,212,0.2)') : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {/* ── Card header ── */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer group"
                style={{ background: isOpen ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                onClick={() => setExpanded(isOpen ? null : sec.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* drag handle */}
                  <GripVertical size={14} className="text-slate-600 flex-shrink-0" />
                  {/* visibility badge */}
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: sec.visible ? (sec.accent ? '#f59e0b' : '#00BCD4') : 'rgba(255,255,255,0.2)' }}
                  />
                  {/* icon */}
                  <span className="flex-shrink-0 text-slate-400">
                    {ABOUT_ICON_OPTIONS.find(o => o.key === sec.icon)?.node ?? <AlignLeft size={14} />}
                  </span>
                  {/* title */}
                  <span className={`text-sm font-semibold truncate ${sec.visible ? 'text-white' : 'text-slate-500'}`}>
                    {sec.title || 'سکشن بدون عنوان'}
                  </span>
                  <span className="text-[10px] text-slate-600 flex-shrink-0">
                    ({sec.paragraphs.filter(p => p.visible).length} پاراگراف)
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* visibility toggle */}
                  <button type="button"
                    onClick={e => { e.stopPropagation(); const n = [...sections]; n[i] = { ...n[i], visible: !n[i].visible }; onChange(n); }}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: sec.visible ? '#00BCD4' : 'rgba(255,255,255,0.25)' }}
                    title={sec.visible ? 'پنهان کردن' : 'نمایش'}>
                    {sec.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  {/* move up/down */}
                  <button onClick={e => { e.stopPropagation(); if (i === 0) return; const n = [...sections]; [n[i-1],n[i]]=[n[i],n[i-1]]; onChange(n); }}
                    disabled={i === 0} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 disabled:opacity-20">
                    <ChevronUp size={13} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); if (i === sections.length - 1) return; const n = [...sections]; [n[i],n[i+1]]=[n[i+1],n[i]]; onChange(n); }}
                    disabled={i === sections.length - 1} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 disabled:opacity-20">
                    <ChevronDown size={13} />
                  </button>
                  {/* delete */}
                  <button onClick={e => { e.stopPropagation(); onChange(sections.filter((_, j) => j !== i)); }}
                    className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                  {/* expand arrow */}
                  <span className="text-slate-500 text-xs ml-1 transition-transform duration-200"
                    style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▾
                  </span>
                </div>
              </div>

              {/* ── Card body ── */}
              {isOpen && (
                <div className="px-4 pb-4 pt-2 space-y-4"
                  style={{ borderTop: `1px solid ${sec.accent ? 'rgba(245,158,11,0.12)' : 'rgba(0,188,212,0.1)'}` }}>

                  {/* عنوان سکشن */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">عنوان سکشن</label>
                    <input
                      value={sec.title}
                      onChange={e => { const n = [...sections]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }}
                      className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                      placeholder="عنوان سکشن را بنویسید..."
                    />
                  </div>

                  {/* آیکون + رنگ accent */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-2">آیکون سکشن</label>
                      <div className="flex flex-wrap gap-1.5">
                        {ABOUT_ICON_OPTIONS.map(opt => (
                          <button key={opt.key} type="button" title={opt.label}
                            onClick={() => { const n = [...sections]; n[i] = { ...n[i], icon: opt.key }; onChange(n); }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                            style={sec.icon === opt.key
                              ? { background: 'rgba(0,188,212,0.2)', border: '1.5px solid rgba(0,188,212,0.5)', color: '#00BCD4' }
                              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }
                            }>
                            {opt.node}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-2">رنگ سکشن</label>
                      <div className="flex gap-3">
                        <button type="button"
                          onClick={() => { const n = [...sections]; n[i] = { ...n[i], accent: false }; onChange(n); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={!sec.accent
                            ? { background: 'rgba(0,188,212,0.15)', border: '1px solid rgba(0,188,212,0.4)', color: '#00BCD4' }
                            : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }
                          }>
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> آبی
                        </button>
                        <button type="button"
                          onClick={() => { const n = [...sections]; n[i] = { ...n[i], accent: true }; onChange(n); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={sec.accent
                            ? { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }
                            : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }
                          }>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> طلایی
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quote Box */}
                  <div className="rounded-xl p-3 space-y-2"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-slate-400">Quote Box (اختیاری)</span>
                      <span className="text-[10px] text-slate-600">— نمایش یک جمله برجسته در کادر</span>
                    </div>
                    <textarea
                      value={sec.quoteText ?? ''}
                      onChange={e => { const n = [...sections]; n[i] = { ...n[i], quoteText: e.target.value }; onChange(n); }}
                      rows={2}
                      className={`${inputCls} resize-none text-sm`}
                      style={inputStyle}
                      onFocus={onFocus} onBlur={onBlur}
                      placeholder="جمله‌ای که می‌خواهید در کادر رنگی نمایش داده شود (خالی بگذارید = نمایش نمی‌شود)"
                    />
                    {sec.quoteText && (
                      <div className="flex gap-2">
                        <button type="button"
                          onClick={() => { const n = [...sections]; n[i] = { ...n[i], quoteAccent: false }; onChange(n); }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                          style={!sec.quoteAccent
                            ? { background: 'rgba(0,188,212,0.15)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.3)' }
                            : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
                          }>
                          رنگ آبی
                        </button>
                        <button type="button"
                          onClick={() => { const n = [...sections]; n[i] = { ...n[i], quoteAccent: true }; onChange(n); }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                          style={sec.quoteAccent
                            ? { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }
                            : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
                          }>
                          رنگ طلایی
                        </button>
                      </div>
                    )}
                  </div>

                  {/* پاراگراف‌ها */}
                  <ParagraphsEditor
                    paragraphs={sec.paragraphs}
                    onChange={paras => { const n = [...sections]; n[i] = { ...n[i], paragraphs: paras }; onChange(n); }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* دکمه افزودن سکشن جدید */}
      <button
        onClick={() => {
          const newSec: AboutPageSection = {
            id: genId(), title: '', icon: 'target', accent: false, visible: true, paragraphs: [],
          };
          onChange([...sections, newSec]);
          setExpanded(newSec.id);
        }}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={15} /> افزودن سکشن جدید
      </button>
    </div>
  );
}

// ── ویرایشگر تیم — برای صفحه درباره ما ──────────────────────────────────────
function AboutTeamEditor({
  members, onChange,
}: { members: TeamMemberFull[]; onChange: (m: TeamMemberFull[]) => void }) {
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const genId = () => `tm-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

  const handleAvatarUpload = async (i: number, file: File) => {
    setUploading(i);
    const result = await uploadImage(file, 'webp');
    setUploading(null);
    if (result) {
      const n = [...members]; n[i] = { ...n[i], avatar: result.url }; onChange(n);
    }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {members.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${m.visible ? 'rgba(0,188,212,0.18)' : 'rgba(255,255,255,0.06)'}`,
              opacity: m.visible ? 1 : 0.55,
            }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <GripVertical size={13} className="text-slate-600" />
                {m.avatar ? (
                  <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#00BCD4,#00838F)' }}>
                    {m.name?.[0] ?? '?'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-white">{m.name || 'عضو جدید تیم'}</p>
                  <p className="text-[11px] text-cyan-400">{m.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button"
                  onClick={() => { const n = [...members]; n[i] = { ...n[i], visible: !n[i].visible }; onChange(n); }}
                  className="p-1.5 rounded-lg"
                  style={{ color: m.visible ? '#00BCD4' : 'rgba(255,255,255,0.25)' }}>
                  {m.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button onClick={() => { if (i === 0) return; const n = [...members]; [n[i-1],n[i]]=[n[i],n[i-1]]; onChange(n); }}
                  disabled={i === 0} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 disabled:opacity-20">
                  <ChevronUp size={13} />
                </button>
                <button onClick={() => { if (i === members.length - 1) return; const n = [...members]; [n[i],n[i+1]]=[n[i+1],n[i]]; onChange(n); }}
                  disabled={i === members.length - 1} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 disabled:opacity-20">
                  <ChevronDown size={13} />
                </button>
                <button onClick={() => onChange(members.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* fields */}
            <div className="p-4 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1.5">نام کامل *</label>
                  <input value={m.name}
                    onChange={e => { const n = [...members]; n[i] = { ...n[i], name: e.target.value }; onChange(n); }}
                    className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                    placeholder="دکتر حامد مهدی‌زاده" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1.5">سمت / نقش *</label>
                  <input value={m.role}
                    onChange={e => { const n = [...members]; n[i] = { ...n[i], role: e.target.value }; onChange(n); }}
                    className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                    placeholder="Capital Strategist" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1.5">بیوگرافی کوتاه</label>
                <textarea value={m.bio}
                  onChange={e => { const n = [...members]; n[i] = { ...n[i], bio: e.target.value }; onChange(n); }}
                  rows={2} className={`${inputCls} resize-none`} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  placeholder="توضیح مختصر درباره این عضو تیم..." />
              </div>

              {/* avatar upload */}
              <div>
                <label className="block text-[11px] text-slate-500 mb-1.5">تصویر پروفایل</label>
                <div className="flex items-center gap-3">
                  {m.avatar ? (
                    <div className="relative flex-shrink-0">
                      <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-xl object-cover" />
                      <button
                        onClick={() => { const n = [...members]; n[i] = { ...n[i], avatar: undefined }; onChange(n); }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
                        style={{ background: '#ef4444', border: '1.5px solid #07111e' }}>
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)' }}>
                      <Image size={18} className="text-slate-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={el => { fileRefs.current[i] = el; }}
                      type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(i, f); }}
                    />
                    <button type="button"
                      onClick={() => fileRefs.current[i]?.click()}
                      disabled={uploading === i}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: 'rgba(0,188,212,0.1)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }}>
                      {uploading === i
                        ? <><span className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" /> آپلود...</>
                        : <><Upload size={13} /> آپلود تصویر</>
                      }
                    </button>
                    <p className="text-[10px] text-slate-600 mt-1">PNG, JPG, WebP — حداکثر ۵ مگابایت</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={() => onChange([...members, { id: genId(), name: '', role: '', bio: '', visible: true }])}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={15} /> افزودن عضو جدید تیم
      </button>
    </div>
  );
}

// ── ویرایشگر آیتم‌های آماری تماس ─────────────────────────────────────────────
function ContactStatsEditor({
  items, onChange,
}: { items: ContactStatItem[]; onChange: (s: ContactStatItem[]) => void }) {
  const genId = () => `csi-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.id}
          className="rounded-xl p-3 flex items-start gap-3"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${item.visible ? `${item.color}25` : 'rgba(255,255,255,0.05)'}`,
            opacity: item.visible ? 1 : 0.5,
          }}>
          {/* color dot */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
            <span style={{ color: item.color }}>
              {CONTACT_ICON_OPTIONS.find(o => o.key === item.icon)?.node ?? <CheckCircle2 size={14} />}
            </span>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">برچسب</label>
              <input value={item.label}
                onChange={e => { const n = [...items]; n[i] = { ...n[i], label: e.target.value }; onChange(n); }}
                className={`${inputCls} text-xs`} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                placeholder="زمان پاسخ" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">مقدار</label>
              <input value={item.value}
                onChange={e => { const n = [...items]; n[i] = { ...n[i], value: e.target.value }; onChange(n); }}
                className={`${inputCls} text-xs`} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                placeholder="۲۴ ساعت" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {/* visibility */}
            <button type="button"
              onClick={() => { const n = [...items]; n[i] = { ...n[i], visible: !n[i].visible }; onChange(n); }}
              className="p-1.5 rounded-lg" style={{ color: item.visible ? '#00BCD4' : 'rgba(255,255,255,0.25)' }}>
              {item.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400">
              <Trash2 size={12} />
            </button>
          </div>

          {/* آیکون */}
          <div className="flex-shrink-0">
            <label className="block text-[10px] text-slate-500 mb-1">آیکون</label>
            <div className="flex flex-wrap gap-1">
              {CONTACT_ICON_OPTIONS.map(opt => (
                <button key={opt.key} type="button" title={opt.label}
                  onClick={() => { const n = [...items]; n[i] = { ...n[i], icon: opt.key }; onChange(n); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={item.icon === opt.key
                    ? { background: `${item.color}25`, border: `1.5px solid ${item.color}80`, color: item.color }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                  }>
                  {opt.node}
                </button>
              ))}
            </div>
            {/* color picker */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {COLOR_PRESETS.map(c => (
                <button key={c} type="button" title={c}
                  onClick={() => { const n = [...items]; n[i] = { ...n[i], color: c }; onChange(n); }}
                  className="w-4 h-4 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: c,
                    boxShadow: item.color === c ? `0 0 0 1.5px #07111e, 0 0 0 3px ${c}` : 'none',
                    transform: item.color === c ? 'scale(1.2)' : undefined,
                  }} />
              ))}
              <input type="color" value={item.color}
                onChange={e => { const n = [...items]; n[i] = { ...n[i], color: e.target.value }; onChange(n); }}
                className="w-4 h-4 rounded-full cursor-pointer border-0 bg-transparent p-0" />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => onChange([...items, { id: genId(), icon: 'check', label: '', value: '', color: '#00BCD4', visible: true }])}
        className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={13} /> افزودن آیتم آماری
      </button>
    </div>
  );
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
// CMS صفحه درباره ما
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
function AboutPageCMS({
  settings, set,
}: {
  settings: SiteSettings;
  set: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* ── نوار اطلاعات بالا ── */}
      <div className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg,rgba(0,188,212,0.08),rgba(99,102,241,0.05))', border: '1px solid rgba(0,188,212,0.18)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(0,188,212,0.15)', border: '1px solid rgba(0,188,212,0.3)' }}>
          <Users size={18} style={{ color: '#00BCD4' }} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">CMS صفحه «درباره ما»</p>
          <p className="text-xs text-slate-400 mt-0.5">ویرایش کامل تمام متون، سکشن‌ها، تیم، عکس‌ها و ساختار صفحه — صفر تا صد</p>
        </div>
      </div>

      {/* ── Hero ── */}
      <SectionCard title="🏠 Hero — عنوان و توضیح">
        <FieldFull label="عنوان اصلی صفحه" value={settings.about_hero_title}
          onChange={v => set('about_hero_title', v)} placeholder="درباره کپیتال نتورک"
          fsValue={settings.about_hero_title_fs} onFsChange={v => set('about_hero_title_fs', v)}
          alignValue={settings.about_hero_title_align} onAlignChange={v => set('about_hero_title_align', v)} />
        <FieldFull label="توضیح زیر عنوان" value={settings.about_hero_desc}
          onChange={v => set('about_hero_desc', v)} textarea
          fsValue={settings.about_hero_desc_fs} onFsChange={v => set('about_hero_desc_fs', v)}
          alignValue={settings.about_hero_desc_align} onAlignChange={v => set('about_hero_desc_align', v)} />
      </SectionCard>

      {/* ── پاراگراف‌های مقدمه ── */}
      <SectionCard title="📝 پاراگراف‌های مقدمه صفحه (بخش اول)">
        <p className="text-xs text-slate-500 -mt-1 mb-3">
          این پاراگراف‌ها مستقیماً زیر عنوان اصلی نمایش داده می‌شوند و معرفی کلی سازمان هستند.
          هر پاراگراف قابل حذف، اضافه، جابجایی و پنهان‌کردن است.
        </p>
        <ParagraphsEditor
          paragraphs={settings.about_intro_paragraphs ?? []}
          onChange={v => set('about_intro_paragraphs', v)}
        />
      </SectionCard>

      {/* ── سکشن‌های کامل صفحه ── */}
      <SectionCard title="📚 سکشن‌های صفحه درباره ما — ویرایش کامل">
        <p className="text-xs text-slate-500 -mt-1 mb-4">
          هر سکشن شامل عنوان، آیکون، رنگ، quote box اختیاری و پاراگراف‌های قابل ویرایش است.
          می‌توانید ترتیب سکشن‌ها را تغییر دهید، سکشن جدید اضافه کنید یا سکشن‌ها را پنهان کنید.
        </p>
        <AboutSectionsEditor
          sections={settings.about_page_sections ?? []}
          onChange={v => set('about_page_sections', v)}
        />
      </SectionCard>

      {/* ── تیم ── */}
      <SectionCard title="👥 اعضای تیم — ویرایش کامل" defaultOpen={false}>
        <p className="text-xs text-slate-500 -mt-1 mb-4">
          اعضای تیم که در صفحه «درباره ما» نمایش داده می‌شوند. می‌توانید تصویر، نام، سمت و بیوگرافی هر عضو را ویرایش کنید.
        </p>
        <AboutTeamEditor
          members={settings.about_page_team ?? []}
          onChange={v => set('about_page_team', v)}
        />
        <div className="mt-3 rounded-xl px-3 py-2.5 flex items-start gap-2"
          style={{ background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.12)' }}>
          <span className="text-teal-400 text-xs mt-0.5">💡</span>
          <p className="text-xs text-slate-400">
            تیم بالا (<strong className="text-teal-300">about_page_team</strong>) ویژه صفحه «درباره ما» است.
            تیم قدیمی در «تنظیمات سایت ← تیم» همچنان برای بخش‌های دیگر سایت در دسترس است.
          </p>
        </div>
      </SectionCard>

      {/* ── Section Builder اضافی ── */}
      <div className="rounded-2xl p-5 space-y-3"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(167,139,250,0.15)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-purple-400 text-base">🧩</span>
          <div>
            <h3 className="text-sm font-bold text-purple-300">Section Builder — سکشن‌های اضافی پویا</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              سکشن‌های دینامیک اضافی در انتهای صفحه درباره ما. از heading، text، card، step، image، video و... استفاده کنید.
            </p>
          </div>
        </div>
        <PageSectionBuilder
          sections={settings.about_sections}
          onChange={v => set('about_sections', v)}
          pageLabel="درباره ما"
        />
      </div>

    </motion.div>
  );
}

// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
// CMS صفحه تماس با ما
// ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
function ContactPageCMS({
  settings, set,
}: {
  settings: SiteSettings;
  set: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* ── نوار اطلاعات بالا ── */}
      <div className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(251,191,36,0.04))', border: '1px solid rgba(245,158,11,0.18)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <Phone size={18} style={{ color: '#f59e0b' }} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">CMS صفحه «تماس با ما»</p>
          <p className="text-xs text-slate-400 mt-0.5">ویرایش کامل عنوان، آمار، اطلاعات تماس و فرم ارسال پیام — صفر تا صد</p>
        </div>
      </div>

      {/* ── Hero ── */}
      <SectionCard title="🏠 Hero — عنوان و توضیح">
        <FieldFull label="عنوان اصلی صفحه" value={settings.contact_hero_title}
          onChange={v => set('contact_hero_title', v)} placeholder="با ما در تماس باشید"
          fsValue={settings.contact_hero_title_fs} onFsChange={v => set('contact_hero_title_fs', v)}
          alignValue={settings.contact_hero_title_align} onAlignChange={v => set('contact_hero_title_align', v)} />
        <FieldFull label="توضیح زیر عنوان" value={settings.contact_hero_desc}
          onChange={v => set('contact_hero_desc', v)} textarea
          fsValue={settings.contact_hero_desc_fs} onFsChange={v => set('contact_hero_desc_fs', v)}
          alignValue={settings.contact_hero_desc_align} onAlignChange={v => set('contact_hero_desc_align', v)} />
      </SectionCard>

      {/* ── آیتم‌های آماری نوار بالا ── */}
      <SectionCard title="📊 کارت‌های آماری — نوار زیر عنوان">
        <p className="text-xs text-slate-500 -mt-1 mb-3">
          ۴ کارت آماری که زیر عنوان صفحه نمایش داده می‌شوند (زمان پاسخ، مشاوره رایگان، محرمانگی، تیم). هر کارت قابل ویرایش، حذف، اضافه و پنهان‌کردن است.
        </p>
        <ContactStatsEditor
          items={settings.contact_stat_items ?? []}
          onChange={v => set('contact_stat_items', v)}
        />
      </SectionCard>

      {/* ── اطلاعات تماس ── */}
      <SectionCard title="📞 اطلاعات تماس — ایمیل، تلفن، واتساپ، ساعات کاری">
        <p className="text-xs text-slate-500 -mt-1 mb-3">
          این اطلاعات در کارت «اطلاعات تماس» سمت چپ صفحه نمایش داده می‌شوند.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-500 mb-1.5">ایمیل</label>
            <input value={settings.contact_email}
              onChange={e => set('contact_email', e.target.value)}
              className={`${inputCls} text-sm`} style={{ ...inputStyle, direction: 'ltr' }}
              onFocus={onFocus} onBlur={onBlur} placeholder="invest@capitalnetwork.ir" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1.5">تلفن</label>
            <input value={settings.contact_phone}
              onChange={e => set('contact_phone', e.target.value)}
              className={`${inputCls} text-sm`} style={{ ...inputStyle, direction: 'ltr' }}
              onFocus={onFocus} onBlur={onBlur} placeholder="+98 21 1234 5678" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1.5">واتساپ</label>
            <input value={settings.contact_whatsapp}
              onChange={e => set('contact_whatsapp', e.target.value)}
              className={`${inputCls} text-sm`} style={{ ...inputStyle, direction: 'ltr' }}
              onFocus={onFocus} onBlur={onBlur} placeholder="+98 912 000 0000" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1.5">ساعات کاری</label>
            <input value={settings.working_hours}
              onChange={e => set('working_hours', e.target.value)}
              className={`${inputCls} text-sm`} style={inputStyle}
              onFocus={onFocus} onBlur={onBlur} placeholder="شنبه تا چهارشنبه: ۹ صبح تا ۶ عصر" />
          </div>
        </div>
      </SectionCard>

      {/* ── شبکه‌های اجتماعی ── */}
      <SectionCard title="🔗 شبکه‌های اجتماعی" defaultOpen={false}>
        <p className="text-xs text-slate-500 -mt-1 mb-3">
          لینک‌های شبکه‌های اجتماعی که در بخش تماس نمایش داده می‌شوند. خالی گذاشتن = پنهان می‌شود.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'social_twitter',   label: 'توییتر / X',   placeholder: 'https://twitter.com/...' },
            { key: 'social_linkedin',  label: 'لینکدین',       placeholder: 'https://linkedin.com/...' },
            { key: 'social_instagram', label: 'اینستاگرام',    placeholder: 'https://instagram.com/...' },
            { key: 'social_youtube',   label: 'یوتیوب',         placeholder: 'https://youtube.com/...' },
          ] as Array<{ key: keyof SiteSettings; label: string; placeholder: string }>).map(({ key, label, placeholder }) => (
            <div key={String(key)}>
              <label className="block text-[11px] text-slate-500 mb-1.5">{label}</label>
              <input value={String(settings[key] ?? '')}
                onChange={e => set(key, e.target.value as SiteSettings[typeof key])}
                className={`${inputCls} text-xs`} style={{ ...inputStyle, direction: 'ltr' }}
                onFocus={onFocus} onBlur={onBlur} placeholder={placeholder} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Section Builder اضافی ── */}
      <div className="rounded-2xl p-5 space-y-3"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(167,139,250,0.15)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-purple-400 text-base">🧩</span>
          <div>
            <h3 className="text-sm font-bold text-purple-300">Section Builder — سکشن‌های اضافی پویا</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              سکشن‌های دینامیک اضافی در انتهای صفحه تماس با ما.
            </p>
          </div>
        </div>
        <PageSectionBuilder
          sections={settings.contact_sections}
          onChange={v => set('contact_sections', v)}
          pageLabel="تماس با ما"
        />
      </div>

    </motion.div>
  );
}


// ── کامپوننت اصلی — v2 (blog-preview + faq tabs) ───────────────────────────────
export default function AdminPageContentPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('home');

  useEffect(() => {
    let cancelled = false;

    const finalize = (value: SiteSettings | null, message?: string) => {
      if (!cancelled) {
        setSettings(value ?? { ...DEFAULT_SETTINGS });
        setError(message ?? '');
        setLoading(false);
      }
    };

    const loadSettings = async () => {
      try {
        const s = await Promise.race([
          fetchSettings(),
          new Promise<SiteSettings>((resolve) => {
            window.setTimeout(() => resolve({ ...DEFAULT_SETTINGS }), 4000);
          }),
        ]);

        if (!s || typeof s !== 'object') {
          finalize(null, 'بارگذاری تنظیمات با خطا مواجه شد. از حالت پیش‌فرض استفاده شد.');
          return;
        }

        finalize(s);
      } catch (err) {
        console.error('[AdminPageContentPage] failed to load settings', err);
        finalize(null, 'بارگذاری تنظیمات با خطا مواجه شد. از حالت پیش‌فرض استفاده شد.');
      }
    };

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    const ok = await saveSettings(settings);
    setSaving(false);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    else     { setError('خطا در ذخیره‌سازی — لطفاً دوباره تلاش کنید'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="w-7 h-7 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }
  if (!settings) return null;

  return (
    <div className="space-y-5 max-w-3xl" dir="rtl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">مدیریت محتوای صفحات</h1>
          <p className="text-sm text-slate-400 mt-0.5">ویرایش متون، عناوین، بلاگ و سوالات متداول هر صفحه سایت</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
          style={{
            background: saved ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #00BCD4, #00838F)',
            color: saved ? '#22c55e' : '#fff',
            border: saved ? '1px solid rgba(34,197,94,0.4)' : 'none',
          }}>
          {saving
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save size={14} />}
          {saving ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : 'ذخیره همه تغییرات'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm text-red-300"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
          {error}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={activeTab === tab.id
              ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* تب: صفحه اصلی                                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'home' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

          {/* ── Hero ── */}
          <SectionCard title="🏠 Hero — متن و دکمه‌ها">
            <Field label="متن Badge (نشان سبز رنگ)" value={settings.home_hero_badge}
              onChange={v => set('home_hero_badge', v)} placeholder="متصل مستقیم به VC‌های Tier-1" />
            <FieldFull label="عنوان اصلی" value={settings.home_hero_title}
              onChange={v => set('home_hero_title', v)} placeholder="کپیتال نتورک"
              fsValue={settings.home_hero_title_fs} onFsChange={v => set('home_hero_title_fs', v)}
              alignValue={settings.home_hero_title_align} onAlignChange={v => set('home_hero_title_align', v)} />
            <FieldFull label="تگ‌لاین (زیر عنوان)" value={settings.home_hero_tagline}
              onChange={v => set('home_hero_tagline', v)} placeholder="سرمایه‌گذاری درست، در زمان درست"
              fsValue={settings.home_hero_tagline_fs} onFsChange={v => set('home_hero_tagline_fs', v)}
              alignValue={settings.home_hero_tagline_align} onAlignChange={v => set('home_hero_tagline_align', v)} />
            <FieldFull label="توضیح اصلی" value={settings.home_hero_desc}
              onChange={v => set('home_hero_desc', v)} textarea
              fsValue={settings.home_hero_desc_fs} onFsChange={v => set('home_hero_desc_fs', v)}
              alignValue={settings.home_hero_desc_align} onAlignChange={v => set('home_hero_desc_align', v)} />
            <div className="space-y-3">
              <Field label="متن دکمه اول (CTA)" value={settings.home_hero_cta1}
                onChange={v => set('home_hero_cta1', v)} />
              <Field label="متن دکمه دوم" value={settings.home_hero_cta2}
                onChange={v => set('home_hero_cta2', v)} />
            </div>

            {/* ── Feature Pills ── */}
            <div>
              <label className="block text-xs text-slate-400 mb-2 mt-1">
                تگ‌های ویژگی (Feature Pills)
                <span className="text-slate-600 font-normal mr-1.5">— تگ‌هایی که زیر توضیح اصلی نمایش داده می‌شوند</span>
              </label>
              <HeroFeaturePillsEditor
                pills={settings.home_hero_feature_pills}
                onChange={v => set('home_hero_feature_pills', v)}
              />
            </div>
          </SectionCard>

          {/* ── GlobalNetwork ── */}
          <SectionCard title="🌍 شبکه جهانی سرمایه‌گذاران — عنوان و آمار" defaultOpen={false}>
            <p className="text-xs text-slate-500 -mt-2 mb-3">
              عنوان بخش «شبکه جهانی» و سه کارت آماری پایین آن در صفحه اصلی.
            </p>
            <FieldFull label="عنوان" value={settings.home_network_title}
              onChange={v => set('home_network_title', v)} placeholder="شبکه جهانی سرمایه‌گذاران"
              fsValue={settings.home_network_title_fs} onFsChange={v => set('home_network_title_fs', v)}
              alignValue={settings.home_network_title_align} onAlignChange={v => set('home_network_title_align', v)} />
            <FieldFull label="توضیح زیر عنوان" value={settings.home_network_desc}
              onChange={v => set('home_network_desc', v)}
              placeholder="دسترسی مستقیم به سرمایه‌گذاران Tier-1 در 5 قاره"
              fsValue={settings.home_network_desc_fs} onFsChange={v => set('home_network_desc_fs', v)}
              alignValue={settings.home_network_desc_align} onAlignChange={v => set('home_network_desc_align', v)} />
            <div>
              <label className="block text-xs text-slate-400 mb-2">آمارهای کارتی (۳ عدد)</label>
              <StatEditor stats={settings.home_network_stats}
                onChange={v => set('home_network_stats', v)} />
            </div>
          </SectionCard>

          {/* ── Services section header + Cards ── */}
          <SectionCard title="🔧 عنوان بخش «خدمات» (Services)">
            <Field label="متن Badge" value={settings.home_services_badge}
              onChange={v => set('home_services_badge', v)} placeholder="خدمات" />
            <FieldFull label="عنوان اصلی بخش" value={settings.home_services_title}
              onChange={v => set('home_services_title', v)} placeholder="از آماده‌سازی تا بستن راند"
              fsValue={settings.home_services_title_fs} onFsChange={v => set('home_services_title_fs', v)}
              alignValue={settings.home_services_title_align} onAlignChange={v => set('home_services_title_align', v)} />
            <FieldFull label="توضیح زیر عنوان" value={settings.home_services_desc}
              onChange={v => set('home_services_desc', v)} textarea placeholder="ما فقط معرفی نمی‌زنیم..."
              fsValue={settings.home_services_desc_fs} onFsChange={v => set('home_services_desc_fs', v)}
              alignValue={settings.home_services_desc_align} onAlignChange={v => set('home_services_desc_align', v)} />
            
            {/* جدا کننده */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1.5rem -1.25rem 0' }} />
            
            {/* کارت‌های 3‌گانه */}
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(0,188,212,0.6)' }}>📦 سه کارت خدمات</p>
              <ServiceCardEditor cards={settings.services_cards}
                onChange={v => set('services_cards', v)} />
            </div>
          </SectionCard>

          {/* ── WhyUs section header ── */}
          <SectionCard title="✅ عنوان بخش «چرا ما» (WhyUs)" defaultOpen={false}>
            <Field label="متن Badge" value={settings.home_why_us_badge}
              onChange={v => set('home_why_us_badge', v)} placeholder="چرا کپیتال نتورک؟" />
            <FieldFull label="عنوان اصلی بخش" value={settings.home_why_us_title}
              onChange={v => set('home_why_us_title', v)} placeholder="متفاوت از هر چیزی که دیده‌اید"
              fsValue={settings.home_why_us_title_fs} onFsChange={v => set('home_why_us_title_fs', v)}
              alignValue={settings.home_why_us_title_align} onAlignChange={v => set('home_why_us_title_align', v)} />
            <FieldFull label="توضیح زیر عنوان" value={settings.home_why_us_desc}
              onChange={v => set('home_why_us_desc', v)} textarea placeholder="ما یک پل هستیم..."
              fsValue={settings.home_why_us_desc_fs} onFsChange={v => set('home_why_us_desc_fs', v)}
              alignValue={settings.home_why_us_desc_align} onAlignChange={v => set('home_why_us_desc_align', v)} />
          </SectionCard>

          <SectionCard title="🔄 بخش فرآیند — عنوان، توضیح و مراحل (Home)" defaultOpen={false}>

            {/* ── عنوان بخش ── */}
            <div className="space-y-3 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(0,188,212,0.6)' }}>عنوان و توضیح بخش</p>
              <Field label="متن Badge (نشان رنگی)" value={settings.home_process_section_badge}
                onChange={v => set('home_process_section_badge', v)} placeholder="فرآیند جذب سرمایه" />
              <FieldFull label="عنوان" value={settings.home_process_section_title}
                onChange={v => set('home_process_section_title', v)} placeholder="از اولین جلسه تا Term Sheet"
                fsValue={settings.home_process_section_title_fs} onFsChange={v => set('home_process_section_title_fs', v)}
                alignValue={settings.home_process_section_title_align} onAlignChange={v => set('home_process_section_title_align', v)} />
              <FieldFull label="توضیح زیر عنوان" value={settings.home_process_section_desc}
                onChange={v => set('home_process_section_desc', v)} textarea
                placeholder="فرآیند شفاف و مرحله‌به‌مرحله..."
                fsValue={settings.home_process_section_desc_fs} onFsChange={v => set('home_process_section_desc_fs', v)}
                alignValue={settings.home_process_section_desc_align} onAlignChange={v => set('home_process_section_desc_align', v)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="متن دکمه CTA" value={settings.home_process_section_cta}
                  onChange={v => set('home_process_section_cta', v)} placeholder="درخواست مشاوره رایگان" />
                <Field label="میانگین روزها" value={settings.home_process_avg_days}
                  onChange={v => set('home_process_avg_days', v)} placeholder="30-40 روز" />
              </div>
            </div>

            {/* ── مراحل (کارت‌ها) ── */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(0,188,212,0.6)' }}>مراحل — اضافه / ویرایش / حذف</p>
              <ProcessStepsEditor steps={settings.home_process_steps}
                onChange={v => set('home_process_steps', v)} />
            </div>

          </SectionCard>

          {/* ── Testimonials header ── */}
          <SectionCard title="💬 نظرات کلیدی — عنوان و توضیح" defaultOpen={false}>
            <p className="text-xs text-slate-500 -mt-2 mb-3">
              متن بالای بخش نظرات. محتوای کارت‌های نظرات از «مدیریت نظرات» مدیریت می‌شود.
            </p>
            <Field label="متن Badge" value={settings.home_testimonials_badge}
              onChange={v => set('home_testimonials_badge', v)} placeholder="نظرات کلیدی" />
            <FieldFull label="عنوان" value={settings.home_testimonials_heading}
              onChange={v => set('home_testimonials_heading', v)}
              placeholder="بیش از ۵۰ شرکت موفق..." textarea
              fsValue={settings.home_testimonials_heading_fs} onFsChange={v => set('home_testimonials_heading_fs', v)}
              alignValue={settings.home_testimonials_heading_align} onAlignChange={v => set('home_testimonials_heading_align', v)} />
            <FieldFull label="توضیح زیر عنوان" value={settings.home_testimonials_desc}
              onChange={v => set('home_testimonials_desc', v)}
              placeholder="بنیان‌گذاران و سرمایه‌گذاران موفق..." textarea
              fsValue={settings.home_testimonials_desc_fs} onFsChange={v => set('home_testimonials_desc_fs', v)}
              alignValue={settings.home_testimonials_desc_align} onAlignChange={v => set('home_testimonials_desc_align', v)} />
            <div className="rounded-xl px-3 py-2.5 flex items-start gap-2 mt-1"
              style={{ background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.12)' }}>
              <span className="text-teal-400 text-xs mt-0.5">💡</span>
              <p className="text-xs text-slate-400">
                برای ویرایش کارت‌های نظرات، به بخش <strong className="text-teal-400">«مدیریت نظرات»</strong> در منوی سایدبار بروید.
              </p>
            </div>
          </SectionCard>

          {/* ── آمار Hero ── */}
          <SectionCard title="📊 آمارهای Hero (۳ کارت)">
            <StatEditor stats={settings.home_stats}
              onChange={v => set('home_stats', v)} />
          </SectionCard>

          {/* ── WhyUs ── */}
          <SectionCard title="✅ چرا کپیتال نتورک — WhyUs (۴ کارت)">
            <WhyUsEditor items={settings.home_why_us}
              onChange={v => set('home_why_us', v)} />
          </SectionCard>

          {/* ── Client Showcase — کارت‌های موفقیت ── */}
          <SectionCard title="🏆 موفقیت‌های ما — کارت‌های فاندرها و سرمایه‌گذاران" defaultOpen={false}>
            <p className="text-xs text-slate-500 -mt-2 mb-4">
              هر دو گروه حداقل ۱ و حداکثر ۶ کارت می‌توانند داشته باشند. کارت‌ها در گرید ۳ ستونه نمایش داده می‌شوند.
            </p>

            {/* ── سربرگ بخش ── */}
            <div className="space-y-3 pb-4 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(251,191,36,0.7)' }}>
                سربرگ کل بخش
              </p>
              <FieldFull
                label="برچسب (Badge)"
                value={settings.home_showcase_badge}
                onChange={v => set('home_showcase_badge', v)}
                fsValue={settings.home_showcase_badge_fs}
                onFsChange={v => set('home_showcase_badge_fs', v)}
                alignValue={settings.home_showcase_badge_align}
                onAlignChange={v => set('home_showcase_badge_align', v)}
                placeholder="موفقیت‌های ما"
              />
              <FieldFull
                label="عنوان اصلی"
                value={settings.home_showcase_title}
                onChange={v => set('home_showcase_title', v)}
                fsValue={settings.home_showcase_title_fs}
                onFsChange={v => set('home_showcase_title_fs', v)}
                alignValue={settings.home_showcase_title_align}
                onAlignChange={v => set('home_showcase_title_align', v)}
                placeholder="بنیان‌گذاران و سرمایه‌گذارانی که به ما اعتماد کردند"
              />
              <FieldFull
                label="توضیح زیر عنوان"
                value={settings.home_showcase_desc}
                onChange={v => set('home_showcase_desc', v)}
                fsValue={settings.home_showcase_desc_fs}
                onFsChange={v => set('home_showcase_desc_fs', v)}
                alignValue={settings.home_showcase_desc_align}
                onAlignChange={v => set('home_showcase_desc_align', v)}
                placeholder="روی هر کارت کلیک کنید تا داستان موفقیت را ببینید"
              />
            </div>

            {/* ─ـ کارت‌های فاندرها ── */}
            <div className="mt-3">
              <div className="mb-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <FieldFull
                  label="عنوان اصلی بخش فاندرها"
                  value={settings.home_showcase_founders_label}
                  onChange={v => set('home_showcase_founders_label', v)}
                  fsValue={settings.home_showcase_founders_label_fs}
                  onFsChange={v => set('home_showcase_founders_label_fs', v)}
                  alignValue={settings.home_showcase_founders_label_align}
                  onAlignChange={v => set('home_showcase_founders_label_align', v)}
                  boldValue={settings.home_showcase_founders_label_bold}
                  onBoldChange={v => set('home_showcase_founders_label_bold', v)}
                  placeholder="فاندرها"
                />
                <FieldFull
                  label="عنوان فرعی بخش فاندرها (داخل کادر)"
                  value={settings.home_showcase_founders_label_sub}
                  onChange={v => set('home_showcase_founders_label_sub', v)}
                  fsValue={settings.home_showcase_founders_label_sub_fs}
                  onFsChange={v => set('home_showcase_founders_label_sub_fs', v)}
                  alignValue={settings.home_showcase_founders_label_sub_align}
                  onAlignChange={v => set('home_showcase_founders_label_sub_align', v)}
                  boldValue={settings.home_showcase_founders_label_sub_bold}
                  onBoldChange={v => set('home_showcase_founders_label_sub_bold', v)}
                  placeholder="استارتاپ‌های موفق"
                />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(45,212,191,0.7)' }}>
                🚀 کارت‌های فاندرها ({settings.home_showcase_founders.length} کارت)
              </p>
              <ShowcaseCardEditor
                cards={settings.home_showcase_founders}
                onChange={v => set('home_showcase_founders', v)}
                groupLabel="فاندر"
              />
            </div>

            {/* ── کارت‌های سرمایه‌گذاران ── */}
            <div className="mt-5">
              <div className="mb-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <FieldFull
                  label="عنوان اصلی بخش سرمایه‌گذاران"
                  value={settings.home_showcase_vcs_label}
                  onChange={v => set('home_showcase_vcs_label', v)}
                  fsValue={settings.home_showcase_vcs_label_fs}
                  onFsChange={v => set('home_showcase_vcs_label_fs', v)}
                  alignValue={settings.home_showcase_vcs_label_align}
                  onAlignChange={v => set('home_showcase_vcs_label_align', v)}
                  boldValue={settings.home_showcase_vcs_label_bold}
                  onBoldChange={v => set('home_showcase_vcs_label_bold', v)}
                  placeholder="سرمایه‌گذاران"
                />
                <FieldFull
                  label="عنوان فرعی بخش سرمایه‌گذاران (داخل کادر)"
                  value={settings.home_showcase_vcs_label_sub}
                  onChange={v => set('home_showcase_vcs_label_sub', v)}
                  fsValue={settings.home_showcase_vcs_label_sub_fs}
                  onFsChange={v => set('home_showcase_vcs_label_sub_fs', v)}
                  alignValue={settings.home_showcase_vcs_label_sub_align}
                  onAlignChange={v => set('home_showcase_vcs_label_sub_align', v)}
                  boldValue={settings.home_showcase_vcs_label_sub_bold}
                  onBoldChange={v => set('home_showcase_vcs_label_sub_bold', v)}
                  placeholder="صندوق‌های VC"
                />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(167,139,250,0.7)' }}>
                💼 کارت‌های سرمایه‌گذاران ({settings.home_showcase_vcs.length} کارت)
              </p>
              <ShowcaseCardEditor
                cards={settings.home_showcase_vcs}
                onChange={v => set('home_showcase_vcs', v)}
                groupLabel="سرمایه‌گذار"
              />
            </div>
          </SectionCard>

          {/* ── Section Builder ── */}
          <div className="rounded-2xl p-5 space-y-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,188,212,0.15)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-teal-400 text-base">🧩</span>
              <div>
                <h3 className="text-sm font-bold text-teal-300">Section Builder — سکشن‌های اضافی</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  سکشن‌های دینامیک جدید اضافه کنید، ترتیب را تغییر دهید، عنوان‌ها H1-H6، متن، آمار،
                  دکمه، اموجی، GIF و کارت‌ها را به دلخواه ترکیب کنید.
                </p>
              </div>
            </div>
            <AdminHomeSectionBuilder
              sections={settings.home_sections}
              onChange={v => set('home_sections', v)}
              sectionOrder={settings.home_section_order}
              onOrderChange={v => set('home_section_order', v)} />
          </div>

        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* تب: پیش‌نمایش بلاگ                                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'blog-preview' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

          {/* info banner */}
          <div className="rounded-2xl p-4 flex items-start gap-3 mb-2"
            style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)' }}>
            <BookOpen size={16} className="text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-sky-300">بخش پیش‌نمایش بلاگ</p>
              <p className="text-xs text-slate-400 mt-1">
                این بخش در صفحه اصلی، سه مقاله برگزیده (featured) را نمایش می‌دهد.
                برای ویرایش محتوای مقالات به بخش <strong className="text-sky-400">«بلاگ»</strong> بروید.
              </p>
            </div>
          </div>

          <SectionCard title="📰 عنوان و Badge بخش پیش‌نمایش بلاگ">
            <Field label="متن Badge (نشان رنگی)" value={settings.home_blog_preview_badge}
              onChange={v => set('home_blog_preview_badge', v)} placeholder="آخرین مقالات" />
            <FieldFull label="عنوان اصلی بخش" value={settings.home_blog_preview_title}
              onChange={v => set('home_blog_preview_title', v)} placeholder="دانش، تجربه و بینش سرمایه‌گذاری"
              fsValue={settings.home_blog_preview_title_fs} onFsChange={v => set('home_blog_preview_title_fs', v)}
              alignValue={settings.home_blog_preview_title_align} onAlignChange={v => set('home_blog_preview_title_align', v)} />
            <Field label="متن دکمه «مشاهده همه مقالات»" value={settings.home_blog_preview_btn}
              onChange={v => set('home_blog_preview_btn', v)} placeholder="مشاهده همه مقالات" />
          </SectionCard>

          {/* ── Section Builder — سکشن‌های اضافی نامحدود ── */}
          <PageSectionBuilder
            sections={settings.blog_preview_sections}
            onChange={v => set('blog_preview_sections', v)}
            pageLabel="پیش‌نمایش بلاگ"
          />

        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* تب: سوالات متداول                                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'faq' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

          {/* ── Header Section ── */}
          <SectionCard title="❓ عنوان بخش سوالات متداول">
            <Field label="متن Badge (نشان رنگی)" value={settings.home_faq_badge}
              onChange={v => set('home_faq_badge', v)} placeholder="سوالات متداول" />
            <FieldFull label="عنوان اصلی" value={settings.home_faq_title}
              onChange={v => set('home_faq_title', v)} placeholder="هر چیزی که باید بدانید"
              fsValue={settings.home_faq_title_fs} onFsChange={v => set('home_faq_title_fs', v)}
              alignValue={settings.home_faq_title_align} onAlignChange={v => set('home_faq_title_align', v)} />
            <FieldFull label="توضیح زیر عنوان" value={settings.home_faq_desc}
              onChange={v => set('home_faq_desc', v)} textarea
              placeholder="پاسخ رایج‌ترین سوالات استارتاپ‌ها درباره فرآیند جذب سرمایه"
              fsValue={settings.home_faq_desc_fs} onFsChange={v => set('home_faq_desc_fs', v)}
              alignValue={settings.home_faq_desc_align} onAlignChange={v => set('home_faq_desc_align', v)} />
          </SectionCard>

          {/* ── FAQ Items ── */}
          <SectionCard title="📋 سوالات و پاسخ‌ها">
            <div className="rounded-xl px-3 py-2.5 flex items-start gap-2 mb-2"
              style={{ background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.12)' }}>
              <span className="text-teal-400 text-xs mt-0.5">💡</span>
              <p className="text-xs text-slate-400">
                سوالات به‌صورت Accordion در سایت نمایش داده می‌شوند.
                با دکمه‌های بالا/پایین ترتیب را تغییر دهید. تا <strong className="text-teal-400">۱۲ سوال</strong> توصیه می‌شود.
              </p>
            </div>
            <FaqEditor items={settings.home_faq_items}
              onChange={v => set('home_faq_items', v)} />
          </SectionCard>

        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* تب: ادامه مسیر (Continue Your Journey)                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'continue-journey' && (
        <ContinueJourneyTab settings={settings} set={set} />
      )}

    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ContinueJourneyTab — full CMS tab component
// ══════════════════════════════════════════════════════════════════════════════
function ContinueJourneyTab({
  settings,
  set,
}: {
  settings: import('../../lib/settingsApi').SiteSettings;
  set: <K extends keyof import('../../lib/settingsApi').SiteSettings>(
    key: K,
    value: import('../../lib/settingsApi').SiteSettings[K]
  ) => void;
}) {
  // ── image upload state ──────────────────────────────────────────────────────
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgError('');
    setImgUploading(true);
    const result = await uploadImage(file, 'webp', undefined);
    setImgUploading(false);
    if (result) {
      set('cyj_main_image', result.url);
    } else {
      setImgError('خطا در آپلود تصویر');
    }
    e.target.value = '';
  };

  // ── step helpers ────────────────────────────────────────────────────────────
  const updateStep = (idx: number, patch: Partial<CyjStep>) => {
    const next = [...settings.cyj_steps];
    next[idx] = { ...next[idx], ...patch };
    set('cyj_steps', next);
  };
  const moveStep = (idx: number, dir: -1 | 1) => {
    const next = [...settings.cyj_steps];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    set('cyj_steps', next);
  };
  const addStep = () => {
    const newId = String(Date.now());
    set('cyj_steps', [...settings.cyj_steps, { id: newId, title: '', desc: '' }]);
  };
  const removeStep = (idx: number) => {
    set('cyj_steps', settings.cyj_steps.filter((_, i) => i !== idx));
  };

  // ── card helpers ────────────────────────────────────────────────────────────
  const updateCard = (idx: number, patch: Partial<CyjCard>) => {
    const next = [...settings.cyj_cards];
    next[idx] = { ...next[idx], ...patch };
    set('cyj_cards', next);
  };
  const addCard = () => {
    const newId = String(Date.now());
    set('cyj_cards', [
      ...settings.cyj_cards,
      { id: newId, title: '', desc: '', icon: '⭐', link: '', visible: true },
    ]);
  };
  const removeCard = (idx: number) => {
    set('cyj_cards', settings.cyj_cards.filter((_, i) => i !== idx));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* ── Info Banner ── */}
      <div className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <Navigation2 size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-violet-300">بخش «ادامه مسیر شما»</p>
          <p className="text-xs text-slate-400 mt-1">
            تمامی متون، مراحل، دکمه‌ها، تصویر اصلی و کارت‌های کناری از اینجا مدیریت می‌شوند.
            تغییرات پس از کلیک «ذخیره همه تغییرات» اعمال می‌شود.
          </p>
        </div>
      </div>

      {/* ── Main Title ── */}
      <SectionCard title="📌 عنوان اصلی بخش">
        <Field
          label="عنوان اصلی"
          value={settings.cyj_main_title}
          onChange={v => set('cyj_main_title', v)}
          placeholder="هیچ فرصتی بدون ارزیابی تخصصی معرفی نمی‌شود"
        />
      </SectionCard>

      {/* ── Main Image ── */}
      <SectionCard title="🖼 تصویر اصلی (سمت راست بخش)">
        <div className="space-y-3">
          {/* preview */}
          {settings.cyj_main_image ? (
            <div className="relative rounded-xl overflow-hidden" style={{ maxHeight: 200 }}>
              <img
                src={settings.cyj_main_image}
                alt="تصویر اصلی"
                className="w-full object-cover rounded-xl"
                style={{ maxHeight: 200 }}
              />
              <button
                type="button"
                onClick={() => set('cyj_main_image', '')}
                className="absolute top-2 left-2 p-1.5 rounded-lg text-white"
                style={{ background: 'rgba(239,68,68,0.8)' }}
                title="حذف تصویر"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ) : (
            <div
              className="rounded-xl flex flex-col items-center justify-center py-10 gap-3 cursor-pointer"
              style={{ border: '2px dashed rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.04)' }}
              onClick={() => imgInputRef.current?.click()}
            >
              <Image size={28} className="text-violet-400/60" />
              <p className="text-xs text-slate-500">برای آپلود کلیک کنید</p>
            </div>
          )}
          {imgError && (
            <p className="text-xs text-red-400">{imgError}</p>
          )}
          <div className="flex gap-2">
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              type="button"
              onClick={() => imgInputRef.current?.click()}
              disabled={imgUploading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
              style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}
            >
              {imgUploading
                ? <span className="w-3 h-3 border border-violet-300/40 border-t-violet-300 rounded-full animate-spin" />
                : <Upload size={12} />}
              {imgUploading ? 'در حال آپلود...' : 'آپلود تصویر جدید'}
            </button>
            {settings.cyj_main_image && (
              <button
                type="button"
                onClick={() => set('cyj_main_image', '')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <Trash2 size={12} /> حذف تصویر
              </button>
            )}
          </div>
          {/* or enter URL manually */}
          <Field
            label="یا آدرس URL تصویر را وارد کنید"
            value={settings.cyj_main_image}
            onChange={v => set('cyj_main_image', v)}
            placeholder="https://..."
            ltr
          />
        </div>
      </SectionCard>

      {/* ── Steps ── */}
      <SectionCard title="🔢 مراحل شماره‌دار (۱ تا N)">
        <div className="rounded-xl px-3 py-2.5 flex items-start gap-2 mb-3"
          style={{ background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.12)' }}>
          <span className="text-teal-400 text-xs mt-0.5">💡</span>
          <p className="text-xs text-slate-400">
            هر مرحله با شماره خودکار نمایش داده می‌شود. ترتیب را با دکمه‌های بالا/پایین تغییر دهید.
          </p>
        </div>
        <div className="space-y-3">
          {settings.cyj_steps.map((step, i) => (
            <div
              key={step.id}
              className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* step header */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.4)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs text-slate-400 truncate max-w-[180px]">{step.title || `مرحله ${i + 1}`}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveStep(i, -1)}
                    disabled={i === 0}
                    className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20"
                  ><ChevronUp size={12} /></button>
                  <button
                    type="button"
                    onClick={() => moveStep(i, 1)}
                    disabled={i === settings.cyj_steps.length - 1}
                    className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20"
                  ><ChevronDown size={12} /></button>
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="p-1 rounded text-red-400/50 hover:text-red-400"
                  ><Trash2 size={12} /></button>
                </div>
              </div>
              {/* step fields */}
              <div className="px-4 py-3 space-y-2">
                <Field
                  label="عنوان مرحله"
                  value={step.title}
                  onChange={v => updateStep(i, { title: v })}
                  placeholder={`مثال: بررسی اولیه و ارزیابی تخصصی`}
                />
                <Field
                  label="توضیح مرحله"
                  value={step.desc}
                  onChange={v => updateStep(i, { desc: v })}
                  placeholder="توضیح کوتاه درباره این مرحله..."
                  textarea
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="w-full mt-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
          style={{ background: 'rgba(139,92,246,0.06)', color: '#a78bfa', border: '1px dashed rgba(139,92,246,0.3)' }}
        >
          <Plus size={13} /> افزودن مرحله جدید
        </button>
      </SectionCard>

      {/* ── Buttons ── */}
      <SectionCard title="🔘 مدیریت دکمه‌ها">
        <div className="space-y-4">
          {/* Button 1 */}
          <div
            className="p-4 rounded-xl space-y-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-teal-400">دکمه اول</span>
              <button
                type="button"
                onClick={() => set('cyj_btn1_enabled', !settings.cyj_btn1_enabled)}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: settings.cyj_btn1_enabled ? '#34d399' : '#94a3b8' }}
              >
                {settings.cyj_btn1_enabled
                  ? <ToggleRight size={18} className="text-emerald-400" />
                  : <ToggleLeft size={18} />}
                {settings.cyj_btn1_enabled ? 'فعال' : 'غیرفعال'}
              </button>
            </div>
            <Field
              label="متن دکمه"
              value={settings.cyj_btn1_text}
              onChange={v => set('cyj_btn1_text', v)}
              placeholder="درخواست مشاوره"
            />
            <Field
              label="آدرس لینک"
              value={settings.cyj_btn1_url}
              onChange={v => set('cyj_btn1_url', v)}
              placeholder="/contact"
              ltr
            />
          </div>
          {/* Button 2 */}
          <div
            className="p-4 rounded-xl space-y-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-teal-400">دکمه دوم</span>
              <button
                type="button"
                onClick={() => set('cyj_btn2_enabled', !settings.cyj_btn2_enabled)}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: settings.cyj_btn2_enabled ? '#34d399' : '#94a3b8' }}
              >
                {settings.cyj_btn2_enabled
                  ? <ToggleRight size={18} className="text-emerald-400" />
                  : <ToggleLeft size={18} />}
                {settings.cyj_btn2_enabled ? 'فعال' : 'غیرفعال'}
              </button>
            </div>
            <Field
              label="متن دکمه"
              value={settings.cyj_btn2_text}
              onChange={v => set('cyj_btn2_text', v)}
              placeholder="درباره ما"
            />
            <Field
              label="آدرس لینک"
              value={settings.cyj_btn2_url}
              onChange={v => set('cyj_btn2_url', v)}
              placeholder="/about"
              ltr
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Side Cards ── */}
      <SectionCard title="🃏 کارت‌های کناری (پنل چپ)">
        <div className="rounded-xl px-3 py-2.5 flex items-start gap-2 mb-3"
          style={{ background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.12)' }}>
          <span className="text-teal-400 text-xs mt-0.5">💡</span>
          <p className="text-xs text-slate-400">
            این کارت‌ها در پنل سمت چپ نمایش داده می‌شوند. هر کارت می‌تواند آیکون، عنوان، توضیح و لینک داشته باشد.
            کارت‌های پنهان در سایت نمایش داده نمی‌شوند.
          </p>
        </div>
        <div className="space-y-3">
          {settings.cyj_cards.map((card, i) => (
            <div
              key={card.id}
              className="rounded-xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: card.visible
                  ? '1px solid rgba(255,255,255,0.06)'
                  : '1px solid rgba(255,255,255,0.03)',
                opacity: card.visible ? 1 : 0.5,
              }}
            >
              {/* card header */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{card.icon || '⭐'}</span>
                  <span className="text-xs text-slate-400 truncate max-w-[160px]">{card.title || `کارت ${i + 1}`}</span>
                  {!card.visible && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                      پنهان
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateCard(i, { visible: !card.visible })}
                    className="p-1 rounded transition-colors"
                    style={{ color: card.visible ? '#34d399' : '#64748b' }}
                    title={card.visible ? 'پنهان کن' : 'نمایش بده'}
                  >
                    {card.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCard(i)}
                    className="p-1 rounded text-red-400/50 hover:text-red-400"
                  ><Trash2 size={12} /></button>
                </div>
              </div>
              {/* card fields */}
              <div className="px-4 py-3 grid grid-cols-2 gap-2">
                <Field
                  label="آیکون (Emoji)"
                  value={card.icon}
                  onChange={v => updateCard(i, { icon: v })}
                  placeholder="🔍"
                />
                <Field
                  label="عنوان کارت"
                  value={card.title}
                  onChange={v => updateCard(i, { title: v })}
                  placeholder="تحقیق"
                />
                <div className="col-span-2">
                  <Field
                    label="توضیح"
                    value={card.desc}
                    onChange={v => updateCard(i, { desc: v })}
                    placeholder="توضیح کوتاه..."
                    textarea
                  />
                </div>
                <div className="col-span-2">
                  <Field
                    label="لینک (اختیاری)"
                    value={card.link}
                    onChange={v => updateCard(i, { link: v })}
                    placeholder="/services"
                    ltr
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCard}
          className="w-full mt-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
          style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.25)' }}
        >
          <Plus size={13} /> افزودن کارت جدید
        </button>
      </SectionCard>

    </motion.div>
  );
}
