/**
 * Enterprise Live Region ComponentAnnounces dynamic content changes to screen readers
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  priority = 'polite',
  className,
}) => {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className={cn('sr-only', className)}
      role="status"
    >
      {message}
    </div>
  );
};
