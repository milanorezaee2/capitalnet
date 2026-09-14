/**
 * PopularPosts
 * Ranked list of most-viewed articles for the sidebar.
 */
import { Eye, TrendingUp } from 'lucide-react';
import type { AppBlogPost } from '../../../lib/blogApi';

interface Props {
  posts: AppBlogPost[];
  onNavigate: (slug: string) => void;
}

export default function PopularPosts({ posts, onNavigate }: Props) {
  if (!posts.length) return null;

  return (
    <section
      aria-labelledby="popular-heading"
      className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5"
    >
      <h3
        id="popular-heading"
        className="flex items-center gap-2 text-sm font-bold text-white mb-4"
      >
        <TrendingUp size={16} className="text-amber-400" aria-hidden="true" />
        مقالات محبوب
      </h3>

      <ol className="space-y-3" role="list">
        {posts.map((post, idx) => (
          <li key={post.id}>
            <button
              onClick={() => onNavigate(post.slug)}
              className="w-full flex items-start gap-3 text-right group focus:outline-none focus:ring-2 focus:ring-teal-500/40 rounded-xl p-1"
              aria-label={post.title}
            >
              <span
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500/20 to-amber-500/20 flex items-center justify-center text-xs font-black text-teal-400"
                aria-hidden="true"
              >
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white/80 group-hover:text-teal-300 transition-colors line-clamp-2 leading-snug mb-1">
                  {post.title}
                </p>
                <div className="flex items-center gap-1.5 text-white/35 text-[11px]">
                  <Eye size={10} aria-hidden="true" />
                  {(post.views ?? 0).toLocaleString('fa-IR')} بازدید
                </div>
              </div>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
