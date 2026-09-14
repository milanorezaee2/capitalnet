/**
 * LikeDislikeBar
 * Like / Dislike buttons with an animated counter.
 * State is managed via BlogPostContext.
 */
import { ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlogPostCtx } from '../context/BlogPostContext';

import { t } from '@/i18n';


export default function LikeDislikeBar() {
  const { likeCount, dislikeCount, userVote, vote, isBookmarked, toggleBookmark } =
    useBlogPostCtx();

  return (
    <div className="flex items-center gap-3" role="group" aria-label={t("واکنش به مقاله")}>
      {/* Like */}
      <button
        onClick={() => vote('like')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${
          userVote === 'like'
            ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
            : 'bg-white/5 border-white/10 text-white/50 hover:bg-teal-500/10 hover:text-teal-400 hover:border-teal-500/30'
        }`}
        aria-label={t('پسند{suffix}', { suffix: userVote === 'like' ? t(' (انتخاب شده)') : '' })}
        aria-pressed={userVote === 'like'}
      >
        <ThumbsUp size={15} fill={userVote === 'like' ? 'currentColor' : 'none'} aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.span
            key={likeCount}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="tabular-nums"
          >
            {likeCount}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* Dislike */}
      <button
        onClick={() => vote('dislike')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${
          userVote === 'dislike'
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
            : 'bg-white/5 border-white/10 text-white/50 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
        }`}
        aria-label={t('نپسندیدن{suffix}', { suffix: userVote === 'dislike' ? t(' (انتخاب شده)') : '' })}
        aria-pressed={userVote === 'dislike'}
      >
        <ThumbsDown size={15} fill={userVote === 'dislike' ? 'currentColor' : 'none'} aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.span
            key={dislikeCount}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="tabular-nums"
          >
            {dislikeCount}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* Bookmark */}
      <button
        onClick={toggleBookmark}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
          isBookmarked
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
            : 'bg-white/5 border-white/10 text-white/50 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30'
        }`}
        aria-label={isBookmarked ? t("حذف از نشانک‌ها") : t("افزودن به نشانک‌ها")}
        aria-pressed={isBookmarked}
      >
        {isBookmarked ? (
          <BookmarkCheck size={15} aria-hidden="true" />
        ) : (
          <Bookmark size={15} aria-hidden="true" />
        )}
        <span>{isBookmarked ? t("ذخیره شد") : t("ذخیره")}</span>
      </button>
    </div>
  );
}
