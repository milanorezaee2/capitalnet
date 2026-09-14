import { motion } from 'framer-motion';
import { Users, Target, Star, ArrowLeft } from 'lucide-react';
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
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const CARD_ICONS = [Target, Star, Users];
const CARD_COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4'];

export default function MobileAboutPage({ settings, onNavigate, themeMode = 'dark' }: Props) {
  const isLight = themeMode === 'light';

  const aboutCards = [
    settings.about_mission,
    settings.about_experience,
    settings.about_values,
  ].filter(Boolean);

  const team = settings.team ?? [];

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
          <Users size={10} />
          ABOUT
        </span>
        <h1 className={`mt-2.5 text-[22px] font-black leading-[1.25] tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {settings.about_hero_title}
        </h1>
        <p className={`mobile-justified-text mt-2 text-sm leading-[1.8] font-medium ${isLight ? 'text-slate-600' : 'text-white/50'}`}>
          {settings.about_hero_desc}
        </p>
      </motion.div>

      {/* ── Mission / Experience / Values ── */}
      {aboutCards.length > 0 && (
        <motion.div variants={stagger} className="space-y-2.5">
          {aboutCards.map((card: any, i: number) => {
            const Icon = CARD_ICONS[i % CARD_ICONS.length];
            const color = CARD_COLORS[i % CARD_COLORS.length];
            return (
              <motion.div
                key={`card-${i}`}
                variants={fadeUp}
                className={`rounded-2xl p-4 border ${isLight ? 'border-slate-200 bg-white/80 shadow-sm' : 'border-white/[0.06] bg-white/[0.02]'}`}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                  >
                    <Icon size={15} style={{ color }} />
                  </div>
                  <h2 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{card.title}</h2>
                </div>
                <p className={`mobile-justified-text text-xs leading-[1.8] ${isLight ? 'text-slate-600' : 'text-white/50'}`}>{card.text}</p>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Our Story ── */}
      {settings.about_story_title && (
        <motion.div
          variants={fadeUp}
          className={`rounded-2xl p-4 border ${isLight ? 'border-amber-500/30 bg-amber-50' : 'border-amber-400/20 bg-amber-400/[0.04]'}`}
        >
          <p className="text-[10px] font-black tracking-widest text-amber-500/80 uppercase mb-1.5">{t("داستان ما")}</p>
          <h3 className={`text-base font-black leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>{settings.about_story_title}</h3>
          <p className={`mobile-justified-text mt-2 text-xs leading-[1.8] ${isLight ? 'text-slate-600' : 'text-white/50'}`}>{settings.about_story_desc}</p>
          {settings.about_story_items?.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {settings.about_story_items.map((item: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: '#f59e0b' }}
                  />
                  <span className={`text-xs leading-tight ${isLight ? 'text-slate-700' : 'text-white/60'}`}>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      {/* ── Why Us ── */}
      {settings.about_why_title && (
        <motion.div
          variants={fadeUp}
          className={`rounded-2xl p-4 border ${isLight ? 'border-slate-200 bg-white/80 shadow-sm' : 'border-white/[0.06] bg-white/[0.02]'}`}
        >
          <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{settings.about_why_title}</h3>
          <p className={`mobile-justified-text mt-2 text-xs leading-[1.8] ${isLight ? 'text-slate-600' : 'text-white/50'}`}>{settings.about_why_desc}</p>
        </motion.div>
      )}

      {/* ── Team ── */}
      {team.length > 0 && (
        <motion.div variants={fadeUp}>
          <p className={`mb-3 text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/30'}`}>{t("تیم کلیدی")}</p>
          <div className="space-y-2">
            {team.map((member: any, i: number) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 border ${isLight ? 'border-slate-200 bg-white/80 shadow-sm' : 'border-white/[0.06] bg-white/[0.02]'}`}
              >
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className={`h-10 w-10 shrink-0 rounded-full object-cover border ${isLight ? 'border-slate-200' : 'border-white/10'}`}
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-slate-900"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #f59e0b)' }}
                  >
                    {member.name?.[0] ?? '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold leading-none truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{member.name}</p>
                  <p className={`text-[11px] mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{member.role}</p>
                  {member.bio && (
                    <p className={`mobile-justified-text text-[11px] mt-1 leading-[1.6] line-clamp-2 ${isLight ? 'text-slate-500' : 'text-white/35'}`}>{member.bio}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── CTA ── */}
      <motion.div variants={fadeUp} className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onNavigate('contact')}
          className="flex-1 rounded-xl py-3 text-sm font-black text-slate-900"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #06b6d4)' }}
        >
          {t("تماس با تیم")}
        </button>
        <button
          type="button"
          onClick={() => onNavigate('services')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-bold border ${isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-white/10 bg-white/[0.03] text-white/70'}`}
        >
          {t("خدمات")}
          <ArrowLeft size={13} />
        </button>
      </motion.div>
    </motion.div>
  );
}
