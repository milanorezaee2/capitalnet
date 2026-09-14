/**
 * BlogListingPage — Enterprise blog archive
 * ─────────────────────────────────────────────────────────────────────────────
 * • Featured hero card
 * • Grid / List view toggle
 * • Category + tag filters
 * • Sort (newest · oldest · views · likes)
 * • Instant search
 * • Skeleton loading
 * • Pagination (9/page)
 * • SEO title injection
 * ─────────────────────────────────────────────────────────────────────────────
 * NOTE: All gradient/colour values are written as inline styles or direct
 * hex/rgba values — never as dynamic Tailwind class strings — so Tailwind JIT
 * never purges them.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Grid3X3, List, Clock, Eye, TrendingUp,
  X, ArrowLeft, ArrowRight, Tag, Calendar, Star,
} from 'lucide-react';

import { fetchPublishedPosts } from '../../lib/blogApi';
import type { AppBlogPost } from '../../lib/blogApi';
import InlineBannerRenderer from '../../components/InlineBannerRenderer';
import type { InlineBanner } from '../../lib/settingsApi';
import { FinancialBackground } from '../../components/FinancialBackground';

// ─── Design-system CSS (bp-* scoped classes) ────────────────────────────────
import './design-system/blog-post.css';

// ─── Category meta — colours as CSS values, NOT Tailwind strings ──────────────
const CATEGORY_META: Record<string, {
  label: string;
  from: string;   // CSS colour
  to:   string;   // CSS colour
}> = {
  investment:           { label: 'سرمایه‌گذاری',  from: '#14b8a6', to: '#22d3ee'  },
  strategy:             { label: 'استراتژی',        from: '#8b5cf6', to: '#a855f7'  },
  'case-study':         { label: 'مطالعه موردی',   from: '#f59e0b', to: '#f97316'  },
  'market-analysis':    { label: 'تحلیل بازار',    from: '#3b82f6', to: '#6366f1'  },
  negotiation:          { label: 'مذاکره',          from: '#f43f5e', to: '#ec4899'  },
  'financial-modeling': { label: 'مدل مالی',        from: '#10b981', to: '#22c55e'  },
};

const DEFAULT_CAT = { label: 'بلاگ', from: '#14b8a6', to: '#22d3ee' };

interface ListingPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
  };
  publishedAt: string;
  readTime: string;
  featured: boolean;
  views: number;
  likes: number;
  image?: string;
  bookmarked?: boolean;
  relatedPosts?: string[];
}

function getCat(category: string) {
  return CATEGORY_META[category] ?? DEFAULT_CAT;
}

function normalizeCategory(category: string | null | undefined): string {
  const normalized = (category || '').trim().toLowerCase();
  const map: Record<string, string> = {
    investment: 'investment',
    سرمایهگذاری: 'investment',
    'سرمايه‌گذارى': 'investment',
    strategy: 'strategy',
    استراتژی: 'strategy',
    'استراتژي': 'strategy',
    'case-study': 'case-study',
    'مطالعه موردی': 'case-study',
    'مطالعه-موردی': 'case-study',
    'market-analysis': 'market-analysis',
    'تحلیل بازار': 'market-analysis',
    'تحليل بازار': 'market-analysis',
    negotiation: 'negotiation',
    مذاکره: 'negotiation',
    'financial-modeling': 'financial-modeling',
    'مدل مالی': 'financial-modeling',
    'مدل‌سازی مالی': 'financial-modeling',
  };

  return map[normalized] ?? 'investment';
}

function normalizePost(post: AppBlogPost): ListingPost {
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const publishedAt = post.published_at ? new Date(post.published_at).toLocaleDateString('fa-IR') : 'بهمن ۱۴۰۳';

  return {
    id: post.id,
    title: post.title || 'بدون عنوان',
    slug: post.slug || '',
    category: normalizeCategory(post.category),
    tags,
    excerpt: post.excerpt || '',
    content: post.content || '',
    author: {
      name: post.author_name || 'Capital Network',
      role: post.author_role || 'نویسنده',
    },
    publishedAt,
    readTime: post.read_time || '۵ دقیقه خواندن',
    featured: Boolean(post.featured),
    views: post.views ?? 0,
    likes: post.likes ?? 0,
    image: post.cover_image ?? undefined,
    bookmarked: false,
    relatedPosts: [],
  };
}

/** Inline gradient style for a category */
function catGradient(cat: { from: string; to: string }, dir = 'to right'): React.CSSProperties {
  return { background: `linear-gradient(${dir}, ${cat.from}, ${cat.to})` };
}

