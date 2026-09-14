/**
 * BlogSidebar
 * Sticky right-hand sidebar with: TOC, author, popular posts,
 * latest posts, newsletter, tag cloud, search, and ad placeholder.
 */
import { useState } from 'react';
import { Search, Tag } from 'lucide-react';
import TableOfContents from './TableOfContents';
import AuthorCard from './AuthorCard';
import PopularPosts from './PopularPosts';
import type { TocItem, BlogAuthorFull } from '../types';
import type { AppBlogPost } from '../../../lib/blogApi';

import { t } from '@/i18n';


interface Props {
  tocItems: TocItem[];
  author: BlogAuthorFull;
  popularPosts: AppBlogPost[];
  latestPosts: AppBlogPost[];
  tags: string[];
  onNavigate: (slug: string) => void;
  onTagClick?: (tag: string) => void;
}

export default function BlogSidebar({
  tocItems,
  author,
  popularPosts,
  latestPosts,
  tags,
  onNavigate,
  onTagClick,
}: Props) {
  const [query, setQuery] = useState('');
  const filtered = latestPosts.filter(
    (p) =>
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside aria-label={t("نوار کناری")} className="space-y-6">
      {/* Search */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4">
        <label htmlFor="sidebar-search" className="sr-only">
          {t("جستجو در مقالات")}
        </label>
        <div className="relative">
          <Search
            size={15}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-white/30"
            aria-hidden="true"
          />
          <input
            id="sidebar-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("جستجو...")}
            className="w-full text-sm bg-white/5 border border-white/10 rounded-xl pe-9 ps-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          />
        </div>

        {/* Quick results */}
        {query && filtered.length > 0 && (
          <ul className="mt-3 space-y-1.5" role="list">
            {filtered.slice(0, 4).map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => { setQuery(''); onNavigate(p.slug); }}
                  className="w-full text-end text-xs text-white/60 hover:text-teal-300 transition-colors p-1.5 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                >
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Table of Contents */}
      {tocItems.length > 0 && <TableOfContents items={tocItems} />}

      {/* Author card compact */}
      <AuthorCard author={author} compact />

      {/* Popular Posts */}
      <PopularPosts
        posts={popularPosts.slice(0, 5)}
        onNavigate={onNavigate}
      />

      {/* Latest Posts */}
      {latestPosts.length > 0 && (
        <section
          aria-labelledby="latest-sidebar-heading"
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5"
        >
          <h3
            id="latest-sidebar-heading"
            className="text-sm font-bold text-white mb-4"
          >
            {t("آخرین مقالات")}
          </h3>
          <ul className="space-y-3" role="list">
            {latestPosts.slice(0, 4).map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => onNavigate(p.slug)}
                  className="w-full text-end text-xs font-medium text-white/65 hover:text-teal-300 transition-colors line-clamp-2 leading-snug focus:outline-none focus:ring-2 focus:ring-teal-500/30 rounded-lg p-1"
                >
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Newsletter */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
        <h3 className="text-sm font-bold text-white mb-3">{t("خبرنامه")}</h3>
        <p className="text-xs text-white/45 mb-3 leading-relaxed">
          {t("آخرین مقالات را در ایمیل خود دریافت کنید.")}
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          aria-label={t("خبرنامه سایدبار")}
          className="space-y-2"
        >
          <input
            type="email"
            placeholder={t("ایمیل شما")}
            className="w-full text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          />
          <button
            type="submit"
            className="w-full text-xs bg-teal-500 hover:bg-teal-400 text-black font-bold py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            {t("عضویت")}
          </button>
        </form>
      </div>

      {/* Tag cloud */}
      {tags.length > 0 && (
        <section
          aria-labelledby="tags-sidebar-heading"
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5"
        >
          <h3
            id="tags-sidebar-heading"
            className="flex items-center gap-2 text-sm font-bold text-white mb-4"
          >
            <Tag size={14} className="text-teal-400" aria-hidden="true" />
            {t("برچسب‌ها")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="text-xs text-white/50 bg-white/5 hover:bg-teal-500/10 hover:text-teal-400 border border-white/10 hover:border-teal-500/30 px-3 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Advertisement placeholder */}
      <div
        className="rounded-2xl border border-dashed border-white/10 p-6 text-center"
        role="complementary"
        aria-label={t("محل تبلیغات")}
      >
        <p className="text-xs text-white/20">{t("محل تبلیغات")}</p>
        <p className="text-[10px] text-white/12 mt-1">300 × 250</p>
      </div>
    </aside>
  );
}
