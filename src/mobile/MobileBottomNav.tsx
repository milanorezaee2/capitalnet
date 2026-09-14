import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Briefcase, Home, PhoneCall, Users } from 'lucide-react';

export type MobilePageKey = 'home'|'services'|'process'|'blog'|'blog-post'|'contact'|'about'|'evaluation';

interface NavItem { label: string; page: MobilePageKey; icon: ReactNode; }

const ITEMS: NavItem[] = [
  { label: 'خانه',   page: 'home',     icon: <Home      size={21} strokeWidth={1.7} /> },
  { label: 'خدمات',  page: 'services', icon: <Briefcase size={21} strokeWidth={1.7} /> },
  { label: 'بلاگ',   page: 'blog',     icon: <BookOpen  size={21} strokeWidth={1.7} /> },
  { label: 'تماس',   page: 'contact',  icon: <PhoneCall size={21} strokeWidth={1.7} /> },
  { label: 'درباره', page: 'about',    icon: <Users     size={21} strokeWidth={1.7} /> },
];

const TAB_MAP: Record<string, MobilePageKey> = {
  home:'home', services:'services', process:'services',
  blog:'blog', 'blog-post':'blog', contact:'contact',
  about:'about', evaluation:'home',
};

interface Props {
  currentPage: string;
  onNavigate: (page: MobilePageKey) => void;
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  currentUser: { name?: string|null; email?: string|null } | null;
  themeMode?: 'dark' | 'light';
}

export default function MobileBottomNav({ currentPage, onNavigate, themeMode = 'dark' }: Props) {
  const active = TAB_MAP[currentPage] ?? 'home';
  const isLight = themeMode === 'light';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom,0px)' }}
    >
      <div className="mx-3 mb-3">
        <div
          style={isLight ? { background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(15,23,42,0.10)', boxShadow: '0 8px 32px rgba(15,23,42,0.10), 0 2px 8px rgba(15,23,42,0.06)' } : {}}
          className={`rounded-[26px] border p-1.5 backdrop-blur-2xl ${
            isLight
              ? ''
              : 'border-white/10 bg-slate-950/85 shadow-[0_18px_50px_rgba(0,0,0,0.42)]'
          }`}
        >
          <div className="flex items-center gap-1">
            {ITEMS.map((item) => {
              const isActive = active === item.page;
              return (
                <motion.button
                  key={item.page}
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  className="relative flex-1 overflow-hidden rounded-[20px] px-1 py-2.5"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="mn-nav-pill"
                        className={`absolute inset-0 rounded-[20px] border ${
                          isLight
                            ? 'border-violet-300/40 bg-gradient-to-br from-violet-100/80 via-cyan-50/60 to-transparent'
                            : 'border-violet-400/25 bg-gradient-to-br from-violet-500/20 via-cyan-400/10 to-transparent'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>
                  <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.08 : 1,
                        color: isActive
                          ? '#7c3aed'
                          : (isLight ? '#94a3b8' : 'rgba(255,255,255,0.4)'),
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.icon}
                    </motion.div>
                    <motion.span
                      className="text-[10px] font-semibold leading-none"
                      animate={{
                        color: isActive
                          ? (isLight ? '#6d28d9' : '#c4b5fd')
                          : (isLight ? '#94a3b8' : 'rgba(255,255,255,0.38)'),
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
