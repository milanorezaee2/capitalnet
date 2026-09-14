// ─── Enterprise Blog CMS — Authors Management ────────────────────────────────
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit3, Trash2, UserCircle2, Search, Save, X,
  Globe, Twitter, Linkedin, Instagram, Github, ChevronDown,
} from 'lucide-react';
import { fetchAuthors, saveAuthor, deleteAuthor } from '../api';
import type { Author } from '../types';

function slugify(t: string) {
  return t.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

const EMPTY: Partial<Author> & { name: string; slug: string } = {
  name: '', slug: '', email: '', bio: '', role: '', title: '',
  website: '', twitter: '', linkedin: '', instagram: '', github: '',
  expertise: [], active: true,
};

export default function CMSAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [expandSocial, setExpandSocial] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); setAuthors(await fetchAuthors()); setLoading(false); };

  const filtered = authors.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || (a.email ?? '').includes(search.toLowerCase())
  );

  const handleEdit = (a: Author) => {
    setForm({ ...a, expertise: a.expertise ?? [] });
    setExpertiseInput((a.expertise ?? []).join(', '));
    setShowForm(true);
    setExpandSocial(false);
  };

  const handleNew = () => {
    setForm({ ...EMPTY });
    setExpertiseInput('');
    setShowForm(true);
    setExpandSocial(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const expertise = expertiseInput.split(',').map(s => s.trim()).filter(Boolean);
    await saveAuthor({ ...form, slug: form.slug || slugify(form.name), expertise } as any);
    setSaving(false);
    setShowForm(false);
    showToast(form.id ? 'نویسنده بروزرسانی شد' : 'نویسنده ایجاد شد');
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteAuthor(id);
    setConfirmDel(null);
    showToast('نویسنده حذف شد');
    load();
  };

  const setF = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const inputSt = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none';

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
              <p className="text-white font-semibold mb-4">حذف نویسنده؟</p>
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
          <h1 className="text-xl font-bold text-white">نویسندگان</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{authors.length} نویسنده</p>
        </div>
        <button onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
          <Plus size={15} /> نویسنده جدید
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Form Panel */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1 rounded-2xl p-5 space-y-3 overflow-y-auto"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,188,212,0.2)', maxHeight: '80vh' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{form.id ? 'ویرایش نویسنده' : 'نویسنده جدید'}</h3>
                <button onClick={() => setShowForm(false)} style={{ color: 'rgba(255,255,255,0.5)' }}><X size={14} /></button>
              </div>

              {[
                { key: 'name', label: 'نام *', placeholder: 'نام و نام خانوادگی' },
                { key: 'slug', label: 'Slug', placeholder: 'author-slug', dir: 'ltr', mono: true },
                { key: 'email', label: 'ایمیل', placeholder: 'author@example.com', dir: 'ltr' },
                { key: 'title', label: 'عنوان شغلی', placeholder: 'Senior VC Advisor' },
                { key: 'role', label: 'نقش', placeholder: 'Editor / Writer' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.label}</label>
                  <input value={(form as any)[f.key] ?? ''} onChange={e => {
                    setF(f.key, e.target.value);
                    if (f.key === 'name' && !form.id) setF('slug', slugify(e.target.value));
                  }}
                    placeholder={f.placeholder} dir={(f as any).dir}
                    className={inputCls} style={{ ...inputSt, ...(f as any).mono ? { fontFamily: 'monospace' } : {} }} />
                </div>
              ))}

              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>بیوگرافی</label>
                <textarea value={form.bio ?? ''} onChange={e => setF('bio', e.target.value)}
                  rows={3} placeholder="معرفی کوتاه نویسنده..." className={`${inputCls} resize-none`} style={inputSt} />
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>تخصص‌ها (با کاما)</label>
                <input value={expertiseInput} onChange={e => setExpertiseInput(e.target.value)}
                  placeholder="VC, Investment, Strategy" className={inputCls} style={inputSt} />
              </div>

              {/* Social Links Accordion */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <button onClick={() => setExpandSocial(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.6)' }}>
                  شبکه‌های اجتماعی
                  <ChevronDown size={13} className={`transition-transform ${expandSocial ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandSocial && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-3 pb-3 space-y-2">
                        {[
                          { key: 'website', placeholder: 'https://website.com', icon: <Globe size={12} /> },
                          { key: 'twitter', placeholder: '@username', icon: <Twitter size={12} /> },
                          { key: 'linkedin', placeholder: 'linkedin.com/in/...', icon: <Linkedin size={12} /> },
                          { key: 'instagram', placeholder: '@username', icon: <Instagram size={12} /> },
                          { key: 'github', placeholder: 'github.com/...', icon: <Github size={12} /> },
                        ].map(s => (
                          <div key={s.key} className="flex items-center gap-2">
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{s.icon}</span>
                            <input value={(form as any)[s.key] ?? ''} onChange={e => setF(s.key, e.target.value)}
                              placeholder={s.placeholder} dir="ltr"
                              className="flex-1 text-xs px-2 py-1.5 rounded-lg outline-none"
                              style={{ ...inputSt, color: 'rgba(255,255,255,0.8)' }} />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>وضعیت فعال</span>
                <button onClick={() => setF('active', !form.active)}
                  className="w-10 h-5 rounded-full transition-colors relative"
                  style={{ background: form.active ? '#00BCD4' : 'rgba(255,255,255,0.15)' }}>
                  <span className="absolute top-0.5 transition-all w-4 h-4 rounded-full"
                    style={{ background: '#fff', right: form.active ? '2px' : 'auto', left: form.active ? 'auto' : '2px' }} />
                </button>
              </div>

              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
                {saving ? 'در حال ذخیره...' : <span className="flex items-center justify-center gap-1.5"><Save size={13} /> ذخیره</span>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Authors List */}
        <div className={`${showForm ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="جستجو نویسنده..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={inputSt} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="w-5 h-5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map((author, i) => (
                <motion.div key={author.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-2xl p-4 group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,188,212,0.12)' }}>
                      {author.avatar
                        ? <img src={author.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                        : <UserCircle2 size={20} style={{ color: '#00BCD4' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{author.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: author.active ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)', color: author.active ? '#22c55e' : '#6b7280' }}>
                          {author.active ? 'فعال' : 'غیرفعال'}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{author.title || author.role || '—'}</p>
                      {author.expertise && author.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {author.expertise.slice(0, 3).map((e, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(0,188,212,0.06)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.15)' }}>
                              {e}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(author)}
                        className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'rgba(0,188,212,0.8)' }}>
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => setConfirmDel(author.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'rgba(239,68,68,0.6)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {(author.post_count ?? 0).toLocaleString('fa-IR')} مقاله
                    </span>
                    {author.twitter && <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-80" style={{ color: '#1d9bf0' }}>@{author.twitter}</a>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
