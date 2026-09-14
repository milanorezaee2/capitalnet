/**
 * Enterprise Blog Post — Context
 * Provides font-size, reading-mode, bookmark, and like state
 * to all child components without prop-drilling.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { BlogPostContextValue, FontSizeLevel } from '../types';

const BlogPostContext = createContext<BlogPostContextValue | null>(null);

export function BlogPostProvider({
  postId,
  children,
}: {
  postId: string;
  children: ReactNode;
}) {
  // ── Font size ──────────────────────────────────────────────────────────────
  const [fontSize, setFontSize] = useState<FontSizeLevel>('base');

  // ── Reading mode ───────────────────────────────────────────────────────────
  const [readingMode, setReadingMode] = useState(false);
  const toggleReadingMode = useCallback(() => setReadingMode((v) => !v), []);

  // ── Bookmark (persisted to localStorage) ──────────────────────────────────
  const BOOKMARK_KEY = `bookmark_${postId}`;
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BOOKMARK_KEY) === '1';
    } catch {
      return false;
    }
  });
  const toggleBookmark = useCallback(() => {
    setIsBookmarked((prev) => {
      const next = !prev;
      try {
        if (next) localStorage.setItem(BOOKMARK_KEY, '1');
        else localStorage.removeItem(BOOKMARK_KEY);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [BOOKMARK_KEY]);

  // ── Like / Dislike (optimistic, localStorage-backed) ───────────────────────
  const VOTE_KEY = `vote_${postId}`;
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(() => {
    try {
      const stored = localStorage.getItem(VOTE_KEY);
      if (stored === 'like' || stored === 'dislike') return stored;
    } catch {
      /* ignore */
    }
    return null;
  });
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  const vote = useCallback(
    (v: 'like' | 'dislike') => {
      setUserVote((prev) => {
        const next = prev === v ? null : v;
        try {
          if (next) localStorage.setItem(VOTE_KEY, next);
          else localStorage.removeItem(VOTE_KEY);
        } catch {
          /* ignore */
        }

        // Adjust counters optimistically
        if (prev === 'like') setLikeCount((c) => Math.max(0, c - 1));
        if (prev === 'dislike') setDislikeCount((c) => Math.max(0, c - 1));
        if (next === 'like') setLikeCount((c) => c + 1);
        if (next === 'dislike') setDislikeCount((c) => c + 1);

        return next;
      });
    },
    [VOTE_KEY]
  );

  const value: BlogPostContextValue = {
    fontSize,
    setFontSize,
    readingMode,
    toggleReadingMode,
    isBookmarked,
    toggleBookmark,
    likeCount,
    dislikeCount,
    userVote,
    vote,
  };

  return (
    <BlogPostContext.Provider value={value}>
      {children}
    </BlogPostContext.Provider>
  );
}

export function useBlogPostCtx(): BlogPostContextValue {
  const ctx = useContext(BlogPostContext);
  if (!ctx) throw new Error('useBlogPostCtx must be used inside BlogPostProvider');
  return ctx;
}