const POSTS_PER_PAGE = 9;

type SortKey = 'newest' | 'oldest' | 'views' | 'likes';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Shimmer({ w = '100%', h = '14px', r = '8px' }: { w?: string; h?: string; r?: string }) {
  return (
    <div
      className="bp-skeleton"
      style={{ width: w, height: h, borderRadius: r }}
      aria-hidden="true"
    />
  );
}

function CardSkeleton() {
  return (
    <div style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div className="bp-skeleton" style={{ height: 200 }} />
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Shimmer w="35%" h="11px" />
        <Shimmer w="88%" h="17px" r="6px" />
        <Shimmer w="65%" h="17px" r="6px" />
        <Shimmer h="12px" />
        <Shimmer w="75%" h="12px" />
      </div>
    </div>
  );
}

// ─── PostCard (grid view) ─────────────────────────────────────────────────────

function PostCard({ post, onRead, priority }: { post: ListingPost; onRead: (s: string) => void; priority?: boolean }) {
  const cat = getCat(post.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      onClick={() => onRead(post.slug)}
      onKeyDown={(e) => e.key === 'Enter' && onRead(post.slug)}
      tabIndex={0}
      role="link"
      aria-label={`خواندن: ${post.title}`}
      itemScope
      itemType="https://schema.org/BlogPosting"
      style={{
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#0d1117',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color .2s ease, transform .2s ease, box-shadow .2s ease',
      }}
      whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.16)' } as any}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: 192, overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.82, transition: 'opacity .3s ease, transform .5s ease' }}
            itemProp="image"
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, ...catGradient(cat, '135deg'), opacity: 0.15 }} />
        )}

        {/* Fade to card bg */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0d1117 0%, transparent 55%)' }} />

        {/* Category badge */}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 999, color: '#fff',
            ...catGradient(cat),
          }}>
            {cat.label}
          </span>
        </div>

        {post.featured && (
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700,
              background: 'rgba(251,191,36,0.92)', color: '#000',
              padding: '3px 8px', borderRadius: 999,
            }}>
              <Star size={9} fill="currentColor" />ویژه
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '18px 18px 14px' }}>
        <h2
          itemProp="headline"
          style={{ fontSize: 14, fontWeight: 700, color: '#f0f6fc', lineHeight: 1.45, marginBottom: 8,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {post.title}
        </h2>
        <p
          itemProp="description"
          style={{ fontSize: 12, color: 'rgba(255,255,255,0.48)', lineHeight: 1.6, marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {post.excerpt}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: 11, color: 'rgba(255,255,255,0.32)', marginBottom: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={10} /><time itemProp="datePublished">{post.publishedAt}</time>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={10} />{post.readTime}
          </span>
          {(post.views ?? 0) > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Eye size={10} />{(post.views ?? 0).toLocaleString('fa-IR')}
            </span>
          )}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="bp-tag" style={{ fontSize: 10 }}>#{t}</span>
            ))}
          </div>
        )}

        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #14b8a6, #f59e0b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 900, color: '#000',
          }}>
            {post.author.name.charAt(0)}
          </div>
          <span itemProp="author" style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)' }}>{post.author.name}</span>
        </div>
      </div>
    </motion.article>
  );
}

// ─── PostRow (list view) ──────────────────────────────────────────────────────

