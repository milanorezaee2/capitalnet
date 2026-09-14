// ─── Related Posts Component (Internal Linking) ───────────────────────────────

import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Clock } from 'lucide-react';
import type { BlogPost, BlogCategory } from '../types/blog';

interface RelatedPostsProps {
  currentPost: BlogPost;
  allPosts: BlogPost[];
  onNavigate: (slug: string) => void;
}

const vFadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const vStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const blogCategories: Record<BlogCategory, { label: string; color: string }> = {
  investment: { label: 'سرمایه‌گذاری', color: 'text-teal-400' },
  strategy: { label: 'استراتژی', color: 'text-amber-400' },
  'case-study': { label: 'مطالعه موردی', color: 'text-purple-400' },
  'market-analysis': { label: 'تحلیل بازار', color: 'text-blue-400' },
  negotiation: { label: 'مذاکره', color: 'text-rose-400' },
  'financial-modeling': { label: 'مدل‌سازی مالی', color: 'text-green-400' },
};

/**
 * محاسبه مقالات مرتبط بر اساس:
 * 1. دسته‌بندی (۳۵%)
 * 2. تگ‌های مشترک (۴۵%)
 * 3. نویسنده (۲۰%)
 */
function getRelatedPosts(currentPost: BlogPost, allPosts: BlogPost[], limit = 3): BlogPost[] {
  const scored = allPosts
    .filter(p => p.id !== currentPost.id)
    .map(post => {
      let score = 0;

      // Category match (35 points)
      if (post.category === currentPost.category) {
        score += 35;
      }

      // Tag matches (45 points - 5 per tag)
      const commonTags = post.tags.filter(tag => currentPost.tags.includes(tag));
      score += commonTags.length * 5;

      // Author match (20 points)
      if (post.author.name === currentPost.author.name) {
        score += 20;
      }

      return { post, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);

  // اگر مقالات کافی پیدا نشد، دسته‌بندی مشابه اضافه کن
  if (scored.length < limit) {
    const categoryMatches = allPosts
      .filter(p => p.id !== currentPost.id && !scored.find(sp => sp.id === p.id))
      .filter(p => p.category === currentPost.category)
      .slice(0, limit - scored.length);
    scored.push(...categoryMatches);
  }

  return scored;
}

export function RelatedPosts({ currentPost, allPosts, onNavigate }: RelatedPostsProps) {
  const relatedPosts = getRelatedPosts(currentPost, allPosts);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="my-16 py-12">
      <motion.div variants={vFadeUp} initial="hidden" animate="show">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3">
            <ArrowLeft size={28} className="text-teal-400" />
            مقالات مرتبط
          </h2>
          <p className="text-white/60">مقالاتی که ممکن است مورد علاقه شما باشد</p>
        </div>

        <motion.div variants={vStagger} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-3">
          {relatedPosts.map((post) => (
            <motion.button
              key={post.id}
              variants={vFadeUp}
              onClick={() => onNavigate(post.slug)}
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/2 border border-white/10 hover:border-teal-500/50 transition-all p-6 text-left h-full"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-amber-500/0 group-hover:from-teal-500/10 group-hover:to-amber-500/10 transition-all duration-300" />

              <div className="relative z-10">
                {/* Category badge */}
                <div className="inline-flex items-center rounded-full bg-teal-500/20 border border-teal-500/50 px-3 py-1 text-xs font-semibold text-teal-300 mb-4">
                  {blogCategories[post.category]?.label || post.category}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-white/60 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs bg-white/5 text-white/50 px-2 py-1 rounded border border-white/10">
                      #{tag}
                    </span>
                  ))}
                  {post.tags.length > 2 && (
                    <span className="text-xs text-white/40 px-2 py-1">+{post.tags.length - 2}</span>
                  )}
                </div>

                {/* Footer: meta info */}
                <div className="flex items-center justify-between text-xs text-white/50 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Eye size={12} />
                    {(post.views || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    {post.readTime}
                  </div>
                </div>

                {/* Author info (optional) */}
                {post.author && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {post.author.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{post.author.name}</p>
                      <p className="text-xs text-white/50 truncate">{post.author.role}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * Breadcrumb Navigation Component
 */
interface BreadcrumbProps {
  items: Array<{ name: string; url?: string }>;
  onNavigate: (url: string) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm text-white/60 flex-wrap">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.url ? (
              <button
                onClick={() => onNavigate(item.url!)}
                className="hover:text-teal-400 transition-colors"
              >
                {item.name}
              </button>
            ) : (
              <span className="text-white/50">{item.name}</span>
            )}
            {index < items.length - 1 && (
              <span className="text-white/30">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Table of Contents Component
 */
interface TableOfContentsProps {
  headings: Array<{ id: string; text: string; level: number }>;
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
      <h3 className="text-sm font-bold text-white mb-4">مطالب این مقاله</h3>
      <nav className="space-y-2">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className="block text-sm text-white/60 hover:text-teal-400 transition-colors"
            style={{ paddingLeft: `${(heading.level - 2) * 16}px` }}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

/**
 * Related Authors Component
 */
interface RelatedAuthorsProps {
  currentAuthor: { name: string; role: string; bio?: string };
  allPosts: BlogPost[];
  onNavigate: (authorName: string) => void;
}

export function RelatedAuthors({ currentAuthor, allPosts, onNavigate }: RelatedAuthorsProps) {
  const authorPosts = allPosts.filter(p => p.author.name === currentAuthor.name);

  if (authorPosts.length === 0) return null;

  return (
    <aside className="bg-white/5 border border-white/10 rounded-xl p-6 my-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {currentAuthor.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-white">{currentAuthor.name}</h3>
          <p className="text-sm text-white/60">{currentAuthor.role}</p>
        </div>
      </div>

      {currentAuthor.bio && (
        <p className="text-sm text-white/60 mb-4">{currentAuthor.bio}</p>
      )}

      <button
        onClick={() => onNavigate(currentAuthor.name)}
        className="w-full btn-gold text-sm font-semibold py-2 rounded-lg"
      >
        مشاهده تمام مقالات
      </button>
    </aside>
  );
}
