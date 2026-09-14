// ─── Card Component ─────────────────────────────────────────────────────────────────
// Modern glass-morphism card with hover effects

import { motion } from 'framer-motion';
import { type ReactNode, type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  hover?: boolean;
  children: ReactNode;
}

const cardVariants = {
  default: 'bg-slate-950/70 border border-white/10',
  glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
  elevated: 'bg-slate-900/80 border border-white/10 shadow-xl',
  bordered: 'bg-transparent border border-white/20',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = false, children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-[28px] p-6 transition-all',
          cardVariants[variant],
          hover && 'hover:-translate-y-1 hover:border-white/20',
          className
        )}
        whileHover={hover ? { y: -4 } : undefined}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
