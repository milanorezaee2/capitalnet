import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Plus, Trash2, ChevronDown, ChevronUp, GripVertical,
  Eye, EyeOff, X, Image, Upload,
  Target, Shield, Star, Briefcase, TrendingUp, CheckCircle2,
  Users, BookOpen, MessageSquare, Globe, AlignLeft,
} from 'lucide-react';
import { DEFAULT_SETTINGS, fetchSettings, saveSettings } from '../../lib/settingsApi';
import type { SiteSettings, AboutPageSection, AboutPageParagraph, TeamMemberFull } from '../../lib/settingsApi';
import { uploadImage } from '../../lib/mediaUploadApi';

// ── استایل‌های مشترک ────────────────────────────────────────────────────────
const inputCls = 'w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  (e.target.style.borderColor = 'rgba(0,188,212,0.5)');
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  (e.target.style.borderColor = 'rgba(255,255,255,0.1)');

// ── آیکون‌های سکشن ────────────────────────────────────────────────────────────
const SECTION_ICONS: Array<{ key: string; label: string; node: React.ReactNode }> = [
  { key: 'target',    label: 'هدف',       node: <Target size={14} /> },
  { key: 'users',     label: 'تیم',       node: <Users size={14} /> },
  { key: 'trending',  label: 'رشد',       node: <TrendingUp size={14} /> },
  { key: 'briefcase', label: 'کسب‌وکار',  node: <Briefcase size={14} /> },
  { key: 'shield',    label: 'امنیت',     node: <Shield size={14} /> },
  { key: 'star',      label: 'ستاره',     node: <Star size={14} /> },
  { key: 'check',     label: 'تأیید',     node: <CheckCircle2 size={14} /> },
  { key: 'book',      label: 'مطالعه',    node: <BookOpen size={14} /> },
  { key: 'message',   label: 'پیام',      node: <MessageSquare size={14} /> },
  { key: 'globe',     label: 'جهانی',     node: <Globe size={14} /> },
];

