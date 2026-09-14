// ─── Enterprise Blog CMS — API Layer ─────────────────────────────────────────
import { supabase } from '../../lib/supabaseApi';
import type {
  Category, Tag, Author, Comment,
  MediaFile, Revision, BlogSettings, ActivityLog, Redirect,
} from './types';

// ── Re-export existing blog API functions ─────────────────────────────────────
export { fetchAllPosts, fetchPublishedPosts, fetchPostBySlug, createPost, updatePost,
  deletePost, toggleFeatured, seedDefaultPosts, uploadCoverImage, rowToPost } from '../../lib/blogApi';
export type { AppBlogPost } from '../../lib/blogApi';

// ── CATEGORIES ────────────────────────────────────────────────────────────────
export async function fetchCategories(): Promise<Category[]> {
  // Simulated — replace with supabase call when table exists
  const stored = localStorage.getItem('cms_categories');
  if (stored) return JSON.parse(stored);
  const defaults: Category[] = [
    { id: '1', name: 'سرمایه‌گذاری', slug: 'investment', description: 'مقالات حوزه سرمایه‌گذاری', post_count: 3, sort_order: 1, created_at: new Date().toISOString() },
    { id: '2', name: 'استراتژی', slug: 'strategy', description: 'استراتژی‌های کسب‌وکار', post_count: 2, sort_order: 2, created_at: new Date().toISOString() },
    { id: '3', name: 'مطالعه موردی', slug: 'case-study', description: 'تحلیل نمونه‌های موردی', post_count: 2, sort_order: 3, created_at: new Date().toISOString() },
    { id: '4', name: 'تحلیل بازار', slug: 'market-analysis', description: 'تحلیل بازار سرمایه', post_count: 1, sort_order: 4, created_at: new Date().toISOString() },
    { id: '5', name: 'مذاکره', slug: 'negotiation', description: 'مهارت‌های مذاکره', post_count: 1, sort_order: 5, created_at: new Date().toISOString() },
    { id: '6', name: 'مدل‌سازی مالی', slug: 'financial-modeling', description: 'مدل‌سازی مالی پیشرفته', post_count: 1, sort_order: 6, created_at: new Date().toISOString() },
  ];
  localStorage.setItem('cms_categories', JSON.stringify(defaults));
  return defaults;
}

export async function saveCategory(cat: Partial<Category> & { name: string; slug: string }): Promise<Category> {
  const all = await fetchCategories();
  if (cat.id) {
    const updated = all.map(c => c.id === cat.id ? { ...c, ...cat } : c);
    localStorage.setItem('cms_categories', JSON.stringify(updated));
    return updated.find(c => c.id === cat.id)!;
  }
  const newCat: Category = { ...cat, id: crypto.randomUUID(), post_count: 0, created_at: new Date().toISOString() };
  localStorage.setItem('cms_categories', JSON.stringify([...all, newCat]));
  return newCat;
}

export async function deleteCategory(id: string): Promise<void> {
  const all = await fetchCategories();
  localStorage.setItem('cms_categories', JSON.stringify(all.filter(c => c.id !== id)));
}

// ── TAGS ──────────────────────────────────────────────────────────────────────
export async function fetchTags(): Promise<Tag[]> {
  const stored = localStorage.getItem('cms_tags');
  if (stored) return JSON.parse(stored);
  const defaults: Tag[] = [
    { id: '1', name: 'VC', slug: 'vc', post_count: 4, created_at: new Date().toISOString() },
    { id: '2', name: 'Startup', slug: 'startup', post_count: 3, created_at: new Date().toISOString() },
    { id: '3', name: 'Investment', slug: 'investment', post_count: 5, created_at: new Date().toISOString() },
    { id: '4', name: 'Pitch', slug: 'pitch', post_count: 2, created_at: new Date().toISOString() },
    { id: '5', name: 'Valuation', slug: 'valuation', post_count: 2, created_at: new Date().toISOString() },
    { id: '6', name: 'Due Diligence', slug: 'due-diligence', post_count: 1, created_at: new Date().toISOString() },
  ];
  localStorage.setItem('cms_tags', JSON.stringify(defaults));
  return defaults;
}

