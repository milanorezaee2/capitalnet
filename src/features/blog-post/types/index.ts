/**
 * Enterprise Blog Post Feature — Type Definitions
 * Centralised type layer for the entire blog-post feature module.
 */

// ─── Re-export from global API layer ─────────────────────────────────────────
export type { AppBlogPost } from '../../../lib/blogApi';

// ─── Enriched author for the full author card ─────────────────────────────────
export interface BlogAuthorFull {
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  expertise?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  articleCount?: number;
}

// ─── Table of Contents ────────────────────────────────────────────────────────
export interface TocItem {
  id: string;
  title: string;
  level: 2 | 3 | 4;
  children?: TocItem[];
}

// ─── Comment system ────────────────────────────────────────────────────────────
export interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  replies?: Comment[];
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
export interface FaqItem {
  question: string;
  answer: string;
}

// ─── Source / Reference ───────────────────────────────────────────────────────
export interface SourceItem {
  title: string;
  url?: string;
  author?: string;
  year?: string;
}

// ─── Alert / Callout box types ────────────────────────────────────────────────
export type AlertVariant = 'info' | 'warning' | 'error' | 'success' | 'tip';

// ─── Font size controls ───────────────────────────────────────────────────────
export type FontSizeLevel = 'sm' | 'base' | 'lg' | 'xl';

// ─── Theme mode ───────────────────────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark' | 'system';

// ─── Share platform ───────────────────────────────────────────────────────────
export type SharePlatform =
  | 'telegram'
  | 'whatsapp'
  | 'facebook'
  | 'linkedin'
  | 'twitter'
  | 'copy';

// ─── Gallery item ─────────────────────────────────────────────────────────────
export interface GalleryItem {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

// ─── Video block ──────────────────────────────────────────────────────────────
export interface VideoBlock {
  url: string;
  title?: string;
  poster?: string;
}

// ─── Prev / Next navigation ───────────────────────────────────────────────────
export interface AdjacentPost {
  title: string;
  slug: string;
  category: string;
  readTime: string;
  image?: string;
}

// ─── Blog post context bag passed down through the feature ────────────────────
export interface BlogPostContextValue {
  fontSize: FontSizeLevel;
  setFontSize: (s: FontSizeLevel) => void;
  readingMode: boolean;
  toggleReadingMode: () => void;
  isBookmarked: boolean;
  toggleBookmark: () => void;
  likeCount: number;
  dislikeCount: number;
  userVote: 'like' | 'dislike' | null;
  vote: (v: 'like' | 'dislike') => void;
}