const genId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ── ویرایشگر پاراگراف‌ها ─────────────────────────────────────────────────────
function ParagraphsEditor({ paragraphs, onChange }: {
  paragraphs: AboutPageParagraph[];
  onChange: (p: AboutPageParagraph[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,188,212,0.5)' }}>
          پاراگراف‌ها ({paragraphs.filter(p => p.visible).length} فعال از {paragraphs.length})
        </span>
      </div>
      <AnimatePresence initial={false}>
        {paragraphs.map((para, i) => (
          <motion.div key={para.id}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: para.visible ? 'rgba(0,188,212,0.03)' : 'rgba(255,255,255,0.01)',
              border: `1px solid ${para.visible ? 'rgba(0,188,212,0.15)' : 'rgba(255,255,255,0.05)'}`,
              opacity: para.visible ? 1 : 0.45,
            }}>
            <div className="flex items-center justify-between px-3 py-2"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2">
                <GripVertical size={12} className="text-slate-600" />
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                  style={{ background: 'rgba(0,188,212,0.15)', color: '#00BCD4' }}>{i + 1}</span>
                <span className="text-[11px] text-slate-500 truncate max-w-[240px]">
                  {para.text.slice(0, 50) || 'پاراگراف جدید'}…
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <button type="button" title={para.visible ? 'پنهان' : 'نمایش'}
                  onClick={() => { const n = [...paragraphs]; n[i] = { ...n[i], visible: !n[i].visible }; onChange(n); }}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: para.visible ? '#00BCD4' : 'rgba(255,255,255,0.25)' }}>
                  {para.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button onClick={() => { if (i === 0) return; const n = [...paragraphs]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}
                  disabled={i === 0} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 disabled:opacity-20">
                  <ChevronUp size={12} />
                </button>
                <button onClick={() => { if (i === paragraphs.length - 1) return; const n = [...paragraphs]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; onChange(n); }}
                  disabled={i === paragraphs.length - 1} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 disabled:opacity-20">
                  <ChevronDown size={12} />
                </button>
                <button onClick={() => onChange(paragraphs.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div className="px-3 py-2.5">
              <textarea value={para.text}
                onChange={e => { const n = [...paragraphs]; n[i] = { ...n[i], text: e.target.value }; onChange(n); }}
                rows={3} className={`${inputCls} resize-none text-sm`} style={inputStyle}
                onFocus={onFocus} onBlur={onBlur}
                placeholder="متن پاراگراف را اینجا بنویسید..." />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <button onClick={() => onChange([...paragraphs, { id: genId(), text: '', visible: true }])}
        className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={13} /> افزودن پاراگراف
      </button>
    </div>
  );
}

// ── ویرایشگر سکشن‌های صفحه ───────────────────────────────────────────────────
function SectionsEditor({ sections, onChange }: {
  sections: AboutPageSection[];
  onChange: (s: AboutPageSection[]) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(sections[0]?.id ?? null);

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {sections.map((sec, i) => {
          const isOpen = expanded === sec.id;
          return (
            <motion.div key={sec.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${sec.visible ? (sec.accent ? 'rgba(245,158,11,0.2)' : 'rgba(0,188,212,0.2)') : 'rgba(255,255,255,0.06)'}`,
              }}>

              {/* ── card header ── */}
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer"
                style={{ background: isOpen ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                onClick={() => setExpanded(isOpen ? null : sec.id)}>
                <div className="flex items-center gap-3 min-w-0">
                  <GripVertical size={13} className="text-slate-600 flex-shrink-0" />
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: sec.visible ? (sec.accent ? '#f59e0b' : '#00BCD4') : 'rgba(255,255,255,0.2)' }} />
                  <span className="flex-shrink-0 text-slate-400">
                    {SECTION_ICONS.find(o => o.key === sec.icon)?.node ?? <AlignLeft size={13} />}
                  </span>
                  <span className={`text-sm font-semibold truncate ${sec.visible ? 'text-white' : 'text-slate-500'}`}>
                    {sec.title || 'سکشن بدون عنوان'}
                  </span>
                  <span className="text-[10px] text-slate-600 flex-shrink-0">
                    ({sec.paragraphs.filter(p => p.visible).length} پاراگراف)
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button"
                    onClick={e => { e.stopPropagation(); const n = [...sections]; n[i] = { ...n[i], visible: !n[i].visible }; onChange(n); }}
                    className="p-1.5 rounded-lg" style={{ color: sec.visible ? '#00BCD4' : 'rgba(255,255,255,0.25)' }}>
                    {sec.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button onClick={e => { e.stopPropagation(); if (i === 0) return; const n = [...sections]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}
                    disabled={i === 0} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 disabled:opacity-20">
                    <ChevronUp size={13} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); if (i === sections.length - 1) return; const n = [...sections]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; onChange(n); }}
                    disabled={i === sections.length - 1} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 disabled:opacity-20">
                    <ChevronDown size={13} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); onChange(sections.filter((_, j) => j !== i)); }}
                    className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                  <span className="text-slate-500 text-xs ml-1"
                    style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>▾</span>
                </div>
              </div>

              {/* ── card body ── */}
              {isOpen && (
                <div className="px-4 pb-5 pt-3 space-y-4"
                  style={{ borderTop: `1px solid ${sec.accent ? 'rgba(245,158,11,0.12)' : 'rgba(0,188,212,0.1)'}` }}>

                  {/* عنوان */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">عنوان سکشن</label>
                    <input value={sec.title}
                      onChange={e => { const n = [...sections]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }}
                      className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                      placeholder="عنوان این سکشن را بنویسید..." />
                  </div>

                  {/* آیکون + رنگ */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-2">آیکون</label>
                      <div className="flex flex-wrap gap-1.5">
                        {SECTION_ICONS.map(opt => (
                          <button key={opt.key} type="button" title={opt.label}
                            onClick={() => { const n = [...sections]; n[i] = { ...n[i], icon: opt.key }; onChange(n); }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                            style={sec.icon === opt.key
                              ? { background: 'rgba(0,188,212,0.2)', border: '1.5px solid rgba(0,188,212,0.5)', color: '#00BCD4' }
                              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                            {opt.node}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-2">رنگ</label>
                      <div className="flex gap-2">
                        {([false, true] as const).map(isAccent => (
                          <button key={String(isAccent)} type="button"
                            onClick={() => { const n = [...sections]; n[i] = { ...n[i], accent: isAccent }; onChange(n); }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={sec.accent === isAccent
                              ? isAccent
                                ? { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }
                                : { background: 'rgba(0,188,212,0.15)', border: '1px solid rgba(0,188,212,0.4)', color: '#00BCD4' }
                              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
                            }>
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: isAccent ? '#f59e0b' : '#00BCD4' }} />
                            {isAccent ? 'طلایی' : 'آبی'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quote Box */}
                  <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[11px] font-semibold text-slate-400">Quote Box <span className="text-slate-600 font-normal">(اختیاری — خالی = نمایش نمی‌شود)</span></span>
                    <textarea value={sec.quoteText ?? ''}
                      onChange={e => { const n = [...sections]; n[i] = { ...n[i], quoteText: e.target.value }; onChange(n); }}
                      rows={2} className={`${inputCls} resize-none text-sm`} style={inputStyle}
                      onFocus={onFocus} onBlur={onBlur}
                      placeholder="جمله برجسته‌ای که در کادر رنگی نمایش داده می‌شود..." />
                    {sec.quoteText && (
                      <div className="flex gap-2 pt-1">
                        {([false, true] as const).map(isA => (
                          <button key={String(isA)} type="button"
                            onClick={() => { const n = [...sections]; n[i] = { ...n[i], quoteAccent: isA }; onChange(n); }}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                            style={sec.quoteAccent === isA
                              ? isA
                                ? { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }
                                : { background: 'rgba(0,188,212,0.15)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.3)' }
                              : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }
                            }>
                            {isA ? 'طلایی' : 'آبی'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* پاراگراف‌ها */}
                  <ParagraphsEditor paragraphs={sec.paragraphs}
                    onChange={paras => { const n = [...sections]; n[i] = { ...n[i], paragraphs: paras }; onChange(n); }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      <button onClick={() => {
        const s: AboutPageSection = { id: genId(), title: '', icon: 'target', accent: false, visible: true, paragraphs: [] };
        onChange([...sections, s]);
        setExpanded(s.id);
      }}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={15} /> افزودن سکشن جدید
      </button>
    </div>
  );
}

// ── ویرایشگر اعضای تیم ──────────────────────────────────────────────────────
function TeamEditor({ members, onChange }: {
  members: TeamMemberFull[];
  onChange: (m: TeamMemberFull[]) => void;
}) {
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleUpload = async (i: number, file: File) => {
    setUploading(i);
    const res = await uploadImage(file, 'webp');
    setUploading(null);
    if (res) { const n = [...members]; n[i] = { ...n[i], avatar: res.url }; onChange(n); }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {members.map((m, i) => (
          <motion.div key={m.id}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${m.visible ? 'rgba(0,188,212,0.18)' : 'rgba(255,255,255,0.06)'}`,
              opacity: m.visible ? 1 : 0.5,
            }}>
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <GripVertical size={13} className="text-slate-600" />
                {m.avatar
                  ? <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-cyan-500/20" />
                  : <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#00BCD4,#00838F)' }}>{m.name?.[0] ?? '?'}</div>
                }
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{m.name || 'عضو جدید تیم'}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#00BCD4' }}>{m.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button"
                  onClick={() => { const n = [...members]; n[i] = { ...n[i], visible: !n[i].visible }; onChange(n); }}
                  className="p-1.5 rounded-lg" style={{ color: m.visible ? '#00BCD4' : 'rgba(255,255,255,0.25)' }}>
                  {m.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button onClick={() => { if (i === 0) return; const n = [...members]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}
                  disabled={i === 0} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 disabled:opacity-20">
                  <ChevronUp size={13} />
                </button>
                <button onClick={() => { if (i === members.length - 1) return; const n = [...members]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; onChange(n); }}
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
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1.5">نام کامل *</label>
                  <input value={m.name}
                    onChange={e => { const n = [...members]; n[i] = { ...n[i], name: e.target.value }; onChange(n); }}
                    className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} placeholder="نام عضو تیم" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1.5">سمت / نقش *</label>
                  <input value={m.role}
                    onChange={e => { const n = [...members]; n[i] = { ...n[i], role: e.target.value }; onChange(n); }}
                    className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} placeholder="Capital Strategist" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1.5">بیوگرافی</label>
                <textarea value={m.bio}
                  onChange={e => { const n = [...members]; n[i] = { ...n[i], bio: e.target.value }; onChange(n); }}
                  rows={2} className={`${inputCls} resize-none`} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  placeholder="توضیح مختصر درباره این عضو..." />
              </div>
              {/* avatar */}
              <div>
                <label className="block text-[11px] text-slate-500 mb-1.5">تصویر پروفایل</label>
                <div className="flex items-center gap-3">
                  {m.avatar
                    ? <div className="relative flex-shrink-0">
                      <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-xl object-cover" />
                      <button onClick={() => { const n = [...members]; n[i] = { ...n[i], avatar: undefined }; onChange(n); }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white"
                        style={{ background: '#ef4444', border: '1.5px solid #07111e' }}>
                        <X size={10} />
                      </button>
                    </div>
                    : <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)' }}>
                      <Image size={18} className="text-slate-600" />
                    </div>
                  }
                  <div className="flex-1">
                    <input ref={el => { fileRefs.current[i] = el; }} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(i, f); }} />
                    <button type="button" onClick={() => fileRefs.current[i]?.click()} disabled={uploading === i}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: 'rgba(0,188,212,0.1)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }}>
                      {uploading === i
                        ? <><span className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" /> آپلود...</>
                        : <><Upload size={13} /> آپلود تصویر</>}
                    </button>
                    <p className="text-[10px] text-slate-600 mt-1">PNG، JPG، WebP — حداکثر ۵ مگابایت</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button onClick={() => onChange([...members, { id: genId(), name: '', role: '', bio: '', visible: true }])}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={15} /> افزودن عضو تیم
      </button>
    </div>
  );
}

// ── کامپوننت اصلی صفحه ──────────────────────────────────────────────────────
export default function AdminAboutCMSPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchSettings()
      .then(s => { if (!cancelled) { setSettings(s ?? { ...DEFAULT_SETTINGS }); setLoading(false); } })
      .catch(() => { if (!cancelled) { setSettings({ ...DEFAULT_SETTINGS }); setLoading(false); setError('خطا در بارگذاری — از مقادیر پیش‌فرض استفاده شد.'); } });
    return () => { cancelled = true; };
  }, []);

  const set = <K extends keyof SiteSettings>(key: K, val: SiteSettings[K]) =>
    setSettings(prev => prev ? { ...prev, [key]: val } : prev);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true); setError('');
    const ok = await saveSettings(settings);
    setSaving(false);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    else setError('خطا در ذخیره‌سازی — لطفاً دوباره تلاش کنید.');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <span className="w-7 h-7 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );
  if (!settings) return null;

  return (
    <div className="space-y-5 max-w-3xl" dir="rtl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">صفحه «درباره ما»</h1>
          <p className="text-sm text-slate-400 mt-0.5">مدیریت کامل محتوا، سکشن‌ها، اعضای تیم و تصاویر</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          style={{
            background: saved ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg,#00BCD4,#00838F)',
            color: saved ? '#22c55e' : '#fff',
            border: saved ? '1px solid rgba(34,197,94,0.35)' : 'none',
          }}>
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
          {saving ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : 'ذخیره تغییرات'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm text-red-300"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>{error}</div>
      )}

      {/* ── نوار اطلاعات ── */}
      <div className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg,rgba(0,188,212,0.08),rgba(99,102,241,0.05))', border: '1px solid rgba(0,188,212,0.18)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(0,188,212,0.15)', border: '1px solid rgba(0,188,212,0.3)' }}>
          <Users size={18} style={{ color: '#00BCD4' }} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">CMS کامل صفحه «درباره ما»</p>
          <p className="text-xs text-slate-400 mt-0.5">ویرایش متون، سکشن‌ها، پاراگراف‌ها، تیم و تصاویر — صفر تا صد</p>
        </div>
      </div>

      {/* ── بخش‌های اصلی ── */}
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,188,212,0.1)', background: 'rgba(0,188,212,0.04)' }}>
          <span className="text-sm font-bold text-teal-400">🏠 Hero — عنوان و توضیح</span>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">عنوان اصلی</label>
            <input value={settings.about_hero_title}
              onChange={e => set('about_hero_title', e.target.value)}
              className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              placeholder="درباره کپیتال نتورک" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">توضیح زیر عنوان</label>
            <textarea value={settings.about_hero_desc}
              onChange={e => set('about_hero_desc', e.target.value)}
              rows={2} className={`${inputCls} resize-none`} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              placeholder="توضیح کوتاه صفحه درباره ما..." />
          </div>
        </div>
      </div>

      {/* پاراگراف‌های مقدمه */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,188,212,0.1)', background: 'rgba(0,188,212,0.04)' }}>
          <span className="text-sm font-bold text-teal-400">📝 پاراگراف‌های مقدمه</span>
          <p className="text-[11px] text-slate-500 mt-0.5">متن‌هایی که مستقیماً زیر عنوان اصلی نمایش داده می‌شوند</p>
        </div>
        <div className="px-5 py-4">
          <ParagraphsEditor
            paragraphs={settings.about_intro_paragraphs ?? []}
            onChange={v => set('about_intro_paragraphs', v)} />
        </div>
      </div>

      {/* سکشن‌های صفحه */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,188,212,0.1)', background: 'rgba(0,188,212,0.04)' }}>
          <span className="text-sm font-bold text-teal-400">📚 سکشن‌های صفحه</span>
          <p className="text-[11px] text-slate-500 mt-0.5">هر سکشن: عنوان، آیکون، رنگ، Quote Box و پاراگراف‌ها</p>
        </div>
        <div className="px-5 py-4">
          <SectionsEditor
            sections={settings.about_page_sections ?? []}
            onChange={v => set('about_page_sections', v)} />
        </div>
      </div>

      {/* اعضای تیم */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,188,212,0.1)', background: 'rgba(0,188,212,0.04)' }}>
          <span className="text-sm font-bold text-teal-400">👥 اعضای تیم</span>
          <p className="text-[11px] text-slate-500 mt-0.5">نام، سمت، بیوگرافی و تصویر پروفایل هر عضو</p>
        </div>
        <div className="px-5 py-4">
          <TeamEditor
            members={settings.about_page_team ?? []}
            onChange={v => set('about_page_team', v)} />
        </div>
      </div>

      {/* دکمه ذخیره پایین */}
      <div className="flex justify-end pt-2 pb-6">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          style={{
            background: saved ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg,#00BCD4,#00838F)',
            color: saved ? '#22c55e' : '#fff',
            border: saved ? '1px solid rgba(34,197,94,0.35)' : 'none',
          }}>
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
          {saving ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : 'ذخیره تغییرات'}
        </button>
      </div>

    </div>
  );
}
