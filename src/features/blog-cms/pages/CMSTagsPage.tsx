// ─── Enterprise Blog CMS — Tags Management ───────────────────────────────────
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Tag as TagIcon, Search, Save, X, Merge } from 'lucide-react';
import { fetchTags, saveTag, deleteTag, mergeTags } from '../api';
import type { Tag } from '../types';

function slugify(t: string) {
  return t.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export default function CMSTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [mergeSource, setMergeSource] = useState<string | null>(null);
  const [mergeTarget, setMergeTarget] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { loadTags(); }, []);
  const loadTags = async () => { setLoading(true); setTags(await fetchTags()); setLoading(false); };

  const filtered = tags.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveNew = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    await saveTag({ name: newName, slug: newSlug || slugify(newName), description: newDesc || undefined });
    setSaving(false);
    setShowNew(false);
    setNewName(''); setNewSlug(''); setNewDesc('');
    showToast('برچسب ایجاد شد');
    loadTags();
  };

  const handleSaveEdit = async () => {
    if (!editTag) return;
    setSaving(true);
    await saveTag({ ...editTag });
    setSaving(false);
    setEditTag(null);
    showToast('برچسب بروزرسانی شد');
    loadTags();
  };

  const handleDelete = async (id: string) => {
    await deleteTag(id);
    setConfirmDel(null);
    showToast('برچسب حذف شد');
    loadTags();
  };

  const handleMerge = async () => {
    if (!mergeSource || !mergeTarget || mergeSource === mergeTarget) return;
    await mergeTags(mergeSource, mergeTarget);
    setMergeSource(null);
    setMergeTarget('');
    showToast('برچسب‌ها ادغام شدند');
    loadTags();
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

      {/* Confirm Delete */}
      <AnimatePresence>
        {confirmDel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="rounded-2xl p-6 w-72 text-center" style={{ background: '#0d1b2a', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-white font-semibold mb-4">حذف برچسب؟</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDel(null)} className="flex-1 py-2 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>انصراف</button>
                <button onClick={() => handleDelete(confirmDel)} className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}>حذف</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Merge Modal */}
      <AnimatePresence>
        {mergeSource && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="rounded-2xl p-6 w-80 space-y-4" style={{ background: '#0d1b2a', border: '1px solid rgba(0,188,212,0.3)' }}>
              <p className="text-white font-semibold">ادغام برچسب‌ها</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                برچسب "{tags.find(t => t.id === mergeSource)?.name}" در برچسب زیر ادغام می‌شود:
              </p>
              <select value={mergeTarget} onChange={e => setMergeTarget(e.target.value)}
                className={inputCls} style={inputSt}>
                <option value="">انتخاب برچسب هدف...</option>
                {tags.filter(t => t.id !== mergeSource).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => { setMergeSource(null); setMergeTarget(''); }} className="flex-1 py-2 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>انصراف</button>
                <button onClick={handleMerge} disabled={!mergeTarget}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                  style={{ background: 'rgba(0,188,212,0.9)', color: '#fff' }}>ادغام</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">برچسب‌ها</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{tags.length} برچسب</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
          <Plus size={15} /> برچسب جدید
        </button>
      </div>

      {/* New Tag Form */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="rounded-2xl p-4 space-y-3"
              style={{ background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.2)' }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">برچسب جدید</p>
                <button onClick={() => setShowNew(false)} style={{ color: 'rgba(255,255,255,0.5)' }}><X size={14} /></button>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>نام *</label>
                  <input value={newName} onChange={e => { setNewName(e.target.value); setNewSlug(slugify(e.target.value)); }}
                    placeholder="نام برچسب" className={inputCls} style={inputSt} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Slug</label>
                  <input value={newSlug} onChange={e => setNewSlug(e.target.value)} dir="ltr"
                    placeholder="tag-slug" className={inputCls} style={{ ...inputSt, fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>توضیحات</label>
                  <input value={newDesc} onChange={e => setNewDesc(e.target.value)}
                    placeholder="توضیح کوتاه" className={inputCls} style={inputSt} />
                </div>
              </div>
              <button onClick={handleSaveNew} disabled={saving || !newName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
                <Save size={13} /> ذخیره
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Tags Grid */}
      <div className="relative">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="جستجو در برچسب‌ها..."
          className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
          style={inputSt} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="w-5 h-5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((tag, i) => (
            <motion.div key={tag.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="rounded-2xl p-4 group"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {editTag?.id === tag.id ? (
                <div className="space-y-2">
                  <input value={editTag.name} onChange={e => setEditTag({ ...editTag, name: e.target.value })}
                    className={`${inputCls} text-xs`} style={inputSt} />
                  <input value={editTag.slug} onChange={e => setEditTag({ ...editTag, slug: e.target.value })}
                    dir="ltr" className={`${inputCls} text-xs`} style={{ ...inputSt, fontFamily: 'monospace' }} />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(0,188,212,0.9)', color: '#fff' }}>ذخیره</button>
                    <button onClick={() => setEditTag(null)} className="flex-1 py-1.5 rounded-lg text-xs"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>لغو</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(244,114,182,0.12)' }}>
                      <TagIcon size={13} style={{ color: '#f472b6' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tag.name}</p>
                      <div className="flex items-center gap-2">
                        <code className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{tag.slug}</code>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(244,114,182,0.08)', color: '#f472b6' }}>
                          {(tag.post_count ?? 0).toLocaleString('fa-IR')} مقاله
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditTag(tag)}
                      className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'rgba(0,188,212,0.8)' }}>
                      <Edit3 size={12} />
                    </button>
                    <button onClick={() => setMergeSource(tag.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'rgba(139,92,246,0.8)' }} title="ادغام">
                      <Merge size={12} />
                    </button>
                    <button onClick={() => setConfirmDel(tag.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'rgba(239,68,68,0.6)' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
