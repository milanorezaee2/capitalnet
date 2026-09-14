/**
 * Enterprise FAQ Component
 * Accordion-style FAQ with smooth animations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FAQ } from '../../types/process';

export interface FAQProps {
  faq: FAQ;
  defaultOpen?: boolean;
  className?: string;
}

export const FAQItem: React.FC<FAQProps> = ({
  faq,
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      className={cn(
        'bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden',
        isOpen && 'border-indigo-500/30',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-right hover:bg-gray-800/50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className={cn(
          'text-white font-semibold text-base pr-4',
          isOpen && 'text-indigo-400'
        )}>
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5 pt-0 border-t border-gray-800/50">
              <p className="text-gray-400 text-sm leading-relaxed pr-4">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export interface AccordionProps {
  items: FAQ[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className,
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter(item => item.featured).map(item => item.id))
  );

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (allowMultiple) {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        if (newSet.has(id)) {
          newSet.clear();
        } else {
          newSet.clear();
          newSet.add(id);
        }
      }
      return newSet;
    });
  };

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((faq, index) => (
        <motion.div
          key={faq.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <FAQItem
            faq={faq}
            defaultOpen={openItems.has(faq.id)}
            className="cursor-pointer"
          />
        </motion.div>
      ))}
    </div>
  );
};
