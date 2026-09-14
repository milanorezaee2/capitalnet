/**
 * InlineBannerRenderer
 *
 * دو حالت واقعی نمایش:
 *  - inline → داخل جریان صفحه در سکشن انتخاب‌شده
 *  - fixed  → شناور روی همه چیز با position:fixed در یکی از ۸ جهت
 *
 * ۸ جهت fixed:
 *   top-left  | top-center  | top-right
 *   middle-left               middle-right
 *   bottom-left| bottom-center| bottom-right
 *
 * NOTE: FixedBannerPortal باید یک بار در root App رندر شود (نه داخل InlineBannerRenderer)
 *       تا از duplicate portal جلوگیری شود.
 */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';
import type { InlineBanner, BannerPage, BannerCorner } from '../lib/settingsApi';
import { BANNER_TEMPLATES } from '../lib/settingsApi';

import { t as tr } from '@/i18n';


// ─────────────────────────────────────────────────────────────────────────────
// CSS position helper for each corner
// ─────────────────────────────────────────────────────────────────────────────
// position:absolute نسبت به wrapper fixed (inset:0) که خودش LTR است
function cornerToStyle(corner: BannerCorner, width: string): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    width,
    maxWidth: 'calc(100vw - 24px)',
  };

  switch (corner) {
    case 'top-left':      return { ...base, top: 80,    left: 16 };
    case 'top-center':    return { ...base, top: 80,    left: '50%', transform: 'translateX(-50%)' };
    case 'top-right':     return { ...base, top: 80,    right: 16 };
    case 'middle-left':   return { ...base, top: '50%', left: 16,    transform: 'translateY(-50%)' };
    case 'middle-right':  return { ...base, top: '50%', right: 16,   transform: 'translateY(-50%)' };
    case 'bottom-left':   return { ...base, bottom: 24, left: 16 };
    case 'bottom-center': return { ...base, bottom: 24, left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-right':  return { ...base, bottom: 24, right: 16 };
    default:              return { ...base, bottom: 24, right: 16 };
  }
}

