/**
 * FontControls
 * Inline toolbar: decrease / increase font size + toggle reading mode.
 */
import { Minus, Plus, BookOpen, ZoomIn } from 'lucide-react';
import { useBlogPostCtx } from '../context/BlogPostContext';
import type { FontSizeLevel } from '../types';

import { t } from '@/i18n';


const LEVELS: FontSizeLevel[] = ['sm', 'base', 'lg', 'xl'];

export default function FontControls() {
  const { fontSize, setFontSize, readingMode, toggleReadingMode } = useBlogPostCtx();

  const currentIdx = LEVELS.indexOf(fontSize);

  const decrease = () => {
    if (currentIdx > 0) setFontSize(LEVELS[currentIdx - 1]);
  };
  const increase = () => {
    if (currentIdx < LEVELS.length - 1) setFontSize(LEVELS[currentIdx + 1]);
  };

  return (
    <div
      className="flex items-center gap-1 bg-white/[0.05] border border-white/10 rounded-full px-2 py-1"
      role="group"
      aria-label={t("اندازه قلم")}
    >
      <button
        onClick={decrease}
        disabled={currentIdx === 0}
        className="w-7 h-7 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40"
        aria-label={t("کاهش اندازه قلم")}
      >
        <Minus size={13} aria-hidden="true" />
      </button>

      <span className="text-xs text-white/40 w-10 text-center tabular-nums" aria-live="polite">
        {fontSize === 'sm' ? t("کوچک") : fontSize === 'base' ? t("عادی") : fontSize === 'lg' ? t("بزرگ") : t("خیلی بزرگ")}
      </span>

      <button
        onClick={increase}
        disabled={currentIdx === LEVELS.length - 1}
        className="w-7 h-7 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40"
        aria-label={t("افزایش اندازه قلم")}
      >
        <Plus size={13} aria-hidden="true" />
      </button>

      <div className="w-px h-4 bg-white/10 mx-1" aria-hidden="true" />

      {/* Reading mode toggle */}
      <button
        onClick={toggleReadingMode}
        className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${
          readingMode ? 'text-teal-300 bg-teal-500/15' : 'text-white/50 hover:text-white hover:bg-white/10'
        }`}
        aria-label={readingMode ? t("خروج از حالت مطالعه") : t("حالت مطالعه")}
        aria-pressed={readingMode}
      >
        {readingMode ? <ZoomIn size={13} aria-hidden="true" /> : <BookOpen size={13} aria-hidden="true" />}
      </button>
    </div>
  );
}
