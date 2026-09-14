/**
 * Enterprise Tooltip Component
 * Accessible tooltip with keyboard navigation
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  const positions = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const arrowPositions = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-t-8 border-x-transparent border-x-4 border-b-0',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-b-8 border-x-transparent border-x-4 border-t-0',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-l-8 border-y-transparent border-y-4 border-r-0',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-r-8 border-y-transparent border-y-4 border-l-0',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-xl whitespace-nowrap',
              positions[position],
              className
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="tooltip"
          >
            {content}
            <div
              className={cn(
                'absolute w-0 h-0',
                arrowPositions[position]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
