import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Eye, Star, Users } from 'lucide-react';
import type { BlogPost, BlogCategory } from '../types/blog';
import Breadcrumb from './Breadcrumb';

import { t, formatNumber } from '@/i18n';


const vFadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const vStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const blogCategories: Record<BlogCategory, { label: string; color: string; description: string }> = {
  investment: { label: 'سرمایه‌گذاری', color: 'text-teal-400', description: 'مقالات در مورد استراتژی‌های سرمایه‌گذاری و فرصت‌های رشد' },
  strategy: { label: 'استراتژی', color: 'text-amber-400', description: 'راهنماهای استراتژیک برای توسعه کسب‌وکار' },
  'case-study': { label: 'مطالعه موردی', color: 'text-purple-400', description: 'داستان‌های واقعی موفقیت و شکست' },
  'market-analysis': { label: 'تحلیل بازار', color: 'text-blue-400', description: 'تحلیل‌های عمقی بازار و روند‌های صنعتی' },
  negotiation: { label: 'مذاکره', color: 'text-rose-400', description: 'تاکتیک‌های مذاکره و نکات عملی' },
  'financial-modeling': { label: 'مدل‌سازی مالی', color: 'text-green-400', description: 'تکنیک‌های مدل‌سازی و پیش‌بینی مالی' },
};

interface CategoryPageProps {
  categoryName: string;
  posts: BlogPost[];
  onNavigate: (page: string, slug?: string) => void;
  onBack: () => void;
}

