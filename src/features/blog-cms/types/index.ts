// ─── Enterprise Blog CMS — Type Definitions ──────────────────────────────────

export type BlogPostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface BlogPostRow {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  subtitle?: string | null;
  slug: string | null;
  category: string | null;
  tags: string[] | null;
  excerpt: string;
  content: string;
  cover_image: string | null;
  author_name: string;
  author_role: string;
  author_id?: string | null;
  published_at: string | null;
  scheduled_at?: string | null;
  expires_at?: string | null;
  read_time: string;
  featured: boolean;
  status: BlogPostStatus;
  views: number;
  likes: number;
  comments_count?: number;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  canonical_url?: string | null;
  robots?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  focus_keyword?: string | null;
  seo_score?: number | null;
  schema_type?: string | null;
  schema_data?: Record<string, unknown> | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  image?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  post_count?: number;
  sort_order?: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  post_count?: number;
  created_at: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  email?: string | null;
  bio?: string | null;
  avatar?: string | null;
  role?: string | null;
  title?: string | null;
  website?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  github?: string | null;
  expertise?: string[] | null;
  active: boolean;
  post_count?: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  post_title?: string;
  parent_id?: string | null;
  author_name: string;
  author_email?: string | null;
  author_avatar?: string | null;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  ip_address?: string | null;
  user_agent?: string | null;
  likes?: number;
  created_at: string;
  updated_at?: string;
  replies?: Comment[];
}

export interface MediaFile {
  id: string;
  name: string;
  original_name: string;
  url: string;
  thumbnail_url?: string | null;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  mime_type: string;
  size: number;
  width?: number | null;
  height?: number | null;
  folder?: string | null;
  alt_text?: string | null;
  caption?: string | null;
  title?: string | null;
  description?: string | null;
  used_in?: number;
  created_at: string;
  updated_at?: string;
}

export interface Revision {
  id: string;
  post_id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  author_name?: string | null;
  version: number;
  change_summary?: string | null;
  created_at: string;
}

export interface BlogSettings {
  posts_per_page: number;
  show_author: boolean;
  show_date: boolean;
  show_read_time: boolean;
  show_views: boolean;
  show_share: boolean;
  show_like: boolean;
  show_related: boolean;
  show_prev_next: boolean;
  show_newsletter: boolean;
  comments_enabled: boolean;
  bookmarks_enabled: boolean;
  ratings_enabled: boolean;
  blog_layout: 'grid' | 'list' | 'masonry';
  blog_theme: 'default' | 'minimal' | 'editorial';
  comments_moderation: 'auto' | 'manual';
  auto_seo: boolean;
  newsletter_title?: string;
  newsletter_description?: string;
}

export interface ActivityLog {
  id: string;
  user_name: string;
  user_email?: string;
  user_ip?: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'login' | 'logout' | 'settings';
  resource_type: 'post' | 'category' | 'tag' | 'author' | 'comment' | 'media' | 'settings' | 'auth';
  resource_id?: string;
  resource_title?: string;
  details?: string;
  created_at: string;
}

export interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  type: '301' | '302';
  active: boolean;
  created_at: string;
  hit_count?: number;
}

export interface SEOScore {
  total: number;
  title: number;
  description: number;
  keywords: number;
  readability: number;
  links: number;
  images: number;
  suggestions: string[];
}

// ── Block Editor Types ────────────────────────────────────────────────────────
export type BlockType =
  | 'heading' | 'paragraph' | 'list' | 'checklist' | 'quote' | 'image'
  | 'gallery' | 'video' | 'audio' | 'embed' | 'table' | 'code' | 'alert'
  | 'callout' | 'button' | 'divider' | 'columns' | 'accordion' | 'faq'
  | 'html' | 'markdown';

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  hidden?: boolean;
  locked?: boolean;
}

export interface BlockEditorState {
  blocks: Block[];
  activeBlockId: string | null;
  history: Block[][];
  historyIndex: number;
}
