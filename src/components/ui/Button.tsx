/**
 * Enterprise Button Component
 * Reusable, accessible, themeable button with multiple variants
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed btn-press';

    const variants = {
      primary: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-indigo-500',
      secondary: 'bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 shadow-lg hover:shadow-xl hover:scale-105 focus:ring-amber-500',
      outline: 'border-2 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 focus:ring-white',
      ghost: 'bg-transparent text-white/80 hover:bg-white/10 hover:text-white focus:ring-white',
      link: 'bg-transparent text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline focus:ring-cyan-400 p-0',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-base rounded-xl',
      lg: 'px-6 py-3 text-lg rounded-xl',
      xl: 'px-8 py-4 text-xl rounded-2xl',
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        {...props}
      >
        {loading && (
          <svg
            className={cn('animate-spin', iconSizes[size], 'rtl:-ml-1 ml-0 rtl:mr-2 mr-2')}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className={cn(iconSizes[size], 'rtl:ml-2 mr-0 rtl:mr-0 ml-2 flex items-center')}>
            {icon}
          </span>
        )}
        
        <span>{children}</span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span className={cn(iconSizes[size], 'rtl:mr-2 ml-0 rtl:ml-0 mr-2 flex items-center')}>
            {icon}
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
