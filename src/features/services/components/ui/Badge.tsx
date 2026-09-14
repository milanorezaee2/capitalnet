// ─── Badge Component ─────────────────────────────────────────────────────────────────
// Small badge for status, tags, and labels

import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const badgeVariants = {
  default: 'bg-white/10 text-white border border-white/20',
  success: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-200 border border-amber-500/30',
  error: 'bg-red-500/20 text-red-200 border border-red-500/30',
  info: 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30',
  accent: 'bg-violet-500/20 text-violet-200 border border-violet-500/30',
};

const sizeVariants = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const Badge = ({ variant = 'default', size = 'md', children, className, ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-semibold transition-colors',
        badgeVariants[variant],
        sizeVariants[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
