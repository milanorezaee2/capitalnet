/**
 * Enterprise Deliverable Card Component
 * Display project deliverables and outputs
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Code, Palette, BarChart, BookOpen, Users, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Deliverable } from '../../types/process';
import { Badge } from '../ui/Badge';

export interface DeliverableCardProps {
  deliverable: Deliverable;
  className?: string;
}

export const DeliverableCard: React.FC<DeliverableCardProps> = ({
  deliverable,
  className,
}) => {
  const getIcon = () => {
    switch (deliverable.type) {
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'code':
        return <Code className="w-5 h-5" />;
      case 'design':
        return <Palette className="w-5 h-5" />;
      case 'report':
        return <BarChart className="w-5 h-5" />;
      case 'training':
        return <BookOpen className="w-5 h-5" />;
      case 'meeting':
        return <Users className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    const labels = {
      document: 'مستند',
      code: 'کد',
      design: 'طراحی',
      report: 'گزارش',
      training: 'آموزش',
      meeting: 'جلسه',
      other: 'سایر',
    };
    return labels[deliverable.type];
  };

  const getVariant = () => {
    switch (deliverable.type) {
      case 'document':
        return 'primary';
      case 'code':
        return 'secondary';
      case 'design':
        return 'accent';
      case 'report':
        return 'info';
      default:
        return 'primary';
    }
  };

  return (
    <motion.div
      className={cn(
        'card-glass rounded-xl p-5 group',
        !deliverable.included && 'opacity-50',
        className
      )}
      initial={{ opacity: 0, y:20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center',
          deliverable.type === 'document' && 'from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400',
          deliverable.type === 'code' && 'from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400',
          deliverable.type === 'design' && 'from-pink-500/20 to-rose-500/20 border border-pink-500/30 text-pink-400',
          deliverable.type === 'report' && 'from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400',
          deliverable.type === 'training' && 'from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400',
          deliverable.type === 'meeting' && 'from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400',
        )}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="text-white font-semibold mb-1">{deliverable.title}</h4>
              <div className="flex items-center gap-2">
                <Badge text={getTypeLabel()} variant={getVariant() as any} size="sm" />
                {deliverable.format && (
                  <span className="text-gray-500 text-xs">{deliverable.format}</span>
                )}
              </div>
            </div>
            {deliverable.downloadUrl && (
              <a
                href={deliverable.downloadUrl}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
                download
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
          
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{deliverable.description}</p>
          
          {deliverable.quantity && (
            <span className="text-gray-500 text-xs">
              تعداد: {deliverable.quantity}
            </span>
          )}
          
          {deliverable.specifications && deliverable.specifications.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {deliverable.specifications.slice(0, 3).map((spec, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-800/50 rounded text-gray-400 text-xs"
                >
                  {spec}
                </span>
              ))}
              {deliverable.specifications.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{deliverable.specifications.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {deliverable.preview && (
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-800">
          <img
            src={deliverable.preview.url}
            alt={deliverable.title}
            className="w-full h-32 object-cover"
          />
        </div>
      )}
    </motion.div>
  );
};
