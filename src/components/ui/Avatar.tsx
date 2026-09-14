/**
 * Enterprise Avatar Component
 * User avatar with fallback and multiple sizes
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!src || imageError) {
    return (
      <motion.div
        className={cn(
          'rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white',
          sizes[size],
          className
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {fallback ? getInitials(fallback) : <User className={size === 'xl' ? 'w-6 h-6' : 'w-4 h-4'} />}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn('rounded-full overflow-hidden', sizes[size], className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {isLoading && (
        <div className="w-full h-full bg-gray-800 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={cn('w-full h-full object-cover', isLoading && 'hidden')}
        onLoad={() => setIsLoading(false)}
        onError={() => setImageError(true)}
      />
    </motion.div>
  );
};
