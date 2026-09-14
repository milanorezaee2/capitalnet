/**
 * GalleryGrid + Lightbox
 * Responsive masonry-style image gallery with full-screen lightbox.
 * Lazy-loads all images. Keyboard navigable (← →, Esc).
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { GalleryItem } from '../types';

import { t } from '@/i18n';


interface Props {
  items: GalleryItem[];
  columns?: 2 | 3 | 4;
}

const colClass: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
};

export default function GalleryGrid({ items, columns = 3 }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const close  = useCallback(() => setLightboxIdx(null), []);
  const prev   = useCallback(() => setLightboxIdx((i) => (i != null ? (i - 1 + items.length) % items.length : null)), [items.length]);
  const next   = useCallback(() => setLightboxIdx((i) => (i != null ? (i + 1) % items.length : null)), [items.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      close();
      else if (e.key === 'ArrowRight') prev();
      else if (e.key === 'ArrowLeft')  next();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [lightboxIdx, close, prev, next]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIdx]);

  return (
    <>
      <div className={`grid gap-2 my-6 ${colClass[columns]}`} role="list" aria-label={t("گالری تصاویر")}>
        {items.map((item, idx) => (
          <div
            key={idx}
            className="relative group overflow-hidden rounded-xl cursor-zoom-in aspect-video bg-white/5"
            role="listitem"
            onClick={() => setLightboxIdx(idx)}
          >
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn
                size={24}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                aria-hidden="true"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="bp-lightbox"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={t("بزرگنمایی تصویر")}
          >
            {/* Close */}
            <button
              onClick={close}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 z-10"
              aria-label={t("بستن")}
            >
              <X size={20} aria-hidden="true" />
            </button>

            {/* Prev */}
            {items.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 z-10"
                aria-label={t("تصویر قبلی")}
              >
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIdx}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] w-full"
            >
              <img
                src={items[lightboxIdx].src}
                alt={items[lightboxIdx].alt}
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
              />
              {items[lightboxIdx].caption && (
                <p className="text-center text-sm text-white/60 mt-3 px-4">
                  {items[lightboxIdx].caption}
                </p>
              )}
              <div className="absolute bottom-3 right-1/2 translate-x-1/2 text-xs text-white/40">
                {lightboxIdx + 1} / {items.length}
              </div>
            </motion.div>

            {/* Next */}
            {items.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 z-10"
                aria-label={t("تصویر بعدی")}
              >
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
