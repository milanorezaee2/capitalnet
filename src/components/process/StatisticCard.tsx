/**
 * Enterprise Statistic Card Component
 * Animated counter for displaying statistics
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Statistic } from '../../types/process';

export interface StatisticCardProps {
  statistic: Statistic;
  animate?: boolean;
  className?: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  statistic,
  animate = true,
  className,
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !animate) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = statistic.value / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setCount(Math.floor(stepValue * currentStep));
      } else {
        setCount(statistic.value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, animate, statistic.value]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        'card-glass rounded-2xl p-6 text-center',
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {statistic.icon && (
        <div className="flex justify-center mb-4">
          <div className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center text-2xl',
            statistic.color === 'indigo' && 'bg-indigo-500/20 text-indigo-400',
            statistic.color === 'purple' && 'bg-purple-500/20 text-purple-400',
            statistic.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400',
            statistic.color === 'amber' && 'bg-amber-500/20 text-amber-400',
            statistic.color === 'cyan' && 'bg-cyan-500/20 text-cyan-400',
            !statistic.color && 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400',
          )}>
            {statistic.icon}
          </div>
        </div>
      )}
      
      <div className="mb-2">
        <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {statistic.prefix}
          {animate ? formatNumber(count) : formatNumber(statistic.value)}
          {statistic.suffix}
        </span>
      </div>
      
      <h3 className="text-white font-semibold text-lg mb-1">{statistic.label}</h3>
      
      {statistic.description && (
        <p className="text-gray-400 text-sm">{statistic.description}</p>
      )}
    </motion.div>
  );
};
