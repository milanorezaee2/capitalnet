/**
 * useReadingProgress
 * Returns a 0–100 value representing how far the user has scrolled
 * through a referenced element (defaults to the full document).
 */
import { useState, useEffect, useRef } from 'react';

export function useReadingProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollable = scrollHeight - clientHeight;
      if (scrollable <= 0) { setProgress(100); return; }
      setProgress(Math.min(100, Math.round((scrollTop / scrollable) * 100)));
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return progress;
}

/**
 * useTOCActiveSection
 * Watches IntersectionObserver on heading elements and returns the
 * id of the currently-visible section.
 */
export function useTOCActiveSection(ids: string[]): string {
  const [active, setActive] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!ids.length) return;

    observerRef.current?.disconnect();
    const visibleMap = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleMap.set(entry.target.id, entry.intersectionRatio);
        });

        // Prefer the topmost (highest in document) visible section
        let bestId = '';
        let bestTop = Infinity;
        visibleMap.forEach((ratio, id) => {
          if (ratio > 0) {
            const el = document.getElementById(id);
            if (el) {
              const top = el.getBoundingClientRect().top;
              if (top >= 0 && top < bestTop) {
                bestTop = top;
                bestId = id;
              }
            }
          }
        });

        if (bestId) setActive(bestId);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [ids.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return active;
}

/**
 * useCopyToClipboard
 * Returns [copied, copy(text)] where `copied` auto-resets after a delay.
 */
export function useCopyToClipboard(resetMs = 2000): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), resetMs);
    });
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return [copied, copy];
}

/**
 * useComments
 * In-memory comment store (swap .addComment / .reply / etc. for real API calls).
 */
export interface CommentData {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  replies: CommentData[];
}

export function useComments(_postId: string) {
  const [comments, setComments] = useState<CommentData[]>([]);

  const addComment = (author: string, content: string) => {
    if (!author.trim() || !content.trim()) return;
    setComments((prev) => [
      {
        id: crypto.randomUUID(),
        author,
        content,
        createdAt: new Date().toLocaleDateString('fa-IR'),
        likes: 0,
        liked: false,
        replies: [],
      },
      ...prev,
    ]);
  };

  const addReply = (commentId: string, author: string, content: string) => {
    if (!author.trim() || !content.trim()) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: crypto.randomUUID(),
                  author,
                  content,
                  createdAt: new Date().toLocaleDateString('fa-IR'),
                  likes: 0,
                  liked: false,
                  replies: [],
                },
              ],
            }
          : c
      )
    );
  };

  const likeComment = (commentId: string, _parentId?: string) => {
    const toggle = (c: CommentData): CommentData => {
      if (c.id === commentId) {
        return {
          ...c,
          liked: !c.liked,
          likes: c.liked ? c.likes - 1 : c.likes + 1,
        };
      }
      return { ...c, replies: c.replies.map(toggle) };
    };
    setComments((prev) => prev.map(toggle));
  };

  const deleteComment = (commentId: string) => {
    const remove = (list: CommentData[]): CommentData[] =>
      list.filter((c) => c.id !== commentId).map((c) => ({ ...c, replies: remove(c.replies) }));
    setComments((prev) => remove(prev));
  };

  return { comments, addComment, addReply, likeComment, deleteComment };
}
