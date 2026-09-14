/**
 * ReadingProgressBar
 * Fixed top bar that fills as the user scrolls through the article.
 * WCAG: role=progressbar with aria-valuenow.
 */
import { useReadingProgress } from '../hooks';

export default function ReadingProgressBar() {
  const progress = useReadingProgress();

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-white/10"
      aria-hidden="true"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-teal-400 via-cyan-400 to-amber-400 transition-transform duration-100 will-change-transform"
        style={{ transform: `scaleX(${progress / 100})` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="پیشرفت خواندن مقاله"
      />
    </div>
  );
}
