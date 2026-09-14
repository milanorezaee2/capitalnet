/**
 * AdminHomeSectionBuilder
 * ─────────────────────────────────────────────────────────────────────────────
 * Section Builder حرفه‌ای برای صفحه Home:
 *   • نمایش همه سکشن‌های ثابت (built-in) و دینامیک جداگانه
 *   • Drag-to-reorder سکشن‌های دینامیک (با دکمه‌های بالا/پایین)
 *   • افزودن سکشن جدید از ۶ قالب آماده
 *   • هر سکشن: بلاک‌های قابل ویرایش: Heading (H1-H6)، Text، Badge،
 *     Stat، Button، Divider، Media (emoji/gif/sticker/image)، Cards، Steps
 *   • Emoji picker داخلی + فیلد URL برای GIF/Sticker
 *   • هر بلاک با تراز (right/center/left) و حذف مستقل
 */

import { useState } from 'react';
import {
  Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown,
  GripVertical, Type, Hash, AlignRight, AlignCenter,
  AlignLeft, Image, Smile, Minus, BarChart2, MousePointer,
  Layers, X, ChevronDown as Arrow, BookOpen, HelpCircle,
  Globe, Wrench, CheckCircle2, Rocket, RefreshCw, MessageSquare,
  Film, GalleryHorizontal, Navigation2, ClipboardList,
} from 'lucide-react';
import type { HomeSection, HomeSectionBlock, BuiltInSectionKey, HeadingLevel, TextAlign } from '../../lib/settingsApi';

// ─────────────────────────────────────────────────────────────────────────────
// استایل‌های مشترک
// ─────────────────────────────────────────────────────────────────────────────
const iCls  = 'w-full rounded-xl px-3 py-2 text-sm text-white outline-none transition-colors';
const iSty  = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' } as const;
const onFoc = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) =>
  (e.target.style.borderColor = 'rgba(0,188,212,0.5)');
const onBlr = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) =>
  (e.target.style.borderColor = 'rgba(255,255,255,0.1)');

const LEVEL_OPTIONS = [1,2,3,4,5,6] as const;
const ALIGN_OPTIONS = ['right','center','left'] as const;

function HeadingLevelSelect({ value, onChange }: { value: HeadingLevel; onChange: (v: HeadingLevel) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(Number(e.target.value) as HeadingLevel)}
      className="rounded-lg px-2 py-1.5 text-xs text-white outline-none"
      style={{ ...iSty, width: 72 }}>
      {LEVEL_OPTIONS.map(level => <option key={level} value={level}>H{level}</option>)}
    </select>
  );
}