export async function saveTag(tag: Partial<Tag> & { name: string; slug: string }): Promise<Tag> {
  const all = await fetchTags();
  if (tag.id) {
    const updated = all.map(t => t.id === tag.id ? { ...t, ...tag } : t);
    localStorage.setItem('cms_tags', JSON.stringify(updated));
    return updated.find(t => t.id === tag.id)!;
  }
  const newTag: Tag = { ...tag, id: crypto.randomUUID(), post_count: 0, created_at: new Date().toISOString() };
  localStorage.setItem('cms_tags', JSON.stringify([...all, newTag]));
  return newTag;
}

export async function deleteTag(id: string): Promise<void> {
  const all = await fetchTags();
  localStorage.setItem('cms_tags', JSON.stringify(all.filter(t => t.id !== id)));
}

export async function mergeTags(sourceId: string, targetId: string): Promise<void> {
  const all = await fetchTags();
  const source = all.find(t => t.id === sourceId);
  const target = all.find(t => t.id === targetId);
  if (!source || !target) return;
  const merged = all.filter(t => t.id !== sourceId).map(t =>
    t.id === targetId ? { ...t, post_count: (t.post_count ?? 0) + (source.post_count ?? 0) } : t
  );
  localStorage.setItem('cms_tags', JSON.stringify(merged));
}

// ── AUTHORS ───────────────────────────────────────────────────────────────────
export async function fetchAuthors(): Promise<Author[]> {
  const stored = localStorage.getItem('cms_authors');
  if (stored) return JSON.parse(stored);
  const defaults: Author[] = [
    { id: '1', name: 'تیم CapNet', slug: 'capnet-team', email: 'team@capnet.io', bio: 'تیم تخصصی سرمایه‌گذاری CapNet', role: 'Team', title: 'Senior VC Advisor', expertise: ['VC', 'Investment', 'Strategy'], active: true, post_count: 6, created_at: new Date().toISOString() },
    { id: '2', name: 'علی محمدی', slug: 'ali-mohammadi', email: 'ali@capnet.io', bio: 'مشاور ارشد سرمایه‌گذاری با ۱۰ سال تجربه', role: 'Editor', title: 'Investment Advisor', expertise: ['Market Analysis', 'Valuation'], active: true, post_count: 2, created_at: new Date().toISOString() },
  ];
  localStorage.setItem('cms_authors', JSON.stringify(defaults));
  return defaults;
}

export async function saveAuthor(author: Partial<Author> & { name: string; slug: string }): Promise<Author> {
  const all = await fetchAuthors();
  if (author.id) {
    const updated = all.map(a => a.id === author.id ? { ...a, ...author } : a);
    localStorage.setItem('cms_authors', JSON.stringify(updated));
    return updated.find(a => a.id === author.id)!;
  }
  const newAuthor: Author = { ...author, id: crypto.randomUUID(), active: true, post_count: 0, created_at: new Date().toISOString() };
  localStorage.setItem('cms_authors', JSON.stringify([...all, newAuthor]));
  return newAuthor;
}

export async function deleteAuthor(id: string): Promise<void> {
  const all = await fetchAuthors();
  localStorage.setItem('cms_authors', JSON.stringify(all.filter(a => a.id !== id)));
}

// ── COMMENTS ─────────────────────────────────────────────────────────────────
export async function fetchComments(filters?: { status?: string; postId?: string; search?: string }): Promise<Comment[]> {
  const stored = localStorage.getItem('cms_comments');
  let all: Comment[] = stored ? JSON.parse(stored) : generateMockComments();
  if (!stored) localStorage.setItem('cms_comments', JSON.stringify(all));

  if (filters?.status && filters.status !== 'all') all = all.filter(c => c.status === filters.status);
  if (filters?.postId) all = all.filter(c => c.post_id === filters.postId);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    all = all.filter(c => c.author_name.toLowerCase().includes(q) || c.content.toLowerCase().includes(q));
  }
  return all;
}

