/**
 * Enterprise Tag Component
 * Removable tag for filtering and categorization
 */

import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface TagProps {
  text: string;
  removable?: boolean;
  onRemove?: () => void;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  text,
  removable = false,
  onRemove,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const baseStyles = 'inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200';

  const variants = {
    default: 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600',
    primary: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50',
    secondary: 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:border-purple-500/50',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <motion.span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <span>{text}</span>
      {removable && (
        <button
          onClick={onRemove}
          className="p-0.5 rounded hover:bg-gray-700/50 transition-colors"
          aria-label={`Remove ${text}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.span>
  );
};
