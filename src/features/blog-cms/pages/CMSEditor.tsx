// ─── Enterprise Blog CMS — Enhanced Block Editor ─────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Save, Eye, Image as ImageIcon, Star, Plus,
  Trash2, Copy, ChevronDown, List, Quote,
  Code, Video, Table2, Minus, AlignLeft,
  Heading2, Info, AlertTriangle, CheckSquare,
  Globe, Calendar, X, ChevronUp,
  Undo2, Redo2,
} from 'lucide-react';
import { createPost, updatePost, uploadCoverImage } from '../../../lib/blogApi';
import type { BlogPostRow, BlogPostStatus } from '../../../lib/blogApi';
import { saveRevision, calculateSEOScore, fetchCategories, fetchAuthors, fetchTags } from '../api';
import type { Category, Author, Tag as CmsTag } from '../types';

// ── Block types ───────────────────────────────────────────────────────────────
type BlockType = 'heading' | 'paragraph' | 'list' | 'checklist' | 'quote' | 'image'
  | 'video' | 'code' | 'alert' | 'callout' | 'divider' | 'html' | 'table';

interface Block {
  id: string;
  type: BlockType;
  data: Record<string, any>;
  hidden?: boolean;
}

function genId() { return `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

const BLOCK_DEFAULTS: Record<BlockType, Record<string, any>> = {
  heading:   { text: '', level: 2 },
  paragraph: { text: '' },
  list:      { items: [''], ordered: false },
  checklist: { items: [{ text: '', checked: false }] },
  quote:     { text: '', author: '' },
  image:     { url: '', alt: '', caption: '' },
  video:     { url: '', caption: '' },
  code:      { code: '', language: 'javascript' },
  alert:     { text: '', variant: 'info' },
  callout:   { text: '', icon: '💡', title: '' },
  divider:   {},
  html:      { code: '' },
  table:     { rows: [['', ''], ['', '']], headers: ['ستون ۱', 'ستون ۲'] },
};

const BLOCK_LABELS: Record<BlockType, string> = {
  heading: 'عنوان', paragraph: 'پاراگراف', list: 'لیست',
  checklist: 'چک‌لیست', quote: 'نقل‌قول', image: 'تصویر',
  video: 'ویدیو', code: 'کد', alert: 'هشدار', callout: 'نکته',
  divider: 'خط جداکننده', html: 'HTML', table: 'جدول',
};

const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  heading: <Heading2 size={14} />, paragraph: <AlignLeft size={14} />,
  list: <List size={14} />, checklist: <CheckSquare size={14} />,
  quote: <Quote size={14} />, image: <ImageIcon size={14} />,
  video: <Video size={14} />, code: <Code size={14} />,
  alert: <AlertTriangle size={14} />, callout: <Info size={14} />,
  divider: <Minus size={14} />, html: <Globe size={14} />,
  table: <Table2 size={14} />,
};

// ── Block Renderers ────────────────────────────────────────────────────────────
function BlockEditor_Heading({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const sizes: Record<number, string> = { 1: 'text-2xl font-black', 2: 'text-xl font-bold', 3: 'text-lg font-semibold', 4: 'text-base font-semibold' };
  return (
    <div className="space-y-1">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(l => (
          <button key={l} onClick={() => onChange({ ...data, level: l })}
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={data.level === l ? { background: 'rgba(0,188,212,0.2)', color: '#00BCD4' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
            H{l}
          </button>
        ))}
      </div>
      <input value={data.text} onChange={e => onChange({ ...data, text: e.target.value })}
        placeholder={`عنوان سطح ${data.level}`}
        className={`w-full bg-transparent outline-none text-white ${sizes[data.level] || 'text-xl font-bold'}`} />
    </div>
  );
}

function BlockEditor_Paragraph({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <textarea value={data.text} onChange={e => onChange({ ...data, text: e.target.value })}
      placeholder="متن پاراگراف را بنویسید..."
      rows={3}
      className="w-full bg-transparent outline-none text-white text-sm leading-8 resize-none"
      style={{ minHeight: 60 }} />
  );
}

function BlockEditor_List({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const items: string[] = data.items ?? [''];
  const updateItem = (i: number, v: string) => { const arr = [...items]; arr[i] = v; onChange({ ...data, items: arr }); };
  const addItem = () => onChange({ ...data, items: [...items, ''] });
  const removeItem = (i: number) => { if (items.length === 1) return; onChange({ ...data, items: items.filter((_, j) => j !== i) }); };
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2 mb-1">
        <button onClick={() => onChange({ ...data, ordered: false })}
          className="text-[10px] px-2 py-0.5 rounded transition-all"
          style={!data.ordered ? { background: 'rgba(0,188,212,0.2)', color: '#00BCD4' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
          • بدون شماره
        </button>
        <button onClick={() => onChange({ ...data, ordered: true })}
          className="text-[10px] px-2 py-0.5 rounded transition-all"
          style={data.ordered ? { background: 'rgba(0,188,212,0.2)', color: '#00BCD4' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
          ۱. شماره‌دار
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs w-4 text-center flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {data.ordered ? `${i + 1}.` : '•'}
          </span>
          <input value={item} onChange={e => updateItem(i, e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } if (e.key === 'Backspace' && item === '' && items.length > 1) { e.preventDefault(); removeItem(i); } }}
            placeholder="آیتم لیست..."
            className="flex-1 bg-transparent outline-none text-white text-sm" />
          <button onClick={() => removeItem(i)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X size={12} />
          </button>
        </div>
      ))}
      <button onClick={addItem} className="text-xs flex items-center gap-1 mt-1" style={{ color: '#00BCD4' }}>
        <Plus size={12} /> افزودن آیتم
      </button>
    </div>
  );
}

function BlockEditor_Quote({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="border-r-4 pr-4 space-y-1" style={{ borderColor: '#00BCD4' }}>
      <textarea value={data.text} onChange={e => onChange({ ...data, text: e.target.value })}
        placeholder="متن نقل‌قول..."
        rows={2} className="w-full bg-transparent outline-none text-white text-sm italic leading-7 resize-none" />
      <input value={data.author ?? ''} onChange={e => onChange({ ...data, author: e.target.value })}
        placeholder="نام نویسنده (اختیاری)"
        className="w-full bg-transparent outline-none text-sm" style={{ color: 'rgba(255,255,255,0.5)' }} />
    </div>
  );
}

function BlockEditor_Image({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadCoverImage(file);
    setUploading(false);
    if (result.url) {
      setUploadError('');
      onChange({ ...data, url: result.url });
    } else {
      setUploadError(result.error ? `خطا در آپلود تصویر: ${result.error}` : 'خطا در آپلود تصویر');
    }
  };
  return (
    <div className="space-y-2">
      {data.url ? (
        <div className="relative group">
          <img src={data.url} alt={data.alt} className="w-full max-h-64 object-cover rounded-xl" />
          <button onClick={() => onChange({ ...data, url: '' })}
            className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.7)' }}>
            <X size={14} style={{ color: '#fff' }} />
          </button>
        </div>
      ) : (
        <button onClick={() => fileRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed transition-colors hover:border-teal-400/50"
          style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)' }}>
          {uploading ? <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
            : <ImageIcon size={24} />}
          <span className="text-sm">{uploading ? 'در حال آپلود...' : 'آپلود تصویر'}</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      {uploadError ? (
        <p className="text-xs text-red-300">{uploadError}</p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <input value={data.alt ?? ''} onChange={e => onChange({ ...data, alt: e.target.value })}
          placeholder="Alt Text" className="text-xs px-2 py-1.5 rounded-lg bg-transparent outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }} />
        <input value={data.caption ?? ''} onChange={e => onChange({ ...data, caption: e.target.value })}
          placeholder="کپشن تصویر" className="text-xs px-2 py-1.5 rounded-lg bg-transparent outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }} />
      </div>
    </div>
  );
}

function BlockEditor_Code({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const langs = ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash', 'sql', 'other'];
  return (
    <div className="space-y-2">
      <select value={data.language ?? 'javascript'} onChange={e => onChange({ ...data, language: e.target.value })}
        className="text-xs px-2 py-1 rounded-lg outline-none"
        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {langs.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <textarea value={data.code ?? ''} onChange={e => onChange({ ...data, code: e.target.value })}
        placeholder="// کد را اینجا بنویسید..." rows={5}
        className="w-full text-xs font-mono px-3 py-2 rounded-xl outline-none resize-y"
        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#4ade80', lineHeight: 1.7, direction: 'ltr' }} />
    </div>
  );
}

function BlockEditor_Alert({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const variants = [
    { value: 'info', label: 'اطلاعات', color: '#3b82f6' },
    { value: 'warning', label: 'هشدار', color: '#f59e0b' },
    { value: 'error', label: 'خطا', color: '#ef4444' },
    { value: 'success', label: 'موفقیت', color: '#22c55e' },
  ];
  const v = variants.find(x => x.value === (data.variant ?? 'info')) ?? variants[0];
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {variants.map(vv => (
          <button key={vv.value} onClick={() => onChange({ ...data, variant: vv.value })}
            className="text-[10px] px-2 py-0.5 rounded transition-all"
            style={{ background: `${vv.color}${data.variant === vv.value ? '25' : '10'}`, color: vv.color, border: `1px solid ${vv.color}${data.variant === vv.value ? '50' : '20'}` }}>
            {vv.label}
          </button>
        ))}
      </div>
      <div className="px-3 py-2 rounded-xl" style={{ background: `${v.color}10`, border: `1px solid ${v.color}25` }}>
        <textarea value={data.text ?? ''} onChange={e => onChange({ ...data, text: e.target.value })}
          placeholder="متن هشدار..." rows={2}
          className="w-full bg-transparent outline-none text-sm resize-none leading-7"
          style={{ color: v.color }} />
      </div>
    </div>
  );
}

function BlockRenderer({ block, onChange }: { block: Block; onChange: (data: any) => void }) {
  switch (block.type) {
    case 'heading':   return <BlockEditor_Heading data={block.data} onChange={onChange} />;
    case 'paragraph': return <BlockEditor_Paragraph data={block.data} onChange={onChange} />;
    case 'list':      return <BlockEditor_List data={block.data} onChange={onChange} />;
    case 'quote':     return <BlockEditor_Quote data={block.data} onChange={onChange} />;
    case 'image':     return <BlockEditor_Image data={block.data} onChange={onChange} />;
    case 'code':      return <BlockEditor_Code data={block.data} onChange={onChange} />;
    case 'alert':     return <BlockEditor_Alert data={block.data} onChange={onChange} />;
    case 'divider':   return <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />;
    case 'callout':
      return (
        <div className="flex gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(0,188,212,0.07)', border: '1px solid rgba(0,188,212,0.2)' }}>
          <span className="text-lg">{block.data.icon ?? '💡'}</span>
          <div className="flex-1">
            <input value={block.data.title ?? ''} onChange={e => onChange({ ...block.data, title: e.target.value })}
              placeholder="عنوان نکته" className="w-full bg-transparent outline-none text-sm font-semibold text-white mb-0.5" />
            <textarea value={block.data.text ?? ''} onChange={e => onChange({ ...block.data, text: e.target.value })}
              placeholder="متن نکته..." rows={2} className="w-full bg-transparent outline-none text-sm resize-none leading-7"
              style={{ color: 'rgba(255,255,255,0.7)' }} />
          </div>
        </div>
      );
    case 'html':
      return (
        <textarea value={block.data.code ?? ''} onChange={e => onChange({ ...block.data, code: e.target.value })}
          placeholder="<!-- HTML سفارشی -->" rows={5}
          className="w-full text-xs font-mono px-3 py-2 rounded-xl outline-none resize-y"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#93c5fd', direction: 'ltr', lineHeight: 1.7 }} />
      );
    case 'video':
      return (
        <div className="space-y-2">
          <input value={block.data.url ?? ''} onChange={e => onChange({ ...block.data, url: e.target.value })}
            placeholder="لینک ویدیو (YouTube, Vimeo, ...)" dir="ltr"
            className="w-full text-sm px-3 py-2 rounded-xl outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }} />
          <input value={block.data.caption ?? ''} onChange={e => onChange({ ...block.data, caption: e.target.value })}
            placeholder="کپشن ویدیو" className="w-full text-sm px-3 py-2 rounded-xl outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }} />
        </div>
      );
    case 'table': {
      const rows: string[][] = block.data.rows ?? [['', ''], ['', '']];
      const headers: string[] = block.data.headers ?? ['', ''];
      const colCount = headers.length;
      const updateCell = (ri: number, ci: number, v: string) => {
        const newRows = rows.map((r, rowI) => rowI === ri ? r.map((c, colI) => colI === ci ? v : c) : r);
        onChange({ ...block.data, rows: newRows });
      };
      const updateHeader = (ci: number, v: string) => {
        const nh = headers.map((h, i) => i === ci ? v : h);
        onChange({ ...block.data, headers: nh });
      };
      const addRow = () => onChange({ ...block.data, rows: [...rows, Array(colCount).fill('')] });
      const addCol = () => {
        onChange({ ...block.data, headers: [...headers, ''], rows: rows.map(r => [...r, '']) });
      };
      return (
        <div className="overflow-x-auto">
          <table className="text-xs w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>{headers.map((h, ci) => (
                <th key={ci} style={{ border: '1px solid rgba(255,255,255,0.1)', padding: 4 }}>
                  <input value={h} onChange={e => updateHeader(ci, e.target.value)} placeholder={`ستون ${ci + 1}`}
                    className="bg-transparent outline-none font-semibold text-white w-full" />
                </th>
              ))}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => (
                  <td key={ci} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: 4 }}>
                    <input value={cell} onChange={e => updateCell(ri, ci, e.target.value)}
                      className="bg-transparent outline-none text-white w-full" style={{ color: 'rgba(255,255,255,0.75)' }} />
                  </td>
                ))}</tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 mt-2">
            <button onClick={addRow} className="text-[10px] px-2 py-1 rounded" style={{ background: 'rgba(0,188,212,0.1)', color: '#00BCD4' }}>+ ردیف</button>
            <button onClick={addCol} className="text-[10px] px-2 py-1 rounded" style={{ background: 'rgba(0,188,212,0.1)', color: '#00BCD4' }}>+ ستون</button>
          </div>
        </div>
      );
    }
    case 'checklist': {
      const items: { text: string; checked: boolean }[] = block.data.items ?? [{ text: '', checked: false }];
      const updateItem = (i: number, updates: Partial<typeof items[0]>) => {
        onChange({ ...block.data, items: items.map((it, idx) => idx === i ? { ...it, ...updates } : it) });
      };
      return (
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="checkbox" checked={item.checked} onChange={e => updateItem(i, { checked: e.target.checked })}
                className="w-4 h-4 rounded accent-teal-400 flex-shrink-0" />
              <input value={item.text} onChange={e => updateItem(i, { text: e.target.value })}
                placeholder="آیتم چک‌لیست..."
                className={`flex-1 bg-transparent outline-none text-sm ${item.checked ? 'line-through' : ''}`}
                style={{ color: item.checked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)' }} />
            </div>
          ))}
          <button onClick={() => onChange({ ...block.data, items: [...items, { text: '', checked: false }] })}
            className="text-xs flex items-center gap-1" style={{ color: '#00BCD4' }}>
            <Plus size={12} /> افزودن
          </button>
        </div>
      );
    }
    default: return <p className="text-xs text-slate-500">بلوک ناشناخته</p>;
  }
}

// ── Add Block Menu ─────────────────────────────────────────────────────────────
function AddBlockMenu({ onAdd, onClose }: { onAdd: (type: BlockType) => void; onClose: () => void }) {
  const groups = [
    { label: 'متن', types: ['heading', 'paragraph', 'quote'] as BlockType[] },
    { label: 'لیست', types: ['list', 'checklist'] as BlockType[] },
    { label: 'رسانه', types: ['image', 'video'] as BlockType[] },
    { label: 'محتوا', types: ['code', 'table', 'alert', 'callout'] as BlockType[] },
    { label: 'سایر', types: ['divider', 'html'] as BlockType[] },
  ];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }}
      className="absolute top-full right-0 mt-1 z-50 rounded-2xl p-3 w-64 shadow-2xl"
      style={{ background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-white">افزودن بلوک</p>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <X size={13} />
        </button>
      </div>
      <div className="space-y-3">
        {groups.map(g => (
          <div key={g.label}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{g.label}</p>
            <div className="grid grid-cols-3 gap-1">
              {g.types.map(t => (
                <button key={t} onClick={() => { onAdd(t); onClose(); }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all hover:bg-white/10 text-center"
                  style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {BLOCK_ICONS[t]}
                  <span className="text-[9px] leading-tight">{BLOCK_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── SEO Sidebar Panel ──────────────────────────────────────────────────────────
function SEOPanel({ form, onChange }: { form: any; onChange: (updates: any) => void }) {
  const { score, suggestions } = calculateSEOScore(form);
  const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="relative w-16 h-16 mx-auto mb-2">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke={scoreColor} strokeWidth="3"
              strokeDasharray={`${score} 100`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color: scoreColor }}>{score}</span>
        </div>
        <p className="text-xs font-semibold" style={{ color: scoreColor }}>
          {score >= 70 ? 'سئو خوب' : score >= 40 ? 'نیاز به بهبود' : 'ضعیف'}
        </p>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-1.5">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#f59e0b' }}>
              <span className="flex-shrink-0 mt-0.5">⚠</span> {s}
            </div>
          ))}
        </div>
      )}

      {/* Fields */}
      <div className="space-y-3">
        {[
          { key: 'seo_title', label: 'عنوان SEO', placeholder: 'عنوان برای موتورهای جستجو', maxLen: 60 },
          { key: 'focus_keyword', label: 'کلیدواژه اصلی', placeholder: 'مثال: سرمایه‌گذاری' },
          { key: 'seo_description', label: 'توضیحات Meta', placeholder: 'توضیحات ۱۲۰-۱۶۰ کاراکتر', maxLen: 160, rows: 3 },
          { key: 'canonical_url', label: 'Canonical URL', placeholder: 'https://...', dir: 'ltr' },
          { key: 'og_title', label: 'Open Graph Title', placeholder: 'عنوان برای شبکه‌های اجتماعی' },
          { key: 'og_description', label: 'Open Graph Description', placeholder: 'توضیح برای شبکه‌های اجتماعی', rows: 2 },
        ].map(f => (
          <div key={f.key}>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.label}</label>
              {f.maxLen && <span className="text-[10px]" style={{ color: (form[f.key]?.length ?? 0) > f.maxLen ? '#ef4444' : 'rgba(255,255,255,0.3)' }}>
                {(form[f.key]?.length ?? 0)}/{f.maxLen}
              </span>}
            </div>
            {(f as any).rows ? (
              <textarea value={form[f.key] ?? ''} onChange={e => onChange({ [f.key]: e.target.value })}
                placeholder={f.placeholder} rows={(f as any).rows}
                dir={(f as any).dir}
                className="w-full text-xs px-2.5 py-2 rounded-lg outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }} />
            ) : (
              <input value={form[f.key] ?? ''} onChange={e => onChange({ [f.key]: e.target.value })}
                placeholder={f.placeholder} dir={(f as any).dir}
                className="w-full text-xs px-2.5 py-2 rounded-lg outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }} />
            )}
          </div>
        ))}

        {/* Robots */}
        <div>
          <label className="text-[10px] font-medium block mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Robots</label>
          <select value={form.robots ?? 'index,follow'} onChange={e => onChange({ robots: e.target.value })}
            className="w-full text-xs px-2.5 py-2 rounded-lg outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
            <option value="index,follow">index, follow</option>
            <option value="noindex,follow">noindex, follow</option>
            <option value="index,nofollow">index, nofollow</option>
            <option value="noindex,nofollow">noindex, nofollow</option>
          </select>
        </div>
      </div>

      {/* Google Preview */}
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>پیش‌نمایش گوگل</p>
        <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-blue-400 font-medium truncate">{form.seo_title || form.title || 'عنوان صفحه'}</p>
          <p className="text-green-400 text-[10px]">capnet.io/blog/{form.slug || 'slug'}</p>
          <p className="mt-1 leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {form.seo_description || 'توضیحات صفحه در اینجا نمایش داده می‌شود...'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main CMS Editor ────────────────────────────────────────────────────────────
interface CMSEditorProps {
  post?: BlogPostRow | null;
  onBack: () => void;
  onSaved: () => void;
}

export default function CMSEditor({ post, onBack, onSaved }: CMSEditorProps) {
  const isEdit = !!post;
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [allTags, setAllTags] = useState<CmsTag[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [showAddBlock, setShowAddBlock] = useState(false);
  const addBtnRef = useRef<HTMLDivElement>(null);
  const [autoSaveIndicator, setAutoSaveIndicator] = useState<'saved' | 'saving' | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Form state ────────────────────────────────────────────────────────────
  const parseBlocks = (content: string): Block[] => {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* fallthrough */ }
    // Legacy markdown content → single paragraph block
    if (content?.trim()) {
      return [{ id: genId(), type: 'paragraph', data: { text: content } }];
    }
    return [{ id: genId(), type: 'paragraph', data: { text: '' } }];
  };

  const [blocks, setBlocks] = useState<Block[]>(() => parseBlocks(post?.content ?? ''));
  const [history, setHistory] = useState<Block[][]>([]);
  const [histIdx, setHistIdx] = useState(-1);

  const [form, setForm] = useState({
    title: post?.title ?? '',
    subtitle: (post as any)?.subtitle ?? '',
    slug: post?.slug ?? '',
    category: post?.category ?? '',
    tags: (post?.tags ?? []).join(', '),
    excerpt: post?.excerpt ?? '',
    author_name: post?.author_name ?? '',
    author_role: post?.author_role ?? '',
    read_time: post?.read_time ?? '۵ دقیقه',
    featured: post?.featured ?? false,
    status: (post?.status ?? 'draft') as BlogPostStatus,
    cover_image: post?.cover_image ?? '',
    scheduled_at: (post as any)?.scheduled_at ?? '',
    // SEO fields
    seo_title: (post as any)?.seo_title ?? '',
    seo_description: (post as any)?.seo_description ?? '',
    focus_keyword: (post as any)?.focus_keyword ?? '',
    canonical_url: (post as any)?.canonical_url ?? '',
    robots: (post as any)?.robots ?? 'index,follow',
    og_title: (post as any)?.og_title ?? '',
    og_description: (post as any)?.og_description ?? '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchAuthors().then(setAuthors);
    fetchTags().then(setAllTags);
  }, []);

  // Undo/Redo
  const pushHistory = useCallback((newBlocks: Block[]) => {
    setHistory(h => [...h.slice(0, histIdx + 1), newBlocks].slice(-50));
    setHistIdx(i => i + 1);
  }, [histIdx]);

  const undo = () => {
    if (histIdx > 0) { setBlocks(history[histIdx - 1]); setHistIdx(i => i - 1); }
  };
  const redo = () => {
    if (histIdx < history.length - 1) { setBlocks(history[histIdx + 1]); setHistIdx(i => i + 1); }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave('draft'); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const updateBlocks = (newBlocks: Block[]) => {
    setBlocks(newBlocks);
    pushHistory(newBlocks);
    // Auto save
    clearTimeout(autoSaveTimer.current);
    setAutoSaveIndicator('saving');
    autoSaveTimer.current = setTimeout(async () => {
      if (isEdit && post) {
        await updatePost(post.id, { content: JSON.stringify(newBlocks) } as any);
        setAutoSaveIndicator('saved');
        setTimeout(() => setAutoSaveIndicator(null), 2000);
      } else {
        setAutoSaveIndicator('saved');
        setTimeout(() => setAutoSaveIndicator(null), 2000);
      }
    }, 2000);
  };

  const addBlock = (type: BlockType, afterId?: string) => {
    const newBlock: Block = { id: genId(), type, data: { ...BLOCK_DEFAULTS[type] } };
    if (afterId) {
      const idx = blocks.findIndex(b => b.id === afterId);
      const newArr = [...blocks];
      newArr.splice(idx + 1, 0, newBlock);
      updateBlocks(newArr);
    } else {
      updateBlocks([...blocks, newBlock]);
    }
  };

  const updateBlock = (id: string, data: any) => {
    updateBlocks(blocks.map(b => b.id === id ? { ...b, data } : b));
  };

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) { updateBlocks([{ id: genId(), type: 'paragraph', data: { text: '' } }]); return; }
    updateBlocks(blocks.filter(b => b.id !== id));
  };

  const duplicateBlock = (id: string) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx < 0) return;
    const clone: Block = { ...blocks[idx], id: genId() };
    const arr = [...blocks];
    arr.splice(idx + 1, 0, clone);
    updateBlocks(arr);
  };

  const moveBlock = (id: string, dir: 'up' | 'down') => {
    const idx = blocks.findIndex(b => b.id === id);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === blocks.length - 1)) return;
    const arr = [...blocks];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    updateBlocks(arr);
  };

  const setF = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const slugify = (t: string) =>
    t.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '').slice(0, 80);

  const handleTitleChange = (v: string) => {
    setF('title', v);
    if (!isEdit) setF('slug', slugify(v));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    const result = await uploadCoverImage(file);
    setUploadingImg(false);
    if (result.url) {
      setF('cover_image', result.url);
      setError('');
    } else {
      setError(`آپلود تصویر با خطا مواجه شد${result.error ? `: ${result.error}` : ''}`);
    }
  };

  const handleSave = async (status: BlogPostStatus = form.status) => {
    if (!form.title.trim()) { setError('عنوان الزامی است'); return; }
    setSaving(true);
    setError('');

    const contentStr = JSON.stringify(blocks);
    const payload: any = {
      title: form.title,
      subtitle: form.subtitle || null,
      slug: form.slug || slugify(form.title),
      category: form.category || null,
      excerpt: form.excerpt || (blocks.find(b => b.type === 'paragraph')?.data.text as string)?.slice(0, 160) + '...' || '',
      content: contentStr,
      author_name: form.author_name || 'تیم CapNet',
      author_role: form.author_role || '',
      read_time: form.read_time,
      featured: form.featured,
      status,
      cover_image: form.cover_image || null,
      tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      views: post?.views ?? 0,
      likes: post?.likes ?? 0,
      published_at: status === 'published' ? (post?.published_at ?? new Date().toISOString()) : null,
      // SEO
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      focus_keyword: form.focus_keyword || null,
      canonical_url: form.canonical_url || null,
      robots: form.robots,
      og_title: form.og_title || null,
      og_description: form.og_description || null,
    };

    const ok = isEdit
      ? await updatePost(post!.id, payload)
      : !!(await createPost(payload));

    if (ok && isEdit) {
      await saveRevision(post!.id, { title: form.title, content: contentStr, version: Date.now(), excerpt: form.excerpt, author_name: form.author_name });
    }

    setSaving(false);
    if (ok) onSaved();
    else setError('خطا در ذخیره‌سازی.');
  };

  const inputSt = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all';

  return (
    <div className="flex gap-4" dir="rtl" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* ── Main Editor Column ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/10 transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <ArrowRight size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">{isEdit ? 'ویرایش مقاله' : 'مقاله جدید'}</h1>
              {autoSaveIndicator && (
                <p className="text-[10px] mt-0.5" style={{ color: autoSaveIndicator === 'saved' ? '#22c55e' : '#f59e0b' }}>
                  {autoSaveIndicator === 'saved' ? '✓ ذخیره شد' : '● در حال ذخیره...'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Undo/Redo */}
            <button onClick={undo} disabled={histIdx <= 0} className="p-2 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-30" style={{ color: 'rgba(255,255,255,0.6)' }} title="Ctrl+Z">
              <Undo2 size={15} />
            </button>
            <button onClick={redo} disabled={histIdx >= history.length - 1} className="p-2 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-30" style={{ color: 'rgba(255,255,255,0.6)' }} title="Ctrl+Y">
              <Redo2 size={15} />
            </button>

            <button onClick={() => handleSave('draft')} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Save size={13} /> پیش‌نویس
            </button>
            <button onClick={() => handleSave('scheduled')} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all disabled:opacity-40"
              style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
              <Calendar size={13} /> زمان‌بندی
            </button>
            <button onClick={() => handleSave('published')} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Globe size={13} />}
              انتشار
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-red-300"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', width: 'fit-content' }}>
          {([['content', 'محتوا'], ['seo', 'سئو'], ['settings', 'تنظیمات']] as [string, string][]).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={activeTab === tab
                ? { background: 'rgba(0,188,212,0.15)', color: '#00BCD4' }
                : { color: 'rgba(255,255,255,0.5)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Content Tab ────────────────────────────────────────────────── */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Cover Image */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {form.cover_image ? (
                <div className="relative group">
                  <img src={form.cover_image} alt="" className="w-full h-48 object-cover" />
                  <button onClick={() => setF('cover_image', '')}
                    className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.8)' }}>
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-8"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {uploadingImg ? <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" /> : <ImageIcon size={24} />}
                  <span className="text-sm">{uploadingImg ? 'در حال آپلود...' : 'آپلود تصویر شاخص'}</span>
                  <span className="text-xs">JPG, PNG, WebP — حداکثر ۵MB</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
            </div>

            {/* Title */}
            <textarea value={form.title} onChange={e => handleTitleChange(e.target.value)}
              placeholder="عنوان مقاله را بنویسید..."
              rows={2}
              className="w-full bg-transparent text-white outline-none resize-none font-bold"
              style={{ fontSize: 26, lineHeight: 1.4, minHeight: 70 }} />

            {/* Subtitle */}
            <input value={form.subtitle} onChange={e => setF('subtitle', e.target.value)}
              placeholder="زیرعنوان (اختیاری)"
              className="w-full bg-transparent text-white outline-none"
              style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 8 }} />

            {/* Block Editor */}
            <div className="space-y-2">
              {blocks.map((block, idx) => (
                <motion.div key={block.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: block.hidden ? 0.3 : 1, y: 0 }}
                  className="group relative rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,188,212,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                >
                  {/* Block Toolbar */}
                  <div className="absolute -top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg shadow-lg"
                      style={{ background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span className="text-[9px] font-bold uppercase px-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {BLOCK_LABELS[block.type]}
                      </span>
                      <button onClick={() => moveBlock(block.id, 'up')} disabled={idx === 0}
                        className="p-1 rounded hover:bg-white/10 disabled:opacity-25"
                        style={{ color: 'rgba(255,255,255,0.6)' }} title="بالا">
                        <ChevronUp size={12} />
                      </button>
                      <button onClick={() => moveBlock(block.id, 'down')} disabled={idx === blocks.length - 1}
                        className="p-1 rounded hover:bg-white/10 disabled:opacity-25"
                        style={{ color: 'rgba(255,255,255,0.6)' }} title="پایین">
                        <ChevronDown size={12} />
                      </button>
                      <button onClick={() => duplicateBlock(block.id)}
                        className="p-1 rounded hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.6)' }} title="کپی">
                        <Copy size={12} />
                      </button>
                      <button onClick={() => updateBlocks(blocks.map(b => b.id === block.id ? { ...b, hidden: !b.hidden } : b))}
                        className="p-1 rounded hover:bg-white/10" style={{ color: block.hidden ? '#f59e0b' : 'rgba(255,255,255,0.6)' }} title="مخفی/نمایش">
                        {block.hidden ? <Eye size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => deleteBlock(block.id)}
                        className="p-1 rounded hover:bg-white/10" style={{ color: '#ef4444' }} title="حذف">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <BlockRenderer block={block} onChange={(data) => updateBlock(block.id, data)} />
                </motion.div>
              ))}
            </div>

            {/* Add Block Button */}
            <div className="relative" ref={addBtnRef}>
              <button onClick={() => setShowAddBlock(v => !v)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm transition-all hover:opacity-80"
                style={{ background: 'rgba(0,188,212,0.06)', border: '2px dashed rgba(0,188,212,0.25)', color: '#00BCD4' }}>
                <Plus size={16} /> افزودن بلوک
              </button>
              <AnimatePresence>
                {showAddBlock && (
                  <AddBlockMenu onAdd={(t) => addBlock(t)} onClose={() => setShowAddBlock(false)} />
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── SEO Tab ───────────────────────────────────────────────────── */}
        {activeTab === 'seo' && (
          <div className="max-w-xl">
            <SEOPanel form={{ ...form, title: form.title, slug: form.slug }} onChange={(updates) => setForm(f => ({ ...f, ...updates }))} />
          </div>
        )}

        {/* ── Settings Tab ──────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Slug</label>
              <input value={form.slug} onChange={e => setF('slug', e.target.value)}
                className={inputCls} style={{ ...inputSt, direction: 'ltr', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>دسته‌بندی</label>
              <select value={form.category} onChange={e => setF('category', e.target.value)}
                className={inputCls} style={inputSt}>
                <option value="">انتخاب دسته‌بندی...</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>نویسنده</label>
              <select value={form.author_name} onChange={e => setF('author_name', e.target.value)}
                className={inputCls} style={inputSt}>
                <option value="">انتخاب نویسنده...</option>
                {authors.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>نقش نویسنده</label>
              <input value={form.author_role} onChange={e => setF('author_role', e.target.value)}
                placeholder="Senior VC Advisor" className={inputCls} style={inputSt} />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>وضعیت</label>
              <select value={form.status} onChange={e => setF('status', e.target.value)}
                className={inputCls} style={inputSt}>
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشر شده</option>
                <option value="scheduled">زمان‌بندی شده</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>زمان مطالعه</label>
              <input value={form.read_time} onChange={e => setF('read_time', e.target.value)}
                placeholder="۵ دقیقه" className={inputCls} style={inputSt} />
            </div>
            {form.status === 'scheduled' && (
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>تاریخ زمان‌بندی</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={e => setF('scheduled_at', e.target.value)}
                  className={inputCls} style={{ ...inputSt, direction: 'ltr' }} />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>تگ‌ها (با کاما جدا کنید)</label>
              <input value={form.tags} onChange={e => setF('tags', e.target.value)}
                placeholder="VC, Startup, Investment" className={inputCls} style={inputSt} />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {allTags.slice(0, 8).map(t => (
                  <button key={t.id} onClick={() => {
                    const current = form.tags.split(',').map((x: string) => x.trim()).filter(Boolean);
                    if (!current.includes(t.name)) setF('tags', [...current, t.name].join(', '));
                  }} className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,188,212,0.08)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
                    + {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>خلاصه (Excerpt)</label>
              <textarea value={form.excerpt} onChange={e => setF('excerpt', e.target.value)}
                rows={3} placeholder="خلاصه کوتاه مقاله..." className={`${inputCls} resize-none`} style={inputSt} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <button onClick={() => setF('featured', !form.featured)}
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: form.featured ? '#f59e0b' : 'rgba(255,255,255,0.4)' }}>
                <Star size={16} fill={form.featured ? '#f59e0b' : 'none'} />
                {form.featured ? 'پست ویژه (Featured)' : 'تبدیل به پست ویژه'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right Sidebar ──────────────────────────────────────────────────── */}
      <div className="hidden xl:block w-72 flex-shrink-0">
        <div className="sticky top-20 space-y-4">
          {/* Publish Box */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm font-semibold text-white">انتشار</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>وضعیت:</span>
                <span className="text-xs font-medium" style={{ color: STATUS_CFG[form.status as BlogPostStatus]?.color ?? '#94a3b8' }}>
                  {STATUS_CFG[form.status as BlogPostStatus]?.label ?? form.status}
                </span>
              </div>
              {post?.published_at && (
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>انتشار:</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {new Date(post.published_at).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              )}
            </div>
            <button onClick={() => handleSave('published')} disabled={saving}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
              {saving ? 'در حال ذخیره...' : form.status === 'published' ? 'بروزرسانی' : 'انتشار'}
            </button>
            <button onClick={() => handleSave('draft')} disabled={saving}
              className="w-full py-2 rounded-xl text-sm transition-all disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
              ذخیره پیش‌نویس
            </button>
          </div>

          {/* SEO Score mini */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm font-semibold text-white mb-3">سئو</p>
            <SEOPanel
              form={{ ...form, title: form.title, slug: form.slug }}
              onChange={(updates) => setForm(f => ({ ...f, ...updates }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  draft: { label: 'پیش‌نویس', color: '#94a3b8' },
  published: { label: 'منتشر شده', color: '#22c55e' },
  scheduled: { label: 'زمان‌بندی شده', color: '#f59e0b' },
  archived: { label: 'بایگانی', color: '#6b7280' },
};