function generateMockComments(): Comment[] {
  return [
    { id: '1', post_id: 'p1', post_title: 'راهنمای جامع سرمایه‌گذاری', author_name: 'رضا احمدی', author_email: 'reza@example.com', content: 'مقاله بسیار مفید و کامل بود. ممنون از تیم CapNet.', status: 'pending', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', post_id: 'p1', post_title: 'راهنمای جامع سرمایه‌گذاری', parent_id: '1', author_name: 'تیم CapNet', author_email: 'team@capnet.io', content: 'ممنون از نظر شما. خوشحالیم که مفید بوده.', status: 'approved', created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: '3', post_id: 'p2', post_title: 'استراتژی‌های موفق', author_name: 'سارا حسینی', author_email: 'sara@example.com', content: 'آیا می‌توانید بیشتر در مورد روش‌های ارزش‌گذاری توضیح دهید؟', status: 'approved', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: '4', post_id: 'p3', post_title: 'تحلیل بازار', author_name: 'اسپمر', author_email: 'spam@spam.com', content: 'Buy cheap products at www.spam.com!', status: 'spam', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: '5', post_id: 'p2', post_title: 'استراتژی‌های موفق', author_name: 'محمد کریمی', author_email: 'mk@example.com', content: 'عالی بود! خیلی یاد گرفتم.', status: 'pending', created_at: new Date(Date.now() - 10800000).toISOString() },
  ];
}

export async function updateCommentStatus(id: string, status: Comment['status']): Promise<void> {
  const all = await fetchComments();
  const updated = all.map(c => c.id === id ? { ...c, status } : c);
  localStorage.setItem('cms_comments', JSON.stringify(updated));
}

export async function deleteComment(id: string): Promise<void> {
  const all = await fetchComments();
  localStorage.setItem('cms_comments', JSON.stringify(all.filter(c => c.id !== id)));
}

export async function replyToComment(commentId: string, reply: { author_name: string; content: string }): Promise<Comment> {
  const all = await fetchComments();
  const newReply: Comment = {
    id: crypto.randomUUID(),
    post_id: all.find(c => c.id === commentId)?.post_id ?? '',
    parent_id: commentId,
    author_name: reply.author_name,
    content: reply.content,
    status: 'approved',
    created_at: new Date().toISOString(),
  };
  localStorage.setItem('cms_comments', JSON.stringify([...all, newReply]));
  return newReply;
}

// ── MEDIA ─────────────────────────────────────────────────────────────────────
export async function fetchMedia(filters?: { type?: string; folder?: string; search?: string }): Promise<MediaFile[]> {
  const stored = localStorage.getItem('cms_media');
  let all: MediaFile[] = stored ? JSON.parse(stored) : [];
  if (filters?.type && filters.type !== 'all') all = all.filter(m => m.type === filters.type);
  if (filters?.folder) all = all.filter(m => m.folder === filters.folder);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    all = all.filter(m => m.name.toLowerCase().includes(q) || (m.alt_text ?? '').toLowerCase().includes(q));
  }
  return all;
}

