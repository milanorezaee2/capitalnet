/**
 * Enterprise Accessibility Hooks
 * Custom hooks for WCAG 2.2 AA compliance
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for managing keyboard navigation
 */
export const useKeyboardNavigation = (
  items: any[],
  onSelect: (item: any, index: number) => void,
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
  } = {}
) => {
  const { loop = true, orientation = 'vertical' } = options;
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev + 1;
            if (loop) return next >= items.length ? 0 : next;
            return Math.min(next, items.length - 1);
          });
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev - 1;
            if (loop) return next < 0 ? items.length - 1 : next;
            return Math.max(next, 0);
          });
          break;
        case 'Home':
          event.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect(items[focusedIndex], focusedIndex);
          break;
        case 'Escape':
          event.preventDefault();
          setFocusedIndex(-1);
          break;
      }
    },
    [items, focusedIndex, loop, onSelect]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { focusedIndex, setFocusedIndex };
};

/**
 * Hook for managing focus trap in modals
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Hook for managing ARIA live regions
 */
export const useAnnounce = () => {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(message);
  }, []);

  return { announcement, announce };
};

/**
 * Hook for managing reduced motion preference
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook for managing screen reader visibility
 */
export const useScreenReader = () => {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  useEffect(() => {
    // Detect screen reader through various heuristics
    const checkScreenReader = () => {
      const hasTouch = 'ontouchstart' in window;
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsScreenReaderActive(!hasTouch && hasReducedMotion);
    };

    checkScreenReader();
    window.addEventListener('resize', checkScreenReader);
    return () => window.removeEventListener('resize', checkScreenReader);
  }, []);

  return isScreenReaderActive;
};

/**
 * Hook for managing high contrast mode
 */
export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersHighContrast;
};

/**
 * Hook for managing focus visible
 */
export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    let hadKeyboardEvent = false;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        hadKeyboardEvent = true;
      }
    };

    const onMouseDown = () => {
      hadKeyboardEvent = false;
    };

    const onFocus = () => {
      setIsFocusVisible(hadKeyboardEvent);
    };

    const onBlur = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('focus', onFocus, true);
    document.addEventListener('blur', onBlur, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('focus', onFocus, true);
      document.removeEventListener('blur', onBlur, true);
    };
  }, []);

  return isFocusVisible;
};

/**
 * Hook for skip to content functionality
 */
export const useSkipToContent = () => {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        skipLinkRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return skipLinkRef;
};
