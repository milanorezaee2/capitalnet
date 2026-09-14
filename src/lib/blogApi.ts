// ─── Blog Posts API ─────────────────────────────────────────────────────────────
import { supabase } from './supabaseApi';
import { IMAGE_BUCKET } from './mediaUploadApi';

const BLOG_IMAGE_BUCKET = 'blog-images';

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface AppBlogPost {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string | null;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  tags: string[] | null;
  category: string | null;
  status: BlogPostStatus;
  author_name: string;
  author_role: string;
  published_at: string | null;
  read_time: string;
  featured: boolean;
  views: number;
  likes: number;
}

// ── Convert database row to AppBlogPost ─────────────────────────────────────────
export function rowToPost(row: any): AppBlogPost {
  return row as AppBlogPost;
}

// ── Fetch all posts (admin only) ───────────────────────────────────────────────
export async function fetchAllPosts(): Promise<AppBlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[fetchAllPosts]', error.message);
    return [];
  }
  return (data ?? []) as AppBlogPost[];
}

// ── Fetch published posts (public) ──────────────────────────────────────────────
export async function fetchPublishedPosts(): Promise<AppBlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[fetchPublishedPosts]', error.message);
    return [];
  }
  return (data ?? []) as AppBlogPost[];
}

// ── Fetch a single post by slug ─────────────────────────────────────────────────
export async function fetchPostBySlug(slug: string): Promise<AppBlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('[fetchPostBySlug]', error.message);
    return null;
  }
  return data as AppBlogPost;
}

// ── Create a new post ───────────────────────────────────────────────────────────
export async function createPost(post: Partial<AppBlogPost>): Promise<AppBlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      slug: post.slug || null,
      cover_image: post.cover_image || null,
      tags: post.tags || null,
      category: post.category || null,
      status: post.status || 'draft',
      author_name: post.author_name || '',
      author_role: post.author_role || '',
      read_time: post.read_time || '5 min',
      featured: post.featured || false,
      views: 0,
      likes: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('[createPost]', error.message);
    return null;
  }
  return data as AppBlogPost;
}

// ── Update an existing post ─────────────────────────────────────────────────────
export async function updatePost(id: string, post: Partial<AppBlogPost>): Promise<AppBlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .update({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      slug: post.slug,
      cover_image: post.cover_image,
      tags: post.tags,
      category: post.category,
      status: post.status,
      author_name: post.author_name,
      author_role: post.author_role,
      read_time: post.read_time,
      featured: post.featured,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[updatePost]', error.message);
    return null;
  }
  return data as AppBlogPost;
}

// ── Delete a post ────────────────────────────────────────────────────────────────
export async function deletePost(id: string): Promise<boolean> {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) {
    console.error('[deletePost]', error.message);
    return false;
  }
  return true;
}

// ── Toggle featured status ──────────────────────────────────────────────────────
export async function toggleFeatured(id: string): Promise<boolean> {
  const { data: current } = await supabase
    .from('blog_posts')
    .select('featured')
    .eq('id', id)
    .single();

  if (!current) return false;

  const { error } = await supabase
    .from('blog_posts')
    .update({ featured: !current.featured })
    .eq('id', id);

  if (error) {
    console.error('[toggleFeatured]', error.message);
    return false;
  }
  return true;
}

// ── Upload cover image ───────────────────────────────────────────────────────────
export async function uploadCoverImage(file: File): Promise<{ url: string | null; error?: string }> {
  try {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const fileName = `blog-cover-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from(BLOG_IMAGE_BUCKET)
      .upload(fileName, file, { upsert: true });

    if (error || !data) {
      const fallbackBucket = IMAGE_BUCKET;
      const message = error?.message ?? 'Upload failed or bucket not found';
      console.error('[uploadCoverImage]', message);

      if (error?.message?.includes('Bucket not found')) {
        const fallbackName = `blog-cover-${Date.now()}.${ext}`;
        const fallbackResult = await supabase.storage
          .from(fallbackBucket)
          .upload(fallbackName, file, { upsert: true });

        if (fallbackResult.error || !fallbackResult.data) {
          const fallbackMessage = fallbackResult.error?.message ?? 'Fallback upload failed';
          console.error('[uploadCoverImage] fallback', fallbackMessage);
          return { url: null, error: `Bucket not found; fallback failed: ${fallbackMessage}` };
        }

        const { data: { publicUrl: fallbackPublicUrl } } = supabase.storage
          .from(fallbackBucket)
          .getPublicUrl(fallbackResult.data.path);
        return { url: fallbackPublicUrl, error: undefined };
      }

      return { url: null, error: message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BLOG_IMAGE_BUCKET)
      .getPublicUrl(data.path);

    return { url: publicUrl, error: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[uploadCoverImage]', message);
    return { url: null, error: message };
  }
}

// ── Seed default posts (for development) ─────────────────────────────────────────
export async function seedDefaultPosts(): Promise<void> {
  const defaultPosts: Partial<AppBlogPost>[] = [
    {
      title: 'راهنمای جامع سرمایه‌گذاری در ایران',
      slug: 'investment-guide-iran',
      excerpt: 'یک راهنمای کامل برای سرمایه‌گذاری در بازار ایران با بررسی فرصت‌ها و چالش‌ها',
      content: '<p>محتوای کامل مقاله در اینجا قرار می‌گیرد...</p>',
      category: 'سرمایه‌گذاری',
      tags: ['سرمایه‌گذاری', 'ایران', 'راهنما'],
      author_name: 'تیم CapNet',
      author_role: 'Senior VC Advisor',
      status: 'published',
      published_at: new Date().toISOString(),
      read_time: '8 min',
      featured: true,
    },
    {
      title: 'چگونه یک Pitch Deck حرفه‌ای بسازیم',
      slug: 'professional-pitch-deck',
      excerpt: 'تمام آنچه باید درباره ساخت Pitch Deck حرفه‌ای برای جذب سرمایه بدانید',
      content: '<p>محتوای کامل مقاله در اینجا قرار می‌گیرد...</p>',
      category: 'استراتژی',
      tags: ['Pitch Deck', 'سرمایه‌گذاری', 'استارتاپ'],
      author_name: 'تیم CapNet',
      author_role: 'Senior VC Advisor',
      status: 'published',
      published_at: new Date().toISOString(),
      read_time: '6 min',
      featured: true,
    },
  ];

  for (const post of defaultPosts) {
    await createPost(post);
  }
}