// ── entry animation per corner ────────────────────────────────────────────────
function cornerVariants(corner: BannerCorner) {
  if (corner.includes('left'))   return { initial: { x: -80, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -80, opacity: 0 } };
  if (corner.includes('right'))  return { initial: { x: 80,  opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 80,  opacity: 0 } };
  if (corner.startsWith('top'))  return { initial: { y: -60, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -60, opacity: 0 } };
  return                                { initial: { y: 60,  opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 60,  opacity: 0 } };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared banner card visual — used for both inline and fixed
// Supports: image header strip, icon box, badge, CTA, close button
// ─────────────────────────────────────────────────────────────────────────────
function BannerCard({ banner, onDismiss, compact = false }: {
  banner: InlineBanner;
  onDismiss: () => void;
  compact?: boolean;
}) {
  const tpl    = BANNER_TEMPLATES.find(t => t.id === banner.template_id) ?? BANNER_TEMPLATES[0];
  const ac     = banner.accent_color || tpl.accent;
  const title  = banner.title        || tpl.title;
  const desc   = banner.description  || tpl.description;
  const ctaTxt = banner.cta_text     || tpl.cta_text;
  const icon   = banner.icon         || tpl.icon;
  const badge  = banner.badge        || tpl.badge;
  const hasImg = banner.show_image && banner.image_url;
  // extract first hex colour from gradient for fade overlay
  const bgFirstHex = (() => {
    const m = tpl.gradient.match(/#[0-9a-fA-F]{6}/);
    return m ? m[0] : '#0d1829';
  })();

  const inner = (
    <div className="relative overflow-hidden rounded-2xl" style={{ background: tpl.gradient }}>
      {/* glow blobs */}
      <div className="absolute -top-10 -end-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ background: ac, opacity: 0.20 }} />
      <div className="absolute -bottom-8 -start-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
        style={{ background: ac, opacity: 0.10 }} />
      {/* shimmer top line */}
      <div className="absolute top-0 start-0 end-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg,transparent,${ac}90,transparent)` }} />

      {/* ── image header strip (full-width) ── */}
      {hasImg && !compact && (
        <div className="relative overflow-hidden" style={{ height: 100 }}>
          <img
            src={banner.image_url} alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.82 }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          {/* fade overlay at bottom */}
          <div className="absolute bottom-0 start-0 end-0 h-12 pointer-events-none"
            style={{ background: `linear-gradient(to bottom, transparent, ${bgFirstHex})` }} />
          {/* badge over image */}
          {badge && (
            <span className="absolute top-2 end-2 font-black px-2.5 py-0.5 rounded-full backdrop-blur-sm"
              style={{ fontSize: 10, background: `${ac}cc`, color: '#fff', border: `1px solid ${ac}` }}>
              {badge}
            </span>
          )}
          {/* dismiss button over image */}
          <button
            onClick={e => { e.stopPropagation(); e.preventDefault(); onDismiss(); }}
            className="absolute top-2 start-2 rounded-full flex items-center justify-center transition-all"
            style={{ width: 26, height: 26, background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.7)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.45)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
            aria-label={tr("بستن")}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── body row ── */}
      <div
        className={`relative flex items-center gap-3 ${compact ? 'px-3 py-2.5' : 'px-4 py-3'}`}
        dir="rtl"
      >
        {/* icon box — only when no full-width image */}
        {!(hasImg && !compact) && (
          <div
            className={`flex-shrink-0 rounded-xl flex items-center justify-center select-none ${compact ? 'w-9 h-9 text-xl' : 'w-11 h-11 text-2xl'}`}
            style={{ background: `${ac}18`, border: `1px solid ${ac}35` }}
          >
            {hasImg && banner.image_url
              ? <img src={banner.image_url} alt="" className="w-full h-full object-cover rounded-xl" onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }} />
              : icon
            }
          </div>
        )}

        {/* text block */}
        <div className="flex-1 min-w-0">
          {/* badge (only if no image header) */}
          {badge && !(hasImg && !compact) && (
            <span
              className="inline-block font-black px-2 py-0.5 rounded-full mb-1"
              style={{ fontSize: compact ? 9 : 10, background: `${ac}22`, color: ac, border: `1px solid ${ac}45` }}
            >
              {badge}
            </span>
          )}
          <p
            className="font-black text-white leading-tight"
            style={{ fontSize: compact ? 13 : 15, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
          >
            {title}
          </p>
          {desc && (
            <p
              className={`text-slate-300 leading-relaxed ${compact ? 'line-clamp-1 mt-0.5' : 'line-clamp-2 mt-1'}`}
              style={{ fontSize: compact ? 11 : 12 }}
            >
              {desc}
            </p>
          )}
        </div>

        {/* CTA button */}
        {ctaTxt && !banner.full_clickable && banner.cta_url && (
          <a
            href={banner.cta_url}
            target={banner.open_new_tab ? '_blank' : '_self'}
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex-shrink-0 flex items-center gap-1 whitespace-nowrap font-black text-white transition-all"
            style={{
              fontSize: compact ? 11 : 12,
              padding: compact ? '5px 10px' : '7px 14px',
              borderRadius: 10,
              background: `linear-gradient(135deg,${ac},${ac}cc)`,
              boxShadow: `0 3px 14px ${ac}50`,
              border: `1px solid ${ac}80`,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'; }}
          >
            {ctaTxt}
            <ExternalLink size={compact ? 10 : 11} />
          </a>
        )}

        {/* close button (when no image header) */}
        {!(hasImg && !compact) && (
          <button
            onClick={e => { e.stopPropagation(); e.preventDefault(); onDismiss(); }}
            className="flex-shrink-0 rounded-full flex items-center justify-center transition-all"
            style={{
              width: compact ? 22 : 26, height: compact ? 22 : 26,
              background: 'rgba(0,0,0,0.28)', color: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.55)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.28)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}
            aria-label={tr("بستن")}
          >
            <X size={compact ? 11 : 13} />
          </button>
        )}
      </div>

      {/* bottom accent line */}
      <div className="h-[2px]"
        style={{ background: `linear-gradient(90deg,transparent,${ac}cc,transparent)` }} />
    </div>
  );

  // outer wrapper — border + shadow
  const wrapStyle: React.CSSProperties = {
    borderRadius: 16,
    overflow: 'hidden',
    border: `1px solid ${ac}35`,
    boxShadow: `0 6px 32px rgba(0,0,0,0.5), 0 0 0 0.5px ${ac}20`,
    cursor: banner.full_clickable && banner.cta_url ? 'pointer' : 'default',
    display: 'block',
    textDecoration: 'none',
  };

  if (banner.full_clickable && banner.cta_url) {
    return (
      <a href={banner.cta_url} target={banner.open_new_tab ? '_blank' : '_self'}
        rel="noopener noreferrer" style={wrapStyle}>
        {inner}
      </a>
    );
  }
  return <div style={wrapStyle}>{inner}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixed banners — rendered via portal at document.body level
// ─────────────────────────────────────────────────────────────────────────────
function FixedBannerPortal({ banners, page, dismissed, onDismiss }: {
  banners: InlineBanner[];
  page: BannerPage;
  dismissed: Set<string>;
  onDismiss: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // Only fixed banners for this page that are not dismissed
  const visible = banners.filter(b => {
    if (!b.visible) return false;
    if (dismissed.has(b.id)) return false;
    if ((b.display_mode ?? 'inline') !== 'fixed') return false;
    // fixed banners match any page listed in placements keys
    const pages = Object.keys(b.placements ?? {}) as BannerPage[];
    return pages.includes(page);
  });

  if (visible.length === 0) return null;

  // Group by corner so multiple fixed banners at same corner stack vertically
  const byCorner = new Map<BannerCorner, InlineBanner[]>();
  for (const b of visible) {
    const c = (b.corner ?? 'bottom-right') as BannerCorner;
    if (!byCorner.has(c)) byCorner.set(c, []);
    byCorner.get(c)!.push(b);
  }

  // wrapper با dir="ltr" تا position:fixed از RTL والد ایزوله بماند
  return createPortal(
    <div dir="ltr" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9800 }}>
      {Array.from(byCorner.entries()).map(([corner, items]) => {
        const w = items[0].fixed_width || '360px';
        const posStyle = cornerToStyle(corner, w);
        const vars = cornerVariants(corner);
        const stackDir = corner.startsWith('top') ? 'column' : 'column-reverse';

        return (
          <div
            key={corner}
            style={{ ...posStyle, display: 'flex', flexDirection: stackDir, gap: 8, pointerEvents: 'auto' }}
          >
            <AnimatePresence>
              {items.map(banner => (
                <motion.div
                  key={banner.id}
                  initial={vars.initial}
                  animate={vars.animate}
                  exit={vars.exit}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                >
                  <BannerCard
                    banner={banner}
                    onDismiss={() => onDismiss(banner.id)}
                    compact
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        );
      })}
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main exported component — فقط inline banners را رندر می‌کند
// برای fixed banners از GlobalFixedBanners در root App استفاده کنید
// ─────────────────────────────────────────────────────────────────────────────
interface InlineBannerRendererProps {
  banners: InlineBanner[];
  page: BannerPage;
  /** سکشن فعلی — فقط برای inline banners مهم است */
  section: string;
}

// ── map BannerCorner → real CSS alignment for inline placement ───────────────
function cornerToInlineStyle(corner: string): React.CSSProperties {
  // افقی
  const justifyContent =
    corner.includes('right')  ? 'flex-end'   :
    corner.includes('center') ? 'center'     : 'flex-start';

  // عمودی: top → بنر در بالای ناحیه، bottom → در پایین، middle → وسط
  const alignSelf =
    corner.startsWith('top')    ? 'flex-start' :
    corner.startsWith('bottom') ? 'flex-end'   : 'center';

  // انیمیشن ورود بر اساس جهت
  return { display: 'flex', justifyContent, alignSelf };
}

// entry animation per corner
function cornerEntryVariants(corner: string) {
  if (corner.includes('left'))          return { initial: { x: -40, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -40, opacity: 0 } };
  if (corner.includes('right'))         return { initial: { x: 40,  opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 40,  opacity: 0 } };
  if (corner.startsWith('top'))         return { initial: { y: -30, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -30, opacity: 0 } };
  if (corner.startsWith('bottom'))      return { initial: { y: 30,  opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 30,  opacity: 0 } };
  return                                       { initial: { opacity: 0 },         animate: { opacity: 1 },        exit: { opacity: 0 } };
}

export default function InlineBannerRenderer({ banners, page, section }: InlineBannerRendererProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const dismiss = (id: string) =>
    setDismissed(prev => new Set([...prev, id]));

  // ── فقط inline banners برای این page+section ──────────────────────────────
  const inlineVisible = banners.filter(b => {
    if (!b.visible) return false;
    if (dismissed.has(b.id)) return false;
    if ((b.display_mode ?? 'inline') !== 'inline') return false;
    const secs = b.placements?.[page];
    if (!secs || secs.length === 0) return false;
    return secs.includes(section);
  });

  if (inlineVisible.length === 0) return null;

  return (
    <div className="w-full my-5 px-4 space-y-2" dir="rtl">
      {inlineVisible.map((banner, idx) => {
        const corner = banner.corner ?? 'top-right';
        const wrapStyle = cornerToInlineStyle(corner);
        const vars = cornerEntryVariants(corner);
        return (
          <motion.div
            key={banner.id}
            initial={vars.initial}
            animate={vars.animate}
            exit={vars.exit}
            transition={{ duration: 0.35, delay: idx * 0.06 }}
            style={wrapStyle}
          >
            <div style={{ width: '100%', maxWidth: 365 }}>
              <BannerCard banner={banner} onDismiss={() => dismiss(banner.id)} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GlobalFixedBanners — یک بار در root App رندر می‌شود
// تمام fixed banners همه صفحات را مدیریت می‌کند
// ─────────────────────────────────────────────────────────────────────────────
export interface GlobalFixedBannersProps {
  banners: InlineBanner[];
  currentPage: BannerPage;
}

export function GlobalFixedBanners({ banners, currentPage }: GlobalFixedBannersProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const dismiss = (id: string) =>
    setDismissed(prev => new Set([...prev, id]));

  return (
    <FixedBannerPortal
      banners={banners}
      page={currentPage}
      dismissed={dismissed}
      onDismiss={dismiss}
    />
  );
}
