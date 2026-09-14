/**
 * Enterprise Skip Link Component
 * Allows keyboard users to skip navigation
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className,
}) => {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600',
        'focus:text-white focus:rounded-lg focus:font-semibold',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500',
        'transition-all duration-200',
        className
      )}
    >
      {children}
    </a>
  );
};
