// ─── Deliverables Section — Editorial Dark Style ─────────────────────────────
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { Deliverable } from '../../types/enterprise';

import { t } from '@/i18n';


export interface DeliverablesProps {
  items: Deliverable[];
}

const ACCENTS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#6366f1'];

const DeliverableRow = ({ item, index }: { item: Deliverable; index: number }) => {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
      className="group flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.025] px-5 py-4 transition-all hover:border-white/15 hover:bg-white/[0.04]"
    >
      {/* check icon */}
      <CheckCircle2 size={20} className="shrink-0" style={{ color: accent }} />

      {/* title */}
      <p className="flex-1 text-base font-bold text-white">{item.title}</p>

      {/* format badge */}
      {item.format && (
        <span
          className="hidden rounded-full border px-3 py-0.5 text-xs font-bold sm:block"
          style={{ color: accent, borderColor: `${accent}35`, background: `${accent}12` }}
        >
          {item.format}
        </span>
      )}
    </motion.div>
  );
};

export const Deliverables = ({ items }: DeliverablesProps) => (
  <section id="deliverables" className="py-24 md:py-32 bg-[#0d1829]">
    <div className="mx-auto max-w-7xl px-8">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400"
      >
        {t("خروجی‌ها")}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-4xl font-black text-white md:text-5xl"
      >
        {t("آنچه تحویل می‌گیرید")}
      </motion.h2>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <DeliverableRow key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  </section>
);
