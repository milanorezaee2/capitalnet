// ─── Features Section — Two-column List ─────────────────────────────────────
import { motion } from 'framer-motion';
import { Brain, Zap, ShieldCheck, BarChart2, Lock, Plug, CheckCircle2, type LucideIcon } from 'lucide-react';
import type { Feature } from '../../types/enterprise';

export interface FeaturesProps {
  features: Feature[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  ai: Brain,
  trading: Zap,
  risk: ShieldCheck,
  analytics: BarChart2,
  security: Lock,
  integration: Plug,
  cms: ShieldCheck,
  performance: Zap,
  technology: Brain,
  i18n: Plug,
  default: CheckCircle2,
};

const STATUS_LABELS: Record<string, string> = {
  active: 'فعال',
  coming_soon: 'به زودی',
  beta: 'بتا',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  coming_soon: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  beta: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
};

export const Features = ({ features }: FeaturesProps) => (
  <section id="features" className="py-24 md:py-32 bg-[#111c2d]">
    <div className="mx-auto max-w-7xl px-8">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-violet-400"
      >
        قابلیت‌ها
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14 text-4xl font-black text-white md:text-5xl"
      >
        ویژگی‌های کلیدی
      </motion.h2>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((f, i) => {
          const Icon = ICON_MAP[f.category ?? 'default'] ?? ICON_MAP.default;
          const statusCls = STATUS_COLORS[f.status] ?? STATUS_COLORS.active;
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="flex items-start gap-4 rounded-xl border border-white/6 bg-white/[0.025] p-5 transition-colors hover:border-white/12 hover:bg-white/[0.04]"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/12">
                <Icon size={18} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-white">{f.title}</h3>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusCls}`}>
                    {STATUS_LABELS[f.status] ?? f.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);
