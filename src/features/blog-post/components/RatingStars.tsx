/**
 * RatingStars
 * 5-star interactive rating widget with persistent localStorage state.
 * Shows average from all ratings (simulated with localStorage).
 */
import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  postId: string;
}

export default function RatingStars({ postId }: Props) {
  const KEY = `rating_${postId}`;
  const [userRating, setUserRating] = useState<number>(() => {
    try { return parseInt(localStorage.getItem(KEY) ?? '0', 10); }
    catch { return 0; }
  });
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(userRating > 0);

  // Simulated average: stored alongside user vote
  const [avgRating] = useState(() => {
    try {
      const avg = parseFloat(localStorage.getItem(`${KEY}_avg`) ?? '4.3');
      return isNaN(avg) ? 4.3 : avg;
    } catch { return 4.3; }
  });

  const handleRate = (n: number) => {
    if (submitted) return;
    setUserRating(n);
    setSubmitted(true);
    try {
      localStorage.setItem(KEY, String(n));
      // Simulate updating avg
      const newAvg = ((avgRating * 10 + n) / 11).toFixed(1);
      localStorage.setItem(`${KEY}_avg`, newAvg);
    } catch { /* ignore */ }
  };

  const displayRating = hovered || userRating || 0;

  return (
    <div className="flex flex-col items-center gap-3 py-6" aria-label="امتیازدهی">
      <p className="text-sm font-semibold text-white/70">این مقاله چقدر مفید بود؟</p>

      <div className="flex items-center gap-1.5" role="group" aria-label="انتخاب امتیاز">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.85 }}
            onMouseEnter={() => !submitted && setHovered(n)}
            onMouseLeave={() => !submitted && setHovered(0)}
            onClick={() => handleRate(n)}
            disabled={submitted}
            className="bp-star focus:outline-none focus:ring-2 focus:ring-amber-500/40 rounded disabled:cursor-default"
            aria-label={`امتیاز ${n}`}
            aria-pressed={userRating === n}
          >
            <Star
              size={26}
              className={`transition-colors duration-100 ${
                displayRating >= n ? 'text-amber-400' : 'text-white/20'
              }`}
              fill={displayRating >= n ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-teal-400 font-semibold"
            role="status"
            aria-live="polite"
          >
            ممنون! امتیاز شما ({userRating}/5) ثبت شد.
          </motion.p>
        )}
      </AnimatePresence>

      <p className="text-xs text-white/35">
        میانگین: <span className="text-white/55 font-semibold">{avgRating.toFixed(1)}</span> از ۵
      </p>
    </div>
  );
}
