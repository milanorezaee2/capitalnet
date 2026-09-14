/**
 * PopupAdRenderer — رندر پاپ‌آپ‌های تبلیغاتی در سایت
 *
 * ویژگی‌ها:
 * - پشتیبانی از ۴ تریگر: on_load، on_exit، on_scroll، on_section
 * - ۶ موقعیت نمایش
 * - ۵ انیمیشن ورود/خروج
 * - ذخیره state نمایش در localStorage برای max_shows و show_every_days
 * - ردیابی سکشن فعلی از طریق IntersectionObserver
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import type { PopupAd, SiteSection } from '../lib/settingsApi';

import { t as tr } from '@/i18n';


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface PopupAdRendererProps {
  ads: PopupAd[];
  /** صفحه جاری سایت — e.g. 'home', 'services', ... */
  currentPage: string;
}

interface ShowRecord {
  count: number;
  lastShownAt: number; // timestamp ms
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function storageKey(id: string) { return `popup_ad_${id}`; }

function getRecord(id: string): ShowRecord {
  try {
    const raw = localStorage.getItem(storageKey(id));
    return raw ? JSON.parse(raw) : { count: 0, lastShownAt: 0 };
  } catch { return { count: 0, lastShownAt: 0 }; }
}

function saveRecord(id: string, rec: ShowRecord) {
  try { localStorage.setItem(storageKey(id), JSON.stringify(rec)); } catch { /* */ }
}

function canShow(ad: PopupAd): boolean {
  if (!ad.visible) return false;
  const rec = getRecord(ad.id);
  if (ad.max_shows > 0 && rec.count >= ad.max_shows) return false;
  if (ad.show_every_days > 0 && rec.lastShownAt > 0) {
    const daysSince = (Date.now() - rec.lastShownAt) / 86_400_000;
    if (daysSince < ad.show_every_days) return false;
  }
  return true;
}

function markShown(id: string) {
  const rec = getRecord(id);
  saveRecord(id, { count: rec.count + 1, lastShownAt: Date.now() });
}

/** ترجمه page + section به SiteSection key */
function pageToSection(page: string): SiteSection {
  const map: Record<string, SiteSection> = {
    services:   'page:services',
    process:    'page:process',
    blog:       'page:blog',
    'blog-post':'page:blog',
    about:      'page:about',
    contact:    'page:contact',
    evaluation: 'page:evaluation',
  };
  return (map[page] as SiteSection) ?? 'global';
}

/** آیا آگهی برای این سکشن/صفحه نمایش داده شود؟ */
function matchesContext(ad: PopupAd, page: string, activeHomeSections: string[]): boolean {
  const secs = ad.sections;
  if (secs.includes('global')) return true;

  // بررسی page-level
  const pageSec = pageToSection(page);
  if (secs.includes(pageSec)) return true;

  // بررسی سکشن‌های home در صورت صفحه خانه
  if (page === 'home') {
    for (const s of activeHomeSections) {
      const key = `home:${s}` as SiteSection;
      if (secs.includes(key)) return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Animation variants per style
// ─────────────────────────────────────────────────────────────────────────────
function getVariants(animation: PopupAd['animation']) {
  switch (animation) {
    case 'zoom':
      return {
        initial:  { opacity: 0, scale: 0.7 },
        animate:  { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 22 } },
        exit:     { opacity: 0, scale: 0.75, transition: { duration: 0.2 } },
      };
    case 'slide-up':
      return {
        initial:  { opacity: 0, y: 60 },
        animate:  { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
        exit:     { opacity: 0, y: 40, transition: { duration: 0.2 } },
      };
    case 'slide-down':
      return {
        initial:  { opacity: 0, y: -60 },
        animate:  { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
        exit:     { opacity: 0, y: -40, transition: { duration: 0.2 } },
      };
    case 'fade':
      return {
        initial:  { opacity: 0 },
        animate:  { opacity: 1, transition: { duration: 0.35 } },
        exit:     { opacity: 0, transition: { duration: 0.25 } },
      };
    case 'flip':
      return {
        initial:  { opacity: 0, rotateY: 90, scale: 0.9 },
        animate:  { opacity: 1, rotateY: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
        exit:     { opacity: 0, rotateY: -60, transition: { duration: 0.22 } },
      };
    default:
      return {
        initial:  { opacity: 0, scale: 0.8 },
        animate:  { opacity: 1, scale: 1 },
        exit:     { opacity: 0, scale: 0.8 },
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Position styles
// ─────────────────────────────────────────────────────────────────────────────
function positionStyle(pos: PopupAd['position']): React.CSSProperties {
  const base: React.CSSProperties = { position: 'fixed', zIndex: 9999 };
  switch (pos) {
    case 'center':        return { ...base, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' };
    case 'bottom-right':  return { ...base, bottom: 24, right: 24 };
    case 'bottom-left':   return { ...base, bottom: 24, left: 24 };
    case 'top-right':     return { ...base, top: 24, right: 24 };
    case 'top-left':      return { ...base, top: 24, left: 24 };
    case 'bottom-center': return { ...base, bottom: 24, left: '50%', transform: 'translateX(-50%)' };
    default:              return { ...base, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Single popup card
// ─────────────────────────────────────────────────────────────────────────────
interface PopupCardProps {
  ad: PopupAd;
  onClose: () => void;
}

function PopupCard({ ad, onClose }: PopupCardProps) {
  const vars = getVariants(ad.animation);
  const isCenter = ad.position === 'center';

  return (
    <div style={positionStyle(ad.position)} onClick={isCenter ? onClose : undefined}>
      {/* Overlay for center popups */}
      {isCenter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        />
      )}

      <motion.div
        initial={vars.initial as any}
        animate={vars.animate as any}
        exit={vars.exit as any}
        onClick={e => e.stopPropagation()}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #07111e 0%, #0d1f38 100%)',
          border: `1px solid ${ad.accent_color}35`,
          boxShadow: `0 8px 48px ${ad.accent_color}25, 0 2px 12px rgba(0,0,0,0.5)`,
          width: isCenter ? 380 : 320,
          maxWidth: 'calc(100vw - 32px)',
          perspective: 1000,
          zIndex: 1,
        }}
      >
        {/* ── Background glow blobs ── */}
        <div
          className="absolute -top-10 -end-10 w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ background: ad.accent_color, opacity: 0.18 }}
        />
        <div
          className="absolute -bottom-8 -start-8 w-24 h-24 rounded-full blur-2xl pointer-events-none"
          style={{ background: ad.accent_color, opacity: 0.1 }}
        />

        {/* ── Close button ── */}
        <button
          onClick={onClose}
          className="absolute top-3 start-3 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
        >
          <X size={14} />
        </button>

        {/* ── Content ── */}
        <div className="relative p-5 pt-5">
          {/* Badge */}
          {ad.badge && (
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full mb-3"
              style={{
                background: `${ad.accent_color}18`,
                color: ad.accent_color,
                border: `1px solid ${ad.accent_color}30`,
              }}
            >
              {ad.badge}
            </motion.span>
          )}

          {/* Icon + Title */}
          <div className="flex items-start gap-3 mb-3">
            {ad.icon && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
                className="text-3xl flex-shrink-0 mt-0.5"
              >
                {ad.icon}
              </motion.span>
            )}
            <div className="flex-1 min-w-0">
              <motion.h3
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 }}
                className="text-white font-bold leading-snug"
                style={{ fontSize: 16 }}
              >
                {ad.title}
              </motion.h3>
            </div>
          </div>

          {/* Body */}
          {ad.body && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-sm leading-relaxed mb-4"
            >
              {ad.body}
            </motion.p>
          )}

          {/* ── Divider line ── */}
          <div
            className="h-px mb-4"
            style={{ background: `linear-gradient(90deg, ${ad.accent_color}40, transparent)` }}
          />

          {/* CTA button */}
          {ad.cta_text && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {ad.cta_url ? (
                <a
                  href={ad.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${ad.accent_color}, ${ad.accent_color}bb)`,
                    boxShadow: `0 4px 16px ${ad.accent_color}40`,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'; }}
                >
                  {ad.cta_text}
                  <ExternalLink size={13} />
                </a>
              ) : (
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${ad.accent_color}, ${ad.accent_color}bb)`,
                    boxShadow: `0 4px 16px ${ad.accent_color}40`,
                  }}
                >
                  {ad.cta_text}
                </button>
              )}
            </motion.div>
          )}

          {/* Dismiss link */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            onClick={onClose}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-400 mt-2.5 transition-colors"
          >
            {tr("بستن")}
          </motion.button>
        </div>

        {/* ── Animated accent bar at bottom ── */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="h-0.5 origin-right"
          style={{ background: `linear-gradient(90deg, transparent, ${ad.accent_color}, transparent)` }}
        />
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main renderer
// ─────────────────────────────────────────────────────────────────────────────
export default function PopupAdRenderer({ ads, currentPage }: PopupAdRendererProps) {
  const [queue, setQueue]    = useState<PopupAd[]>([]);
  const [active, setActive]  = useState<PopupAd | null>(null);
  const [visibleHomeSections, setVisibleHomeSections] = useState<string[]>([]);
  const scheduledIds = useRef<Set<string>>(new Set());
  const dismissed    = useRef<Set<string>>(new Set());

  // ── Track visible home sections via IntersectionObserver ─────────────────
  useEffect(() => {
    if (currentPage !== 'home') return;
    const sectionIds = ['hero', 'network', 'services', 'why-us', 'cta', 'process', 'client-showcase', 'testimonials', 'blog-preview', 'faq'];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          setVisibleHomeSections(prev => prev.includes(id) ? prev : [...prev, id]);
        }
      });
    }, { threshold: 0.2 });

    // give DOM time to render
    const t = setTimeout(() => {
      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) obs.observe(el);
      });
    }, 500);

    return () => { clearTimeout(t); obs.disconnect(); };
  }, [currentPage]);

  // ── Schedule ads based on triggers ───────────────────────────────────────
  const scheduleAd = useCallback((ad: PopupAd) => {
    if (scheduledIds.current.has(ad.id)) return;
    if (!canShow(ad)) return;
    if (!matchesContext(ad, currentPage, visibleHomeSections)) return;

    scheduledIds.current.add(ad.id);

    const delay = (ad.delay_sec ?? 0) * 1000;
    setTimeout(() => {
      if (dismissed.current.has(ad.id)) return;
      setQueue(q => {
        if (q.find(x => x.id === ad.id)) return q;
        return [...q, ad];
      });
    }, delay);
  }, [currentPage, visibleHomeSections]);

  // ── on_load trigger ───────────────────────────────────────────────────────
  useEffect(() => {
    // reset on page change
    scheduledIds.current.clear();
    dismissed.current.clear();
    setQueue([]);
    setActive(null);

    ads.filter(a => a.trigger === 'on_load').forEach(scheduleAd);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, ads]);

  // ── on_exit trigger (mouseleave to top of page) ───────────────────────────
  useEffect(() => {
    const exitAds = ads.filter(a => a.trigger === 'on_exit' && canShow(a) && matchesContext(a, currentPage, visibleHomeSections));
    if (exitAds.length === 0) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY > 10) return; // only top exit
      exitAds.forEach(ad => scheduleAd(ad));
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [ads, currentPage, visibleHomeSections, scheduleAd]);

  // ── on_scroll trigger (50% scroll depth) ─────────────────────────────────
  useEffect(() => {
    const scrollAds = ads.filter(a => a.trigger === 'on_scroll' && canShow(a) && matchesContext(a, currentPage, visibleHomeSections));
    if (scrollAds.length === 0) return;

    let fired = false;
    const handleScroll = () => {
      if (fired) return;
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrolled >= 0.45) {
        fired = true;
        scrollAds.forEach(ad => scheduleAd(ad));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ads, currentPage, visibleHomeSections, scheduleAd]);

  // ── on_section trigger (when relevant section becomes visible) ────────────
  useEffect(() => {
    if (visibleHomeSections.length === 0) return;
    ads
      .filter(a => a.trigger === 'on_section')
      .forEach(ad => {
        if (matchesContext(ad, currentPage, visibleHomeSections)) {
          scheduleAd(ad);
        }
      });
  }, [ads, visibleHomeSections, currentPage, scheduleAd]);

  // ── Show one popup at a time from queue ───────────────────────────────────
  useEffect(() => {
    if (active) return;
    if (queue.length === 0) return;
    const [next, ...rest] = queue;
    setActive(next);
    setQueue(rest);
    markShown(next.id);
  }, [queue, active]);

  const handleClose = () => {
    if (active) dismissed.current.add(active.id);
    setActive(null);
  };

  return (
    <AnimatePresence>
      {active && (
        <PopupCard key={active.id} ad={active} onClose={handleClose} />
      )}
    </AnimatePresence>
  );
}
