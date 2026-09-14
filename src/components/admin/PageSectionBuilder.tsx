/**
 * PageSectionBuilder
 * ─────────────────────────────────────────────────────────────────────────────
 * Section Builder ساده برای صفحات فرعی (خدمات، فرآیند، درباره ما، تماس، بلاگ):
 *   • افزودن سکشن‌های دینامیک نامحدود
 *   • هر سکشن: بلاک‌های قابل ویرایش: Heading، Text، Badge، Stat، Button، Divider، Media، Cards، Steps
 *   • اضافه/حذف/جابجایی سکشن‌ها و بلاک‌ها
 */

import { useState } from 'react';
import {
  Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown,
  GripVertical, Type, Hash, AlignRight, AlignCenter,
  AlignLeft, Image, Smile, Minus, BarChart2, MousePointer,
  Layers, X, ChevronDown as Arrow,
} from 'lucide-react';
import type { HomeSection, HomeSectionBlock, HeadingLevel, TextAlign } from '../../lib/settingsApi';

// ─── استایل‌های مشترک ────────────────────────────────────────────────────────
const iCls  = 'w-full rounded-xl px-3 py-2 text-sm text-white outline-none transition-colors';
const iSty  = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' } as const;
const onFoc = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) =>
  (e.target.style.borderColor = 'rgba(0,188,212,0.5)');
const onBlr = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) =>
  (e.target.style.borderColor = 'rgba(255,255,255,0.1)');

const LEVEL_OPTIONS = [1,2,3,4,5,6] as const;
const ALIGN_OPTIONS = ['right','center','left'] as const;

const EMOJI_LIST = [
  '🚀','💡','🎯','📈','💰','🤝','⚡','🌍','✅','🔥',
  '🏆','🎉','💎','🌟','📊','🔑','💼','🛡️','🌱','⭐',
  '🎖️','🧠','🤖','👑','🌐','🔮','💫','🎗️','📌','🏅',
  '👋','🙌','👀','💪','🙏','😊','🎊','🎁','🎀','🎈',
];

