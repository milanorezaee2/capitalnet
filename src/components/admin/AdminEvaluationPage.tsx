import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Plus, Trash2, CheckCircle2, ChevronLeft, ChevronRight,
  Rocket, Briefcase, Send, Globe, DollarSign, MapPin, Settings, Eye,
  FileText, User, Edit3, X, Check,
} from 'lucide-react';
import { fetchSettings, saveSettings } from '../../lib/settingsApi';
import type { EvalFormConfig } from '../../lib/settingsApi';
import { insertLead } from '../../lib/leadsApi';
import type { LeadInsert } from '../../lib/leadsApi';
import { supabase } from '../../lib/supabaseApi';

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputBase = 'w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-all resize-none';
const iStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
const selectStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff' };
const iFocus: React.CSSProperties = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(234,179,8,0.45)' };
const cardStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };

// ─── Small reusable field ─────────────────────────────────────────────────────
function FInput({ label, value, onChange, placeholder = '', ltr = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; ltr?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputBase}
        style={ltr ? { ...(focused ? iFocus : iStyle), direction: 'ltr' } : (focused ? iFocus : iStyle)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function FTextarea({ label, value, onChange, rows = 2 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      <textarea
        value={value} rows={rows} onChange={e => onChange(e.target.value)}
        className={inputBase} style={focused ? iFocus : iStyle}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </div>
  );
}

// ─── Section card with collapse ───────────────────────────────────────────────
function SCard({ title, children, accent = '#eab308', open: initOpen = true }: {
  title: string; children: React.ReactNode; accent?: string; open?: boolean;
}) {
  const [open, setOpen] = useState(initOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={cardStyle}>
      <button
        type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-right hover:bg-white/5 transition-colors"
        style={{ background: open ? `${accent}08` : 'transparent' }}>
        <span className="text-sm font-bold" style={{ color: accent }}>{title}</span>
        <span className="text-slate-500 text-xs" style={{ transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform .2s' }}>▾</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop: `1px solid ${accent}18` }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Editable string list (dropdown options) ─────────────────────────────────
function StrListEditor({ label, items, onChange, accent = '#eab308' }: {
  label: string; items: string[]; onChange: (v: string[]) => void; accent?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item}
              onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
              className={`${inputBase} flex-1`}
              style={iStyle}
            />
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 transition-colors flex-shrink-0">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, ''])}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
          style={{ background: `${accent}0a`, color: accent, border: `1px dashed ${accent}40` }}>
          <Plus size={12} /> افزودن گزینه
        </button>
      </div>
    </div>
  );
}

// ─── Card option editor {value, label, sub} ──────────────────────────────────
function CardOptionEditor({ label, items, onChange, accent = '#eab308' }: {
  label: string;
  items: Array<{ value: string; label: string; label_level?: string; label_align?: string; sub: string; sub_level?: string; sub_align?: string }>;
  onChange: (v: Array<{ value: string; label: string; label_level?: string; label_align?: string; sub: string; sub_level?: string; sub_align?: string }>) => void;
  accent?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-2">{label}</label>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">کارت {i + 1}</span>
              <button
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="p-1 rounded text-red-400/40 hover:text-red-400 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FInput label="value (کد داخلی)" value={item.value} ltr
                onChange={v => { const n = [...items]; n[i] = { ...n[i], value: v }; onChange(n); }} />
              <FInput label="عنوان نمایشی" value={item.label}
                onChange={v => { const n = [...items]; n[i] = { ...n[i], label: v }; onChange(n); }} />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">تراز عنوان کارت</label>
                <select
                  value={item.label_align ?? 'right'}
                  onChange={e => { const n = [...items]; n[i] = { ...n[i], label_align: e.target.value }; onChange(n); }}
                  className={`${inputBase} text-sm`} style={selectStyle}
                >
                  <option value="right">راست‌چین</option>
                  <option value="center">وسط‌چین</option>
                  <option value="left">چپ‌چین</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">تراز توضیح کارت</label>
                <select
                  value={item.sub_align ?? 'right'}
                  onChange={e => { const n = [...items]; n[i] = { ...n[i], sub_align: e.target.value }; onChange(n); }}
                  className={`${inputBase} text-sm`} style={selectStyle}
                >
                  <option value="right">راست‌چین</option>
                  <option value="center">وسط‌چین</option>
                  <option value="left">چپ‌چین</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, { value: '', label: '', label_align: 'right', sub: '', sub_align: 'right' }])}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
          style={{ background: `${accent}0a`, color: accent, border: `1px dashed ${accent}40` }}>
          <Plus size={12} /> افزودن کارت
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── SIDEBAR SECTION LIST ───────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

type SideSection =
  | 'profile'       // مرحله ۱ - پروفایل (مشترک)
  | 'contact'       // مرحله ۲ - تماس (مشترک)
  | 'founder_info'  // مرحله ۳ - جزئیات فاندر
  | 'docs'          // مرحله ۴ - مستندات (فاندر)
  | 'confirm'       // مرحله ۵ - تأیید
  | 'success'       // صفحه موفقیت
  | 'tabs'          // برچسب تب‌ها
  | 'investor_info' // مرحله ۳ - جزئیات سرمایه‌گذار
  | 'inv_docs'      // مرحله ۴ - مستندات (سرمایه‌گذار)
  | 'inv_confirm';  // مرحله ۵ - تأیید سرمایه‌گذار

interface SidebarItem {
  id: SideSection;
  label: string;
  icon: React.ReactNode;
  tab: 'cv' | 'founder';
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  // CV tab (investor)
  { id: 'profile',      label: 'مرحله ۱ — پروفایل',         icon: <User size={14} />,      tab: 'cv' },
  { id: 'contact',      label: 'مرحله ۲ — تماس',            icon: <FileText size={14} />,  tab: 'cv' },
  { id: 'investor_info',label: 'مرحله ۳ — جزئیات',          icon: <Briefcase size={14} />, tab: 'cv' },
  { id: 'inv_docs',     label: 'مرحله ۴ — مستندات',         icon: <DollarSign size={14} />, tab: 'cv' },
  { id: 'inv_confirm',  label: 'مرحله ۵ — تأیید',           icon: <CheckCircle2 size={14} />, tab: 'cv' },
  { id: 'success',      label: 'صفحه موفقیت',               icon: <Check size={14} />,     tab: 'cv' },
  { id: 'tabs',         label: 'برچسب تب‌ها',               icon: <Settings size={14} />,  tab: 'cv' },
  // Founder tab
  { id: 'profile',      label: 'مرحله ۱ — پروفایل',         icon: <User size={14} />,      tab: 'founder' },
  { id: 'contact',      label: 'مرحله ۲ — تماس',            icon: <FileText size={14} />,  tab: 'founder' },
  { id: 'founder_info', label: 'مرحله ۳ — جزئیات',          icon: <Rocket size={14} />,    tab: 'founder' },
  { id: 'docs',         label: 'مرحله ۴ — مستندات',         icon: <Globe size={14} />,     tab: 'founder' },
  { id: 'confirm',      label: 'مرحله ۵ — تأیید',           icon: <CheckCircle2 size={14} />, tab: 'founder' },
  { id: 'success',      label: 'صفحه موفقیت',               icon: <Check size={14} />,     tab: 'founder' },
  { id: 'tabs',         label: 'برچسب تب‌ها',               icon: <Settings size={14} />,  tab: 'founder' },
];

// ─── Section Content Renderers ────────────────────────────────────────────────
function SectionContent({
  section, cfg, onChange
}: {
  section: SideSection;
  cfg: EvalFormConfig;
  onChange: (c: EvalFormConfig) => void;
}) {
  const set = <K extends keyof EvalFormConfig>(key: K, val: EvalFormConfig[K]) =>
    onChange({ ...cfg, [key]: val });

  const renderTextControls = (titleKey: keyof EvalFormConfig, subtitleKey: keyof EvalFormConfig, titleLabel: string, subtitleLabel: string) => (
    <div className="space-y-3">
      <FInput label={titleLabel} value={String(cfg[titleKey] ?? '')} onChange={v => set(titleKey, v as any)} />
      <div className="flex justify-end">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">تراز عنوان</label>
          <select
            value={String(cfg[`${String(titleKey)}_align` as keyof EvalFormConfig] ?? 'right')}
            onChange={e => set(`${String(titleKey)}_align` as keyof EvalFormConfig, e.target.value as any)}
            className={`${inputBase} text-sm`} style={selectStyle}
          >
            <option value="right">راست‌چین</option>
            <option value="center">وسط‌چین</option>
            <option value="left">چپ‌چین</option>
          </select>
        </div>
      </div>
      <FInput label={subtitleLabel} value={String(cfg[subtitleKey] ?? '')} onChange={v => set(subtitleKey, v as any)} />
      <div className="flex justify-end">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">تراز زیرعنوان</label>
          <select
            value={String(cfg[`${String(subtitleKey)}_align` as keyof EvalFormConfig] ?? 'right')}
            onChange={e => set(`${String(subtitleKey)}_align` as keyof EvalFormConfig, e.target.value as any)}
            className={`${inputBase} text-sm`} style={selectStyle}
          >
            <option value="right">راست‌چین</option>
            <option value="center">وسط‌چین</option>
            <option value="left">چپ‌چین</option>
          </select>
        </div>
      </div>
    </div>
  );
  if (section === 'profile') return (
    <div className="space-y-4" dir="rtl">
      <SectionTitle icon={<User size={16} />} label="مرحله ۱ — پروفایل" color="#eab308" />
      {renderTextControls('step1_title', 'step1_subtitle', 'عنوان صفحه', 'توضیح زیر عنوان')}
      <CardOptionEditor
        label="کارت‌های انتخاب نوع همکاری"
        items={cfg.profile_types}
        onChange={v => set('profile_types', v)}
      />
    </div>
  );

  if (section === 'contact') return (
    <div className="space-y-4" dir="rtl">
      <SectionTitle icon={<FileText size={16} />} label="مرحله ۲ — اطلاعات تماس" color="#eab308" />
      {renderTextControls('step2_title', 'step2_subtitle', 'عنوان مرحله', 'توضیح زیر عنوان')}
      <div className="rounded-xl p-3 space-y-1" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[11px] text-slate-500 mb-2">فیلدهای ثابت این مرحله:</p>
        {['نام و نام خانوادگی *', 'ایمیل *', 'شماره تماس', 'لینکدین یا وب‌سایت'].map(f => (
          <div key={f} className="flex items-center gap-2 py-1.5 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <Check size={11} className="text-yellow-400/60" />
            <span className="text-xs text-slate-400">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (section === 'founder_info') return (
    <div className="space-y-4" dir="rtl">
      <SectionTitle icon={<Rocket size={16} />} label="مرحله ۳ — جزئیات فاندر" color="#eab308" />
      {renderTextControls('step3f_title', 'step3f_subtitle', 'عنوان مرحله', 'توضیح زیر عنوان')}
      <StrListEditor
        label="گزینه‌های حوزه فعالیت (Sector)"
        items={cfg.sector_options}
        onChange={v => set('sector_options', v)}
      />
      <StrListEditor
        label="گزینه‌های مرحله (Stage)"
        items={cfg.stage_options}
        onChange={v => set('stage_options', v)}
      />
      <StrListEditor
        label="گزینه‌های سرمایه مورد نیاز"
        items={cfg.capital_options}
        onChange={v => set('capital_options', v)}
      />
    </div>
  );

  if (section === 'investor_info') return (
    <div className="space-y-4" dir="rtl">
      <SectionTitle icon={<Briefcase size={16} />} label="مرحله ۳ — جزئیات سرمایه‌گذار" color="#00bcd4" />
      {renderTextControls('step3i_title', 'step3i_subtitle', 'عنوان مرحله', 'توضیح زیر عنوان')}
      <StrListEditor
        label="گزینه‌های Ticket Size"
        items={cfg.ticket_options}
        onChange={v => set('ticket_options', v)}
        accent="#00bcd4"
      />
      <StrListEditor
        label="گزینه‌های Stage مورد علاقه"
        items={cfg.stage_pref_options}
        onChange={v => set('stage_pref_options', v)}
        accent="#00bcd4"
      />
      <div className="rounded-xl p-3" style={{ background: 'rgba(0,188,212,0.04)', border: '1px solid rgba(0,188,212,0.12)' }}>
        <p className="text-[11px] text-slate-500 mb-2">فیلد جغرافیای هدف:</p>
        <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <MapPin size={11} className="text-teal-400/60" />
          <span className="text-xs text-slate-400">جغرافیای هدف (آزاد — مثلاً MENA, Europe)</span>
        </div>
      </div>
    </div>
  );

  if (section === 'docs' || section === 'inv_docs') {
    const isFounderSection = section === 'docs';
    const color = isFounderSection ? '#eab308' : '#00bcd4';
    return (
      <div className="space-y-4" dir="rtl">
        <SectionTitle icon={<Globe size={16} />} label="مرحله ۴ — مستندات" color={color} />
        {renderTextControls('step4_title', 'step4_subtitle', 'عنوان مرحله', 'توضیح زیر عنوان')}
        {isFounderSection && (
          <div className="rounded-xl p-3" style={{ background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.12)' }}>
            <p className="text-[11px] text-slate-500 mb-2">فیلدهای مخصوص فاندر:</p>
            <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Globe size={11} className="text-yellow-400/60" />
              <span className="text-xs text-slate-400">لینک Pitch Deck (اختیاری)</span>
            </div>
          </div>
        )}
        <CardOptionEditor
          label="گزینه‌های سطح آمادگی"
          items={cfg.confidence_options}
          onChange={v => set('confidence_options', v)}
          accent={color}
        />
        <FTextarea
          label="توضیحات تکمیلی — placeholder"
          value="هر اطلاعات اضافه‌ای که می‌خواهید با ما در میان بگذارید..."
          onChange={() => {}}
          rows={2}
        />
        <p className="text-[10px] text-slate-600">* فیلد توضیحات تکمیلی placeholder ثابت است</p>
      </div>
    );
  }

  if (section === 'confirm' || section === 'inv_confirm') {
    const color = section === 'confirm' ? '#eab308' : '#00bcd4';
    return (
      <div className="space-y-4" dir="rtl">
        <SectionTitle icon={<CheckCircle2 size={16} />} label="مرحله ۵ — تأیید و ارسال" color={color} />
        {renderTextControls('step5_title', 'step5_subtitle', 'عنوان مرحله', 'توضیح زیر عنوان')}
        <FTextarea label="متن نوتیس (جعبه هشدار)" value={cfg.step5_notice} onChange={v => set('step5_notice', v)} rows={3} />
        <div className="rounded-xl p-3" style={{ background: `${color}06`, border: `1px solid ${color}18` }}>
          <p className="text-[11px] text-slate-500 mb-2">خلاصه فیلدهای نمایش داده شده در تأیید:</p>
          {['نام', 'ایمیل', 'تلفن', 'لینکدین',
            section === 'confirm' ? 'شرکت / حوزه / مرحله / سرمایه' : 'صندوق / Ticket Size / Stage',
            'سطح آمادگی', 'توضیحات'].map(f => (
            <div key={f} className="flex items-center gap-2 py-1 px-2 rounded">
              <Check size={10} style={{ color }} />
              <span className="text-xs text-slate-400">{f}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'success') return (
    <div className="space-y-4" dir="rtl">
      <SectionTitle icon={<Check size={16} />} label="صفحه موفقیت" color="#22c55e" />
      {renderTextControls('success_title', 'success_subtitle', 'عنوان صفحه موفقیت', 'توضیح')}
      <FInput label="متن دکمه بازگشت" value={cfg.success_btn} onChange={v => set('success_btn', v)} />
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">تراز دکمه</label>
        <select
          value={String(cfg.success_btn_align ?? 'center')}
          onChange={e => set('success_btn_align', e.target.value as any)}
          className={`${inputBase} text-sm`} style={selectStyle}
        >
          <option value="right">راست‌چین</option>
          <option value="center">وسط‌چین</option>
          <option value="left">چپ‌چین</option>
        </select>
      </div>
      <div className="rounded-xl p-4 text-center space-y-3" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}>
          <CheckCircle2 size={18} className="text-green-400" />
        </div>
        <p className="text-xs text-slate-400">{cfg.success_title || 'عنوان موفقیت'}</p>
        <p className="text-[11px] text-slate-600">{cfg.success_subtitle || 'توضیح...'}</p>
        <div className="inline-block px-4 py-1.5 rounded-xl text-xs" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
          {cfg.success_btn || 'متن دکمه'}
        </div>
      </div>
    </div>
  );

  if (section === 'tabs') return (
    <div className="space-y-4" dir="rtl">
      <SectionTitle icon={<Settings size={16} />} label="برچسب تب‌های بالای فرم" color="#a78bfa" />
      <p className="text-xs text-slate-500">برچسب‌های نمایشی در نوار پیشرفت بالای فرم را ویرایش کنید:</p>
      <div className="space-y-2">
        {cfg.tab_steps.map((label, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
              {i + 1}
            </div>
            <input
              value={label}
              onChange={e => { const n = [...cfg.tab_steps]; n[i] = e.target.value; set('tab_steps', n); }}
              className={`${inputBase} flex-1`}
              style={iStyle}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}

function SectionTitle({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 pb-2" style={{ borderBottom: `1px solid ${color}20` }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <h3 className="text-sm font-bold" style={{ color }}>{label}</h3>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── PDF Upload Field ──────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

function PdfUploadField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState('');
  const inputRef = useState<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setFileError('');
    const lowerName = file.name.toLowerCase();
    if (file.type !== 'application/pdf' || !lowerName.endsWith('.pdf')) {
      setFileError('فقط فایل با فرمت PDF مجاز است');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setFileError('حجم فایل نباید بیشتر از ۲۰ مگابایت باشد');
      return;
    }
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('pitch-decks')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('pitch-decks').getPublicUrl(data.path);
      onChange(urlData.publicUrl);
      setFileName(file.name);
    } catch {
      setFileError('خطا در آپلود فایل — لطفاً دوباره تلاش کنید');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        آپلود Pitch Deck <span className="text-slate-600 text-[11px]">(فقط PDF — اختیاری)</span>
      </label>
      <label
        className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all"
        style={{
          border: fileError ? '1.5px dashed rgba(239,68,68,0.5)' : '1.5px dashed rgba(255,255,255,0.12)',
          background: fileError ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)',
          padding: '16px',
        }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}>
        <input
          ref={el => { (inputRef as any)[0] = el; }}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {uploading ? (
          <span className="w-5 h-5 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        ) : value && fileName ? (
          <div className="flex items-center gap-2 w-full">
            <Globe size={14} className="text-teal-400 flex-shrink-0" />
            <span className="text-xs text-teal-300 truncate flex-1">{fileName}</span>
            <button type="button" onClick={e => { e.preventDefault(); onChange(''); setFileName(''); }}
              className="text-red-400/50 hover:text-red-400 flex-shrink-0"><Trash2 size={12} /></button>
          </div>
        ) : (
          <>
            <Globe size={18} className="text-slate-500" />
            <span className="text-xs text-slate-400">فایل PDF را اینجا رها کنید یا کلیک کنید</span>
            <span className="text-[10px] text-slate-600">حداکثر ۲۰ مگابایت — فقط PDF</span>
          </>
        )}
      </label>
      {fileError && <p className="mt-1.5 text-xs text-red-400">{fileError}</p>}
      {value && !fileName && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <Globe size={11} className="text-teal-400" />
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-400 hover:underline truncate">مشاهده فایل آپلود‌شده</a>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── Live preview form (unchanged) ─────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

interface FormData {
  profile_type: string;
  full_name: string; email: string; phone: string; linkedin: string;
  company_name: string; sector: string; stage: string; capital_required: string; one_liner: string;
  org_name: string; ticket_size: string; stage_pref: string; geo_pref: string;
  deck_url: string; confidence: string; message: string;
}
const EMPTY: FormData = {
  profile_type: '',
  full_name: '', email: '', phone: '', linkedin: '',
  company_name: '', sector: '', stage: '', capital_required: '', one_liner: '',
  org_name: '', ticket_size: '', stage_pref: '', geo_pref: '',
  deck_url: '', confidence: '', message: '',
};

function LiveInp({ label, value, onChange, type = 'text', placeholder = '', ltr = false, required = false }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; ltr?: boolean; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}{required && <span className="text-yellow-400 mr-0.5">*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={inputBase}
        style={ltr ? { ...(focused ? iFocus : iStyle), direction: 'ltr' } : (focused ? iFocus : iStyle)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
    </div>
  );
}
function LiveSel({ label, value, onChange, options, required = false }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}{required && <span className="text-yellow-400 mr-0.5">*</span>}
      </label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className={inputBase} style={{ ...(focused ? iFocus : selectStyle), appearance: 'none' as const }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
        <option value="">— انتخاب کنید —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function LiveTxt({ label, value, onChange, placeholder = '', rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <textarea value={value} rows={rows} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={inputBase} style={focused ? iFocus : iStyle}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
    </div>
  );
}
function LiveStepTabs({ current, cfg }: { current: number; cfg: EvalFormConfig }) {
  const labels = cfg.tab_steps;
  return (
    <div className="flex items-center gap-0 mb-8" dir="rtl">
      {labels.map((label, idx) => {
        const id = idx + 1; const done = id < current; const active = id === current;
        return (
          <div key={id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all"
                style={done ? { background: 'rgba(234,179,8,0.2)', color: '#eab308', border: '1.5px solid rgba(234,179,8,0.5)' }
                  : active ? { background: 'rgba(234,179,8,0.15)', color: '#eab308', border: '2px solid #eab308' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {done ? <CheckCircle2 size={14} /> : id}
              </div>
              <span className="text-[10px] font-medium hidden sm:block"
                style={{ color: active ? '#eab308' : done ? 'rgba(234,179,8,0.6)' : 'rgba(255,255,255,0.3)' }}>
                {label}
              </span>
            </div>
            {idx < labels.length - 1 && (
              <div className="h-px flex-1 mx-1" style={{ background: done ? 'rgba(234,179,8,0.4)' : 'rgba(255,255,255,0.08)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
function SummaryRow({ label, value, isLink = false }: { label: string; value: string | null | undefined; isLink?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-xs text-slate-500 flex-shrink-0">{label}</span>
      {isLink
        ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-400 hover:text-teal-300 text-left break-all">مشاهده / دانلود</a>
        : <span className="text-xs text-slate-200 text-left">{value}</span>}
    </div>
  );
}
function LiveForm({ cfg }: { cfg: EvalFormConfig }) {
  const [form, setForm] = useState<FormData>({ ...EMPTY });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSub] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));
  const isFounder = form.profile_type === 'founder';
  // اعتبارسنجی شماره تلفن: باید ۱۰ تا ۱۵ رقم (با یا بدون +) باشد
  const validatePhone = (p: string): string | null => {
    const digits = p.replace(/[\s\-().]/g, '');
    if (!digits) return 'شماره تماس الزامی است.';
    if (!/^\+?[0-9]{10,15}$/.test(digits)) return 'شماره تماس معتبر نیست (مثال: ۰۹۱۲۱۲۳۴۵۶۷ یا +98912...)';
    return null;
  };

  const validate = (): string | null => {
    if (step === 1 && !form.profile_type) return 'لطفاً نوع همکاری خود را انتخاب کنید.';
    if (step === 2) {
      if (!form.full_name.trim()) return 'نام و نام خانوادگی الزامی است.';
      if (!form.email.trim() || !form.email.includes('@')) return 'لطفاً یک ایمیل معتبر وارد کنید.';
      const phoneErr = validatePhone(form.phone);
      if (phoneErr) return phoneErr;
    }
    if (step === 3) {
      if (isFounder) {
        if (!form.company_name.trim()) return 'نام شرکت الزامی است.';
        if (!form.sector) return 'لطفاً حوزه فعالیت را انتخاب کنید.';
        if (!form.stage) return 'لطفاً مرحله فعلی را انتخاب کنید.';
      } else {
        if (!form.org_name.trim()) return 'نام صندوق یا سازمان الزامی است.';
        if (!form.ticket_size) return 'لطفاً Ticket Size را انتخاب کنید.';
      }
    }
    return null;
  };
  const goNext = () => { const err = validate(); if (err) { setError(err); return; } setError(''); setStep(s => s + 1); };
  const goPrev = () => { setError(''); setStep(s => Math.max(1, s - 1)); };
  const handleSubmit = async () => {
    setSub(true); setError('');
    try {
      const payload: LeadInsert = {
        profile_type: form.profile_type as 'founder' | 'investor',
        full_name: form.full_name, email: form.email,
        phone: form.phone || null, linkedin: form.linkedin || null,
        company_name: form.company_name || null, sector: form.sector || null,
        stage: form.stage || null, capital_required: form.capital_required || null,
        one_liner: form.one_liner || null, org_name: form.org_name || null,
        ticket_size: form.ticket_size || null, stage_pref: form.stage_pref || null,
        geo_pref: form.geo_pref || null,
        confidence: (form.confidence as 'high' | 'low') || null,
        message: form.message || null, deck_url: form.deck_url || null, status: 'new',
      };
      await insertLead(payload);
      setDone(true);
    } catch { setError('خطا در ارسال فرم. لطفاً دوباره تلاش کنید.'); }
    finally { setSub(false); }
  };
  const handleReset = () => { setForm({ ...EMPTY }); setStep(1); setError(''); setDone(false); };
  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 space-y-5 max-w-xl mx-auto" dir="rtl">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
        style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}>
        <CheckCircle2 size={28} className="text-green-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-2">{cfg.success_title}</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">{cfg.success_subtitle}</p>
      </div>
      <button onClick={handleReset}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
        style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)' }}>
        {cfg.success_btn}
      </button>
    </motion.div>
  );
  return (
    <div className="max-w-xl mx-auto" dir="rtl">
      <div className="rounded-2xl p-6 sm:p-8" style={cardStyle}>
        <LiveStepTabs current={step} cfg={cfg} />
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-1.5">
                  <h2 className="text-xl font-bold text-white">{cfg.step1_title}</h2>
                  <p className="text-slate-400 text-sm">{cfg.step1_subtitle}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cfg.profile_types.map(pt => (
                    <button key={pt.value} type="button" onClick={() => set('profile_type', pt.value)}
                      className="rounded-2xl p-6 text-right transition-all hover:scale-[1.02]"
                      style={form.profile_type === pt.value
                        ? { background: pt.value === 'founder' ? 'rgba(234,179,8,0.1)' : 'rgba(0,188,212,0.1)', border: `2px solid ${pt.value === 'founder' ? 'rgba(234,179,8,0.6)' : 'rgba(0,188,212,0.6)'}` }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: pt.value === 'founder' ? 'rgba(234,179,8,0.15)' : 'rgba(0,188,212,0.15)' }}>
                          {pt.value === 'founder' ? <Rocket size={18} className="text-yellow-400" /> : <Briefcase size={18} className="text-teal-400" />}
                        </div>
                        {form.profile_type === pt.value && <CheckCircle2 size={16} className={pt.value === 'founder' ? 'text-yellow-400 mr-auto' : 'text-teal-400 mr-auto'} />}
                      </div>
                      <h3 className="font-bold text-white text-base mb-1">{pt.label}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">{pt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold text-white">{cfg.step2_title}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{cfg.step2_subtitle}</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LiveInp label="نام و نام خانوادگی" value={form.full_name} onChange={v => set('full_name', v)} required placeholder="علی رضایی" />
                  <LiveInp label="ایمیل" value={form.email} onChange={v => set('email', v)} type="email" required ltr placeholder="example@domain.com" />
                  <LiveInp label="شماره تماس / WhatsApp" value={form.phone} onChange={v => set('phone', v)} required ltr placeholder="۰۹۱۲۱۲۳۴۵۶۷ یا +98912..." />
                  <LiveInp label="لینکدین یا وب‌سایت" value={form.linkedin} onChange={v => set('linkedin', v)} ltr placeholder="linkedin.com/in/..." />
                </div>
              </div>
            )}
            {step === 3 && isFounder && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold text-white">{cfg.step3f_title}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{cfg.step3f_subtitle}</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LiveInp label="نام شرکت / استارتاپ" value={form.company_name} onChange={v => set('company_name', v)} required />
                  <LiveSel label="حوزه فعالیت" value={form.sector} onChange={v => set('sector', v)} options={cfg.sector_options} required />
                  <LiveSel label="مرحله فعلی (Stage)" value={form.stage} onChange={v => set('stage', v)} options={cfg.stage_options} required />
                  <LiveSel label="سرمایه مورد نیاز" value={form.capital_required} onChange={v => set('capital_required', v)} options={cfg.capital_options} />
                </div>
                <LiveTxt label="توضیح یک‌خطی (One-liner)" value={form.one_liner} onChange={v => set('one_liner', v)} rows={3} placeholder="در یک جمله بنویسید شرکت شما چه مشکلی را حل می‌کند..." />
              </div>
            )}
            {step === 3 && !isFounder && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold text-white">{cfg.step3i_title}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{cfg.step3i_subtitle}</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LiveInp label="نام صندوق / سازمان" value={form.org_name} onChange={v => set('org_name', v)} required />
                  <LiveSel label="Ticket Size" value={form.ticket_size} onChange={v => set('ticket_size', v)} options={cfg.ticket_options} required />
                  <LiveSel label="Stage مورد علاقه" value={form.stage_pref} onChange={v => set('stage_pref', v)} options={cfg.stage_pref_options} />
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">جغرافیای هدف</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <input value={form.geo_pref} onChange={e => set('geo_pref', e.target.value)}
                        placeholder="MENA, Europe, Global" className={`${inputBase} pr-8`}
                        style={{ ...iStyle, direction: 'ltr' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-5">
                <div><h2 className="text-lg font-bold text-white">{cfg.step4_title}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{cfg.step4_subtitle}</p></div>
                {isFounder && (
                  <PdfUploadField
                    value={form.deck_url}
                    onChange={v => set('deck_url', v)}
                  />
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">سطح آمادگی</label>
                  <div className="grid grid-cols-2 gap-3">
                    {cfg.confidence_options.map(opt => (
                      <button key={opt.value} type="button" onClick={() => set('confidence', opt.value)}
                        className="rounded-xl p-4 text-right transition-all"
                        style={form.confidence === opt.value
                          ? { background: 'rgba(234,179,8,0.1)', border: '1.5px solid rgba(234,179,8,0.5)' }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <DollarSign size={14} style={{ color: form.confidence === opt.value ? '#eab308' : 'rgba(255,255,255,0.3)' }} />
                          <span className="text-sm font-semibold" style={{ color: form.confidence === opt.value ? '#eab308' : 'rgba(255,255,255,0.7)' }}>{opt.label}</span>
                        </div>
                        <p className="text-xs text-slate-500">{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <LiveTxt label="توضیحات تکمیلی" value={form.message} onChange={v => set('message', v)} rows={4} placeholder="هر اطلاعات اضافه‌ای که می‌خواهید با ما در میان بگذارید..." />
              </div>
            )}
            {step === 5 && (
              <div className="space-y-4">
                <div><h2 className="text-lg font-bold text-white">{cfg.step5_title}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{cfg.step5_subtitle}</p></div>
                <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ background: isFounder ? 'rgba(234,179,8,0.08)' : 'rgba(0,188,212,0.08)', border: `1px solid ${isFounder ? 'rgba(234,179,8,0.2)' : 'rgba(0,188,212,0.2)'}` }}>
                  {isFounder ? <Rocket size={15} className="text-yellow-400" /> : <Briefcase size={15} className="text-teal-400" />}
                  <span className="text-sm font-semibold" style={{ color: isFounder ? '#eab308' : '#00BCD4' }}>
                    {cfg.profile_types.find(p => p.value === form.profile_type)?.label ?? form.profile_type}
                  </span>
                </div>
                <div className="rounded-xl px-4 pb-1" style={cardStyle}>
                  <SummaryRow label="نام" value={form.full_name} />
                  <SummaryRow label="ایمیل" value={form.email} />
                  <SummaryRow label="تلفن" value={form.phone} />
                  <SummaryRow label="لینکدین" value={form.linkedin} />
                  {isFounder ? <>
                    <SummaryRow label="شرکت" value={form.company_name} />
                    <SummaryRow label="حوزه" value={form.sector} />
                    <SummaryRow label="مرحله" value={form.stage} />
                    <SummaryRow label="سرمایه" value={form.capital_required} />
                    <SummaryRow label="One-liner" value={form.one_liner} />
                    <SummaryRow label="Pitch Deck" value={form.deck_url} isLink />
                  </> : <>
                    <SummaryRow label="صندوق" value={form.org_name} />
                    <SummaryRow label="Ticket Size" value={form.ticket_size} />
                    <SummaryRow label="Stage" value={form.stage_pref} />
                    <SummaryRow label="جغرافیا" value={form.geo_pref} />
                  </>}
                  <SummaryRow label="آمادگی" value={cfg.confidence_options.find(c => c.value === form.confidence)?.label} />
                  <SummaryRow label="توضیحات" value={form.message} />
                </div>
                <div className="rounded-xl px-4 py-3 flex items-start gap-2"
                  style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
                  <CheckCircle2 size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed">{cfg.step5_notice}</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-2.5 rounded-xl text-sm text-red-300"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            {error}
          </motion.div>
        )}
        <div className="flex items-center justify-between mt-8 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={goPrev} disabled={step === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ChevronRight size={15} /> قبلی
          </button>
          {step < 5 ? (
            <button onClick={goNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)' }}>
              بعدی <ChevronLeft size={15} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.35)' }}>
              {submitting
                ? <><span className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" /> در حال ارسال...</>
                : <><Send size={14} /> ارسال درخواست</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── Main Page ─────────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

type MainTab = 'cv' | 'founder';

const CV_SECTIONS: Array<{ id: SideSection; label: string; icon: React.ReactNode }> = [
  { id: 'profile',       label: 'مرحله ۱ — پروفایل',      icon: <User size={14} /> },
  { id: 'contact',       label: 'مرحله ۲ — اطلاعات تماس', icon: <FileText size={14} /> },
  { id: 'investor_info', label: 'مرحله ۳ — جزئیات سرمایه‌گذار', icon: <Briefcase size={14} /> },
  { id: 'inv_docs',      label: 'مرحله ۴ — مستندات',      icon: <DollarSign size={14} /> },
  { id: 'inv_confirm',   label: 'مرحله ۵ — تأیید',        icon: <CheckCircle2 size={14} /> },
  { id: 'success',       label: 'صفحه موفقیت',            icon: <Check size={14} /> },
  { id: 'tabs',          label: 'برچسب تب‌ها',            icon: <Settings size={14} /> },
];

const FOUNDER_SECTIONS: Array<{ id: SideSection; label: string; icon: React.ReactNode }> = [
  { id: 'profile',       label: 'مرحله ۱ — پروفایل',      icon: <User size={14} /> },
  { id: 'contact',       label: 'مرحله ۲ — اطلاعات تماس', icon: <FileText size={14} /> },
  { id: 'founder_info',  label: 'مرحله ۳ — جزئیات فاندر', icon: <Rocket size={14} /> },
  { id: 'docs',          label: 'مرحله ۴ — مستندات',      icon: <Globe size={14} /> },
  { id: 'confirm',       label: 'مرحله ۵ — تأیید',        icon: <CheckCircle2 size={14} /> },
  { id: 'success',       label: 'صفحه موفقیت',            icon: <Check size={14} /> },
  { id: 'tabs',          label: 'برچسب تب‌ها',            icon: <Settings size={14} /> },
];

export default function AdminEvaluationPage() {
  const [mainTab, setMainTab] = useState<MainTab>('cv');
  const [activeSection, setActiveSection] = useState<SideSection>('profile');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [cfg, setCfg] = useState<EvalFormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  useEffect(() => {
    fetchSettings().then(s => { setCfg(s.eval_form_config); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!cfg) return;
    setSaving(true); setSaveErr('');
    const ok = await saveSettings({ eval_form_config: cfg } as any);
    setSaving(false);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    else setSaveErr('خطا در ذخیره‌سازی — لطفاً دوباره تلاش کنید.');
  };

  // When switching main tab, reset active section
  const switchMainTab = (tab: MainTab) => {
    setMainTab(tab);
    setActiveSection('profile');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <span className="w-7 h-7 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  );
  if (!cfg) return null;

  const sections = mainTab === 'cv' ? CV_SECTIONS : FOUNDER_SECTIONS;
  const cvColor = '#00bcd4';
  const founderColor = '#eab308';
  const activeColor = mainTab === 'cv' ? cvColor : founderColor;

  return (
    <div className="space-y-4" dir="rtl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">مدیریت فرم ارزیابی</h1>
          <p className="text-sm text-slate-400 mt-0.5">ویرایش فرم‌های درخواست ارزیابی به تفکیک نوع کاربر</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setViewMode('edit')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all"
              style={viewMode === 'edit'
                ? { background: 'rgba(255,255,255,0.1)', color: '#fff' }
                : { background: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
              <Edit3 size={12} /> ویرایش
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all"
              style={viewMode === 'preview'
                ? { background: 'rgba(255,255,255,0.1)', color: '#fff' }
                : { background: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
              <Eye size={12} /> پیش‌نمایش
            </button>
          </div>
          {/* Save */}
          {viewMode === 'edit' && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
              style={{
                background: saved ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.15)',
                color: saved ? '#22c55e' : '#eab308',
                border: saved ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(234,179,8,0.3)',
              }}>
              {saving ? <span className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" /> : <Save size={14} />}
              {saving ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : 'ذخیره تغییرات'}
            </button>
          )}
        </div>
      </div>

      {saveErr && (
        <div className="px-4 py-3 rounded-xl text-sm text-red-300"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
          {saveErr}
        </div>
      )}

      {viewMode === 'preview' ? (
        <AnimatePresence mode="wait">
          <motion.div key="preview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <LiveForm cfg={cfg} />
          </motion.div>
        </AnimatePresence>
      ) : (
        /* ── Edit Layout: sidebar + content ── */
        <div className="flex gap-4 items-start">

          {/* ── Sidebar ── */}
          <div className="w-56 flex-shrink-0 rounded-2xl overflow-hidden sticky top-4" style={cardStyle}>

            {/* ── CV tab block ── */}
            <button
              onClick={() => switchMainTab('cv')}
              className="w-full flex items-center gap-3 px-4 py-3 text-right transition-all"
              style={mainTab === 'cv'
                ? { background: `${cvColor}14`, borderBottom: `2px solid ${cvColor}` }
                : { background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid transparent' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: mainTab === 'cv' ? `${cvColor}20` : 'rgba(255,255,255,0.05)' }}>
                <Briefcase size={14} style={{ color: mainTab === 'cv' ? cvColor : 'rgba(255,255,255,0.3)' }} />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold" style={{ color: mainTab === 'cv' ? cvColor : 'rgba(255,255,255,0.5)' }}>CV</div>
                <div className="text-[10px]" style={{ color: mainTab === 'cv' ? `${cvColor}80` : 'rgba(255,255,255,0.2)' }}>سرمایه‌گذار</div>
              </div>
            </button>

            {/* CV section list */}
            {mainTab === 'cv' && (
              <div className="py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {CV_SECTIONS.map((item, idx) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={`cv-${item.id}-${idx}`}
                      onClick={() => setActiveSection(item.id)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-right transition-all"
                      style={isActive
                        ? { background: `${cvColor}12`, color: cvColor, borderRight: `3px solid ${cvColor}` }
                        : { background: 'transparent', color: 'rgba(255,255,255,0.45)', borderRight: '3px solid transparent' }}>
                      <span className="flex-shrink-0" style={{ color: isActive ? cvColor : 'rgba(255,255,255,0.25)' }}>
                        {item.icon}
                      </span>
                      <span className="text-xs font-medium leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Founder tab block ── */}
            <button
              onClick={() => switchMainTab('founder')}
              className="w-full flex items-center gap-3 px-4 py-3 text-right transition-all"
              style={mainTab === 'founder'
                ? { background: `${founderColor}14`, borderBottom: `2px solid ${founderColor}` }
                : { background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid transparent' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: mainTab === 'founder' ? `${founderColor}20` : 'rgba(255,255,255,0.05)' }}>
                <Rocket size={14} style={{ color: mainTab === 'founder' ? founderColor : 'rgba(255,255,255,0.3)' }} />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold" style={{ color: mainTab === 'founder' ? founderColor : 'rgba(255,255,255,0.5)' }}>Founder</div>
                <div className="text-[10px]" style={{ color: mainTab === 'founder' ? `${founderColor}80` : 'rgba(255,255,255,0.2)' }}>بنیان‌گذار</div>
              </div>
            </button>

            {/* Founder section list */}
            {mainTab === 'founder' && (
              <div className="py-1">
                {FOUNDER_SECTIONS.map((item, idx) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={`founder-${item.id}-${idx}`}
                      onClick={() => setActiveSection(item.id)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-right transition-all"
                      style={isActive
                        ? { background: `${founderColor}12`, color: founderColor, borderRight: `3px solid ${founderColor}` }
                        : { background: 'transparent', color: 'rgba(255,255,255,0.45)', borderRight: '3px solid transparent' }}>
                      <span className="flex-shrink-0" style={{ color: isActive ? founderColor : 'rgba(255,255,255,0.25)' }}>
                        {item.icon}
                      </span>
                      <span className="text-xs font-medium leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

          </div>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${mainTab}-${activeSection}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                className="rounded-2xl p-5"
                style={cardStyle}>
                <SectionContent section={activeSection} cfg={cfg} onChange={setCfg} />
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      )}

    </div>
  );
}