export function CategoryPage({ categoryName, posts, onNavigate, onBack }: CategoryPageProps) {
  const categoryKey = categoryName as BlogCategory;
  const categoryInfo = blogCategories[categoryKey];
  
  const filteredPosts = useMemo(() => {
    return posts.filter(p => p.category === categoryKey);
  }, [posts, categoryKey]);

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#040614_0%,#071422_60%)] text-white" dir="rtl">
        <div className="mx-auto max-w-7xl px-5 pt-24 pb-16">
          <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={18} />
            {t("بازگشت")}
          </button>
          <p className="text-center text-white/50">{t("دسته‌بندی یافت نشد")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#040614_0%,#071422_60%)] text-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-5 pt-24 pb-16 md:pt-28">
        {/* ── Breadcrumb ────────────────────────────────────────────────── */}
        <Breadcrumb
          items={[
            { label: t("خانه"), href: '/', onClick: onBack },
            { label: t("بلاگ"), href: '/blog', onClick: onBack },
            { label: t("دسته‌بندی"), href: '/blog/category' },
            { label: categoryInfo.label, href: `/blog/category/${categoryName}` },
          ]}
        />

        <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} />
          {t("بازگشت به بلاگ")}
        </button>

        <motion.div variants={vFadeUp} initial="hidden" animate="show" className="mb-12">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-500/10 via-amber-500/5 to-purple-500/10 border border-white/10 p-8 md:p-12">
            <div className="absolute top-0 end-0 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 start-0 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative">
              <div className={`inline-flex items-center rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm font-medium text-teal-200 mb-6`}>
                <Star size={16} className="ms-2" />
                {t("دسته‌بندی:")} {categoryInfo.label}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                {categoryInfo.label}
              </h1>
              
              <p className="text-base md:text-lg text-white/70 max-w-2xl mb-8 leading-relaxed">
                {categoryInfo.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-black text-white mb-1">{filteredPosts.length}</div>
                  <div className="text-white/50 text-xs">{t("مقاله در این دسته‌بندی")}</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-black text-teal-400 mb-1">
                    {Math.round(filteredPosts.reduce((sum, p) => sum + (p.views || 0), 0) / 1000)}K
                  </div>
                  <div className="text-white/50 text-xs">{t("کل بازدید‌ها")}</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-black text-amber-400 mb-1">
                    {filteredPosts.reduce((sum, p) => sum + (p.tags || []).length, 0)}
                  </div>
                  <div className="text-white/50 text-xs">{t("تگ مرتبط")}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {filteredPosts.length > 0 ? (
          <motion.div variants={vStagger} initial="hidden" animate="show">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <motion.button
                  key={post.id}
                  variants={vFadeUp}
                  onClick={() => onNavigate('blog-post', post.slug)}
                  className="card-glass rounded-2xl p-6 border border-white/10 hover:border-teal-500/50 transition-all group text-start"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center rounded-full bg-teal-500/20 border border-teal-500/50 px-3 py-1 text-xs font-semibold text-teal-300">
                      {categoryInfo.label}
                    </span>
                    <div className="flex items-center gap-1 text-white/50 text-xs">
                      <Eye size={12} />
                      {formatNumber(post.views || 0)}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(post.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/50 pt-4 border-t border-white/10">
                    <span>{post.readTime}</span>
                    <span>{post.publishedAt}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-white/40 text-base">{t("مقاله‌ای در این دسته‌بندی یافت نشد")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface TagPageProps {
  tagName: string;
  posts: BlogPost[];
  onNavigate: (page: string, slug?: string) => void;
  onBack: () => void;
}

export function TagPage({ tagName, posts, onNavigate, onBack }: TagPageProps) {
  const filteredPosts = useMemo(() => {
    return posts.filter(p => (p.tags || []).includes(tagName));
  }, [posts, tagName]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#040614_0%,#071422_60%)] text-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-5 pt-24 pb-16 md:pt-28">
        {/* ── Breadcrumb ────────────────────────────────────────────────── */}
        <Breadcrumb
          items={[
            { label: t("خانه"), href: '/', onClick: onBack },
            { label: t("بلاگ"), href: '/blog', onClick: onBack },
            { label: t("تگ"), href: '/blog/tag' },
            { label: `#${tagName}`, href: `/blog/tag/${encodeURIComponent(tagName)}` },
          ]}
        />

        <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} />
          {t("بازگشت به بلاگ")}
        </button>

        <motion.div variants={vFadeUp} initial="hidden" animate="show" className="mb-12">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-amber-500/10 border border-white/10 p-8 md:p-12">
            <div className="absolute top-0 end-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 start-0 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative">
              <div className="inline-flex items-center rounded-full border border-purple-400/30 bg-purple-400/10 px-4 py-2 text-sm font-medium text-purple-200 mb-6">
                <Star size={16} className="ms-2" />
                {t("تگ:")} {tagName}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                #{tagName}
              </h1>
              
              <p className="text-base md:text-lg text-white/70 max-w-2xl mb-8 leading-relaxed">
                {t("مقالات مرتبط با تگ \"")}{tagName}{t("\" برای آماده‌سازی بهتر سرمایه‌گذاری")}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-black text-white mb-1">{filteredPosts.length}</div>
                  <div className="text-white/50 text-xs">{t("مقاله با این تگ")}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {filteredPosts.length > 0 ? (
          <motion.div variants={vStagger} initial="hidden" animate="show">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <motion.button
                  key={post.id}
                  variants={vFadeUp}
                  onClick={() => onNavigate('blog-post', post.slug)}
                  className="card-glass rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all group text-start"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center rounded-full bg-purple-500/20 border border-purple-500/50 px-3 py-1 text-xs font-semibold text-purple-300">
                      {blogCategories[post.category]?.label || post.category}
                    </span>
                    <div className="flex items-center gap-1 text-white/50 text-xs">
                      <Eye size={12} />
                      {formatNumber(post.views || 0)}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-white/50 pt-4 border-t border-white/10">
                    <span>{post.readTime}</span>
                    <span>{post.publishedAt}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-white/40 text-base">{t("مقاله‌ای با این تگ یافت نشد")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface AuthorPageProps {
  authorName: string;
  posts: BlogPost[];
  onNavigate: (page: string, slug?: string) => void;
  onBack: () => void;
}

export function AuthorPage({ authorName, posts, onNavigate, onBack }: AuthorPageProps) {
  const filteredPosts = useMemo(() => {
    return posts.filter(p => p.author.name === authorName);
  }, [posts, authorName]);

  const author = filteredPosts[0]?.author;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#040614_0%,#071422_60%)] text-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-5 pt-24 pb-16 md:pt-28">
        {/* ── Breadcrumb ────────────────────────────────────────────────── */}
        <Breadcrumb
          items={[
            { label: t("خانه"), href: '/', onClick: onBack },
            { label: t("بلاگ"), href: '/blog', onClick: onBack },
            { label: t("نویسنده"), href: '/blog/author' },
            { label: authorName, href: `/blog/author/${encodeURIComponent(authorName)}` },
          ]}
        />

        <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} />
          {t("بازگشت به بلاگ")}
        </button>

        <motion.div variants={vFadeUp} initial="hidden" animate="show" className="mb-12">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 border border-white/10 p-8 md:p-12">
            <div className="absolute top-0 end-0 w-96 h-96 bg-green-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 start-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {authorName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
                    {authorName}
                  </h1>
                  <p className="text-teal-300 font-semibold">
                    {author?.role}
                  </p>
                </div>
              </div>
              
              {author?.bio && (
                <p className="text-base md:text-lg text-white/70 max-w-2xl mb-8 leading-relaxed">
                  {author.bio}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-black text-white mb-1">{filteredPosts.length}</div>
                  <div className="text-white/50 text-xs">{t("مقاله نوشته شده")}</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-black text-green-400 mb-1">
                    {Math.round(filteredPosts.reduce((sum, p) => sum + (p.views || 0), 0) / 1000)}K
                  </div>
                  <div className="text-white/50 text-xs">{t("کل بازدید‌ها")}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {filteredPosts.length > 0 ? (
          <motion.div variants={vStagger} initial="hidden" animate="show">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <motion.button
                  key={post.id}
                  variants={vFadeUp}
                  onClick={() => onNavigate('blog-post', post.slug)}
                  className="card-glass rounded-2xl p-6 border border-white/10 hover:border-green-500/50 transition-all group text-start"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center rounded-full bg-green-500/20 border border-green-500/50 px-3 py-1 text-xs font-semibold text-green-300">
                      {blogCategories[post.category]?.label || post.category}
                    </span>
                    <div className="flex items-center gap-1 text-white/50 text-xs">
                      <Eye size={12} />
                      {formatNumber(post.views || 0)}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-white/50 pt-4 border-t border-white/10">
                    <span>{post.readTime}</span>
                    <span>{post.publishedAt}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-white/40 text-base">{t("مقاله‌ای یافت نشد")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