const PRESET_GIFS = [
  { label: 'رشد', url: 'https://media.giphy.com/media/3o7bu8sRnYpTOG1p8k/giphy.gif' },
  { label: 'تیم', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
  { label: 'موفقیت', url: 'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif' },
  { label: 'ارتباط', url: 'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif' },
];

const SECTION_TEMPLATES = [
  { label: 'متن + عنوان', type: 'text-block', desc: 'عنوان H2 + پاراگراف توضیح', blocks: [
    { type: 'heading', text: 'عنوان جدید', level: 2, align: 'center' },
    { type: 'text',    text: 'متن توضیح خود را اینجا بنویسید...', align: 'center' },
  ]},
  { label: 'آمار', type: 'stats', desc: '۳ کارت آمار کنار هم', blocks: [
    { type: 'heading', text: 'آمار کلیدی', level: 3, align: 'center' },
    { type: 'stat', value: '۱۰۰+', label: 'پروژه موفق' },
    { type: 'stat', value: '۵ سال', label: 'تجربه' },
    { type: 'stat', value: '۹۵٪', label: 'رضایت مشتری' },
  ]},
  { label: 'کارت‌ها', type: 'cards', desc: 'مجموعه کارت‌های ویژگی', blocks: [
    { type: 'heading', text: 'ویژگی‌های ما', level: 2, align: 'center' },
    { type: 'cards', items: [
      { title: 'عنوان اول', desc: 'توضیح اول' },
      { title: 'عنوان دوم', desc: 'توضیح دوم' },
      { title: 'عنوان سوم', desc: 'توضیح سوم' },
    ]},
  ]},
  { label: 'دکمه CTA', type: 'cta', desc: 'یک یا دو دکمه Call-to-Action', blocks: [
    { type: 'heading', text: 'آماده شروع هستید؟', level: 2, align: 'center' },
    { type: 'text',    text: 'همین حالا با ما تماس بگیرید.', align: 'center' },
    { type: 'button',  text: 'شروع کنید', variant: 'primary', href: '#contact' },
  ]},
  { label: 'رسانه / اموجی', type: 'media', desc: 'اموجی، GIF یا تصویر', blocks: [
    { type: 'media', src: '🎯', alt: 'icon', kind: 'emoji' },
    { type: 'heading', text: 'عنوان با آیکون', level: 3, align: 'center' },
  ]},
  { label: 'بلاک خالی', type: 'custom', desc: 'سکشن خالی — افزودن دستی بلاک‌ها', blocks: [] },
];

function uid() { return Math.random().toString(36).slice(2, 10); }
function withId(block: Omit<HomeSectionBlock, 'id'>): HomeSectionBlock {
  return { ...block, id: uid() } as HomeSectionBlock;
}

// ── کنترل‌های تراز و سطح عنوان ────────────────────────────────────────────
function HeadingLevelSelect({ value, onChange }: { value: HeadingLevel; onChange: (v: HeadingLevel) => void }) {
  return (
    <select value={value} onChange={e => onChange(Number(e.target.value) as HeadingLevel)}
      className="rounded-lg px-2 py-1.5 text-xs text-white outline-none"
      style={{ ...iSty, width: 72 }}>
      {LEVEL_OPTIONS.map(l => <option key={l} value={l}>H{l}</option>)}
    </select>
  );
}

function AlignmentControls({ align, onChange }: { align: TextAlign; onChange: (a: TextAlign) => void }) {
  return (
    <div className="flex gap-1">
      {ALIGN_OPTIONS.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className="p-1.5 rounded-lg transition-colors"
          style={{ background: align === opt ? 'rgba(0,188,212,0.15)' : 'transparent', color: align === opt ? '#00BCD4' : 'rgba(255,255,255,0.3)' }}>
          {opt === 'right' ? <AlignRight size={12}/> : opt === 'center' ? <AlignCenter size={12}/> : <AlignLeft size={12}/>}
        </button>
      ))}
    </div>
  );
}

