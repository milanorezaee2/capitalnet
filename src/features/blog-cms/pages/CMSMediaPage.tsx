// ─── Enterprise Blog CMS — Media Library ─────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Grid, List, Search, Trash2, Edit3, Download, X,
  Image as ImageIcon, Video, FileText, Music, File, FolderOpen,
  RefreshCw, Eye, Copy,
} from 'lucide-react';
import { fetchMedia, saveMediaFile, deleteMedia, uploadMedia } from '../api';
import type { MediaFile } from '../types';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon size={18} />,
  video: <Video size={18} />,
  audio: <Music size={18} />,
  document: <FileText size={18} />,
  other: <File size={18} />,
};

const TYPE_COLORS: Record<string, string> = {
  image: '#00BCD4', video: '#8b5cf6', audio: '#f59e0b', document: '#22c55e', other: '#94a3b8',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function CMSMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editFile, setEditFile] = useState<MediaFile | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { load(); }, [filterType, search]);
  const load = async () => {
    setLoading(true);
    const data = await fetchMedia({ type: filterType === 'all' ? undefined : filterType, search: search || undefined });
    setFiles(data);
    setLoading(false);
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    const total = fileList.length;
    for (let i = 0; i < total; i++) {
      setUploadProgress(Math.round(((i + 1) / total) * 100));
      const result = await uploadMedia(fileList[i]);
      if (!result) showToast(`آپلود "${fileList[i].name}" با خطا مواجه شد`);
    }
    setUploading(false);
    setUploadProgress(0);
    showToast(`${total} فایل آپلود شد`);
    load();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDelete = async (id: string) => {
    await deleteMedia(id);
    setFiles(prev => prev.filter(f => f.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    showToast('فایل حذف شد');
  };

  const handleBulkDelete = async () => {
    await Promise.all(Array.from(selected).map(id => deleteMedia(id)));
    setFiles(prev => prev.filter(f => !selected.has(f.id)));
    showToast(`${selected.size} فایل حذف شد`);
    setSelected(new Set());
  };

  const handleSaveEdit = async () => {
    if (!editFile) return;
    await saveMediaFile(editFile);
    setFiles(prev => prev.map(f => f.id === editFile.id ? editFile : f));
    setEditFile(null);
    showToast('فایل بروزرسانی شد');
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('لینک کپی شد');
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const inputSt = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
  const inputCls = 'w-full px-3 py-2 rounded-xl text-sm text-white outline-none';

  return (
    <div className="space-y-5" dir="rtl">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editFile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="rounded-2xl p-6 w-96 space-y-3" style={{ background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">ویرایش فایل</p>
                <button onClick={() => setEditFile(null)} style={{ color: 'rgba(255,255,255,0.5)' }}><X size={14} /></button>
              </div>
              {editFile.type === 'image' && (
                <img src={editFile.url} alt="" className="w-full h-32 object-cover rounded-xl mb-2" />
              )}
              {[
                { key: 'alt_text', label: 'Alt Text' },
                { key: 'caption', label: 'کپشن' },
                { key: 'title', label: 'عنوان' },
                { key: 'description', label: 'توضیحات' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.label}</label>
                  <input value={(editFile as any)[f.key] ?? ''} onChange={e => setEditFile({ ...editFile, [f.key]: e.target.value } as any)}
                    className={inputCls} style={inputSt} />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveEdit} className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(0,188,212,0.9)', color: '#fff' }}>ذخیره</button>
                <button onClick={() => setEditFile(null)} className="flex-1 py-2 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>انصراف</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setPreviewFile(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
              className="relative max-w-2xl w-full mx-4 rounded-2xl overflow-hidden"
              style={{ background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={() => setPreviewFile(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg z-10 hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.5)' }}>
                <X size={16} />
              </button>
              {previewFile.type === 'image' && <img src={previewFile.url} alt={previewFile.alt_text ?? ''} className="w-full max-h-[70vh] object-contain" />}
              <div className="p-4">
                <p className="text-sm font-semibold text-white">{previewFile.original_name}</p>
                <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <span>{formatBytes(previewFile.size)}</span>
                  {previewFile.width && <span>{previewFile.width}×{previewFile.height}</span>}
                  <span>{previewFile.mime_type}</span>
                </div>
                {previewFile.alt_text && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Alt: {previewFile.alt_text}</p>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => copyUrl(previewFile.url)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: 'rgba(0,188,212,0.12)', color: '#00BCD4' }}>
                    <Copy size={12} /> کپی لینک
                  </button>
                  <a href={previewFile.url} download={previewFile.original_name}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                    <Download size={12} /> دانلود
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">کتابخانه رسانه</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{files.length} فایل</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-xl hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
            {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? `${uploadProgress}٪` : 'آپلود فایل'}
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx" hidden
            onChange={e => handleUpload(e.target.files)} />
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="rounded-2xl border-2 border-dashed py-8 flex flex-col items-center justify-center transition-all cursor-pointer"
        style={{
          borderColor: dragOver ? '#00BCD4' : 'rgba(255,255,255,0.1)',
          background: dragOver ? 'rgba(0,188,212,0.05)' : 'transparent',
          color: dragOver ? '#00BCD4' : 'rgba(255,255,255,0.3)',
        }}
        onClick={() => fileInputRef.current?.click()}>
        <Upload size={24} className="mb-2" />
        <p className="text-sm">فایل‌ها را اینجا رها کنید یا کلیک کنید</p>
        <p className="text-xs mt-0.5">تصویر، ویدیو، صوت، PDF — حداکثر ۵۰MB</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="جستجو فایل..." className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={inputSt} />
        </div>
        {['all', 'image', 'video', 'audio', 'document'].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className="px-3 py-2 rounded-xl text-xs transition-all"
            style={filterType === t
              ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {t === 'all' ? 'همه' : t === 'image' ? 'تصویر' : t === 'video' ? 'ویدیو' : t === 'audio' ? 'صوت' : 'سند'}
          </button>
        ))}
      </div>

      {/* Bulk Delete */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span className="text-sm" style={{ color: '#ef4444' }}>{selected.size} فایل انتخاب شده</span>
            <button onClick={handleBulkDelete}
              className="mr-auto px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}>
              حذف انتخاب‌ها
            </button>
            <button onClick={() => setSelected(new Set())} className="p-1 rounded hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Files Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen size={36} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>فایلی یافت نشد</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>فایل‌های خود را آپلود کنید</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {files.map((file, i) => (
            <motion.div key={file.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: selected.has(file.id) ? '2px solid #00BCD4' : '1px solid rgba(255,255,255,0.07)',
                aspectRatio: '1',
              }}
              onClick={() => toggleSelect(file.id)}>
              {/* Thumbnail */}
              {file.type === 'image' ? (
                <img src={file.thumbnail_url ?? file.url} alt={file.alt_text ?? ''} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center"
                  style={{ color: TYPE_COLORS[file.type] ?? '#94a3b8' }}>
                  {TYPE_ICONS[file.type]}
                  <span className="text-[9px] mt-1 uppercase font-bold">{file.mime_type.split('/')[1]?.slice(0, 4)}</span>
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                style={{ background: 'rgba(0,0,0,0.7)' }}>
                <button onClick={e => { e.stopPropagation(); setPreviewFile(file); }}
                  className="p-1.5 rounded-lg hover:bg-white/20" style={{ color: '#fff' }}>
                  <Eye size={14} />
                </button>
                <button onClick={e => { e.stopPropagation(); setEditFile(file); }}
                  className="p-1.5 rounded-lg hover:bg-white/20" style={{ color: '#fff' }}>
                  <Edit3 size={14} />
                </button>
                <button onClick={e => { e.stopPropagation(); copyUrl(file.url); }}
                  className="p-1.5 rounded-lg hover:bg-white/20" style={{ color: '#fff' }}>
                  <Copy size={14} />
                </button>
                <button onClick={e => { e.stopPropagation(); handleDelete(file.id); }}
                  className="p-1.5 rounded-lg hover:bg-white/20" style={{ color: '#ef4444' }}>
                  <Trash2 size={14} />
                </button>
              </div>
              {/* Select indicator */}
              {selected.has(file.id) && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#00BCD4' }}>
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              )}
              {/* Name */}
              <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-center"
                style={{ background: 'rgba(0,0,0,0.7)' }}>
                <p className="text-[9px] text-white truncate">{file.original_name}</p>
                <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{formatBytes(file.size)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <th className="w-8 px-3 py-3">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded accent-teal-400"
                    checked={selected.size === files.length && files.length > 0}
                    onChange={() => selected.size === files.length ? setSelected(new Set()) : setSelected(new Set(files.map(f => f.id)))} />
                </th>
                {['فایل', 'نوع', 'اندازه', 'تاریخ', 'عملیات'].map(h => (
                  <th key={h} className="text-right px-3 py-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {files.map((file, i) => (
                <motion.tr key={file.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-3 py-3">
                    <input type="checkbox" checked={selected.has(file.id)} onChange={() => toggleSelect(file.id)}
                      className="w-3.5 h-3.5 rounded accent-teal-400" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      {file.type === 'image'
                        ? <img src={file.thumbnail_url ?? file.url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        : <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `${TYPE_COLORS[file.type] ?? '#94a3b8'}15`, color: TYPE_COLORS[file.type] }}>
                            {TYPE_ICONS[file.type]}
                          </div>}
                      <div>
                        <p className="text-xs text-white">{file.original_name}</p>
                        {file.alt_text && <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Alt: {file.alt_text}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: `${TYPE_COLORS[file.type] ?? '#94a3b8'}12`, color: TYPE_COLORS[file.type] }}>
                      {file.type === 'image' ? 'تصویر' : file.type === 'video' ? 'ویدیو' : file.type === 'audio' ? 'صوت' : 'سند'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{formatBytes(file.size)}</td>
                  <td className="px-3 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(file.created_at).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => setPreviewFile(file)} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}><Eye size={13} /></button>
                      <button onClick={() => setEditFile(file)} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'rgba(0,188,212,0.7)' }}><Edit3 size={13} /></button>
                      <button onClick={() => copyUrl(file.url)} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}><Copy size={13} /></button>
                      <button onClick={() => handleDelete(file.id)} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'rgba(239,68,68,0.6)' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
