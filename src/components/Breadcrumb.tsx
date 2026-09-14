/**
 * Breadcrumb — SEO-optimized breadcrumb navigation component
 *
 * Features:
 *  • Renders a visually rich breadcrumb trail above page content
 *  • Injects JSON-LD BreadcrumbList schema into <head> for search engines
 *  • Supports dark-mode / glass-morphism design language of the site
 *  • RTL-aware (Arabic/Persian layout)
 */

import { useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ChevronLeft, Home } from 'lucide-react';

import { t } from '@/i18n';


export interface BreadcrumbItem {
  /** Human-readable label shown in the UI */
  label: string;
  /** Full URL path (e.g. "/blog", "/blog/category/investment"). Used for JSON-LD. */
  href?: string;
  /** Optional click handler — if provided the item is rendered as a button */
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/** Build absolute URL from a relative path for JSON-LD */
function absUrl(path?: string): string {
  if (!path) return '';
  if (typeof window === 'undefined') return path;
  const { protocol, host } = window.location;
  return `${protocol}//${host}${path}`;
}

const vFadeIn: Variants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  // ── JSON-LD BreadcrumbList ─────────────────────────────────────────────────
  useEffect(() => {
    const id = 'breadcrumb-json-ld';
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.id = id;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }

    const listItems = items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absUrl(item.href) } : {}),
    }));

    el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: listItems,
    });

    return () => {
      // Clean up when component unmounts (page changes)
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    };
  }, [items]);

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <motion.nav
      variants={vFadeIn}
      initial="hidden"
      animate="show"
      aria-label={t("مسیر صفحه")}
      className="mb-6"
    >
      <div className="inline-flex items-center gap-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-2.5 shadow-sm">
        <ol
          className="flex items-center gap-1 flex-wrap list-none m-0 p-0"
          itemScope
          itemType="https://schema.org/BreadcrumbList">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isFirst = index === 0;

            return (
              <li
                key={index}
                className="flex items-center gap-1"
                itemScope
                itemType="https://schema.org/ListItem"
                itemProp="itemListElement"
              >
                {/* Separator — chevron pointing right (RTL: visually between items) */}
                {!isFirst && (
                  <ChevronLeft
                    size={14}
                    className="text-white/25 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}

                {isLast ? (
                  /* Current page — non-interactive */
                  <span
                    className="flex items-center gap-1.5 text-sm font-semibold text-white"
                    aria-current="page"
                    itemProp="name">
                    {isFirst && (
                      <Home size={14} className="text-teal-400 flex-shrink-0" aria-hidden="true" />
                    )}
                    {item.label}
                  </span>
                ) : item.onClick ? (
                  /* Clickable item */
                  <button
                    onClick={item.onClick}
                    className="flex items-center gap-1.5 text-sm text-white/55 hover:text-teal-300 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 rounded"
                    itemProp="name"
                  >
                    {isFirst && (
                      <Home size={14} className="text-teal-400/70 flex-shrink-0" aria-hidden="true" />
                    )}
                    {item.label}
                  </button>
                ) : (
                  /* Non-clickable intermediate item */
                  <span
                    className="flex items-center gap-1.5 text-sm text-white/55"
                    itemProp="name">
                    {isFirst && (
                      <Home size={14} className="text-teal-400/70 flex-shrink-0" aria-hidden="true" />
                    )}
                    {item.label}
                  </span>
                )}

                {/* Hidden microdata position */}
                <meta itemProp="position" content={String(index + 1)} />
                {item.href && (
                  <link itemProp="item" href={absUrl(item.href)} />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </motion.nav>
  );
}
