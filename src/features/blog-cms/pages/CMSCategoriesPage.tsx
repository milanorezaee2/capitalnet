// ─── Enterprise Blog CMS — Categories Management ─────────────────────────────
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit3, Trash2, Folder, FolderOpen, Search,
  Save, X, ChevronDown,
} from 'lucide-react';
import { fetchCategories, saveCategory, deleteCategory } from '../api';
import type { Category } from '../types';

function slugify(t: string) {
  return t.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

interface FormState {
  id?: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string;
  sort_order: number;
  seo_title: string;
  seo_description: string;
}

const EMPTY_FORM: FormState = {
  name: '', slug: '', description: '', parent_id: '',
  sort_order: 0, seo_title: '', seo_description: '',
};

export default function CMSCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [expandedSEO, setExpandedSEO] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { loadCats(); }, []);
  const loadCats = async () => { setLoading(true); setCats(await fetchCategories()); setLoading(false); };

  const filtered = cats.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase())
  );

  const handleEdit = (cat: Category) => {
    setForm({
      id: cat.id, name: cat.name, slug: cat.slug,
      description: cat.description ?? '',
      parent_id: cat.parent_id ?? '',
      sort_order: cat.sort_order ?? 0,
      seo_title: cat.seo_title ?? '',
      seo_description: cat.seo_description ?? '',
    });
    setShowForm(true);
    setExpandedSEO(false);
  };

  const handleNew = () => { setForm(EMPTY_FORM); setShowForm(true); setExpandedSEO(false); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await saveCategory({ ...form, slug: form.slug || slugify(form.name), parent_id: form.parent_id || undefined });
    setSaving(false);
    setShowForm(false);
    showToast(form.id ? 'دسته‌بندی بروزرسانی شد' : 'دسته‌بندی ایجاد شد');
    loadCats();
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    setConfirmDel(null);
    showToast('دسته‌بندی حذف شد');
    loadCats();
  };

  const setF = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }));

  const inputSt = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none';

  return (
    <div className="space-y-5" dir="rtl">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete */}
      <AnimatePresence>
        {confirmDel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="rounded-2xl p-6 w-72 text-center" style={{ background: '#0d1b2a', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Trash2 size={28} className="mx-auto mb-2" style={{ color: '#ef4444' }} />
              <p className="text-white font-semibold mb-1">حذف دسته‌بندی</p>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>مقالات این دسته بدون دسته‌بندی می‌مانند.</p>
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">دسته‌بندی‌ها</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{cats.length} دسته‌بندی</p>
        </div>
        <button onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
          <Plus size={15} /> دسته جدید
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1 rounded-2xl p-5 space-y-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,188,212,0.2)' }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-white">{form.id ? 'ویرایش دسته' : 'دسته جدید'}</h3>
                <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <X size={14} />
                </button>
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>نام *</label>
                <input value={form.name} onChange={e => { setF('name', e.target.value); if (!form.id) setF('slug', slugify(e.target.value)); }}
                  placeholder="نام دسته‌بندی" className={inputCls} style={inputSt} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Slug</label>
                <input value={form.slug} onChange={e => setF('slug', e.target.value)}
                  placeholder="category-slug" className={inputCls} style={{ ...inputSt, direction: 'ltr', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>دسته والد</label>
                <select value={form.parent_id} onChange={e => setF('parent_id', e.target.value)}
                  className={inputCls} style={inputSt}>
                  <option value="">بدون والد (سطح اول)</option>
                  {cats.filter(c => c.id !== form.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>توضیحات</label>
                <textarea value={form.description} onChange={e => setF('description', e.target.value)}
                  rows={2} placeholder="توضیح کوتاه..." className={`${inputCls} resize-none`} style={inputSt} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>ترتیب نمایش</label>
                <input type="number" value={form.sort_order} onChange={e => setF('sort_order', +e.target.value)}
                  className={inputCls} style={{ ...inputSt, direction: 'ltr' }} />
              </div>

              {/* SEO Accordion */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <button onClick={() => setExpandedSEO(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.6)' }}>
                  تنظیمات SEO
                  <ChevronDown size={13} className={`transition-transform ${expandedSEO ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedSEO && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <div className="px-3 pb-3 space-y-2">
                        <input value={form.seo_title} onChange={e => setF('seo_title', e.target.value)}
                          placeholder="عنوان SEO" className={`${inputCls} text-xs`} style={inputSt} />
                        <textarea value={form.seo_description} onChange={e => setF('seo_description', e.target.value)}
                          rows={2} placeholder="توضیحات SEO" className={`${inputCls} text-xs resize-none`} style={inputSt} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
                {saving ? 'در حال ذخیره...' : <span className="flex items-center justify-center gap-1.5"><Save size={13} /> ذخیره</span>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        <div className={`${showForm ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در دسته‌بندی‌ها..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={inputSt} />
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <span className="w-5 h-5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Folder size={32} className="mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>دسته‌بندی یافت نشد</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>نام</th>
                    <th className="text-right px-4 py-3 text-xs font-medium hidden sm:table-cell" style={{ color: 'rgba(255,255,255,0.4)' }}>Slug</th>
                    <th className="text-right px-4 py-3 text-xs font-medium hidden md:table-cell" style={{ color: 'rgba(255,255,255,0.4)' }}>توضیحات</th>
                    <th className="text-center px-4 py-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>مقالات</th>
                    <th className="text-center px-4 py-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cat, i) => {
                    const parent = cats.find(c => c.id === cat.parent_id);
                    return (
                      <motion.tr key={cat.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(0,188,212,0.12)' }}>
                              {cat.parent_id ? <FolderOpen size={14} style={{ color: '#00BCD4' }} /> : <Folder size={14} style={{ color: '#00BCD4' }} />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{cat.name}</p>
                              {parent && <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>زیر: {parent.name}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <code className="text-xs" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>{cat.slug}</code>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-xs line-clamp-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{cat.description || '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(0,188,212,0.08)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.15)' }}>
                            {(cat.post_count ?? 0).toLocaleString('fa-IR')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleEdit(cat)}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                              style={{ color: 'rgba(0,188,212,0.8)' }} title="ویرایش">
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => setConfirmDel(cat.id)}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                              style={{ color: 'rgba(239,68,68,0.6)' }} title="حذف">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