export async function saveMediaFile(file: Partial<MediaFile>): Promise<void> {
  const all = await fetchMedia();
  if (file.id) {
    const updated = all.map(m => m.id === file.id ? { ...m, ...file } : m);
    localStorage.setItem('cms_media', JSON.stringify(updated));
  } else {
    const newFile: MediaFile = { ...file as MediaFile, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    localStorage.setItem('cms_media', JSON.stringify([newFile, ...all]));
  }
}

export async function deleteMedia(id: string): Promise<void> {
  const all = await fetchMedia();
  localStorage.setItem('cms_media', JSON.stringify(all.filter(m => m.id !== id)));
}

export async function uploadMedia(file: File, folder?: string): Promise<MediaFile | null> {
  try {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const name = `media-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('blog-images').upload(name, file, { upsert: true });
    if (error || !data) return null;
    const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(data.path);
    const type: MediaFile['type'] = file.type.startsWith('image/') ? 'image'
      : file.type.startsWith('video/') ? 'video'
      : file.type.startsWith('audio/') ? 'audio'
      : 'document';
    const media: MediaFile = {
      id: crypto.randomUUID(),
      name, original_name: file.name, url: publicUrl,
      type, mime_type: file.type, size: file.size,
      folder: folder ?? null,
      created_at: new Date().toISOString(),
    };
    await saveMediaFile(media);
    return media;
  } catch { return null; }
}

// ── REVISIONS ─────────────────────────────────────────────────────────────────
export async function fetchRevisions(postId: string): Promise<Revision[]> {
  const stored = localStorage.getItem(`cms_revisions_${postId}`);
  return stored ? JSON.parse(stored) : [];
}

export async function saveRevision(postId: string, data: Omit<Revision, 'id' | 'post_id' | 'created_at'>): Promise<Revision> {
  const all = await fetchRevisions(postId);
  const rev: Revision = { id: crypto.randomUUID(), post_id: postId, ...data, created_at: new Date().toISOString() };
  const updated = [rev, ...all].slice(0, 50); // keep last 50
  localStorage.setItem(`cms_revisions_${postId}`, JSON.stringify(updated));
  return rev;
}

export async function restoreRevision(postId: string, revisionId: string): Promise<Revision | null> {
  const all = await fetchRevisions(postId);
  return all.find(r => r.id === revisionId) ?? null;
}

// ── BLOG SETTINGS ─────────────────────────────────────────────────────────────
export async function fetchBlogSettings(): Promise<BlogSettings> {
  const stored = localStorage.getItem('cms_blog_settings');
  if (stored) return JSON.parse(stored);
  const defaults: BlogSettings = {
    posts_per_page: 10, show_author: true, show_date: true, show_read_time: true,
    show_views: true, show_share: true, show_like: true, show_related: true,
    show_prev_next: true, show_newsletter: true, comments_enabled: true,
    bookmarks_enabled: true, ratings_enabled: false, blog_layout: 'grid',
    blog_theme: 'default', comments_moderation: 'manual', auto_seo: true,
    newsletter_title: 'عضویت در خبرنامه',
    newsletter_description: 'جدیدترین مقالات را در ایمیل خود دریافت کنید',
  };
  localStorage.setItem('cms_blog_settings', JSON.stringify(defaults));
  return defaults;
}

export async function saveBlogSettings(settings: BlogSettings): Promise<void> {
  localStorage.setItem('cms_blog_settings', JSON.stringify(settings));
}

// ── ACTIVITY LOG ──────────────────────────────────────────────────────────────
export async function fetchActivityLog(limit = 50): Promise<ActivityLog[]> {
  const stored = localStorage.getItem('cms_activity_log');
  const all: ActivityLog[] = stored ? JSON.parse(stored) : [];
  return all.slice(0, limit);
}

export async function logActivity(entry: Omit<ActivityLog, 'id' | 'created_at'>): Promise<void> {
  const stored = localStorage.getItem('cms_activity_log');
  const all: ActivityLog[] = stored ? JSON.parse(stored) : [];
  const newEntry: ActivityLog = { id: crypto.randomUUID(), ...entry, created_at: new Date().toISOString() };
  const updated = [newEntry, ...all].slice(0, 200);
  localStorage.setItem('cms_activity_log', JSON.stringify(updated));
}

// ── REDIRECTS ─────────────────────────────────────────────────────────────────
export async function fetchRedirects(): Promise<Redirect[]> {
  const stored = localStorage.getItem('cms_redirects');
  return stored ? JSON.parse(stored) : [];
}

export async function saveRedirect(redirect: Partial<Redirect> & { from_path: string; to_path: string; type: '301' | '302' }): Promise<Redirect> {
  const all = await fetchRedirects();
  if (redirect.id) {
    const updated = all.map(r => r.id === redirect.id ? { ...r, ...redirect } : r);
    localStorage.setItem('cms_redirects', JSON.stringify(updated));
    return updated.find(r => r.id === redirect.id)!;
  }
  const newR: Redirect = { id: crypto.randomUUID(), ...redirect, active: true, hit_count: 0, created_at: new Date().toISOString() };
  localStorage.setItem('cms_redirects', JSON.stringify([...all, newR]));
  return newR;
}

export async function deleteRedirect(id: string): Promise<void> {
  const all = await fetchRedirects();
  localStorage.setItem('cms_redirects', JSON.stringify(all.filter(r => r.id !== id)));
}

// ── SEO SCORE ─────────────────────────────────────────────────────────────────
// Uses a loose type so it works with both the base BlogPostRow and extended CMS post
export function calculateSEOScore(post: Record<string, any>): { score: number; suggestions: string[] } {
  let score = 0;
  const suggestions: string[] = [];

  if (post.seo_title || post.title) {
    const title = post.seo_title || post.title || '';
    if (title.length >= 40 && title.length <= 60) score += 20;
    else { score += 10; suggestions.push('عنوان SEO باید بین ۴۰ تا ۶۰ کاراکتر باشد'); }
  } else suggestions.push('عنوان SEO تنظیم نشده است');

  if (post.seo_description) {
    if (post.seo_description.length >= 120 && post.seo_description.length <= 160) score += 20;
    else { score += 10; suggestions.push('توضیحات SEO باید بین ۱۲۰ تا ۱۶۰ کاراکتر باشد'); }
  } else suggestions.push('توضیحات SEO تنظیم نشده است');

  if (post.focus_keyword) score += 20;
  else suggestions.push('کلیدواژه اصلی تعریف نشده است');

  if (post.cover_image || post.og_image) score += 15;
  else suggestions.push('تصویر شاخص برای شبکه‌های اجتماعی تنظیم نشده است');

  if (post.content && post.content.length > 300) score += 15;
  else suggestions.push('محتوای پست خیلی کوتاه است');

  if (post.slug) score += 10;
  else suggestions.push('Slug URL تنظیم نشده است');

  return { score: Math.min(score, 100), suggestions };
}

// ── BLOG ANALYTICS (mock data) ────────────────────────────────────────────────
export interface BlogAnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  avgReadTime: string;
  bounceRate: string;
  topPosts: Array<{ title: string; views: number; slug: string }>;
  viewsByDay: Array<{ date: string; views: number }>;
  trafficSources: Array<{ source: string; count: number; pct: number }>;
  authorPerformance: Array<{ name: string; posts: number; views: number }>;
}

export async function fetchBlogAnalytics(): Promise<BlogAnalyticsData> {
  const now = Date.now();
  return {
    totalViews: 18420,
    uniqueVisitors: 12340,
    avgReadTime: '۴:۳۲',
    bounceRate: '۴۲٪',
    topPosts: [
      { title: 'راهنمای جامع سرمایه‌گذاری در ایران', views: 4200, slug: 'investment-guide' },
      { title: 'چگونه یک Pitch Deck حرفه‌ای بسازیم', views: 3100, slug: 'pitch-deck' },
      { title: 'مدل‌سازی مالی برای استارتاپ‌ها', views: 2800, slug: 'financial-modeling' },
      { title: 'ارزیابی ارزش شرکت‌های نوپا', views: 2100, slug: 'startup-valuation' },
      { title: 'استراتژی‌های مذاکره با سرمایه‌گذاران', views: 1900, slug: 'negotiation-strategies' },
    ],
    viewsByDay: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(now - (29 - i) * 86400000).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }),
      views: Math.floor(Math.random() * 800) + 200,
    })),
    trafficSources: [
      { source: 'جستجوی ارگانیک', count: 8200, pct: 45 },
      { source: 'مستقیم', count: 4100, pct: 22 },
      { source: 'شبکه‌های اجتماعی', count: 3300, pct: 18 },
      { source: 'رفرال', count: 1800, pct: 10 },
      { source: 'ایمیل', count: 920, pct: 5 },
    ],
    authorPerformance: [
      { name: 'تیم CapNet', posts: 6, views: 12300 },
      { name: 'علی محمدی', posts: 2, views: 4100 },
    ],
  };
}
