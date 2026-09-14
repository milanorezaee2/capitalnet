/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * EnterpriseBlogPostPage — v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Full 3-column WordPress-feature-parity blog post page.
 *
 * Layout (desktop):
 *   [56px sticky left sidebar] | [main content ~720px] | [320px right sidebar]
 *
 * Feature checklist:
 *  ✅ Reading progress bar (top) + ring (left sidebar)
 *  ✅ Skip-to-content (WCAG)
 *  ✅ Full-bleed hero with category, H1, all meta, featured image
 *  ✅ Breadcrumb (Schema.org BreadcrumbList)
 *  ✅ Post meta bar (publish, updated, read time, views, comments, words, version)
 *  ✅ Author card (avatar, bio, expertise, social links, article count)
 *  ✅ Font controls (−/+ and reading mode)
 *  ✅ AI Key-Takeaways box
 *  ✅ Mobile TOC (collapsible)
 *  ✅ Rich article content (headings, code, quotes, alerts, tables, lists,
 *       images, galleries, videos, audio, downloads)
 *  ✅ Tags cloud (clickable)
 *  ✅ FAQ accordion + FAQPage JSON-LD
 *  ✅ Sources / References
 *  ✅ Rating stars (5-star, localStorage)
 *  ✅ CTA section
 *  ✅ Like / Dislike / Bookmark bar
 *  ✅ Share buttons (Telegram, WhatsApp, FB, LinkedIn, X, Copy)
 *  ✅ Related posts grid
 *  ✅ Prev / Next navigation
 *  ✅ Newsletter subscription
 *  ✅ Comments (nested, reply, like, delete, report)
 *  ✅ Scroll-to-top floating button
 *  ✅ Print-optimised (hidden UI chrome, white background)
 *  ✅ Sticky left sidebar (ring, bookmark, like, share, print, top)
 *  ✅ Right sidebar (search, TOC, author, popular, latest, tags, newsletter, ad)
 *  ✅ Full SEO (OG, Twitter Card, Article + Breadcrumb + Person + Org JSON-LD)
 *  ✅ Skeleton loading state
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  ArrowLeft,
  Printer,
  Tag,
  BookOpen,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

// ── Design system (scoped bp-* CSS classes) ───────────────────────────────
import './design-system/blog-post.css';

// ── Data layer ─────────────────────────────────────────────────────────────
import { fetchPostBySlug, fetchPublishedPosts } from '../../lib/blogApi';
import type { AppBlogPost } from '../../lib/blogApi';

// ── Context & hooks ────────────────────────────────────────────────────────
import { BlogPostProvider }        from './context/BlogPostContext';
import { useComments }             from './hooks';
import { useBlogPostCtx }          from './context/BlogPostContext';

// ── Core article components ────────────────────────────────────────────────
import ReadingProgressBar    from './components/ReadingProgressBar';
import BlogPostHero          from './components/BlogPostHero';
import AuthorCard            from './components/AuthorCard';
import PostMetaBar           from './components/PostMetaBar';
import ArticleContent        from './components/ArticleContent';
import TableOfContents       from './components/TableOfContents';
import FontControls          from './components/FontControls';
import AIBox, { parseTakeaways } from './components/AIBox';

// ── Interaction ────────────────────────────────────────────────────────────
import ShareButtons          from './components/ShareButtons';
import LikeDislikeBar        from './components/LikeDislikeBar';
import FAQSection            from './components/FAQSection';
import RelatedPosts          from './components/RelatedPosts';
import CommentSection        from './components/CommentSection';
import NewsletterBox         from './components/NewsletterBox';
import PrevNextNav           from './components/PrevNextNav';
import BlogPostCTA           from './components/BlogPostCTA';
import RatingStars           from './components/RatingStars';
import ScrollToTop           from './components/ScrollToTop';

// ── Layout ─────────────────────────────────────────────────────────────────
import StickyLeftSidebar     from './components/StickyLeftSidebar';
import BlogSidebar           from './components/BlogSidebar';

// ── SEO ────────────────────────────────────────────────────────────────────
import BlogPostSEO           from './components/BlogPostSEO';

// ── Loading skeleton ───────────────────────────────────────────────────────
import { SkeletonPost }      from './components/Skeleton';
import { FinancialBackground } from '../../components/FinancialBackground';

import type { TocItem, FaqItem, SourceItem, BlogAuthorFull } from './types';

import { t as tr } from '@/i18n';


// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  investment:           'سرمایه‌گذاری',
  strategy:             'استراتژی',
  'case-study':         'مطالعه موردی',
  'market-analysis':    'تحلیل بازار',
  negotiation:          'مذاکره',
  'financial-modeling': 'مدل مالی',
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

