import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Shield, Zap } from 'lucide-react';
import type { SiteSettings } from '../lib/settingsApi';

import { t } from '@/i18n';


interface Props {
  settings: SiteSettings;
  onNavigate?: (page: string) => void;
  themeMode?: 'dark' | 'light';
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const } },
});

const FEATURES = [
  { icon: Shield,    label: 'پشتیبانی تخصصی', sub: 'از Deck تا مذاکره' },
  { icon: TrendingUp,label: 'استراتژی رشد',    sub: 'برنامه ورود به سرمایه' },
  { icon: Zap,       label: 'سرعت اجرا',       sub: 'تیم همیشه آماده' },
];

export default function MobileHomeHero({ settings, onNavigate, themeMode = 'dark' }: Props) {
  const stats = settings.home_stats?.slice(0, 3) ?? [];
  const isLight = themeMode === 'light';

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-4 pb-6 space-y-4 sm:px-5">
      <motion.div
        {...fadeUp(0)}
        whileHover={{ y: -2, scale: 1.01 }}
        className={`relative overflow-hidden rounded-[32px] border p-4 shadow-[0_18px_60px_rgba(2,6,23,0.22)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] ${isLight ? 'border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)]' : 'border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.16),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(5,17,28,0.9)_70%,rgba(10,29,45,0.84))]'}`}
      >
        <div className={`absolute inset-0 ${isLight ? 'bg-[linear-gradient(135deg,rgba(99,102,241,0.04),transparent)]' : 'bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]'}`} />
        <div className="relative space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="mn-badge">
              <span className="mn-badge-dot" />
              CAPITAL NETWORK
            </span>
            <div className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${isLight ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-white/10 bg-white/[0.05] text-white/80'}`}>
              {t("نسخه موبایل")}
            </div>
          </div>

          <div className="space-y-3">
            <h1 className={`text-[27px] font-black leading-[1.22] tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {settings.home_hero_title}
            </h1>
            <p className={`mobile-justified-text text-sm leading-[1.9] font-medium ${isLight ? 'text-slate-600' : 'text-white/65'}`}>
              {settings.home_hero_desc}
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate?.('evaluation')}
              className="mn-btn-primary flex-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {t("شروع ارزیابی")}
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('services')}
              className="mn-btn-ghost flex items-center gap-1.5"
            >
              {t("خدمات")}
              <ArrowLeft size={13} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: t("خدمات"), page: 'services' },
              { label: t("فرآیند"), page: 'process' },
              { label: t("ارزیابی"), page: 'evaluation' },
              { label: t("درباره ما"), page: 'about' },
            ].map((item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate?.(item.page)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 hover:-translate-y-0.5 ${isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-white/10 bg-white/[0.05] text-white/75'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {stats.length > 0 && (
        <motion.div {...fadeUp(0.12)} className="grid grid-cols-3 gap-2.5">
          {stats.map((s: any, i: number) => (
            <div key={i} className="mn-card text-right p-3">
              <p className={`text-xl font-black leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.value}</p>
              <p className={`mt-1 text-[10px] font-semibold leading-tight ${isLight ? 'text-slate-600' : 'text-white/55'}`}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div {...fadeUp(0.18)} className="space-y-2">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="mn-card flex items-center gap-3.5 px-4 py-3.5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]">
              <div className="mn-icon-box shrink-0">
                <Icon size={16} className={isLight ? 'text-indigo-500' : 'text-cyan-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>{f.label}</p>
                <p className={`mt-0.5 text-[11px] leading-tight ${isLight ? 'text-slate-600' : 'text-white/55'}`}>{f.sub}</p>
              </div>
              <ArrowLeft size={13} className={`shrink-0 ${isLight ? 'text-slate-300' : 'text-white/15'}`} />
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
