/**
 * Enterprise Timeline Component
 * Vertical and horizontal timeline for process steps
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ProcessStep } from '../../types/process';
import { StepCard } from './StepCard';

export interface TimelineProps {
  steps: ProcessStep[];
  variant?: 'vertical' | 'horizontal' | 'responsive';
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  steps,
  variant = 'vertical',
  className,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderVertical = () => (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-cyan-500" />
      
      <div className="space-y-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="relative pr-16"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Timeline dot */}
            <div className="absolute right-4 top-6 w-5 h-5 rounded-full bg-gray-900 border-2 border-indigo-500 z-10">
              <motion.div
                className="w-full h-full rounded-full bg-indigo-500"
                initial={{ scale: 0 }}
                animate={{ scale: step.status === 'completed' ? 1 : 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              />
            </div>
            
            <StepCard step={step} variant="default" />
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderHorizontal = () => (
    <div className={cn('relative overflow-x-auto pb-4', className)}>
      <div className="flex gap-6 min-w-max">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="relative flex-shrink-0 w-80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 w-6 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
            )}
            
            <StepCard step={step} variant="compact" />
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderResponsive = () => {
    if (isMobile) {
      return renderVertical();
    }
    return renderHorizontal();
  };

  switch (variant) {
    case 'vertical':
      return renderVertical();
    case 'horizontal':
      return renderHorizontal();
    case 'responsive':
      return renderResponsive();
    default:
      return renderVertical();
  }
};