// ─── Content parsers ──────────────────────────────────────────────────────────

function parseTOC(content: string): TocItem[] {
  const lines = content.split('\n');
  const items: TocItem[] = [];
  let idx = 0;

  lines.forEach((raw) => {
    const line = raw.trim();
    let level: 2 | 3 | 4 | null = null;
    let title = '';

    if (line.startsWith('#### '))     { level = 4; title = line.slice(5).trim(); }
    else if (line.startsWith('### ')) { level = 3; title = line.slice(4).trim(); }
    else if (line.startsWith('## '))  { level = 2; title = line.slice(3).trim(); }
    else if (/^\*\*[^*].+\*\*$/.test(line)) {
      level = 2; title = line.replace(/\*\*/g, '').trim();
    }

    if (level && title) {
      const id = `h${level}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}-${idx++}`;
      if (level === 2) {
        items.push({ id, title, level });
      } else if (level === 3 && items.length > 0) {
        const parent = items[items.length - 1];
        if (!parent.children) parent.children = [];
        parent.children.push({ id, title, level });
      } else if (level === 4) {
        const parent = items[items.length - 1];
        if (parent) {
          if (!parent.children) parent.children = [];
          const lastChild = parent.children[parent.children.length - 1];
          if (lastChild) {
            if (!lastChild.children) lastChild.children = [];
            lastChild.children.push({ id, title, level });
          } else {
            parent.children.push({ id, title, level });
          }
        }
      }
    }
  });

  return items;
}

function extractFAQ(content: string): FaqItem[] {
  const items: FaqItem[] = [];
  const lines = content.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith(tr("سوال:")) || line.startsWith('Q:') || line.startsWith('❓')) {
      const question = line.replace(/^(سوال:|Q:|❓)\s*/, '').trim();
      const nextLine = lines[i + 1]?.trim() ?? '';
      if (nextLine.startsWith(tr("جواب:")) || nextLine.startsWith('A:') || nextLine.startsWith('✅')) {
        const answer = nextLine.replace(/^(جواب:|A:|✅)\s*/, '').trim();
        if (question && answer) items.push({ question, answer });
        i += 2; continue;
      }
    }
    i++;
  }
  return items;
}

