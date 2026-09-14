/**
 * PrevNextNav
 * Sticky-bottom previous / next article navigation links.
 */
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { AdjacentPost } from '../types';

import { t } from '@/i18n';


interface Props {
  prev?: AdjacentPost;
  next?: AdjacentPost;
  onNavigate: (slug: string) => void;
}

export default function PrevNextNav({ prev, next, onNavigate }: Props) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label={t("ناوبری مقالات")}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-white/10"
    >
      {/* Previous */}
      {prev ? (
        <button
          onClick={() => onNavigate(prev.slug)}
          className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-end hover:border-white/20 hover:bg-white/[0.04] transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          aria-label={t('مقاله قبلی: {title}', { title: prev.title })}
        >
          <ChevronRight
            size={20}
            className="flex-shrink-0 mt-0.5 text-teal-400 group-hover:text-teal-300 transition-colors"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-[11px] text-white/35 mb-1 font-medium">{t("مقاله قبلی")}</p>
            <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors line-clamp-2 leading-snug">
              {prev.title}
            </p>
            <p className="text-xs text-teal-400/70 mt-1">{prev.readTime}</p>
          </div>
        </button>
      ) : (
        <div />
      )}

      {/* Next */}
      {next ? (
        <button
          onClick={() => onNavigate(next.slug)}
          className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-start hover:border-white/20 hover:bg-white/[0.04] transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-teal-500/40 sm:flex-row-reverse sm:text-end"
          aria-label={t('مقاله بعدی: {title}', { title: next.title })}
        >
          <ChevronLeft
            size={20}
            className="flex-shrink-0 mt-0.5 text-teal-400 group-hover:text-teal-300 transition-colors"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-[11px] text-white/35 mb-1 font-medium">{t("مقاله بعدی")}</p>
            <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors line-clamp-2 leading-snug">
              {next.title}
            </p>
            <p className="text-xs text-teal-400/70 mt-1">{next.readTime}</p>
          </div>
        </button>
      ) : (
        <div />
      )}
    </nav>
  );
}
