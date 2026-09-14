// ─── Benefits Section — Cards with Real Images ──────────────────────────────
import { motion } from 'framer-motion';
import type { Benefit } from '../../types/enterprise';

import { t } from '@/i18n';


export interface BenefitsProps {
  benefits: Benefit[];
}

// Curated Unsplash images relevant to each benefit topic (finance/investment)
const BENEFIT_IMAGES = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80&auto=format&fit=crop', // risk management / charts
  'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=600&q=80&auto=format&fit=crop', // profit growth
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&auto=format&fit=crop', // automation / time
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&q=80&auto=format&fit=crop', // global market
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80&auto=format&fit=crop', // support / team
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80&auto=format&fit=crop', // training / education
];

const ACCENTS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#6366f1'];

const BenefitCard = ({ benefit, index }: { benefit: Benefit; index: number }) => {
  const img = BENEFIT_IMAGES[index % BENEFIT_IMAGES.length];
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group relative rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden transition-all hover:-translate-y-1 hover:border-white/15"
    >
      {/* image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={img}
          alt={benefit.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* dark overlay + accent tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1829] via-[#0d1829]/40 to-transparent" />
        <div className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ background: `linear-gradient(135deg, ${accent}, transparent)` }} />
        {/* accent dot */}
        <div className="absolute top-3 right-3 h-2 w-2 rounded-full" style={{ background: accent }} />
      </div>

      <div className="p-6">
        <h3 className="text-lg font-black text-white mb-2">{benefit.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
        <div className="mt-5 h-px" style={{ background: `linear-gradient(to left, ${accent}, transparent)` }} />
      </div>
    </motion.div>
  );
};

export const Benefits = ({ benefits }: BenefitsProps) => (
  <section id="benefits" className="py-24 md:py-32 bg-[#0d1829]">
    <div className="mx-auto max-w-7xl px-8">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-cyan-500"
      >
        {t("مزایا")}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14 text-4xl font-black text-white md:text-5xl"
      >
        {t("مزایای کلیدی")}
      </motion.h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b, i) => (
          <BenefitCard key={b.id} benefit={b} index={i} />
        ))}
      </div>
    </div>
  </section>
);
