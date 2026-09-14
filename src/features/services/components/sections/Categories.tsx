// ─── Categories Section — Numbered Horizontal Cards ────────────────────────
import { motion } from 'framer-motion';
import { TrendingUp, Layers, BarChart3, type LucideIcon } from 'lucide-react';
import type { ServiceCategoryEntity } from '../../types/enterprise';

import { t } from '@/i18n';


export interface CategoriesProps {
  categories: ServiceCategoryEntity[];
}

const ICONS: Record<string, LucideIcon> = {
  sparkles: TrendingUp,
  layers: Layers,
  code: BarChart3,
};

const ACCENTS = [
  { border: '#06b6d4', bg: 'rgba(6,182,212,0.08)', text: '#67e8f9' },
  { border: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', text: '#c4b5fd' },
  { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', text: '#fcd34d' },
  { border: '#10b981', bg: 'rgba(16,185,129,0.08)', text: '#6ee7b7' },
];

export const Categories = ({ categories }: CategoriesProps) => (
  <section id="categories" className="py-24 md:py-32 bg-[#111c2d]">
    <div className="mx-auto max-w-7xl px-8">
      {/* label */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-cyan-500"
      >
        {t("خدمات ما")}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-4xl font-black text-white md:text-5xl"
      >
        {t("دسته‌بندی خدمات")}
      </motion.h2>

      {/* cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {categories.map((cat, i) => {
          const Icon = ICONS[cat.icon || 'sparkles'] || TrendingUp;
          const acc = ACCENTS[i % ACCENTS.length];
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative rounded-2xl border p-7 transition-all hover:-translate-y-1"
              style={{ borderColor: `${acc.border}30`, background: acc.bg }}
            >
              {/* number */}
              <span className="absolute top-6 start-6 text-6xl font-black leading-none select-none"
                style={{ color: `${acc.border}18` }}>
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* icon */}
              <div className="mb-5 inline-flex items-center justify-center rounded-xl p-3"
                style={{ background: `${acc.border}20` }}>
                <Icon size={22} style={{ color: acc.text }} />
              </div>

              <h3 className="text-xl font-black text-white mb-2">{cat.name}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{cat.description}</p>

              {/* bottom accent line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                className="mt-6 h-px origin-right"
                style={{ background: `linear-gradient(to left, ${acc.border}, transparent)` }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);
