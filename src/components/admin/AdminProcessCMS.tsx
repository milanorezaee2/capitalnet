// ─── Admin Process CMS ───────────────────────────────────────────────────────
// مدیریت کامل صفحه فرآیند — سبک وردپرسی مدرن
// همان tokens و طراحی AdminServicesPage
import { useState, useCallback, useEffect } from 'react';
import {
  Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp,
  GripVertical, Copy, CheckCircle2, AlertCircle,
  Sparkles, BarChart3, TrendingUp, Users, FileText,
  Star, HelpCircle, Zap, Target, Eye, Settings,
} from 'lucide-react';
import {
  loadProcessContent, saveProcessContent, resetProcessContent,
  DEFAULT_PROCESS_CONTENT,
  type ProcessContent, type TimelineStep, type DeliverableItem,
  type AudienceItem, type CompareRow, type TestimonialItem, type FaqItem,
  type ProcessStat, type ProcessOverviewItem,
} from '../../features/process/processContentStore';

// ─── Design tokens (همان AdminServicesPage) ───────────────────────────────────
const T = {
  bg:        '#07111e',
  surface:   'rgba(255,255,255,0.03)',
  surfaceHover: 'rgba(255,255,255,0.05)',
  border:    'rgba(255,255,255,0.08)',
  borderSub: 'rgba(255,255,255,0.05)',
  accent:    '#00BCD4',
  accentBg:  'rgba(0,188,212,0.1)',
  accentBdr: 'rgba(0,188,212,0.25)',
  text:      '#e2e8f0',
  textMuted: 'rgba(255,255,255,0.45)',
  textSub:   'rgba(255,255,255,0.25)',
  inp:       'bg-transparent border rounded-lg px-3 py-2 text-sm w-full outline-none transition-all focus:border-cyan-500/60 text-slate-200 placeholder:text-slate-600',
  labelCls:  'block text-xs font-semibold mb-1.5 text-slate-400',
};
const inp  = `${T.inp}`;
const labelCls = T.labelCls;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Reusable UI pieces ───────────────────────────────────────────────────────
const Field = ({ l, value, onChange, placeholder, multiline = false }: {
  l: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) => (
  <div>
    <label className={labelCls}>{l}</label>
    {multiline
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          rows={3} className={`${inp} resize-none`}
          style={{ background: 'rgba(0,0,0,0.25)', borderColor: T.border }} />
      : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={inp} style={{ background: 'rgba(0,0,0,0.25)', borderColor: T.border }} />}
  </div>
);

const ColorField = ({ l, value, onChange }: { l: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className={labelCls}>{l}</label>
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5"
        style={{ background: 'rgba(0,0,0,0.3)' }} />
      <input value={value} onChange={e => onChange(e.target.value)}
        className={`${inp} flex-1`} style={{ background: 'rgba(0,0,0,0.25)', borderColor: T.border }} />
    </div>
  </div>
);

const Card = ({ children, title, subtitle, badge, accent }: {
  children: React.ReactNode; title: string; subtitle?: string; badge?: string; accent?: string;
}) => (
  <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
    <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.borderSub}`, background: accent ? `${accent}08` : 'rgba(0,188,212,0.04)' }}>
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

const ItemRow = ({ title, subtitle, accent = '#00BCD4', onDelete, onDuplicate, children }: {
  title: string; subtitle?: string; accent?: string;
  onDelete: () => void; onDuplicate?: () => void; children?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
        style={{ background: open ? 'rgba(0,188,212,0.06)' : T.surface }}>
        <GripVertical size={14} style={{ color: T.textSub }} className="shrink-0" />
        <div className="w-1 h-7 rounded-full shrink-0" style={{ background: accent }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">{title}</p>
          {subtitle && <p className="text-xs truncate" style={{ color: T.textMuted }}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onDuplicate && (
            <button onClick={onDuplicate} className="p-1.5 rounded-lg" title="کپی"
              style={{ color: T.textMuted }}
              onMouseEnter={e => (e.currentTarget.style.color = T.text)}
              onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}>
              <Copy size={13} />
            </button>
          )}
          <button onClick={onDelete} className="p-1.5 rounded-lg" title="حذف"
            style={{ color: T.textMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}>
            <Trash2 size={13} />
          </button>
          <button onClick={() => setOpen(o => !o)} className="p-1.5 rounded-lg"
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

// آرایه tags/features/criteria/deliverables به صورت newline-separated string
const TagsField = ({ l, value, onChange }: { l: string; value: string[]; onChange: (v: string[]) => void }) => (
  <div>
    <label className={labelCls}>{l} <span style={{ color: T.textSub }}>(هر آیتم یک خط)</span></label>
    <textarea
      value={value.join('\n')}
      onChange={e => onChange(e.target.value.split('\n'))}
      rows={Math.max(2, value.length + 1)}
      className={`${inp} resize-none`}
      style={{ background: 'rgba(0,0,0,0.25)', borderColor: T.border }}
    />
  </div>
);

// ─── سایدبار ناوبار ────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'hero',         label: 'Hero — معرفی',         icon: Sparkles,   color: '#a78bfa' },
  { id: 'stats',        label: 'آمار و ارقام',          icon: BarChart3,   color: '#06b6d4' },
  { id: 'overview',     label: 'رویکرد ما',             icon: Target,     color: '#10b981' },
  { id: 'timeline',     label: 'مراحل فرآیند',          icon: TrendingUp, color: '#f59e0b' },
  { id: 'deliverables', label: 'خروجی‌ها',              icon: FileText,   color: '#8b5cf6' },
  { id: 'audience',     label: 'مخاطبان',               icon: Users,      color: '#00BCD4' },
  { id: 'compare',      label: 'جدول مقایسه',           icon: Eye,        color: '#ec4899' },
  { id: 'testimonials', label: 'نظرات مشتریان',         icon: Star,       color: '#f59e0b' },
  { id: 'faq',          label: 'سوالات متداول',         icon: HelpCircle, color: '#6366f1' },
  { id: 'cta',          label: 'CTA — فراخوان',         icon: Zap,        color: '#ef4444' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminProcessCMS() {
  const [data, setData]       = useState<ProcessContent>(() => loadProcessContent());
  const [active, setActive]   = useState<SectionId>('hero');
  const [saved, setSaved]     = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');

  // live reload اگر تب دیگری ذخیره کرد
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'cn_process_content_v1' || e.key === null) {
        setData(loadProcessContent());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const update = useCallback(<K extends keyof ProcessContent>(key: K, val: ProcessContent[K]) => {
    setData(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleSave = () => {
    setSaved('saving');
    try {
      saveProcessContent(data);
      setSaved('ok');
      setTimeout(() => setSaved('idle'), 2500);
    } catch {
      setSaved('err');
      setTimeout(() => setSaved('idle'), 3000);
    }
  };

  const handleReset = () => {
    if (!confirm('محتوا به حالت پیش‌فرض برمی‌گردد. مطمئنی؟')) return;
    resetProcessContent();
    setData(JSON.parse(JSON.stringify(DEFAULT_PROCESS_CONTENT)));
    setSaved('ok');
    setTimeout(() => setSaved('idle'), 2000);
  };

  // ─── Section renderers ────────────────────────────────────────────────────

  const renderHero = () => (
    <div className="space-y-4">
      <Card title="نوار badge" badge="Hero">
        <Field l="متن badge" value={data.hero.badge} onChange={v => update('hero', { ...data.hero, badge: v })} />
      </Card>
      <Card title="Eyebrow و تیترها">
        <div className="grid gap-4">
          <Field l="Eyebrow (بالای تیتر)" value={data.hero.eyebrow} onChange={v => update('hero', { ...data.hero, eyebrow: v })} />
          <Field l="خط اول تیتر" value={data.hero.titleLine1} onChange={v => update('hero', { ...data.hero, titleLine1: v })} />
          <Field l="خط دوم تیتر (گرادیانت رنگی)" value={data.hero.titleLine2} onChange={v => update('hero', { ...data.hero, titleLine2: v })} />
          <Field l="زیرتیتر (subtitle)" value={data.hero.subtitle} onChange={v => update('hero', { ...data.hero, subtitle: v })} placeholder="از ایده تا Term Sheet..." />
          <Field l="توضیحات (description)" value={data.hero.description} onChange={v => update('hero', { ...data.hero, description: v })} multiline />
        </div>
      </Card>
      <Card title="دکمه‌های CTA">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field l="دکمه اول (cyan)" value={data.hero.ctaPrimary} onChange={v => update('hero', { ...data.hero, ctaPrimary: v })} />
          <Field l="دکمه دوم (ghost)" value={data.hero.ctaSecondary} onChange={v => update('hero', { ...data.hero, ctaSecondary: v })} />
        </div>
      </Card>
      <Card title="Trust Badges" subtitle="زیر دکمه‌های CTA">
        <TagsField l="Badge ها" value={data.hero.trustBadges} onChange={v => update('hero', { ...data.hero, trustBadges: v.filter(Boolean) })} />
      </Card>
    </div>
  );

  const renderStats = () => (
    <Card title="آمار و ارقام" badge={`${data.stats.length} آیتم`}>
      <div className="space-y-3 mb-4">
        {data.stats.map((s, i) => (
          <ItemRow key={s.id} title={s.value} subtitle={s.label} accent="#06b6d4"
            onDelete={() => update('stats', data.stats.filter(x => x.id !== s.id))}
            onDuplicate={() => update('stats', [...data.stats.slice(0, i+1), { ...s, id: uid() }, ...data.stats.slice(i+1)])}>
            <Field l="مقدار (value)" value={s.value} onChange={v => update('stats', data.stats.map(x => x.id === s.id ? { ...x, value: v } : x))} />
            <Field l="برچسب (label)" value={s.label} onChange={v => update('stats', data.stats.map(x => x.id === s.id ? { ...x, label: v } : x))} />
          </ItemRow>
        ))}
      </div>
      <button onClick={() => update('stats', [...data.stats, { id: uid(), value: '۰', label: 'برچسب جدید' }])}
        className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
        style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}` }}>
        <Plus size={15} /> افزودن آمار
      </button>
    </Card>
  );

  const renderOverview = () => (
    <div className="space-y-4">
      <Card title="تیتر بخش رویکرد">
        <div className="grid gap-4">
          <Field l="Eyebrow" value={data.overviewEyebrow} onChange={v => update('overviewEyebrow', v)} />
          <Field l="تیتر اصلی" value={data.overviewTitle} onChange={v => update('overviewTitle', v)} />
          <Field l="توضیحات" value={data.overviewSub} onChange={v => update('overviewSub', v)} multiline />
        </div>
      </Card>
      <Card title="کارت‌های رویکرد" badge={`${data.overviewItems.length} کارت`}>
        <div className="space-y-3 mb-4">
          {data.overviewItems.map((item, i) => (
            <ItemRow key={item.id} title={item.title} subtitle={item.body.slice(0, 50) + '…'} accent={item.color}
              onDelete={() => update('overviewItems', data.overviewItems.filter(x => x.id !== item.id))}
              onDuplicate={() => update('overviewItems', [...data.overviewItems.slice(0, i+1), { ...item, id: uid() }, ...data.overviewItems.slice(i+1)])}>
              <Field l="عنوان" value={item.title} onChange={v => update('overviewItems', data.overviewItems.map(x => x.id === item.id ? { ...x, title: v } : x))} />
              <Field l="توضیحات" value={item.body}  onChange={v => update('overviewItems', data.overviewItems.map(x => x.id === item.id ? { ...x, body: v } : x))} multiline />
              <ColorField l="رنگ" value={item.color} onChange={v => update('overviewItems', data.overviewItems.map(x => x.id === item.id ? { ...x, color: v } : x))} />
            </ItemRow>
          ))}
        </div>
        <button onClick={() => update('overviewItems', [...data.overviewItems, { id: uid(), color: '#00BCD4', title: 'عنوان جدید', body: 'توضیحات...' }])}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}` }}>
          <Plus size={15} /> افزودن کارت
        </button>
      </Card>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      <Card title="تیتر بخش مراحل">
        <div className="grid gap-4">
          <Field l="Eyebrow" value={data.timelineEyebrow} onChange={v => update('timelineEyebrow', v)} />
          <Field l="تیتر اصلی" value={data.timelineTitle} onChange={v => update('timelineTitle', v)} />
          <Field l="توضیحات" value={data.timelineSub} onChange={v => update('timelineSub', v)} multiline />
        </div>
      </Card>
      <Card title="مراحل فرآیند" badge={`${data.timelineSteps.length} مرحله`}>
        <div className="space-y-3 mb-4">
          {data.timelineSteps.map((step, i) => (
            <ItemRow key={step.id} title={`${step.number} — ${step.title}`} subtitle={step.duration} accent={step.color}
              onDelete={() => update('timelineSteps', data.timelineSteps.filter(x => x.id !== step.id))}
              onDuplicate={() => update('timelineSteps', [...data.timelineSteps.slice(0, i+1), { ...step, id: uid() }, ...data.timelineSteps.slice(i+1)])}>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field l="شماره (مثلاً ۰۱)" value={step.number}   onChange={v => update('timelineSteps', data.timelineSteps.map(x => x.id === step.id ? { ...x, number: v } : x))} />
                <Field l="مدت زمان"          value={step.duration} onChange={v => update('timelineSteps', data.timelineSteps.map(x => x.id === step.id ? { ...x, duration: v } : x))} />
              </div>
              <Field l="عنوان مرحله" value={step.title} onChange={v => update('timelineSteps', data.timelineSteps.map(x => x.id === step.id ? { ...x, title: v } : x))} />
              <Field l="توضیحات"     value={step.desc}  onChange={v => update('timelineSteps', data.timelineSteps.map(x => x.id === step.id ? { ...x, desc: v } : x))} multiline />
              <TagsField l="خروجی‌های این مرحله (deliverables)" value={step.deliverables} onChange={v => update('timelineSteps', data.timelineSteps.map(x => x.id === step.id ? { ...x, deliverables: v.filter(Boolean) } : x))} />
              <TagsField l="تگ‌های کلیدی (tags)" value={step.tags} onChange={v => update('timelineSteps', data.timelineSteps.map(x => x.id === step.id ? { ...x, tags: v.filter(Boolean) } : x))} />
              <ColorField l="رنگ" value={step.color} onChange={v => update('timelineSteps', data.timelineSteps.map(x => x.id === step.id ? { ...x, color: v } : x))} />
            </ItemRow>
          ))}
        </div>
        <button onClick={() => update('timelineSteps', [...data.timelineSteps, { id: uid(), number: `۰${data.timelineSteps.length + 1}`, color: '#00BCD4', title: 'مرحله جدید', duration: 'هفته ۱–۲', desc: 'توضیحات...', deliverables: [], tags: [] }])}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}` }}>
          <Plus size={15} /> افزودن مرحله
        </button>
      </Card>
    </div>
  );

  const renderDeliverables = () => (
    <div className="space-y-4">
      <Card title="تیتر بخش خروجی‌ها">
        <div className="grid gap-4">
          <Field l="Eyebrow" value={data.deliverablesEyebrow} onChange={v => update('deliverablesEyebrow', v)} />
          <Field l="تیتر اصلی" value={data.deliverablesTitle} onChange={v => update('deliverablesTitle', v)} />
          <Field l="توضیحات" value={data.deliverablesSub} onChange={v => update('deliverablesSub', v)} multiline />
        </div>
      </Card>
      <Card title="کارت‌های خروجی" badge={`${data.deliverables.length} کارت`}>
        <div className="space-y-3 mb-4">
          {data.deliverables.map((d, i) => (
            <ItemRow key={d.id} title={d.title} subtitle={d.desc.slice(0, 55) + '…'} accent={d.color}
              onDelete={() => update('deliverables', data.deliverables.filter(x => x.id !== d.id))}
              onDuplicate={() => update('deliverables', [...data.deliverables.slice(0, i+1), { ...d, id: uid() }, ...data.deliverables.slice(i+1)])}>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field l="آیکون (emoji)" value={d.icon}  onChange={v => update('deliverables', data.deliverables.map(x => x.id === d.id ? { ...x, icon: v } : x))} placeholder="📊" />
                <ColorField l="رنگ" value={d.color} onChange={v => update('deliverables', data.deliverables.map(x => x.id === d.id ? { ...x, color: v } : x))} />
              </div>
              <Field l="عنوان" value={d.title} onChange={v => update('deliverables', data.deliverables.map(x => x.id === d.id ? { ...x, title: v } : x))} />
              <Field l="توضیحات" value={d.desc} onChange={v => update('deliverables', data.deliverables.map(x => x.id === d.id ? { ...x, desc: v } : x))} multiline />
              <TagsField l="ویژگی‌ها (features)" value={d.features} onChange={v => update('deliverables', data.deliverables.map(x => x.id === d.id ? { ...x, features: v.filter(Boolean) } : x))} />
            </ItemRow>
          ))}
        </div>
        <button onClick={() => update('deliverables', [...data.deliverables, { id: uid(), icon: '📌', color: '#00BCD4', title: 'خروجی جدید', desc: 'توضیحات...', features: [] }])}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}` }}>
          <Plus size={15} /> افزودن خروجی
        </button>
      </Card>
    </div>
  );

  const renderAudience = () => (
    <div className="space-y-4">
      <Card title="تیتر بخش مخاطبان">
        <div className="grid gap-4">
          <Field l="Eyebrow" value={data.audienceEyebrow} onChange={v => update('audienceEyebrow', v)} />
          <Field l="تیتر اصلی" value={data.audienceTitle} onChange={v => update('audienceTitle', v)} />
          <Field l="توضیحات" value={data.audienceSub} onChange={v => update('audienceSub', v)} multiline />
        </div>
      </Card>
      <Card title="گروه‌های مخاطب" badge={`${data.audience.length} گروه`}>
        <div className="space-y-3 mb-4">
          {data.audience.map((a, i) => (
            <ItemRow key={a.id} title={a.title} subtitle={a.badge} accent={a.color}
              onDelete={() => update('audience', data.audience.filter(x => x.id !== a.id))}
              onDuplicate={() => update('audience', [...data.audience.slice(0, i+1), { ...a, id: uid() }, ...data.audience.slice(i+1)])}>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field l="عنوان"  value={a.title} onChange={v => update('audience', data.audience.map(x => x.id === a.id ? { ...x, title: v } : x))} />
                <Field l="Badge"  value={a.badge} onChange={v => update('audience', data.audience.map(x => x.id === a.id ? { ...x, badge: v } : x))} />
              </div>
              <Field l="توضیحات" value={a.desc}  onChange={v => update('audience', data.audience.map(x => x.id === a.id ? { ...x, desc: v } : x))} multiline />
              <TagsField l="معیارها (criteria)" value={a.criteria} onChange={v => update('audience', data.audience.map(x => x.id === a.id ? { ...x, criteria: v.filter(Boolean) } : x))} />
              <ColorField l="رنگ" value={a.color} onChange={v => update('audience', data.audience.map(x => x.id === a.id ? { ...x, color: v } : x))} />
            </ItemRow>
          ))}
        </div>
        <button onClick={() => update('audience', [...data.audience, { id: uid(), title: 'گروه جدید', desc: 'توضیحات...', badge: 'New', color: '#00BCD4', criteria: [] }])}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}` }}>
          <Plus size={15} /> افزودن گروه
        </button>
      </Card>
    </div>
  );

  const renderCompare = () => (
    <div className="space-y-4">
      <Card title="تیتر جدول مقایسه">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field l="Eyebrow" value={data.compareEyebrow} onChange={v => update('compareEyebrow', v)} />
          <Field l="تیتر اصلی" value={data.compareTitle} onChange={v => update('compareTitle', v)} />
        </div>
      </Card>
      <Card title="ردیف‌های مقایسه" badge={`${data.compareRows.length} ردیف`}>
        <div className="space-y-3 mb-4">
          {data.compareRows.map((row, i) => (
            <ItemRow key={row.id} title={row.label} subtitle={`❌ ${row.before} → ✓ ${row.after}`}
              onDelete={() => update('compareRows', data.compareRows.filter(x => x.id !== row.id))}
              onDuplicate={() => update('compareRows', [...data.compareRows.slice(0, i+1), { ...row, id: uid() }, ...data.compareRows.slice(i+1)])}>
              <Field l="حوزه (label)" value={row.label}  onChange={v => update('compareRows', data.compareRows.map(x => x.id === row.id ? { ...x, label: v } : x))} />
              <div className="grid sm:grid-cols-2 gap-3">
                <Field l="❌ بدون ما (before)" value={row.before} onChange={v => update('compareRows', data.compareRows.map(x => x.id === row.id ? { ...x, before: v } : x))} />
                <Field l="✓ با ما (after)"    value={row.after}  onChange={v => update('compareRows', data.compareRows.map(x => x.id === row.id ? { ...x, after: v } : x))} />
              </div>
            </ItemRow>
          ))}
        </div>
        <button onClick={() => update('compareRows', [...data.compareRows, { id: uid(), label: 'حوزه جدید', before: 'بدون ما', after: 'با ما' }])}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}` }}>
          <Plus size={15} /> افزودن ردیف
        </button>
      </Card>
    </div>
  );

  const renderTestimonials = () => (
    <div className="space-y-4">
      <Card title="تیتر بخش نظرات">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field l="Eyebrow" value={data.testimonialsEyebrow} onChange={v => update('testimonialsEyebrow', v)} />
          <Field l="تیتر اصلی" value={data.testimonialsTitle} onChange={v => update('testimonialsTitle', v)} />
        </div>
      </Card>
      <Card title="نظرات مشتریان" badge={`${data.testimonials.length} نظر`}>
        <div className="space-y-3 mb-4">
          {data.testimonials.map((t, i) => (
            <ItemRow key={t.id} title={t.name} subtitle={`${t.role} · ${t.company} — ${t.amount}`} accent={t.color}
              onDelete={() => update('testimonials', data.testimonials.filter(x => x.id !== t.id))}
              onDuplicate={() => update('testimonials', [...data.testimonials.slice(0, i+1), { ...t, id: uid() }, ...data.testimonials.slice(i+1)])}>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field l="نام"        value={t.name}    onChange={v => update('testimonials', data.testimonials.map(x => x.id === t.id ? { ...x, name: v } : x))} />
                <Field l="نقش (role)" value={t.role}    onChange={v => update('testimonials', data.testimonials.map(x => x.id === t.id ? { ...x, role: v } : x))} />
                <Field l="شرکت"       value={t.company} onChange={v => update('testimonials', data.testimonials.map(x => x.id === t.id ? { ...x, company: v } : x))} />
                <Field l="مبلغ سرمایه (amount)" value={t.amount} onChange={v => update('testimonials', data.testimonials.map(x => x.id === t.id ? { ...x, amount: v } : x))} />
              </div>
              <Field l="نقل‌قول" value={t.quote} onChange={v => update('testimonials', data.testimonials.map(x => x.id === t.id ? { ...x, quote: v } : x))} multiline />
              <ColorField l="رنگ badge" value={t.color} onChange={v => update('testimonials', data.testimonials.map(x => x.id === t.id ? { ...x, color: v } : x))} />
            </ItemRow>
          ))}
        </div>
        <button onClick={() => update('testimonials', [...data.testimonials, { id: uid(), name: 'نام مشتری', role: 'Founder', company: 'Startup', quote: 'نقل‌قول...', amount: '$1M Seed', color: '#00BCD4' }])}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}` }}>
          <Plus size={15} /> افزودن نظر
        </button>
      </Card>
    </div>
  );

  const renderFaq = () => (
    <div className="space-y-4">
      <Card title="تیتر بخش سوالات">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field l="Eyebrow" value={data.faqEyebrow} onChange={v => update('faqEyebrow', v)} />
          <Field l="تیتر اصلی" value={data.faqTitle} onChange={v => update('faqTitle', v)} />
        </div>
      </Card>
      <Card title="سوالات متداول" badge={`${data.faqs.length} سوال`}>
        <div className="space-y-3 mb-4">
          {data.faqs.map((faq, i) => (
            <ItemRow key={faq.id} title={faq.q} subtitle={faq.a.slice(0, 60) + '…'}
              onDelete={() => update('faqs', data.faqs.filter(x => x.id !== faq.id))}
              onDuplicate={() => update('faqs', [...data.faqs.slice(0, i+1), { ...faq, id: uid() }, ...data.faqs.slice(i+1)])}>
              <Field l="سوال" value={faq.q} onChange={v => update('faqs', data.faqs.map(x => x.id === faq.id ? { ...x, q: v } : x))} />
              <Field l="جواب" value={faq.a} onChange={v => update('faqs', data.faqs.map(x => x.id === faq.id ? { ...x, a: v } : x))} multiline />
            </ItemRow>
          ))}
        </div>
        <button onClick={() => update('faqs', [...data.faqs, { id: uid(), q: 'سوال جدید؟', a: 'جواب...' }])}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}` }}>
          <Plus size={15} /> افزودن سوال
        </button>
      </Card>
    </div>
  );

  const renderCta = () => (
    <Card title="بخش CTA — فراخوان" badge="CTA">
      <div className="grid gap-4">
        <Field l="متن badge"         value={data.cta.badge}          onChange={v => update('cta', { ...data.cta, badge: v })} />
        <Field l="تیتر (قبل از highlight)" value={data.cta.title}   onChange={v => update('cta', { ...data.cta, title: v })} />
        <Field l="تیتر highlight (رنگی)"    value={data.cta.titleHighlight} onChange={v => update('cta', { ...data.cta, titleHighlight: v })} />
        <Field l="توضیحات"           value={data.cta.description}    onChange={v => update('cta', { ...data.cta, description: v })} multiline />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field l="دکمه اول (cyan)"  value={data.cta.btnPrimary}   onChange={v => update('cta', { ...data.cta, btnPrimary: v })} />
          <Field l="دکمه دوم (ghost)" value={data.cta.btnSecondary} onChange={v => update('cta', { ...data.cta, btnSecondary: v })} />
        </div>
        <TagsField l="ویژگی‌های زیر دکمه‌ها" value={data.cta.features} onChange={v => update('cta', { ...data.cta, features: v.filter(Boolean) })} />
      </div>
    </Card>
  );

  const RENDERERS: Record<SectionId, () => React.ReactNode> = {
    hero:         renderHero,
    stats:        renderStats,
    overview:     renderOverview,
    timeline:     renderTimeline,
    deliverables: renderDeliverables,
    audience:     renderAudience,
    compare:      renderCompare,
    testimonials: renderTestimonials,
    faq:          renderFaq,
    cta:          renderCta,
  };

  return (
    <div className="flex min-h-full" style={{ background: T.bg }} dir="rtl">

      {/* ── سایدبار سکشن‌ها ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-0 h-screen"
        style={{ background: 'rgba(4,8,18,0.97)', borderLeft: `1px solid ${T.border}` }}>
        {/* header */}
        <div className="px-4 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>مدیریت فرآیند</p>
          <p className="text-[10px] mt-0.5" style={{ color: T.textSub }}>Process Page CMS</p>
        </div>
        {/* nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {SECTIONS.map(sec => {
            const Icon = sec.icon;
            const isActive = active === sec.id;
            return (
              <button key={sec.id} onClick={() => setActive(sec.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-right"
                style={{
                  background: isActive ? `${sec.color}18` : 'transparent',
                  color: isActive ? sec.color : T.textMuted,
                  border: isActive ? `1px solid ${sec.color}30` : '1px solid transparent',
                }}>
                <Icon size={15} className="shrink-0" />
                <span className="flex-1">{sec.label}</span>
              </button>
            );
          })}
        </nav>
        {/* save area */}
        <div className="px-3 py-3 space-y-2" style={{ borderTop: `1px solid ${T.border}` }}>
          <button onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}` }}>
            {saved === 'saving' ? <Settings size={14} className="animate-spin" />
              : saved === 'ok'  ? <CheckCircle2 size={14} />
              : saved === 'err' ? <AlertCircle size={14} className="text-red-400" />
              : <Save size={14} />}
            {saved === 'saving' ? 'در حال ذخیره…'
              : saved === 'ok'  ? 'ذخیره شد ✓'
              : saved === 'err' ? 'خطا!'
              : 'ذخیره تغییرات'}
          </button>
          <button onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ color: 'rgba(239,68,68,0.6)', border: '1px solid transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.6)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <RotateCcw size={12} /> بازنشانی
          </button>
        </div>
      </aside>

      {/* ── محتوای اصلی ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Topbar */}
        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-20"
          style={{ background: 'rgba(7,17,30,0.95)', borderBottom: `1px solid ${T.border}`, backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            {/* mobile section picker */}
            <select value={active} onChange={e => setActive(e.target.value as SectionId)}
              className="lg:hidden text-sm rounded-lg px-3 py-2 outline-none"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}>
              {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-white">{SECTIONS.find(s => s.id === active)?.label}</p>
              <p className="text-[10px]" style={{ color: T.textMuted }}>ویرایش محتوای صفحه فرآیند</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* نشانگر وضعیت */}
            {saved !== 'idle' && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                style={{
                  background: saved === 'ok' ? 'rgba(16,185,129,0.1)' : saved === 'err' ? 'rgba(239,68,68,0.1)' : T.accentBg,
                  color: saved === 'ok' ? '#10b981' : saved === 'err' ? '#ef4444' : T.accent,
                  border: `1px solid ${saved === 'ok' ? 'rgba(16,185,129,0.25)' : saved === 'err' ? 'rgba(239,68,68,0.25)' : T.accentBdr}`,
                }}>
                {saved === 'ok' ? <><CheckCircle2 size={11} /> ذخیره شد</> : saved === 'err' ? <><AlertCircle size={11} /> خطا!</> : <><Settings size={11} className="animate-spin" /> در حال ذخیره</>}
              </span>
            )}
            <button onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: T.accentBg, color: T.accent, border: `1px solid ${T.accentBdr}` }}>
              <Save size={14} /> ذخیره
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-5 lg:p-6">
          {RENDERERS[active]?.()}
        </div>
      </div>
    </div>
  );
}
