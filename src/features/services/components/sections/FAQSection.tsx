// ─── FAQ Section — Clean Accordion ──────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import type { FAQ as FAQType } from '../../types/enterprise';
import { useState } from 'react';

import { t } from '@/i18n';


export interface FAQSectionProps {
  faqs: FAQType[];
}

export const FAQSection = ({ faqs }: FAQSectionProps) => {
  const [open, setOpen] = useState<number | null>(0);
  const toggle = (i: number) => setOpen(open === i ? null : i);

  return (
    <section id="faq" className="py-24 md:py-32 bg-[#111c2d]">
      <div className="mx-auto max-w-3xl px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-teal-400"
        >
          {t("سوالات متداول")}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-4xl font-black text-white md:text-5xl"
        >
          {t("پرسش و پاسخ")}
        </motion.h2>

        <div className="divide-y divide-white/6">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-start justify-between gap-4 py-5 text-right"
              >
                <span className={`text-base font-bold transition-colors ${open === i ? 'text-white' : 'text-slate-300'}`}>
                  {faq.question}
                </span>
                <span className="mt-0.5 shrink-0">
                  {open === i
                    ? <Minus size={18} className="text-teal-400" />
                    : <Plus size={18} className="text-slate-500" />}
                </span>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-sm leading-relaxed text-slate-400">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
