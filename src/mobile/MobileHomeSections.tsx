/* eslint-disable */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Star, Eye, Clock, ChevronDown,
  MessageCircle, ArrowLeft, Layers, Target,
  Shield, TrendingUp, Zap, Users,
} from 'lucide-react';
import type { SiteSettings } from '../lib/settingsApi';
import type { Testimonial } from '../lib/testimonialsApi';
import { fetchActiveTestimonials } from '../lib/testimonialsApi';

type Nav = (page: string, slug?: string, cat?: string) => void;

const fv = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' } as const,
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

const hoverCardClass = 'transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]';
const hoverButtonClass = 'transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01]';

/* ─── Section divider ─────────────────────────────────────── */
function SectionDivider({ label, themeMode = 'dark' }: { label: string; themeMode?: 'dark' | 'light' }) {
  return (
    <div className="flex items-center gap-3 px-5 py-2">
      <div className={`h-px flex-1 ${themeMode === 'light' ? 'bg-slate-200' : 'bg-white/[0.06]'}`} />
      <span className={`text-[10px] font-black tracking-widest uppercase ${themeMode === 'light' ? 'text-slate-400' : 'text-white/25'}`}>{label}</span>
      <div className={`h-px flex-1 ${themeMode === 'light' ? 'bg-slate-200' : 'bg-white/[0.06]'}`} />
    </div>
  );
}

/* ─── MnGlobalNetwork ─────────────────────────────────────── */
const REGIONS = [
  { name: 'اروپا',         count: '+45', emoji: '🌍' },
  { name: 'آمریکای شمالی', count: '+38', emoji: '🇺🇸' },
  { name: 'خاورمیانه',     count: '+22', emoji: '🌐' },
  { name: 'آسیا',          count: '+15', emoji: '🌏' },
  { name: 'آفریقا',        count: '+8',  emoji: '🌍' },
];

