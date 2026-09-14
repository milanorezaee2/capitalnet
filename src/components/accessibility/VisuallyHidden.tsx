/**
 * Enterprise Visually Hidden Component
 * Hides content visually but keeps it available for screen readers
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  className,
  as: Component = 'span',
}) => {
  return (
    <Component
      className={cn(
        'sr-only',
        'absolute w-px h-px p-0 -m-px overflow-hidden',
        'whitespace-nowrap border-0',
        className
      )}
    >
      {children}
    </Component>
  );
};
