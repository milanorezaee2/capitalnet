/**
 * Enterprise Card Component
 * Reusable card with glass morphism effect
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  hover = true,
  className,
  onClick,
}) => {
  const baseStyles = 'rounded-2xl p-6 transition-all duration-300';

  const variants = {
    default: 'bg-gray-900/50 border border-gray-800',
    glass: 'card-glass',
    elevated: 'bg-gray-900/80 border border-gray-700 shadow-xl',
    outlined: 'bg-transparent border-2 border-gray-700',
  };

  const hoverStyles = hover
    ? 'hover:scale-[1.02] hover:border-gray-600 cursor-pointer'
    : '';

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={cn(baseStyles, variants[variant], hoverStyles, className)}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </Component>
  );
};
