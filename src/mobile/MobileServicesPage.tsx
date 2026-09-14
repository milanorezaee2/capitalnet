import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import type { SiteSettings } from '../lib/settingsApi';

import { t } from '@/i18n';


interface Props {
  settings: SiteSettings;
  onNavigate: (page: string) => void;
  themeMode?: 'dark' | 'light';
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

const ACCENT_COLORS = [
  { from: '#06b6d4', to: '#3b82f6', text: '#06b6d4' },
  { from: '#f59e0b', to: '#ef4444', text: '#f59e0b' },
  { from: '#8b5cf6', to: '#ec4899', text: '#8b5cf6' },
  { from: '#10b981', to: '#06b6d4', text: '#10b981' },
];

export default function MobileServicesPage({ settings, onNavigate, themeMode = 'dark' }: Props) {
  const isLight = themeMode === 'light';
  const highlights = settings.services_highlights ?? [];
  const cards = settings.services_cards ?? [];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-5 pb-4 space-y-5"
    >
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp}>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-widest text-amber-400/80 border border-amber-400/20 bg-amber-400/[0.06]">
          <Sparkles size={10} />
          SERVICES
        </span>
        <h1 className={`mt-2.5 text-[22px] font-black leading-[1.25] tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {settings.services_hero_title}
        </h1>
        <p className={`mobile-justified-text mt-2 text-sm leading-[1.8] font-medium ${isLight ? 'text-slate-600' : 'text-white/50'}`}>
          {settings.services_hero_desc}
        </p>
      </motion.div>

      {/* ── Highlight Stats ── */}
      {highlights.length > 0 && (
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2">
          {highlights.slice(0, 3).map((item: any, i: number) => (
            <div
              key={`hl-${i}`}
              className={`rounded-xl p-3 text-center border ${isLight ? 'border-slate-200 bg-white/80 shadow-sm' : 'border-white/[0.06] bg-white/[0.03]'}`}
            >
              <p
                className="text-lg font-black leading-none"
                style={{ color: ACCENT_COLORS[i % ACCENT_COLORS.length].text }}
              >
                {item.value}
              </p>
              <p className={`mt-1 text-[10px] font-semibold leading-tight ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{item.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Service Cards ── */}
      <motion.div variants={stagger} className="space-y-3">
        {cards.map((card: any, i: number) => {
          const colors = ACCENT_COLORS[i % ACCENT_COLORS.length];
          return (
            <motion.div
              key={`card-${i}`}
              variants={fadeUp}
              className={`rounded-2xl p-4 border overflow-hidden relative ${isLight ? 'border-slate-200 bg-white/85 shadow-sm' : 'border-white/[0.07]'}`}
              style={isLight ? {} : { background: 'rgba(255,255,255,0.025)' }}
            >
              {/* Subtle gradient orb */}
              <div
                className="absolute -top-8 -start-8 h-24 w-24 rounded-full blur-2xl opacity-25 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${colors.from}, transparent)` }}
              />

              {/* Card number badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black"
                  style={{
                    background: `linear-gradient(135deg, ${colors.from}30, ${colors.to}20)`,
                    border: `1px solid ${colors.from}40`,
                    color: colors.text,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Title & Description */}
              <h2 className={`text-base font-black leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>{card.title}</h2>
              <p className={`mobile-justified-text mt-1.5 text-sm leading-[1.75] ${isLight ? 'text-slate-600' : 'text-white/50'}`}>{card.desc}</p>

              {/* Features list */}
              {card.features && card.features.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {card.features.slice(0, 4).map((feat: string, fi: number) => (
                    <li key={fi} className="flex items-start gap-2">
                      <CheckCircle2
                        size={13}
                        className="mt-0.5 shrink-0"
                        style={{ color: colors.text }}
                      />
                      <span className={`text-[12px] leading-[1.65] ${isLight ? 'text-slate-600' : 'text-white/60'}`}>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── CTA Block ── */}
      <motion.div
        variants={fadeUp}
        className={`rounded-2xl p-4 border ${isLight ? 'border-amber-500/30 bg-amber-50' : 'border-amber-400/20 bg-amber-400/[0.05]'}`}
      >
        <p className={`text-sm font-black leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {t("آماده شروع همکاری هستید؟")}
        </p>
        <p className={`mobile-justified-text mt-1 text-xs leading-[1.7] ${isLight ? 'text-slate-600' : 'text-white/45'}`}>
          {t("با مشاوره رایگان اولیه، مسیر مناسب کسب‌وکارتان را پیدا کنید.")}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onNavigate('evaluation')}
            className="flex-1 rounded-xl py-2.5 text-sm font-black text-slate-900"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #06b6d4)' }}
          >
            {t("مشاوره رایگان")}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('process')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-bold border ${isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-white/10 text-white/70'}`}
          >
            {t("فرآیند")}
            <ArrowLeft size={13} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
