/**
 * FAQSection
 * Accordion-based FAQ with expand/collapse animation.
 * Emits FAQ Schema (JSON-LD) via a sibling script tag.
 * WCAG: role=region + aria-expanded.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { FaqItem } from '../types';

interface Props {
  items: FaqItem[];
}

export default function FAQSection({ items }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!items.length) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <section aria-labelledby="faq-heading" className="mt-12">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <h2
        id="faq-heading"
        className="flex items-center gap-2 text-2xl font-black text-white mb-6 pb-3 border-b border-white/10"
      >
        <HelpCircle size={22} className="text-teal-400" aria-hidden="true" />
        سوالات متداول
      </h2>

      <dl className="space-y-3">
        {items.map((faq, idx) => {
          const isOpen = openIdx === idx;
          const headingId = `faq-q-${idx}`;
          const bodyId = `faq-a-${idx}`;

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-colors duration-150 ${
                isOpen
                  ? 'border-teal-500/30 bg-teal-500/5'
                  : 'border-white/8 bg-white/[0.02] hover:border-white/15'
              }`}
            >
              <dt>
                <button
                  id={headingId}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right focus:outline-none focus:ring-2 focus:ring-teal-500/40 rounded-2xl"
                  aria-expanded={isOpen}
                  aria-controls={bodyId}
                >
                  <span className="font-semibold text-white text-sm md:text-base">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.22 }}
                    className="flex-shrink-0 text-teal-400"
                    aria-hidden="true"
                  >
                    <ChevronDown size={18} />
                  </motion.span>
                </button>
              </dt>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.dd
                    id={bodyId}
                    role="region"
                    aria-labelledby={headingId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-white/60 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.dd>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
