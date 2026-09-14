// ─── Enterprise Blog CMS — Posts Management Page ─────────────────────────────
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, RefreshCw, Eye, Star, Edit3, Trash2, FileText,
  Download, ExternalLink, Copy,
  Calendar, Clock, ChevronLeft, ChevronRight,
  AlertTriangle, X,
} from 'lucide-react';
import { fetchAllPosts, deletePost, toggleFeatured, updatePost } from '../../../lib/blogApi';
import type { BlogPostRow, BlogPostStatus } from '../../../lib/blogApi';

const STATUS_CFG: Record<BlogPostStatus, { label: string; color: string }> = {
  draft:     { label: 'پیش‌نویس',       color: '#94a3b8' },
  published: { label: 'منتشر شده',      color: '#22c55e' },
  scheduled: { label: 'زمان‌بندی شده',  color: '#f59e0b' },
  archived:  { label: 'بایگانی',        color: '#6b7280' },
} as any;

const CAT_LABELS: Record<string, string> = {
  investment: 'سرمایه‌گذاری', strategy: 'استراتژی',
  'case-study': 'مطالعه موردی', 'market-analysis': 'تحلیل بازار',
  negotiation: 'مذاکره', 'financial-modeling': 'مدل‌سازی مالی',
};

const PAGE_SIZE = 10;

interface PostsPageProps {
  onNavigate: (page: string, postId?: string) => void;
  initialFilter?: 'draft' | 'scheduled' | 'all';
}

