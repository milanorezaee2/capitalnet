// ─── Services Overview Section — data-driven, fully CMS-controlled ───────────
import { motion } from 'framer-motion';
import type { ServicesOverviewContent } from '../../types/enterprise';

import { t } from '@/i18n';


export interface ServicesOverviewProps {
  content: ServicesOverviewContent;
}

// Number badge colors — cycles through a palette so every card looks distinct
const NUMBER_COLORS = [
  '#10b981', '#6366f1', '#f59e0b', '#06b6d4',
  '#ec4899', '#8b5cf6', '#f97316', '#10b981',
  '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6',
];

export const ServicesOverview = ({ content }: ServicesOverviewProps) => {
  if (!content.enabled) return null;

  const sorted = [...content.items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section id="services-overview" className="py-24 md:py-32 bg-[#0d1829]">
      <div className="mx-auto max-w-7xl px-8">

        {/* ── Header ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-cyan-400"
        >
          {content.eyebrow}
        </motion.p>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-white md:text-5xl leading-tight"
          >
            {content.heading}
          </motion.h2>
          {content.intro && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="max-w-xl text-base leading-relaxed text-slate-400 lg:text-left"
            >
              {content.intro}
            </motion.p>
          )}
        </div>

        {/* Divider */}
        <div className="mb-14 h-px bg-gradient-to-l from-cyan-500/30 via-white/8 to-transparent" />

        {/* ── Service cards grid ── */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((svc, i) => {
            const accent = svc.accent || NUMBER_COLORS[i % NUMBER_COLORS.length];
            return (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.055, duration: 0.45 }}
                className="group relative flex flex-col gap-4 rounded-2xl border border-white/6 bg-white/[0.025] p-6 transition-all duration-300 hover:border-white/12 hover:bg-white/[0.04]"
              >
                {/* Top accent line on hover */}
                <div
                  className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                />

                {/* Number badge */}
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                  style={{ background: `${accent}18`, border: `1px solid ${accent}30`, color: accent }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3 className="mb-2 text-base font-black text-white leading-snug">
                    {svc.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                {/* Bottom accent dot */}
                <div
                  className="mt-auto h-1 w-8 rounded-full opacity-40"
                  style={{ background: accent }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom note ── */}
        {content.bottomNote && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-14 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.05] px-8 py-6"
          >
            <p className="text-base leading-relaxed text-slate-300">
              <span className="font-bold text-white">{t("کسب‌وکار شما را برای یک ارائه جدی آماده می‌کنیم —")} </span>
              {content.bottomNote}
            </p>
          </motion.div>
        )}

      </div>
    </section>
  );
};
