import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, X, ChevronLeft, SunMedium, MoonStar, Sparkles } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import type { SiteSettings, BannerPage } from '../lib/settingsApi';
import { GlobalFixedBanners } from '../components/InlineBannerRenderer';
import MobileBottomNav from './MobileBottomNav';
import MobileFooter from './MobileFooter';
import MobileHomeHero from './MobileHomeHero';
import {
  MnGlobalNetwork, MnServices, MnWhyUs,
  MnProcessSteps, MnClientShowcase, MnTestimonials,
  MnBlogPreview, MnFAQ,
} from './MobileHomeSections';
import MobileServicesPage from './MobileServicesPage';
import MobileProcessPage from './MobileProcessPage';
import MobileContactPage from './MobileContactPage';
import MobileAboutPage from './MobileAboutPage';

import { t as tr } from '@/i18n';


export type MobilePageKey = 'home'|'services'|'process'|'blog'|'blog-post'|'contact'|'about'|'evaluation';

interface Props {
  currentPage: string;
  currentUser: { name?: string|null; email?: string|null } | null;
  onNavigate: (page: MobilePageKey) => void;
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  onOpenSearch: () => void;
  settings?: SiteSettings;
  children: ReactNode;
}

const MENU_LINKS: Array<{ label: string; page: MobilePageKey }> = [
  { label: 'خانه',      page: 'home'       },
  { label: 'خدمات',     page: 'services'   },
  { label: 'فرآیند',    page: 'process'    },
  { label: 'بلاگ',      page: 'blog'       },
  { label: 'تماس با ما',page: 'contact'    },
  { label: 'درباره ما', page: 'about'      },
  { label: 'ارزیابی',   page: 'evaluation' },
];

const PAGE_TITLE: Record<string, string> = {
  home:'خانه', services:'خدمات', process:'فرآیند',
  blog:'بلاگ', 'blog-post':'مقاله', contact:'تماس',
  about:'درباره', evaluation:'ارزیابی',
};

const pv = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

