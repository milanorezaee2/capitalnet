/**
 * Enterprise Error State Component
 * Error display with retry functionality
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  className,
}) => {
  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center p-8 text-center', className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
      >
        <AlertCircle className="w-8 h-8 text-red-400" />
      </motion.div>
      
      <motion.h3
        className="text-lg font-semibold text-white mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        خطا در بارگذاری
      </motion.h3>
      
      <motion.p
        className="text-gray-400 text-sm mb-6 max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>
      
      {onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={onRetry}
          >
            تلاش مجدد
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
