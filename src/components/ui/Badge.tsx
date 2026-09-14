/**
 * Enterprise Badge Component
 * Reusable badge for status, categories, and labels
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'md',
  icon,
  dot = false,
  className,
}) => {
  const baseStyles = 'inline-flex items-center gap-2 font-semibold rounded-full border backdrop-blur-sm';

  const variants = {
    primary: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    secondary: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    accent: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const dotColors = {
    primary: 'bg-indigo-400',
    secondary: 'bg-purple-400',
    accent: 'bg-amber-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
    info: 'bg-cyan-400',
  };

  return (
    <motion.span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {dot && (
        <span
          className={cn(
            'w-2 h-2 rounded-full animate-pulse',
            dotColors[variant]
          )}
        />
      )}
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{text}</span>
    </motion.span>
  );
};
