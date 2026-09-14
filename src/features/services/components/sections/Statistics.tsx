// ─── Statistics Section — Large Number Showcase ─────────────────────────────
import { motion } from 'framer-motion';
import type { Statistic } from '../../types/enterprise';

export interface StatisticsProps {
  stats: Statistic[];
}

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

export const Statistics = ({ stats }: StatisticsProps) => (
  <section id="statistics" className="py-24 bg-[#0d1829]">
    <div className="mx-auto max-w-7xl px-8">
      <div className="grid gap-0 divide-y divide-white/5 md:grid-cols-3 md:divide-x md:divide-y-0">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="flex flex-col items-center justify-center py-14 px-10 text-center"
          >
            <span
              className="mb-3 block text-6xl font-black leading-none md:text-7xl"
              style={{ color: COLORS[i % COLORS.length] }}
            >
              {stat.value}
            </span>
            <span className="text-base font-semibold text-slate-400">{stat.label}</span>
            {stat.description && (
              <span className="mt-2 text-xs text-slate-600">{stat.description}</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
