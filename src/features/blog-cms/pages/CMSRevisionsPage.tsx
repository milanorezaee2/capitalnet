// ─── Enterprise Blog CMS — Revisions Page ────────────────────────────────────
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, RotateCcw, User, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchRevisions, restoreRevision } from '../api';
import type { Revision } from '../types';

interface CMSRevisionsPageProps {
  postId: string;
  postTitle?: string;
  onRestore?: (rev: Revision) => void;
}

export default function CMSRevisionsPage({ postId, postTitle, onRestore }: CMSRevisionsPageProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    if (postId) {
      fetchRevisions(postId).then(r => { setRevisions(r); setLoading(false); });
    }
  }, [postId]);

  const handleRestore = async (revId: string) => {
    const rev = await restoreRevision(postId, revId);
    if (rev) {
      showToast('نسخه بازیابی شد');
      onRestore?.(rev);
    }
  };

  const getContentPreview = (content: string): string => {
    try {
      const blocks = JSON.parse(content);
      if (Array.isArray(blocks)) {
        return blocks.map((b: any) => b.data?.text || b.data?.code || '').filter(Boolean).join(' ').slice(0, 200);
      }
    } catch { /* fallthrough */ }
    return content.slice(0, 200);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <span className="w-5 h-5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4" dir="rtl">
      {toast && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
          {toast}
        </motion.div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-white">تاریخچه نسخه‌ها</h3>
        {postTitle && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{postTitle}</p>}
      </div>

      {revisions.length === 0 ? (
        <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Clock size={28} className="mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.2)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>هنوز نسخه‌ای ذخیره نشده</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>نسخه‌ها هنگام انتشار ذخیره می‌شوند</p>
        </div>
      ) : (
        <div className="space-y-2">
          {revisions.map((rev, i) => (
            <motion.div key={rev.id}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Header row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: i === 0 ? 'rgba(0,188,212,0.15)' : 'rgba(255,255,255,0.06)' }}>
                  <Clock size={13} style={{ color: i === 0 ? '#00BCD4' : 'rgba(255,255,255,0.4)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold" style={{ color: i === 0 ? '#00BCD4' : 'rgba(255,255,255,0.7)' }}>
                      نسخه {String(revisions.length - i).padStart(2, '0')}
                      {i === 0 && <span className="mr-1.5 text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,188,212,0.15)', color: '#00BCD4' }}>آخرین</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {rev.author_name && <span className="flex items-center gap-0.5"><User size={9} /> {rev.author_name}</span>}
                    <span className="flex items-center gap-0.5">
                      <Clock size={9} />
                      {new Date(rev.created_at).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {rev.change_summary && <span>— {rev.change_summary}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setExpanded(expanded === rev.id ? null : rev.id)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.5)' }} title="مشاهده محتوا">
                    {expanded === rev.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {onRestore && i > 0 && (
                    <button onClick={() => handleRestore(rev.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:opacity-80"
                      style={{ background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}
                      title="بازیابی این نسخه">
                      <RotateCcw size={11} /> بازیابی
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded content preview */}
              {expanded === rev.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  className="px-4 pb-3 overflow-hidden">
                  <div className="pt-2 rounded-xl p-3 text-xs leading-relaxed"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }}>
                    <p className="font-semibold text-white text-sm mb-1">{rev.title}</p>
                    <p>{getContentPreview(rev.content)}...</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
