/**
 * StickyLeftSidebar
 * Narrow vertical strip pinned on the left (desktop only).
 * Contains: reading progress ring, bookmark, like, share, print.
 * Visual language: icon buttons with tooltips.
 */
import { Bookmark, BookmarkCheck, ThumbsUp, Share2, Printer, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBlogPostCtx } from '../context/BlogPostContext';
import { useReadingProgress } from '../hooks';

import { t } from '@/i18n';


interface Props {
  title: string;
  url: string;
  onScrollTop?: () => void;
}

function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      {children}
      <div
        className="pointer-events-none absolute end-full top-1/2 -translate-y-1/2 ms-0 me-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap text-xs bg-[#161b22] text-white/80 border border-white/10 px-2.5 py-1 rounded-lg"
        role="tooltip"
      >
        {label}
      </div>
    </div>
  );
}

const BTN =
  'w-10 h-10 rounded-xl flex items-center justify-center text-white/40 border border-white/8 bg-white/[0.03] hover:bg-white/[0.07] hover:text-white hover:border-white/15 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/40';

export default function StickyLeftSidebar({ title, url }: Props) {
  const progress = useReadingProgress();
  const { isBookmarked, toggleBookmark, likeCount, userVote, vote } = useBlogPostCtx();

  const shareNative = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url }); }
      catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  // Reading progress ring SVG
  const r = 14;
  const circ = 2 * Math.PI * r;
  const dash = circ - (progress / 100) * circ;

  return (
    <aside
      className="hidden lg:flex flex-col items-center gap-3 bp-sticky-left bp-no-print"
      aria-label={t("ابزارهای مقاله")}
    >
      {/* Progress ring */}
      <div className="w-10 h-10 flex items-center justify-center" title={t("{progress}% خوانده شد", { progress })}>
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
          <circle
            cx="20" cy="20" r={r}
            fill="none"
            stroke="#14b8a6"
            strokeWidth="2.5"
            strokeDasharray={circ}
            strokeDashoffset={dash}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
            style={{ transition: 'stroke-dashoffset 0.2s linear' }}
          />
          <text x="20" y="24" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.5)" fontWeight="700">
            {progress}%
          </text>
        </svg>
      </div>

      <div className="w-px h-5 bg-white/8" aria-hidden="true" />

      {/* Bookmark */}
      <Tip label={isBookmarked ? t("حذف از نشانک") : t("ذخیره")}>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={toggleBookmark}
          className={`${BTN} ${isBookmarked ? '!text-amber-400 !border-amber-500/30 !bg-amber-500/10' : ''}`}
          aria-label={isBookmarked ? t("حذف از نشانک") : t("ذخیره مقاله")}
          aria-pressed={isBookmarked}
        >
          {isBookmarked
            ? <BookmarkCheck size={17} fill="currentColor" aria-hidden="true" />
            : <Bookmark size={17} aria-hidden="true" />}
        </motion.button>
      </Tip>

      {/* Like */}
      <Tip label={t("پسندیدن")}>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => vote('like')}
          className={`${BTN} flex-col gap-0.5 relative ${
            userVote === 'like' ? '!text-teal-400 !border-teal-500/30 !bg-teal-500/10' : ''
          }`}
          aria-label={t("پسندیدن")}
          aria-pressed={userVote === 'like'}
        >
          <ThumbsUp size={16} fill={userVote === 'like' ? 'currentColor' : 'none'} aria-hidden="true" />
          {likeCount > 0 && (
            <span className="text-[9px] font-bold leading-none tabular-nums">{likeCount}</span>
          )}
        </motion.button>
      </Tip>

      {/* Share */}
      <Tip label={t("اشتراک‌گذاری")}>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={shareNative}
          className={BTN}
          aria-label={t("اشتراک‌گذاری")}
        >
          <Share2 size={16} aria-hidden="true" />
        </motion.button>
      </Tip>

      {/* Print */}
      <Tip label={t("چاپ")}>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => window.print()}
          className={BTN}
          aria-label={t("چاپ مقاله")}
        >
          <Printer size={16} aria-hidden="true" />
        </motion.button>
      </Tip>

      <div className="w-px h-5 bg-white/8" aria-hidden="true" />

      {/* Scroll to top */}
      <Tip label={t("بازگشت به بالا")}>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={BTN}
          aria-label={t("بازگشت به بالا")}
        >
          <ArrowUp size={16} aria-hidden="true" />
        </motion.button>
      </Tip>
    </aside>
  );
}