export function MnGlobalNetwork({ settings, themeMode = 'dark' }: { settings: SiteSettings; themeMode?: 'dark' | 'light' }) {
  return (
    <section className="py-6 space-y-4">
      <SectionDivider label="شبکه جهانی" themeMode={themeMode} />
      <motion.div {...fv} className="px-5 space-y-2">
        <h2 className={`text-xl font-black ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{settings.home_network_title}</h2>
        <p className={`mobile-justified-text text-sm leading-relaxed ${themeMode === 'light' ? 'text-slate-600' : 'text-mn-muted'}`}>{settings.home_network_desc}</p>
      </motion.div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none px-5 pb-1">
        {REGIONS.map((r) => (
          <div key={r.name} className={`${hoverCardClass} mn-card shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 min-w-[100px]`}>
            <span className="text-2xl">{r.emoji}</span>
            <span className={`text-[11px] font-bold text-center leading-tight ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>{r.name}</span>
            <span className="text-xs font-black text-mn-accent">VC {r.count}</span>
          </div>
        ))}
      </div>
      {settings.home_network_stats?.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 px-5">
          {settings.home_network_stats.slice(0, 3).map((s: any, i: number) => (
            <div key={i} className={`${hoverCardClass} mn-card p-3 text-center`}>
              <p className={`text-lg font-black ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{s.value}</p>
              <p className={`text-[10px] mt-0.5 leading-tight ${themeMode === 'light' ? 'text-slate-500' : 'text-mn-muted'}`}>{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── MnServices ──────────────────────────────────────────── */
const SVC_ICONS = [<Layers size={18} />, <Target size={18} />, <Shield size={18} />];

export function MnServices({ settings, themeMode = 'dark' }: { settings: SiteSettings; themeMode?: 'dark' | 'light' }) {
  const cards = settings.services_cards ?? [];
  return (
    <section className="py-6 space-y-4">
      <SectionDivider label="خدمات" themeMode={themeMode} />
      <motion.div {...fv} className="px-5 space-y-1">
        <span className="mn-badge">{settings.home_services_badge}</span>
        <h2 className={`text-xl font-black pt-2 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{settings.home_services_title}</h2>
        <p className={`mobile-justified-text text-sm leading-relaxed ${themeMode === 'light' ? 'text-slate-600' : 'text-mn-muted'}`}>{settings.home_services_desc}</p>
      </motion.div>
      <div className="space-y-2.5 px-5">
        {cards.map((c: any, i: number) => (
          <motion.div
            key={i}
            {...fv}
            transition={{ ...fv.transition, delay: i * 0.07 }}
            className={`${hoverCardClass} mn-card p-4 space-y-2.5`}
          >
            <div className="flex items-center gap-3">
              <div className="mn-icon-box shrink-0">{SVC_ICONS[i % SVC_ICONS.length]}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-black leading-snug ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{c.title}</p>
                {c.popular && (
                  <span className="text-[10px] font-bold text-mn-accent">محبوب‌ترین</span>
                )}
              </div>
            </div>
            <p className={`text-xs leading-[1.75] ${themeMode === 'light' ? 'text-slate-600' : 'text-mn-muted'}`}>{c.desc}</p>
            {c.features?.length > 0 && (
              <ul className="space-y-1.5">
                {c.features.slice(0, 3).map((f: string, fi: number) => (
                  <li key={fi} className="flex items-start gap-2">
                    <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-mn-accent" />
                    <span className={`text-[11px] leading-relaxed ${themeMode === 'light' ? 'text-slate-600' : 'text-white/55'}`}>{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── MnWhyUs ─────────────────────────────────────────────── */
const WHY_ICONS = [<Users size={17}/>, <TrendingUp size={17}/>, <Shield size={17}/>, <Zap size={17}/>];

export function MnWhyUs({ settings, themeMode = 'dark' }: { settings: SiteSettings; themeMode?: 'dark' | 'light' }) {
  const items = settings.home_why_us ?? [];
  return (
    <section className="py-6 space-y-4">
      <SectionDivider label="چرا ما" themeMode={themeMode} />
      <motion.div {...fv} className="px-5 space-y-1">
        <h2 className={`text-xl font-black ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{settings.home_why_us_title}</h2>
        <p className={`mobile-justified-text text-sm leading-relaxed ${themeMode === 'light' ? 'text-slate-600' : 'text-mn-muted'}`}>{settings.home_why_us_desc}</p>
      </motion.div>
      <div className="grid grid-cols-2 gap-2.5 px-5">
        {items.slice(0, 4).map((item: any, i: number) => (
          <motion.div
            key={i}
            {...fv}
            transition={{ ...fv.transition, delay: i * 0.07 }}
            className={`${hoverCardClass} mn-card p-4 space-y-2`}
          >
            <div className="mn-icon-box">{WHY_ICONS[i % WHY_ICONS.length]}</div>
            <p className={`text-xs font-black leading-snug ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{item.title}</p>
            <p className={`text-[11px] leading-relaxed ${themeMode === 'light' ? 'text-slate-600' : 'text-mn-muted'}`}>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── MnProcessSteps ──────────────────────────────────────── */
const STEP_COLORS = ['#6366f1','#8b5cf6','#10b981','#f59e0b'];

export function MnProcessSteps({ settings, themeMode = 'dark' }: { settings: SiteSettings; themeMode?: 'dark' | 'light' }) {
  const steps = settings.home_process_steps ?? [];
  return (
    <section className="py-6 space-y-4">
      <SectionDivider label="فرآیند" themeMode={themeMode} />
      <motion.div {...fv} className="px-5 space-y-1">
        <span className="mn-badge">{settings.home_process_section_badge}</span>
        <h2 className={`text-xl font-black pt-2 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{settings.home_process_section_title}</h2>
        <p className={`mobile-justified-text text-sm leading-relaxed ${themeMode === 'light' ? 'text-slate-600' : 'text-mn-muted'}`}>{settings.home_process_section_desc}</p>
      </motion.div>
      <div className="relative px-5 space-y-0">
        {/* connector */}
        <div className="absolute right-[38px] top-5 bottom-5 w-[2px] rounded-full"
          style={{ background: 'linear-gradient(180deg,rgba(99,102,241,0.5),rgba(16,185,129,0.15))' }} />
        {steps.map((s: any, i: number) => {
          const c = STEP_COLORS[i % STEP_COLORS.length];
          return (
            <motion.div key={i} {...fv} transition={{ ...fv.transition, delay: i * 0.08 }}
              className="flex gap-4 relative pb-3">
              <div className="flex flex-col items-center shrink-0 relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-black border-2"
                  style={{ background: `${c}18`, borderColor: `${c}55`, color: c }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
              <div className={`${hoverCardClass} flex-1 rounded-[20px] border p-4 mb-1 ${themeMode === 'light' ? 'border-slate-200 bg-white/85 shadow-sm' : 'mn-card'}`}>
                <p className={`text-sm font-black leading-snug ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{s.title}</p>
                <p className={`mt-1.5 text-xs leading-[1.75] ${themeMode === 'light' ? 'text-slate-600' : 'text-mn-muted'}`}>{s.text}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="px-5">
        <p className={`text-xs text-center ${themeMode === 'light' ? 'text-slate-600' : 'text-mn-muted'}`}>
          میانگین فرآیند:{' '}
          <span className="text-mn-accent font-bold">{settings.home_process_avg_days}</span>
          {' '}روز
        </p>
      </div>
    </section>
  );
}

/* ─── MnClientShowcase ───────────────────────────────────── */
export function MnClientShowcase({ settings, themeMode = 'dark' }: { settings: SiteSettings; themeMode?: 'dark' | 'light' }) {
  const founders = settings.home_showcase_founders ?? [];
  const vcs      = settings.home_showcase_vcs ?? [];
  const all      = [...founders, ...vcs].slice(0, 6);

  return (
    <section className="py-6 space-y-4">
      <SectionDivider label="نمونه‌کارها" themeMode={themeMode} />
      <motion.div {...fv} className="px-5 space-y-1">
        <span className="mn-badge">{settings.home_showcase_badge}</span>
        <h2 className={`text-xl font-black pt-2 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{settings.home_showcase_title}</h2>
        <p className={`mobile-justified-text text-sm leading-relaxed ${themeMode === 'light' ? 'text-slate-600' : 'text-mn-muted'}`}>{settings.home_showcase_desc}</p>
      </motion.div>
      <div className="grid grid-cols-2 gap-2.5 px-5">
        {all.map((card: any, i: number) => (
          <motion.div key={i} {...fv} transition={{ ...fv.transition, delay: i * 0.06 }}
            className={`${hoverCardClass} mn-card p-4 space-y-2 overflow-hidden relative`}>
            <div className="absolute -top-6 -left-6 h-16 w-16 rounded-full blur-2xl opacity-20 pointer-events-none"
              style={{ background: card.accentColor ?? '#6366f1' }} />
            <p className="text-[10px] font-black tracking-widest uppercase"
              style={{ color: card.accentColor ?? '#6366f1' }}>
              {card.brandSlogan}
            </p>
            <p className={`text-sm font-black leading-snug ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{card.name}</p>
            <p className={`mobile-justified-text text-[11px] leading-relaxed line-clamp-2 ${themeMode === 'light' ? 'text-slate-600' : 'text-mn-muted'}`}>{card.tagline}</p>
            <div className="pt-1 flex items-end justify-between">
              <p className="text-base font-black leading-none" style={{ color: card.accentColor ?? '#6366f1' }}>
                {card.stat}
              </p>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border ${themeMode === 'light' ? 'text-slate-500 bg-slate-100 border-slate-200' : 'text-white/30 bg-white/[0.04] border-white/[0.06]'}`}>
                {card.domain}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── MnTestimonials ─────────────────────────────────────── */
const AVATAR_COLORS = ['#6366f1','#8b5cf6','#10b981','#f59e0b'];

export function MnTestimonials({ settings, themeMode = 'dark' }: { settings: SiteSettings; themeMode?: 'dark' | 'light' }) {
  const [items, setItems] = useState<Testimonial[]>([]);
  useEffect(() => {
    fetchActiveTestimonials().then(rows => { if (rows.length > 0) setItems(rows); });
  }, []);

  const fallback: Testimonial[] = [
    { id:'1', name:'علی رضایی',   role:'بنیان‌گذار', company:'StartupX',    text:'تیم کپیتال نتورک در کمتر از ۶ ماه ما را به سه VC Tier-1 متصل کردند.', is_active:true, sort_order:1, avatar_url:null, created_at:'' },
    { id:'2', name:'فاطمه محمدی', role:'CTO',         company:'TechFlow',    text:'Pitch Deck شان بسیار حرفه‌ای بود. VC های مختلف از روش آن‌ها تعریف کردند.', is_active:true, sort_order:2, avatar_url:null, created_at:'' },
    { id:'3', name:'رضا کریمی',   role:'CEO',         company:'DataHub',     text:'در عرض ۴۵ روز به Term Sheet رسیدیم.', is_active:true, sort_order:3, avatar_url:null, created_at:'' },
  ];
  const list = items.length > 0 ? items : fallback;

  return (
    <section className="py-6 space-y-4">
      <SectionDivider label="نظرات مشتریان" themeMode={themeMode} />
      <motion.div {...fv} className="px-5 space-y-1">
        <span className="mn-badge">{settings.home_testimonials_badge}</span>
        <h2 className={`text-xl font-black pt-2 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{settings.home_testimonials_heading}</h2>
      </motion.div>
      <div className="flex gap-3 overflow-x-auto scrollbar-none px-5 pb-1">
        {list.map((t, i) => (
          <div key={t.id} className={`${hoverCardClass} mn-card shrink-0 p-4 space-y-3`} style={{ width: 240 }}>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => <Star key={s} size={11} className="text-mn-accent fill-mn-accent" />)}
            </div>
            <p className={`mobile-justified-text text-xs leading-[1.8] line-clamp-4 ${themeMode === 'light' ? 'text-slate-700' : 'text-white/70'}`}>"{t.text}"</p>
            <div className={`flex items-center gap-2.5 pt-1 border-t ${themeMode === 'light' ? 'border-slate-200' : 'border-white/[0.05]'}`}>
              {t.avatar_url ? (
                <img src={t.avatar_url} alt={t.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-slate-900"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                  {t.name[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className={`text-xs font-bold leading-none truncate ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{t.name}</p>
                <p className={`text-[10px] mt-0.5 truncate ${themeMode === 'light' ? 'text-slate-500' : 'text-mn-muted'}`}>{t.role}{t.company ? `, ${t.company}` : ''}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── MnBlogPreview ──────────────────────────────────────── */
const CAT_LABELS: Record<string, string> = {
  investment: 'سرمایه‌گذاری', strategy: 'استراتژی', 'case-study': 'مطالعه موردی',
  'market-analysis': 'تحلیل بازار', negotiation: 'مذاکره', 'financial-modeling': 'مدل مالی',
};
const CAT_COLORS: Record<string, string> = {
  investment: '#06b6d4', strategy: '#f59e0b', 'case-study': '#8b5cf6',
  'market-analysis': '#6366f1', negotiation: '#ec4899', 'financial-modeling': '#10b981',
};

interface BlogPost { id:string; title:string; slug:string; category:string; excerpt:string; author:{name:string}; publishedAt:string; readTime:string; views?:number; featured?:boolean; }

declare const blogPosts: BlogPost[];

export function MnBlogPreview({ settings, onNavigate, themeMode = 'dark' }: { settings: SiteSettings; onNavigate?: Nav; themeMode?: 'dark' | 'light' }) {
  const posts: BlogPost[] = (typeof blogPosts !== 'undefined' ? blogPosts : []).filter((p: BlogPost) => p.featured).slice(0, 3);
  return (
    <section className="py-6 space-y-4">
      <SectionDivider label="مقالات" themeMode={themeMode} />
      <motion.div {...fv} className="flex items-center justify-between px-5">
        <div>
          <span className="mn-badge">{settings.home_blog_preview_badge}</span>
          <h2 className={`text-xl font-black mt-2 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{settings.home_blog_preview_title}</h2>
        </div>
        <button type="button" onClick={() => onNavigate?.('blog', undefined, 'all')}
          className="mn-btn-ghost text-xs shrink-0">
          {settings.home_blog_preview_btn}
        </button>
      </motion.div>
      <div className="space-y-2.5 px-5">
        {posts.map((post: BlogPost, i: number) => {
          const c = CAT_COLORS[post.category] ?? '#6366f1';
          return (
            <motion.article key={post.id} {...fv} transition={{ ...fv.transition, delay: i * 0.07 }}
              className={`${hoverCardClass} mn-card p-4 cursor-pointer active:opacity-80`}
              onClick={() => onNavigate?.('blog-post', post.slug)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: c, background: `${c}18`, border: `1px solid ${c}30` }}>
                  {CAT_LABELS[post.category] ?? post.category}
                </span>
                <span className={`flex items-center gap-1 text-[10px] ${themeMode === 'light' ? 'text-slate-500' : 'text-mn-muted'}`}>
                  <Clock size={10} />{post.readTime}
                </span>
              </div>
              <h3 className={`text-sm font-bold leading-snug line-clamp-2 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{post.title}</h3>
              <p className={`mobile-justified-text mt-1.5 text-[11px] leading-relaxed line-clamp-2 ${themeMode === 'light' ? 'text-slate-600' : 'text-mn-muted'}`}>{post.excerpt}</p>
              <div className={`flex items-center justify-between mt-3 pt-3 border-t ${themeMode === 'light' ? 'border-slate-200' : 'border-white/[0.05]'}`}>
                <span className={`text-[10px] ${themeMode === 'light' ? 'text-slate-500' : 'text-mn-muted'}`}>{post.author.name}</span>
                <span className={`flex items-center gap-1 text-[10px] ${themeMode === 'light' ? 'text-slate-500' : 'text-mn-muted'}`}>
                  <Eye size={10} />{post.views?.toLocaleString('fa-IR') ?? '۰'}
                </span>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

/* ─── MnFAQ ──────────────────────────────────────────────── */
export function MnFAQ({ settings, onNavigate, themeMode = 'dark' }: { settings: SiteSettings; onNavigate?: Nav; themeMode?: 'dark' | 'light' }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = settings.home_faq_items ?? [];

  return (
    <section className="py-6 space-y-4">
      <SectionDivider label="سوالات متداول" themeMode={themeMode} />
      <motion.div {...fv} className="px-5 space-y-1">
        <span className="mn-badge">{settings.home_faq_badge}</span>
        <h2 className={`text-xl font-black pt-2 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{settings.home_faq_title}</h2>
      </motion.div>
      <div className="space-y-2 px-5">
        {items.map((item: any, i: number) => (
          <div key={i} className={`${hoverCardClass} mn-card overflow-hidden transition-all duration-300 ${open === i ? 'border-mn-accent/30' : ''}`}>
            <button type="button" onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-right">
              <span className={`text-sm font-bold leading-snug flex-1 ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{item.q}</span>
              <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}
                className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-full border ${themeMode === 'light' ? 'border-slate-200 bg-slate-100' : 'border-white/10 bg-white/[0.04]'}`}>
                <ChevronDown size={13} className={open === i ? 'text-mn-accent' : (themeMode === 'light' ? 'text-slate-400' : 'text-white/40')} />
              </motion.div>
            </button>
            <motion.div
              initial={false}
              animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}>
              <p className={`mobile-justified-text px-4 pb-4 text-xs leading-[1.85] ${themeMode === 'light' ? 'text-slate-600' : 'text-mn-muted'}`}>{item.a}</p>
            </motion.div>
          </div>
        ))}
      </div>
      <div className="px-5 text-center">
        <button type="button" onClick={() => onNavigate?.('contact')}
          className={`${hoverButtonClass} mn-btn-ghost inline-flex items-center gap-2 mx-auto`}>
          <MessageCircle size={14} />
          سوال دیگری دارید؟
        </button>
      </div>
    </section>
  );
}
