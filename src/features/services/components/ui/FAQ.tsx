// ─── FAQ Component ───────────────────────────────────────────────────────────────────
// Accordion-style FAQ with smooth animations

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQProps {
  items: FAQItem[];
}

export const FAQ = ({ items }: FAQProps) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="rounded-2xl border border-white/10 bg-slate-950/40 transition-colors hover:border-white/20"
        >
          <button
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right"
            onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
            aria-expanded={openIndex === index}
          >
            <span className="text-lg font-semibold text-white">{item.question}</span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="shrink-0 text-slate-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="px-6 pb-6 text-slate-300">{item.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
