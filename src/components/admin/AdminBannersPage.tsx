import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Eye, EyeOff, Save, Copy,
  Image as ImageIcon, ExternalLink, ChevronDown, ChevronUp,
  CheckCircle2, Layout, Target, Palette, Edit3,
  AlertTriangle, ArrowRight, Sparkles, Pin,
} from 'lucide-react';
import { fetchSettings, saveSetting, emptyBanner, BANNER_TEMPLATES, BANNER_CORNER_LABELS } from '../../lib/settingsApi';
import type { InlineBanner, BannerPage, BannerTemplate, BannerCorner, BannerDisplayMode } from '../../lib/settingsApi';
import { PAGE_SECTIONS } from '../../lib/settingsApi';

// ── Page labels ───────────────────────────────────────────────────────────────
const PAGE_LABELS: Record<BannerPage, string> = {
  home:       '🏠 صفحه اصلی',
  services:   '📦 خدمات',
  process:    '⚙️ فرآیند',
  blog:       '📰 بلاگ',
  about:      'ℹ️ درباره ما',
  contact:    '📞 تماس',
  evaluation: '📋 درخواست ارزیابی',
};
const ALL_PAGES: BannerPage[] = ['home', 'services', 'process', 'blog', 'about', 'contact', 'evaluation'];

// ── Shared styles ─────────────────────────────────────────────────────────────
const cardSt  = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };
const inputSt = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
const inputCls = 'w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors';

function onFI(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'rgba(0,188,212,0.5)';
}
function onFO(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
}

