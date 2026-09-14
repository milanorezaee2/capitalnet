/**
 * RelatedPosts
 * Grid of 3 related articles (by category / tag similarity).
 */
import { Clock, TrendingUp } from 'lucide-react';
import type { AppBlogPost } from '../../../lib/blogApi';

interface Props {
  posts: AppBlogPost[];
  onNavigate: (slug: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  investment:           'سرمایه‌گذاری',
  strategy:             'استراتژی',
  'case-study':         'مطالعه موردی',
  'market-analysis':    'تحلیل بازار',
  negotiation:          'مذاکره',
  'financial-modeling': 'مدل مالی',
};

export default function RelatedPosts({ posts, onNavigate }: Props) {
  if (!posts.length) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-12 pt-8 border-t border-white/10">
      <h2
        id="related-heading"
        className="flex items-center gap-2 text-xl font-black text-white mb-6"
      >
        <TrendingUp size={20} className="text-amber-400" aria-hidden="true" />
        مقالات مرتبط
      </h2>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {posts.map((post) => (
          <li key={post.id}>
            <article
              className="h-full rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden hover:border-white/15 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              onClick={() => onNavigate(post.slug ?? '')}
            >
              {/* Thumbnail */}
              <div className="h-36 bg-gradient-to-br from-teal-500/10 to-amber-500/10 relative overflow-hidden">
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.1),transparent_60%)]" />
                )}
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="text-xs text-teal-400/80 mb-2">
                  {CATEGORY_LABELS[post.category ?? ''] ?? (post.category ?? '')}
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-2 mb-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-white/45 text-xs line-clamp-2 mb-3 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-white/35 text-xs">
                  <Clock size={11} aria-hidden="true" />
                  {post.read_time}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
