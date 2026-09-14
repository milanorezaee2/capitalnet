// ─── Client Logos Section Component - Marquee Animation ───────────────────────────────
// Premium client logos with marquee animation, and stunning visuals

import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import type { ClientLogo } from '../../types/enterprise';

import { t } from '@/i18n';


export interface ClientLogosProps {
  logos: ClientLogo[];
}

export const ClientLogos = ({ logos }: ClientLogosProps) => {
  // Duplicate logos for seamless loop
  const items = [...logos, ...logos];

  return (
    <section id="clients" className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/5 to-transparent pointer-events-none" />

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mb-12"
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '100px' }}
          viewport={{ once: true }}
          className="h-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 mb-6"
        />
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-white md:text-5xl">
              <span className="bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
                {t("مشتریان ما")}
              </span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-300">
              {t("برندهایی که به ما اعتماد کرده‌اند.")}
            </p>
          </div>
          <a
            href="/#client-showcase"
            className="shrink-0 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-300 transition-all hover:bg-amber-500/20 hover:-translate-y-0.5"
          >
            {t("مشاهده موفقیت‌های ما")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </a>
        </div>
      </motion.div>

      {/* Marquee container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-yellow-500/10 to-amber-500/10 blur-2xl" />

        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 py-8">
          {/* CSS-based marquee for reliable looping */}
          <div
            className="flex gap-12 px-6"
            style={{
              animation: 'marquee-rtl 25s linear infinite',
              width: 'max-content',
            }}
          >
            {items.map((logo, index) => (
              <div
                key={`${logo.id}-${index}`}
                className="flex items-center gap-3 shrink-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
                  <Building2 size={20} />
                </div>
                <span className="text-lg font-black tracking-[0.2em] text-slate-300 whitespace-nowrap">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>

          {/* Gradient overlays for fade effect */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950/80 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950/80 to-transparent pointer-events-none" />
        </div>
      </motion.div>

    </section>
  );
};