function AlignmentControls({ align, onChange }: { align: TextAlign; onChange: (a: TextAlign) => void }) {
  return (
    <div className="flex gap-1">
      {ALIGN_OPTIONS.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className="p-1.5 rounded-lg transition-colors"
          style={{ background: align === option ? 'rgba(0,188,212,0.15)' : 'transparent', color: align === option ? '#00BCD4' : 'rgba(255,255,255,0.3)' }}>
          {option === 'right' ? <AlignRight size={12}/> : option === 'center' ? <AlignCenter size={12}/> : <AlignLeft size={12}/>} 
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// اموجی‌های پیش‌فرض
// ─────────────────────────────────────────────────────────────────────────────
const EMOJI_LIST = [
  '🚀','💡','🎯','📈','💰','🤝','⚡','🌍','✅','🔥',
  '🏆','🎉','💎','🌟','📊','🔑','💼','🛡️','🌱','⭐',
  '🎖️','🧠','🤖','👑','🌐','🔮','💫','🎗️','📌','🏅',
  '👋','🙌','👀','💪','🙏','😊','🎊','🎁','🎀','🎈',
];

// ─────────────────────────────────────────────────────────────────────────────
// GIF/Sticker های پیش‌فرض
// ─────────────────────────────────────────────────────────────────────────────
const PRESET_GIFS = [
  { label: 'رشد', url: 'https://media.giphy.com/media/3o7bu8sRnYpTOG1p8k/giphy.gif' },
  { label: 'تیم', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
  { label: 'موفقیت', url: 'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif' },
  { label: 'ارتباط', url: 'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif' },
];

// ─────────────────────────────────────────────────────────────────────────────
// قالب‌های سکشن آماده
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_TEMPLATES: Array<{
  icon: React.ReactNode; label: string; type: string; desc: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks: any[];
}> = [
  {
    icon: <Hash size={16} />,
    label: 'متن + عنوان',
    type: 'text-block',
    desc: 'یک عنوان H2 + پاراگراف توضیح',
    blocks: [
      { type: 'heading', text: 'عنوان جدید', level: 2, align: 'center' },
      { type: 'text',    text: 'متن توضیح خود را اینجا بنویسید...', align: 'center' },
    ],
  },
  {
    icon: <BarChart2 size={16} />,
    label: 'آمار',
    type: 'stats',
    desc: '۳ کارت آمار کنار هم',
    blocks: [
      { type: 'heading', text: 'آمار کلیدی', level: 3, align: 'center' },
      { type: 'stat', value: '۱۰۰+', label: 'پروژه موفق' },
      { type: 'stat', value: '۵ سال', label: 'تجربه' },
      { type: 'stat', value: '۹۵٪', label: 'رضایت مشتری' },
    ],
  },
  {
    icon: <Layers size={16} />,
    label: 'کارت‌ها',
    type: 'cards',
    desc: 'مجموعه‌ای از کارت‌های ویژگی',
    blocks: [
      { type: 'heading', text: 'ویژگی‌های ما', level: 2, align: 'center' },
      {
        type: 'cards', items: [
          { title: 'عنوان اول', desc: 'توضیح اول' },
          { title: 'عنوان دوم', desc: 'توضیح دوم' },
          { title: 'عنوان سوم', desc: 'توضیح سوم' },
        ],
      },
    ],
  },
  {
    icon: <MousePointer size={16} />,
    label: 'دکمه CTA',
    type: 'cta',
    desc: 'یک یا دو دکمه Call-to-Action',
    blocks: [
      { type: 'heading', text: 'آماده شروع هستید؟', level: 2, align: 'center' },
      { type: 'text',    text: 'همین حالا با ما تماس بگیرید.', align: 'center' },
      { type: 'button',  text: 'شروع کنید', variant: 'primary', href: '#contact' },
    ],
  },
  {
    icon: <Image size={16} />,
    label: 'رسانه / اموجی',
    type: 'media',
    desc: 'اموجی، GIF یا تصویر',
    blocks: [
      { type: 'media', src: '🎯', alt: 'icon', kind: 'emoji' },
      { type: 'heading', text: 'عنوان با آیکون', level: 3, align: 'center' },
    ],
  },
  {
    icon: <Minus size={16} />,
    label: 'بلاک خالی',
    type: 'custom',
    desc: 'سکشن خالی — اضافه کردن دستی بلاک‌ها',
    blocks: [],
  },
  {
    icon: <Film size={16} />,
    label: 'ویدئو',
    type: 'video-section',
    desc: 'نمایش ویدئو YouTube، Vimeo یا mp4',
    blocks: [
      { type: 'heading', text: 'ویدئو معرفی', level: 2, align: 'center' },
      { type: 'video', src: '', caption: '', ratio: '16:9', displayMode: 'embed', align: 'center' },
    ],
  },
  {
    icon: <GalleryHorizontal size={16} />,
    label: 'گالری عکس',
    type: 'gallery-section',
    desc: 'عکس منفرد یا اسلایدر گالری با Lightbox',
    blocks: [
      { type: 'heading', text: 'گالری تصاویر', level: 2, align: 'center' },
      { type: 'image-gallery', mode: 'slider', items: [{ src: '', alt: '', caption: '' }], ratio: '16:9', lightbox: true, align: 'center' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// هلپرها
// ─────────────────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function withId(block: Omit<HomeSectionBlock, 'id'>): HomeSectionBlock {
  return { ...block, id: uid() } as HomeSectionBlock;
}

// ─────────────────────────────────────────────────────────────────────────────
// BlockEditor — ویرایش یک بلاک
// ─────────────────────────────────────────────────────────────────────────────
function BlockEditor({
  block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  block: HomeSectionBlock;
  onChange: (b: HomeSectionBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const BLOCK_ICONS: Record<string, React.ReactNode> = {
    heading: <Hash size={13} />, text: <Type size={13} />, badge: <span className="text-[10px] font-black">B</span>,
    stat: <BarChart2 size={13} />, button: <MousePointer size={13} />, divider: <Minus size={13} />,
    media: <Image size={13} />, cards: <Layers size={13} />, steps: <Layers size={13} />,
    video: <Film size={13} />, 'image-gallery': <GalleryHorizontal size={13} />,
  };
  const BLOCK_LABELS: Record<string, string> = {
    heading: 'عنوان', text: 'متن', badge: 'بج', stat: 'آمار',
    button: 'دکمه', divider: 'خط جدا', media: 'رسانه', cards: 'کارت‌ها', steps: 'مراحل',
    video: 'ویدئو', 'image-gallery': 'گالری عکس',
  };

  const rowCls = 'rounded-xl p-3 space-y-2.5';
  const rowSty = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };

const AlignButtons = ({ align, setAlign }: { align: TextAlign; setAlign: (a: TextAlign) => void }) => (
    <AlignmentControls align={align} onChange={setAlign} />
  );

  return (
    <div className={rowCls} style={rowSty}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-teal-400 flex-shrink-0">{BLOCK_ICONS[block.type]}</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{BLOCK_LABELS[block.type]}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={onMoveUp} disabled={isFirst}
            className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20 transition-colors">
            <ChevronUp size={12}/>
          </button>
          <button onClick={onMoveDown} disabled={isLast}
            className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20 transition-colors">
            <ChevronDown size={12}/>
          </button>
          <button onClick={onDelete}
            className="p-1 rounded text-red-400/40 hover:text-red-400 transition-colors ml-1">
            <Trash2 size={12}/>
          </button>
        </div>
      </div>

      {/* ── Heading ── */}
      {block.type === 'heading' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <HeadingLevelSelect value={block.level} onChange={level => onChange({ ...block, level })} />
            <AlignButtons align={block.align} setAlign={align => onChange({ ...block, align })} />
          </div>
          <input value={block.text}
            onChange={e => onChange({ ...block, text: e.target.value })}
            placeholder="متن عنوان..." className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
        </div>
      )}

      {/* ── Text ── */}
      {block.type === 'text' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <HeadingLevelSelect value={block.level ?? 2} onChange={level => onChange({ ...block, level })} />
            <AlignButtons align={block.align} setAlign={align => onChange({ ...block, align })} />
          </div>
          <textarea value={block.text}
            onChange={e => onChange({ ...block, text: e.target.value })}
            rows={3} placeholder="متن پاراگراف..." className={`${iCls} resize-none`} style={iSty}
            onFocus={onFoc} onBlur={onBlr} />
        </div>
      )}

      {/* ── Badge ── */}
      {block.type === 'badge' && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <AlignButtons align={block.align ?? 'right'} setAlign={align => onChange({ ...block, align })} />
          </div>
          <input value={block.text}
            onChange={e => onChange({ ...block, text: e.target.value })}
            placeholder="متن بج (مثلاً: جدید!)" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
        </div>
      )}

      {/* ── Stat ── */}
      {block.type === 'stat' && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <AlignButtons align={block.align ?? 'center'} setAlign={align => onChange({ ...block, align })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">مقدار</label>
              <input value={block.value}
                onChange={e => onChange({ ...block, value: e.target.value })}
                placeholder="۱۰۰+" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">برچسب</label>
              <input value={block.label}
                onChange={e => onChange({ ...block, label: e.target.value })}
                placeholder="پروژه موفق" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
            </div>
          </div>
        </div>
      )}

      {/* ── Button ── */}
      {block.type === 'button' && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <AlignButtons align={block.align ?? 'right'} setAlign={align => onChange({ ...block, align })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">متن دکمه</label>
              <input value={block.text}
                onChange={e => onChange({ ...block, text: e.target.value })}
                placeholder="شروع کنید" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">لینک (href)</label>
              <input value={block.href}
                onChange={e => onChange({ ...block, href: e.target.value })}
                placeholder="#contact" className={iCls} style={{ ...iSty, direction: 'ltr' }}
                onFocus={onFoc} onBlur={onBlr} />
            </div>
          </div>
          <div className="flex gap-2">
            {(['primary','outline'] as const).map(v => (
              <button key={v} onClick={() => onChange({ ...block, variant: v })}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={block.variant===v
                  ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {v==='primary' ? 'اصلی (طلایی)' : 'خطی (outline)'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      {block.type === 'divider' && (
        <div className="flex items-center gap-2 py-1">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-xs text-slate-600">خط جداکننده</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>
      )}

      {/* ── Media (emoji / gif / sticker / image) ── */}
      {block.type === 'media' && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <AlignButtons align={block.align ?? 'center'} setAlign={align => onChange({ ...block, align })} />
          </div>
          <div className="flex gap-2">
            {(['emoji','gif','sticker','image'] as const).map(k => (
              <button key={k} onClick={() => onChange({ ...block, kind: k, src: '' })}
                className="px-2.5 py-1 rounded-xl text-xs font-medium transition-all"
                style={block.kind===k
                  ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {k==='emoji'?'😀 اموجی':k==='gif'?'GIF':k==='sticker'?'🏷 استیکر':'🖼 تصویر'}
              </button>
            ))}
          </div>

          {/* Emoji picker */}
          {block.kind === 'emoji' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{block.src || '😊'}</span>
                <button onClick={() => setShowEmojiPicker(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all"
                  style={{ background: 'rgba(0,188,212,0.08)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
                  <Smile size={13}/> انتخاب اموجی
                </button>
                <input value={block.src}
                  onChange={e => onChange({ ...block, src: e.target.value })}
                  placeholder="یا مستقیم اموجی بنویس..."
                  className={`flex-1 ${iCls}`} style={iSty} onFocus={onFoc} onBlur={onBlr} />
              </div>
              {showEmojiPicker && (
                <div className="rounded-xl p-3 flex flex-wrap gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {EMOJI_LIST.map(em => (
                    <button key={em} onClick={() => { onChange({ ...block, src: em }); setShowEmojiPicker(false); }}
                      className="w-9 h-9 text-xl rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center">
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GIF / Sticker picker */}
          {(block.kind === 'gif' || block.kind === 'sticker') && (
            <div className="space-y-2">
              <input value={block.src}
                onChange={e => onChange({ ...block, src: e.target.value })}
                placeholder="URL مستقیم GIF یا Sticker..."
                className={iCls} style={{ ...iSty, direction: 'ltr' }} onFocus={onFoc} onBlur={onBlr} />
              <div>
                <p className="text-[10px] text-slate-500 mb-1.5">یا از لیست آماده انتخاب کنید:</p>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_GIFS.map(g => (
                    <button key={g.url} onClick={() => onChange({ ...block, src: g.url })}
                      className="rounded-xl overflow-hidden border transition-colors"
                      style={{ borderColor: block.src===g.url ? '#00BCD4' : 'rgba(255,255,255,0.1)' }}>
                      <img src={g.url} alt={g.label} className="w-16 h-16 object-cover" />
                      <span className="block text-center text-[10px] text-slate-400 py-0.5">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {block.src && (
                <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <img src={block.src} alt="preview" className="w-16 h-16 rounded-lg object-cover" />
                  <span className="text-xs text-slate-400">پیش‌نمایش</span>
                </div>
              )}
            </div>
          )}

          {/* Image URL */}
          {block.kind === 'image' && (
            <div className="space-y-2">
              <input value={block.src}
                onChange={e => onChange({ ...block, src: e.target.value })}
                placeholder="URL تصویر (https://...)"
                className={iCls} style={{ ...iSty, direction: 'ltr' }} onFocus={onFoc} onBlur={onBlr} />
              <input value={block.alt}
                onChange={e => onChange({ ...block, alt: e.target.value })}
                placeholder="متن جایگزین (alt text)" className={iCls} style={iSty}
                onFocus={onFoc} onBlur={onBlr} />
              {block.src && (
                <img src={block.src} alt={block.alt} className="max-h-32 rounded-xl object-cover" />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Video ── */}
      {block.type === 'video' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <AlignButtons align={block.align ?? 'center'} setAlign={align => onChange({ ...block, align })} />
          </div>
          {/* Display mode */}
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">حالت نمایش</label>
            <div className="flex gap-2">
              {(['embed', 'lightbox'] as const).map(m => (
                <button key={m} onClick={() => onChange({ ...block, displayMode: m })}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={block.displayMode === m
                    ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {m === 'embed' ? '▶ Embed (نمایش داخلی)' : '⬛ Lightbox (نمایش روی کلیک)'}
                </button>
              ))}
            </div>
          </div>
          {/* Ratio */}
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">نسبت تصویر</label>
            <div className="flex gap-1.5 flex-wrap">
              {(['16:9', '9:16', '4:3', '1:1'] as const).map(r => (
                <button key={r} onClick={() => onChange({ ...block, ratio: r })}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={block.ratio === r
                    ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          {/* Source URL */}
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">آدرس ویدئو (YouTube / Vimeo / mp4 URL)</label>
            <input value={block.src}
              onChange={e => onChange({ ...block, src: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className={iCls} style={{ ...iSty, direction: 'ltr' }} onFocus={onFoc} onBlur={onBlr} />
          </div>
          {/* Caption */}
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">زیرنویس (اختیاری)</label>
            <input value={block.caption ?? ''}
              onChange={e => onChange({ ...block, caption: e.target.value })}
              placeholder="توضیح ویدئو..." className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
          </div>
          {/* Preview hint */}
          {block.src && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-teal-400"
              style={{ background: 'rgba(0,188,212,0.06)', border: '1px solid rgba(0,188,212,0.15)' }}>
              <Film size={12}/> ویدئو تنظیم شد — در سایت نمایش داده می‌شود
            </div>
          )}
        </div>
      )}

      {/* ── Image Gallery ── */}
      {block.type === 'image-gallery' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <AlignButtons align={block.align ?? 'center'} setAlign={align => onChange({ ...block, align })} />
          </div>
          {/* Mode */}
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">حالت نمایش</label>
            <div className="flex gap-2">
              {(['single', 'slider'] as const).map(m => (
                <button key={m} onClick={() => onChange({ ...block, mode: m })}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={block.mode === m
                    ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {m === 'single' ? '🖼 تکی' : '🎞 اسلایدر'}
                </button>
              ))}
            </div>
          </div>
          {/* Ratio */}
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">نسبت تصویر</label>
            <div className="flex gap-1.5 flex-wrap">
              {(['16:9', '4:3', '1:1', 'free'] as const).map(r => (
                <button key={r} onClick={() => onChange({ ...block, ratio: r })}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={block.ratio === r
                    ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {r === 'free' ? 'آزاد' : r}
                </button>
              ))}
            </div>
          </div>
          {/* Lightbox toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChange({ ...block, lightbox: !block.lightbox })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={block.lightbox
                ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              🔍 Lightbox روی کلیک: {block.lightbox ? 'فعال' : 'غیرفعال'}
            </button>
          </div>
          {/* Image items */}
          <div className="space-y-2">
            <label className="block text-[10px] text-slate-500">تصاویر</label>
            {block.items.map((item, ci) => (
              <div key={ci} className="space-y-1.5 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-1 justify-between">
                  <span className="text-[10px] text-slate-500">تصویر {ci + 1}</span>
                  <button onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== ci) })}
                    className="p-1 rounded text-red-400/40 hover:text-red-400">
                    <Trash2 size={11}/>
                  </button>
                </div>
                <input value={item.src}
                  onChange={e => { const its = [...block.items]; its[ci] = { ...its[ci], src: e.target.value }; onChange({ ...block, items: its }); }}
                  placeholder="https://... آدرس تصویر"
                  className={iCls} style={{ ...iSty, direction: 'ltr' }} onFocus={onFoc} onBlur={onBlr} />
                <div className="grid grid-cols-2 gap-1.5">
                  <input value={item.alt}
                    onChange={e => { const its = [...block.items]; its[ci] = { ...its[ci], alt: e.target.value }; onChange({ ...block, items: its }); }}
                    placeholder="متن alt" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
                  <input value={item.caption ?? ''}
                    onChange={e => { const its = [...block.items]; its[ci] = { ...its[ci], caption: e.target.value }; onChange({ ...block, items: its }); }}
                    placeholder="زیرنویس (اختیاری)" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
                </div>
                {item.src && (
                  <img src={item.src} alt={item.alt} className="max-h-20 rounded-lg object-cover" />
                )}
              </div>
            ))}
            <button onClick={() => onChange({ ...block, items: [...block.items, { src: '', alt: '', caption: '' }] })}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
              style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.25)' }}>
              <Plus size={12}/> افزودن تصویر
            </button>
          </div>
        </div>
      )}

      {/* ── Cards ── */}
      {block.type === 'cards' && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <AlignButtons align={block.align ?? 'right'} setAlign={align => onChange({ ...block, align })} />
          </div>
          {block.items.map((item, ci) => (
            <div key={ci} className="space-y-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2">
                <HeadingLevelSelect value={item.titleLevel ?? 4} onChange={level => { const its = [...block.items]; its[ci] = { ...its[ci], titleLevel: level }; onChange({ ...block, items: its }); }} />
                <AlignButtons align={item.align ?? block.align ?? 'right'} setAlign={align => { const its = [...block.items]; its[ci] = { ...its[ci], align }; onChange({ ...block, items: its }); }} />
                <button onClick={() => onChange({ ...block, items: block.items.filter((_,j) => j!==ci) })}
                  className="p-1.5 rounded text-red-400/40 hover:text-red-400 ml-auto">
                  <Trash2 size={12}/>
                </button>
              </div>
              <div className="grid grid-cols-[1fr_1fr] gap-2 items-start">
                <input value={item.title}
                  onChange={e => { const its = [...block.items]; its[ci] = { ...its[ci], title: e.target.value }; onChange({ ...block, items: its }); }}
                  placeholder="عنوان کارت" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
                <input value={item.desc}
                  onChange={e => { const its = [...block.items]; its[ci] = { ...its[ci], desc: e.target.value }; onChange({ ...block, items: its }); }}
                  placeholder="توضیح" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
              </div>
            </div>
          ))}
          <button onClick={() => onChange({ ...block, items: [...block.items, { title: '', desc: '' }] })}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
            style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.25)' }}>
            <Plus size={12}/> افزودن کارت
          </button>
        </div>
      )}

      {/* ── Steps ── */}
      {block.type === 'steps' && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <AlignButtons align={block.align ?? 'right'} setAlign={align => onChange({ ...block, align })} />
          </div>
          {block.items.map((item, si) => (
            <div key={si} className="space-y-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2">
                <HeadingLevelSelect value={item.titleLevel ?? 4} onChange={level => { const its = [...block.items]; its[si] = { ...its[si], titleLevel: level }; onChange({ ...block, items: its }); }} />
                <AlignButtons align={item.align ?? block.align ?? 'right'} setAlign={align => { const its = [...block.items]; its[si] = { ...its[si], align }; onChange({ ...block, items: its }); }} />
                <button onClick={() => onChange({ ...block, items: block.items.filter((_,j) => j!==si) })}
                  className="p-1.5 rounded text-red-400/40 hover:text-red-400 ml-auto">
                  <Trash2 size={12}/>
                </button>
              </div>
              <div className="grid grid-cols-[1fr_1fr] gap-2 items-start">
                <input value={item.title}
                  onChange={e => { const its = [...block.items]; its[si] = { ...its[si], title: e.target.value }; onChange({ ...block, items: its }); }}
                  placeholder="عنوان مرحله" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
                <input value={item.text}
                  onChange={e => { const its = [...block.items]; its[si] = { ...its[si], text: e.target.value }; onChange({ ...block, items: its }); }}
                  placeholder="توضیح مرحله" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
              </div>
            </div>
          ))}
          <button onClick={() => onChange({ ...block, items: [...block.items, { title: '', text: '' }] })}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
            style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.25)' }}>
            <Plus size={12}/> افزودن مرحله
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AddBlockMenu — منوی افزودن بلاک جدید
// ─────────────────────────────────────────────────────────────────────────────
function AddBlockMenu({ onAdd }: { onAdd: (b: HomeSectionBlock) => void }) {
  const [open, setOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BLOCK_OPTIONS: Array<{ type: HomeSectionBlock['type']; label: string; icon: React.ReactNode; default: any }> = [
    { type:'heading',       label:'عنوان (H1-H6)', icon:<Hash size={13}/>,               default:{ type:'heading', text:'عنوان جدید', level:2, align:'center' } },
    { type:'text',          label:'پاراگراف متن', icon:<Type size={13}/>,                default:{ type:'text', text:'', align:'right' } },
    { type:'badge',         label:'بج / تگ',      icon:<span className="text-[10px] font-black">B</span>, default:{ type:'badge', text:'جدید' } },
    { type:'stat',          label:'آمار',          icon:<BarChart2 size={13}/>,           default:{ type:'stat', value:'', label:'' } },
    { type:'button',        label:'دکمه',          icon:<MousePointer size={13}/>,        default:{ type:'button', text:'کلیک کنید', variant:'primary', href:'#' } },
    { type:'divider',       label:'خط جدا',       icon:<Minus size={13}/>,               default:{ type:'divider' } },
    { type:'media',         label:'اموجی/GIF',    icon:<Smile size={13}/>,               default:{ type:'media', src:'🎯', alt:'', kind:'emoji' } },
    { type:'cards',         label:'کارت‌ها',      icon:<Layers size={13}/>,              default:{ type:'cards', items:[{title:'',desc:''}] } },
    { type:'steps',         label:'مراحل',        icon:<Layers size={13}/>,              default:{ type:'steps', items:[{title:'',text:''}] } },
    { type:'video',         label:'ویدئو',         icon:<Film size={13}/>,                default:{ type:'video', src:'', caption:'', ratio:'16:9', displayMode:'embed', align:'center' } },
    { type:'image-gallery', label:'گالری عکس',    icon:<GalleryHorizontal size={13}/>,   default:{ type:'image-gallery', mode:'slider', items:[{src:'',alt:'',caption:''}], ratio:'16:9', lightbox:true, align:'center' } },
  ];

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={13}/> افزودن بلاک
        <Arrow size={11} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
      </button>
      {open && (
        <div className="absolute bottom-full mb-1.5 right-0 left-0 rounded-2xl p-2 z-20 grid grid-cols-3 gap-1.5"
          style={{ background: '#07111e', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {BLOCK_OPTIONS.map(opt => (
            <button key={opt.type}
              onClick={() => { onAdd(withId(opt.default as Omit<HomeSectionBlock,'id'>)); setOpen(false); }}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-medium transition-all hover:bg-white/8"
              style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span className="text-teal-400">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionEditor — ویرایش یک سکشن کامل
// ─────────────────────────────────────────────────────────────────────────────
function SectionEditor({
  section, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  section: HomeSection;
  onChange: (s: HomeSection) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  const updateBlock = (idx: number, b: HomeSectionBlock) => {
    const blocks = [...section.blocks];
    blocks[idx] = b;
    onChange({ ...section, blocks });
  };
  const deleteBlock = (idx: number) =>
    onChange({ ...section, blocks: section.blocks.filter((_,i) => i!==idx) });
  const moveBlock = (idx: number, dir: -1|1) => {
    const blocks = [...section.blocks];
    const ni = idx + dir;
    if (ni < 0 || ni >= blocks.length) return;
    [blocks[idx], blocks[ni]] = [blocks[ni], blocks[idx]];
    onChange({ ...section, blocks });
  };
  const addBlock = (b: HomeSectionBlock) =>
    onChange({ ...section, blocks: [...section.blocks, b] });

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>

      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
        style={{ background: 'rgba(255,255,255,0.04)', borderBottom: expanded ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
        <GripVertical size={14} className="text-slate-600 flex-shrink-0" />

        {/* Visibility toggle */}
        <button onClick={() => onChange({ ...section, visible: !section.visible })}
          className="flex-shrink-0 transition-colors"
          style={{ color: section.visible ? '#00BCD4' : 'rgba(255,255,255,0.3)' }}>
          {section.visible ? <Eye size={14}/> : <EyeOff size={14}/>}
        </button>

        {/* Label editable */}
        <input
          value={section.label}
          onClick={e => e.stopPropagation()}
          onChange={e => onChange({ ...section, label: e.target.value })}
          className="flex-1 bg-transparent text-sm font-semibold text-white outline-none min-w-0"
          placeholder="نام سکشن..." />

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
          {section.blocks.length} بلاک
        </span>

        {/* Reorder */}
        <button onClick={onMoveUp} disabled={isFirst}
          className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20">
          <ChevronUp size={13}/>
        </button>
        <button onClick={onMoveDown} disabled={isLast}
          className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20">
          <ChevronDown size={13}/>
        </button>

        {/* Delete */}
        <button onClick={onDelete}
          className="p-1 rounded text-red-400/40 hover:text-red-400 transition-colors">
          <Trash2 size={13}/>
        </button>

        {/* Expand/collapse */}
        <button onClick={() => setExpanded(v => !v)}
          className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors ml-1">
          <Arrow size={13} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
        </button>
      </div>

      {/* Block list */}
      {expanded && (
        <div className="p-3 space-y-2">
          {section.blocks.length === 0 && (
            <p className="text-center text-xs text-slate-600 py-4">سکشن خالی است — بلاک اضافه کنید</p>
          )}
          {section.blocks.map((blk, i) => (
            <BlockEditor key={blk.id} block={blk}
              onChange={b => updateBlock(i, b)}
              onDelete={() => deleteBlock(i)}
              onMoveUp={() => moveBlock(i, -1)}
              onMoveDown={() => moveBlock(i, 1)}
              isFirst={i === 0} isLast={i === section.blocks.length - 1} />
          ))}
          <AddBlockMenu onAdd={addBlock} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AddSectionModal — انتخاب قالب سکشن جدید
// ─────────────────────────────────────────────────────────────────────────────
function AddSectionModal({ onAdd, onClose }: {
  onAdd: (s: HomeSection) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl p-5 space-y-4"
        style={{ background: '#07111e', border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">افزودن سکشن جدید</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1"><X size={18}/></button>
        </div>

        <p className="text-xs text-slate-500">قالب مورد نظر خود را انتخاب کنید:</p>

        <div className="grid grid-cols-2 gap-3">
          {SECTION_TEMPLATES.map(tpl => (
            <button key={tpl.type}
              onClick={() => {
                onAdd({
                  id:      uid(),
                  type:    tpl.type,
                  label:   tpl.label,
                  visible: true,
                  blocks:  tpl.blocks.map(b => withId(b as Omit<HomeSectionBlock,'id'>)),
                });
                onClose();
              }}
              className="rounded-2xl p-4 text-right transition-all hover:border-teal-400/40 group"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-teal-400 group-hover:scale-110 transition-transform">{tpl.icon}</span>
                <span className="text-sm font-semibold text-white">{tpl.label}</span>
              </div>
              <p className="text-xs text-slate-500">{tpl.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BuiltInSectionRow — ردیف سکشن‌های ثابت (read-only label + visibility)
// ─────────────────────────────────────────────────────────────────────────────
const BUILT_IN_META: Record<BuiltInSectionKey, { label: string; hint: string; icon: React.ReactNode }> = {
  'hero':             { label: 'Hero — متن و دکمه‌ها',                     hint: 'عنوان، تگ‌لاین، دکمه‌ها و آمار اولیه',        icon: <Hash size={14}/> },
  'network':          { label: 'شبکه جهانی سرمایه‌گذاران — عنوان و آمار',    hint: 'نقشه VC ها و آمار کلی شبکه جهانی',             icon: <Globe size={14}/> },
  'services':         { label: 'عنوان بخش «خدمات»',                        hint: 'پکیج‌های سه‌گانه فازها و توضیح بخش',          icon: <Wrench size={14}/> },
  'branding':         { label: 'بخش برندینگ',                              hint: 'متن و محتوای مربوط به برندینگ و هویت برند', icon: <Wrench size={14}/> },
  'why-us':           { label: 'عنوان بخش «چرا ما» (WhyUs)',                hint: 'کارت‌های توضیحی «چرا کپیتال نتورک»',          icon: <CheckCircle2 size={14}/> },
  'evaluation':       { label: 'بخش ارزیابی',                              hint: 'متن و دکمه‌های مربوط به فرم ارزیابی',        icon: <ClipboardList size={14}/> },
  'cta':              { label: 'بلاک CTA — آماده برای راند بعدی',           hint: 'بلوک دعوت به اقدام در انتهای صفحه اصلی',      icon: <Rocket size={14}/> },
  'process':          { label: 'بخش فرآیند — عنوان، توضیح و مراحل (Home)', hint: 'چیدمان مراحل فرآیند و توضیحات مرتبط',         icon: <RefreshCw size={14}/> },
  'client-showcase':  { label: 'نمونه کلاینت‌ها',                          hint: 'کارت‌های معرفی مشتریان موفق و نمونه کارها',    icon: <Layers size={14}/> },
  'testimonials':     { label: 'نظرات کلیدی — عنوان و توضیح',               hint: 'کارت‌های Testimonials از دیتابیس',             icon: <MessageSquare size={14}/> },
  'blog-preview':     { label: 'کارت‌های بلاگ',                             hint: 'پیش‌نمایش آخرین مقالات در صفحه اصلی',        icon: <BookOpen size={14}/> },
  'faq':              { label: 'سوالات متداول',                            hint: 'سوالات رایج و پاسخ‌های این بخش',             icon: <HelpCircle size={14}/> },
  'continue-journey': { label: 'ادامه مسیر شما',                           hint: 'مراحل شماره‌دار، تصویر اصلی و کارت‌های کناری', icon: <Navigation2 size={14}/> },
};

function BuiltInSectionRow({
  sectionKey, isFirst, isLast, onMoveUp, onMoveDown,
}: {
  sectionKey: BuiltInSectionKey;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const meta = BUILT_IN_META[sectionKey] ?? {
    label: sectionKey || 'بخش ناشناخته',
    hint: 'این بخش به‌روزرسانی یا جایگزین شده است',
    icon: <Hash size={14} />,
  };
  const { label, hint, icon } = meta;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <GripVertical size={14} className="text-slate-600 flex-shrink-0" />
      <span className="text-slate-500 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/80">{label}</p>
        <p className="text-[11px] text-slate-600 truncate">{hint}</p>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ background: 'rgba(0,188,212,0.08)', color: 'rgba(0,188,212,0.7)', border: '1px solid rgba(0,188,212,0.15)' }}>
        ثابت
      </span>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          title="انتقال به بالا"
          className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20 transition-colors">
          <ChevronUp size={13}/>
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          title="انتقال به پایین"
          className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20 transition-colors">
          <ChevronDown size={13}/>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminHomeSectionBuilder — کامپوننت اصلی (export)
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminHomeSectionBuilder({
  sections,
  onChange,
  sectionOrder,
  onOrderChange,
}: {
  sections: HomeSection[];
  onChange: (s: HomeSection[]) => void;
  sectionOrder: BuiltInSectionKey[];
  onOrderChange: (order: BuiltInSectionKey[]) => void;
}) {
  const [showAddModal, setShowAddModal] = useState(false);

  const updateSection = (idx: number, s: HomeSection) => {
    const n = [...sections]; n[idx] = s; onChange(n);
  };
  const deleteSection = (idx: number) =>
    onChange(sections.filter((_,i) => i !== idx));
  const moveSection = (idx: number, dir: -1|1) => {
    const n = [...sections];
    const ni = idx + dir;
    if (ni < 0 || ni >= n.length) return;
    [n[idx], n[ni]] = [n[ni], n[idx]];
    onChange(n);
  };
  const moveBuiltIn = (idx: number, dir: -1|1) => {
    const n = [...sectionOrder];
    const ni = idx + dir;
    if (ni < 0 || ni >= n.length) return;
    [n[idx], n[ni]] = [n[ni], n[idx]];
    onOrderChange(n);
  };

  const visibleBuiltInOrder = sectionOrder.filter(key => key !== 'cta');

  return (
    <div className="space-y-5">

      {/* ── سکشن‌های ثابت (built-in) — قابل جابجایی ── */}
      <div className="rounded-2xl p-4 space-y-2"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          سکشن‌های ثابت — ترتیب را با ▲ ▼ تغییر دهید
        </p>
        {visibleBuiltInOrder.map((key, i) => (
          <BuiltInSectionRow
            key={key}
            sectionKey={key}
            isFirst={i === 0}
            isLast={i === visibleBuiltInOrder.length - 1}
            onMoveUp={() => moveBuiltIn(sectionOrder.indexOf(key), -1)}
            onMoveDown={() => moveBuiltIn(sectionOrder.indexOf(key), 1)}
          />
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
          سکشن‌های اضافی (دینامیک)
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {/* ── سکشن‌های دینامیک ── */}
      {sections.length === 0 && (
        <div className="text-center py-10 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p className="text-slate-600 text-sm">هیچ سکشن اضافی‌ای وجود ندارد</p>
          <p className="text-slate-700 text-xs mt-1">با دکمه زیر سکشن جدید اضافه کنید</p>
        </div>
      )}

      {sections.map((sec, i) => (
        <SectionEditor key={sec.id} section={sec}
          onChange={s => updateSection(i, s)}
          onDelete={() => deleteSection(i)}
          onMoveUp={() => moveSection(i, -1)}
          onMoveDown={() => moveSection(i, 1)}
          isFirst={i === 0} isLast={i === sections.length - 1} />
      ))}

      {/* ── Add section button ── */}
      <button onClick={() => setShowAddModal(true)}
        className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
        style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '2px dashed rgba(0,188,212,0.3)' }}>
        <Plus size={16}/> افزودن سکشن جدید
      </button>

      {/* ── Add section modal ── */}
      {showAddModal && (
        <AddSectionModal
          onAdd={s => { onChange([...sections, s]); }}
          onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
