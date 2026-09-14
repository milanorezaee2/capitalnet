// ─── Enterprise Blog CMS — Comments Management ───────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, Check, X, Trash2, Flag, Reply,
  RefreshCw,
} from 'lucide-react';
import { fetchComments, updateCommentStatus, deleteComment, replyToComment } from '../api';
import type { Comment } from '../types';

const STATUS_CFG = {
  pending:  { label: 'در انتظار',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  approved: { label: 'تأیید شده',     color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  rejected: { label: 'رد شده',        color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  spam:     { label: 'اسپم',          color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

export default function CMSCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchComments({
      status: filterStatus === 'all' ? undefined : filterStatus,
      search: search || undefined,
    });
    setComments(data);
    setLoading(false);
  }, [filterStatus, search]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id: string, status: Comment['status']) => {
    await updateCommentStatus(id, status);
    setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    showToast('وضعیت نظر تغییر کرد');
  };

  const handleDelete = async (id: string) => {
    await deleteComment(id);
    setComments(prev => prev.filter(c => c.id !== id));
    showToast('نظر حذف شد');
  };

  const handleReply = async () => {
    if (!replyTarget || !replyText.trim()) return;
    setReplying(true);
    const newReply = await replyToComment(replyTarget, { author_name: 'ادمین', content: replyText });
    setReplying(false);
    setComments(prev => [...prev, newReply]);
    setReplyTarget(null);
    setReplyText('');
    showToast('پاسخ ارسال شد');
  };

  const stats = {
    all: comments.length,
    pending: comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    spam: comments.filter(c => c.status === 'spam').length,
  };

  const inputSt = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">نظرات</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{stats.all} نظر · {stats.pending} در انتظار</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Badges */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected', 'spam'] as const).map(s => {
          const cfg = s === 'all' ? { label: 'همه', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' } : STATUS_CFG[s];
          const count = s === 'all' ? stats.all : comments.filter(c => c.status === s).length;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: filterStatus === s ? cfg.bg : 'rgba(255,255,255,0.04)',
                color: filterStatus === s ? cfg.color : 'rgba(255,255,255,0.5)',
                border: `1px solid ${filterStatus === s ? cfg.color + '40' : 'rgba(255,255,255,0.08)'}`,
              }}>
              {cfg.label}
              <span className="px-1.5 py-0.5 rounded-full text-[10px]"
                style={{ background: filterStatus === s ? cfg.color + '25' : 'rgba(255,255,255,0.08)' }}>
                {count.toLocaleString('fa-IR')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
          placeholder="جستجو در نظرات..."
          className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
          style={inputSt} />
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={32} className="mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>نظری یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment, i) => {
            const cfg = STATUS_CFG[comment.status];
            const isParent = !comment.parent_id;
            return (
              <motion.div key={comment.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className={`rounded-2xl p-4 ${!isParent ? 'mr-8' : ''}`}
                style={{
                  background: comment.status === 'pending' ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${comment.status === 'pending' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: 'rgba(0,188,212,0.12)', color: '#00BCD4' }}>
                    {comment.author_name[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-white">{comment.author_name}</span>
                      {comment.author_email && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{comment.author_email}</span>}
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                        {cfg.label}
                      </span>
                      {comment.post_title && (
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          روی: {comment.post_title}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{comment.content}</p>
                    <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(comment.created_at).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>

                    {/* Reply form */}
                    <AnimatePresence>
                      {replyTarget === comment.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="mt-3 overflow-hidden">
                          <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                            placeholder="پاسخ خود را بنویسید..." rows={2}
                            className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none"
                            style={inputSt} />
                          <div className="flex gap-2 mt-1.5">
                            <button onClick={handleReply} disabled={replying || !replyText.trim()}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                              style={{ background: 'rgba(0,188,212,0.9)', color: '#fff' }}>
                              {replying ? 'ارسال...' : 'ارسال پاسخ'}
                            </button>
                            <button onClick={() => { setReplyTarget(null); setReplyText(''); }}
                              className="px-3 py-1.5 rounded-lg text-xs"
                              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                              انصراف
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    {comment.status === 'pending' && (
                      <button onClick={() => handleStatus(comment.id, 'approved')}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        style={{ color: '#22c55e' }} title="تأیید">
                        <Check size={14} />
                      </button>
                    )}
                    {comment.status !== 'rejected' && (
                      <button onClick={() => handleStatus(comment.id, 'rejected')}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        style={{ color: 'rgba(239,68,68,0.7)' }} title="رد">
                        <X size={14} />
                      </button>
                    )}
                    <button onClick={() => { setReplyTarget(comment.id); setReplyText(''); }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      style={{ color: 'rgba(0,188,212,0.7)' }} title="پاسخ">
                      <Reply size={14} />
                    </button>
                    <button onClick={() => handleStatus(comment.id, 'spam')}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      style={{ color: 'rgba(107,114,128,0.7)' }} title="اسپم">
                      <Flag size={14} />
                    </button>
                    <button onClick={() => handleDelete(comment.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      style={{ color: 'rgba(239,68,68,0.5)' }} title="حذف">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