export default function MobileAppShell({
  currentPage, currentUser, onNavigate, onOpenAuth,
  onOpenDashboard, onOpenSearch, settings, children,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [currentPage]);
  useEffect(() => {
    const saved = window.localStorage.getItem('cn-mobile-theme');
    if (saved === 'dark' || saved === 'light') setThemeMode(saved);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-mobile-theme', themeMode);
    window.localStorage.setItem('cn-mobile-theme', themeMode);
  }, [themeMode]);
  useEffect(() => {
    const seen = window.localStorage.getItem('cn-mobile-splash-seen');
    if (seen !== '1') {
      setShowSplash(true);
      const t = window.setTimeout(() => {
        setShowSplash(false);
        window.localStorage.setItem('cn-mobile-splash-seen', '1');
      }, 1400);
      return () => window.clearTimeout(t);
    }
  }, []);

  const displayName = useMemo(
    () => currentUser?.name?.split(' ')[0] ?? currentUser?.email?.split('@')[0] ?? null,
    [currentUser],
  );
  const isEvaluationPage = currentPage === 'evaluation';

  /* ── Render correct mobile page ── */
  const pageContent = useMemo(() => {
    if (!settings) return <div className="p-4">{children}</div>;
    const nav = (p: string) => onNavigate(p as MobilePageKey);

    if (currentPage === 'home') return (
      <div>
        <MobileHomeHero settings={settings} onNavigate={nav} themeMode={themeMode} />
        <MnGlobalNetwork settings={settings} themeMode={themeMode} />
        <MnServices settings={settings} themeMode={themeMode} />
        <MnWhyUs settings={settings} themeMode={themeMode} />
        <MnProcessSteps settings={settings} themeMode={themeMode} />
        <MnClientShowcase settings={settings} themeMode={themeMode} />
        <MnTestimonials settings={settings} themeMode={themeMode} />
        <MnBlogPreview settings={settings} onNavigate={nav} themeMode={themeMode} />
        <MnFAQ settings={settings} onNavigate={nav} themeMode={themeMode} />
        <div className="h-6" />
      </div>
    );
    if (currentPage === 'services')   return <MobileServicesPage settings={settings} onNavigate={nav} themeMode={themeMode} />;
    if (currentPage === 'process')    return <MobileProcessPage  settings={settings} onNavigate={nav} themeMode={themeMode} />;
    if (currentPage === 'contact')    return <MobileContactPage  settings={settings} onNavigate={nav} themeMode={themeMode} />;
    if (currentPage === 'about')      return <MobileAboutPage    settings={settings} onNavigate={nav} themeMode={themeMode} />;
    return <div className="pb-2">{children}</div>;
  }, [currentPage, settings, children, onNavigate, themeMode]);

  const shellStyles = themeMode === 'light'
    ? {
        background: '#f2f6ff',
        backgroundImage: [
          'radial-gradient(ellipse 70% 40% at 80% 0%, rgba(99,102,241,0.12) 0%, transparent 60%)',
          'radial-gradient(ellipse 55% 35% at 10% 15%, rgba(34,211,238,0.08) 0%, transparent 55%)',
          'radial-gradient(ellipse 50% 30% at 90% 85%, rgba(139,92,246,0.08) 0%, transparent 50%)',
        ].join(', '),
        color: '#0f172a',
      }
    : {
        background: [
          'radial-gradient(circle at top right, rgba(125,211,252,0.16) 0%, transparent 38%)',
          'radial-gradient(circle at 15% 20%, rgba(59,130,246,0.10) 0%, transparent 28%)',
          'radial-gradient(circle at 90% 80%, rgba(14,116,144,0.16) 0%, transparent 24%)',
          'linear-gradient(135deg, #06111c 0%, #071624 42%, #0a1d2d 100%)',
        ].join(', '),
        color: '#fff',
      };

  return (
    <div className="min-h-screen mn-shell" dir="rtl" style={shellStyles}>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            style={{ background: themeMode === 'dark' ? 'rgba(2,6,23,0.92)' : 'rgba(248,250,252,0.96)' }}
          >
            <div className={`glass-strong flex flex-col items-center rounded-[32px] border px-7 py-8 text-center shadow-[0_22px_60px_rgba(2,6,23,0.24)] ${themeMode === 'dark' ? 'border-white/15 bg-white/8' : 'border-slate-200/70 bg-white/70'}`}>
              <div className={`relative flex h-16 w-16 items-center justify-center rounded-[24px] ${themeMode === 'dark' ? 'bg-white/10' : 'bg-slate-900/95'}`}>
                <div className="mobile-splash-ring absolute inset-0 rounded-[24px] border-2 border-violet-400/40" />
                <Sparkles size={24} className={themeMode === 'dark' ? 'text-cyan-300' : 'text-white'} />
              </div>
              <h2 className={`mt-4 text-xl font-black ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Capital Network</h2>
              <p className={`mt-2 text-sm leading-7 ${themeMode === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>{tr("نسخه موبایل با تجربه‌ای مدرن، سریع و شیشه‌ای")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 px-2 pt-2 sm:px-4">
        <div className={`glass-strong mx-auto w-full max-w-5xl rounded-[28px] px-3 py-2.5 shadow-[0_16px_48px_rgba(2,6,23,0.16)] ${
          isEvaluationPage
            ? 'border-white/10 bg-slate-900/95'
            : themeMode === 'dark'
              ? 'border-white/10 bg-slate-900/55'
              : 'border-white/40 bg-white/55'
        }`}>
          <div className="flex h-14 items-center justify-between gap-3">
            {/* Logo */}
            <button type="button" onClick={() => onNavigate('home')} className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[11px] font-black text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>CN</div>
              <div className="min-w-0 text-end">
                <AnimatePresence mode="wait">
                  <motion.p key={currentPage}
                    initial={{ opacity:0, y:3 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-3 }}
                    transition={{ duration: 0.18 }}
                    className={`text-sm font-black truncate ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {currentPage === 'home'
                      ? (settings?.header_logo_text ?? 'Capital Network')
                      : PAGE_TITLE[currentPage] ?? 'Capital Network'}
                  </motion.p>
                </AnimatePresence>
                <p className={`text-[10px] leading-none mt-0.5 ${themeMode === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>
                  {settings?.header_logo_text ?? tr("پلتفرم رشد و سرمایه‌گذاری")}
                </p>
              </div>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                type="button"
                onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                whileTap={{ scale:0.92 }}
                className={`relative flex h-10 w-16 items-center rounded-full p-1 transition-colors ${themeMode === 'dark' ? 'bg-slate-800/90' : 'bg-slate-200/90'}`}
                aria-label={tr("تغییر تم")}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${themeMode === 'dark' ? 'bg-white text-slate-800' : 'bg-slate-900 text-white'}`}
                  animate={{ x: themeMode === 'dark' ? 8 : 0 }}
                >
                  {themeMode === 'dark' ? <MoonStar size={15} /> : <SunMedium size={15} />}
                </motion.span>
              </motion.button>
              {currentUser ? (
                <motion.button type="button" onClick={onOpenDashboard} whileTap={{ scale:0.93 }}
                  className="mn-btn-ghost text-[11px] px-2.5 py-2">
                  {displayName ?? tr("پروفایل")}
                </motion.button>
              ) : (
                <motion.button type="button" onClick={onOpenAuth} whileTap={{ scale:0.93 }}
                  className="rounded-xl px-3 py-2 text-[11px] font-black text-white"
                  style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {tr("ورود")}
                </motion.button>
              )}
              <motion.button type="button" onClick={onOpenSearch} whileTap={{ scale:0.88 }}
                className="mn-icon-btn" aria-label={tr("جستجو")}>
                <Search size={15} className={themeMode === 'dark' ? 'text-white/60' : 'text-slate-700'} />
              </motion.button>
              <motion.button type="button" onClick={() => setMenuOpen(true)} whileTap={{ scale:0.88 }}
                className="mn-icon-btn" aria-label={tr("منو")}>
                <Menu size={15} className={themeMode === 'dark' ? 'text-white/60' : 'text-slate-700'} />
              </motion.button>
            </div>
          </div>

          <div className={`mt-2 flex items-center justify-between rounded-2xl border px-3 py-2 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white/80'}`}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="mn-badge"><span className="mn-badge-dot" /> {tr("موبایل")}</span>
              <p className={`truncate text-[11px] ${themeMode === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>{tr("همه‌ی بخش‌ها در یک تجربه‌ی حرفه‌ای")}</p>
            </div>
            <button type="button" onClick={() => onNavigate('evaluation')} className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.05] text-white' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
              {tr("ارزیابی")}
            </button>
          </div>
        </div>
      </header>

      {/* ── Global Fixed Banners (mobile) ── */}
      {settings?.inline_banners && settings.inline_banners.length > 0 && (
        <GlobalFixedBanners
          banners={settings.inline_banners}
          currentPage={
            (['home','services','process','blog','about','contact','evaluation'] as BannerPage[])
              .includes(currentPage as BannerPage)
              ? (currentPage as BannerPage)
              : 'home'
          }
        />
      )}

      {/* ── Content ── */}
      <main className="mx-auto w-full max-w-5xl px-1 sm:px-2">
        <AnimatePresence mode="wait">
          <motion.div key={currentPage} {...pv}>{pageContent}</motion.div>
        </AnimatePresence>
      </main>

      {/* ── Mobile Footer ── */}
      <div className="mx-auto w-full max-w-5xl">
        <MobileFooter themeMode={themeMode} settings={settings} onNavigate={onNavigate} />
      </div>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div key="bd" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.2 }} className="fixed inset-0 z-50"
              style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)' }}
              onClick={() => setMenuOpen(false)} />
            <motion.div key="dr"
              initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
              transition={{ type:'spring', stiffness:320, damping:32 }}
              className="fixed top-0 end-0 bottom-0 z-50 w-[272px] flex flex-col"
              style={{ background: themeMode === 'dark' ? 'rgba(9,11,20,0.98)' : 'rgba(255,255,255,0.86)', borderLeft: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.08)', backdropFilter:'blur(32px)', WebkitBackdropFilter:'blur(32px)' }}>
              {/* Drawer header */}
              <div className={`relative overflow-hidden border-b px-5 pt-5 pb-4 ${themeMode === 'dark' ? 'border-white/[0.05]' : 'border-slate-200/80'}`}>
                <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_70%)]" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-black ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{settings?.header_logo_text ?? 'Capital Network'}</p>
                    <p className={`text-[11px] mt-0.5 ${themeMode === 'dark' ? 'text-white/50' : 'text-slate-600'}`}>{tr("پلتفرم رشد و سرمایه‌گذاری")}</p>
                  </div>
                  <motion.button type="button" onClick={() => setMenuOpen(false)} whileTap={{ scale:0.88 }}
                    className="mn-icon-btn" aria-label={tr("بستن")}>
                    <X size={14} className={themeMode === 'dark' ? 'text-white/55' : 'text-slate-600'} />
                  </motion.button>
                </div>
              </div>
              {/* User card */}
              <div className="px-4 py-3">
                <div className={`flex items-center gap-3 rounded-[22px] border px-3.5 py-3 ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.06]' : 'border-slate-200 bg-white/80 shadow-sm'}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white"
                    style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {displayName ? displayName[0].toUpperCase() : 'CN'}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{displayName ?? tr("کاربر مهمان")}</p>
                    <p className={`text-[11px] mt-0.5 ${themeMode === 'dark' ? 'text-white/50' : 'text-slate-600'}`}>
                      {currentUser ? tr("حساب کاربری فعال") : tr("ورود یا ثبت‌نام")}
                    </p>
                  </div>
                </div>
              </div>
              {/* Nav */}
              <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                <div className={`mb-2 rounded-2xl border p-3 text-[11px] ${themeMode === 'dark' ? 'border-white/10 bg-white/[0.04] text-white/60' : 'border-slate-200 bg-white/90 text-slate-600'}`}>
                  {tr("برای دسترسی سریع به بخش‌های اصلی، از این منو استفاده کنید.")}
                </div>
                {MENU_LINKS.map((item, i) => {
                  const isActive = currentPage === item.page;
                  return (
                    <motion.button key={item.page} type="button"
                      onClick={() => { onNavigate(item.page); setMenuOpen(false); }}
                      whileTap={{ scale:0.97 }}
                      initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}
                      transition={{ delay: i * 0.04, duration:0.22 }}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 transition-all ${themeMode === 'dark' ? '' : 'bg-white/70'}`}
                      style={{
                        background: isActive ? (themeMode === 'dark' ? 'rgba(99,102,241,0.12)' : 'rgba(129,140,248,0.12)') : (themeMode === 'dark' ? 'transparent' : 'rgba(255,255,255,0.7)'),
                        border: isActive ? '1px solid rgba(99,102,241,0.22)' : '1px solid transparent',
                      }}>
                      <span className="text-sm font-semibold"
                        style={{ color: isActive ? '#818cf8' : (themeMode === 'dark' ? 'rgba(255,255,255,0.65)' : '#475569') }}>
                        {item.label}
                      </span>
                      <ChevronLeft size={13}
                        style={{ color: isActive ? '#818cf8' : (themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.25)') }} />
                    </motion.button>
                  );
                })}
              </nav>
              {/* CTA */}
              <div className={`px-4 pb-6 pt-3 border-t ${themeMode === 'dark' ? 'border-white/[0.05]' : 'border-slate-200/80'}`}>
                <button type="button"
                  onClick={() => { onNavigate('evaluation'); setMenuOpen(false); }}
                  className="w-full rounded-xl py-3 text-sm font-black text-white"
                  style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {tr("شروع ارزیابی رایگان")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MobileBottomNav currentPage={currentPage} onNavigate={(p) => onNavigate(p as MobilePageKey)}
        onOpenAuth={onOpenAuth} onOpenDashboard={onOpenDashboard} currentUser={currentUser} themeMode={themeMode} />
    </div>
  );
}