function PostRow({ post, onRead }: { post: ListingPost; onRead: (s: string) => void }) {
  const cat = getCat(post.category);

  return (
    <motion.article
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      onClick={() => onRead(post.slug)}
      onKeyDown={(e) => e.key === 'Enter' && onRead(post.slug)}
      tabIndex={0}
      role="link"
      aria-label={`خواندن: ${post.title}`}
      style={{
        display: 'flex', gap: 14, alignItems: 'center',
        borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
        background: '#0d1117', padding: '14px 16px', cursor: 'pointer',
        transition: 'border-color .2s ease, background .2s ease',
      }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.16)', background: '#111820' } as any}
    >
      {/* Thumb */}
      <div style={{ flexShrink: 0, width: 96, height: 68, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
        {post.image ? (
          <img src={post.image} alt="" loading="lazy" decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, ...catGradient(cat, '135deg'), opacity: 0.2 }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          background: `linear-gradient(90deg, ${cat.from}, ${cat.to})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {cat.label}
        </span>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: '#f0f6fc', lineHeight: 1.4, margin: '4px 0 6px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.title}
        </h2>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.32)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={10} />{post.publishedAt}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} />{post.readTime}</span>
          {(post.views ?? 0) > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={10} />{(post.views ?? 0).toLocaleString('fa-IR')}</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── FeaturedCard ─────────────────────────────────────────────────────────────

function FeaturedCard({ post, onRead }: { post: ListingPost; onRead: (s: string) => void }) {
  const cat = getCat(post.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onClick={() => onRead(post.slug)}
      onKeyDown={(e) => e.key === 'Enter' && onRead(post.slug)}
      tabIndex={0}
      role="link"
      aria-label={`مقاله ویژه: ${post.title}`}
      style={{
        position: 'relative', borderRadius: 24, overflow: 'hidden', cursor: 'pointer',
        minHeight: 420, border: '1px solid rgba(255,255,255,0.1)',
        transition: 'border-color .3s ease, box-shadow .3s ease',
      }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.22)', boxShadow: '0 24px 64px rgba(0,0,0,0.55)' } as any}
    >
      {/* BG image or gradient */}
      {post.image ? (
        <img src={post.image} alt="" loading="eager" decoding="async"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.38 }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, ...catGradient(cat, '135deg'), opacity: 0.22 }} />
      )}

      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #030712 0%, rgba(3,7,18,0.65) 45%, transparent 100%)' }} />

      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06,
        backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.55) 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 420, padding: '36px 40px' }}>
        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '5px 14px', borderRadius: 999, color: '#fff',
            ...catGradient(cat),
          }}>
            {cat.label}
          </span>
          {post.featured && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700,
              background: 'rgba(251,191,36,0.9)', color: '#000', padding: '4px 10px', borderRadius: 999 }}>
              <Star size={10} fill="currentColor" />ویژه
            </span>
          )}
        </div>

        <h2 style={{ fontSize: 'clamp(22px,4vw,38px)', fontWeight: 900, color: '#f0f6fc', lineHeight: 1.2,
          marginBottom: 12, maxWidth: 700 }}>
          {post.title}
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.62)', lineHeight: 1.65, marginBottom: 22,
          maxWidth: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.excerpt}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px 20px', fontSize: 12, color: 'rgba(255,255,255,0.48)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#14b8a6,#f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#000' }}>
              {post.author.name.charAt(0)}
            </div>
            <span>{post.author.name}</span>
          </div>
          <span>{post.publishedAt}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{post.readTime}</span>
          {(post.views ?? 0) > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} />{(post.views ?? 0).toLocaleString('fa-IR')}</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const btnBase: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex',
    alignItems: 'center', justifyContent: 'center', transition: 'all .15s ease',
  };
  const btnActive: React.CSSProperties = {
    ...btnBase, background: '#14b8a6', color: '#000', border: '1px solid #14b8a6',
    boxShadow: '0 0 0 3px rgba(20,184,166,0.2)',
  };

  return (
    <nav aria-label="صفحه‌بندی" style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40 }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        style={{ ...btnBase, opacity: page === 1 ? 0.3 : 1 }} aria-label="صفحه قبل">
        <ArrowRight size={15} />
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => onChange(p)}
          style={p === page ? btnActive : btnBase}
          aria-label={`صفحه ${p}`} aria-current={p === page ? 'page' : undefined}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === total}
        style={{ ...btnBase, opacity: page === total ? 0.3 : 1 }} aria-label="صفحه بعد">
        <ArrowLeft size={15} />
      </button>
    </nav>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  initialCategory?: string;
  onRead: (slug: string) => void;
  banners?: InlineBanner[];
}

export default function BlogListingPage({ initialCategory, onRead, banners = [] }: Props) {
  const [posts, setPosts]     = useState<AppBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState(initialCategory ?? 'all');
  const [tag, setTag]           = useState('');
  const [sort, setSort]         = useState<SortKey>('newest');
  const [view, setView]         = useState<'grid' | 'list'>('grid');
  const [page, setPage]         = useState(1);

  useEffect(() => {
    fetchPublishedPosts()
      .then((d) => {
        setPosts(d);
        setLoading(false);
      })
      .catch((error) => {
        console.error('[BlogListingPage]', error);
        setPosts([]);
        setLoading(false);
      });
  }, []);

  const reset = useCallback(() => setPage(1), []);

  const normalizedPosts = useMemo(() => posts.map(normalizePost), [posts]);
  const allCategories = useMemo(() => ['all', ...Object.keys(CATEGORY_META)], []);
  const allTags = useMemo(() => [...new Set(normalizedPosts.flatMap((p) => p.tags))].slice(0, 20), [normalizedPosts]);

  const filtered = useMemo(() => {
    let list = [...normalizedPosts];
    if (category !== 'all') list = list.filter((p) => p.category === category);
    if (tag)                list = list.filter((p) => p.tags.includes(tag));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (sort === 'oldest') list.reverse();
    if (sort === 'views')  list.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    if (sort === 'likes')  list.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    return list;
  }, [normalizedPosts, category, tag, search, sort]);

  const featured  = useMemo(() => filtered.find((p) => p.featured) ?? filtered[0], [filtered]);
  const gridPosts = useMemo(() => filtered.filter((p) => p.id !== featured?.id), [filtered, featured]);
  const totalPages = Math.ceil(gridPosts.length / POSTS_PER_PAGE);
  const paginated  = gridPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  useEffect(() => {
    document.title = category === 'all'
      ? 'وبلاگ | Capital Network'
      : `${CATEGORY_META[category]?.label ?? category} | وبلاگ`;
  }, [category]);

  // ── Shared style tokens ──────────────────────────────────────────────────
  const surface: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14,
  };
  const input: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
    padding: '11px 42px 11px 14px', fontSize: 13, color: '#fff',
    outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1829', color: '#fff', direction: 'rtl', position: 'relative' }}>
      <FinancialBackground />
      <a href="#blog-main" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        رفتن به مقالات
      </a>

      {/* ── Banner: top of blog page ── */}
      <InlineBannerRenderer banners={banners} page="blog" section="top" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ marginBottom: 36 }}
        >
          <h1 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, color: '#f0f6fc', marginBottom: 6 }}>
            وبلاگ
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            مقالات تخصصی در حوزه سرمایه‌گذاری، استراتژی و مدل‌سازی مالی
          </p>
        </motion.div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Row 1: search + sort + view */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
              <Search size={15} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
              <input
                type="search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); reset(); }}
                placeholder="جستجو در مقالات..."
                aria-label="جستجو"
                style={input}
              />
              {search && (
                <button onClick={() => { setSearch(''); reset(); }}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}
                  aria-label="پاک کردن">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortKey); reset(); }}
              aria-label="مرتب‌سازی"
              style={{ ...surface, padding: '11px 14px', fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <option value="newest" style={{ background: '#0d1117' }}>جدیدترین</option>
              <option value="oldest" style={{ background: '#0d1117' }}>قدیمی‌ترین</option>
              <option value="views"  style={{ background: '#0d1117' }}>پربازدیدترین</option>
              <option value="likes"  style={{ background: '#0d1117' }}>محبوب‌ترین</option>
            </select>

            {/* View toggle */}
            <div style={{ display: 'flex', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
              {(['grid', 'list'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  aria-pressed={view === v}
                  aria-label={v === 'grid' ? 'نمای شبکه' : 'نمای فهرست'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px', fontSize: 13,
                    background: view === v ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.04)',
                    color: view === v ? '#2dd4bf' : 'rgba(255,255,255,0.45)',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    borderRight: v === 'list' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    transition: 'all .15s ease',
                  }}>
                  {v === 'grid' ? <Grid3X3 size={14} /> : <List size={14} />}
                  {v === 'grid' ? 'شبکه' : 'فهرست'}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Category pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }} role="group" aria-label="دسته‌بندی">
            {allCategories.map((cat) => {
              const active = category === cat;
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); reset(); }}
                  aria-pressed={active}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 999, cursor: 'pointer',
                    border: `1px solid ${active ? 'rgba(20,184,166,0.45)' : 'rgba(255,255,255,0.1)'}`,
                    background: active ? 'rgba(20,184,166,0.12)' : 'rgba(255,255,255,0.03)',
                    color: active ? '#2dd4bf' : 'rgba(255,255,255,0.55)',
                    fontFamily: 'inherit', transition: 'all .15s ease',
                    ...(active && meta ? { background: `linear-gradient(90deg, ${meta.from}22, ${meta.to}18)`, borderColor: meta.from } : {}),
                  }}
                >
                  {cat === 'all' ? 'همه' : CATEGORY_META[cat]?.label ?? cat}
                </button>
              );
            })}
          </div>

          {/* Row 3: Tag cloud */}
          {allTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }} role="group" aria-label="برچسب">
              {tag && (
                <button onClick={() => handleTag('')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'rgba(20,184,166,0.15)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.3)', padding: '3px 10px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit' }}
                  aria-label="حذف فیلتر برچسب">
                  <X size={10} />{tag}
                </button>
              )}
              {allTags.map((t) => (
                <button key={t} onClick={() => handleTag(t === tag ? '' : t)}
                  style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1px solid ${t === tag ? 'rgba(20,184,166,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    background: t === tag ? 'rgba(20,184,166,0.12)' : 'rgba(255,255,255,0.03)',
                    color: t === tag ? '#2dd4bf' : 'rgba(255,255,255,0.35)',
                    transition: 'all .15s ease',
                  }}>
                  <Tag size={9} style={{ display: 'inline', marginLeft: 3 }} />#{t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Result count */}
        <p role="status" aria-live="polite" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>
          {loading ? 'در حال بارگذاری...' : `${filtered.length} مقاله`}
        </p>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main id="blog-main" tabIndex={-1}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <TrendingUp size={40} style={{ margin: '0 auto 16px', color: 'rgba(255,255,255,0.2)' }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>مقاله‌ای یافت نشد</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>فیلترها را تغییر دهید یا جستجوی جدیدی انجام دهید.</p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && page === 1 && (
                <div style={{ marginBottom: 28 }}>
                  <FeaturedCard post={featured} onRead={onRead} />
                </div>
              )}

              {/* ── Banner: after featured post ── */}
              {featured && page === 1 && (
                <InlineBannerRenderer banners={banners} page="blog" section="after-featured" />
              )}

              {/* Grid / List */}
              <AnimatePresence mode="wait">
                {view === 'grid' ? (
                  <motion.div key="grid"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {paginated.map((p, i) => (
                      <React.Fragment key={p.id}>
                        <PostCard post={p} onRead={onRead} />
                        {/* ── Banner: mid-list (after 3rd card, first page only) ── */}
                        {i === 2 && page === 1 && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <InlineBannerRenderer banners={banners} page="blog" section="mid-list" />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="list"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {paginated.map((p, i) => (
                      <React.Fragment key={p.id}>
                        <PostRow post={p} onRead={onRead} />
                        {/* ── Banner: mid-list (after 3rd row, first page only) ── */}
                        {i === 2 && page === 1 && (
                          <InlineBannerRenderer banners={banners} page="blog" section="mid-list" />
                        )}
                      </React.Fragment>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Pagination page={page} total={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </>
          )}
        </main>

        {/* ── Banner: before footer ── */}
        <InlineBannerRenderer banners={banners} page="blog" section="before-footer" />
      </div>
    </div>
  );

  function handleTag(t: string) { setTag(t); reset(); }
}
