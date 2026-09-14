/**
 * CommentSection
 * Nested comments with reply, like, delete, and report.
 * Uses the useComments hook for in-memory state.
 * Replace the hook calls with API calls for persistence.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Reply, Trash2, Flag, ChevronDown, MessageCircle, Send } from 'lucide-react';
import type { CommentData } from '../hooks';

import { t } from '@/i18n';


interface Props {
  comments: CommentData[];
  onAdd: (author: string, content: string) => void;
  onReply: (parentId: string, author: string, content: string) => void;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

// ── Single comment (recursive for replies) ────────────────────────────────────
function Comment({
  comment,
  depth = 0,
  onReply,
  onLike,
  onDelete,
}: {
  comment: CommentData;
  depth?: number;
  onReply: Props['onReply'];
  onLike: Props['onLike'];
  onDelete: Props['onDelete'];
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const submitReply = () => {
    if (replyAuthor.trim() && replyContent.trim()) {
      onReply(comment.id, replyAuthor, replyContent);
      setReplyAuthor('');
      setReplyContent('');
      setReplyOpen(false);
    }
  };

  return (
    <div className={depth > 0 ? "pe-8 border-e border-white/8 me-4" : ''}>
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 mb-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/60 to-amber-500/60 flex items-center justify-center text-white text-xs font-black">
              {comment.author.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-white">{comment.author}</span>
            <span className="text-xs text-white/30">{comment.createdAt}</span>
          </div>
          <button
            onClick={() => onDelete(comment.id)}
            className="p-1.5 rounded-lg text-white/25 hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            aria-label={t("حذف نظر")}
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <p className="text-sm text-white/65 leading-relaxed mb-3">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLike(comment.id)}
            className={`flex items-center gap-1.5 text-xs transition-colors px-2.5 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
              comment.liked
                ? 'text-teal-300 bg-teal-500/15'
                : 'text-white/35 hover:text-teal-400 hover:bg-teal-500/10'
            }`}
            aria-label={t('پسندیدن نظر{suffix}', { suffix: comment.liked ? t(' (پسندیده شد)') : '' })}
            aria-pressed={comment.liked}
          >
            <ThumbsUp size={12} fill={comment.liked ? 'currentColor' : 'none'} aria-hidden="true" />
            {comment.likes}
          </button>

          {depth < 3 && (
            <button
              onClick={() => setReplyOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/70 transition-colors px-2.5 py-1 rounded-full hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label={t("پاسخ به نظر")}
              aria-expanded={replyOpen}
            >
              <Reply size={12} aria-hidden="true" />
              {t("پاسخ")}
            </button>
          )}

          <button
            className="flex items-center gap-1.5 text-xs text-white/25 hover:text-amber-400 transition-colors px-2.5 py-1 rounded-full hover:bg-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            aria-label={t("گزارش نظر")}
          >
            <Flag size={11} aria-hidden="true" />
            {t("گزارش")}
          </button>
        </div>
      </div>

      {/* Reply form */}
      <AnimatePresence>
        {replyOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-3 pe-4"
          >
            <div className="space-y-2 p-3 rounded-xl border border-white/10 bg-white/[0.02]">
              <input
                value={replyAuthor}
                onChange={(e) => setReplyAuthor(e.target.value)}
                placeholder={t("نام شما")}
                className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={t("پاسخ خود را بنویسید...")}
                rows={2}
                className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setReplyOpen(false)}
                  className="text-xs text-white/40 px-3 py-1.5 rounded-lg hover:bg-white/5"
                >
                  {t("انصراف")}
                </button>
                <button
                  onClick={submitReply}
                  className="text-xs bg-teal-500 hover:bg-teal-400 text-black font-semibold px-4 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  {t("ارسال")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <>
          <button
            onClick={() => setShowReplies((v) => !v)}
            className="flex items-center gap-1 text-xs text-white/35 hover:text-white/60 transition-colors mb-2 me-4 focus:outline-none"
            aria-expanded={showReplies}
          >
            <motion.span animate={{ rotate: showReplies ? 0 : -90 }} transition={{ duration: 0.18 }}>
              <ChevronDown size={13} aria-hidden="true" />
            </motion.span>
            {comment.replies.length} {t("پاسخ")}
          </button>

          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {comment.replies.map((reply) => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    onReply={onReply}
                    onLike={onLike}
                    onDelete={onDelete}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// ── Main CommentSection ───────────────────────────────────────────────────────
export default function CommentSection({ comments, onAdd, onReply, onLike, onDelete }: Props) {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) {
      setError(t("لطفاً نام و متن نظر را وارد کنید."));
      return;
    }
    setError('');
    onAdd(author, content);
    setAuthor('');
    setContent('');
  };

  return (
    <section aria-labelledby="comments-heading" className="mt-12 pt-8 border-t border-white/10">
      <h2
        id="comments-heading"
        className="flex items-center gap-2 text-xl font-black text-white mb-6"
      >
        <MessageCircle size={20} className="text-teal-400" aria-hidden="true" />
        {t("نظرات (")}{comments.length})
      </h2>

      {/* New comment form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-8"
        noValidate
        aria-label={t("فرم ارسال نظر")}
      >
        <h3 className="text-sm font-bold text-white mb-4">{t("نظر خود را بنویسید")}</h3>

        {error && (
          <p className="text-xs text-rose-400 mb-3" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t("نام شما *")}
            required
            aria-label={t("نام")}
            className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-colors"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("نظر خود را بنویسید... *")}
            required
            rows={4}
            aria-label={t("متن نظر")}
            className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-colors"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30">
              {t("نظر شما پس از بررسی نمایش داده می‌شود.")}
            </p>
            <button
              type="submit"
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-black font-bold text-sm px-5 py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              <Send size={14} aria-hidden="true" />
              {t("ارسال نظر")}
            </button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-center text-white/30 text-sm py-8">
          {t("هنوز نظری ثبت نشده است. اولین نفر باشید!")}
        </p>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <Comment
              key={c.id}
              comment={c}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
