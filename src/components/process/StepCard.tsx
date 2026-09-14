/**
 * Enterprise Step Card Component
 * Interactive card for displaying process steps
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Clock, CheckCircle, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProcessStep } from '../../types/process';
import { Badge } from '../ui/Badge';

export interface StepCardProps {
  step: ProcessStep;
  expanded?: boolean;
  onToggle?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export const StepCard: React.FC<StepCardProps> = ({
  step,
  expanded = false,
  onToggle,
  variant = 'default',
  className,
}) => {
  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-amber-400 animate-pulse" />;
      default:
        return <Circle className="w-5 h-5 text-gray-600" />;
    }
  };

  const renderCompact = () => (
    <motion.div
      className={cn(
        'p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-gray-700 transition-all duration-300',
        className
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
          <span className="text-indigo-400 font-bold">{step.number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold mb-1">{step.title}</h4>
          <p className="text-gray-400 text-sm line-clamp-2">{step.description}</p>
        </div>
        {getStatusIcon()}
      </div>
    </motion.div>
  );

  const renderDefault = () => (
    <motion.div
      className={cn(
        'card-glass rounded-2xl overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="p-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
              {step.icon ? (
                <span className="text-2xl">{step.icon}</span>
              ) : (
                <span className="text-indigo-400 font-bold text-lg">{step.number}</span>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-white font-bold text-lg">{step.title}</h3>
              {step.status && (
                <Badge
                  text={step.status === 'completed' ? 'تکمیل شده' : step.status === 'in-progress' ? 'در حال انجام' : 'در انتظار'}
                  variant={step.status === 'completed' ? 'success' : step.status === 'in-progress' ? 'warning' : 'primary'}
                  size="sm"
                />
              )}
            </div>
            <p className="text-gray-400 text-sm mb-3">{step.description}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                {step.duration}
              </span>
              {step.outputs.length > 0 && (
                <span className="text-gray-500">
                  {step.outputs.length} خروجی
                </span>
              )}
            </div>
          </div>
          
          <motion.div
            className="flex-shrink-0"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </div>
      </div>
      
      <motion.div
        className="overflow-hidden"
        initial={{ height: 0 }}
        animate={{ height: expanded ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-6 pb-6 pt-0 border-t border-gray-800/50">
          {step.detailedDescription && (
            <p className="text-gray-300 text-sm mb-4">{step.detailedDescription}</p>
          )}
          
          {step.outputs.length > 0 && (
            <div className="mb-4">
              <h5 className="text-white font-semibold text-sm mb-2">خروجی‌ها:</h5>
              <ul className="space-y-1">
                {step.outputs.map((output, index) => (
                  <li key={index} className="text-gray-400 text-sm flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {output}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {step.responsibilities.length > 0 && (
            <div>
              <h5 className="text-white font-semibold text-sm mb-2">مسئولیت‌ها:</h5>
              <ul className="space-y-1">
                {step.responsibilities.map((responsibility, index) => (
                  <li key={index} className="text-gray-400 text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-2" />
                    {responsibility}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  const renderDetailed = () => (
    <motion.div
      className={cn(
        'card-glass rounded-2xl overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {step.image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={step.image.url}
            alt={step.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
              {step.icon ? (
                <span className="text-3xl">{step.icon}</span>
              ) : (
                <span className="text-indigo-400 font-bold text-xl">{step.number}</span>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-white font-bold text-xl">{step.title}</h3>
              {step.status && (
                <Badge
                  text={step.status === 'completed' ? 'تکمیل شده' : step.status === 'in-progress' ? 'در حال انجام' : 'در انتظار'}
                  variant={step.status === 'completed' ? 'success' : step.status === 'in-progress' ? 'warning' : 'primary'}
                  size="sm"
                />
              )}
            </div>
            <p className="text-gray-400">{step.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <span className="text-gray-500 text-sm">مدت زمان</span>
            <p className="text-white font-semibold">{step.duration}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <span className="text-gray-500 text-sm">تعداد خروجی</span>
            <p className="text-white font-semibold">{step.outputs.length}</p>
          </div>
        </div>
        
        {step.detailedDescription && (
          <div className="mb-4">
            <h5 className="text-white font-semibold mb-2">توضیحات کامل:</h5>
            <p className="text-gray-300 text-sm">{step.detailedDescription}</p>
          </div>
        )}
        
        {step.outputs.length > 0 && (
          <div className="mb-4">
            <h5 className="text-white font-semibold mb-2">خروجی‌ها:</h5>
            <div className="flex flex-wrap gap-2">
              {step.outputs.map((output, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm"
                >
                  {output}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {step.responsibilities.length > 0 && (
          <div>
            <h5 className="text-white font-semibold mb-2">مسئولیت‌ها:</h5>
            <ul className="space-y-2">
              {step.responsibilities.map((responsibility, index) => (
                <li key={index} className="text-gray-400 text-sm flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
                  {responsibility}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );

  switch (variant) {
    case 'compact':
      return renderCompact();
    case 'detailed':
      return renderDetailed();
    default:
      return renderDefault();
  }
};
