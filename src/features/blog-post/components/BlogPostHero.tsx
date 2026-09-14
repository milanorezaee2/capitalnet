/**
 * BlogPostHero
 * Full-bleed hero section with featured image, category badge, H1,
 * subtitle, all post-meta, and Schema.org Article JSON-LD.
 *
 * NOTE: All gradient/colour values are written as inline styles —
 * never as dynamic Tailwind class strings — so Tailwind JIT never purges them.
 */
import { motion, type Variants } from 'framer-motion';
import { Calendar, Clock, Eye, MessageCircle, TrendingUp, Star } from 'lucide-react';
import type { AppBlogPost } from '../../../lib/blogApi';

interface Props {
  post: AppBlogPost;
  commentCount: number;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.08 } },
};

// CSS colour pairs — never Tailwind class strings
const CATEGORY_COLORS: Record<string, { from: string; to: string }> = {
  investment:           { from: '#14b8a6', to: '#22d3ee' },
  strategy:             { from: '#8b5cf6', to: '#a855f7' },
  'case-study':         { from: '#f59e0b', to: '#f97316' },
  'market-analysis':    { from: '#3b82f6', to: '#6366f1' },
  negotiation:          { from: '#f43f5e', to: '#ec4899' },
  'financial-modeling': { from: '#10b981', to: '#22c55e' },
};

const CATEGORY_LABELS: Record<string, string> = {
  investment:           'سرمایه‌گذاری',
  strategy:             'استراتژی',
  'case-study':         'مطالعه موردی',
  'market-analysis':    'تحلیل بازار',
  negotiation:          'مذاکره',
  'financial-modeling': 'مدل مالی',
};

const DEFAULT_COLORS = { from: '#14b8a6', to: '#22d3ee' };

export default function BlogPostHero({ post, commentCount }: Props) {
  const colors = CATEGORY_COLORS[post.category ?? ''] ?? DEFAULT_COLORS;
  const catLabel = CATEGORY_LABELS[post.category ?? ''] ?? (post.category ?? '');

  const catGradient = `linear-gradient(135deg, ${colors.from}, ${colors.to})`;
  const accentGlow  = `radial-gradient(ellipse at top right, ${colors.from}33, transparent 60%)`;

  return (
    <header className="relative overflow-hidden" style={{ minHeight: 520 }}>

      {/* ── Background layers ──────────────────────────────────────────────── */}
      {post.cover_image ? (
        <img
          src={post.cover_image}
          alt={post.title}
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.35 }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: catGradient, opacity: 0.18 }}
          aria-hidden="true"
        />
      )}

      {/* Dot-grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.07,
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.6) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      {/* Dark gradient from bottom */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, #030712 0%, rgba(3,7,18,0.7) 45%, rgba(3,7,18,0.2) 100%)' }}
        aria-hidden="true"
      />

      {/* Colour accent blob top-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -128, right: -128, width: 384, height: 384,
          borderRadius: '50%', background: catGradient, opacity: 0.18,
          filter: 'blur(80px)',
        }}
        aria-hidden="true"
      />

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-10 flex flex-col justify-end"
        style={{ minHeight: 520, paddingBottom: 48, paddingTop: 112 }}
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Badges row */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-5">
          {/* Category */}
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 9999, fontSize: 12,
              fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              background: catGradient, color: '#fff',
              boxShadow: `0 4px 20px ${colors.from}44`,
            }}
          >
            <TrendingUp size={12} aria-hidden="true" />
            {catLabel}
          </span>

          {post.featured && (
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '5px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 700,
                background: 'rgba(251,191,36,0.92)', color: '#000',
              }}
            >
              <Star size={11} fill="currentColor" aria-hidden="true" />
              ویژه
            </span>
          )}
        </motion.div>

        {/* H1 */}
        <motion.h1
          variants={fadeUp}
          className="text-white leading-tight mb-5"
          style={{ fontSize: 'clamp(26px,5vw,54px)', fontWeight: 900 }}
          itemProp="name"
        >
          {post.title}
        </motion.h1>

        {/* Excerpt / subtitle */}
        {post.excerpt && (
          <motion.p
            variants={fadeUp}
            className="text-white/75 leading-relaxed mb-7"
            style={{ fontSize: 'clamp(14px,2vw,18px)', maxWidth: 720 }}
            itemProp="description"
          >
            {post.excerpt}
          </motion.p>
        )}

        {/* Meta stats row */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center gap-x-6 gap-y-3"
          style={{ fontSize: 13, color: 'rgba(255,255,255,0.58)' }}
        >
          {/* Author chip */}
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #14b8a6, #f59e0b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 900, color: '#000', flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {post.author_name.charAt(0)}
            </div>
            <span className="text-white/85 font-semibold" itemProp="author">{post.author_name}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
            <span className="text-white/45" style={{ fontSize: 12 }}>{post.author_role}</span>
          </div>

          <span className="hidden sm:block" style={{ color: 'rgba(255,255,255,0.15)', fontSize: 18 }}>|</span>

          <div className="flex items-center gap-1.5">
            <Calendar size={14} style={{ color: colors.from }} aria-hidden="true" />
            <time dateTime={post.published_at ?? post.created_at}>{post.published_at ?? post.created_at}</time>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock size={14} style={{ color: colors.from }} aria-hidden="true" />
            <span>{post.read_time}</span>
          </div>

          {(post.views ?? 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <Eye size={14} style={{ color: colors.from }} aria-hidden="true" />
              <span>{(post.views ?? 0).toLocaleString('fa-IR')} بازدید</span>
            </div>
          )}

          {commentCount > 0 && (
            <div className="flex items-center gap-1.5">
              <MessageCircle size={14} style={{ color: colors.from }} aria-hidden="true" />
              <span>{commentCount} نظر</span>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Accent glow overlay at top-right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: accentGlow }}
        aria-hidden="true"
      />
    </header>
  );
}
