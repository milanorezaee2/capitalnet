// ─── Comparison Section Component - Interactive Table ───────────────────────────────────
// Premium comparison with interactive table, animations, and stunning visuals

import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import type { ComparisonContent } from '../../types/enterprise';

import { t } from '@/i18n';


export interface ComparisonProps {
  comparison: ComparisonContent;
}

export const Comparison = ({ comparison }: ComparisonProps) => {
  return (
    <section id="comparison" className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent pointer-events-none" />

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
          className="h-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 mb-6"
        />
        <h2 className="text-4xl font-black text-white md:text-5xl">
          <span className="bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
            {t("مقایسه")}
          </span>
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-300">
          {t("مقایسه پلن‌های مختلف.")}
        </p>
      </motion.div>

      {/* Comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative overflow-x-auto"
      >
        {/* Glow effect */}
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 blur-2xl" />

        <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {comparison.columns.map((column, index) => (
                  <motion.th
                    key={column}
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="px-6 py-5 text-right text-lg font-black text-white"
                  >
                    {column}
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: rowIndex * 0.05 + 0.5 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className="border-b border-white/10 last:border-0 transition-colors"
                >
                  <td className="px-6 py-4 font-black text-white">{row.label}</td>
                  {row.values.map((value, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 text-slate-300">
                      {value === '✓' ? (
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          className="inline-flex"
                        >
                          <Check size={20} className="text-emerald-400" />
                        </motion.div>
                      ) : value === '✗' ? (
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: -10 }}
                          className="inline-flex"
                        >
                          <X size={20} className="text-red-400" />
                        </motion.div>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </section>
  );
};