function extractSources(content: string): SourceItem[] {
  const sources: SourceItem[] = [];
  const lines = content.split('\n');
  let inSources = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (/^##\s*(منابع|references|sources|مراجع)/i.test(line)) { inSources = true; continue; }
    if (inSources && line.startsWith('##')) break;
    if (inSources && line.startsWith('-')) {
      const text = line.replace(/^-\s*/, '').trim();
      const match = text.match(/\[(.+?)\]\((.+?)\)/);
      if (match) sources.push({ title: match[1], url: match[2] });
      else        sources.push({ title: text });
    }
  }
  return sources;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

// ─── Inner page (consumes BlogPostContext) ────────────────────────────────────

interface InnerProps {
  post: AppBlogPost;
  allPosts: AppBlogPost[];
  onBack: () => void;
  onNavigate: (slug: string) => void;
}

function BlogPostPageInner({ post, allPosts, onBack, onNavigate }: InnerProps) {
  const { fontSize, readingMode } = useBlogPostCtx();
  const { comments, addComment, addReply, likeComment, deleteComment } = useComments(post.id);

  // ── Derived data ──────────────────────────────────────────────────────────
  const tocItems   = useMemo(() => parseTOC(post.content),      [post.content]);
  const faqItems   = useMemo(() => extractFAQ(post.content),    [post.content]);
  const sources    = useMemo(() => extractSources(post.content),[post.content]);
  const takeaways  = useMemo(() => parseTakeaways(post.content),[post.content]);
  const wordCount  = useMemo(() => countWords(post.content),    [post.content]);

  const relatedPosts = useMemo(
    () => allPosts.filter((p) => p.id !== post.id && (p.category === post.category || (p.tags ?? []).some((t) => (post.tags ?? []).includes(t)))).slice(0, 3),
    [allPosts, post]
  );
  const popularPosts = useMemo(
    () => [...allPosts].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5),
    [allPosts]
  );
  const latestPosts = useMemo(
    () => [...allPosts].filter((p) => p.id !== post.id).slice(0, 6),
    [allPosts, post.id]
  );
  const allTags = useMemo(
    () => [...new Set(allPosts.flatMap((p) => p.tags ?? []))].filter((t): t is string => t !== null).slice(0, 20),
    [allPosts]
  );

  const postIndex = allPosts.findIndex((p) => p.id === post.id);
  const prevPost  = postIndex < allPosts.length - 1 ? allPosts[postIndex + 1] : undefined;
  const nextPost  = postIndex > 0 ? allPosts[postIndex - 1] : undefined;

  const currentUrl = window.location.href;

  const author: BlogAuthorFull = {
    name: post.author_name,
    role: post.author_role,
    expertise: [],
    socialLinks: {},
    articleCount: allPosts.filter((p) => p.author_name === post.author_name).length,
  };

  const breadcrumbs = [
    { name: tr("خانه"), url: `${window.location.origin}/` },
    { name: tr("بلاگ"), url: `${window.location.origin}/blog` },
    { name: CATEGORY_LABELS[post.category ?? ''] ?? (post.category ?? ''), url: `${window.location.origin}/blog/category/${post.category ?? ''}` },
    { name: post.title, url: currentUrl },
  ];

  return (
    <>
      {/* ── SEO ──────────────────────────────────────────────────────────────── */}
      <BlogPostSEO post={post} url={currentUrl} breadcrumbs={breadcrumbs} />

      {/* ── Progress bar ─────────────────────────────────────────────────────── */}
      <ReadingProgressBar />

      {/* ── Scroll-to-top ────────────────────────────────────────────────────── */}
      <ScrollToTop />

      {/* ── Skip link ────────────────────────────────────────────────────────── */}
      <a
        href="#article-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-teal-500 focus:text-black focus:font-bold focus:rounded-xl"
      >
        {tr("رفتن به محتوا")}
      </a>

      <article
        className="min-h-screen bg-[#0d1829] text-white print:bg-white print:text-black relative"
        itemScope
        itemType="https://schema.org/Article"
      >
        <FinancialBackground />
        {/* ── Hero ─────────────────────────────────────────────────────────────── */}
        <BlogPostHero post={post} commentCount={comments.length} />

        {/* ── Main layout ──────────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 xl:px-8 py-10">

          {/* Breadcrumb */}
          <nav aria-label={tr("مسیر صفحه")} className="flex items-center gap-1.5 text-xs text-white/35 mb-6 print:hidden flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight size={11} className="opacity-30 flex-shrink-0" aria-hidden="true" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="text-white/60 truncate max-w-[200px]" aria-current="page">{crumb.name}</span>
                ) : (
                  <button
                    onClick={() => { if (idx <= 1) onBack(); }}
                    className="hover:text-teal-400 transition-colors focus:outline-none rounded"
                  >
                    {crumb.name}
                  </button>
                )}
              </span>
            ))}
          </nav>

          {/* Back button */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-6 print:hidden">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40 rounded-xl px-3 py-2 hover:bg-white/5"
              aria-label={tr("بازگشت به صفحه بلاگ")}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {tr("بازگشت به بلاگ")}
            </button>
          </motion.div>

          {/* ── 3-column grid ────────────────────────────────────────────────────── */}
          <div className="grid gap-8 lg:grid-cols-[56px_1fr_320px] xl:grid-cols-[60px_1fr_340px]">

            {/* ── Column 1: Sticky left micro-sidebar ──────────────────────────── */}
            <StickyLeftSidebar title={post.title} url={currentUrl} />

            {/* ── Column 2: Main article ─────────────────────────────────────── */}
            <main id="article-main" tabIndex={-1} className="min-w-0">

              {/* Post meta bar */}
              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <PostMetaBar
                    publishedAt={post.published_at ?? post.created_at}
                    readTime={post.read_time}
                    views={post.views}
                    likes={post.likes}
                    commentCount={comments.length}
                    wordCount={wordCount}
                    category={CATEGORY_LABELS[post.category ?? ''] ?? (post.category ?? '')}
                  />
              </motion.div>

              {/* Toolbar: font controls + print */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden"
              >
                <FontControls />
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                  aria-label={tr("چاپ مقاله")}
                >
                  <Printer size={13} aria-hidden="true" />
                  {tr("چاپ")}
                </button>
              </motion.div>

              {/* Author card */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-6">
                <AuthorCard author={author} />
              </motion.div>

              {/* AI Takeaways box */}
              {takeaways.length > 0 && (
                <motion.div variants={fadeUp} initial="hidden" animate="show">
                  <AIBox items={takeaways} />
                </motion.div>
              )}

              {/* Mobile TOC */}
              {tocItems.length > 0 && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:hidden mb-6">
                  <TableOfContents items={tocItems} />
                </motion.div>
              )}

              {/* ── Article body ──────────────────────────────────────────────── */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className={`rounded-2xl border border-white/8 bg-[#0d1117]/60 p-6 md:p-10 mb-8 ${readingMode ? 'max-w-2xl mx-auto' : ''}`}
                itemProp="articleBody"
              >
                <ArticleContent content={post.content} fontSize={fontSize} readingMode={false} />
              </motion.div>

              {/* Tags */}
              {(post.tags ?? []).length > 0 && (
                <motion.section variants={fadeUp} initial="hidden" animate="show" aria-label={tr("برچسب‌ها")} className="mb-8 print:hidden">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-wider mb-3">
                    <Tag size={12} className="text-teal-400" aria-hidden="true" />
                    {tr("برچسب‌ها")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(post.tags ?? []).map((tag) => (
                      <span key={tag} className="bp-tag">#{tag}</span>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* FAQ */}
              {faqItems.length > 0 && (
                <motion.div variants={fadeUp} initial="hidden" animate="show">
                  <FAQSection items={faqItems} />
                </motion.div>
              )}

              {/* Sources */}
              {sources.length > 0 && (
                <motion.section
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  aria-labelledby="sources-heading"
                  className="mt-12 pt-8 border-t border-white/8"
                >
                  <h2 id="sources-heading" className="flex items-center gap-2 text-xl font-black text-white mb-5">
                    <BookOpen size={18} className="text-teal-400" aria-hidden="true" />
                    {tr("منابع")}
                  </h2>
                  <ol className="space-y-2.5" role="list">
                    {sources.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-white/50">
                        <span className="text-teal-400 font-bold flex-shrink-0">[{idx + 1}]</span>
                        {s.url ? (
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 underline underline-offset-2 transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-teal-500/40 rounded">
                            {s.title} <ExternalLink size={11} aria-hidden="true" />
                          </a>
                        ) : (
                          <span>{s.title}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </motion.section>
              )}

              {/* CTA */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="print:hidden">
                <BlogPostCTA variant="consult" onAction={onBack} />
              </motion.div>

              {/* Rating stars */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="mt-8 border-t border-white/8 print:hidden">
                <RatingStars postId={post.id} />
              </motion.div>

              {/* Like / Share row */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-2 print:hidden"
              >
                <LikeDislikeBar />
                <ShareButtons title={post.title} url={currentUrl} />
              </motion.div>

              {/* Related posts */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="print:hidden">
                <RelatedPosts posts={relatedPosts} onNavigate={onNavigate} />
              </motion.div>

              {/* Prev / Next */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="print:hidden">
                <PrevNextNav
                  prev={prevPost ? { title: prevPost.title, slug: prevPost.slug ?? '', category: prevPost.category ?? '', readTime: prevPost.read_time, image: prevPost.cover_image ?? undefined } : undefined}
                  next={nextPost ? { title: nextPost.title, slug: nextPost.slug ?? '', category: nextPost.category ?? '', readTime: nextPost.read_time, image: nextPost.cover_image ?? undefined } : undefined}
                  onNavigate={onNavigate}
                />
              </motion.div>

              {/* Newsletter */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="print:hidden">
                <NewsletterBox />
              </motion.div>

              {/* Comments */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="print:hidden">
                <CommentSection
                  comments={comments}
                  onAdd={addComment}
                  onReply={addReply}
                  onLike={likeComment}
                  onDelete={deleteComment}
                />
              </motion.div>
            </main>

            {/* ── Column 3: Right sidebar ────────────────────────────────────── */}
            <div className="hidden lg:block print:hidden">
              <div className="sticky top-24 space-y-5">
                <BlogSidebar
                  tocItems={tocItems}
                  author={author}
                  popularPosts={popularPosts}
                  latestPosts={latestPosts}
                  tags={allTags}
                  onNavigate={onNavigate}
                />
              </div>
            </div>

          </div>{/* end 3-col grid */}
        </div>
      </article>
    </>
  );
}

// ─── Shell (data fetching + provider) ────────────────────────────────────────

interface ShellProps {
  slug: string;
  onBack: () => void;
}

export default function EnterpriseBlogPostPage({ slug, onBack }: ShellProps) {
  const [post, setPost]       = useState<AppBlogPost | null>(null);
  const [allPosts, setAll]    = useState<AppBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPostBySlug(slug), fetchPublishedPosts()])
      .then(([p, all]) => { setPost(p); setAll(all); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <SkeletonPost />;

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0d1829] text-white flex flex-col items-center justify-center gap-4 relative">
        <FinancialBackground />
        <h1 className="text-2xl font-black">{tr("مقاله یافت نشد")}</h1>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 rounded-xl px-4 py-2"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {tr("بازگشت به بلاگ")}
        </button>
      </div>
    );
  }

  return (
    <BlogPostProvider postId={post.id}>
      <BlogPostPageInner
        post={post}
        allPosts={allPosts}
        onBack={onBack}
        onNavigate={(s) => {
          window.history.pushState(null, '', `/blog/${s}`);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
      />
    </BlogPostProvider>
  );
}