// ── Field helpers ─────────────────────────────────────────────────────────────
function FInput({ label, value, onChange, placeholder = '', ltr = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; ltr?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={inputCls} style={ltr ? { ...inputSt, direction: 'ltr' } : inputSt}
        onFocus={onFI} onBlur={onFO} />
    </div>
  );
}
function FTextarea({ label, value, onChange, rows = 2, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      <textarea value={value} rows={rows} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className={inputCls + ' resize-none'} style={inputSt}
        onFocus={onFI} onBlur={onFO} />
    </div>
  );
}
function Toggle({ value, onChange, label, sub }: { value: boolean; onChange: () => void; label: string; sub?: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1">
      <div>
        <p className="text-sm text-white">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <div onClick={onChange} className="w-10 h-5 rounded-full relative transition-all cursor-pointer flex-shrink-0"
        style={{ background: value ? 'rgba(0,188,212,0.55)' : 'rgba(255,255,255,0.1)', border: value ? '1px solid rgba(0,188,212,0.7)' : '1px solid rgba(255,255,255,0.15)' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow"
          style={{ right: value ? 1 : 'auto', left: value ? 'auto' : 1 }} />
      </div>
    </label>
  );
}

// ── Realistic banner card renderer (compact card format with image support) ─────
function TemplateBannerCard({ tpl, banner, onClick, selected }: {
  tpl: BannerTemplate;
  banner: InlineBanner;
  onClick: () => void;
  selected: boolean;
}) {
  const ac = banner.accent_color || tpl.accent;
  const title  = banner.title || tpl.title;
  const desc   = banner.description || tpl.description;
  const ctaTxt = banner.cta_text || tpl.cta_text;
  const icon   = banner.icon || tpl.icon;
  const badge  = banner.badge || tpl.badge;
  const bg     = tpl.gradient;
  const hasImg = banner.show_image && banner.image_url;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative rounded-xl overflow-hidden cursor-pointer w-full"
      style={{
        background: bg,
        border: selected ? `2px solid ${ac}` : `1px solid ${ac}35`,
        boxShadow: selected
          ? `0 0 20px ${ac}45, 0 4px 16px rgba(0,0,0,0.55)`
          : `0 2px 12px rgba(0,0,0,0.4)`,
      }}
    >
      {/* shimmer top */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${ac}80, transparent)` }} />
      {/* glow blob */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl pointer-events-none"
        style={{ background: ac, opacity: 0.15 }} />

      {/* ── image strip ── */}
      {hasImg && (
        <div className="relative overflow-hidden" style={{ height: 72 }}>
          <img src={banner.image_url} alt=""
            className="w-full h-full object-cover" style={{ opacity: 0.82 }} />
          <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
            style={{ background: `linear-gradient(to bottom, transparent, ${bg.slice(bg.indexOf('#'), bg.indexOf('#') + 7)})` }} />
          {badge && (
            <span className="absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: `${ac}cc`, color: '#fff' }}>
              {badge}
            </span>
          )}
        </div>
      )}

      {/* ── body ── */}
      <div className="relative px-3 py-2.5" dir="rtl">
        {/* top row: icon + badge */}
        <div className="flex items-center gap-2 mb-1.5">
          {!hasImg && (
            <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-base"
              style={{ background: `${ac}18`, border: `1px solid ${ac}30` }}>
              {icon}
            </div>
          )}
          {badge && !hasImg && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: `${ac}22`, color: ac, border: `1px solid ${ac}38` }}>
              {badge}
            </span>
          )}
        </div>

        {/* title */}
        <p className="font-black text-white leading-tight text-xs mb-1"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
          {title}
        </p>

        {/* desc */}
        {desc && (
          <p className="text-slate-400 leading-relaxed line-clamp-1 mb-2" style={{ fontSize: 10 }}>
            {desc}
          </p>
        )}

        {/* CTA button */}
        {ctaTxt && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-md w-fit text-[10px] font-black text-white"
            style={{
              background: `linear-gradient(135deg, ${ac}dd, ${ac}88)`,
              border: `1px solid ${ac}60`,
            }}>
            {ctaTxt}
            <ExternalLink size={9} />
          </div>
        )}
      </div>

      {/* bottom line */}
      <div className="h-[1.5px]"
        style={{ background: `linear-gradient(90deg, transparent, ${ac}bb, transparent)` }} />

      {/* selected check */}
      {selected && (
        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
          style={{ background: ac, boxShadow: `0 0 8px ${ac}80` }}>
          <CheckCircle2 size={11} className="text-white" />
        </div>
      )}
    </motion.div>
  );
}

// ── Mini thumbnail for gallery ────────────────────────────────────────────────
function TemplateThumbnail({ tpl, selected, onClick }: {
  tpl: BannerTemplate; selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative rounded-xl overflow-hidden text-right"
      style={{
        background: tpl.gradient,
        border: selected ? `2px solid ${tpl.accent}` : `1px solid ${tpl.accent}30`,
        boxShadow: selected ? `0 0 16px ${tpl.accent}50` : `0 2px 8px rgba(0,0,0,0.4)`,
        padding: '10px 12px',
        minHeight: 64,
        width: '100%',
      }}
    >
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-30"
        style={{ background: tpl.accent }} />
      <div className="relative flex items-center gap-2">
        <span className="text-xl">{tpl.icon}</span>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-white font-bold text-xs truncate">{tpl.name}</p>
          <p className="text-xs mt-0.5" style={{ color: tpl.accent, fontSize: 10 }}>{tpl.category}</p>
        </div>
        {selected && <CheckCircle2 size={13} style={{ color: tpl.accent, flexShrink: 0 }} />}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${tpl.accent}60, transparent)` }} />
    </motion.button>
  );
}

