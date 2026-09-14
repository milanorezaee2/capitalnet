// ─── Technologies Section — Editorial Dark Style ──────────────────────────────
import { motion } from 'framer-motion';
import type { Technology } from '../../types/enterprise';

import { t as tr } from '@/i18n';


export interface TechnologiesProps {
  technologies: Technology[];
}

// Colour map by category
const CATEGORY_ACCENTS: Record<string, string> = {
  'AI/ML': '#8b5cf6',
  Frontend: '#06b6d4',
  Backend: '#10b981',
  Database: '#f59e0b',
  Cache: '#f43f5e',
  Cloud: '#3b82f6',
  DevOps: '#64748b',
};

const DEFAULT_ACCENT = '#94a3b8';

export const Technologies = ({ technologies }: TechnologiesProps) => (
  <section id="technologies" className="py-24 md:py-32 bg-[#111c2d]">
    <div className="mx-auto max-w-7xl px-8">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-400"
      >
        {tr("تکنولوژی‌ها")}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-4xl font-black text-white md:text-5xl"
      >
        {tr("ابزارها و فناوری‌ها")}
      </motion.h2>

      {/* group by category */}
      {(() => {
        const grouped: Record<string, Technology[]> = {};
        technologies.forEach((t) => {
          const cat = t.category || 'Other';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(t);
        });

        return Object.entries(grouped).map(([cat, techs], groupIndex) => {
          const accent = CATEGORY_ACCENTS[cat] ?? DEFAULT_ACCENT;
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: groupIndex * 0.08, duration: 0.45 }}
              className="mb-8"
            >
              {/* category label */}
              <p
                className="mb-3 text-xs font-black uppercase tracking-widest"
                style={{ color: accent }}
              >
                {cat}
              </p>
              <div className="flex flex-wrap gap-2">
                {techs.map((tech, i) => (
                  <motion.span
                    key={tech.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: groupIndex * 0.08 + i * 0.04, duration: 0.35 }}
                    className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold text-white"
                    style={{ borderColor: `${accent}35`, background: `${accent}10` }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: accent }}
                    />
                    {tech.name}
                    {tech.version && (
                      <span className="text-xs opacity-50">{tech.version}</span>
                    )}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          );
        });
      })()}
    </div>
  </section>
);
