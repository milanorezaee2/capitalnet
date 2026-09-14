// ─── Pricing Section — Clean Three-column Cards ─────────────────────────────
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { PricingPlan } from '../../types/enterprise';

import { t } from '@/i18n';


export interface PricingProps {
  plans: PricingPlan[];
}

const fmt = (n: number) =>
  n === 0 ? t("تماس بگیرید") : new Intl.NumberFormat('fa-IR').format(n);

export const Pricing = ({ plans }: PricingProps) => (
  <section id="pricing" className="py-24 md:py-32 bg-[#111c2d]">
    <div className="mx-auto max-w-7xl px-8">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400"
      >
        {t("قیمت‌گذاری")}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14 text-4xl font-black text-white md:text-5xl"
      >
        {t("پلن‌های ما")}
      </motion.h2>

      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`relative flex flex-col rounded-2xl border p-8 ${
              plan.featured
                ? 'border-cyan-500/40 bg-cyan-500/[0.06] shadow-[0_0_60px_-12px_rgba(6,182,212,0.25)]'
                : 'border-white/8 bg-white/[0.025]'
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3.5 start-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950">
                {t("محبوب‌ترین")}
              </span>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
              <p className="text-sm text-slate-400">{plan.description}</p>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-black text-white">{fmt(plan.price)}</span>
              {plan.price > 0 && (
                <span className="me-1 text-sm text-slate-500"> {plan.currency} {t("/ ماه")}</span>
              )}
            </div>

            <div className="flex-1 space-y-3 mb-8">
              {plan.features.map((f) => (
                <div key={f.id} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check size={14} className="shrink-0 text-emerald-400" />
                  {f.title}
                </div>
              ))}
              {plan.limitations?.map((l, li) => (
                <div key={li} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <X size={14} className="shrink-0" />
                  {l}
                </div>
              ))}
            </div>

            <a
              href="#contact"
              className={`block rounded-xl py-3.5 text-center text-sm font-bold transition-all hover:-translate-y-0.5 ${
                plan.featured
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  : 'border border-white/12 bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {plan.ctaLabel}
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