// ── ویرایشگر یک بلاک ─────────────────────────────────────────────────────
function BlockEditor({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  block: HomeSectionBlock; onChange: (b: HomeSectionBlock) => void;
  onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void;
  isFirst: boolean; isLast: boolean;
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const BLOCK_ICONS: Record<string, React.ReactNode> = {
    heading: <Hash size={13}/>, text: <Type size={13}/>, badge: <span className="text-[10px] font-black">B</span>,
    stat: <BarChart2 size={13}/>, button: <MousePointer size={13}/>, divider: <Minus size={13}/>,
    media: <Image size={13}/>, cards: <Layers size={13}/>, steps: <Layers size={13}/>,
  };
  const BLOCK_LABELS: Record<string, string> = {
    heading: 'عنوان', text: 'متن', badge: 'بج', stat: 'آمار',
    button: 'دکمه', divider: 'خط جدا', media: 'رسانه', cards: 'کارت‌ها', steps: 'مراحل',
  };
  const AlignBtns = ({ align, set }: { align: TextAlign; set: (a: TextAlign) => void }) =>
    <AlignmentControls align={align} onChange={set} />;

  return (
    <div className="rounded-xl p-3 space-y-2.5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-teal-400">{BLOCK_ICONS[block.type]}</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{BLOCK_LABELS[block.type]}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={onMoveUp} disabled={isFirst} className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20"><ChevronUp size={12}/></button>
          <button onClick={onMoveDown} disabled={isLast} className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20"><ChevronDown size={12}/></button>
          <button onClick={onDelete} className="p-1 rounded text-red-400/40 hover:text-red-400 ml-1"><Trash2 size={12}/></button>
        </div>
      </div>

      {block.type === 'heading' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <HeadingLevelSelect value={block.level} onChange={level => onChange({ ...block, level })} />
            <AlignBtns align={block.align} set={a => onChange({ ...block, align: a })} />
          </div>
          <input value={block.text} onChange={e => onChange({ ...block, text: e.target.value })}
            placeholder="متن عنوان..." className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
        </div>
      )}
      {block.type === 'text' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <HeadingLevelSelect value={block.level ?? 2} onChange={level => onChange({ ...block, level })} />
            <AlignBtns align={block.align} set={a => onChange({ ...block, align: a })} />
          </div>
          <textarea value={block.text} onChange={e => onChange({ ...block, text: e.target.value })}
            rows={3} placeholder="متن پاراگراف..." className={`${iCls} resize-none`} style={iSty} onFocus={onFoc} onBlur={onBlr} />
        </div>
      )}
      {block.type === 'badge' && (
        <div className="space-y-2">
          <div className="flex justify-end"><AlignBtns align={block.align ?? 'right'} set={a => onChange({ ...block, align: a })} /></div>
          <input value={block.text} onChange={e => onChange({ ...block, text: e.target.value })}
            placeholder="متن بج..." className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
        </div>
      )}
      {block.type === 'stat' && (
        <div className="space-y-2">
          <div className="flex justify-end"><AlignBtns align={block.align ?? 'center'} set={a => onChange({ ...block, align: a })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">مقدار</label>
              <input value={block.value} onChange={e => onChange({ ...block, value: e.target.value })}
                placeholder="۱۰۰+" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">برچسب</label>
              <input value={block.label} onChange={e => onChange({ ...block, label: e.target.value })}
                placeholder="پروژه موفق" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
            </div>
          </div>
        </div>
      )}
      {block.type === 'button' && (
        <div className="space-y-2">
          <div className="flex justify-end"><AlignBtns align={block.align ?? 'right'} set={a => onChange({ ...block, align: a })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">متن دکمه</label>
              <input value={block.text} onChange={e => onChange({ ...block, text: e.target.value })}
                placeholder="شروع کنید" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">لینک (href)</label>
              <input value={block.href} onChange={e => onChange({ ...block, href: e.target.value })}
                placeholder="#contact" className={iCls} style={{ ...iSty, direction: 'ltr' }} onFocus={onFoc} onBlur={onBlr} />
            </div>
          </div>
          <div className="flex gap-2">
            {(['primary','outline'] as const).map(v => (
              <button key={v} onClick={() => onChange({ ...block, variant: v })}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={block.variant === v
                  ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {v === 'primary' ? 'اصلی' : 'خطی (outline)'}
              </button>
            ))}
          </div>
        </div>
      )}
      {block.type === 'divider' && (
        <div className="flex items-center gap-2 py-1">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-xs text-slate-600">خط جداکننده</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>
      )}
      {block.type === 'media' && (
        <div className="space-y-2">
          <div className="flex justify-end"><AlignBtns align={block.align ?? 'center'} set={a => onChange({ ...block, align: a })} /></div>
          <div className="flex gap-2 flex-wrap">
            {(['emoji','gif','sticker','image'] as const).map(k => (
              <button key={k} onClick={() => onChange({ ...block, kind: k, src: '' })}
                className="px-2.5 py-1 rounded-xl text-xs font-medium transition-all"
                style={block.kind === k
                  ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {k === 'emoji' ? '😀 اموجی' : k === 'gif' ? 'GIF' : k === 'sticker' ? '🏷 استیکر' : '🖼 تصویر'}
              </button>
            ))}
          </div>
          {block.kind === 'emoji' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{block.src || '😊'}</span>
                <button onClick={() => setShowEmojiPicker(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
                  style={{ background: 'rgba(0,188,212,0.08)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
                  <Smile size={13}/> انتخاب
                </button>
                <input value={block.src} onChange={e => onChange({ ...block, src: e.target.value })}
                  placeholder="یا مستقیم اموجی بنویس..." className={`flex-1 ${iCls}`} style={iSty} onFocus={onFoc} onBlur={onBlr} />
              </div>
              {showEmojiPicker && (
                <div className="rounded-xl p-3 flex flex-wrap gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {EMOJI_LIST.map(em => (
                    <button key={em} onClick={() => { onChange({ ...block, src: em }); setShowEmojiPicker(false); }}
                      className="w-9 h-9 text-xl rounded-xl hover:bg-white/10 flex items-center justify-center">{em}</button>
                  ))}
                </div>
              )}
            </div>
          )}
          {(block.kind === 'gif' || block.kind === 'sticker') && (
            <div className="space-y-2">
              <input value={block.src} onChange={e => onChange({ ...block, src: e.target.value })}
                placeholder="URL مستقیم GIF..." className={iCls} style={{ ...iSty, direction: 'ltr' }} onFocus={onFoc} onBlur={onBlr} />
              <div className="flex gap-2 flex-wrap">
                {PRESET_GIFS.map(g => (
                  <button key={g.url} onClick={() => onChange({ ...block, src: g.url })}
                    className="rounded-xl overflow-hidden border"
                    style={{ borderColor: block.src === g.url ? '#00BCD4' : 'rgba(255,255,255,0.1)' }}>
                    <img src={g.url} alt={g.label} className="w-16 h-16 object-cover" />
                    <span className="block text-center text-[10px] text-slate-400 py-0.5">{g.label}</span>
                  </button>
                ))}
              </div>
              {block.src && <img src={block.src} alt="preview" className="w-20 h-20 rounded-lg object-cover" />}
            </div>
          )}
          {block.kind === 'image' && (
            <div className="space-y-2">
              <input value={block.src} onChange={e => onChange({ ...block, src: e.target.value })}
                placeholder="URL تصویر (https://...)" className={iCls} style={{ ...iSty, direction: 'ltr' }} onFocus={onFoc} onBlur={onBlr} />
              <input value={block.alt} onChange={e => onChange({ ...block, alt: e.target.value })}
                placeholder="متن جایگزین (alt)" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
              {block.src && <img src={block.src} alt={block.alt} className="max-h-32 rounded-xl object-cover" />}
            </div>
          )}
        </div>
      )}
      {block.type === 'cards' && (
        <div className="space-y-2">
          <div className="flex justify-end"><AlignBtns align={block.align ?? 'right'} set={a => onChange({ ...block, align: a })} /></div>
          {block.items.map((item, ci) => (
            <div key={ci} className="space-y-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2">
                <HeadingLevelSelect value={item.titleLevel ?? 4} onChange={level => { const its = [...block.items]; its[ci] = { ...its[ci], titleLevel: level }; onChange({ ...block, items: its }); }} />
                <AlignBtns align={item.align ?? block.align ?? 'right'} set={align => { const its = [...block.items]; its[ci] = { ...its[ci], align }; onChange({ ...block, items: its }); }} />
                <button onClick={() => onChange({ ...block, items: block.items.filter((_,j) => j !== ci) })} className="p-1.5 rounded text-red-400/40 hover:text-red-400 ml-auto"><Trash2 size={12}/></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={item.title} onChange={e => { const its = [...block.items]; its[ci] = { ...its[ci], title: e.target.value }; onChange({ ...block, items: its }); }}
                  placeholder="عنوان کارت" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
                <input value={item.desc} onChange={e => { const its = [...block.items]; its[ci] = { ...its[ci], desc: e.target.value }; onChange({ ...block, items: its }); }}
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
      {block.type === 'steps' && (
        <div className="space-y-2">
          <div className="flex justify-end"><AlignBtns align={block.align ?? 'right'} set={a => onChange({ ...block, align: a })} /></div>
          {block.items.map((item, si) => (
            <div key={si} className="space-y-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2">
                <HeadingLevelSelect value={item.titleLevel ?? 4} onChange={level => { const its = [...block.items]; its[si] = { ...its[si], titleLevel: level }; onChange({ ...block, items: its }); }} />
                <AlignBtns align={item.align ?? block.align ?? 'right'} set={align => { const its = [...block.items]; its[si] = { ...its[si], align }; onChange({ ...block, items: its }); }} />
                <button onClick={() => onChange({ ...block, items: block.items.filter((_,j) => j !== si) })} className="p-1.5 rounded text-red-400/40 hover:text-red-400 ml-auto"><Trash2 size={12}/></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={item.title} onChange={e => { const its = [...block.items]; its[si] = { ...its[si], title: e.target.value }; onChange({ ...block, items: its }); }}
                  placeholder="عنوان مرحله" className={iCls} style={iSty} onFocus={onFoc} onBlur={onBlr} />
                <input value={item.text} onChange={e => { const its = [...block.items]; its[si] = { ...its[si], text: e.target.value }; onChange({ ...block, items: its }); }}
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

// ── منوی افزودن بلاک ──────────────────────────────────────────────────────
function AddBlockMenu({ onAdd }: { onAdd: (b: HomeSectionBlock) => void }) {
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BLOCK_OPTIONS: Array<{ type: HomeSectionBlock['type']; label: string; icon: React.ReactNode; default: any }> = [
    { type:'heading', label:'عنوان',     icon:<Hash size={13}/>,      default:{ type:'heading', text:'عنوان جدید', level:2, align:'center' } },
    { type:'text',    label:'پاراگراف', icon:<Type size={13}/>,       default:{ type:'text', text:'', align:'right' } },
    { type:'badge',   label:'بج',        icon:<span className="text-[10px] font-black">B</span>, default:{ type:'badge', text:'جدید' } },
    { type:'stat',    label:'آمار',      icon:<BarChart2 size={13}/>,  default:{ type:'stat', value:'', label:'' } },
    { type:'button',  label:'دکمه',      icon:<MousePointer size={13}/>, default:{ type:'button', text:'کلیک کنید', variant:'primary', href:'#' } },
    { type:'divider', label:'خط جدا',   icon:<Minus size={13}/>,      default:{ type:'divider' } },
    { type:'media',   label:'رسانه',     icon:<Smile size={13}/>,      default:{ type:'media', src:'🎯', alt:'', kind:'emoji' } },
    { type:'cards',   label:'کارت‌ها',  icon:<Layers size={13}/>,     default:{ type:'cards', items:[{title:'',desc:''}] } },
    { type:'steps',   label:'مراحل',    icon:<Layers size={13}/>,     default:{ type:'steps', items:[{title:'',text:''}] } },
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
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-medium hover:bg-white/8"
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

// ── SectionEditor ─────────────────────────────────────────────────────────
function SectionEditor({ section, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  section: HomeSection; onChange: (s: HomeSection) => void;
  onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void;
  isFirst: boolean; isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const updateBlock = (idx: number, b: HomeSectionBlock) => { const blocks = [...section.blocks]; blocks[idx] = b; onChange({ ...section, blocks }); };
  const deleteBlock = (idx: number) => onChange({ ...section, blocks: section.blocks.filter((_,i) => i !== idx) });
  const moveBlock = (idx: number, dir: -1|1) => { const blocks = [...section.blocks]; const ni = idx + dir; if (ni < 0 || ni >= blocks.length) return; [blocks[idx],blocks[ni]] = [blocks[ni],blocks[idx]]; onChange({ ...section, blocks }); };
  const addBlock = (b: HomeSectionBlock) => onChange({ ...section, blocks: [...section.blocks, b] });

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex items-center gap-2 px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.04)', borderBottom: expanded ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
        <GripVertical size={14} className="text-slate-600 flex-shrink-0" />
        <button onClick={() => onChange({ ...section, visible: !section.visible })}
          style={{ color: section.visible ? '#00BCD4' : 'rgba(255,255,255,0.3)' }}>
          {section.visible ? <Eye size={14}/> : <EyeOff size={14}/>}
        </button>
        <input value={section.label} onClick={e => e.stopPropagation()} onChange={e => onChange({ ...section, label: e.target.value })}
          className="flex-1 bg-transparent text-sm font-semibold text-white outline-none min-w-0" placeholder="نام سکشن..." />
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>{section.blocks.length} بلاک</span>
        <button onClick={onMoveUp} disabled={isFirst} className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20"><ChevronUp size={13}/></button>
        <button onClick={onMoveDown} disabled={isLast} className="p-1 rounded text-slate-600 hover:text-slate-300 disabled:opacity-20"><ChevronDown size={13}/></button>
        <button onClick={onDelete} className="p-1 rounded text-red-400/40 hover:text-red-400"><Trash2 size={13}/></button>
        <button onClick={() => setExpanded(v => !v)} className="p-1 rounded text-slate-500 hover:text-slate-300 ml-1">
          <Arrow size={13} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
        </button>
      </div>
      {expanded && (
        <div className="p-3 space-y-2">
          {section.blocks.length === 0 && <p className="text-center text-xs text-slate-600 py-4">سکشن خالی است — بلاک اضافه کنید</p>}
          {section.blocks.map((blk, i) => (
            <BlockEditor key={blk.id} block={blk}
              onChange={b => updateBlock(i, b)} onDelete={() => deleteBlock(i)}
              onMoveUp={() => moveBlock(i, -1)} onMoveDown={() => moveBlock(i, 1)}
              isFirst={i === 0} isLast={i === section.blocks.length - 1} />
          ))}
          <AddBlockMenu onAdd={addBlock} />
        </div>
      )}
    </div>
  );
}

// ── AddSectionModal ───────────────────────────────────────────────────────
function AddSectionModal({ onAdd, onClose }: { onAdd: (s: HomeSection) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
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
                onAdd({ id: uid(), type: tpl.type, label: tpl.label, visible: true,
                  blocks: tpl.blocks.map(b => withId(b as Omit<HomeSectionBlock,'id'>)) });
                onClose();
              }}
              className="rounded-2xl p-4 text-right transition-all hover:border-teal-400/40 group"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm font-semibold text-white">{tpl.label}</p>
              <p className="text-xs text-slate-500 mt-1">{tpl.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── کامپوننت اصلی (export) ────────────────────────────────────────────────
export default function PageSectionBuilder({
  sections, onChange, pageLabel,
}: {
  sections: HomeSection[];
  onChange: (s: HomeSection[]) => void;
  pageLabel?: string;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const updateSection = (idx: number, s: HomeSection) => { const n = [...sections]; n[idx] = s; onChange(n); };
  const deleteSection = (idx: number) => onChange(sections.filter((_,i) => i !== idx));
  const moveSection = (idx: number, dir: -1|1) => {
    const n = [...sections]; const ni = idx + dir;
    if (ni < 0 || ni >= n.length) return;
    [n[idx], n[ni]] = [n[ni], n[idx]]; onChange(n);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 space-y-2"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,188,212,0.12)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-teal-400 text-base">🧩</span>
          <div>
            <h3 className="text-sm font-bold text-teal-300">Section Builder{pageLabel ? ` — ${pageLabel}` : ''}</h3>
            <p className="text-xs text-slate-500 mt-0.5">سکشن‌های اضافی نامحدود اضافه کنید. ترتیب با ▲ ▼ قابل تغییر است.</p>
          </div>
        </div>

        {sections.length === 0 && (
          <div className="text-center py-8 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.07)' }}>
            <p className="text-slate-600 text-sm">هیچ سکشن اضافی وجود ندارد</p>
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

        <button onClick={() => setShowAddModal(true)}
          className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '2px dashed rgba(0,188,212,0.3)' }}>
          <Plus size={16}/> افزودن سکشن جدید
        </button>
      </div>

      {showAddModal && (
        <AddSectionModal
          onAdd={s => { onChange([...sections, s]); setShowAddModal(false); }}
          onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
