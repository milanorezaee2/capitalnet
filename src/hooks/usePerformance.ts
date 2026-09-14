/**
 * Enterprise Performance Hooks
 * Custom hooks for performance optimization
 */

import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Hook for lazy loading images
 */
export const useLazyImage = (src: string, options?: IntersectionObserverInit) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setImageSrc(src);
        observer.disconnect();
      }
    }, options);

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, options]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Failed to load image');
  }, []);

  return { imgRef, imageSrc, isLoading, error, handleLoad, handleError };
};

/**
 * Hook for debouncing values
 */
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling functions
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  ) as T;
};

/**
 * Hook for intersection observer
 */
export const useIntersectionObserver = (
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [options, hasIntersected]);

  return { elementRef, isIntersecting, hasIntersected };
};

/**
 * Hook for measuring element size
 */
export const useElementSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    resizeObserver.observe(elementRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return { elementRef, size };
};

/**
 * Hook for measuring scroll position
 */
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener('scroll', updatePosition, { passive: true });
    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return scrollPosition;
};

/**
 * Hook for prefetching data
 */
export const usePrefetch = (url: string, condition: boolean = true) => {
  useEffect(() => {
    if (!condition) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [url, condition]);
};

/**
 * Hook for preloading images
 */
export const usePreloadImages = (urls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    urls.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages((prev) => new Set(prev).add(url));
      };
      img.onerror = () => {
        setFailedImages((prev) => new Set(prev).add(url));
      };
      img.src = url;
    });
  }, [urls]);

  return { loadedImages, failedImages };
};

/**
 * Hook for virtual scrolling
 */
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex,
  };
};

/**
 * Hook for memoizing expensive computations
 */
export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const memoizedRef = useRef<T>();

  if (!memoizedRef.current) {
    memoizedRef.current = factory();
  }

  useEffect(() => {
    memoizedRef.current = factory();
  }, deps);

  return memoizedRef.current;
};

/**
 * Hook for detecting when component is visible
 */
export const useIsVisible = (options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { elementRef, isVisible };
};

/**
 * Hook for managing resource hints
 */
export const useResourceHints = () => {
  const addPreload = useCallback((href: string, as: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }, []);

  const addPrefetch = useCallback((href: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }, []);

  const addPreconnect = useCallback((href: string) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    document.head.appendChild(link);
  }, []);

  const addDNSPrefetch = useCallback((href: string) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    document.head.appendChild(link);
  }, []);

  return { addPreload, addPrefetch, addPreconnect, addDNSPrefetch };
};
