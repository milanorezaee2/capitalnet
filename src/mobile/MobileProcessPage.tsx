import { motion } from 'framer-motion';
import { Clock, ArrowLeft } from 'lucide-react';
import type { SiteSettings } from '../lib/settingsApi';

interface Props {
  settings: SiteSettings;
  onNavigate: (page: string) => void;
  themeMode?: 'dark' | 'light';
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

const STEP_COLORS = ['#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899'];

export default function MobileProcessPage({ settings, onNavigate, themeMode = 'dark' }: Props) {
  const isLight = themeMode === 'light';
  const steps = settings.process_steps ?? [];
  const avgDays = settings.home_process_avg_days ?? '60';

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-5 pb-4 space-y-5"
    >
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp}>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-widest text-purple-400/80 border border-purple-400/20 bg-purple-400/[0.06]">
          PROCESS
        </span>
        <h1 className={`mt-2.5 text-[22px] font-black leading-[1.25] tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {settings.process_hero_title}
        </h1>
        <p className={`mobile-justified-text mt-2 text-sm leading-[1.8] font-medium ${isLight ? 'text-slate-600' : 'text-white/50'}`}>
          {settings.process_hero_desc}
        </p>
      </motion.div>

      {/* ── Avg Days Badge ── */}
      <motion.div
        variants={fadeUp}
        className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${isLight ? 'border-purple-300/40 bg-purple-50' : 'border-purple-400/20 bg-purple-400/[0.05]'}`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-400/15 border border-purple-400/25">
          <Clock size={18} className="text-purple-400" />
        </div>
        <div>
          <p className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>میانگین زمان فرآیند</p>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-white/50'}`}>
            از ارزیابی تا دریافت سرمایه: <span className="text-purple-400 font-bold">{avgDays} روز</span>
          </p>
        </div>
      </motion.div>

      {/* ── Timeline Steps ── */}
      <motion.div variants={stagger} className="relative">
        {/* Vertical connector line */}
        <div
          className="absolute right-[19px] top-5 bottom-5 w-[2px] rounded-full"
          style={{ background: 'linear-gradient(180deg, rgba(139,92,246,0.5) 0%, rgba(6,182,212,0.15) 100%)' }}
        />

        <div className="space-y-3">
          {steps.map((step: any, i: number) => {
            const color = STEP_COLORS[i % STEP_COLORS.length];
            const isLast = i === steps.length - 1;
            return (
              <motion.div
                key={`step-${i}`}
                variants={fadeUp}
                className="flex gap-4 relative"
              >
                {/* Step number circle */}
                <div className="flex flex-col items-center shrink-0 relative z-10">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-black border-2"
                    style={{
                      background: `${color}18`,
                      borderColor: `${color}50`,
                      color: color,
                      boxShadow: `0 0 12px ${color}20`,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {!isLast && <div className="flex-1" />}
                </div>

                {/* Step content */}
                <div
                  className={`flex-1 rounded-2xl p-4 border mb-3 ${isLight ? 'border-slate-200 bg-white/85 shadow-sm' : 'border-white/[0.06]'}`}
                  style={isLight ? {} : { background: 'rgba(255,255,255,0.02)' }}
                >
                  <h3 className={`text-sm font-black leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>{step.title}</h3>
                  <p className={`mobile-justified-text mt-1.5 text-xs leading-[1.75] ${isLight ? 'text-slate-600' : 'text-white/50'}`}>{step.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── CTA ── */}
      <motion.div variants={fadeUp} className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onNavigate('evaluation')}
          className="flex-1 rounded-xl py-3 text-sm font-black text-slate-900"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
        >
          شروع ارزیابی
        </button>
        <button
          type="button"
          onClick={() => onNavigate('services')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-bold border ${isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-white/10 bg-white/[0.03] text-white/70'}`}
        >
          خدمات
          <ArrowLeft size={13} />
        </button>
      </motion.div>
    </motion.div>
  );
}
