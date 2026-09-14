// ─── CaseStudies Section — Cards with Real Images ───────────────────────────
import { motion } from 'framer-motion';
import { Target, Lightbulb, Award } from 'lucide-react';
import type { CaseStudy } from '../../types/enterprise';

import { t } from '@/i18n';


export interface CaseStudiesProps {
  studies: CaseStudy[];
}

const CASE_IMAGES = [
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80&auto=format&fit=crop', // investment dashboard ROI
  'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&q=80&auto=format&fit=crop', // data security / risk
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80&auto=format&fit=crop', // trading platform
  'https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=800&q=80&auto=format&fit=crop', // financial analytics
];

const ACCENTS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

const CaseStudyCard = ({ study, index }: { study: CaseStudy; index: number }) => {
  const img = CASE_IMAGES[index % CASE_IMAGES.length];
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="group relative rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden transition-all hover:-translate-y-1 hover:border-white/15"
    >
      {/* hero image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={img}
          alt={study.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1829] via-[#0d1829]/60 to-transparent" />

        {/* metric badge */}
        {study.metrics && study.metrics.length > 0 && (
          <div
            className="absolute top-4 end-4 rounded-full px-4 py-1.5 text-sm font-black backdrop-blur-sm border"
            style={{ color: accent, borderColor: `${accent}50`, background: `${accent}18` }}
          >
            {study.metrics[0].value}
          </div>
        )}

        {/* title over image */}
        <div className="absolute bottom-4 end-4 start-4">
          <h3 className="text-xl font-black text-white leading-tight">{study.title}</h3>
          <p className="mt-1 text-xs text-slate-400">{study.client} · {study.industry}</p>
        </div>
      </div>

      {/* details */}
      <div className="p-6 space-y-4">
        {[
          { icon: Target, label: t("مشکل"), text: study.challenge, color: '#f43f5e' },
          { icon: Lightbulb, label: t("راه‌حل"), text: study.solution, color: '#f59e0b' },
          { icon: Award, label: t("نتیجه"), text: study.results, color: '#10b981' },
        ].map(({ icon: Icon, label, text, color }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon size={16} className="mt-0.5 shrink-0" style={{ color }} />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
              <p className="mt-0.5 text-sm text-slate-400 leading-relaxed">{text}</p>
            </div>
          </div>
        ))}

        <div className="pt-2 h-px" style={{ background: `linear-gradient(to left, ${accent}, transparent)` }} />
      </div>
    </motion.div>
  );
};

export const CaseStudies = ({ studies }: CaseStudiesProps) => (
  <section id="case-studies" className="py-24 md:py-32 bg-[#0d1829]">
    <div className="mx-auto max-w-7xl px-8">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-indigo-400"
      >
        {t("نتایج واقعی")}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14 text-4xl font-black text-white md:text-5xl"
      >
        {t("مطالعات موردی")}
      </motion.h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {studies.map((s, i) => (
          <CaseStudyCard key={s.id} study={s} index={i} />
        ))}
      </div>
    </div>
  </section>
);