export default function CMSPostsPage({ onNavigate, initialFilter = 'all' }: PostsPageProps) {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<BlogPostStatus | 'all'>(initialFilter as any);
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'title'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllPosts({
      status: filterStatus === 'all' ? undefined : filterStatus,
      search: search || undefined,
    });
    // Client-side sort
    data.sort((a, b) => {
      let va: any, vb: any;
      if (sortBy === 'views') { va = a.views ?? 0; vb = b.views ?? 0; }
      else if (sortBy === 'title') { va = a.title; vb = b.title; }
      else { va = a.published_at ?? a.created_at; vb = b.published_at ?? b.created_at; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    setPosts(data as BlogPostRow[]);
    setPage(1);
    setSelected(new Set());
    setLoading(false);
  }, [filterStatus, search, sortBy, sortDir]);

  useEffect(() => { load(); }, [load]);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const handleDelete = async (id: string) => {
    await deletePost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
    setConfirmDelete(null);
    showToast('پست حذف شد');
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await toggleFeatured(id, !current);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, featured: !current } : p));
  };

  const handleToggleStatus = async (post: BlogPostRow) => {
    const newStatus: BlogPostStatus = post.status === 'published' ? 'draft' : 'published';
    const ok = await updatePost(post.id, {
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null,
    } as any);
    if (ok) {
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
      showToast(`وضعیت به "${STATUS_CFG[newStatus].label}" تغییر یافت`);
    }
  };

  const handleDuplicate = async (post: BlogPostRow) => {
    const { createPost } = await import('../../../lib/blogApi');
    const { ...rest } = post;
    await createPost({ ...rest, id: undefined, title: `کپی — ${post.title}`, status: 'draft', slug: `copy-${post.slug}-${Date.now()}` } as any);
    showToast('کپی ایجاد شد');
    load();
  };

  const handleBulkAction = async (action: string) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === 'delete') {
      await Promise.all(ids.map(id => deletePost(id)));
      setPosts(prev => prev.filter(p => !ids.includes(p.id)));
      showToast(`${ids.length} پست حذف شد`);
    } else if (action === 'publish') {
      await Promise.all(ids.map(id => updatePost(id, { status: 'published', published_at: new Date().toISOString() } as any)));
      setPosts(prev => prev.map(p => ids.includes(p.id) ? { ...p, status: 'published' } : p));
      showToast(`${ids.length} پست منتشر شد`);
    } else if (action === 'draft') {
      await Promise.all(ids.map(id => updatePost(id, { status: 'draft', published_at: null } as any)));
      setPosts(prev => prev.map(p => ids.includes(p.id) ? { ...p, status: 'draft' } : p));
      showToast(`${ids.length} پست به پیش‌نویس تبدیل شد`);
    }
    setSelected(new Set());
  };

  const handleExport = () => {
    const data = posts.map(p => ({
      title: p.title, slug: p.slug, category: p.category,
      status: p.status, views: p.views, published_at: p.published_at,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'posts.json'; a.click();
    URL.revokeObjectURL(url);
    showToast('فایل دانلود شد');
  };

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  // Pagination
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const pagePosts = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selected.size === pagePosts.length) setSelected(new Set());
    else setSelected(new Set(pagePosts.map(p => p.id)));
  };

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    totalViews: posts.reduce((s, p) => s + (p.views ?? 0), 0),
  };

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
  const thCls = 'text-right px-3 py-3 text-xs font-medium whitespace-nowrap';

  return (
    <div className="space-y-5" dir="rtl">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl"
            style={toast.type === 'success'
              ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }
              : { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="rounded-2xl p-6 w-80 text-center" style={{ background: '#0d1b2a', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={32} className="mx-auto mb-3" style={{ color: '#ef4444' }} />
              <p className="text-white font-semibold mb-1">حذف پست</p>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>این عملیات قابل بازگشت نیست.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                  انصراف
                </button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}>
                  حذف
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">مدیریت مقالات</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {posts.length.toLocaleString('fa-IR')} مقاله
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={load} disabled={loading}
            className="p-2 rounded-xl transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.5)' }} title="بارگذاری مجدد">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Download size={14} /> خروجی
          </button>
          <button onClick={() => onNavigate('blog-new-post')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
            <Plus size={15} /> پست جدید
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'کل', value: stats.total, color: '#94a3b8', filter: 'all' },
          { label: 'منتشر', value: stats.published, color: '#22c55e', filter: 'published' },
          { label: 'پیش‌نویس', value: stats.draft, color: '#f59e0b', filter: 'draft' },
          { label: 'زمان‌بندی', value: stats.scheduled, color: '#8b5cf6', filter: 'scheduled' },
          { label: 'بازدید کل', value: stats.totalViews.toLocaleString('fa-IR'), color: '#00BCD4', filter: 'all' },
        ].map(s => (
          <button key={s.label}
            onClick={() => { setFilterStatus(s.filter as any); }}
            className="text-right rounded-xl p-3.5 transition-all hover:scale-[1.02]"
            style={{
              background: filterStatus === s.filter && s.filter !== 'all' ? `${s.color}10` : 'rgba(255,255,255,0.04)',
              border: filterStatus === s.filter && s.filter !== 'all' ? `1px solid ${s.color}30` : '1px solid rgba(255,255,255,0.07)',
            }}>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="جستجو عنوان... (کلید /)"
            className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={inputStyle} />
          {search && <button onClick={() => { setSearch(''); }} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}><X size={14} /></button>}
        </div>

        {/* Status Filters */}
        <div className="flex gap-1">
          {(['all', 'published', 'draft', 'scheduled'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="text-xs px-3 py-2 rounded-xl transition-all"
              style={filterStatus === s
                ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {s === 'all' ? 'همه' : STATUS_CFG[s as BlogPostStatus]?.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          className="text-xs px-3 py-2 rounded-xl outline-none text-white"
          style={inputStyle}>
          <option value="date">ترتیب: تاریخ</option>
          <option value="views">ترتیب: بازدید</option>
          <option value="title">ترتیب: عنوان</option>
        </select>
        <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
          className="p-2 rounded-xl text-xs transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.5)', ...inputStyle }}>
          {sortDir === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(0,188,212,0.08)', border: '1px solid rgba(0,188,212,0.2)' }}>
            <span className="text-sm" style={{ color: '#00BCD4' }}>
              {selected.size.toLocaleString('fa-IR')} مورد انتخاب شده
            </span>
            <div className="flex gap-2 mr-auto">
              <button onClick={() => handleBulkAction('publish')}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                انتشار
              </button>
              <button onClick={() => handleBulkAction('draft')}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                پیش‌نویس
              </button>
              <button onClick={() => handleBulkAction('delete')}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                حذف
              </button>
              <button onClick={() => setSelected(new Set())} className="text-xs p-1.5 rounded-lg hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={36} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>پستی یافت نشد</p>
            <button onClick={() => onNavigate('blog-new-post')}
              className="mt-3 text-sm" style={{ color: '#00BCD4' }}>
              اولین پست را بنویسید →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <th className="px-3 py-3 w-8">
                    <input type="checkbox" checked={selected.size === pagePosts.length && pagePosts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded accent-teal-400 cursor-pointer" />
                  </th>
                  <th className={thCls} style={{ color: 'rgba(255,255,255,0.4)' }}>تصویر</th>
                  <th className={thCls} style={{ color: 'rgba(255,255,255,0.4)' }}>عنوان / Slug</th>
                  <th className={`${thCls} hidden sm:table-cell`} style={{ color: 'rgba(255,255,255,0.4)' }}>دسته‌بندی</th>
                  <th className={`${thCls} hidden md:table-cell`} style={{ color: 'rgba(255,255,255,0.4)' }}>نویسنده</th>
                  <th className={thCls} style={{ color: 'rgba(255,255,255,0.4)' }}>وضعیت</th>
                  <th className={`${thCls} hidden lg:table-cell`} style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <button onClick={() => { setSortBy('views'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}
                      className="flex items-center gap-1 hover:text-white transition-colors">
                      <Eye size={12} /> بازدید
                    </button>
                  </th>
                  <th className={`${thCls} hidden xl:table-cell`} style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <button onClick={() => { setSortBy('date'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}
                      className="flex items-center gap-1 hover:text-white transition-colors">
                      <Calendar size={12} /> تاریخ
                    </button>
                  </th>
                  <th className={`${thCls} hidden lg:table-cell`} style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <div className="flex items-center gap-1"><Clock size={12} /> مطالعه</div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {pagePosts.map((post, i) => (
                  <motion.tr key={post.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="transition-colors group"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: selected.has(post.id) ? 'rgba(0,188,212,0.04)' : 'transparent' }}
                    onMouseEnter={e => { if (!selected.has(post.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { if (!selected.has(post.id)) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={selected.has(post.id)} onChange={() => toggleSelect(post.id)}
                        className="w-3.5 h-3.5 rounded accent-teal-400 cursor-pointer" />
                    </td>
                    {/* Cover */}
                    <td className="px-3 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.07)' }}>
                        {post.cover_image
                          ? <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                          : <FileText size={16} className="m-auto mt-2.5" style={{ color: 'rgba(255,255,255,0.2)' }} />}
                      </div>
                    </td>
                    {/* Title */}
                    <td className="px-3 py-3">
                      <div className="flex items-start gap-1.5 max-w-xs">
                        {post.featured && <Star size={11} className="mt-0.5 flex-shrink-0" style={{ color: '#f59e0b' }} fill="#f59e0b" />}
                        <div>
                          <p className="font-medium text-white line-clamp-1 text-sm">{post.title}</p>
                          <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>/{post.slug ?? post.id}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,188,212,0.08)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.15)' }}>
                        {CAT_LABELS[post.category ?? ''] ?? post.category ?? '—'}
                      </span>
                    </td>
                    {/* Author */}
                    <td className="px-3 py-3 hidden md:table-cell">
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{post.author_name}</p>
                    </td>
                    {/* Status */}
                    <td className="px-3 py-3">
                      <button onClick={() => handleToggleStatus(post)}
                        className="text-xs px-2 py-1 rounded-full transition-all hover:opacity-70"
                        style={{
                          background: `${STATUS_CFG[post.status]?.color ?? '#94a3b8'}15`,
                          color: STATUS_CFG[post.status]?.color ?? '#94a3b8',
                          border: `1px solid ${STATUS_CFG[post.status]?.color ?? '#94a3b8'}30`,
                        }}>
                        {STATUS_CFG[post.status]?.label ?? post.status}
                      </button>
                    </td>
                    {/* Views */}
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <Eye size={11} /> {(post.views ?? 0).toLocaleString('fa-IR')}
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-3 py-3 hidden xl:table-cell text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {fmtDate(post.published_at)}
                    </td>
                    {/* Read Time */}
                    <td className="px-3 py-3 hidden lg:table-cell text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {post.read_time}
                    </td>
                    {/* Actions */}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        <button onClick={() => handleToggleFeatured(post.id, post.featured ?? false)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                          style={{ color: post.featured ? '#f59e0b' : 'rgba(255,255,255,0.25)' }}
                          title={post.featured ? 'حذف ویژه' : 'ویژه کردن'}>
                          <Star size={13} fill={post.featured ? '#f59e0b' : 'none'} />
                        </button>
                        <a href={`/blog/${post.slug ?? post.id}`} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                          style={{ color: 'rgba(255,255,255,0.35)' }} title="مشاهده در سایت">
                          <ExternalLink size={13} />
                        </a>
                        <button onClick={() => onNavigate('blog-edit-post', post.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                          style={{ color: 'rgba(0,188,212,0.8)' }} title="ویرایش">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => handleDuplicate(post)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                          style={{ color: 'rgba(255,255,255,0.35)' }} title="کپی">
                          <Copy size={13} />
                        </button>
                        <button onClick={() => setConfirmDelete(post.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                          style={{ color: 'rgba(239,68,68,0.6)' }} title="حذف">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            نمایش {((page - 1) * PAGE_SIZE + 1).toLocaleString('fa-IR')}–{Math.min(page * PAGE_SIZE, posts.length).toLocaleString('fa-IR')} از {posts.length.toLocaleString('fa-IR')}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255,255,255,0.6)' }}>
              <ChevronRight size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pg = i + 1;
              if (totalPages > 7) {
                if (page <= 4) pg = i + 1;
                else if (page >= totalPages - 3) pg = totalPages - 6 + i;
                else pg = page - 3 + i;
              }
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className="w-7 h-7 rounded-lg text-xs transition-all"
                  style={pg === page
                    ? { background: '#00BCD4', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.04)' }}>
                  {pg.toLocaleString('fa-IR')}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255,255,255,0.6)' }}>
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