// ── Position Picker — visual 3×3 grid for 8 corners ─────────────────────────
const CORNER_GRID: Array<BannerCorner | null> = [
  'top-left',    'top-center',    'top-right',
  'middle-left',  null,            'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

const CORNER_ICONS: Record<BannerCorner, string> = {
  'top-left':      '↖',
  'top-center':    '↑',
  'top-right':     '↗',
  'middle-left':   '←',
  'middle-right':  '→',
  'bottom-left':   '↙',
  'bottom-center': '↓',
  'bottom-right':  '↘',
};

// ── نگاشت corner به توضیح فارسی تأثیر واقعی روی سایت ────────────────────────
const CORNER_EFFECT: Record<BannerCorner, string> = {
  'top-left':      'بالا — چپ‌چین',
  'top-center':    'بالا — وسط‌چین',
  'top-right':     'بالا — راست‌چین',
  'middle-left':   'وسط — چپ‌چین',
  'middle-right':  'وسط — راست‌چین',
  'bottom-left':   'پایین — چپ‌چین',
  'bottom-center': 'پایین — وسط‌چین',
  'bottom-right':  'پایین — راست‌چین',
};

// ── 3×3 visual position picker ────────────────────────────────────────────────
function CornerGrid({ corner, onCornerChange }: {
  corner: BannerCorner;
  onCornerChange: (c: BannerCorner) => void;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-2 font-medium">انتخاب جهت قرارگیری بنر:</p>

      {/* mini screen mock */}
      <div
        className="relative mx-auto rounded-xl overflow-hidden"
        style={{
          width: 228,
          height: 152,
          background: 'linear-gradient(135deg,#0d1829 0%,#1a2540 100%)',
          border: '2px solid rgba(255,255,255,0.12)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,188,212,0.05) 0%, transparent 70%)' }} />

        {/* 3×3 grid */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-1.5 gap-1">
          {CORNER_GRID.map((c, i) => {
            if (c === null) {
              return (
                <div key={i} className="rounded-md flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="space-y-0.5 w-6">
                    <div className="h-px rounded bg-slate-600 opacity-70" />
                    <div className="h-px rounded bg-slate-600 opacity-50 w-4" />
                    <div className="h-px rounded bg-slate-600 opacity-50 w-5" />
                  </div>
                </div>
              );
            }
            const isSel = corner === c;
            return (
              <button key={i} type="button" onClick={() => onCornerChange(c)}
                title={CORNER_EFFECT[c]}
                className="rounded-md flex items-center justify-center font-black transition-all"
                style={{
                  background: isSel ? 'rgba(0,188,212,0.38)' : 'rgba(255,255,255,0.06)',
                  border: isSel ? '1.5px solid rgba(0,188,212,0.85)' : '1px solid rgba(255,255,255,0.1)',
                  color: isSel ? '#67e8f9' : 'rgba(255,255,255,0.4)',
                  fontSize: 15,
                  boxShadow: isSel ? '0 0 12px rgba(0,188,212,0.45)' : 'none',
                }}>
                {CORNER_ICONS[c]}
              </button>
            );
          })}
        </div>
      </div>

      {/* selected label — نمایش تأثیر واقعی */}
      <p className="text-center text-xs text-cyan-400 font-bold mt-2">
        {CORNER_EFFECT[corner]}
      </p>

      {/* 8 chip buttons — هر کدام تأثیر واقعی خود را نشان می‌دهند */}
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        {(Object.keys(BANNER_CORNER_LABELS) as BannerCorner[]).map(c => {
          const isSel = corner === c;
          return (
            <button key={c} type="button" onClick={() => onCornerChange(c)}
              className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-all"
              style={{
                background: isSel ? 'rgba(0,188,212,0.18)' : 'rgba(255,255,255,0.04)',
                border: isSel ? '1px solid rgba(0,188,212,0.5)' : '1px solid rgba(255,255,255,0.08)',
              }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{CORNER_ICONS[c]}</span>
              <span className="text-[9px] font-bold leading-tight text-center"
                style={{ color: isSel ? '#67e8f9' : 'rgba(255,255,255,0.45)', lineHeight: 1.3 }}>
                {CORNER_EFFECT[c]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PositionPicker({
  displayMode, corner, fixedWidth,
  onModeChange, onCornerChange, onWidthChange,
}: {
  displayMode:   BannerDisplayMode;
  corner:        BannerCorner;
  fixedWidth:    string;
  onModeChange:  (m: BannerDisplayMode) => void;
  onCornerChange:(c: BannerCorner) => void;
  onWidthChange: (w: string) => void;
}) {
  return (
    <div className="rounded-xl p-4 space-y-4" style={cardSt}>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Pin size={13} /> حالت نمایش و موقعیت
      </p>

      {/* mode toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(['inline', 'fixed'] as BannerDisplayMode[]).map(m => (
          <button key={m} type="button" onClick={() => onModeChange(m)}
            className="py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: displayMode === m ? 'rgba(0,188,212,0.18)' : 'rgba(255,255,255,0.05)',
              border: displayMode === m ? '1px solid rgba(0,188,212,0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: displayMode === m ? '#67e8f9' : 'rgba(255,255,255,0.55)',
            }}>
            {m === 'inline' ? '📄 Inline (داخل صفحه)' : '📌 Fixed (شناور)'}
          </button>
        ))}
      </div>

      {/* ─── INLINE: full 8-direction picker ─── */}
      {displayMode === 'inline' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed rounded-lg px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            بنر در سکشن انتخاب‌شده از تب «هدف‌گیری» داخل صفحه نمایش داده می‌شود.
            جهت قرارگیری بنر را در داخل سکشن انتخاب کنید:
          </p>
          <CornerGrid corner={corner} onCornerChange={onCornerChange} />
        </div>
      )}

      {/* ─── FIXED: 8-direction + width ─── */}
      {displayMode === 'fixed' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed rounded-lg px-3 py-2"
            style={{ background: 'rgba(0,188,212,0.06)', border: '1px solid rgba(0,188,212,0.15)' }}>
            بنر به صورت <strong className="text-cyan-300">position: fixed</strong> روی صفحه نمایش داده می‌شود.
            صفحات مورد نظر را از تب «هدف‌گیری» انتخاب کنید.
          </p>

          <CornerGrid corner={corner} onCornerChange={onCornerChange} />

          {/* width control */}
          <div>
            <label className="block text-xs text-slate-400 mb-2 font-medium">عرض بنر</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {['280px', '320px', '360px', '400px', '50%', '90%'].map(w => (
                <button key={w} type="button" onClick={() => onWidthChange(w)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                  style={{
                    background: fixedWidth === w ? 'rgba(0,188,212,0.2)' : 'rgba(255,255,255,0.05)',
                    border: fixedWidth === w ? '1px solid rgba(0,188,212,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: fixedWidth === w ? '#67e8f9' : 'rgba(255,255,255,0.5)',
                  }}>
                  {w}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={fixedWidth}
                onChange={e => onWidthChange(e.target.value)}
                placeholder="360px یا 40%"
                className={inputCls + ' text-left'}
                style={{ ...inputSt, direction: 'ltr', maxWidth: 120 }}
                onFocus={onFI} onBlur={onFO}
              />
              <span className="text-xs text-slate-500">یا مقدار دلخواه</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Placement selector ────────────────────────────────────────────────────────
function PlacementEditor({ placements, onChange }: {
  placements: Partial<Record<BannerPage, string[]>>;
  onChange: (p: Partial<Record<BannerPage, string[]>>) => void;
}) {
  const [openPage, setOpenPage] = useState<BannerPage | null>(null);

  const togglePage = (page: BannerPage) => {
    const next = { ...placements };
    if (next[page]) { delete next[page]; } else { next[page] = []; }
    onChange(next);
  };
  const toggleSection = (page: BannerPage, sec: string) => {
    const cur = placements[page] ?? [];
    const next = cur.includes(sec) ? cur.filter(s => s !== sec) : [...cur, sec];
    onChange({ ...placements, [page]: next });
  };

  return (
    <div className="space-y-2">
      {ALL_PAGES.map(page => {
        const active = !!placements[page];
        const secs = placements[page] ?? [];
        const isOpen = openPage === page;
        return (
          <div key={page} className="rounded-xl overflow-hidden" style={cardSt}>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <button type="button" onClick={() => togglePage(page)}
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: active ? 'rgba(0,188,212,0.2)' : 'rgba(255,255,255,0.07)', border: active ? '1px solid rgba(0,188,212,0.5)' : '1px solid rgba(255,255,255,0.15)' }}>
                {active && <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 block" />}
              </button>
              <span className="flex-1 text-sm text-white font-medium">{PAGE_LABELS[page]}</span>
              {active && <span className="text-[10px] text-cyan-400 font-bold">{secs.length} سکشن</span>}
              {active && (
                <button type="button" onClick={() => setOpenPage(isOpen ? null : page)} className="text-slate-400 hover:text-white">
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
            <AnimatePresence>
              {active && isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-3 pb-3 flex flex-wrap gap-2">
                    {PAGE_SECTIONS[page].map(sec => {
                      const checked = secs.includes(sec.key);
                      return (
                        <button key={sec.key} type="button" onClick={() => toggleSection(page, sec.key)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: checked ? 'rgba(0,188,212,0.18)' : 'rgba(255,255,255,0.05)',
                            border: checked ? '1px solid rgba(0,188,212,0.4)' : '1px solid rgba(255,255,255,0.1)',
                            color: checked ? '#67e8f9' : 'rgba(255,255,255,0.6)',
                          }}>
                          {checked && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                          {sec.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab type ─────────────────────────────────────────────────────────────────
type TabId = 'gallery' | 'edit' | 'placement' | 'list';
const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'gallery',   label: 'انتخاب قالب',  icon: <Sparkles size={14} /> },
  { id: 'edit',      label: 'ویرایش محتوا', icon: <Edit3 size={14} /> },
  { id: 'placement', label: 'هدف‌گیری',     icon: <Target size={14} /> },
  { id: 'list',      label: 'همه بنرها',    icon: <Layout size={14} /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminBannersPage() {
  const [banners, setBanners]       = useState<InlineBanner[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [selected, setSelected]     = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<TabId>('gallery');
  const [filterCat, setFilterCat]   = useState<string>('همه');

  const selectedBanner = banners.find(b => b.id === selected) ?? null;
  const selectedTpl = BANNER_TEMPLATES.find(t => t.id === selectedBanner?.template_id) ?? BANNER_TEMPLATES[0];

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSettings().then(s => { setBanners(s.inline_banners ?? []); setLoading(false); });
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    await saveSetting('inline_banners', banners);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }, [banners]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const patch = (p: Partial<InlineBanner>) => {
    if (!selected) return;
    setBanners(prev => prev.map(b => b.id === selected ? { ...b, ...p } : b));
  };

  const addBanner = () => {
    const b = emptyBanner();
    setBanners(prev => [...prev, b]);
    setSelected(b.id);
    setActiveTab('gallery');
  };

  const deleteBanner = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    if (selected === id) { setSelected(null); }
  };

  const duplicate = (id: string) => {
    const src = banners.find(b => b.id === id);
    if (!src) return;
    const copy = { ...src, id: crypto.randomUUID() };
    setBanners(prev => [...prev, copy]);
    setSelected(copy.id);
  };

  const placementSummary = (b: InlineBanner) => {
    const pages = Object.keys(b.placements ?? {}) as BannerPage[];
    if (pages.length === 0) return 'بدون هدف‌گیری';
    return pages.map(p => PAGE_LABELS[p]).join('، ');
  };

  const categories = ['همه', ...Array.from(new Set(BANNER_TEMPLATES.map(t => t.category)))];

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-full" dir="rtl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-cyan-400" />
            مدیریت بنرهای تبلیغاتی
          </h1>
          <p className="text-xs text-slate-500 mt-1">از ۲۰ قالب آماده انتخاب کنید، لینک بزنید و در هر صفحه قرار دهید</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={addBanner}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#00BCD4,#0891b2)', boxShadow: '0 4px 16px rgba(0,188,212,0.3)' }}>
            <Plus size={16} /> بنر جدید
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: saved ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)',
              border: saved ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.12)',
              color: saved ? '#6ee7b7' : '#fff',
            }}>
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saving ? 'ذخیره...' : saved ? 'ذخیره شد' : 'ذخیره همه'}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl overflow-x-auto" style={cardSt}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
            style={{
              background: activeTab === tab.id ? 'rgba(0,188,212,0.15)' : 'transparent',
              color: activeTab === tab.id ? '#67e8f9' : 'rgba(255,255,255,0.5)',
              border: activeTab === tab.id ? '1px solid rgba(0,188,212,0.25)' : '1px solid transparent',
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════ TAB: GALLERY ══════════════ */}
      {activeTab === 'gallery' && (
        <div>
          {/* banner selector notice */}
          {!selectedBanner && (
            <div className="rounded-xl p-4 mb-5 flex items-center gap-3"
              style={{ background: 'rgba(0,188,212,0.07)', border: '1px solid rgba(0,188,212,0.2)' }}>
              <AlertTriangle size={16} className="text-cyan-400 flex-shrink-0" />
              <p className="text-sm text-slate-300">ابتدا از «همه بنرها» یک بنر انتخاب کنید یا بنر جدید بسازید، سپس قالب آن را از اینجا تغییر دهید.</p>
            </div>
          )}

          {selectedBanner && (
            <div className="rounded-xl p-3 mb-5 flex items-center gap-3"
              style={{ background: 'rgba(0,188,212,0.08)', border: '1px solid rgba(0,188,212,0.25)' }}>
              <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
              <p className="text-sm text-white font-medium">
                بنر <span className="text-cyan-300 font-bold">«{selectedBanner.title || '(بدون عنوان)'}»</span> انتخاب شده — قالب مورد نظر را کلیک کنید
              </p>
            </div>
          )}

          {/* category filter */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: filterCat === cat ? 'rgba(0,188,212,0.2)' : 'rgba(255,255,255,0.05)',
                  border: filterCat === cat ? '1px solid rgba(0,188,212,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  color: filterCat === cat ? '#67e8f9' : 'rgba(255,255,255,0.55)',
                }}>
                {cat}
              </button>
            ))}
          </div>

          {/* templates grid — 3 ستون یکسان و منظم */}
          <div className="grid grid-cols-3 gap-2.5">
            {BANNER_TEMPLATES
              .filter(t => filterCat === 'همه' || t.category === filterCat)
              .map(tpl => {
                const isSel = selectedBanner?.template_id === tpl.id;
                const previewBanner: InlineBanner = selectedBanner
                  ? { ...emptyBanner(), ...selectedBanner, template_id: tpl.id }
                  : { ...emptyBanner(), template_id: tpl.id };

                return (
                  <div key={tpl.id} className="flex flex-col gap-1">
                    <TemplateBannerCard
                      tpl={tpl}
                      banner={previewBanner}
                      selected={isSel && !!selectedBanner}
                      onClick={() => {
                        if (!selectedBanner) return;
                        patch({ template_id: tpl.id, accent_color: tpl.accent });
                        setActiveTab('edit');
                      }}
                    />
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-[9px] text-slate-500 truncate leading-none">{tpl.name}</span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 leading-none"
                        style={{ background: `${tpl.accent}18`, color: tpl.accent }}>
                        {tpl.category}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ══════════════ TAB: EDIT ══════════════ */}
      {activeTab === 'edit' && (
        <div className="space-y-4">
          {!selectedBanner ? (
            <div className="text-center py-14 text-slate-500">
              <AlertTriangle size={36} className="mx-auto mb-3 opacity-25" />
              <p className="text-sm mb-3">ابتدا یک بنر از تب «همه بنرها» انتخاب کنید</p>
              <button onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'rgba(0,188,212,0.2)', border: '1px solid rgba(0,188,212,0.3)' }}>
                رفتن به لیست بنرها
              </button>
            </div>
          ) : (
            <>
              {/* live full-size preview */}
              <div className="rounded-2xl overflow-hidden mb-1"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <TemplateBannerCard
                  tpl={selectedTpl}
                  banner={selectedBanner}
                  selected={false}
                  onClick={() => {}}
                />
              </div>
              <p className="text-xs text-slate-600 text-center -mt-1 mb-2">پیش‌نمایش زنده — با ویرایش فیلدها به‌روز می‌شود</p>

              {/* change template shortcut */}
              <button onClick={() => setActiveTab('gallery')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all mb-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                <Palette size={14} />
                تغییر قالب (قالب فعلی: {selectedTpl.name})
              </button>

              {/* content fields */}
              <div className="rounded-xl p-4 space-y-4" style={cardSt}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">محتوای متنی</p>
                <FInput label="عنوان اصلی" value={selectedBanner.title} onChange={v => patch({ title: v })}
                  placeholder={selectedTpl.title} />
                <FTextarea label="توضیح / زیرنویس" value={selectedBanner.description}
                  onChange={v => patch({ description: v })} placeholder={selectedTpl.description} rows={2} />
                <div className="grid grid-cols-2 gap-3">
                  <FInput label="برچسب (badge)" value={selectedBanner.badge}
                    onChange={v => patch({ badge: v })} placeholder={selectedTpl.badge} />
                  <FInput label="آیکون (emoji)" value={selectedBanner.icon}
                    onChange={v => patch({ icon: v })} placeholder={selectedTpl.icon} />
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-xl p-4 space-y-4" style={cardSt}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">دکمه و لینک</p>
                <FInput label="متن دکمه CTA" value={selectedBanner.cta_text}
                  onChange={v => patch({ cta_text: v })} placeholder={selectedTpl.cta_text} />
                <FInput label="🔗 لینک مقصد (URL)" value={selectedBanner.cta_url}
                  onChange={v => patch({ cta_url: v })} placeholder="https://example.com" ltr />
                <div className="space-y-2 pt-1">
                  <Toggle value={selectedBanner.open_new_tab} onChange={() => patch({ open_new_tab: !selectedBanner.open_new_tab })}
                    label="باز شدن در تب جدید" />
                  <Toggle value={selectedBanner.full_clickable} onChange={() => patch({ full_clickable: !selectedBanner.full_clickable })}
                    label="کلیک روی کل بنر" sub="وقتی فعال است، هر جایی از بنر کلیک شود لینک باز می‌شود" />
                </div>
              </div>

              {/* image */}
              <div className="rounded-xl p-4 space-y-3" style={cardSt}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon size={13} /> تصویر / GIF
                </p>
                <Toggle value={selectedBanner.show_image} onChange={() => patch({ show_image: !selectedBanner.show_image })}
                  label="نمایش تصویر به جای آیکون" />
                {selectedBanner.show_image && (
                  <>
                    <FInput label="URL تصویر یا GIF" value={selectedBanner.image_url}
                      onChange={v => patch({ image_url: v })} placeholder="https://example.com/banner.gif" ltr />
                    {selectedBanner.image_url && (
                      <div className="flex items-center gap-3">
                        <img src={selectedBanner.image_url} alt=""
                          className="w-14 h-14 rounded-xl object-cover border"
                          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
                        />
                        <p className="text-xs text-slate-500">پیش‌نمایش تصویر</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* color override */}
              <div className="rounded-xl p-4 space-y-3" style={cardSt}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Palette size={13} /> رنگ برند (override)
                </p>
                <div className="flex items-center gap-3">
                  <input type="color" value={selectedBanner.accent_color}
                    onChange={e => patch({ accent_color: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0.5" />
                  <input value={selectedBanner.accent_color}
                    onChange={e => patch({ accent_color: e.target.value })}
                    className={inputCls} style={{ ...inputSt, direction: 'ltr', maxWidth: 110 }}
                    onFocus={onFI} onBlur={onFO} />
                  <button onClick={() => patch({ accent_color: selectedTpl.accent })}
                    className="text-xs text-slate-500 hover:text-white transition-colors">
                    بازگشت به رنگ قالب
                  </button>
                </div>
              </div>

              {/* position picker */}
              <PositionPicker
                displayMode={(selectedBanner.display_mode ?? 'inline') as BannerDisplayMode}
                corner={(selectedBanner.corner ?? 'bottom-right') as BannerCorner}
                fixedWidth={selectedBanner.fixed_width ?? '360px'}
                onModeChange={m => patch({ display_mode: m })}
                onCornerChange={c => patch({ corner: c })}
                onWidthChange={w => patch({ fixed_width: w })}
              />

              {/* visible */}
              <div className="rounded-xl p-4" style={cardSt}>
                <Toggle value={selectedBanner.visible} onChange={() => patch({ visible: !selectedBanner.visible })}
                  label="نمایش این بنر در سایت" sub="اگر غیرفعال باشد در هیچ صفحه‌ای نشان داده نمی‌شود" />
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════ TAB: PLACEMENT ══════════════ */}
      {activeTab === 'placement' && (
        <div className="space-y-4">
          {!selectedBanner ? (
            <div className="text-center py-14 text-slate-500">
              <Target size={36} className="mx-auto mb-3 opacity-25" />
              <p className="text-sm mb-3">ابتدا یک بنر از تب «همه بنرها» انتخاب کنید</p>
              <button onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'rgba(0,188,212,0.2)', border: '1px solid rgba(0,188,212,0.3)' }}>
                رفتن به لیست
              </button>
            </div>
          ) : (
            <>
              {/* نمایش راهنما بر اساس حالت fixed یا inline */}
              {(selectedBanner.display_mode ?? 'inline') === 'fixed' ? (
                <div className="rounded-xl p-4" style={{ ...cardSt, borderColor: 'rgba(251,191,36,0.2)' }}>
                  <div className="flex items-start gap-2.5 mb-4">
                    <Pin size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-white">انتخاب صفحه‌های نمایش (Fixed)</p>
                      <p className="text-xs text-amber-400/80 mt-0.5">
                        در حالت Fixed فقط صفحه را انتخاب کنید — سکشن نیازی ندارد.
                        بنر شناور روی کل صفحه نمایش داده می‌شود.
                      </p>
                    </div>
                  </div>
                  {/* در حالت fixed فقط checkbox صفحه — بدون باز کردن سکشن */}
                  <div className="space-y-2">
                    {ALL_PAGES.map(page => {
                      const active = !!(selectedBanner.placements ?? {})[page];
                      return (
                        <div key={page} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={cardSt}>
                          <button type="button"
                            onClick={() => {
                              const next = { ...(selectedBanner.placements ?? {}) };
                              if (next[page]) { delete next[page]; } else { next[page] = []; }
                              patch({ placements: next });
                            }}
                            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                            style={{ background: active ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.07)', border: active ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.15)' }}>
                            {active && <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 block" />}
                          </button>
                          <span className="flex-1 text-sm text-white font-medium">{PAGE_LABELS[page]}</span>
                          {active && <span className="text-[10px] text-amber-400 font-bold">✓ فعال</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
              <div className="rounded-xl p-4" style={{ ...cardSt, borderColor: 'rgba(0,188,212,0.15)' }}>
                <div className="flex items-start gap-2.5 mb-4">
                  <Target size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">انتخاب صفحه و سکشن (Inline)</p>
                    <p className="text-xs text-slate-500 mt-0.5">صفحه‌ها را فعال کنید و سکشن دقیق نمایش را تعیین کنید</p>
                  </div>
                </div>
                <PlacementEditor
                  placements={selectedBanner.placements ?? {}}
                  onChange={p => patch({ placements: p })}
                />
              </div>
              )}

              {/* summary */}
              {Object.keys(selectedBanner.placements ?? {}).length > 0 && (
                <div className="rounded-xl p-4 space-y-2.5" style={cardSt}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">خلاصه هدف‌گیری</p>
                  {(Object.entries(selectedBanner.placements ?? {}) as [BannerPage, string[]][]).map(([page, secs]) => (
                    <div key={page} className="flex items-start gap-2 text-xs">
                      <span className="text-slate-300 font-medium w-28 flex-shrink-0">{PAGE_LABELS[page]}:</span>
                      <div className="flex flex-wrap gap-1">
                        {secs.length === 0
                          ? <span className="text-slate-600">بدون سکشن</span>
                          : secs.map(s => {
                              const label = PAGE_SECTIONS[page]?.find(x => x.key === s)?.label ?? s;
                              return (
                                <span key={s} className="px-1.5 py-0.5 rounded text-[10px]"
                                  style={{ background: 'rgba(0,188,212,0.15)', color: '#67e8f9' }}>
                                  {label}
                                </span>
                              );
                            })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════ TAB: LIST ══════════════ */}
      {activeTab === 'list' && (
        <div className="space-y-3">
          {banners.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Layout size={40} className="mx-auto mb-3 opacity-25" />
              <p className="text-sm mb-3">هنوز بنری اضافه نشده</p>
              <button onClick={addBanner}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'rgba(0,188,212,0.2)', border: '1px solid rgba(0,188,212,0.3)' }}>
                + اولین بنر را بسازید
              </button>
            </div>
          ) : (
            banners.map(b => {
              const tpl = BANNER_TEMPLATES.find(t => t.id === b.template_id) ?? BANNER_TEMPLATES[0];
              const isSel = selected === b.id;
              return (
                <motion.div key={b.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {/* mini preview strip */}
                  <div className="rounded-2xl overflow-hidden mb-1.5 cursor-pointer relative group"
                    onClick={() => { setSelected(b.id); setActiveTab('edit'); }}
                    style={{
                      border: isSel ? `2px solid ${tpl.accent}` : `1px solid ${tpl.accent}22`,
                      boxShadow: isSel ? `0 0 20px ${tpl.accent}35` : 'none',
                    }}>
                    <TemplateBannerCard tpl={tpl} banner={b} selected={false} onClick={() => {}} />
                    {/* overlay with actions */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-2 px-4"
                      style={{ background: 'rgba(0,0,0,0.45)' }}>
                      <button onClick={async e => { e.stopPropagation(); const next = banners.map(x => x.id === b.id ? { ...x, visible: !x.visible } : x); setBanners(next); await saveSetting('inline_banners', next); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all"
                        style={{ background: 'rgba(255,255,255,0.1)' }}>
                        {b.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={e => { e.stopPropagation(); duplicate(b.id); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                        style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <Copy size={14} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteBanner(b.id); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {/* meta row */}
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: b.visible ? tpl.accent : 'rgba(255,255,255,0.2)' }} />
                    <span className="text-xs text-slate-400 truncate flex-1">{b.title || '(بدون عنوان)'}</span>
                    <span className="text-[10px]" style={{ color: tpl.accent }}>{tpl.name}</span>
                    <button onClick={() => { setSelected(b.id); setActiveTab('edit'); }}
                      className="text-slate-600 hover:text-white transition-colors">
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* ── bottom save ── */}
      <div className="mt-8 flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{
            background: saved ? 'rgba(16,185,129,0.25)' : 'linear-gradient(135deg,#00BCD4,#0891b2)',
            boxShadow: saved ? 'none' : '0 4px 16px rgba(0,188,212,0.3)',
          }}>
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saving ? 'ذخیره...' : saved ? 'ذخیره شد ✓' : 'ذخیره تغییرات'}
        </button>
      </div>
    </div>
  );
}
