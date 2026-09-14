// ─── Blog Types (shared) ─────────────────────────────────────────────────────
// این فایل تایپ‌های مشترک بلاگ را export می‌کند که توسط کامپوننت‌های قدیمی
// مثل BlogArchivePages و RelatedPosts استفاده می‌شود.

export type BlogCategory =
  | 'investment'
  | 'strategy'
  | 'case-study'
  | 'market-analysis'
  | 'negotiation'
  | 'financial-modeling';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: BlogCategory;
  tags: string[];
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
    bio?: string;
  };
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  views?: number;
  likes?: number;
  image?: string;
  bookmarked?: boolean;
  relatedPosts?: string[];
}
