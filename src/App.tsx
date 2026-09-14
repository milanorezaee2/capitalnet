import { useState, useEffect, useRef, useMemo, lazy, Suspense, type CSSProperties } from 'react';

import { AnimatePresence, motion, useScroll, useTransform, type Variants } from 'framer-motion';

import { useLanguage } from './i18n';



// ── Lazy-loaded heavy pages — only fetched when the user actually navigates ──

// This removes ~1.5 MB from the initial JS bundle.

const AdminPanel          = lazy(() => import('./components/admin/AdminPanel'));

const CapitalProcessPage  = lazy(() => import('./features/process/CapitalProcessPage'));

const EnterpriseBlogPostPage = lazy(() => import('./features/blog-post/EnterpriseBlogPostPage'));

const BlogListingPage     = lazy(() => import('./features/blog-post/BlogListingPage'));

const ServiceSubPageView  = lazy(() => import('./features/services/components/ServiceSubPageView'));

const FounderOnboarding   = lazy(() => import('./components/FounderOnboarding'));

const UserDashboard       = lazy(() => import('./components/UserDashboard'));



import {

  ArrowLeft,

  Phone,

  Search,

  CheckCircle2,

  Target,

  Layers,

  Calendar,

  Twitter,

  Linkedin,

  Menu,

  X,

  TrendingUp,

  Shield,

  Users,

  Zap,

  Star,

  Mail,

  Clock,

  MessageCircle,

  Instagram,

  Youtube,

  ChevronUp,

  Send,

  Eye,

  Bookmark,

  Home,

  BookOpen,

  PhoneCall,

  Briefcase,

  User,

  MessageSquare,

} from 'lucide-react';

import Breadcrumb from './components/Breadcrumb';

import ChatWidget from './components/ChatWidget';

import SocialFloatWidget from './components/SocialFloatWidget';

import PopupAdRenderer from './components/PopupAdRenderer';

import InlineBannerRenderer from './components/InlineBannerRenderer';

import AuthModal from './components/AuthModal';

import EvaluationSection from './EvaluationSection';

import type { AuthUser } from './components/AuthModal';

import MobileAppShell from './mobile/MobileAppShell';

import { insertContactMessage } from './lib/messagesApi';

import { fetchPublishedPosts, fetchPostBySlug } from './lib/blogApi';

import { fetchActiveTestimonials } from './lib/testimonialsApi';

import type { Testimonial } from './lib/testimonialsApi';

import { trackPageView } from './lib/analyticsApi';

import { getUserSession, userLogout, onUserAuthChange } from './utils/userStore';

import { useSEO } from './hooks/useSEO';

import { useSettings } from './hooks/useSettings';

import type { SiteSettings, HomeSection, HomeSectionBlock, TextAlign, HeadingLevel, ShowcaseCardData } from './lib/settingsApi';

import type { FontSize, InlineBanner, BannerPage } from './lib/settingsApi';

import type { FooterColumnGroup } from './lib/settingsApi';

import { normalizeExternalUrl } from './lib/urlHelpers';

import { buildPath, resolveRouteLinkId, type RouteParams } from './router/routes';

import { GlobalFixedBanners } from './components/InlineBannerRenderer';

import { ServicePage } from './features/services';

import { FinancialBackground } from './components/FinancialBackground';

import { t as __t } from '@/i18n';



// ── Minimal Suspense fallback — spinner that matches site dark bg ──────────────

function PageSuspenseFallback() {

  return (

    <div style={{

      minHeight: '60vh',

      display: 'flex',

      alignItems: 'center',

      justifyContent: 'center',

      background: 'transparent',

    }}>

      <div style={{

        width: 40, height: 40,

        borderRadius: '50%',

        border: '3px solid rgba(255,255,255,0.10)',

        borderTop: '3px solid #00BCD4',

        animation: 'spin 0.7s linear infinite',

      }} />

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

    </div>

  );

}



// ─── FontSize & Align helpers ─────────────────────────────────────────────────

// MUST be at module top-level so all component functions below can reference them.



function fsToStyle(size: FontSize): React.CSSProperties {

  return { fontSize: `${size}px` };

}



const ALIGN_CLASS: Record<string, string> = {

  right:  'text-right',

  center: 'text-center',

  left:   'text-left',

};

const ac = (align?: string) => ALIGN_CLASS[align ?? 'right'] ?? 'text-right';



const FS_CLASS: Record<string, string> = {

  h1: 'text-5xl',

  h2: 'text-4xl',

  h3: 'text-3xl',

  h4: 'text-2xl',

  h5: 'text-xl',

  h6: 'text-lg',

  p:  'text-base',

  '1':  'text-sm',

  '2':  'text-sm',

  '3':  'text-base',

  '4':  'text-base',

  '5':  'text-lg',

  '6':  'text-lg',

  '7':  'text-xl',

  '8':  'text-xl',

  '9':  'text-2xl',

  '10': 'text-2xl',

  '11': 'text-3xl',

  '12': 'text-3xl',

  '13': 'text-4xl',

  '14': 'text-4xl',

  '15': 'text-5xl',

  '16': 'text-5xl',

  '17': 'text-5xl',

  '18': 'text-5xl',

  '19': 'text-5xl',

  '20': 'text-5xl',

  '21': 'text-5xl',

  '22': 'text-5xl',

  '23': 'text-5xl',

  '24': 'text-5xl',

  '25': 'text-5xl',

  '26': 'text-5xl',

  '27': 'text-5xl',

  '28': 'text-5xl',

  '29': 'text-5xl',

  '30': 'text-5xl',

};



// ─── Animated Background Canvas ──────────────────────────────────────────────

// Desktop version with 160 particles and connection lines

// Mobile-optimized: reduced particles and no connection lines on small screens



function AnimatedCanvas() {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Defer canvas start: wait until page is interactive to avoid blocking LCP ──

  const [active, setActive] = useState(false);



  useEffect(() => {

    // Start canvas only after browser has been idle ≥300ms

    const id = 'requestIdleCallback' in window

      ? (window as any).requestIdleCallback(() => setActive(true), { timeout: 1500 })

      : setTimeout(() => setActive(true), 600);

    return () => {

      if ('cancelIdleCallback' in window) (window as any).cancelIdleCallback(id);

      else clearTimeout(id as unknown as number);

    };

  }, []);



  useEffect(() => {

    if (!active) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;



    let animId: number;

    let paused = false;

    // ── FPS throttle: target 30fps instead of 60fps — halves CPU cost ────────

    const TARGET_FPS = 30;

    const FRAME_MS   = 1000 / TARGET_FPS;

    let lastFrame    = 0;



    const observer = new IntersectionObserver(

      ([entry]) => { paused = !entry.isIntersecting; },

      { threshold: 0 }

    );

    observer.observe(canvas);

    const onVisibility = () => { paused = document.hidden; };

    document.addEventListener('visibilitychange', onVisibility);



    const setSize = () => {

      canvas.width = window.innerWidth;

      canvas.height = window.innerHeight;

    };

    setSize();

    window.addEventListener('resize', setSize);



    interface Particle {

      x: number; y: number;

      vx: number; vy: number;

      r: number;

      alpha: number;

      alphaDir: number;

      alphaSpeed: number;

      maxAlpha: number;

      hue: number;

      phase: number;

      phaseSpeed: number;

      drift: number;

      pulse: number;

      pulseSpeed: number;

    }



    // کاهش از 80 به 50 ذره — هنوز بصری خوب، ولی O(n²) خطوط ۶۱٪ کمتر

    const N = 50;



    const mkParticle = (): Particle => {

      const maxA = Math.random() * 0.45 + 0.12;

      const isTeal = Math.random() > 0.35;

      return {

        x: Math.random() * window.innerWidth,

        y: Math.random() * window.innerHeight,

        vx: (Math.random() - 0.5) * 0.45,

        vy: (Math.random() - 0.5) * 0.38,

        r: Math.random() * 3.5 + 1.2,

        alpha: Math.random() * maxA,

        alphaDir: Math.random() > 0.5 ? 1 : -1,

        alphaSpeed: Math.random() * 0.008 + 0.003,

        maxAlpha: maxA,

        hue: isTeal ? 178 + Math.random() * 18 : 38 + Math.random() * 15,

        phase: Math.random() * Math.PI * 2,

        phaseSpeed: Math.random() * 0.012 + 0.005,

        drift: Math.random() * 0.65 + 0.25,

        pulse: Math.random() * Math.PI * 2,

        pulseSpeed: Math.random() * 0.04 + 0.018,

      };

    };



    const particles: Particle[] = Array.from({ length: N }, mkParticle);



    // ── Pre-bake gradient per particle (hue × 4 stops) — avoid creating

    //    new CanvasGradient objects every frame which causes heavy GC pressure

    // Cache is invalidated only when glow radius changes meaningfully (>2px delta)

    const gradCache = new Map<number, { glow: number; grad: CanvasGradient }>();



    const getGradient = (p: Particle, glow: number): CanvasGradient => {

      const cached = gradCache.get(p.hue);

      // reuse if glow radius hasn't changed by more than 2 pixels

      if (cached && Math.abs(cached.glow - glow) < 2) return cached.grad;

      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, glow);

      g.addColorStop(0,    `hsla(${p.hue}, 85%, 62%, 1)`);

      g.addColorStop(0.35, `hsla(${p.hue}, 80%, 58%, 0.6)`);

      g.addColorStop(0.65, `hsla(${p.hue}, 75%, 52%, 0.25)`);

      g.addColorStop(1,    `hsla(${p.hue}, 70%, 50%, 0)`);

      gradCache.set(p.hue, { glow, grad: g });

      return g;

    };



    const draw = (ts: number) => {

      animId = requestAnimationFrame(draw);

      if (paused) return;

      // ── FPS gate — skip frame if too early ───────────────────────────────

      if (ts - lastFrame < FRAME_MS) return;

      lastFrame = ts;



      ctx.clearRect(0, 0, canvas.width, canvas.height);



      // Connection lines — O(n²) but n=50 now (1225 pairs vs 3160 before)

      const DIST_SQ = 140 * 140;

      for (let i = 0; i < particles.length; i++) {

        for (let j = i + 1; j < particles.length; j++) {

          const dx = particles[i].x - particles[j].x;

          const dy = particles[i].y - particles[j].y;

          const distSq = dx * dx + dy * dy;

          if (distSq < DIST_SQ) {

            const dist = Math.sqrt(distSq);

            const lineAlpha = (1 - dist / 140) * 0.08;

            const hue = (particles[i].hue + particles[j].hue) / 2;

            ctx.beginPath();

            ctx.moveTo(particles[i].x, particles[i].y);

            ctx.lineTo(particles[j].x, particles[j].y);

            ctx.strokeStyle = `hsla(${hue}, 70%, 55%, ${lineAlpha})`;

            ctx.lineWidth = 1.2;

            ctx.stroke();

          }

        }

      }



      for (const p of particles) {

        p.phase += p.phaseSpeed;

        p.pulse += p.pulseSpeed;

        p.x += p.vx + Math.sin(p.phase) * p.drift;

        p.y += p.vy + Math.cos(p.phase * 0.7) * p.drift * 0.65;



        p.alpha += p.alphaSpeed * p.alphaDir;

        if (p.alpha >= p.maxAlpha) { p.alpha = p.maxAlpha; p.alphaDir = -1; }

        if (p.alpha <= 0.02)       { p.alpha = 0.02;       p.alphaDir = 1;  }



        if (p.x < -30) p.x = canvas.width + 30;

        else if (p.x > canvas.width + 30) p.x = -30;

        if (p.y < -30) p.y = canvas.height + 30;

        else if (p.y > canvas.height + 30) p.y = -30;



        const pulseMod = 1 + Math.sin(p.pulse) * 0.35;

        const glow = p.r * 7 * pulseMod;



        // ── translate to particle pos so cached gradient origin stays valid ─

        ctx.save();

        ctx.translate(p.x, p.y);

        ctx.globalAlpha = p.alpha;

        ctx.beginPath();

        ctx.arc(0, 0, glow, 0, Math.PI * 2);

        ctx.fillStyle = getGradient(p, glow);

        ctx.fill();

        ctx.restore();

        ctx.globalAlpha = 1;

      }

    };



    animId = requestAnimationFrame(draw);



    return () => {

      cancelAnimationFrame(animId);

      window.removeEventListener('resize', setSize);

      document.removeEventListener('visibilitychange', onVisibility);

      observer.disconnect();

      gradCache.clear();

    };

  }, []);



  return (

    <canvas

      ref={canvasRef}

      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}

    />

  );

}



// ─── Types ───────────────────────────────────────────────────────────────────



type PageKey = 'home' | 'services' | 'service-detail' | 'process' | 'blog' | 'blog-post' | 'contact' | 'about' | 'evaluation';

type BlogFilter = BlogCategory | 'all';



type SearchItem = {

  id: string;

  type: 'page' | 'blog';

  title: string;

  description: string;

  page: PageKey;

  postSlug?: string;

  searchText: string;

};



// ─── Blog Types ───────────────────────────────────────────────────────────────────



type BlogCategory = 'investment' | 'strategy' | 'case-study' | 'market-analysis' | 'negotiation' | 'financial-modeling';



interface BlogPost {

  id: string;

  title: string;

  slug: string;

  category: BlogCategory;

  tags: string[];

  excerpt: string;

  content: string;

  author: {

    name: string;

    role: string;

    avatar?: string;

    bio?: string;

  };

  publishedAt: string;

  readTime: string;

  featured?: boolean;

  views?: number;

  likes?: number;

  image?: string;

  bookmarked?: boolean;

  relatedPosts?: string[];

}



const pageLinks: Array<{ label: string; page: PageKey }> = [

  { label: 'خدمات', page: 'services' },

  { label: 'فرآیند', page: 'process' },

  { label: 'بلاگ', page: 'blog' },

  { label: 'تماس با ما', page: 'contact' },

  { label: 'درباره ما', page: 'about' },

];



// Returns nav links translated to active language

function usePageLinks(): Array<{ label: string; page: PageKey }> {

  const { t } = useLanguage();

  return [

    { label: t('nav.services'), page: 'services' },

    { label: t('nav.process'),  page: 'process'  },

    { label: t('nav.blog'),     page: 'blog'     },

    { label: t('nav.contact'),  page: 'contact'  },

    { label: t('nav.about'),    page: 'about'    },

  ];

}



function getInitialPage(): { page: PageKey; category?: BlogFilter; postSlug?: string; anchor?: string } {

  if (typeof window === 'undefined') return { page: 'home' };

  if (checkIsAdminRoute()) return { page: 'home' };



  const url = new URL(window.location.href);

  const hash = url.hash.replace(/^#/, '');

  const normalizeRoutePath = (value: string) => {

    const cleaned = value.replace(/^\/|\/$/g, '');

    // پیشوند زبان (fa/ یا en/) جزئی از مسیر صفحه نیست
    if (!cleaned || cleaned === 'fa' || cleaned === 'en') return '';

    if (cleaned.startsWith('fa/')) return cleaned.slice(3);

    if (cleaned.startsWith('en/')) return cleaned.slice(3);

    return cleaned;

  };

  const pathname = normalizeRoutePath(url.pathname);

  const rawPath = pathname || normalizeRoutePath(hash);

  const parts = rawPath.split('/').filter(Boolean);

  const page = parts[0];



  if (page === 'services' || page === 'process' || page === 'blog' || page === 'blog-post' || page === 'contact' || page === 'about' || page === 'evaluation') {

    const result: { page: PageKey; category?: BlogFilter; postSlug?: string; serviceSlug?: string; anchor?: string } = { page: page as PageKey };



    // /services/:slug → service-detail

    if (page === 'services' && parts[1]) {

      result.page = 'service-detail';

      result.serviceSlug = parts[1];

      return result;

    }



    if (page === 'blog' && parts[1] && !parts[1].includes('#')) {

      result.category = parts[1] as BlogFilter;

    }



    if (page === 'blog-post' && parts[1]) {

      const postSlugWithAnchor = parts[1].split('#')[0];

      result.postSlug = postSlugWithAnchor;

      const anchorMatch = parts[1].match(/#(.+)$/);

      if (anchorMatch) {

        result.anchor = anchorMatch[1];

      }

    }



    const anchorMatch = (hash || url.hash).match(/#([^/]+)$/);

    if (anchorMatch && !result.postSlug) {

      result.anchor = anchorMatch[1];

    }



    return result;

  }

  return { page: 'home' };

}



// ─── Data ────────────────────────────────────────────────────────────────────



const regions = [

  { key: 'europe',       count: '+45', icon: '🌍' },

  { key: 'northAmerica', count: '+38', icon: 'US' },

  { key: 'middleEast',   count: '+22', icon: '🌐' },

  { key: 'asia',         count: '+15', icon: '🌏' },

  { key: 'africa',       count: '+8',  icon: '🌍' },

] as const;





// ─── Blog Data ───────────────────────────────────────────────────────────────────



const blogCategories: Record<BlogCategory, { label: string; icon: React.ReactNode; color: string }> = {

  investment: { label: 'سرمایه‌گذاری', icon: <TrendingUp size={18} />, color: 'text-teal-400' },

  strategy: { label: 'استراتژی', icon: <Target size={18} />, color: 'text-amber-400' },

  'case-study': { label: 'مطالعه موردی', icon: <Star size={18} />, color: 'text-purple-400' },

  'market-analysis': { label: 'تحلیل بازار', icon: <Zap size={18} />, color: 'text-blue-400' },

  negotiation: { label: 'مذاکره', icon: <Shield size={18} />, color: 'text-rose-400' },

  'financial-modeling': { label: 'مدل‌سازی مالی', icon: <Layers size={18} />, color: 'text-green-400' },

};



function useBlogCategories(): Record<BlogCategory, { label: string; icon: React.ReactNode; color: string }> {

  const { t } = useLanguage();

  return {

    investment:         { label: t('blogCategories.investment'),      icon: <TrendingUp size={18} />, color: 'text-teal-400'   },

    strategy:           { label: t('blogCategories.strategy'),        icon: <Target size={18} />,     color: 'text-amber-400'  },

    'case-study':       { label: t('blogCategories.caseStudy'),       icon: <Star size={18} />,       color: 'text-purple-400' },

    'market-analysis':  { label: t('blogCategories.marketAnalysis'),  icon: <Zap size={18} />,        color: 'text-blue-400'   },

    negotiation:        { label: t('blogCategories.negotiation'),     icon: <Shield size={18} />,     color: 'text-rose-400'   },

    'financial-modeling': { label: t('blogCategories.financialModeling'), icon: <Layers size={18} />, color: 'text-green-400'  },

  };

}



const blogPosts: BlogPost[] = [

  {

    id: '1',

    title: 'چطور یک Deck VC-Ready بسازیم؟',

    slug: 'vc-ready-deck-guide',

    category: 'investment',

    tags: ['Pitch Deck', 'VC-Ready', 'Executive Summary'],

    excerpt: 'ساختار داستان سرمایه‌گذاری، نکات استراتژیک و ماتریکس‌های مالی که سرمایه‌گذار را قانع می‌کند.',

    content: __t("یک Pitch Deck VC-Ready فقط مجموعه‌ای از اسلایدها نیست؛ بلکه داستان استراتژیک کسب‌وکار شماست که باید در کمتر از ۱۰ دقیقه، سرمایه‌گذار را قانع کند. در این راهنما، ساختار استاندارد و نکات کلیدی را بررسی می‌کنیم.\n\n\n\n**ساختار استاندارد Pitch Deck**\n\n\n\nیک Deck حرفه‌ای معمولاً ۱۰ تا ۱۲ اسلاید دارد و هر اسلاید باید هدف مشخصی داشته باشد:\n\n\n\n۱. **اسلاید عنوان**: نام شرکت، تگ‌لاین و لوگو. ساده و متمرکز.\n\n\n\n۲. **مشکل**: چه مشکلی را حل می‌کنید؟ با آمار و ارقام واقعی.\n\n\n\n۳. **راه‌حل**: محصول یا خدمت شما چگونه مشکل را حل می‌کند؟\n\n\n\n۴. **بازار**: اندازه بازار (TAM, SAM, SOM) با داده‌های معتبر.\n\n\n\n۵. **مدل کسب‌وکار**: چگونه درآمد کسب می‌کنید؟\n\n\n\n۶. **ترکشن**: دستاوردها، کاربران، درآمد و شاخص‌های کلیدی.\n\n\n\n۷. **رقبا**: چه کسانی رقیب شما هستند و چه تفاوتی دارید؟\n\n\n\n۸. **مزیت رقابتی**: چرا شما برنده می‌شوید؟\n\n\n\n۹. **تیم**: چه کسی پشت این پروژه است؟\n\n\n\n۱۰. **پیش‌بینی مالی**: ۳ تا ۵ سال آینده.\n\n\n\n۱۱. **درخواست**: چقدر سرمایه نیاز دارید و برای چه چیزی؟\n\n\n\n**نکات استراتژیک**\n\n\n\n- **داستان‌گویی**: با مشکل شروع کنید و راه‌حل را به عنوان پاسخ معرفی کنید.\n\n- **سادگی**: از اصطلاحات فنی پیچیده پرهیز کنید.\n\n- **داده‌محور**: هر ادعایی با داده پشتیبانی شود.\n\n- **تمرکز**: روی یک پیام اصلی تمرکز کنید.\n\n\n\n**ماتریکس‌های مالی کلیدی**\n\n\n\nسرمایه‌گذاران به این شاخص‌ها توجه ویژه دارند:\n\n\n\n- CAC (هزینه جذب مشتری)\n\n- LTV (ارزش طول عمر مشتری)\n\n- Churn Rate (نرخ ریزش مشتری)\n\n- MRR/ARR (درآمد ماهانه/سالانه تکرارپذیر)\n\n- Gross Margin (حاشیه سود خالص)\n\n\n\n**اشتباهات رایج**\n\n\n\n- بیش از حد فنی بودن\n\n- عدم تمرکز روی مشتری\n\n- عدم ارائه داده‌های واقعی\n\n- اسلایدهای شلوغ و گیج‌کننده\n\n- عدم آمادگی برای سوالات دشوار\n\n\n\n**نتیجه‌گیری**\n\n\n\nیک Pitch Deck VC-Ready نیاز به زمان، تمرین و بازبینی دارد. اما اگر این اصول را رعایت کنید، شانس خود را برای جذب سرمایه به شدت افزایش می‌دهید."),

    author: { name: 'علی رضایی', role: 'Senior VC Advisor' },

    publishedAt: '۱۴۰۳/۰۹/۱۵',

    readTime: '۶ دقیقه',

    featured: true,

    views: 2450,

  },

  {

    id: '2',

    title: 'چه زمانی باید با VCها صحبت کرد؟',

    slug: 'when-to-talk-to-vcs',

    category: 'strategy',

    tags: ['Timing', 'VC Relations', 'Fundraising Strategy'],

    excerpt: 'تشخیص سیگنال‌های رشد، نقاط ورود و آماده‌سازی زمان‌بندی برای تماس با سرمایه‌گذار.',

    content: __t("زمان‌بندی صحیح برای شروع مذاکرات با VCها یکی از حیاتی‌ترین تصمیمات در مسیر جذب سرمایه است. خیلی زود شروع کردن می‌تواند به از دست دادن ارزش سهام منجر شود و خیلی دیر شروع کردن، فرصت‌های رشد را از بین می‌برد.\n\n\n\n**سیگنال‌های آمادگی برای جذب سرمایه**\n\n\n\nقبل از تماس با VCها، باید این سیگنال‌ها را داشته باشید:\n\n\n\n۱. **ترکشن واقعی**: رشد مداوم کاربران یا درآمد در ۳ تا ۶ ماه گذشته\n\n\n\n۲. **مدل کسب‌وکار تاییدشده**: درآمدزایی از محصول یا خدمت شما\n\n\n\n۳. **تیم کامل**: تیمی که نقش‌های کلیدی را پوشش می‌دهد\n\n\n\n۴. **شناخت بازار**: درک عمیق از مشتریان و رقبا\n\n\n\n۵. **چشم‌انداز روشن**: برنامه مشخص برای استفاده از سرمایه\n\n\n\n**نقاط ورود به بازار سرمایه‌گذاری**\n\n\n\n- **Seed Stage**: وقتی محصول را ساخته‌اید و ترکشن اولیه دارید\n\n- **Series A**: وقتی مدل کسب‌وکار تایید شده و نیاز به مقیاس‌دهی دارید\n\n- **Series B**: وقتی در بازار تثبیت شده و آماده گسترش هستید\n\n\n\n**آماده‌سازی زمان‌بندی**\n\n\n\nیک فرآیند جذب سرمایه معمولاً ۳ تا ۶ ماه طول می‌کشد. بنابراین:\n\n\n\n- ۶ ماه قبل: آماده‌سازی Deck و مدل مالی\n\n- ۳ ماه قبل: شناسایی VCهای هدف\n\n- ۲ ماه قبل: شروع تماس‌های اولیه\n\n- ۱ ماه قبل: جلسات Pitch و مذاکرات\n\n\n\n**اشتباهات رایج در زمان‌بندی**\n\n\n\n- شروع مذاکرات بدون ترکشن\n\n- انتظار برای \"زمان مناسب\" که هرگز نمی‌رسد\n\n- شروع همزمان با چندین VC بدون آمادگی\n\n- عدم برنامه‌ریزی برای زمان طولانی فرآیند\n\n\n\n**نتیجه‌گیری**\n\n\n\nزمان مناسب برای جذب سرمایه زمانی است که ترکیبی از ترکشن، تیم و چشم‌انداز داشته باشید. با برنامه‌ریزی دقیق و آمادگی کامل، می‌توانید فرآیند را بهینه کنید و بهترین نتیجه را بگیرید."),

    author: { name: 'فاطمه محمدی', role: 'Investment Strategist' },

    publishedAt: '۱۴۰۳/۰۹/۱۰',

    readTime: '۴ دقیقه',

    featured: true,

    views: 1890,

  },

  {

    id: '3',

    title: 'مهم‌ترین نکات مذاکره با سرمایه‌گذار',

    slug: 'negotiation-tips-with-investors',

    category: 'negotiation',

    tags: ['Term Sheet', 'Negotiation', 'Valuation'],

    excerpt: 'چک‌لیست شروط کلیدی term sheet و تاکتیک‌های محافظت از مالکیت مؤسسین در مذاکره.',

    content: __t("مذاکره با سرمایه‌گذاران یکی از حساس‌ترین مراحل جذب سرمایه است. در اینجا چک‌لیست کامل شروط کلیدی Term Sheet و تاکتیک‌های محافظت از مالکیت مؤسسین را بررسی می‌کنیم.\n\n\n\n**شروط کلیدی Term Sheet**\n\n\n\n۱. **Valuation (ارزش‌گذاری)**:\n\n- Pre-money Valuation: ارزش شرکت قبل از سرمایه\n\n- Post-money Valuation: ارزش شرکت بعد از سرمایه\n\n- نکته: روی Valuation واقعی مذاکره کنید، نه اعداد خیالی\n\n\n\n۲. **Liquidation Preference (اولویت نقدینگی)**:\n\n- 1x Non-participating: استاندارد و عادلانه\n\n- 2x Participating: خطرناک برای مؤسسین\n\n- نکته: از 1x Non-participating دفاع کنید\n\n\n\n۳. **Anti-dilution (ضد رقیق شدن)**:\n\n- Full Ratchet: خطرناک برای مؤسسین\n\n- Weighted Average: متعادل‌تر\n\n- نکته: Weighted Average را ترجیح دهید\n\n\n\n۴. **Board Seats (کرسی‌های هیئت مدیره)**:\n\n- تعداد کرسی‌ها و حق انتخاب\n\n- نکته: تعادل قدرت را حفظ کنید\n\n\n\n۵. **Vesting (واگذاری سهام)**:\n\n- 4 سال با Cliff 1 سال: استاندارد\n\n- نکته: از Cliff طولانی‌تر پرهیز کنید\n\n\n\n**تاکتیک‌های محافظت از مالکیت**\n\n\n\n۱. **آمادگی کامل**:\n\n- تمام شروط را قبل از جلسه مطالعه کنید\n\n- مشاور حقوقی داشته باشید\n\n\n\n۲. **تفکر بلندمدت**:\n\n- فقط روی Valuation تمرکز نکنید\n\n- سایر شروط را در نظر بگیرید\n\n\n\n۳. **انعطاف‌پذیری هوشمند**:\n\n- روی شروط حیاتی ایستادگی کنید\n\n- روی موارد کم‌اهمیت انعطاف نشان دهید\n\n\n\n۴. **شفافیت**:\n\n- واقعیت‌های کسب‌وکار را صادقانه بیان کنید\n\n- از اغراق پرهیز کنید\n\n\n\n**اشتباهات رایج در مذاکره**\n\n\n\n- پذیرش اولین پیشنهاد بدون بررسی\n\n- تمرکز فقط روی Valuation\n\n- عدم مشاوره حقوقی\n\n- عدم درک پیامدهای بلندمدت\n\n- عجله در بستن قرارداد\n\n\n\n**نتیجه‌گیری**\n\n\n\nمذاکره موفق با سرمایه‌گذار نیاز به آمادگی، دانش و استراتژی دارد. با درک شروط کلیدی و تاکتیک‌های صحیح، می‌توانید شرایط عادلانه‌تری برای خود و شرکتتان به دست آورید."),

    author: { name: 'علی رضایی', role: 'Senior VC Advisor' },

    publishedAt: '۱۴۰۳/۰۹/۰۵',

    readTime: '۷ دقیقه',

    featured: false,

    views: 1560,

  },

  {

    id: '4',

    title: 'چطور یک استارتاپ fintech در ۶ هفته وارد مذاکره شد',

    slug: 'fintech-case-study',

    category: 'case-study',

    tags: ['Fintech', 'Case Study', 'Success Story'],

    excerpt: 'چالش: تماس‌های پراکنده و decks ضعیف — راهکار: بازنویسی روایت، مدل مالی روشن و هدف‌گذاری هوشمند؛ نتیجه: Term Sheet در ۶ هفته.',

    content: __t("این مطالعه موردی نشان می‌دهد چگونه یک استارتاپ fintech با استراتژی صحیح، در عرض ۶ هفته از وضعیت نامشخص به Term Sheet رسید.\n\n\n\n**چالش اولیه**\n\n\n\nاستارتاپ PayTech (نام مستعار) یک پلتفرم پرداخت نوین بود که با چالش‌های زیر روبرو بود:\n\n\n\n- تماس‌های پراکنده با VCها بدون استراتژی\n\n- Pitch Deck ضعیف و بدون داستان منسجم\n\n- عدم شفافیت در مدل مالی\n\n- عدم تمرکز روی VCهای مرتبط\n\n- زمان از دست رفته: ۳ ماه بدون نتیجه\n\n\n\n**راهکار اجرا شده**\n\n\n\n۱. **بازنویسی کامل روایت**:\n\n- تمرکز روی مشکل و راه‌حل\n\n- استفاده از داده‌های واقعی\n\n- ساده‌سازی پیام اصلی\n\n\n\n۲. **مدل مالی شفاف**:\n\n- پیش‌بینی ۳ ساله با سناریوهای مختلف\n\n- شاخص‌های کلیدی واضح و قابل اندازه‌گیری\n\n- فرضیات واقع‌بینانه\n\n\n\n۳. **هدف‌گذاری هوشمند**:\n\n- شناسایی ۲۰ VC مرتبط با حوزه fintech\n\n- اولویت‌بندی بر اساس Thesis و چکسایز\n\n- استراتژی تماس شخصی‌سازی شده\n\n\n\n۴. **آماده‌سازی Pitch**:\n\n- تمرین مکرر با تیم\n\n- آمادگی برای سوالات دشوار\n\n- Deck حرفه‌ای و متمرکز\n\n\n\n**نتایج به دست آمده**\n\n\n\n- **کاهش زمان**: از ۳ ماه به ۶ هفته\n\n- **افزایش نرخ دعوت به جلسه**: از ۱۵٪ به ۵۰٪\n\n- **جلسات موفق**: ۸ جلسه از ۱۰ تماس\n\n- **Term Sheet**: ۳ پیشنهاد از VCهای Tier-1\n\n- **ارزش‌گذاری**: ۲۰٪ بالاتر از انتظار اولیه\n\n\n\n**درس‌های کلیدی**\n\n\n\n۱. استراتژی مهم‌تر از سرعت است\n\n۲. آمادگی کامل قبل از تماس ضروری است\n\n۳. تمرکز روی VCهای مرتبط نتایج بهتری می‌دهد\n\n۴. داده‌های واقعی اعتماد می‌سازد\n\n۵. تمرین و آمادگی برای Pitch حیاتی است\n\n\n\n**نتیجه‌گیری**\n\n\n\nبا استراتژی صحیح و آمادگی کامل، می‌توان زمان جذب سرمایه را به شدت کاهش داد و نتایج بهتری گرفت. این مطالعه موردی نشان می‌دهد که کیفیت مهم‌تر از کمیت است."),

    author: { name: 'فاطمه محمدی', role: 'Investment Strategist' },

    publishedAt: '۱۴۰۳/۰۸/۲۸',

    readTime: '۸ دقیقه',

    featured: true,

    views: 3200,

  },

  {

    id: '5',

    title: 'تحلیل بازار VC در خاورمیانه ۱۴۰۳',

    slug: 'vc-market-analysis-middle-east',

    category: 'market-analysis',

    tags: ['Market Analysis', 'Middle East', 'VC Trends'],

    excerpt: 'بررسی روندهای سرمایه‌گذاری خطرپذیر در منطقه، فرصت‌های نوظهور و پیش‌بینی‌های ۱۴۰۴.',

    content: __t("بازار سرمایه‌گذاری خطرپذیر در خاورمیانه در سال ۱۴۰۳ تحولات قابل توجهی را تجربه کرد. در این تحلیل، روندهای کلیدی، فرصت‌های نوظهور و پیش‌بینی‌های ۱۴۰۴ را بررسی می‌کنیم.\n\n\n\n**وضعیت کلی بازار در ۱۴۰۳**\n\n\n\n- **حجم سرمایه‌گذاری**: رشد ۲۵٪ نسبت به سال قبل\n\n- **تعداد معاملات**: افزایش ۳۰٪ در تعداد Dealها\n\n- **میانگین حجم معامله**: از ۲ میلیون به ۲.۵ میلیون دلار\n\n- **کشورهای پیشرو**: امارات، عربستان، مصر، ترکیه\n\n\n\n**روندهای کلیدی**\n\n\n\n۱. **تمرکز بر Fintech**:\n\n- ۳۵٪ از کل سرمایه‌گذاری به Fintech اختصاص شد\n\n- پرداخت دیجیتال، بانکداری نوین و DeFi محبوب‌ترین حوزه‌ها\n\n- رشد ۴۰٪ نسبت به سال قبل\n\n\n\n۲. **ظهور E-commerce**:\n\n- ۲۰٪ از سرمایه‌گذاری به E-commerce\n\n- پلتفرم‌های B2B و B2C مورد توجه قرار گرفتند\n\n- رشد ۳۵٪ در این حوزه\n\n\n\n۳. **Healthtech در حال رشد**:\n\n- ۱۵٪ از سرمایه‌گذاری به Healthtech\n\n- تله‌مدیسین و سلامت دیجیتال محور اصلی\n\n- رشد ۵۰٪ نسبت به سال قبل\n\n\n\n**فرصت‌های نوظهور**\n\n\n\n۱. **SaaS برای بازار خاورمیانه**:\n\n- نیاز به راه‌حل‌های محلی‌سازی شده\n\n- پتانسیل رشد بالا در بازارهای عربی\n\n- فرصت برای Scale-up سریع\n\n\n\n۲. **Edtech**:\n\n- تقاضای رو به رشد برای آموزش آنلاین\n\n- نیاز به محتوای عربی و فارسی\n\n- پتانسیل برای گسترش منطقه‌ای\n\n\n\n۳. **Cleantech**:\n\n- توجه دولت‌ها به انرژی پاک\n\n- فرصت‌های جدید در خورشیدی و بادی\n\n- حمایت سیاستی در حال افزایش\n\n\n\n**پیش‌بینی‌های ۱۴۰۴**\n\n\n\n- **رشد مداوم**: پیش‌بینی رشد ۲۰٪ دیگر\n\n- **تنوع‌بخشی بیشتر**: گسترش به حوزه‌های جدید\n\n- **ورود بازیکنان بین‌المللی**: افزایش حضور VCهای جهانی\n\n- **تمرکز بر Profitability**: از رشد به سودآوری\n\n\n\n**چالش‌ها و موانع**\n\n\n\n- عدم بلوغ کامل اکوسیستم در برخی کشورها\n\n- کمبود استعدادهای فنی\n\n- چالش‌های نظارتی در برخی حوزه‌ها\n\n- نیاز به بیشتر شدن Exitها\n\n\n\n**نتیجه‌گیری**\n\n\n\nبازار VC خاورمیانه در حال بلوغ است و فرصت‌های قابل توجهی برای استارتاپ‌ها و سرمایه‌گذاران وجود دارد. با درک روندها و آمادگی مناسب، می‌توان از این فرصت‌ها بهره‌برداری کرد."),

    author: { name: 'علی رضایی', role: 'Senior VC Advisor' },

    publishedAt: '۱۴۰۳/۰۸/۲۰',

    readTime: '۵ دقیقه',

    featured: false,

    views: 1200,

  },

  {

    id: '6',

    title: 'مدل‌سازی مالی برای Series A',

    slug: 'financial-modeling-series-a',

    category: 'financial-modeling',

    tags: ['Financial Model', 'Series A', 'Metrics'],

    excerpt: 'ساخت مدل مالی جامع برای راند Series A شامل پیش‌بینی درآمد، هزینه‌ها و نرخ رشد.',

    content: __t("یک مدل مالی جامع برای راند Series A یکی از مهم‌ترین مستندات در فرآیند جذب سرمایه است. در این راهنما، نحوه ساخت مدل مالی حرفه‌ای را بررسی می‌کنیم.\n\n\n\n**اجزای کلیدی مدل مالی**\n\n\n\n۱. **پیش‌بینی درآمد**:\n\n- درآمد ماهانه/سالانه برای ۳ تا ۵ سال\n\n- سناریوهای مختلف (Base, Upside, Downside)\n\n- فرضیات واضح و قابل دفاع\n\n\n\n۲. **ساختار هزینه‌ها**:\n\n- هزینه‌های ثابت (اجاره، حقوق ثابت)\n\n- هزینه‌های متغیر (بازاریابی، فروش)\n\n- هزینه‌های سرمایه‌ای (توسعه محصول)\n\n\n\n۳. **شاخص‌های کلیدی**:\n\n- CAC (هزینه جذب مشتری)\n\n- LTV (ارزش طول عمر مشتری)\n\n- Churn Rate (نرخ ریزش)\n\n- MRR/ARR (درآمد تکرارپذیر)\n\n\n\n۴. **جریان‌های نقدی**:\n\n- Cash Flow ماهانه\n\n- Burn Rate (نرخ مصرف سرمایه)\n\n- Runway (مدت باقی‌مانده)\n\n\n\n**ساختار استاندارد مدل**\n\n\n\n**Sheet 1: فرضیات و ورودی‌ها**\n\n- فرضیات بازار\n\n- فرضیات محصول\n\n- فرضیات رشد\n\n\n\n**Sheet 2: درآمد**\n\n- پیش‌بینی درآمد بر اساس کانال‌ها\n\n- رشد ماهانه/فصلی\n\n- میانگین درآمد مشتری\n\n\n\n**Sheet 3: هزینه‌ها**\n\n- هزینه‌های عملیاتی\n\n- هزینه‌های بازاریابی\n\n- هزینه‌های پرسنلی\n\n\n\n**Sheet 4: سود و زیان**\n\n- درآمد کل\n\n- هزینه کل\n\n- سود خالص\n\n\n\n**Sheet 5: جریان نقدی**\n\n- ورودی‌ها و خروجی‌ها\n\n- موقعیت نقدی\n\n- نیاز به سرمایه\n\n\n\n**نکات کلیدی**\n\n\n\n۱. **واقع‌بین بودن**:\n\n- از اغراق پرهیز کنید\n\n- فرضیات قابل دفاع داشته باشید\n\n- سناریوهای مختلف را در نظر بگیرید\n\n\n\n۲. **شفافیت**:\n\n- تمام فرضیات را توضیح دهید\n\n- محاسبات را نشان دهید\n\n- از جداول پیچیده پرهیز کنید\n\n\n\n۳. **قابلیت به‌روزرسانی**:\n\n- مدل باید انعطاف‌پذیر باشد\n\n- تغییرات را بتوان به‌سادگی اعمال کرد\n\n- سناریوهای مختلف را بتوان تست کرد\n\n\n\n**اشتباهات رایج**\n\n\n\n- بیش از حد پیچیده کردن مدل\n\n- عدم توضیح فرضیات\n\n- عدم در نظر گرفتن سناریوهای مختلف\n\n- عدم هم‌راستایی با استراتژی کسب‌وکار\n\n- عدم به‌روزرسانی منظم\n\n\n\n**نتیجه‌گیری**\n\n\n\nیک مدل مالی حرفه‌ای برای Series A باید واقع‌بینانه، شفاف و انعطاف‌پذیر باشد. با رعایت این اصول، می‌توان اعتماد سرمایه‌گذاران را جلب کرد و فرآیند جذب سرمایه را تسهیل نمود."),

    author: { name: 'فاطمه محمدی', role: 'Investment Strategist' },

    publishedAt: '۱۴۰۳/۰۸/۱۵',

    readTime: '۹ دقیقه',

    featured: false,

    views: 980,

  },

];



// ─── Blog Components ───────────────────────────────────────────────────────────────



function AdvancedBlogCard({ 

  post, 

  onRead, 

  onBookmark, 

  onShare, 

  isBookmarked 

}: { 

  post: BlogPost; 

  onRead: (slug: string) => void; 

  onBookmark: (id: string, e: React.MouseEvent) => void; 

  onShare: (post: BlogPost, e: React.MouseEvent) => void; 

  isBookmarked: boolean; 

}) {

  const category = blogCategories[post.category];

  const [isLiked, setIsLiked] = useState(false);

  const [likeCount, setLikeCount] = useState(post.likes || 0);



  const handleLike = (e: React.MouseEvent) => {

    e.stopPropagation();

    setIsLiked(!isLiked);

    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

  };



  return (

    <motion.article

      variants={vCard}

      whileHover={{ y: -6, transition: { duration: 0.3 } }}

      className="card-glass rounded-2xl overflow-hidden border border-white/8 hover:border-white/15 group cursor-pointer"

      onClick={() => onRead(post.slug)}

    >

      {/* Image Placeholder */}

      <div className="relative h-48 bg-gradient-to-br from-teal-500/20 via-amber-500/10 to-purple-500/20 overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.15),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.15),_transparent_50%)]" />

        <div className="absolute top-3 right-3">

          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm ${category.color}`}>

            {category.icon}

            <span className="text-xs font-semibold">{category.label}</span>

          </div>

        </div>

        {post.featured && (

          <div className="absolute top-3 left-3">

            <span className="bg-amber-400/90 text-black text-[10px] font-bold px-2 py-1 rounded-full">

              {__t("ویژه")}

            </span>

          </div>

        )}

        {/* Pattern overlay */}

        <div className="absolute inset-0 opacity-20">

          <div className="w-full h-full" style={{

            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',

            backgroundSize: '24px 24px'

          }} />

        </div>

      </div>



      <div className="p-5">

        {/* Title */}

        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-teal-300 transition-colors line-clamp-2 leading-snug">

          {post.title}

        </h3>



        {/* Excerpt */}

        <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">

          {post.excerpt}

        </p>



        {/* Tags */}

        <div className="flex flex-wrap gap-2 mb-4">

          {post.tags.slice(0, 3).map((tag) => (

            <span key={tag} className="text-[11px] text-white/40 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-full border border-white/8 transition-colors">

              #{tag}

            </span>

          ))}

        </div>



        {/* Meta Info */}

        <div className="flex items-center justify-between pt-4 border-t border-white/8">

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2">

              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">

                {post.author.name.charAt(0)}

              </div>

              <div>

                <p className="text-white text-xs font-medium">{post.author.name}</p>

                <p className="text-white/40 text-[10px]">{post.publishedAt}</p>

              </div>

            </div>

          </div>

          

          <div className="flex items-center gap-2 text-white/40 text-xs">

            <div className="flex items-center gap-1">

              <Clock size={12} />

              {post.readTime}

            </div>

            <span>•</span>

            <div className="flex items-center gap-1">

              <Eye size={12} />

              {post.views?.toLocaleString()}

            </div>

          </div>

        </div>



        {/* Action Buttons */}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">

          <div className="flex items-center gap-2">

            <button

              onClick={handleLike}

              className={`p-2 rounded-lg transition-colors ${isLiked ? 'text-rose-400 bg-rose-400/10' : 'text-white/40 hover:text-white hover:bg-white/10'}`}

              aria-label={__t("لایک")}

            >

              <Star size={16} fill={isLiked ? 'currentColor' : 'none'} />

            </button>

            <span className="text-white/40 text-xs">{likeCount}</span>

            

            <button

              onClick={(e) => onBookmark(post.id, e)}

              className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-white/40 hover:text-white hover:bg-white/10'}`}

              aria-label={__t("ذخیره")}

            >

              <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />

            </button>

            

            <button

              onClick={(e) => onShare(post, e)}

              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"

              aria-label={__t("اشتراک‌گذاری")}

            >

              <Send size={16} />

            </button>

          </div>

          

          <button className="text-teal-400 text-xs font-semibold hover:text-teal-300 transition-colors flex items-center gap-1">

            {__t("مطالعه کامل")}

            <ArrowLeft size={14} />

          </button>

        </div>

      </div>

    </motion.article>

  );

}



function FeaturedPost({ post, onRead }: { post: BlogPost; onRead: (slug: string) => void }) {

  const category = blogCategories[post.category];

  return (

    <motion.div

      variants={vCard}

      className="relative rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-5 md:p-6 group"

    >

      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />



      <div className="relative">

        <div className="flex items-center gap-2 mb-4">

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 ${category.color}`}>

            {category.icon}

            <span className="text-xs font-semibold">{category.label}</span>

          </div>

          <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">

            {__t("ویژه")}

          </span>

        </div>



        <h2 className="text-lg md:text-xl font-black text-white mb-3 group-hover:text-teal-300 transition-colors">

          {post.title}

        </h2>



        <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-2xl">

          {post.excerpt}

        </p>



        <div className="flex flex-wrap gap-1.5 mb-5">

          {post.tags.map((tag) => (

            <span key={tag} className="text-xs text-white/50 bg-white/8 px-2 py-1 rounded-full border border-white/10">

              {tag}

            </span>

          ))}

        </div>



        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">

              {post.author.name.charAt(0)}

            </div>

            <div>

              <p className="text-white text-xs font-medium">{post.author.name}</p>

              <p className="text-white/50 text-[10px]">{post.author.role}</p>

            </div>

          </div>

          <button 

            onClick={() => onRead(post.slug)}

            className="btn-gold px-4 py-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer"

          >

            <ArrowLeft size={14} />

            {__t("مطالعه کامل")}

          </button>

        </div>

      </div>

    </motion.div>

  );

}



function Logo({ onNavigate, settings }: { onNavigate: (page: PageKey) => void; settings?: SiteSettings }) {

  const logoText = settings?.header_logo_text?.trim() || 'Capital Network';

  const logoParts = logoText.split(' ');

  const logoMain = logoParts.slice(0, logoParts.length - 1).join(' ') || logoText;

  const logoSub = logoParts.length > 1 ? logoParts[logoParts.length - 1] : '';



  return (

    <button type="button" onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">

      <div className="relative flex items-center justify-center w-12 h-12 rounded-3xl bg-slate-950 ring-1 ring-white/10 shadow-[0_18px_55px_-34px_rgba(15,23,42,0.9)] overflow-hidden">

        {settings?.header_logo_url ? (

          <img

            src={settings.header_logo_url}

            alt={logoText}

            className="h-full w-full object-contain p-1"

          />

        ) : (

          <>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.18),_transparent_30%)]" />

            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-[18px] bg-slate-900/95 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">

              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-300">

                <defs>

                  <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">

                    <stop offset="0%" stopColor="#FACC15" />

                    <stop offset="100%" stopColor="#38BDF8" />

                  </linearGradient>

                </defs>

                <path d="M10 20.5C13.5 20.5 16.5 18.1 16.5 14.5C16.5 10.9 13.5 8.5 10 8.5" stroke="url(#logoGradient)" strokeWidth="2.2" strokeLinecap="round" />

                <path d="M18 7.5C20.5 9.5 21.5 12.8 20.5 15.6C19.5 18.4 17 20 14 20" stroke="url(#logoGradient)" strokeWidth="2.2" strokeLinecap="round" />

                <path d="M10 7.5L10 20.5" stroke="#F8FAFC" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

                <circle cx="11.5" cy="14.5" r="2.1" fill="#F8FAFC" opacity="0.95" />

                <circle cx="18.5" cy="13.5" r="1.8" fill="#38BDF8" opacity="0.95" />

              </svg>

            </div>

          </>

        )}

      </div>

      <div className="flex flex-col leading-none space-y-0.5">

        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-amber-300 text-[1.06rem] font-black tracking-[-0.04em] drop-shadow-[0_0_10px_rgba(255,255,255,0.14)]">

          {logoMain}

        </span>

        <span className="inline-flex items-center gap-1 text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-amber-300 text-base font-black tracking-[-0.04em] drop-shadow-[0_0_10px_rgba(255,255,255,0.14)]">

          <span className="block h-px w-6 rounded-full bg-sky-400/60" />

          {logoSub || 'Network'}

        </span>

      </div>

    </button>

  );

}



// ─── Navbar ──────────────────────────────────────────────────────────────────



interface NavbarProps {

  currentPage: PageKey;

  onNavigate: (page: PageKey) => void;

  onNavigateServiceDetail: (slug: string) => void;

  currentUser: AuthUser | null;

  onOpenAuth: () => void;

  onOpenDashboard: () => void;

  onOpenSearch: () => void;

  settings?: SiteSettings;

}



function Navbar({ currentPage, onNavigate, onNavigateServiceDetail, currentUser, onOpenAuth, onOpenDashboard, onOpenSearch, settings }: NavbarProps) {

  const [scrolled, setScrolled] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const [subPages, setSubPages] = useState<Array<{ slug: string; name: string; icon: string; color: string }>>([]);

  const isEvaluationPage = currentPage === 'evaluation';

  const { t, lang, toggleLanguage } = useLanguage();

  const translatedPageLinks = usePageLinks();



  // Load visible service sub-pages from localStorage

  useEffect(() => {

    const load = () => {

      try {

        const raw = localStorage.getItem('cn_service_subpages_v1');

        if (!raw) { setSubPages([]); return; }

        const all = JSON.parse(raw) as Array<{ slug: string; name: string; icon: string; color: string; visible: boolean }>;

        setSubPages(all.filter(p => p.visible));

      } catch { setSubPages([]); }

    };

    load();

    // Refresh whenever localStorage changes (e.g. admin saves)

    window.addEventListener('storage', load);

    return () => window.removeEventListener('storage', load);

  }, []);



  useEffect(() => {

    const handler = () => setScrolled(window.scrollY > 20);

    window.addEventListener('scroll', handler);

    return () => window.removeEventListener('scroll', handler);

  }, []);



  // Short display name for the logged-in user

  const displayName = currentUser?.name?.split(' ')[0] ?? currentUser?.email?.split('@')[0] ?? '';



  return (

    <nav

      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${

        isEvaluationPage

          ? 'bg-[#07111d] border-b border-white/10 shadow-lg shadow-black/20'

          : scrolled

            ? 'bg-[#0B1628]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20'

            : 'bg-transparent'

      }`}

    >

      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}

        <div className="flex items-center gap-4">

          <Logo onNavigate={onNavigate} settings={settings} />

          <button

            type="button"

            onClick={onOpenSearch}

            className="hidden sm:inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"

            aria-label={t('nav.searchAriaLabel')}

          >

            <Search size={20} />

          </button>

        </div>



        {/* Desktop Nav */}

        <div className="hidden md:flex flex-1 items-center justify-center gap-8">

          {(settings?.header_nav_links ?? translatedPageLinks).map((l) => {

            if (settings?.header_nav_links && !(l as { visible?: boolean }).visible) return null;

            const isServices = l.page === 'services';

            const isActive = currentPage === l.page || (isServices && currentPage === 'service-detail');

            if (isServices && subPages.length > 0) {

              return (

                <div key={l.label} className="relative"

                  onMouseEnter={() => setServicesDropdownOpen(true)}

                  onMouseLeave={() => setServicesDropdownOpen(false)}>

                  <button

                    type="button"

                    onClick={() => onNavigate('services')}

                    className={`flex items-center gap-1 text-base font-bold transition-colors duration-200 ${isActive ? 'text-amber-300' : 'text-white hover:text-amber-300'}`}>

                    {l.label}

                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`}>

                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

                    </svg>

                  </button>

                  {servicesDropdownOpen && (

                    <div className="absolute top-full right-0 mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl z-50"

                      style={{ background: 'rgba(7,17,30,0.98)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)' }}>

                      {/* Main services link */}

                      <button type="button" onClick={() => { onNavigate('services'); setServicesDropdownOpen(false); }}

                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-right text-white hover:bg-white/5 transition-colors"

                        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

                        <span className="text-base">📋</span>

                        {t('nav.allServices')}

                      </button>

                      {/* Sub-pages */}

                      {subPages.map(sp => (

                        <button key={sp.slug} type="button"

                          onClick={() => { onNavigateServiceDetail(sp.slug); setServicesDropdownOpen(false); }}

                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-right text-slate-300 hover:text-white hover:bg-white/5 transition-colors">

                          <span className="text-sm">{sp.icon || '📄'}</span>

                          {sp.name}

                        </button>

                      ))}

                    </div>

                  )}

                </div>

              );

            }

            return (

              <button

                key={l.label}

                type="button"

                onClick={() => onNavigate(l.page as PageKey)}

                className={`text-base font-bold transition-colors duration-200 ${isActive ? 'text-amber-300' : 'text-white hover:text-amber-300'}`}

              >

                {l.label}

              </button>

            );

          })}

        </div>



        {/* CTA */}

        <div className="hidden md:flex items-center gap-4">

          {currentUser ? (

            /* ── Logged-in state ── */

            <div className="flex items-center gap-3">

              <button

                type="button"

                onClick={onOpenDashboard}

                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-400/20 bg-sky-400/8 hover:bg-sky-400/15 transition-colors"

              >

                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-[11px] font-bold text-[#0B1628]">

                  {displayName.charAt(0).toUpperCase()}

                </div>

                <span className="text-sm font-semibold text-sky-200">{displayName}</span>

              </button>

            </div>

          ) : (

            /* ── Logged-out state ── */

            (settings?.header_login_visible ?? true) && (

              <button

                type="button"

                onClick={onOpenAuth}

                className={`flex items-center gap-1.5 text-base font-bold transition-colors duration-200 ${

                  (settings?.header_login_style ?? 'text') === 'outline'

                    ? 'border rounded-lg px-4 py-2 hover:opacity-80'

                    : (settings?.header_login_style ?? 'text') === 'filled'

                    ? 'rounded-lg px-4 py-2 text-white hover:opacity-80'

                    : 'hover:opacity-80'

                }`}

                style={{

                  color: settings?.header_login_color ?? '#7dd3fc',

                  ...(settings?.header_login_style === 'outline' && {

                    borderColor: settings.header_login_color ?? '#7dd3fc',

                  }),

                  ...(settings?.header_login_style === 'filled' && {

                    backgroundColor: settings.header_login_color ?? '#7dd3fc',

                  }),

                }}

              >

                {settings?.header_login_text ?? t('nav.login')}

              </button>

            )

          )}

          {(settings?.header_cta_visible ?? true) && (

            <button

              type="button"

              onClick={() => onNavigate('evaluation')}

              className="btn-gold px-6 py-3 rounded-lg text-base flex items-center gap-2"

            >

              <ArrowLeft size={18} />

              {settings?.header_cta_text ?? t('nav.requestEvaluation')}

            </button>

          )}

          {/* Language toggle */}

          <button

            type="button"

            onClick={toggleLanguage}

            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 bg-white/8 text-white/80 hover:bg-white/15 hover:text-white transition-colors text-xs font-bold"

            title={lang === 'fa' ? 'Switch to English' : __t("تغییر به فارسی")}

          >

            {lang === 'fa' ? 'EN' : 'FA'}

          </button>

        </div>



        {/* Mobile controls */}

        <div className="flex md:hidden items-center gap-2">

          {currentUser && (

            <button

              type="button"

              onClick={onOpenDashboard}

              className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-[11px] font-bold text-[#0B1628]"

            >

              {displayName.charAt(0).toUpperCase()}

            </button>

          )}

          <button

            type="button"

            onClick={onOpenSearch}

            className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/20 bg-white/10 text-white"

            aria-label={t('nav.searchAriaLabel')}

          >

            <Search size={20} />

          </button>

          <button

            type="button"

            className="text-white hover:text-white"

            onClick={() => setMobileOpen(!mobileOpen)}

          >

            {mobileOpen ? <X size={24} /> : <Menu size={24} />}

          </button>

        </div>

      </div>



      {/* Mobile menu */}

      {mobileOpen && (

        <div className="md:hidden bg-[#0B1628]/98 backdrop-blur-md border-t border-white/10 px-6 py-4 flex flex-col gap-4">

          {(settings?.header_nav_links ?? translatedPageLinks).map((l) => {

            if (settings?.header_nav_links && !(l as { visible?: boolean }).visible) return null;

            const isServices = l.page === 'services';

            return (

              <div key={l.label}>

                <button

                  type="button"

                  className={`w-full text-base font-medium py-2 border-b border-white/5 text-right transition-colors ${

                    currentPage === l.page || (isServices && currentPage === 'service-detail') ? 'text-amber-300' : 'text-white'

                  }`}

                  onClick={() => {

                    onNavigate(l.page as PageKey);

                    setMobileOpen(false);

                  }}

                >

                  {l.label}

                </button>

                {isServices && subPages.length > 0 && (

                  <div className="flex flex-col pr-4 mt-1 space-y-1 border-r border-white/8">

                    {subPages.map(sp => (

                      <button key={sp.slug} type="button"

                        onClick={() => { onNavigateServiceDetail(sp.slug); setMobileOpen(false); }}

                        className="text-sm text-slate-400 py-1.5 text-right hover:text-white transition-colors flex items-center gap-2">

                        <span>{sp.icon || '📄'}</span>

                        {sp.name}

                      </button>

                    ))}

                  </div>

                )}

              </div>

            );

          })}

          {currentUser ? (

            <button

              type="button"

              className="text-sm font-semibold text-sky-300 py-2 text-right"

              onClick={() => { onOpenDashboard(); setMobileOpen(false); }}

            >

              {t('nav.dashboard')} ({displayName})

            </button>

          ) : (

            (settings?.header_login_visible ?? true) && (

              <button

                type="button"

                className="font-bold py-2 text-right text-base"

                style={{ color: settings?.header_login_color ?? '#7dd3fc' }}

                onClick={() => { onOpenAuth(); setMobileOpen(false); }}

              >

                {settings?.header_login_text ?? t('nav.loginRegister')}

              </button>

            )

          )}

          {(settings?.header_cta_visible ?? true) && (

            <button

              type="button"

              className="btn-gold px-6 py-3 rounded-lg text-base text-center font-bold mt-2"

              onClick={() => {

                onNavigate('evaluation');

                setMobileOpen(false);

              }}

            >

              {settings?.header_cta_text ?? t('nav.requestEvaluation')}

            </button>

          )}

          {/* Language toggle in mobile menu */}

          <button

            type="button"

            onClick={() => { toggleLanguage(); setMobileOpen(false); }}

            className="w-full text-left py-2 border-b border-white/5 text-sm font-bold text-white/70 flex items-center gap-2"

          >

            <span className="w-6 h-6 rounded-full border border-white/25 flex items-center justify-center text-[10px] font-black">

              {lang === 'fa' ? 'EN' : 'FA'}

            </span>

            {lang === 'fa' ? 'Switch to English' : __t("تغییر به فارسی")}

          </button>

        </div>

      )}

    </nav>

  );

}



// ─── Hero ─────────────────────────────────────────────────────────────────────



const heroContainer: Variants = {

  hidden: {},

  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },

};



const slideIn: Variants = {

  hidden: { opacity: 0, x: 60 },

  show: {

    opacity: 1,

    x: 0,

    transition: {

      duration: 0.55,

      delay: 0.05,

      ease: [0.22, 1, 0.36, 1],

    },

  },

};



const fadeUp: Variants = {

  hidden: { opacity: 0, y: 18 },

  show: {

    opacity: 1,

    y: 0,

    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },

  },

};



// Shared viewport-triggered variants

const vp = { once: true, margin: '-80px' } as const;



const vFadeUp: Variants = {

  hidden: { opacity: 0, y: 24 },

  show: {

    opacity: 1,

    y: 0,

    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },

  },

};



const vStagger: Variants = {

  hidden: {},

  show: { transition: { staggerChildren: 0.08, delayChildren: 0.02 } },

};



const vCard: Variants = {

  hidden: { opacity: 0, y: 20, scale: 0.98 },

  show: {

    opacity: 1,

    y: 0,

    scale: 1,

    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },

  },

};





// ─── Hero Mobile Canvas ───────────────────────────────────────────────────────

// پس‌زمینه متحرک موبایل: ذرات شبکه VC با خطوط اتصال — جایگزین ویدیو

// کاملاً با Canvas API پیاده‌سازی شده، بدون dependency خارجی

// CPU-friendly: requestAnimationFrame با throttle، حداکثر 28 ذره



function HeroMobileCanvas() {

  const canvasRef = useRef<HTMLCanvasElement>(null);



  useEffect(() => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;



    // تنظیم اندازه canvas

    const resize = () => {

      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;

      canvas.height = canvas.offsetHeight * window.devicePixelRatio;

      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    };

    resize();

    window.addEventListener('resize', resize);



    // ── رنگ‌پالت برند ─────────────────────────────────────────────────────

    const COLORS = [

      'rgba(0,188,212,',    // teal — برند اصلی

      'rgba(245,158,11,',   // amber

      'rgba(56,189,248,',   // sky

      'rgba(167,243,208,',  // mint

      'rgba(255,255,255,',  // white

    ];



    // ── ذرات ────────────────────────────────────────────────────────────────

    const W = () => canvas.offsetWidth;

    const H = () => canvas.offsetHeight;

    const PARTICLE_COUNT = 28;



    type Particle = {

      x: number; y: number;

      vx: number; vy: number;

      r: number;

      color: string;

      alpha: number;

      pulse: number;   // فاز پالس

      pulseSpeed: number;

      isHub: boolean;  // نودهای بزرگ‌تر (شبیه VC hub)

    };



    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {

      const isHub = Math.random() < 0.25;

      return {

        x: Math.random() * W(),

        y: Math.random() * H(),

        vx: (Math.random() - 0.5) * 0.35,

        vy: (Math.random() - 0.5) * 0.35,

        r: isHub ? 3.5 + Math.random() * 2 : 1.5 + Math.random() * 1.5,

        color: COLORS[Math.floor(Math.random() * COLORS.length)],

        alpha: 0.55 + Math.random() * 0.4,

        pulse: Math.random() * Math.PI * 2,

        pulseSpeed: 0.018 + Math.random() * 0.025,

        isHub,

      };

    });



    // ── پس‌زمینه گرادیان ────────────────────────────────────────────────────

    const drawBackground = () => {

      const w = W(); const h = H();

      const grad = ctx.createRadialGradient(w * 0.55, h * 0.3, 0, w * 0.5, h * 0.5, w * 0.85);

      grad.addColorStop(0,   'rgba(0,60,80,0.95)');

      grad.addColorStop(0.4, 'rgba(11,22,40,0.97)');

      grad.addColorStop(1,   'rgba(4,8,18,1)');

      ctx.fillStyle = grad;

      ctx.fillRect(0, 0, w, h);



      // shimmer لایه روی پس‌زمینه

      const shimmer = ctx.createLinearGradient(0, 0, w, h);

      shimmer.addColorStop(0,   'rgba(0,188,212,0.04)');

      shimmer.addColorStop(0.5, 'rgba(245,158,11,0.03)');

      shimmer.addColorStop(1,   'rgba(56,189,248,0.04)');

      ctx.fillStyle = shimmer;

      ctx.fillRect(0, 0, w, h);

    };



    // ── خطوط اتصال ──────────────────────────────────────────────────────────

    const CONNECTION_DIST = 120;

    const drawConnections = () => {

      for (let i = 0; i < particles.length; i++) {

        for (let j = i + 1; j < particles.length; j++) {

          const dx = particles[i].x - particles[j].x;

          const dy = particles[i].y - particles[j].y;

          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {

            const strength = 1 - dist / CONNECTION_DIST;

            const alpha = strength * 0.22;

            // رنگ خط ترکیبی از دو ذره

            const c1 = particles[i].color;

            const c2 = particles[j].color;

            const grad = ctx.createLinearGradient(

              particles[i].x, particles[i].y,

              particles[j].x, particles[j].y

            );

            grad.addColorStop(0, `${c1}${alpha.toFixed(2)})`);

            grad.addColorStop(1, `${c2}${alpha.toFixed(2)})`);

            ctx.beginPath();

            ctx.moveTo(particles[i].x, particles[i].y);

            ctx.lineTo(particles[j].x, particles[j].y);

            ctx.strokeStyle = grad;

            ctx.lineWidth = particles[i].isHub || particles[j].isHub ? 0.8 : 0.4;

            ctx.stroke();

          }

        }

      }

    };



    // ── رندر ذرات ───────────────────────────────────────────────────────────

    const drawParticles = () => {

      particles.forEach(p => {

        p.pulse += p.pulseSpeed;

        const pulseFactor = 1 + Math.sin(p.pulse) * 0.3;

        const r = p.r * pulseFactor;

        const alpha = p.alpha * (0.75 + Math.sin(p.pulse) * 0.25);



        // halo برای hub nodeها

        if (p.isHub) {

          ctx.beginPath();

          ctx.arc(p.x, p.y, r * 3.5, 0, Math.PI * 2);

          const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.5);

          halo.addColorStop(0,   `${p.color}${(alpha * 0.35).toFixed(2)})`);

          halo.addColorStop(1,   `${p.color}0)`);

          ctx.fillStyle = halo;

          ctx.fill();

        }



        // نقطه اصلی

        ctx.beginPath();

        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);

        ctx.fillStyle = `${p.color}${alpha.toFixed(2)})`;

        ctx.fill();

      });

    };



    // ── حرکت ذرات (bounce از لبه‌ها) ──────────────────────────────────────

    const moveParticles = () => {

      const w = W(); const h = H();

      particles.forEach(p => {

        p.x += p.vx;

        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;

        if (p.y < 0 || p.y > h) p.vy *= -1;

        p.x = Math.max(0, Math.min(w, p.x));

        p.y = Math.max(0, Math.min(h, p.y));

      });

    };



    // ── حلقه انیمیشن ────────────────────────────────────────────────────────

    let rafId: number;

    let paused = false;



    // توقف وقتی تب hidden است تا CPU و باتری ذخیره شود

    const onVisibility = () => { paused = document.hidden; };

    document.addEventListener('visibilitychange', onVisibility);



    // توقف وقتی canvas خارج از viewport است

    const observer = new IntersectionObserver(

      ([entry]) => { paused = !entry.isIntersecting; },

      { threshold: 0 }

    );

    observer.observe(canvas);



    const animate = () => {

      rafId = requestAnimationFrame(animate);

      if (paused) return;

      const w = W(); const h = H();

      ctx.clearRect(0, 0, w, h);

      drawBackground();

      drawConnections();

      drawParticles();

      moveParticles();

    };

    animate();



    return () => {

      cancelAnimationFrame(rafId);

      window.removeEventListener('resize', resize);

      document.removeEventListener('visibilitychange', onVisibility);

      observer.disconnect();

    };

  }, []);



  return (

    <canvas

      ref={canvasRef}

      className="absolute inset-0 w-full h-full"

      style={{ display: 'block' }}

    />

  );

}





function Hero({ settings, onNavigate }: { settings: SiteSettings; onNavigate?: (page: PageKey, postSlug?: string, category?: BlogFilter) => void }) {

  const { t } = useLanguage();

  const { scrollY } = useScroll();

  const blob1Y = useTransform(scrollY, [0, 700], [0, -80]);

  const blob2Y = useTransform(scrollY, [0, 700], [0, -130]);

  const blob3Y = useTransform(scrollY, [0, 700], [0, -55]);

  const contentY = useTransform(scrollY, [0, 500], [0, -28]);

  const [heroVideoSrc, setHeroVideoSrc] = useState('/videos/hero/2340-157269921.mp4');

  const videoRef = useRef<HTMLVideoElement>(null);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  // غیرفعال‌سازی ویدیو در موبایل برای بهبود سرعت و مصرف باتری

  const [isMobile, setIsMobile] = useState(false);

  const [videoHeight, setVideoHeight] = useState<'full' | 'medium' | 'short'>('full');

  // ── Video lazy-load: only load video after hero section enters viewport ──────

  const [videoReady, setVideoReady] = useState(false);



  useEffect(() => {

    const check = () => setIsMobile(window.innerWidth < 768);

    check();

    window.addEventListener('resize', check);

    return () => window.removeEventListener('resize', check);

  }, []);



  // ── Lazy-load video: wait for IntersectionObserver before setting src ────────

  useEffect(() => {

    if (isMobile) return; // موبایل: ویدیو نمی‌خواهیم

    const el = videoContainerRef.current;

    if (!el) return;

    const obs = new IntersectionObserver(

      ([entry]) => {

        if (entry.isIntersecting) {

          // ویدیو config را اول بخوان، سپس src را set کن

          fetch('/videos/videos.config.json')

            .then(r => r.json())

            .then((cfg: { hero?: string }) => {

              if (cfg.hero) setHeroVideoSrc(cfg.hero);

            })

            .catch(() => {})

            .finally(() => setVideoReady(true));

          obs.disconnect();

        }

      },

      { threshold: 0.01 }

    );

    obs.observe(el);

    return () => obs.disconnect();

  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps



  useEffect(() => {

    if (videoReady && videoRef.current) {

      videoRef.current.load();

    }

  }, [heroVideoSrc, videoReady]);



  const sectionHeightStyle: CSSProperties = {

    backgroundColor: '#4A6FA5',

    minHeight: videoHeight === 'full' ? '100vh' : undefined,

    height: videoHeight === 'medium' ? '80vh' : videoHeight === 'short' ? '60vh' : undefined,

  };



  return (

    <section className="relative flex flex-col justify-center pt-16 overflow-hidden" style={sectionHeightStyle}>



      {/* ── Video Background (فقط دسکتاپ) ── */}

      <div ref={videoContainerRef} className="absolute inset-0 z-0 overflow-hidden">

        {!isMobile && (

          <video

            ref={videoRef}

            autoPlay

            muted

            loop

            playsInline

            preload="none"

            poster="/og-image.png"

            className="absolute inset-0 w-full h-full object-cover"

            style={{ opacity: videoReady ? 0.55 : 0, transition: 'opacity 0.8s ease' }}

          >

            {/* src فقط بعد از IntersectionObserver اضافه می‌شود — جلوگیری از preload 11 MB */}

            {videoReady && <source src={heroVideoSrc} type="video/mp4" />}

          </video>

        )}

        {/* پس‌زمینه متحرک موبایل — Canvas با ذرات شبکه VC */}

        {isMobile && <HeroMobileCanvas />}

        {/* Dark gradient overlay — keeps text readable */}

        <div

          className="absolute inset-0"

          style={{

            background:

              'linear-gradient(to left, rgba(6,14,28,0.0) 0%, rgba(6,14,28,0.50) 45%, rgba(6,14,28,0.88) 100%)',

          }}

        />

        {/* Bottom fade */}

        <div

          className="absolute bottom-0 left-0 right-0 h-48"

          style={{ background: 'linear-gradient(to bottom, transparent, #4A6FA5)' }}

        />

        {/* Top fade */}

        <div

          className="absolute top-0 left-0 right-0 h-32"

          style={{ background: 'linear-gradient(to top, transparent, rgba(6,14,28,0.7))' }}

        />

      </div>





      {/* top quick-actions removed; moved under feature pills for RTL layout */}



      {/* Parallax blobs - heavier and more visible */}

      <motion.div

        className="blob-1 orb-a absolute bottom-0 right-0 w-[35rem] h-[35rem] sm:w-[52rem] sm:h-[52rem] bg-teal-500/20 rounded-full blur-[180px] pointer-events-none"

        style={{ y: blob1Y }}

      />

      <motion.div

        className="blob-2 orb-b absolute top-1/4 right-8 w-72 h-72 sm:w-[26rem] sm:h-[26rem] bg-teal-400/18 rounded-full blur-[130px] pointer-events-none"

        style={{ y: blob2Y }}

      />

      <motion.div

        className="blob-3 orb-c absolute top-12 left-1/4 w-56 h-56 sm:w-80 sm:h-80 bg-amber-500/16 rounded-full blur-[115px] pointer-events-none"

        style={{ y: blob3Y }}

      />



      {/* Extra depth orbs - larger and stronger */}

      <div className="orb-d absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-cyan-500/12 rounded-full blur-[200px] pointer-events-none" />

      <div className="orb-b absolute bottom-1/4 left-12 w-64 h-64 bg-amber-400/14 rounded-full blur-[120px] pointer-events-none" />

      <div className="orb-a absolute top-1/3 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />



      {/* Sweeping light beams - wider and more visible */}

      <div className="hero-beam" style={{ width: '200px' }} />

      <div className="hero-beam" style={{ animationDelay: '5s', width: '160px', opacity: 0.75 }} />

      <div className="hero-beam" style={{ animationDelay: '11s', width: '280px', opacity: 0.55 }} />



      {/* Content with subtle scroll parallax */}

      <motion.div

        className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 py-20 -mt-5"

        style={{ y: contentY }}

      >

        <motion.div

          className={`flex ${settings.home_hero_title_align === 'center' ? 'justify-center' : settings.home_hero_title_align === 'left' ? 'justify-end' : 'justify-start'}`}

          variants={heroContainer}

          initial="hidden"

          animate="show"

        >

          <div className={`w-full md:w-[58%] lg:w-[52%] flex flex-col ${settings.home_hero_title_align === 'center' ? 'items-center' : settings.home_hero_title_align === 'left' ? 'items-end' : 'items-start'} ${ac(settings.home_hero_title_align)}`}>



            {/* Badge */}

            <motion.div

              variants={slideIn}

              className="inline-flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-4 py-2 mb-8"

            >

              <span className="w-2 h-2 rounded-full bg-green-400" />

              <span className="text-white/80 text-base">{settings.home_hero_badge}</span>

            </motion.div>



            {/* H1 */}

            <motion.div className="space-y-3" style={{ transform: 'translateY(-10px)' }}>

              <motion.h1

                className={`${FS_CLASS[settings.home_hero_title_fs]} ${ac(settings.home_hero_title_align)} leading-tight mb-4 hero-title tracking-[0.0125em]`}

                style={{

                  color: '#F7FBFF',

                  textShadow: '0 0 24px rgba(92, 146, 255, 0.35), 0 2px 0 rgba(255,255,255,0.2)',

                  letterSpacing: '0.01em',

                  fontWeight: 900,

                  fontFamily: 'Beirut, Almarai, sans-serif',

                  WebkitTextStroke: '0.32px rgba(92, 146, 255, 0.3)',

                  display: 'inline-block',

                  transform: 'translateZ(0)',

                }}

              >

                {settings.home_hero_title}

              </motion.h1>



              {/* H2 */}

              <motion.h2

                className={`${FS_CLASS[settings.home_hero_tagline_fs]} ${ac(settings.home_hero_tagline_align)} text-white mb-6 leading-tight tracking-[-0.01em] hero-title hero-tagline`}

              >

                {settings.home_hero_tagline}

              </motion.h2>



              {/* Desc */}

              <motion.div className="space-y-4 mb-10 mt-[10px]">

                <motion.div className="space-y-2">

                  <motion.p className={`text-white/70 ${FS_CLASS[settings.home_hero_desc_fs]} ${ac(settings.home_hero_desc_align)} leading-relaxed tracking-[0.005em] hero-subtitle font-beirut`}>

                    <strong className="hero-desc-highlight block mb-3">

                      {settings.home_hero_desc}

                    </strong>

                  </motion.p>

                  {/* Feature pills */}

                  <div className="flex flex-wrap gap-2 mt-4">

                    {(settings.home_hero_feature_pills ?? []).filter(p => p.visible).map((pill, i) => (

                      <span key={`${pill.label}-${i}`} className="text-xs font-semibold bg-white/8 border border-white/15 text-white/75 px-3 py-1 rounded-full">

                        {pill.label}

                      </span>

                    ))}

                  </div>

                  {/* Action buttons placed under the feature pills (RTL-aware) */}

                  <div className={`mt-6 flex items-center gap-3 ${settings.home_hero_title_align === 'center' ? 'justify-center' : settings.home_hero_title_align === 'left' ? 'justify-end' : 'justify-start'}`}>

                    <button

                      type="button"

                      className="btn-gold px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"

                      onClick={() => onNavigate?.('evaluation')}

                    >

                      {t('hero.startFundraising')}

                      <span className="ml-1">→</span>

                    </button>



                    <button

                      type="button"

                      className="bg-white/10 text-white/90 px-3 py-2 rounded-lg text-sm font-semibold border border-white/15"

                      onClick={() => onNavigate?.('contact')}

                    >

                      {t('hero.immediateConsultation')}

                    </button>

                  </div>

                </motion.div>

              </motion.div>

            </motion.div>



            {/* Stats — هر آمار در کادر اختصاصی مجزا */}

            <motion.div variants={fadeUp} className="flex flex-wrap gap-8 sm:gap-14">

              {settings.home_stats.map((s, i) => (

                <motion.div

                  key={`${s.label ?? 'stat'}-${i}`}

                  className="flex flex-col items-start gap-1"

                  whileHover={{ scale: 1.05 }}

                  transition={{ type: 'spring', stiffness: 300 }}

                >

                  <span className={`text-white font-black ${FS_CLASS[s.value_fs ?? 'h3']} ${ac(s.value_align)}`}>{s.value}</span>

                  <span className={`text-white/70 ${FS_CLASS[s.label_fs ?? 'p']} ${ac(s.label_align)}`}>{s.label}</span>

                </motion.div>

              ))}

            </motion.div>



          </div>

        </motion.div>

      </motion.div>



    </section>

  );

}



// ─── Global Network ───────────────────────────────────────────────────────────



function GlobalNetwork({ settings }: { settings: SiteSettings }) {

  const { t } = useLanguage();

  return (

    <section className="relative py-24" style={{ backgroundColor: 'rgba(11,22,40,0.75)' }} id="network">

      {/* Subtle section blobs */}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-teal-500/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute bottom-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />



      {/* Header — با padding عادی */}

      <div className="relative max-w-7xl mx-auto px-6 text-center">

        <motion.div variants={vFadeUp} initial="hidden" whileInView="show" viewport={vp}>

          <h2 className={`${FS_CLASS[settings.home_network_title_fs]} text-white mb-4 ${ac(settings.home_network_title_align)}`}>{settings.home_network_title}</h2>

          <p className={`text-white mb-14 ${FS_CLASS[settings.home_network_desc_fs ?? 'p']} ${ac(settings.home_network_desc_align)}`}>

            {settings.home_network_desc.includes(__t("5 قاره")) ? (

              <>

                {settings.home_network_desc.replace(__t("5 قاره"), '').trimEnd()}{' '}

                <span className="text-teal-400">{__t("5 قاره")}</span>

              </>

            ) : settings.home_network_desc}

          </p>

        </motion.div>

      </div>



      {/* Region cards

          دسکتاپ: grid یکنواخت ۵ ستون

          موبایل: horizontal scroll با padding کافی برای دیده‌شدن همه کارت‌ها

      */}

      <div className="relative mb-12">

        {/* دسکتاپ */}

        <motion.div

          className="hidden md:grid md:grid-cols-5 gap-4 max-w-7xl mx-auto px-6"

          variants={vStagger}

          initial="hidden"

          whileInView="show"

          viewport={vp}

        >

          {regions.map((r) => (

            <motion.div

              key={r.key}

              variants={vCard}

              whileHover={{ y: -4, transition: { duration: 0.2 } }}

              className="card-glass rounded-2xl p-6 flex flex-col items-center gap-3 cursor-default"

            >

              <div className="text-3xl">

                {r.icon === 'US' ? (

                  <span className="text-white font-black text-2xl">US</span>

                ) : (

                  r.icon

                )}

              </div>

              <span className="text-white font-semibold text-sm">{t('network.regions')[r.key]}</span>

              <span className="text-amber-400 font-black text-base">VC {r.count}</span>

            </motion.div>

          ))}

        </motion.div>



        {/* موبایل: scroll افقی، هر کارت کامل دیده می‌شود */}

        <div

          className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4"

          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none' }}

        >

          {regions.map((r) => (

            <div

              key={r.key}

              className="card-glass rounded-2xl p-5 flex flex-col items-center gap-2.5 flex-shrink-0 snap-center cursor-default"

              style={{ width: 'clamp(130px, calc((100% - 12px) / 2.4), 180px)' }}

            >

              <div className="text-3xl">

                {r.icon === 'US' ? (

                  <span className="text-white font-black text-xl">US</span>

                ) : (

                  r.icon

                )}

              </div>

              <span className="text-white font-semibold text-xs text-center">{t('network.regions')[r.key]}</span>

              <span className="text-amber-400 font-black text-sm">VC {r.count}</span>

            </div>

          ))}

          {/* آخرین آیتم spacer تا کارت آخر کامل نمایش داده شود */}

          <div className="flex-shrink-0 w-4" aria-hidden="true" />

        </div>



        {/* نشانه‌ی scroll در موبایل */}

        <p className="mobile-scroll-hint justify-center mt-2">

          <span>←</span>

          <span>{t('network.scrollHint')}</span>

          <span>→</span>

        </p>

      </div>



      <div className="relative max-w-7xl mx-auto px-6 text-center">

        <motion.p

          variants={vFadeUp}

          initial="hidden"

          whileInView="show"

          viewport={vp}

          className="text-white/35 text-sm mb-16"

        >

          {t('network.confidential')}

        </motion.p>



        {/* Stats row – staggered */}

        <motion.div

          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"

          variants={vStagger}

          initial="hidden"

          whileInView="show"

          viewport={vp}

        >

          {settings.home_network_stats.map((s) => (

            <motion.div

              key={s.label}

              variants={vCard}

              className={`card-glass rounded-2xl p-8 ${ac(s.value_align ?? 'center')}`}

            >

              <div className={`font-black text-white mb-2 ${FS_CLASS[s.value_fs ?? 'h2']} ${ac(s.value_align)}`}>{s.value}</div>

              <div className={`text-white/50 ${FS_CLASS[s.label_fs ?? 'p']} ${ac(s.label_align)}`}>{s.label}</div>

            </motion.div>

          ))}

        </motion.div>

      </div>

    </section>

  );

}



// ─── Services ────────────────────────────────────────────────────────────────



const SERVICES_ICONS = [<Layers size={28} />, <Target size={28} />, <Shield size={28} />];



function Services({ settings }: { settings: SiteSettings }) {

  const { t } = useLanguage();

  const cards = settings.services_cards.map((c, i) => ({

    ...c,

    icon: SERVICES_ICONS[i % SERVICES_ICONS.length],

  }));



  return (

    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: 'rgba(11,22,40,0.75)' }} id="services">

      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />



      <div className="relative max-w-7xl mx-auto px-6">



        {/* ── Section Header ── */}

        <motion.div

          className="text-center mb-14"

          variants={vFadeUp}

          initial="hidden"

          whileInView="show"

          viewport={vp}

        >

          {settings.home_services_badge && (

            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-5">

              {settings.home_services_badge}

            </span>

          )}

          <h2 className={`${FS_CLASS[settings.home_services_title_fs ?? 'h2']} text-white font-black mb-4 ${ac(settings.home_services_title_align)}`}>

            {settings.home_services_title}

          </h2>

          <p className={`text-white/60 ${FS_CLASS[settings.home_services_desc_fs ?? 'p']} max-w-2xl mx-auto leading-relaxed ${ac(settings.home_services_desc_align)}`}>

            {settings.home_services_desc}

          </p>

        </motion.div>



        {/* ── Cards ── */}

        <motion.div

          className="grid grid-cols-1 md:grid-cols-3 gap-6"

          variants={vStagger}

          initial="hidden"

          whileInView="show"

          viewport={vp}

        >

          {cards.map((s) => (

            <div key={s.title} className="relative pt-4">

              {s.popular && (

                <div className="absolute top-0 right-5 z-10">

                  <span className="bg-amber-400 text-[#0B1628] text-xs font-black px-3 py-1.5 rounded-full ring-2 ring-amber-300/60">

                    {t('services.popular')}

                  </span>

                </div>

              )}

              <motion.div

                variants={vCard}

                whileHover={{ y: -6, transition: { duration: 0.25 } }}

                className={`relative card-glass rounded-2xl p-8 flex flex-col h-full ${

                  s.popular

                    ? 'border-amber-400/40 ring-1 ring-amber-400/20 bg-amber-400/5'

                    : ''

                }`}

              >

                <div

                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 self-end ${

                    s.popular ? 'bg-amber-400/20 text-amber-400' : 'bg-white/8 text-white/70'

                  }`}

                >

                  {s.icon}

                </div>



                <h3 className="text-xl font-bold text-white mb-3 text-right">{s.title}</h3>

                <p className="text-white/55 text-sm leading-relaxed mb-6 text-right flex-1">{s.desc}</p>



                <div className="space-y-3 mb-8">

                  {s.features.map((f) => (

                    <div key={f} className="flex items-center gap-2">

                      <CheckCircle2 size={16} className="text-teal-400 shrink-0" />

                      <span className="text-white/70 text-sm">{f}</span>

                    </div>

                  ))}

                </div>



                <div className="border-t border-white/10 pt-5">

                  <button

                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${

                      s.popular

                        ? 'btn-gold'

                        : 'bg-white/8 text-white/70 hover:bg-white/15 hover:text-white border border-white/10'

                    }`}

                  >

                    {s.phase}

                  </button>

                </div>

              </motion.div>

            </div>

          ))}

        </motion.div>

      </div>

    </section>

  );

}



// ─── Why Us ───────────────────────────────────────────────────────────────────



// آیکون‌های ثابت برای WhyUs — ترتیب با settings تطابق دارد

const WHY_US_ICONS = [

  <Users size={22} />, <TrendingUp size={22} />, <Shield size={22} />, <Zap size={22} />,

];



function WhyUs({ settings }: { settings: SiteSettings }) {

  const items = settings.home_why_us.map((item, i) => ({

    ...item,

    icon: WHY_US_ICONS[i % WHY_US_ICONS.length],

  }));



  return (

    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: 'rgba(11,22,40,0.75)' }} id="about">

      <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[450px] h-48 bg-amber-500/5 rounded-full blur-[110px] pointer-events-none" />



      <div className="relative max-w-7xl mx-auto px-6">

        <motion.div

          className="text-center mb-16"

          variants={vFadeUp}

          initial="hidden"

          whileInView="show"

          viewport={vp}

        >

          <h2 className="inline-block bg-white/8 text-white/60 text-2xl md:text-3xl font-semibold px-4 py-1.5 rounded-full mb-5">

            {settings.home_why_us_badge}

          </h2>

          <h2 className={`${FS_CLASS[settings.home_why_us_title_fs ?? 'h2']} text-white mb-4 ${ac(settings.home_why_us_title_align)}`}>

            {settings.home_why_us_title}

          </h2>

          <p className={`text-white ${FS_CLASS[settings.home_why_us_desc_fs ?? 'p']} max-w-2xl mx-auto ${ac(settings.home_why_us_desc_align)}`}>

            {settings.home_why_us_desc}

          </p>

        </motion.div>



        <motion.div

          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"

          variants={vStagger}

          initial="hidden"

          whileInView="show"

          viewport={vp}

        >

          {items.map((item) => (

            <motion.div

              key={item.title}

              variants={vCard}

              whileHover={{ y: -5, transition: { duration: 0.22 } }}

              className={`card-glass rounded-2xl p-6 ${ac(item.title_align ?? 'right')}`}

            >

              <motion.div

                className="w-12 h-12 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-5"

                whileHover={{ scale: 1.12, rotate: -6, transition: { type: 'spring', stiffness: 300 } }}

              >

                {item.icon}

              </motion.div>

              <h3 className={`text-white font-bold mb-2 ${FS_CLASS[item.title_fs ?? 'h4']} ${ac(item.title_align)}`}>{item.title}</h3>

              <p className={`text-white/50 leading-relaxed ${FS_CLASS[item.desc_fs ?? 'p']} ${ac(item.desc_align)}`}>{item.desc}</p>

            </motion.div>

          ))}

        </motion.div>

      </div>

    </section>

  );

}



// FAQ removed per request



// ─── Process Steps ──────────────────────────────────────────────────────────────



const STEP_ICON_MAP: Record<string, React.ReactNode> = {

  layers:    <Layers size={28} />,

  users:     <Users size={28} />,

  check:     <CheckCircle2 size={28} />,

  target:    <Target size={28} />,

  zap:       <Zap size={28} />,

  star:      <Star size={28} />,

  shield:    <Shield size={28} />,

  trending:  <TrendingUp size={28} />,

  handshake: <CheckCircle2 size={28} />,

  chart:     <TrendingUp size={28} />,

  rocket:    <Zap size={28} />,

  search:    <Search size={28} />,

};

const FALLBACK_ICONS = [<Layers size={28} />, <Users size={28} />, <CheckCircle2 size={28} />];



function ProcessSteps({ settings }: { settings: SiteSettings }) {

  const steps = settings.home_process_steps.map((s, i) => ({

    number: String(i + 1).padStart(2, '0'),

    title: s.title,

    description: s.text,

    tags: [] as string[],

    icon: (s.icon && STEP_ICON_MAP[s.icon]) ?? FALLBACK_ICONS[i % FALLBACK_ICONS.length],

    title_fs:    s.title_fs,

    title_align: s.title_align,

    text_fs:     s.text_fs,

    text_align:  s.text_align,

  }));



  return (

      <section className="relative py-24 overflow-hidden bg-white">

      {/* Background gradients */}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-gradient-to-b from-teal-500/8 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-t from-amber-500/6 to-transparent rounded-full blur-[120px] pointer-events-none" />



      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}

        <motion.div variants={vFadeUp} initial="hidden" whileInView="show" viewport={vp} className="text-center mb-20">

          <span className="inline-block bg-gradient-to-r from-teal-500/10 to-amber-500/10 text-teal-600 text-sm font-bold px-5 py-2 rounded-full mb-6 border border-teal-200">

            {settings.home_process_section_badge}

          </span>

          <h2 className={`${FS_CLASS[settings.home_process_section_title_fs]} text-gray-900 mb-5 leading-tight ${ac(settings.home_process_section_title_align)}`}>

            {settings.home_process_section_title.includes('Term Sheet') ? (

              <>

                {settings.home_process_section_title.replace('Term Sheet', '').trimEnd()}{' '}

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-amber-500">Term Sheet</span>

              </>

            ) : settings.home_process_section_title}

          </h2>

          <p className={`${FS_CLASS[settings.home_process_section_desc_fs]} text-gray-600 max-w-2xl mx-auto leading-relaxed ${ac(settings.home_process_section_desc_align)}`}>

            {settings.home_process_section_desc}

          </p>

        </motion.div>



        {/* Steps with timeline */}

        <div className="relative max-w-4xl mx-auto mb-16">

          {/* Vertical line */}

          <div className="absolute right-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 via-amber-400 to-teal-500 hidden md:block" />



          <motion.div

            className="space-y-8"

            variants={vStagger}

            initial="hidden"

            whileInView="show"

            viewport={vp}

          >

            {steps.map((step) => (

              <motion.div

                key={step.number}

                variants={vCard}

                className="relative flex items-start gap-6"

              >

                {/* Timeline dot */}

                <div className="hidden md:flex flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 items-center justify-center shadow-lg shadow-teal-500/30 z-10 ring-4 ring-white">

                  <span className="text-white font-black text-lg">{step.number}</span>

                </div>



                {/* Card */}

                <motion.div

                  whileHover={{ y: -4, scale: 1.01 }}

                  transition={{ duration: 0.2 }}

                  className="flex-1 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-100/30 transition-all duration-300"

                >

                  <div className="flex items-start gap-4 mb-5">

                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/10 to-amber-500/10 flex items-center justify-center text-teal-600">

                      {step.icon}

                    </div>

                    <div className="flex-1">

                      <h3 className={`font-bold text-gray-900 mb-2 ${FS_CLASS[step.title_fs ?? 'h3']} ${ac(step.title_align)}`}>{step.title}</h3>

                      <p className={`text-gray-600 leading-relaxed ${FS_CLASS[step.text_fs ?? 'p']} ${ac(step.text_align)}`}>{step.description}</p>

                    </div>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    {step.tags.map((tag) => (

                      <span

                        key={tag}

                        className="bg-gradient-to-r from-teal-50 to-amber-50 text-teal-700 text-xs font-semibold px-4 py-2 rounded-full border border-teal-100"

                      >

                        {tag}

                      </span>

                    ))}

                  </div>

                </motion.div>

              </motion.div>

            ))}

          </motion.div>

        </div>



        {/* CTA */}

        <motion.div

          variants={vFadeUp}

          initial="hidden"

          whileInView="show"

          viewport={vp}

          className="text-center"

        >

          <div className="inline-block bg-gradient-to-r from-teal-500 to-amber-500 p-[2px] rounded-2xl mb-6">

            <a

              href="#contact"

              className="block bg-white px-10 py-4 rounded-2xl text-base font-bold text-gray-900 hover:bg-gray-50 transition-colors"

            >

              {settings.home_process_section_cta}

            </a>

          </div>

          <p className="text-gray-500 text-sm font-medium">

            {__t("میانگین کل فرآیند:")} <span className="text-teal-600 font-bold">{settings.home_process_avg_days}</span> {__t("بعد از شروع تا واریز")}

          </p>

        </motion.div>

        </div>

    </section>

  );

}



// ─── Client Showcase ─────────────────────────────────────────────────────────────



/** Map an accentColor hex to computed glow/border values */

function accentToGlow(hex: string) {

  return { glowFrom: hex, glowTo: hex + 'bb', border: `${hex}44` };

}



// ── Single flip card ──────────────────────────────────────────────────────────

function FlipCard({ card }: { card: ShowcaseCardData }) {

  const [flipped, setFlipped] = useState(false);

  const ac = card.accentColor;

  const { glowFrom } = accentToGlow(ac);



  return (

    <div

      className="flip-card w-full"

      dir="rtl"

      onClick={() => setFlipped(f => !f)}

    >

      <div className={`flip-card-inner${flipped ? ' is-flipped' : ''}`}>



        {/* ── FRONT ── */}

        <div

          className="flip-card-front overflow-hidden"

          style={{

            background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',

            border: `1px solid ${ac}33`,

            boxShadow: `0 0 0 1px ${ac}18, 0 20px 56px rgba(0,0,0,0.4)`,

          }}

        >

          {/* glow blob */}

          <div

            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none"

            style={{ background: glowFrom }}

          />



          {/* Brand header row */}

          <div className="flex items-center justify-between mb-3">

            <span

              className="brand-logo"

              style={{ color: ac, textShadow: `0 0 14px ${ac}99` }}

            >

              {card.brandSlogan}

            </span>

            <span

              className="text-[10px] font-bold px-2 py-0.5 rounded-full"

              style={{ color: ac, border: `1px solid ${ac}40`, background: `${ac}16` }}

            >

              {card.badge.split('·')[0].trim()}

            </span>

          </div>



          {/* Company name */}

          <h4 className="text-white font-black text-[15px] leading-snug mb-1.5">{card.name}</h4>

          <p className="text-white/50 text-[11px] leading-relaxed mb-auto line-clamp-3">{card.tagline}</p>



          {/* Bottom stat */}

          <div className="flex items-end justify-between pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>

            <div>

              <div className="text-[10px] text-white/35 mb-0.5">{card.statLabel}</div>

              <div className="text-[22px] font-black leading-none" style={{ color: ac }}>{card.stat}</div>

            </div>

            <span

              className="text-[10px] text-white/45 px-2.5 py-1 rounded-lg"

              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}

            >

              {card.domain}

            </span>

          </div>

        </div>



        {/* ── BACK ── */}

        <div

          className="flip-card-back"

          style={{

            background: `linear-gradient(145deg, ${ac}1a 0%, ${ac}08 100%)`,

            border: `1px solid ${ac}44`,

            boxShadow: `0 0 0 1px ${ac}33, 0 20px 56px rgba(0,0,0,0.5)`,

          }}

        >

          {/* watermark initial */}

          <div

            className="absolute inset-0 flex items-center justify-center opacity-[0.04] text-[100px] font-black pointer-events-none select-none"

            style={{ color: ac }}

          >

            {card.brandSlogan[0]}

          </div>



          <div className="relative z-10 flex flex-col h-full">

            <div className="text-[10px] font-black tracking-widest mb-3 uppercase" style={{ color: ac }}>

              {card.brandSlogan}

            </div>

            <p className="text-white font-bold text-sm leading-snug mb-2">

              {card.backTitle}

            </p>

            <p className="text-white/65 text-[11px] leading-relaxed flex-1">

              {card.backDesc}

            </p>

            <div className="flex items-center gap-1.5 mt-3">

              <div className="w-1.5 h-1.5 rounded-full" style={{ background: ac }} />

              <span className="text-[10px] text-white/40">{__t("کپیتال نتورک")}</span>

            </div>

          </div>

        </div>



      </div>

    </div>

  );

}



function ClientShowcase({ settings }: { settings: SiteSettings }) {

  const founders = settings.home_showcase_founders;

  const vcs      = settings.home_showcase_vcs;

  const badge    = settings.home_showcase_badge;

  const title    = settings.home_showcase_title;

  const desc     = settings.home_showcase_desc;

  const badgeFs    = settings.home_showcase_badge_fs;

  const badgeAlign = settings.home_showcase_badge_align;

  const titleFs    = settings.home_showcase_title_fs;

  const titleAlign = settings.home_showcase_title_align;

  const descFs     = settings.home_showcase_desc_fs;

  const descAlign  = settings.home_showcase_desc_align;

  const foundersLabel     = settings.home_showcase_founders_label;

  const foundersLabelFs    = settings.home_showcase_founders_label_fs;

  const foundersLabelAlign = settings.home_showcase_founders_label_align;

  const foundersLabelBold  = settings.home_showcase_founders_label_bold;

  const foundersLabelSub     = settings.home_showcase_founders_label_sub;

  const foundersLabelSubFs    = settings.home_showcase_founders_label_sub_fs;

  const foundersLabelSubAlign = settings.home_showcase_founders_label_sub_align;

  const foundersLabelSubBold  = settings.home_showcase_founders_label_sub_bold;

  const vcsLabel     = settings.home_showcase_vcs_label;

  const vcsLabelFs    = settings.home_showcase_vcs_label_fs;

  const vcsLabelAlign = settings.home_showcase_vcs_label_align;

  const vcsLabelBold  = settings.home_showcase_vcs_label_bold;

  const vcsLabelSub     = settings.home_showcase_vcs_label_sub;

  const vcsLabelSubFs    = settings.home_showcase_vcs_label_sub_fs;

  const vcsLabelSubAlign = settings.home_showcase_vcs_label_sub_align;

  const vcsLabelSubBold  = settings.home_showcase_vcs_label_sub_bold;



  return (

    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: 'rgba(11,22,40,0.80)' }} dir="rtl">

      {/* background blobs */}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-gradient-to-b from-teal-500/8 to-transparent rounded-full blur-[160px] pointer-events-none" />

      <div className="absolute bottom-0 right-0 w-[500px] h-96 bg-gradient-to-t from-violet-500/6 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="absolute top-1/2 left-0 w-72 h-72 bg-gradient-to-r from-amber-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />



      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">



        {/* ── Section header ── */}

        <motion.div

          variants={vFadeUp} initial="hidden" whileInView="show" viewport={vp}

          className="mb-16"

        >

          <div className={`${ALIGN_CLASS[badgeAlign] || 'text-center'} mb-5`}>

            <span className="inline-block bg-amber-400/15 text-amber-400 font-bold px-5 py-2 rounded-full border border-amber-400/25" style={fsToStyle(badgeFs)}>

              {badge}

            </span>

          </div>

          <h2 className="text-white mb-4 leading-tight font-bold" style={{ ...fsToStyle(titleFs), textAlign: titleAlign || 'center' }}>

            {title}

          </h2>

          <p className="text-white/45 max-w-lg mx-auto leading-relaxed" style={{ ...fsToStyle(descFs), textAlign: descAlign || 'center' }}>

            {desc}

          </p>

        </motion.div>



      </div>



      {/* ══════════════════════ FOUNDERS ══════════════════════ */}

      <motion.div variants={vFadeUp} initial="hidden" whileInView="show" viewport={vp} className="mb-6 flex flex-col gap-3 px-6 sm:px-10">

        <div className="inline-flex flex-wrap items-center gap-3">

          <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #2DD4BF, #F59E0B)' }} />

          <div className={`${ALIGN_CLASS[foundersLabelAlign] || 'text-right'} inline-flex flex-wrap items-center gap-3`}>

            <span className={`text-white ${foundersLabelBold ? 'font-bold' : ''}`} style={fsToStyle(foundersLabelFs)}>{foundersLabel}</span>

            <div className="inline-flex px-4 py-2 rounded-lg" style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)' }}>

              <span className={`text-white ${foundersLabelSubBold ? 'font-bold' : 'font-semibold'}`} style={{ ...fsToStyle(foundersLabelSubFs), textAlign: foundersLabelSubAlign || 'right' }}>{foundersLabelSub}</span>

            </div>

          </div>

        </div>

      </motion.div>



      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">

        <motion.div

          variants={vStagger} initial="hidden" whileInView="show" viewport={vp}

          className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-14"

        >

          {founders.map((card, index) => (

            <motion.div key={`${card.name}-${card.badge}-${index}`} variants={vCard}>

              <FlipCard card={card} />

            </motion.div>

          ))}

        </motion.div>



        {/* ── Divider ── */}

        <div className="flex items-center gap-4 mb-12">

          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)' }} />

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

            <div className="w-1.5 h-1.5 rounded-full bg-teal-400/60" />

            <span className="text-white/25 text-[10px] tracking-widest font-bold">CAPITAL NETWORK</span>

            <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60" />

          </div>

          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)' }} />

        </div>

      </div>



      {/* ══════════════════════ VCs ══════════════════════ */}

      <motion.div variants={vFadeUp} initial="hidden" whileInView="show" viewport={vp} className="mb-6 flex flex-col gap-3 px-6 sm:px-10">

        <div className="inline-flex flex-wrap items-center gap-3">

          <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #A78BFA, #F43F5E)' }} />

          <div className={`${ALIGN_CLASS[vcsLabelAlign] || 'text-right'} inline-flex flex-wrap items-center gap-3`}>

            <span className={`text-white ${vcsLabelBold ? 'font-bold' : ''}`} style={fsToStyle(vcsLabelFs)}>{vcsLabel}</span>

            <div className="inline-flex px-4 py-2 rounded-lg" style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)' }}>

              <span className={`text-white ${vcsLabelSubBold ? 'font-bold' : 'font-semibold'}`} style={{ ...fsToStyle(vcsLabelSubFs), textAlign: vcsLabelSubAlign || 'right' }}>{vcsLabelSub}</span>

            </div>

          </div>

        </div>

      </motion.div>



      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">

        <motion.div

          variants={vStagger} initial="hidden" whileInView="show" viewport={vp}

          className="grid grid-cols-2 lg:grid-cols-3 gap-4"

        >

          {vcs.map((card, index) => (

            <motion.div key={`${card.name}-${card.badge}-${index}`} variants={vCard}>

              <FlipCard card={card} />

            </motion.div>

          ))}

        </motion.div>

      </div>

    </section>

  );

}



// ─── Home Blog Preview ───────────────────────────────────────────────────────────



function HomeBlogPreview({ onNavigate, settings }: { onNavigate?: (page: PageKey, postSlug?: string, category?: BlogFilter) => void; settings: SiteSettings }) {

  const featured = blogPosts.filter(p => p.featured).slice(0, 3);



  return (

    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: 'rgba(11,22,40,0.75)' }} dir="rtl" id="blog-preview">

      {/* blobs */}

      <div className="absolute top-0 right-0 w-[500px] h-64 bg-gradient-to-bl from-teal-500/7 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="absolute bottom-0 left-0 w-96 h-64 bg-gradient-to-tr from-amber-500/6 to-transparent rounded-full blur-[120px] pointer-events-none" />



      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">



        {/* header */}

        <motion.div variants={vFadeUp} initial="hidden" whileInView="show" viewport={vp} className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">

          <div>

            <span className="inline-block bg-sky-400/15 text-sky-400 text-sm font-bold px-4 py-1.5 rounded-full mb-4 border border-sky-400/20">

              {settings.home_blog_preview_badge}

            </span>

            <h2 className={`${FS_CLASS[settings.home_blog_preview_title_fs ?? 'h2']} text-white leading-tight ${ac(settings.home_blog_preview_title_align)}`}>

              {settings.home_blog_preview_title}

            </h2>

          </div>

          {onNavigate && (

            <button

              onClick={() => onNavigate('blog', undefined, 'all')}

              className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-bold text-sm border border-teal-400/30 hover:border-teal-400/60 bg-teal-400/8 hover:bg-teal-400/15 px-5 py-2.5 rounded-xl transition-all self-start sm:self-auto shrink-0"

            >

              <ArrowLeft size={16} />

              {settings.home_blog_preview_btn}

            </button>

          )}

        </motion.div>



        {/* cards */}

        <motion.div

          variants={vStagger} initial="hidden" whileInView="show" viewport={vp}

          className="grid grid-cols-1 md:grid-cols-3 gap-6"

        >

          {featured.map((post, idx) => {

            const catMeta = blogCategories[post.category];

            return (

              <motion.article

                key={post.id}

                variants={vCard}

                className="card-glass rounded-2xl overflow-hidden border border-white/8 flex flex-col group cursor-pointer"

                onClick={() => onNavigate?.('blog-post', post.slug)}

              >

                {/* top accent bar */}

                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${idx === 0 ? '#2ED3C9, #3b82f6' : idx === 1 ? '#f59e0b, #ef4444' : '#8b5cf6, #ec4899'})` }} />



                <div className="p-6 flex flex-col flex-1">

                  {/* badge + read time */}

                  <div className="flex items-center justify-between mb-4">

                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${catMeta?.color ?? '#3b82f6'}20`, color: catMeta?.color ?? '#3b82f6', border: `1px solid ${catMeta?.color ?? '#3b82f6'}30` }}>

                      {catMeta?.label ?? post.category}

                    </span>

                    <span className="flex items-center gap-1 text-white/35 text-xs">

                      <Clock size={11} />

                      {post.readTime}

                    </span>

                  </div>



                  <h3 className="text-white font-bold text-base leading-snug mb-3 group-hover:text-teal-300 transition-colors line-clamp-2">

                    {post.title}

                  </h3>

                  <p className="text-white/50 text-sm leading-relaxed flex-1 line-clamp-3">

                    {post.excerpt}

                  </p>



                  {/* footer */}

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/8">

                    <div className="flex items-center gap-2">

                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-sky-500 flex items-center justify-center text-[10px] font-bold text-[#0B1628]">

                        {post.author.name[0]}

                      </div>

                      <span className="text-white/55 text-xs">{post.author.name}</span>

                    </div>

                    <div className="flex items-center gap-1 text-white/30 text-xs">

                      <Eye size={11} />

                      {post.views?.toLocaleString('fa-IR') ?? __t("۰")}

                    </div>

                  </div>

                </div>

              </motion.article>

            );

          })}

        </motion.div>



      </div>

    </section>

  );

}



// ─── FAQ Section ─────────────────────────────────────────────────────────────────



function FAQSection({ settings, onNavigate }: { settings: SiteSettings; onNavigate?: (page: PageKey) => void }) {

  const { t } = useLanguage();

  const [openIdx, setOpenIdx] = useState<number | null>(null);



  const toggle = (i: number) => setOpenIdx(prev => (prev === i ? null : i));



  return (

    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: 'rgba(7,16,32,0.82)' }} dir="rtl" id="faq">

      {/* blobs */}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[180px] pointer-events-none" />



      <div className="relative max-w-3xl mx-auto px-6 sm:px-10">



        {/* header */}

        <motion.div variants={vFadeUp} initial="hidden" whileInView="show" viewport={vp} className="text-center mb-14">

          <span className="inline-block bg-teal-400/15 text-teal-400 text-sm font-bold px-5 py-2 rounded-full mb-5 border border-teal-400/20">

            {settings.home_faq_badge}

          </span>

          <h2 className={`${FS_CLASS[settings.home_faq_title_fs ?? 'h2']} text-white leading-tight mb-3 ${ac(settings.home_faq_title_align)}`}>

            {settings.home_faq_title}

          </h2>

          <p className={`text-white/50 leading-relaxed ${FS_CLASS[settings.home_faq_desc_fs ?? 'p']} ${ac(settings.home_faq_desc_align)}`}>

            {settings.home_faq_desc}

          </p>

        </motion.div>



        {/* accordion */}

        <motion.div variants={vStagger} initial="hidden" whileInView="show" viewport={vp} className="space-y-3">

          {settings.home_faq_items.map((item, i) => {

            const isOpen = openIdx === i;

            return (

              <motion.div

                key={i}

                variants={vCard}

                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${

                  isOpen

                    ? 'border-teal-400/40 bg-teal-400/8'

                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'

                }`}

              >

                <button

                  onClick={() => toggle(i)}

                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-right"

                >

                  <span className={`font-bold leading-snug transition-colors ${FS_CLASS[item.q_fs ?? 'h5']} ${ac(item.q_align)} ${isOpen ? 'text-teal-300' : 'text-white'}`}>

                    {item.q}

                  </span>

                  <span className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${

                    isOpen ? 'border-teal-400/60 bg-teal-400/20 rotate-45' : 'border-white/20 bg-white/5'

                  }`}>

                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">

                      <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={isOpen ? 'text-teal-400' : 'text-white/60'} />

                    </svg>

                  </span>

                </button>



                <div

                  className="overflow-hidden transition-all duration-300"

                  style={{ maxHeight: isOpen ? '300px' : '0px' }}

                >

                  <p className={`text-white/65 leading-relaxed px-6 pb-6 ${FS_CLASS[item.a_fs ?? 'p']} ${ac(item.a_align)}`}>

                    {item.a}

                  </p>

                </div>

              </motion.div>

            );

          })}

        </motion.div>



        {/* bottom CTA */}

        <motion.div variants={vFadeUp} initial="hidden" whileInView="show" viewport={vp} className="text-center mt-12">

          <p className="text-white/40 text-sm mb-4">{t('faq.moreQuestions')}</p>

          <button

            onClick={() => onNavigate?.('contact')}

            className="btn-outline px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2"

          >

            <MessageCircle size={15} />

            {t('faq.contactUs')}

          </button>

        </motion.div>



      </div>

    </section>

  );

}



// ─── Dynamic Section Renderer — رندر سکشن‌های ساخته‌شده در Section Builder ─────



// ─── VideoBlock ───────────────────────────────────────────────────────────────

function getVideoEmbed(src: string): { kind: 'youtube' | 'vimeo' | 'mp4' | 'unknown'; embedUrl: string } {

  const ytMatch = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);

  if (ytMatch) return { kind: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&showinfo=0` };

  const vmMatch = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);

  if (vmMatch) return { kind: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vmMatch[1]}?dnt=1` };

  if (src.match(/\.mp4(\?|$)/i)) return { kind: 'mp4', embedUrl: src };

  return { kind: 'unknown', embedUrl: src };

}



const RATIO_CLASS: Record<string, string> = {

  '16:9': 'aspect-video',

  '9:16': 'aspect-[9/16] max-w-[320px]',

  '4:3':  'aspect-[4/3]',

  '1:1':  'aspect-square',

};



type VideoBlockData = Extract<import('./lib/settingsApi').HomeSectionBlock, { type: 'video' }>;

type ImageGalleryBlockData = Extract<import('./lib/settingsApi').HomeSectionBlock, { type: 'image-gallery' }>;



function VideoBlock({ block }: { block: VideoBlockData }) {

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { kind, embedUrl } = getVideoEmbed(block.src);

  const ratioClass = RATIO_CLASS[block.ratio] ?? 'aspect-video';

  const alignClass = block.align === 'center' ? 'mx-auto' : block.align === 'left' ? 'mr-auto' : 'ml-auto';



  if (!block.src) return null;



  if (block.displayMode === 'lightbox') {

    return (

      <div className={`text-${block.align ?? 'right'}`}>

        <button

          onClick={() => setLightboxOpen(true)}

          className="group relative inline-block rounded-2xl overflow-hidden cursor-pointer"

          style={{ maxWidth: 480, width: '100%' }}

        >

          {/* Thumbnail overlay */}

          <div className={`w-full ${ratioClass} bg-black/40 flex items-center justify-center rounded-2xl border border-white/10 relative overflow-hidden`}>

            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/30 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 backdrop-blur-sm z-10">

              <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1"><path d="M8 5v14l11-7z"/></svg>

            </div>

          </div>

        </button>

        {block.caption && <p className="mt-2 text-sm text-white/50 text-right">{block.caption}</p>}

        {/* Lightbox */}

        {lightboxOpen && (

          <div

            className="fixed inset-0 z-[999] flex items-center justify-center p-4"

            style={{ background: 'rgba(0,0,0,0.92)' }}

            onClick={() => setLightboxOpen(false)}

          >

            <div

              className={`relative w-full ${ratioClass} rounded-2xl overflow-hidden`}

              style={{ maxWidth: 900 }}

              onClick={e => e.stopPropagation()}

            >

              {kind === 'mp4'

                ? <video src={embedUrl} controls autoPlay className="w-full h-full object-contain" />

                : <iframe src={embedUrl + (kind === 'youtube' ? '&autoplay=1' : '?autoplay=1')} title={block.caption ?? 'video'} allow="autoplay; fullscreen" allowFullScreen className="w-full h-full border-0" />

              }

              <button

                onClick={() => setLightboxOpen(false)}

                className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors text-lg font-bold"

              >×</button>

            </div>

          </div>

        )}

      </div>

    );

  }



  // embed mode

  return (

    <div className={`${alignClass} w-full`} style={{ maxWidth: '100%' }}>

      <div className={`w-full ${ratioClass} rounded-2xl overflow-hidden border border-white/10 bg-black/40`}>

        {kind === 'mp4'

          ? <video src={embedUrl} controls className="w-full h-full object-cover" />

          : <iframe src={embedUrl} title={block.caption ?? 'video'} allow="fullscreen; autoplay" allowFullScreen className="w-full h-full border-0" />

        }

      </div>

      {block.caption && <p className="mt-2 text-sm text-white/50 text-right">{block.caption}</p>}

    </div>

  );

}



// ─── ImageGalleryBlock ────────────────────────────────────────────────────────

function ImageGalleryBlock({ block }: { block: ImageGalleryBlockData }) {

  const [current, setCurrent] = useState(0);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const items = block.items.filter(it => it.src);

  const ratioClass = RATIO_CLASS[block.ratio] ?? (block.ratio === 'free' ? '' : 'aspect-video');



  if (items.length === 0) return null;



  const handlePrev = () => setCurrent(c => (c - 1 + items.length) % items.length);

  const handleNext = () => setCurrent(c => (c + 1) % items.length);



  const openLightbox = (idx: number) => { if (block.lightbox) setLightboxIdx(idx); };

  const closeLightbox = () => setLightboxIdx(null);



  // Single image mode

  if (block.mode === 'single') {

    const item = items[0];

    return (

      <div className="w-full">

        <div

          className={`w-full ${ratioClass} rounded-2xl overflow-hidden border border-white/10 bg-black/20 ${block.lightbox ? 'cursor-zoom-in' : ''}`}

          onClick={() => openLightbox(0)}

        >

          <img src={item.src} alt={item.alt} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />

        </div>

        {item.caption && <p className="mt-2 text-sm text-white/50 text-center">{item.caption}</p>}

        {lightboxIdx !== null && (

          <GalleryLightbox items={items} idx={lightboxIdx} onClose={closeLightbox} />

        )}

      </div>

    );

  }



  // Slider mode

  return (

    <div className="w-full space-y-2">

      <div className={`relative w-full ${ratioClass} rounded-2xl overflow-hidden border border-white/10 bg-black/20 group`}>

        <img

          src={items[current].src}

          alt={items[current].alt}

          loading="lazy"

          className={`w-full h-full object-cover transition-opacity duration-500 ${block.lightbox ? 'cursor-zoom-in' : ''}`}

          onClick={() => openLightbox(current)}

        />

        {/* Nav arrows */}

        {items.length > 1 && (

          <>

            <button

              onClick={handlePrev}

              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"

            >

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M15 18l-6-6 6-6"/></svg>

            </button>

            <button

              onClick={handleNext}

              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"

            >

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M9 18l6-6-6-6"/></svg>

            </button>

            {/* Dots */}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">

              {items.map((_, i) => (

                <button

                  key={i}

                  onClick={() => setCurrent(i)}

                  className="w-2 h-2 rounded-full transition-all"

                  style={{ background: i === current ? '#00BCD4' : 'rgba(255,255,255,0.4)', transform: i === current ? 'scale(1.3)' : 'scale(1)' }}

                />

              ))}

            </div>

          </>

        )}

      </div>

      {items[current].caption && (

        <p className="text-sm text-white/50 text-center">{items[current].caption}</p>

      )}

      {lightboxIdx !== null && (

        <GalleryLightbox items={items} idx={lightboxIdx} onClose={closeLightbox} />

      )}

    </div>

  );

}



function GalleryLightbox({ items, idx, onClose }: {

  items: Array<{ src: string; alt: string; caption?: string }>;

  idx: number;

  onClose: () => void;

}) {

  const [current, setCurrent] = useState(idx);

  const handlePrev = () => setCurrent(c => (c - 1 + items.length) % items.length);

  const handleNext = () => setCurrent(c => (c + 1) % items.length);

  return (

    <div

      className="fixed inset-0 z-[999] flex items-center justify-center p-4"

      style={{ background: 'rgba(0,0,0,0.93)' }}

      onClick={onClose}

    >

      <div className="relative flex items-center justify-center w-full max-w-4xl" onClick={e => e.stopPropagation()}>

        {items.length > 1 && (

          <button onClick={handlePrev} className="absolute right-0 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors">

            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><path d="M15 18l-6-6 6-6"/></svg>

          </button>

        )}

        <div className="px-14 w-full">

          <img src={items[current].src} alt={items[current].alt} loading="lazy" className="max-h-[85vh] w-full object-contain rounded-xl" />

          {items[current].caption && (

            <p className="text-center text-white/60 text-sm mt-3">{items[current].caption}</p>

          )}

          <p className="text-center text-white/30 text-xs mt-1">{current + 1} / {items.length}</p>

        </div>

        {items.length > 1 && (

          <button onClick={handleNext} className="absolute left-0 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors">

            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><path d="M9 18l6-6-6-6"/></svg>

          </button>

        )}

        <button onClick={onClose} className="absolute top-0 left-0 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors text-lg font-bold">×</button>

      </div>

    </div>

  );

}



function DynBlock({ block }: { block: HomeSectionBlock }) {

  const getAlignClass = (align?: TextAlign) => {

    const resolved = align ?? 'right';

    return resolved === 'center' ? 'text-center' : resolved === 'left' ? 'text-left' : 'text-right';

  };



  const alignClass = 'align' in block ? getAlignClass(block.align) : 'text-right';

  const headingSizes: Record<HeadingLevel, string> = {

    1: 'text-4xl md:text-5xl font-black',

    2: 'text-3xl md:text-4xl font-bold',

    3: 'text-2xl font-bold',

    4: 'text-xl font-semibold',

    5: 'text-lg font-semibold',

    6: 'text-base font-semibold',

  };



  switch (block.type) {

    case 'heading': {

      const Tag = `h${block.level}` as 'h1'|'h2'|'h3'|'h4'|'h5'|'h6';

      return <Tag className={`${headingSizes[block.level]} text-white leading-tight ${alignClass}`}>{block.text}</Tag>;

    }

    case 'text': {

      const level = block.level;

      if (level) {

        const Tag = `h${level}` as 'h1'|'h2'|'h3'|'h4'|'h5'|'h6';

        return <Tag className={`${headingSizes[level]} text-white leading-tight ${getAlignClass(block.align)}`}>{block.text}</Tag>;

      }

      return <p className={`text-white/70 text-base leading-relaxed ${alignClass}`}>{block.text}</p>;

    }

    case 'badge':

      return (

        <div className={getAlignClass(block.align)}>

          <span className="inline-block bg-teal-500/15 text-teal-300 text-sm font-bold px-5 py-2 rounded-full border border-teal-500/25">

            {block.text}

          </span>

        </div>

      );

    case 'stat':

      return (

        <div className={`flex flex-col items-center gap-1 p-4 rounded-2xl bg-white/5 border border-white/10 ${getAlignClass(block.align)}`}>

          <span className="text-3xl font-black text-white">{block.value}</span>

          <span className="text-sm text-white/55">{block.label}</span>

        </div>

      );

    case 'button':

      return (

        <div className={getAlignClass(block.align)}>

          <a

            href={block.href || '#contact'}

            className={block.variant === 'primary'

              ? 'inline-block btn-gold px-6 py-3 rounded-xl text-base font-semibold'

              : 'inline-block btn-outline px-6 py-3 rounded-xl text-base font-semibold'}

          >

            {block.text}

          </a>

        </div>

      );

    case 'divider':

      return <hr className="border-white/10 my-2" />;

    case 'media':

      if (block.kind === 'emoji') {

        return <div className={`text-6xl ${getAlignClass(block.align)}`}>{block.src}</div>;

      }

      return (

        <div className={getAlignClass(block.align)}>

          <img src={block.src} alt={block.alt} loading="lazy" className="max-w-xs mx-auto rounded-2xl" />

        </div>

      );

    case 'video':

      if ((block as typeof block & { hidden?: boolean }).hidden) return null;

      return <VideoBlock block={block} />;

    case 'image-gallery':

      if ((block as typeof block & { hidden?: boolean }).hidden) return null;

      return <ImageGalleryBlock block={block} />;

    case 'cards':

      return (

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          {block.items.map((item, i) => {

            const TitleTag = `h${item.titleLevel ?? 4}` as 'h1'|'h2'|'h3'|'h4'|'h5'|'h6';

            return (

              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10">

                <TitleTag className={`text-white font-bold mb-2 ${getAlignClass(item.align ?? block.align)}`}>{item.title}</TitleTag>

                <p className={`text-white/60 text-sm leading-relaxed ${getAlignClass(item.align ?? block.align)}`}>{item.desc}</p>

              </div>

            );

          })}

        </div>

      );

    case 'steps':

      return (

        <div className="space-y-4">

          {block.items.map((item, i) => {

            const TitleTag = `h${item.titleLevel ?? 4}` as 'h1'|'h2'|'h3'|'h4'|'h5'|'h6';

            return (

              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">

                <span className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 text-sm font-black flex items-center justify-center flex-shrink-0">

                  {i + 1}

                </span>

                <div className="flex-1">

                  <TitleTag className={`text-white font-bold mb-1 ${getAlignClass(item.align ?? block.align)}`}>{item.title}</TitleTag>

                  <p className={`text-white/60 text-sm ${getAlignClass(item.align ?? block.align)}`}>{item.text}</p>

                </div>

              </div>

            );

          })}

        </div>

      );

    default:

      return null;

  }

}



function DynSection({ section }: { section: HomeSection }) {

  if (!section.visible) return null;

  const safeBlocks = Array.isArray(section.blocks) ? section.blocks : [];

  const statBlocks = safeBlocks.filter(b => b?.type === 'stat');

  const otherBlocks = safeBlocks.filter(b => b?.type !== 'stat');

  return (

    <section className="py-16 px-6" style={{ background: 'rgba(7,16,32,0.6)' }} dir="rtl">

      <div className="max-w-5xl mx-auto space-y-6">

        {otherBlocks.map(block => (

          <DynBlock key={block.id} block={block} />

        ))}

        {statBlocks.length > 0 && (

          <div className={`grid gap-4 ${statBlocks.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : statBlocks.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>

            {statBlocks.map(block => (

              <DynBlock key={block.id} block={block} />

            ))}

          </div>

        )}

      </div>

    </section>

  );

}



// ─── Testimonials ───────────────────────────────────────────────────────────────



const AVATAR_COLORS = ['#3b82f6','#0d9488','#f59e0b','#8b5cf6','#ec4899','#10b981'];



// module-level cache: testimonials فقط یک بار از DB فتچ می‌شوند

let _testimonialsCache: Testimonial[] | null = null;



function Testimonials({ settings }: { settings: SiteSettings }) {

  const [dbItems, setDbItems] = useState<Testimonial[]>(_testimonialsCache ?? []);



  useEffect(() => {

    if (_testimonialsCache) return; // از cache استفاده کن

    fetchActiveTestimonials().then(rows => {

      if (rows.length > 0) {

        _testimonialsCache = rows;

        setDbItems(rows);

      }

    });

  }, []);



  // fallback hardcoded

  const hardcoded = [

    { id:'1', name:__t("علی رضایی"),   role:__t("بنیان‌گذار و CEO"), company:'StartupX', text:__t("تیم کپیتال نتورک ما را در کمتر از ۶ ماه به سه VC Tier-1 متصل کردند. بدون آنها Series A ما ممکن نبود."), is_active:true, sort_order:1, avatar_url:null, created_at:'' },

    { id:'2', name:__t("فاطمه محمدی"), role:__t("بنیان‌گذار و CTO"), company:'TechFlow', text:__t("دیتا روم و Pitch Deck شان بسیار حرفه‌ای بود. VC های مختلف از ما تشویق کردند که بر روی نقاط تاکید آنها تمرکز کنیم."), is_active:true, sort_order:2, avatar_url:null, created_at:'' },

    { id:'3', name:__t("رضا کریمی"),   role:__t("بنیان‌گذار و CEO"), company:'DataHub',  text:__t("سرعت پاسخگویی و کیفیت معرفی‌ها فوق‌العاده بود. در عرض ۴۵ روز به Term Sheet رسیدیم."), is_active:true, sort_order:3, avatar_url:null, created_at:'' },

    { id:'4', name:__t("نیلا احمدی"),  role:__t("مدیر محصول"),       company:'Analytics AI', text:__t("فرآیند کاملاً شفاف بود. مشاوره‌های آنها ما را در تصمیم‌گیری درباره معماری تکنولوژی کمک کرد."), is_active:true, sort_order:4, avatar_url:null, created_at:'' },

  ] as Testimonial[];



  const items = dbItems.length > 0 ? dbItems : hardcoded;



  return (

    <section className="relative py-20 sm:py-32 overflow-hidden" style={{ backgroundColor: 'rgba(11,22,40,0.75)' }}>

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="inline-block bg-blue-400/15 border border-blue-400/20 text-blue-400 text-sm font-bold px-5 py-2 rounded-full mb-8 tracking-wide">

            {settings.home_testimonials_badge}

          </span>

          <h2 className={`${FS_CLASS[settings.home_testimonials_heading_fs]} text-white leading-tight mb-6 ${ac(settings.home_testimonials_heading_align)}`}>

            {settings.home_testimonials_heading}

          </h2>

          <p className={`${FS_CLASS[settings.home_testimonials_desc_fs]} text-white/55 leading-relaxed max-w-2xl mx-auto ${ac(settings.home_testimonials_desc_align)}`}>

            {settings.home_testimonials_desc}

          </p>

        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {items.map((item, idx) => (

            <div key={item.id} className="card-glass rounded-2xl p-8 border border-white/8 flex flex-col justify-between">

              <div>

                <div className="flex items-center mb-4">

                  {[...Array(5)].map((_, i) => (

                    <Star key={i} size={18} className="text-amber-400 fill-amber-400" />

                  ))}

                </div>

                <p className="text-white/75 text-base leading-relaxed mb-6">"{item.text}"</p>

              </div>

              <div className="flex items-center">

                {item.avatar_url ? (

                  <img src={item.avatar_url} alt={item.name}

                    className="w-12 h-12 rounded-full object-cover ml-4 flex-shrink-0" />

                ) : (

                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold ml-4 flex-shrink-0"

                    style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>

                    {item.name[0]}

                  </div>

                )}

                <div>

                  <p className="text-white font-bold">{item.name}</p>

                  <p className="text-white/55 text-sm">{item.role}{item.company ? `, ${item.company}` : ''}</p>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>

  );

}



// ─── Footer ──────────────────────────────────────────────────────────────────



function Footer({ onNavigate, settings }: { onNavigate: (page: PageKey, postSlug?: string, category?: BlogFilter, anchor?: string) => void; settings: SiteSettings }) {

  const { t } = useLanguage();

  const [email, setEmail] = useState('');

  const [showBackToTop, setShowBackToTop] = useState(false);

  const [showTerms, setShowTerms] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [termsChecked, setTermsChecked] = useState(false);



  const getFooterGroups = (groups?: FooterColumnGroup[], fallbackLinks: Array<any> = []) =>

    groups && groups.length > 0 ? groups : [{ title: '', links: fallbackLinks }];



  const termsSections = (settings.footer_terms_modal_sections ?? []).filter(section => section && (section.title || section.body));

  const termsTitle = settings.footer_terms_modal_title ?? t('footer.termsDefault');

  const termsSubtitle = settings.footer_terms_modal_subtitle ?? 'Capital Network';

  const termsAcceptText = settings.footer_terms_modal_accept_text ?? '';

  const termsFooterNote = settings.footer_terms_modal_footer_note ?? '';



  useEffect(() => {

    const handleScroll = () => {

      setShowBackToTop(window.scrollY > 500);

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);



  const scrollToTop = () => {

    window.scrollTo({ top: 0, behavior: 'smooth' });

  };



  return (

    <>

      {/* Back to Top Button */}

      {showBackToTop && (

        <motion.button

          initial={{ opacity: 0, scale: 0.8 }}

          animate={{ opacity: 1, scale: 1 }}

          exit={{ opacity: 0, scale: 0.8 }}

          onClick={scrollToTop}

          className="back-to-top-btn fixed bottom-8 left-8 z-50 w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full shadow-lg shadow-teal-500/30 flex items-center justify-center text-white hover:shadow-xl hover:shadow-teal-500/40 transition-all hover:scale-110"

        >

          <ChevronUp size={24} />

        </motion.button>

      )}



      <footer className="border-t border-white/8 relative overflow-hidden" style={{ backgroundColor: 'rgba(7,16,32,0.78)' }}>

      {/* Background gradients */}

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">

        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500/5 to-transparent rounded-full blur-[120px]" />

        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-500/5 to-transparent rounded-full blur-[100px]" />

      </div>



      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">



        {/* Links Row — 4 dynamic columns */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-12 text-right">



          {/* Column 1 */}

          <div>

            <h4 className="text-white font-bold text-sm mb-4">{settings.footer_col1_title ?? t('footer.col1Default')}</h4>

            {getFooterGroups(settings.footer_col1_groups, settings.footer_col1_links ?? []).map((group, gi) => (

              <div key={gi} className="mb-5">

                {group.title ? <h5 className="text-white/60 text-xs mb-3">{group.title}</h5> : null}

                <ul className="space-y-3">

                  {group.links.filter(l => l.visible).map((link, i) => (

                    <li key={i}>

                      <button

                        onClick={() => onNavigate(link.page as PageKey, undefined, undefined, link.anchor)}

                        className="text-white hover:text-teal-400 text-sm transition-colors text-right w-full">

                        {link.label}

                      </button>

                    </li>

                  ))}

                  {(settings.footer_col1_show_terms ?? false) && gi === getFooterGroups(settings.footer_col1_groups, settings.footer_col1_links ?? []).length - 1 && (

                    <li>

                      <button

                        onClick={() => { setShowTerms(true); setTermsChecked(false); }}

                        className="text-amber-400 hover:text-amber-300 text-sm transition-colors text-right w-full flex items-center gap-2"

                      >

                        <Shield size={13} className="shrink-0" />

                        {settings.footer_terms_link_label ?? t('footer.termsDefault')}

                      </button>

                    </li>

                  )}

                </ul>

              </div>

            ))}

          </div>



          {/* Column 2 */}

          <div>

            <h4 className="text-white font-bold text-sm mb-4">{settings.footer_col2_title ?? t('footer.col2Default')}</h4>

            {getFooterGroups(settings.footer_col2_groups, settings.footer_col2_links ?? []).map((group, gi) => (

              <div key={gi} className="mb-5">

                {group.title ? <h5 className="text-white/60 text-xs mb-3">{group.title}</h5> : null}

                <ul className="space-y-3">

                  {group.links.filter(l => l.visible).map((link, i) => (

                    <li key={i}>

                      <button

                        onClick={() => onNavigate(link.page as PageKey, undefined, link.category as BlogFilter | undefined)}

                        className="text-white hover:text-teal-400 text-sm transition-colors text-right w-full">

                        {link.label}

                      </button>

                    </li>

                  ))}

                  {(settings.footer_col2_show_terms ?? false) && gi === getFooterGroups(settings.footer_col2_groups, settings.footer_col2_links ?? []).length - 1 && (

                    <li>

                      <button

                        onClick={() => { setShowTerms(true); setTermsChecked(false); }}

                        className="text-amber-400 hover:text-amber-300 text-sm transition-colors text-right w-full flex items-center gap-2"

                      >

                        <Shield size={13} className="shrink-0" />

                        {settings.footer_terms_link_label ?? t('footer.termsDefault')}

                      </button>

                    </li>

                  )}

                </ul>

              </div>

            ))}

          </div>



          {/* Column 3 */}

          <div>

            <h4 className="text-white font-bold text-sm mb-4">{settings.footer_col3_title ?? t('footer.col3Default')}</h4>

            {getFooterGroups(settings.footer_col3_groups, settings.footer_col3_links ?? []).map((group, gi) => (

              <div key={gi} className="mb-5">

                {group.title ? <h5 className="text-white/60 text-xs mb-3">{group.title}</h5> : null}

                <ul className="space-y-3">

                  {group.links.filter(l => l.visible).map((link, i) => (

                    <li key={i}>

                      <button

                        onClick={() => onNavigate(link.page as PageKey, undefined, undefined, link.anchor)}

                        className="text-white hover:text-teal-400 text-sm transition-colors text-right w-full">

                        {link.label}

                      </button>

                    </li>

                  ))}

                  {(settings.footer_col3_show_terms ?? true) && (

                    <li>

                      <button

                        onClick={() => { setShowTerms(true); setTermsChecked(false); }}

                        className="text-amber-400 hover:text-amber-300 text-sm transition-colors text-right w-full flex items-center gap-2"

                      >

                        <Shield size={13} className="shrink-0" />

                        {settings.footer_terms_link_label ?? t('footer.termsDefault')}

                      </button>

                    </li>

                  )}

                </ul>

              </div>

            ))}

          </div>



          {/* Column 4 — Contact */}

          <div>

            <h4 className="text-white font-bold text-sm mb-4">{settings.footer_col4_title ?? t('footer.col4Default')}</h4>

            <ul className="space-y-3">

              {(settings.footer_col4_show_email ?? true) && (

                <li>

                  <a href={`mailto:${settings.contact_email}`} className="text-white hover:text-teal-400 text-sm transition-colors flex items-center gap-2">

                    <Mail size={14} className="text-teal-400" />

                    {settings.contact_email}

                  </a>

                </li>

              )}

              {(settings.footer_col4_show_phone ?? true) && (

                <li>

                  <a href={`tel:${settings.contact_phone.replace(/\s/g,'')}`} className="text-white hover:text-teal-400 text-sm transition-colors flex items-center gap-2">

                    <Phone size={14} className="text-teal-400" />

                    {settings.contact_phone}

                  </a>

                </li>

              )}

              {(settings.footer_col4_show_whatsapp ?? true) && settings.contact_whatsapp && (

                <li>

                  <a href={`https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g,'')}`} className="text-white hover:text-teal-400 text-sm transition-colors flex items-center gap-2">

                    <MessageCircle size={14} className="text-teal-400" />

                    {settings.contact_whatsapp}

                  </a>

                </li>

              )}

              {(settings.footer_col4_show_hours ?? true) && (

                <li>

                  <span className="text-white text-sm flex items-center gap-2">

                    <Clock size={14} className="text-teal-400" />

                    {settings.working_hours}

                  </span>

                </li>

              )}

              {(settings.footer_col4_show_response ?? true) && (

                <li>

                  <span className="text-white text-sm flex items-center gap-2">

                    <CheckCircle2 size={14} className="text-amber-400" />

                    {settings.footer_col4_response_label ?? t('footer.response24h')}

                  </span>

                </li>

              )}

            </ul>

          </div>

        </div>



        {/* Brand + Newsletter Row */}

        <div className="border-t border-white/8 pt-12 mb-12">

          <div className="max-w-2xl mx-auto text-center">

            <div className="flex items-center justify-center mb-4">

              <Logo onNavigate={onNavigate} settings={settings} />

            </div>

            <p className="text-white text-sm leading-relaxed mb-8">

              {settings.footer_brand_tagline ?? __t("اتصال استارتاپ از Seed تا Series B به شبکه جهانی سرمایه‌گذاران Tier-1 در ۵ قاره.")}

            </p>



            {/* Newsletter */}

            {(settings.footer_newsletter_visible ?? true) && (

              <div className="space-y-4 max-w-md mx-auto">

                <div className="flex items-center justify-center gap-4 mb-2">

                  <CheckCircle2 size={14} className="text-teal-400" />

                  <span className="text-white/60 text-xs">{t('footer.noSpam')}</span>

                  <CheckCircle2 size={14} className="text-teal-400" />

                  <span className="text-white/60 text-xs">{t('footer.confidential')}</span>

                </div>

                <p className="text-white/70 text-sm leading-relaxed">

                  {settings.footer_newsletter_desc ?? __t("هفته‌ای یک بار، بهترین فرصت‌های سرمایه‌گذاری و insights از دنیای VC را دریافت کنید.")}

                </p>

                <div className="flex flex-row-reverse gap-2">

                  <input

                    type="email"

                    value={email}

                    onChange={(e) => setEmail(e.target.value)}

                    placeholder={settings.footer_newsletter_placeholder ?? `${t('blog.emailPlaceholder')}...`}

                    className="flex-1 bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20 text-right transition-all"

                  />

                  <button

                    className="btn-gold px-6 py-3 rounded-xl shrink-0 font-semibold text-sm hover:shadow-lg hover:shadow-amber-500/20 transition-all"

                    onClick={() => setEmail('')}

                  >

                    {settings.footer_newsletter_btn ?? t('blog.subscribe')}

                  </button>

                </div>

              </div>

            )}

          </div>

        </div>



        {/* Bottom bar — Copyright + Social */}

        <div className="border-t border-gradient-to-r from-transparent via-teal-400/20 to-transparent pt-8 flex flex-col md:flex-row items-center justify-between gap-4">

          {settings.footer_bottom_order === 'social-first' ? (

            <>

              <div className="flex items-center gap-4 flex-wrap">

                <span className="text-white/50 text-xs">

                  {settings.footer_bottom_right_text?.split('[social]')[0] ?? t('footer.followUs')}

                </span>

                {settings.social_twitter && (

                  <a href={normalizeExternalUrl(settings.social_twitter)} target="_blank" rel="noopener noreferrer" className="text-white hover:text-teal-400 transition-colors hover:scale-110 transform">

                    <Twitter size={18} />

                  </a>

                )}

                {settings.social_linkedin && (

                  <a href={normalizeExternalUrl(settings.social_linkedin)} target="_blank" rel="noopener noreferrer" className="text-white hover:text-teal-400 transition-colors hover:scale-110 transform">

                    <Linkedin size={18} />

                  </a>

                )}

                {settings.social_instagram && (

                  <a href={normalizeExternalUrl(settings.social_instagram)} target="_blank" rel="noopener noreferrer" className="text-white hover:text-teal-400 transition-colors hover:scale-110 transform">

                    <Instagram size={18} />

                  </a>

                )}

                {settings.social_youtube && (

                  <a href={normalizeExternalUrl(settings.social_youtube)} target="_blank" rel="noopener noreferrer" className="text-white hover:text-teal-400 transition-colors hover:scale-110 transform">

                    <Youtube size={18} />

                  </a>

                )}

                {settings.footer_bottom_right_text?.includes('[social]') ? (

                  <span className="text-white/50 text-xs">{settings.footer_bottom_right_text.split('[social]')[1]}</span>

                ) : null}

              </div>

              <p className="text-white text-xs">{settings.footer_bottom_left_text ?? '© 2026 Capital Network. All rights reserved 2026 ®'}</p>

            </>

          ) : (

            <>

              <p className="text-white text-xs">{settings.footer_bottom_left_text ?? '© 2026 Capital Network. All rights reserved 2026 ®'}</p>

              <div className="flex items-center gap-4 flex-wrap">

                <span className="text-white/50 text-xs">

                  {settings.footer_bottom_right_text?.split('[social]')[0] ?? t('footer.followUs')}

                </span>

                {settings.social_twitter && (

                  <a href={normalizeExternalUrl(settings.social_twitter)} target="_blank" rel="noopener noreferrer" className="text-white hover:text-teal-400 transition-colors hover:scale-110 transform">

                    <Twitter size={18} />

                  </a>

                )}

                {settings.social_linkedin && (

                  <a href={normalizeExternalUrl(settings.social_linkedin)} target="_blank" rel="noopener noreferrer" className="text-white hover:text-teal-400 transition-colors hover:scale-110 transform">

                    <Linkedin size={18} />

                  </a>

                )}

                {settings.social_instagram && (

                  <a href={normalizeExternalUrl(settings.social_instagram)} target="_blank" rel="noopener noreferrer" className="text-white hover:text-teal-400 transition-colors hover:scale-110 transform">

                    <Instagram size={18} />

                  </a>

                )}

                {settings.social_youtube && (

                  <a href={normalizeExternalUrl(settings.social_youtube)} target="_blank" rel="noopener noreferrer" className="text-white hover:text-teal-400 transition-colors hover:scale-110 transform">

                    <Youtube size={18} />

                  </a>

                )}

                {settings.footer_bottom_right_text?.includes('[social]') ? (

                  <span className="text-white/50 text-xs">{settings.footer_bottom_right_text.split('[social]')[1]}</span>

                ) : null}

              </div>

            </>

          )}

        </div>

      </div>

    </footer>



      {/* ── Terms & Conditions Modal ── */}

      {showTerms && (

        <div

          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"

          style={{ backgroundColor: 'rgba(4,10,24,0.88)', backdropFilter: 'blur(6px)' }}

          onClick={(e) => { if (e.target === e.currentTarget) setShowTerms(false); }}

        >

          <div

            className="relative w-full max-w-2xl rounded-2xl border border-white/10 flex flex-col"

            style={{ background: 'linear-gradient(160deg,#071428 0%,#060e1c 100%)', maxHeight: '90vh' }}

            dir="rtl"

          >

            {/* Header */}

            <div className="flex items-center justify-between px-7 py-5 border-b border-white/8 shrink-0">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/25 flex items-center justify-center">

                  <Shield size={17} className="text-amber-400" />

                </div>

                <div>

                  <h2 className="text-white font-bold text-base leading-none">{termsTitle}</h2>

                  <p className="text-white/40 text-xs mt-1">{termsSubtitle}</p>

                </div>

              </div>

              <button

                onClick={() => setShowTerms(false)}

                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"

              >

                <X size={16} />

              </button>

            </div>



            {/* Scrollable Body */}

            <div className="overflow-y-auto px-7 py-6 flex-1 text-sm leading-8 text-white/70 space-y-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>



              {termsSections.map((section, index) => (

                <section key={`${section.title}-${index}`}>

                  <h3 className="text-amber-400 font-bold text-sm mb-2">{section.title || t('بند {n}', { n: index + 1 })}</h3>

                  <p className="whitespace-pre-line">{section.body}</p>

                </section>

              ))}



              <p className="text-white/30 text-xs border-t border-white/8 pt-4">{termsFooterNote}</p>

            </div>



            {/* Footer / Accept */}

            <div className="px-7 py-5 border-t border-white/8 shrink-0" style={{ background: 'rgba(6,14,28,0.95)' }}>

              {!termsAccepted ? (

                <label className="flex items-start gap-3 cursor-pointer group">

                  <div className="relative mt-0.5 shrink-0">

                    <input

                      type="checkbox"

                      checked={termsChecked}

                      onChange={(e) => setTermsChecked(e.target.checked)}

                      className="sr-only"

                    />

                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${termsChecked ? 'bg-amber-500 border-amber-500' : 'border-white/25 bg-white/5 group-hover:border-amber-400/50'}`}>

                      {termsChecked && <CheckCircle2 size={12} className="text-white" />}

                    </div>

                  </div>

                  <div className="flex-1">

                    <p className="text-white/80 text-sm leading-relaxed">

                      {termsAcceptText}

                    </p>

                    <button

                      disabled={!termsChecked}

                      onClick={() => { setTermsAccepted(true); setTimeout(() => setShowTerms(false), 1200); }}

                      className={`mt-3 w-full py-2.5 rounded-xl text-sm font-bold transition-all ${termsChecked ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/25' : 'bg-white/5 text-white/25 cursor-not-allowed'}`}

                    >

                      {t('footer.acceptConfirm')}

                    </button>

                  </div>

                </label>

              ) : (

                <div className="flex items-center justify-center gap-2 py-1">

                  <CheckCircle2 size={18} className="text-teal-400" />

                  <span className="text-teal-400 font-bold text-sm">{t('footer.termsAccepted')}</span>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </>

  );

}



// ─── Dedicated Pages ───────────────────────────────────────────────────────



function HomePage({ settings, onNavigate }: { settings: SiteSettings; onNavigate?: (page: PageKey, postSlug?: string, category?: BlogFilter) => void }) {

  const banners: InlineBanner[] = settings.inline_banners ?? [];

  const { t: tr } = useLanguage();

  useSEO({

    title: tr('seo.home'),

    description: tr('seo.homeDesc'),

    pageKey: 'home',

    pageData: {

      telephone:       settings.contact_phone,

      email:           settings.contact_email,

      whatsapp:        settings.contact_whatsapp,

      workingHours:    settings.working_hours,

      social_twitter:  settings.social_twitter,

      social_linkedin: settings.social_linkedin,

      social_instagram:settings.social_instagram,

      social_youtube:  settings.social_youtube,

      faqItems:        settings.home_faq_items?.map(f => ({ q: f.q, a: f.a })),

    },

    seoPage: settings.seo_pages?.['home'],

  });



  // useMemo: جلوگیری از ایجاد مجدد نودهای React در هر render

  const BUILT_IN_SECTIONS = useMemo<Record<string, React.ReactNode>>(() => ({

    'hero':             <Hero settings={settings} onNavigate={onNavigate} />,

    'network':          <GlobalNetwork settings={settings} />,

    'services':         <Services settings={settings} />,

    'evaluation':       <EvaluationSection />,

    'why-us':           <WhyUs settings={settings} />,

    'cta':              null,

    'process':          <ProcessSteps settings={settings} />,

    'client-showcase':  <ClientShowcase settings={settings} />,

    'testimonials':     <Testimonials settings={settings} />,

    'blog-preview':     <HomeBlogPreview onNavigate={onNavigate} settings={settings} />,

    'faq':              <FAQSection settings={settings} onNavigate={onNavigate} />,

  // eslint-disable-next-line react-hooks/exhaustive-deps

  }), [settings, onNavigate]);



  const safeSectionOrder = Array.isArray(settings.home_section_order) ? settings.home_section_order : [];

  const safeHomeSections = Array.isArray(settings.home_sections) ? settings.home_sections : [];



  return (

    <>

      <InlineBannerRenderer banners={banners} page="home" section="top" />

      {safeSectionOrder.map((key, idx) => (

        <div key={key} id={key}>

          {BUILT_IN_SECTIONS[key]}

          {key === 'hero'        && <InlineBannerRenderer banners={banners} page="home" section="after-hero" />}

          {key === 'network'     && <InlineBannerRenderer banners={banners} page="home" section="after-network" />}

          {key === 'services'    && <InlineBannerRenderer banners={banners} page="home" section="after-services" />}

          {key === 'why-us'      && <InlineBannerRenderer banners={banners} page="home" section="after-why-us" />}

          {key === 'process'     && <InlineBannerRenderer banners={banners} page="home" section="after-process" />}

          {idx === safeSectionOrder.length - 1 && <InlineBannerRenderer banners={banners} page="home" section="before-footer" />}

        </div>

      ))}

      {/* ── سکشن‌های دینامیک Section Builder ── */}

      {safeHomeSections

        .filter(s => s?.visible)

        .map(s => <DynSection key={s.id} section={s} />)

      }

    </>

  );

}



function ServicesPage({ onNavigate, settings }: { onNavigate: (page: PageKey) => void; settings: SiteSettings }) {

  useSEO({

    title: __t("خدمات"),

    description: __t("سرویس‌های VC-Ready سازی، مدل مالی، Pitch Deck و مشاوره استراتژیک برای استارتاپ‌ها"),

    pageKey: 'services',

    pageData: {

      telephone:        settings.contact_phone,

      email:            settings.contact_email,

      social_twitter:   settings.social_twitter,

      social_linkedin:  settings.social_linkedin,

      social_instagram: settings.social_instagram,

      social_youtube:   settings.social_youtube,

      servicesCards: settings.services_cards?.map(c => ({

        title:    c.title,

        desc:     c.desc,

        features: c.features ?? [],

      })),

      servicesHighlights: settings.services_highlights?.map(h => ({

        value: h.value,

        label: h.label,

      })),

    },

    seoPage: settings.seo_pages?.['services'],

  });



  const banners: InlineBanner[] = settings.inline_banners ?? [];

  return (

    <div className="min-h-screen bg-[#0d1829] text-white" dir="rtl">

      <InlineBannerRenderer banners={banners} page="services" section="top" />

      <ServicePage onNavigate={onNavigate} banners={banners} />

      <InlineBannerRenderer banners={banners} page="services" section="before-footer" />

    </div>

  );

}



function ProcessPage({ onNavigate, settings }: { onNavigate: (page: PageKey) => void; settings: SiteSettings }) {

  useSEO({

    title: __t("فرآیند جذب سرمایه — VC-Ready سازی استارتاپ"),

    description: __t("مسیر ساختاریافته Capital Network برای آماده‌سازی استارتاپ‌ها — از ارزیابی اولیه تا Term Sheet"),

    pageKey: 'process',

    pageData: {

      telephone:       settings.contact_phone,

      email:           settings.contact_email,

      social_twitter:  settings.social_twitter,

      social_linkedin: settings.social_linkedin,

      processSteps: settings.process_steps?.map(s => ({

        title: s.title,

        text:  s.text,

      })),

      avgDays: settings.home_process_avg_days,

    },

    seoPage: settings.seo_pages?.['process'],

  });



  const banners: InlineBanner[] = settings.inline_banners ?? [];

  return (

    <div>

      <InlineBannerRenderer banners={banners} page="process" section="top" />

      <CapitalProcessPage onNavigate={onNavigate} banners={banners} />

      <InlineBannerRenderer banners={banners} page="process" section="before-footer" />

    </div>

  );

}



function BlogPostDetail({ slug, onBack }: { slug: string; onBack: () => void }) {

  const [dbPost, setDbPost] = useState<BlogPost | null>(null);

  const [postLoading, setPostLoading] = useState(true);

  const [activeSection, _setActiveSection] = useState<string>('');

  const [readingProgress, setReadingProgress] = useState(0);

  const [isBookmarked, setIsBookmarked] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);



  // Fetch from Supabase, fallback to hardcoded

  useEffect(() => {

    setPostLoading(true);

    fetchPostBySlug(slug)

      .then(row => {

        if (row) setDbPost(row as unknown as BlogPost);

        setPostLoading(false);

      })

      .catch(() => setPostLoading(false));

  }, [slug]);



  const post = dbPost ?? blogPosts.find((p) => p.slug === slug);

  const category = post ? blogCategories[post.category as BlogCategory] : null;



  // Reading progress

  useEffect(() => {

    const handleScroll = () => {

      if (!contentRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;

      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;

      setReadingProgress(Math.min(progress, 100));

    };



    const contentEl = contentRef.current;

    if (contentEl) {

      contentEl.addEventListener('scroll', handleScroll);

      return () => contentEl.removeEventListener('scroll', handleScroll);

    }

  }, []);



  if (postLoading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <span className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />

      </div>

    );

  }



  // Generate TOC from content

  const generateTOC = () => {

    if (!post) return [];

    const lines = post.content.split('\n');

    const toc: { id: string; title: string; level: number }[] = [];

    let sectionIndex = 0;

    

    lines.forEach((line) => {

      if (line.startsWith('**') && line.endsWith('**')) {

        const title = line.replace(/\*\*/g, '').trim();

        if (title && title.length > 0) {

          toc.push({

            id: `section-${sectionIndex++}`,

            title,

            level: 2,

          });

        }

      }

    });

    

    return toc;

  };



  const tocItems = generateTOC();



  if (!post || !category) {

    return (

      <div className="min-h-screen bg-[#0d1829] text-white relative" dir="rtl">

        <FinancialBackground />

        <div className="mx-auto max-w-4xl px-6 pt-28 pb-20">

          <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white mb-8">

            <ArrowLeft size={20} />

            {__t("بازگشت به بلاگ")}

          </button>

          <h1 className="text-3xl font-bold text-white">{__t("مقاله یافت نشد")}</h1>

        </div>

      </div>

    );

  }



  const relatedPosts = blogPosts

    .filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))

    .slice(0, 3);



  const handleShare = async () => {

    if (navigator.share) {

      try {

        await navigator.share({

          title: post.title,

          text: post.excerpt,

          url: window.location.href + '#' + post.slug,

        });

      } catch (err) {

        console.log('Share failed:', err);

      }

    }

  };



  return (

    <article className="min-h-screen bg-[#0d1829] text-white relative" dir="rtl">

      <FinancialBackground />

      {/* Skip to content link for accessibility */}

      <a 

        href="#main-content" 

        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-500 focus:text-white focus:rounded-lg"

      >

        {__t("پرش به محتوای اصلی")}

      </a>

      

      {/* Reading Progress Bar */}

      <div className="fixed top-20 left-0 right-0 h-1 bg-white/10 z-40" aria-hidden="true">

        <div 

          className="h-full bg-gradient-to-r from-teal-500 to-amber-500 transition-all duration-150"

          style={{ width: `${readingProgress}%` }}

          role="progressbar"

          aria-valuenow={readingProgress}

          aria-valuemin={0}

          aria-valuemax={100}

          aria-label={__t("پیشرفت خواندن مقاله")}

        />

      </div>



      {/* Hero Image Section */}

      <div className="relative h-[400px] md:h-[500px] overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-amber-500/10 to-purple-500/20" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.15),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.15),_transparent_50%)]" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#040614] via-transparent to-transparent" />

        

        {/* Pattern overlay */}

        <div className="absolute inset-0 opacity-10">

          <div className="w-full h-full" style={{

            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',

            backgroundSize: '32px 32px'

          }} />

        </div>



        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">

          <div className="mx-auto max-w-7xl">

            <motion.div variants={vFadeUp} initial="hidden" animate="show">

              <div className="flex items-center gap-3 mb-4">

                <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm ${category.color}`}>

                  {category.icon}

                  <span className="text-sm font-semibold">{category.label}</span>

                </div>

                {post.featured && (

                  <span className="bg-amber-400/90 text-black text-xs font-bold px-3 py-1 rounded-full">

                    {__t("ویژه")}

                  </span>

                )}

              </div>

              

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">

                {post.title}

              </h1>

              

              <p className="text-lg text-white/80 mb-4 max-w-3xl">

                {post.excerpt}

              </p>

            </motion.div>

          </div>

        </div>

      </div>



      <main id="main-content" className="mx-auto max-w-7xl px-6 py-12">

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}

        <Breadcrumb

          items={[

            { label: __t("خانه"), href: '/', onClick: onBack },

            { label: __t("بلاگ"), href: '/blog', onClick: onBack },

            { label: blogCategories[post.category as BlogCategory]?.label || post.category, href: `/blog/category/${post.category}` },

            { label: post.title },

          ]}

        />



        {/* Back Button */}

        <motion.div variants={vFadeUp} initial="hidden" animate="show" className="mb-8">

          <button

            onClick={onBack}

            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors focus:ring-2 focus:ring-teal-500/50 rounded-lg px-3 py-2"

            aria-label={__t("بازگشت به صفحه بلاگ")}

          >

            <ArrowLeft size={20} />

            {__t("بازگشت به بلاگ")}

          </button>

        </motion.div>



        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">

          {/* Main Content */}

          <div>

            {/* Meta Info Bar */}

            <motion.div variants={vFadeUp} initial="hidden" animate="show" className="card-glass rounded-xl p-4 border border-white/10 mb-8">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div className="flex items-center gap-6 text-white/60 text-sm">

                  <div className="flex items-center gap-2">

                    <Clock size={16} className="text-teal-400" />

                    <span>{post.readTime}</span>

                  </div>

                  <div className="flex items-center gap-2">

                    <Calendar size={16} className="text-teal-400" />

                    <span>{post.publishedAt}</span>

                  </div>

                  {post.views && (

                    <div className="flex items-center gap-2">

                      <Eye size={16} className="text-teal-400" />

                      <span>{post.views.toLocaleString()} {__t("بازدید")}</span>

                    </div>

                  )}

                </div>

                

                <div className="flex items-center gap-2">

                  <button

                    onClick={() => setIsBookmarked(!isBookmarked)}

                    className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-white/40 hover:text-white hover:bg-white/10'}`}

                    aria-label={__t("ذخیره مقاله")}

                  >

                    <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />

                  </button>

                  <button

                    onClick={handleShare}

                    className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"

                    aria-label={__t("اشتراک‌گذاری")}

                  >

                    <Send size={18} />

                  </button>

                </div>

              </div>

            </motion.div>



            {/* Author Card */}

            <motion.div variants={vFadeUp} initial="hidden" animate="show" className="card-glass rounded-xl p-6 border border-white/10 mb-8">

              <div className="flex items-start gap-4">

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">

                  {post.author.name.charAt(0)}

                </div>

                <div className="flex-1">

                  <div className="flex items-center gap-2 mb-1">

                    <p className="text-white font-bold text-lg">{post.author.name}</p>

                    <span className="bg-teal-400/20 text-teal-300 text-xs px-2 py-0.5 rounded-full">{__t("نویسنده")}</span>

                  </div>

                  <p className="text-white/60 text-sm mb-2">{post.author.role}</p>

                  {post.author.bio && (

                    <p className="text-white/50 text-sm leading-relaxed">{post.author.bio}</p>

                  )}

                </div>

              </div>

            </motion.div>



            {/* Content */}

            <motion.div

              variants={vFadeUp}

              initial="hidden"

              animate="show"

              ref={contentRef}

            >

              <div className="prose prose-invert prose-lg max-w-none">

                <div className="text-white/80 leading-loose space-y-8">

                  <div className="bg-white/5 rounded-2xl p-8 md:p-10 border border-white/10">

                    <div className="text-white/70 leading-loose whitespace-pre-line text-base md:text-lg text-justify">

                      {post.content}

                    </div>

                  </div>

                </div>

              </div>

            </motion.div>



            {/* Tags */}

            <motion.div

              variants={vFadeUp}

              initial="hidden"

              animate="show"

              className="mt-12 pt-8 border-t border-white/10"

            >

              <h3 className="text-white font-bold mb-4 flex items-center gap-2">

                <Layers size={18} className="text-teal-400" />

                {__t("برچسب‌ها")}

              </h3>

              <div className="flex flex-wrap gap-3">

                {post.tags.map((tag) => (

                  <span key={tag} className="text-sm text-white/70 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transitionColors cursor-pointer hover:border-teal-500/30">

                    #{tag}

                  </span>

                ))}

              </div>

            </motion.div>



            {/* Related Posts */}

            {relatedPosts.length > 0 && (

              <motion.div

                variants={vFadeUp}

                initial="hidden"

                animate="show"

                className="mt-12 pt-8 border-t border-white/10"

              >

                <h3 className="text-white font-bold mb-6 text-xl flex items-center gap-2">

                  <TrendingUp size={20} className="text amber-400" />

                  {__t("مقالات مرتبط")}

                </h3>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                  {relatedPosts.map((relatedPost) => (

                    <div

                      key={relatedPost.id}

                      onClick={() => onBack()}

                      className="card-glass rounded-xl overflow-hidden border border-white/8 hover:border-white/15 cursor-pointer group transition-all hover:-translate-y-1"

                    >

                      <div className="h-32 bg-gradient-to-br from-teal-500/10 to-amber-500/10 relative">

                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.1),_transparent_50%)]" />

                      </div>

                      <div className="p-4">

                        <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-2 mb-2">

                          {relatedPost.title}

                        </h4>

                        <p className="text-white/50 text-xs line-clamp-2 mb-3">

                          {relatedPost.excerpt}

                        </p>

                        <div className="flex items-center gap-2 text-white/40 text-xs">

                          <Clock size={12} />

                          {relatedPost.readTime}

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </motion.div>

            )}



            {/* CTA Section */}

            <motion.div

              variants={vFadeUp}

              initial="hidden"

              animate="show"

              className="mt-12"

            >

              <div className="rounded-2xl bg-gradient-to-r from-teal-500/10 to-amber-500/10 border border-white/10 p-8 text-center">

                <h3 className="text-2xl font-bold text-white mb-4">{__t("آماده شروع جذب سرمایه هستید؟")}</h3>

                <p className="text-white/60 mb-6">{__t("تیم ما با تجربه بیش از 15 سال در زمینه تأمین مالی، همراه شماست.")}</p>

                <button className="btn-gold px-8 py-3 rounded-xl font-semibold">

                  {__t("درخواست مشاوره رایگان")}

                </button>

              </div>

            </motion.div>

          </div>



          {/* Sidebar */}

          <aside className="hidden lg:block">

            <motion.div variants={vFadeUp} initial="hidden" animate="show" className="sticky top-28 space-y-6">

              {/* Table of Contents */}

              <div className="card-glass rounded-xl p-5 border border-white/10">

                <h3 className="text-white font-bold mb-4 flex items-center gap-2">

                  <Layers size={18} className="text-teal-400" />

                  {__t("فهرست مطالب")}

                </h3>

                {tocItems.length > 0 ? (

                  <nav className="space-y-2">

                    {tocItems.map((item) => (

                      <a

                        key={item.id}

                        href={`#${item.id}`}

                        className={`block text-sm transition-colors py-2 px-3 rounded-lg ${

                          activeSection === item.id

                            ? 'bg-teal-500/10 text-teal-400 font-semibold'

                            : 'text-white/60 hover:text-white hover:bg-white/5'

                        }`}

                        style={{ paddingRight: `${(item.level - 1) * 12}px` }}

                      >

                        {item.title}

                      </a>

                    ))}

                  </nav>

                ) : (

                  <p className="text-white/40 text-sm">{__t("فهرست مطالب در دسترس نیست")}</p>

                )}

              </div>



              {/* Author Card */}

              <div className="card-glass rounded-xl p-5 border border-white/10">

                <h3 className="text-white font-bold mb-4 flex items-center gap-2">

                  <Users size={18} className="text-teal-400" />

                  {__t("درباره نویسنده")}

                </h3>

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-white text-xl font-bold">

                    {post.author.name.charAt(0)}

                  </div>

                  <div>

                    <p className="text-white font-semibold">{post.author.name}</p>

                    <p className="text-white/50 text-xs">{post.author.role}</p>

                  </div>

                </div>

                {post.author.bio && (

                  <p className="text-white/60 text-sm leading-relaxed mb-4">

                    {post.author.bio}

                  </p>

                )}

                <button className="w-full btn-gold py-2.5 rounded-lg text-xs font-semibold">

                  {__t("مشاهده تمام مقالات")}

                </button>

              </div>



              {/* Popular Posts */}

              <div className="card-glass rounded-xl p-5 border border-white/10">

                <h3 className="text-white font-bold mb-4 flex items-center gap-2">

                  <TrendingUp size={18} className="text-amber-400" />

                  {__t("مقالات محبوب")}

                </h3>

                <div className="space-y-3">

                  {blogPosts

                    .sort((a, b) => (b.views || 0) - (a.views || 0))

                    .slice(0, 4)

                    .map((popularPost, index) => (

                      <button

                        key={popularPost.id}

                        onClick={() => onBack()}

                        className="w-full text-right group"

                      >

                        <div className="flex items-start gap-3">

                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-amber-500/20 flex items-center justify-center text-teal-400 font-bold text-sm">

                            {index + 1}

                          </div>

                          <div className="flex-1 min-w-0">

                            <h4 className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors line-clamp-2 mb-1">

                              {popularPost.title}

                            </h4>

                            <div className="flex items-center gap-2 text-white/40 text-xs">

                              <Eye size={12} />

                              {popularPost.views?.toLocaleString()} {__t("بازدید")}

                            </div>

                          </div>

                        </div>

                      </button>

                    ))}

                </div>

              </div>

            </motion.div>

          </aside>

        </div>

      </main>

    </article>

  );

}



function BlogPage({ onNavigate, initialCategory, settings }: { onNavigate: (page: PageKey, postSlug?: string, category?: BlogFilter) => void; initialCategory?: BlogFilter; settings?: SiteSettings }) {
  const { t } = useLanguage();
  const blogCats = useBlogCategories();
  useSEO({ title: t('seo.blog'), description: t('seo.blogDesc'), pageKey: 'blog', seoPage: settings?.seo_pages?.['blog'] });
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'all'>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);

  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const [showNewsletter, setShowNewsletter] = useState(false);



  // ── Fetch posts from Supabase, fallback به hardcoded ──────────────────────

  const [dbPosts, setDbPosts] = useState<BlogPost[]>([]);

  const [postsLoaded, setPostsLoaded] = useState(false);

  useEffect(() => {

    fetchPublishedPosts().then(rows => {

      if (rows.length > 0) {

        setDbPosts(rows as unknown as BlogPost[]);

      }

      setPostsLoaded(true);

    }).catch(() => setPostsLoaded(true));

  }, []);



  const allPosts = postsLoaded && dbPosts.length > 0 ? dbPosts : blogPosts;



  const filteredPosts = allPosts.filter((post) => {

    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;

    const matchesSearch = searchQuery === '' ||

      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||

      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||

      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;

  });



  const featuredPosts = allPosts.filter((p) => p.featured);

  const regularPosts = filteredPosts.filter((p) => !p.featured);

  const popularPosts = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0));

  const topAuthors = Array.from(new Set(allPosts.map(p => p.author.name)));



  const handleReadPost = (slug: string) => {

    setSelectedPostSlug(slug);

    onNavigate('blog-post', slug);

  };



  const handleBackToBlog = () => {

    setSelectedPostSlug(null);

    onNavigate('blog');

  };



  const toggleBookmark = (postId: string, e: React.MouseEvent) => {

    e.stopPropagation();

    setBookmarkedPosts(prev => {

      const newBookmarks = new Set(prev);

      if (newBookmarks.has(postId)) {

        newBookmarks.delete(postId);

      } else {

        newBookmarks.add(postId);

      }

      return newBookmarks;

    });

  };



  const handleShare = async (post: BlogPost, e: React.MouseEvent) => {

    e.stopPropagation();

    if (navigator.share) {

      try {

        await navigator.share({

          title: post.title,

          text: post.excerpt,

          url: window.location.href + '#' + post.slug,

        });

      } catch (err) {

        console.log('Share failed:', err);

      }

    }

  };



  const handleSearchChange = (query: string) => {

    setSearchQuery(query);

    if (query.length > 2) {

      const suggestions = allPosts

        .filter(p => p.title.toLowerCase().includes(query.toLowerCase()))

        .map(p => p.title)

        .slice(0, 5);

      setSearchSuggestions(suggestions);

    } else {

      setSearchSuggestions([]);

    }

  };



  if (selectedPostSlug) {

    return <BlogPostDetail slug={selectedPostSlug} onBack={handleBackToBlog} />;

  }



  return (

    <div className="min-h-screen bg-[#0d1829] text-white relative" dir="rtl">

      <FinancialBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-24 pb-16 md:pt-28">

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}

        <Breadcrumb

          items={[

            { label: __t("خانه"), href: '/', onClick: () => onNavigate('home') },

            { label: __t("بلاگ"), href: '/blog' },

          ]}

        />



        {/* Hero Section */}

        <motion.div

          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}

          className="mb-12"

        >

          <span

            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-6"

            style={{ background: 'rgba(0,188,212,0.08)', border: '1px solid rgba(0,188,212,0.22)', color: '#67e8f9' }}

          >

            <TrendingUp size={13} />

            {__t("بلاگ تخصصی سرمایه‌گذاری")}

          </span>



          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-5">

            {__t("مقالات راهبردی و عملی")}

            <br />

            <span style={{ color: '#67e8f9' }}>{__t("برای آماده‌سازی سرمایه‌گذاری")}</span>

          </h1>



          <p className="text-slate-300 leading-[1.95] text-[15px] mb-8">

            {__t("روایت‌ها، مطالعه‌های موردی و راهنمایی‌های عملی برای رساندن کسب‌وکار شما به جلسه سرمایه‌گذار")}

          </p>



          {/* Stats */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

            {[

              { value: allPosts.length, label: __t("مقاله منتشر شده"), icon: <Star size={18} /> },

              { value: Object.keys(blogCategories).length, label: __t("دسته‌بندی تخصصی"), icon: <Layers size={18} /> },

              { value: topAuthors.length, label: __t("نویسنده متخصص"), icon: <Users size={18} /> },

              { value: '50K+', label: __t("بازدید ماهانه"), icon: <Eye size={18} /> },

            ].map((stat) => (

              <div key={stat.label} className="rounded-2xl px-4 py-3.5"

                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>

                <div className="flex items-center gap-2 mb-2" style={{ color: '#67e8f9' }}>

                  {stat.icon}

                </div>

                <div className="text-2xl font-black text-white mb-1">{stat.value}</div>

                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{stat.label}</div>

              </div>

            ))}

          </div>



          {/* CTA */}

          <button

            onClick={() => setShowNewsletter(true)}

            className="btn-gold px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold"

          >

            <Mail size={18} />

            {__t("عضویت در خبرنامه")}

          </button>

        </motion.div>



        {/* Search with Suggestions */}

        <motion.div variants={vFadeUp} initial="hidden" animate="show" className="mb-6 relative" role="search">

          <div className="relative">

            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={20} aria-hidden="true" />

            <input

              type="text"

              placeholder={__t("جستجو در مقالات...")}

              value={searchQuery}

              onChange={(e) => handleSearchChange(e.target.value)}

              className="w-full bg-white/5 border border-white/10 rounded-xl pr-12 pl-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all"

              aria-label={__t("جستجو در مقالات")}

              aria-autocomplete="list"

              aria-controls="search-suggestions"

            />

          </div>

          

          {searchSuggestions.length > 0 && (

            <ul 

              id="search-suggestions"

              className="absolute top-full left-0 right-0 mt-2 bg-[#0B1628]/95 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden z-10"

              role="listbox"

            >

              {searchSuggestions.map((suggestion) => (

                <li key={suggestion}>

                  <button

                    onClick={() => handleSearchChange(suggestion)}

                    className="w-full text-right px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors focus:bg-white/10 focus:outline-none"

                    role="option"

                    tabIndex={0}

                  >

                    {suggestion}

                  </button>

                </li>

              ))}

            </ul>

          )}

        </motion.div>



        {/* Category Navigation */}

        <motion.div variants={vFadeUp} initial="hidden" animate="show" className="mb-8">

          <div className="flex flex-wrap gap-2">

            <button

              onClick={() => {

                setActiveCategory('all');

                onNavigate('blog', undefined, 'all');

              }}

              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${

                activeCategory === 'all'

                  /* eslint-disable-next-line max-len */

                  ? 'bg-gradient-to-r from-teal-500 to-amber-500 text-white shadow-lg shadow-teal-500/25'

                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'

              }`}

              aria-label={__t("نمایش همه مقالات")}

            >

              {__t("همه مقالات")}

            </button>

            {(Object.keys(blogCategories) as BlogCategory[]).map((cat) => {

              const catInfo = blogCategories[cat];

              const count = allPosts.filter(p => p.category === cat).length;

              return (

                <button

                  key={cat}

                  onClick={() => {

                    setActiveCategory(cat);

                    onNavigate('blog', undefined, cat);

                  }}

                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${

                    activeCategory === cat

                      ? 'bg-white/10 text-white border border-white/20'

                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'

                  }`}

                  aria-label={t('فیلتر بر اساس {label}', { label: catInfo.label })}

                >

                  {catInfo.icon}

                  {catInfo.label}

                  <span className="text-white/40 text-xs">({count})</span>

                </button>

              );

            })}

          </div>

        </motion.div>



        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

          {/* Main Content */}

          <div>

            {/* Featured Posts */}

            {featuredPosts.length > 0 && activeCategory === 'all' && (

              <motion.div variants={vStagger} initial="hidden" animate="show" className="mb-10">

                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">

                  <Star className="text-amber-400" size={20} />

                  {__t("مقالات ویژه")}

                </h2>

                <div className="grid gap-6 md:grid-cols-2">

                  {featuredPosts.map((post) => (

                    <FeaturedPost key={post.id} post={post} onRead={handleReadPost} />

                  ))}

                </div>

              </motion.div>

            )}



            {/* Regular Posts Grid */}

            <motion.div variants={vStagger} initial="hidden" animate="show">

              <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">

                <span>

                  {activeCategory === 'all' ? __t("همه مقالات") : blogCategories[activeCategory]?.label}

                  <span className="text-white/40 text-sm font-normal mr-2">

                    ({regularPosts.length})

                  </span>

                </span>

              </h2>

              

              {regularPosts.length > 0 ? (

                <div className="grid gap-6 md:grid-cols-2">

                  {regularPosts.map((post) => (

                    <AdvancedBlogCard 

                      key={post.id} 

                      post={post} 

                      onRead={handleReadPost}

                      onBookmark={toggleBookmark}

                      onShare={handleShare}

                      isBookmarked={bookmarkedPosts.has(post.id)}

                    />

                  ))}

                </div>

              ) : (

                <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">

                  <Search className="mx-auto text-white/30 mb-4" size={48} />

                  <p className="text-white/40 text-base mb-4">{__t("مقاله‌ای یافت نشد")}</p>

                  <button

                    onClick={() => {

                      setActiveCategory('all');

                      setSearchQuery('');

                    }}

                    className="text-teal-400 hover:text-teal-300 text-sm font-semibold"

                  >

                    {__t("پاک کردن فیلترها")}

                  </button>

                </div>

              )}

            </motion.div>

          </div>



          {/* Sidebar */}

          <aside className="hidden lg:block space-y-6">

            {/* Popular Posts */}

            <motion.div variants={vFadeUp} initial="hidden" animate="show" className="card-glass rounded-xl p-5 border border-white/10">

              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">

                <TrendingUp className="text-amber-400" size={18} />

                {__t("مقالات محبوب")}

              </h3>

              <div className="space-y-3">

                {popularPosts.map((post, index) => (

                  <button

                    key={post.id}

                    onClick={() => handleReadPost(post.slug)}

                    className="w-full text-right group"

                  >

                    <div className="flex items-start gap-3">

                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-amber-500/20 flex items-center justify-center text-teal-400 font-bold text-sm">

                        {index + 1}

                      </div>

                      <div className="flex-1 min-w-0">

                        <h4 className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors line-clamp-2 mb-1">

                          {post.title}

                        </h4>

                        <div className="flex items-center gap-2 text-white/40 text-xs">

                          <Eye size={12} />

                          {post.views?.toLocaleString()} {__t("بازدید")}

                        </div>

                      </div>

                    </div>

                  </button>

                ))}

              </div>

            </motion.div>



            {/* Top Authors */}

            <motion.div variants={vFadeUp} initial="hidden" animate="show" className="card-glass rounded-xl p-5 border border-white/10">

              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">

                <Users className="text-teal-400" size={18} />

                {__t("نویسندگان برتر")}

              </h3>

              <div className="space-y-3">

                {topAuthors.map((authorName) => {

                    const authorPosts = allPosts.filter(p => p.author.name === authorName);

                    const author = authorPosts[0]?.author ?? { name: authorName, role: '' };

                  return (

                    <div key={authorName} className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">

                        {authorName.charAt(0)}

                      </div>

                      <div>

                        <p className="text-sm font-semibold text-white">{authorName}</p>

                        <p className="text-xs text-white/50">{author.role}</p>

                      </div>

                    </div>

                  );

                })}

              </div>

            </motion.div>



            {/* Popular Tags */}

            <motion.div variants={vFadeUp} initial="hidden" animate="show" className="card-glass rounded-xl p-5 border border-white/10">

              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">

                <Target className="text-purple-400" size={18} />

                {__t("تگ‌های پرطرفدار")}

              </h3>

              <div className="flex flex-wrap gap-2">

                {Array.from(new Set(allPosts.flatMap(p => p.tags))).slice(0, 10).map((tag) => (

                  <button

                    key={tag}

                    onClick={() => handleSearchChange(tag)}

                    className="text-xs text-white/60 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-colors"

                  >

                    #{tag}

                  </button>

                ))}

              </div>

            </motion.div>



            {/* Newsletter */}

            <motion.div variants={vFadeUp} initial="hidden" animate="show" className="card-glass rounded-xl p-5 border border-white/10">

              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">

                <Mail className="text-teal-400" size={18} />

                {__t("خبرنامه")}

              </h3>

              <p className="text-xs text-white/60 mb-4">

                {__t("جدیدترین مقالات و insights را در ایمیل خود دریافت کنید")}

              </p>

              <div className="flex gap-2">

                <input

                  type="email"

                  placeholder={__t("ایمیل شما")}

                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-teal-500/50"

                />

                <button className="btn-gold px-3 py-2 rounded-lg text-xs font-semibold">

                  {__t("عضویت")}

                </button>

              </div>

            </motion.div>

          </aside>

        </div>

      </div>



      {/* Newsletter Modal */}

      {showNewsletter && (

        <motion.div

          initial={{ opacity: 0 }}

          animate={{ opacity: 1 }}

          exit={{ opacity: 0 }}

          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"

          onClick={() => setShowNewsletter(false)}

        >

          <motion.div

            initial={{ scale: 0.9, opacity: 0 }}

            animate={{ scale: 1, opacity: 1 }}

            className="bg-[#0B1628] border border-white/10 rounded-2xl p-6 max-w-md w-full"

            onClick={(e) => e.stopPropagation()}

          >

            <div className="text-center mb-6">

              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center mx-auto mb-4">

                <Mail size={32} className="text-white" />

              </div>

              <h3 className="text-xl font-bold text-white mb-2">{__t("عضویت در خبرنامه")}</h3>

              <p className="text-sm text-white/60">

                {__t("جدیدترین مقالات و insights سرمایه‌گذاری را هفتگی در ایمیل خود دریافت کنید")}

              </p>

            </div>

            <div className="space-y-3">

              <input

                type="text"

                placeholder={__t("نام و نام خانوادگی")}

                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-teal-500/50"

              />

              <input

                type="email"

                placeholder={__t("ایمیل")}

                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-teal-500/50"

              />

              <button className="w-full btn-gold py-3 rounded-xl font-semibold">

                {__t("عضویت در خبرنامه")}

              </button>

            </div>

            <button

              onClick={() => setShowNewsletter(false)}

              className="mt-4 w-full text-center text-white/40 text-sm hover:text-white transition-colors"

            >

              {__t("بستن")}

            </button>

          </motion.div>

        </motion.div>

      )}

    </div>

  );

}



function EvaluationPage({ onNavigate: _onNavigate, settings }: { onNavigate: (page: PageKey) => void; settings: SiteSettings }) {

  const banners: InlineBanner[] = settings.inline_banners ?? [];

  useSEO({

    title: __t("درخواست ارزیابی"),

    description: __t("ارزیابی رایگان آمادگی استارتاپ شما برای جذب سرمایه — از Seed تا Series B با تیم متخصص Capital Network"),

    pageKey: 'evaluation',

    pageData: {

      telephone:       settings.contact_phone,

      email:           settings.contact_email,

      whatsapp:        settings.contact_whatsapp,

      workingHours:    settings.working_hours,

      social_twitter:  settings.social_twitter,

      social_linkedin: settings.social_linkedin,

    },

  });

  return (

    <div>

      <InlineBannerRenderer banners={banners} page="evaluation" section="top" />

      <FounderOnboarding />

      <InlineBannerRenderer banners={banners} page="evaluation" section="bottom" />

    </div>

  );

}



function ContactPage({ onNavigate, settings }: { onNavigate: (page: PageKey) => void; settings: SiteSettings }) {

  useSEO({

    title: __t("تماس با ما"),

    description: __t("برای مشاوره رایگان و شروع فرآیند جذب سرمایه با ما تماس بگیرید"),

    pageKey: 'contact',

    pageData: {

      telephone:       settings.contact_phone,

      email:           settings.contact_email,

      whatsapp:        settings.contact_whatsapp,

      workingHours:    settings.working_hours,

      social_twitter:  settings.social_twitter,

      social_linkedin: settings.social_linkedin,

      social_instagram:settings.social_instagram,

      social_youtube:  settings.social_youtube,

    },

    seoPage: settings.seo_pages?.['contact'],

  });

  const banners: InlineBanner[] = settings.inline_banners ?? [];

  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');



  const handleContactSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    setContactStatus('sending');

    try {

      const ok = await insertContactMessage({

        full_name: contactForm.name,

        email: contactForm.email,

        subject: contactForm.subject || undefined,

        message: contactForm.message,

      });

      setContactStatus(ok ? 'sent' : 'error');

    } catch {

      setContactStatus('error');

    }

  };



  return (

    <div

      className="min-h-screen bg-[#0d1829] text-white relative"

      dir="rtl"

    >

      <FinancialBackground />



      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 pb-24 md:pt-32">



        <InlineBannerRenderer banners={banners} page="contact" section="top" />



        {/* ── Back button ── */}

        <motion.button

          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}

          onClick={() => onNavigate('home')}

          className="flex items-center gap-2 mb-10 text-sm transition-colors"

          style={{ color: 'rgba(255,255,255,0.45)' }}

          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}

          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}

        >

          <ArrowLeft size={16} />

          {__t("بازگشت به صفحه اصلی")}

        </motion.button>



        {/* ── Hero header ── */}

        <motion.div

          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}

          className="mb-12"

        >

          <span

            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-6"

            style={{ background: 'rgba(0,188,212,0.08)', border: '1px solid rgba(0,188,212,0.22)', color: '#67e8f9' }}

          >

            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />

            {__t("تماس با ما")}

          </span>

          <h1 className={`leading-tight text-white ${FS_CLASS[settings.contact_hero_title_fs]} ${ac(settings.contact_hero_title_align)}`}>

            {settings.contact_hero_title}

          </h1>

          <p className={`mt-4 max-w-2xl leading-8 text-slate-300 ${FS_CLASS[settings.contact_hero_desc_fs]} ${ac(settings.contact_hero_desc_align)}`}>

            {settings.contact_hero_desc}

          </p>

        </motion.div>



        <InlineBannerRenderer banners={banners} page="contact" section="after-hero" />



        {/* ── Quick contact stat bar — dynamic from CMS ── */}

        {settings.contact_stat_items.filter(it => it.visible).length > 0 && (

          <motion.div

            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}

            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"

          >

            {settings.contact_stat_items.filter(it => it.visible).map((item, i) => {

              const STAT_ICON_MAP: Record<string, React.ReactNode> = {

                clock:    <Clock size={16} />,

                check:    <CheckCircle2 size={16} />,

                shield:   <Shield size={16} />,

                users:    <Users size={16} />,

                zap:      <Zap size={16} />,

                phone:    <Phone size={16} />,

                mail:     <Mail size={16} />,

                star:     <Star size={16} />,

                trending: <TrendingUp size={16} />,

                message:  <MessageSquare size={16} />,

              };

              const icon = STAT_ICON_MAP[item.icon] ?? <CheckCircle2 size={16} />;

              return (

                <div

                  key={item.id ?? i}

                  className="rounded-2xl px-4 py-3.5 flex items-center gap-3"

                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}

                >

                  <div

                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"

                    style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}

                  >

                    <span style={{ color: item.color }}>{icon}</span>

                  </div>

                  <div>

                    <p className="text-[10px] text-slate-500 leading-none mb-1">{item.label}</p>

                    <p className="text-sm font-bold text-white">{item.value}</p>

                  </div>

                </div>

              );

            })}

          </motion.div>

        )}



        {/* ── Main content grid ── */}

        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">



          {/* ── LEFT: contact info card ── */}

          <motion.div

            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}

            className="space-y-4"

          >

            {/* Contact details */}

            <div

              className="rounded-2xl p-6"

              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}

            >

              <div className="flex items-center gap-2.5 mb-6">

                <div className="w-8 h-8 rounded-xl flex items-center justify-center"

                  style={{ background: 'rgba(0,188,212,0.12)', border: '1px solid rgba(0,188,212,0.25)' }}>

                  <PhoneCall size={15} style={{ color: '#00BCD4' }} />

                </div>

                <h2 className="text-base font-bold text-white">{__t("اطلاعات تماس")}</h2>

              </div>



              <div className="space-y-4">

                <div

                  className="flex items-center gap-4 rounded-xl p-3.5"

                  style={{ background: 'rgba(0,188,212,0.04)', border: '1px solid rgba(0,188,212,0.1)' }}

                >

                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"

                    style={{ background: 'rgba(0,188,212,0.1)' }}>

                    <Mail size={16} style={{ color: '#00BCD4' }} />

                  </div>

                  <div className="min-w-0">

                    <p className="text-[11px] text-slate-500 mb-0.5">{__t("ایمیل")}</p>

                    <a href={`mailto:${settings.contact_email}`}

                      className="text-sm font-medium text-white hover:text-cyan-300 transition-colors truncate block">

                      {settings.contact_email}

                    </a>

                  </div>

                </div>



                <div

                  className="flex items-center gap-4 rounded-xl p-3.5"

                  style={{ background: 'rgba(0,188,212,0.04)', border: '1px solid rgba(0,188,212,0.1)' }}

                >

                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"

                    style={{ background: 'rgba(0,188,212,0.1)' }}>

                    <Phone size={16} style={{ color: '#00BCD4' }} />

                  </div>

                  <div>

                    <p className="text-[11px] text-slate-500 mb-0.5">{__t("تلفن")}</p>

                    <a href={`tel:${settings.contact_phone.replace(/\s/g,'')}`}

                      className="text-sm font-medium text-white hover:text-cyan-300 transition-colors">

                      {settings.contact_phone}

                    </a>

                  </div>

                </div>



                {settings.contact_whatsapp && (

                  <div

                    className="flex items-center gap-4 rounded-xl p-3.5"

                    style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)' }}

                  >

                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"

                      style={{ background: 'rgba(34,197,94,0.1)' }}>

                      <MessageCircle size={16} style={{ color: '#22c55e' }} />

                    </div>

                    <div>

                      <p className="text-[11px] text-slate-500 mb-0.5">{__t("واتساپ")}</p>

                      <a href={`https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g,'')}`}

                        className="text-sm font-medium text-white hover:text-green-300 transition-colors">

                        {settings.contact_whatsapp}

                      </a>

                    </div>

                  </div>

                )}



                {settings.contact_address && (

                  <div

                    className="flex items-center gap-4 rounded-xl p-3.5"

                    style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)' }}

                  >

                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"

                      style={{ background: 'rgba(99,102,241,0.1)' }}>

                      <PhoneCall size={16} style={{ color: '#a78bfa' }} />

                    </div>

                    <div>

                      <p className="text-[11px] text-slate-500 mb-0.5">{settings.contact_address_label}</p>

                      <p className="text-sm font-medium text-white">{settings.contact_address}</p>

                    </div>

                  </div>

                )}



                <div

                  className="flex items-center gap-4 rounded-xl p-3.5"

                  style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)' }}

                >

                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"

                    style={{ background: 'rgba(245,158,11,0.1)' }}>

                    <Clock size={16} style={{ color: '#f59e0b' }} />

                  </div>

                  <div>

                    <p className="text-[11px] text-slate-500 mb-0.5">{__t("ساعات کاری")}</p>

                    <p className="text-sm font-medium text-white">

                      {settings.contact_working_days} — {settings.contact_working_hours}

                    </p>

                  </div>

                </div>

              </div>

            </div>



            {/* Social links */}

            <div

              className="rounded-2xl p-5"

              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}

            >

              <p className="text-sm font-semibold text-white mb-4">{__t("شبکه‌های اجتماعی")}</p>

              <div className="flex flex-wrap gap-3">

                {settings.social_twitter && (

                  <a href={normalizeExternalUrl(settings.social_twitter)} target="_blank" rel="noopener noreferrer"

                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"

                    style={{ background: 'rgba(29,161,242,0.08)', border: '1px solid rgba(29,161,242,0.2)', color: '#60a5fa' }}

                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(29,161,242,0.15)'; }}

                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(29,161,242,0.08)'; }}

                  >

                    <Twitter size={15} /> {__t("توییتر")}

                  </a>

                )}

                {settings.social_linkedin && (

                  <a href={normalizeExternalUrl(settings.social_linkedin)} target="_blank" rel="noopener noreferrer"

                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"

                    style={{ background: 'rgba(10,102,194,0.08)', border: '1px solid rgba(10,102,194,0.25)', color: '#93c5fd' }}

                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(10,102,194,0.15)'; }}

                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(10,102,194,0.08)'; }}

                  >

                    <Linkedin size={15} /> {__t("لینکدین")}

                  </a>

                )}

                {settings.social_instagram && (

                  <a href={normalizeExternalUrl(settings.social_instagram)} target="_blank" rel="noopener noreferrer"

                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"

                    style={{ background: 'rgba(225,48,108,0.08)', border: '1px solid rgba(225,48,108,0.22)', color: '#f9a8d4' }}

                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(225,48,108,0.15)'; }}

                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(225,48,108,0.08)'; }}

                  >

                    <Instagram size={15} /> {__t("اینستاگرام")}

                  </a>

                )}

                {settings.social_youtube && (

                  <a href={normalizeExternalUrl(settings.social_youtube)} target="_blank" rel="noopener noreferrer"

                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"

                    style={{ background: 'rgba(255,0,0,0.07)', border: '1px solid rgba(255,0,0,0.2)', color: '#fca5a5' }}

                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,0,0,0.14)'; }}

                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,0,0,0.07)'; }}

                  >

                    <Youtube size={15} /> {__t("یوتیوب")}

                  </a>

                )}

              </div>

            </div>



            {/* CTA card */}

            <div

              className="rounded-2xl p-5 flex items-start gap-4"

              style={{

                background: 'linear-gradient(135deg, rgba(0,188,212,0.1) 0%, rgba(99,102,241,0.06) 100%)',

                border: '1px solid rgba(0,188,212,0.18)',

              }}

            >

              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"

                style={{ background: 'rgba(0,188,212,0.15)' }}>

                <Zap size={18} style={{ color: '#00BCD4' }} />

              </div>

              <div>

                <p className="text-sm font-bold text-white mb-1">{__t("مشاوره رایگان")}</p>

                <p className="text-xs text-slate-400 leading-relaxed">

                  {__t("با ارسال فرم، کارشناسان ما ظرف ۲۴ ساعت با شما تماس خواهند گرفت.")}

                </p>

              </div>

            </div>

          </motion.div>



          {/* ── RIGHT: message form ── */}

          <motion.div

            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32 }}

            className="rounded-2xl p-6 sm:p-7"

            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}

          >

            <div className="flex items-center gap-2.5 mb-7">

              <div className="w-8 h-8 rounded-xl flex items-center justify-center"

                style={{ background: 'rgba(0,188,212,0.12)', border: '1px solid rgba(0,188,212,0.25)' }}>

                <Send size={14} style={{ color: '#00BCD4' }} />

              </div>

              <h2 className="text-base font-bold text-white">{settings.contact_form_title}</h2>

            </div>



            {settings.contact_form_desc && (

              <p className="text-sm text-slate-400 mb-5 leading-relaxed">{settings.contact_form_desc}</p>

            )}



            {contactStatus === 'sent' ? (

              <motion.div

                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}

                className="flex flex-col items-center justify-center py-16 text-center gap-4"

              >

                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"

                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>

                  <CheckCircle2 size={32} style={{ color: '#22c55e' }} />

                </div>

                <div>

                  <p className="text-lg font-bold text-white mb-1">{__t("پیام شما دریافت شد!")}</p>

                  <p className="text-sm text-slate-400">{settings.contact_success_msg}</p>

                </div>

              </motion.div>

            ) : (

              <form onSubmit={handleContactSubmit} className="space-y-4">

                <div className="grid sm:grid-cols-2 gap-4">

                  <div className="space-y-1.5">

                    <label className="text-xs font-medium text-slate-400">{__t("نام و نام خانوادگی *")}</label>

                    <input

                      value={contactForm.name}

                      onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}

                      required

                      className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"

                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}

                      onFocus={e => (e.target.style.borderColor = 'rgba(0,188,212,0.5)')}

                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}

                      placeholder={__t("نام شما")}

                    />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-xs font-medium text-slate-400">{__t("ایمیل *")}</label>

                    <input

                      type="email"

                      value={contactForm.email}

                      onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}

                      required

                      className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"

                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}

                      onFocus={e => (e.target.style.borderColor = 'rgba(0,188,212,0.5)')}

                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}

                      placeholder="email@example.com"

                    />

                  </div>

                </div>



                <div className="space-y-1.5">

                  <label className="text-xs font-medium text-slate-400">{__t("موضوع")}</label>

                  <input

                    value={contactForm.subject}

                    onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}

                    className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"

                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}

                    onFocus={e => (e.target.style.borderColor = 'rgba(0,188,212,0.5)')}

                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}

                    placeholder={__t("موضوع پیام شما")}

                  />

                </div>



                <div className="space-y-1.5">

                  <label className="text-xs font-medium text-slate-400">{__t("پیام *")}</label>

                  <textarea

                    value={contactForm.message}

                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}

                    required

                    rows={6}

                    className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors resize-none"

                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}

                    onFocus={e => (e.target.style.borderColor = 'rgba(0,188,212,0.5)')}

                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}

                    placeholder={__t("پیام خود را بنویسید...")}

                  />

                </div>



                {contactStatus === 'error' && (

                  <div

                    className="flex items-center gap-2.5 rounded-xl px-4 py-3"

                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}

                  >

                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />

                    <p className="text-sm text-red-400">{__t("خطا در ارسال. لطفاً دوباره تلاش کنید.")}</p>

                  </div>

                )}



                <div className="flex items-center gap-4 pt-1">

                  <button

                    type="submit"

                    disabled={contactStatus === 'sending'}

                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"

                    style={{ background: 'linear-gradient(135deg,#00BCD4,#00838F)' }}

                    onMouseEnter={e => { if (contactStatus !== 'sending') (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}

                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}

                  >

                    {contactStatus === 'sending'

                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {__t("در حال ارسال...")}</>

                      : <><Send size={15} /> {__t("ارسال پیام")}</>

                    }

                  </button>

                  <span className="text-xs text-slate-500">{__t("پاسخ در کمتر از ۲۴ ساعت")}</span>

                </div>

              </form>

            )}

          </motion.div>

        </div>



        <InlineBannerRenderer banners={banners} page="contact" section="before-footer" />



      </div>

    </div>

  );

}



function AboutPage({ onNavigate, settings }: { onNavigate: (page: PageKey) => void; settings: SiteSettings }) {

  useSEO({

    title: __t("درباره ما"),

    description: __t("آشنایی با تیم Capital Network و رویکرد ما در کمک به جذب سرمایه"),

    pageKey: 'about',

    pageData: {

      telephone:        settings.contact_phone,

      email:            settings.contact_email,

      social_twitter:   settings.social_twitter,

      social_linkedin:  settings.social_linkedin,

      social_instagram: settings.social_instagram,

      social_youtube:   settings.social_youtube,

      teamMembers:      settings.team,

      missionText:      settings.about_mission?.text,

      experienceText:   settings.about_experience?.text,

      valuesText:       settings.about_values?.text,

      storyTitle:       settings.about_story_title,

      storyDesc:        settings.about_story_desc,

    },

    seoPage: settings.seo_pages?.['about'],

  });



  const banners: InlineBanner[] = settings.inline_banners ?? [];

  /* ── ثابت‌های استایل داخلی ─────────────────────────────────────── */

  const prose  = 'text-slate-300 leading-[1.95] text-[15px] text-justify';



  const SectionHeading = ({ icon, title, accent = false }: { icon: React.ReactNode; title: string; accent?: boolean }) => (

    <div className="flex items-center gap-3 mb-6">

      <div

        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"

        style={{

          background: accent ? 'rgba(245,158,11,0.12)' : 'rgba(0,188,212,0.12)',

          border: accent ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(0,188,212,0.25)',

        }}

      >

        <span style={{ color: accent ? '#f59e0b' : '#00BCD4' }}>{icon}</span>

      </div>

      <h2 className="text-xl font-bold text-white leading-snug">{title}</h2>

    </div>

  );



  return (

    <div

      className="min-h-screen bg-[#0d1829] text-white relative"

      dir="rtl"

    >

      <FinancialBackground />



      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-28 pb-24 md:pt-32">



        <InlineBannerRenderer banners={banners} page="about" section="top" />



        {/* ── دکمه بازگشت ── */}

        <motion.button

          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}

          onClick={() => onNavigate('home')}

          className="flex items-center gap-2 mb-10 text-sm transition-colors"

          style={{ color: 'rgba(255,255,255,0.45)' }}

          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}

          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}

        >

          <ArrowLeft size={16} />

          {__t("بازگشت به صفحه اصلی")}

        </motion.button>



        {/* ── تیتر اصلی (دینامیک از CMS) ── */}

        <motion.div

          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}

          className="mb-12"

        >

          <span

            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-6"

            style={{ background: 'rgba(0,188,212,0.08)', border: '1px solid rgba(0,188,212,0.22)', color: '#67e8f9' }}

          >

            <BookOpen size={13} /> {__t("درباره ما")}

          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-5">

            {settings.about_hero_title}

          </h1>

          {settings.about_hero_desc && (

            <div

              className="rounded-2xl p-6 mb-8"

              style={{

                background: 'linear-gradient(135deg, rgba(0,188,212,0.08) 0%, rgba(99,102,241,0.05) 100%)',

                border: '1px solid rgba(0,188,212,0.15)',

              }}

            >

              <p className={`${prose} text-base`}>{settings.about_hero_desc}</p>

            </div>

          )}



          {/* پاراگراف‌های مقدمه — دینامیک از CMS */}

          {settings.about_intro_paragraphs.filter(p => p.visible).map((para, i) => (

            <p key={para.id} className={`${prose} ${i > 0 ? 'mt-5' : ''}`}>{para.text}</p>

          ))}

        </motion.div>



        {/* ── سکشن‌های دینامیک از CMS ── */}

        {settings.about_page_sections.filter(s => s.visible).map((section, si) => {

          const ABOUT_ICON_MAP: Record<string, React.ReactNode> = {

            target:    <Target size={18} />,

            users:     <Users size={18} />,

            trending:  <TrendingUp size={18} />,

            briefcase: <Briefcase size={18} />,

            shield:    <Shield size={18} />,

            star:      <Star size={18} />,

            check:     <CheckCircle2 size={18} />,

            book:      <BookOpen size={18} />,

            message:   <MessageSquare size={18} />,

            globe:     <TrendingUp size={18} />,

          };

          const sectionIcon = ABOUT_ICON_MAP[section.icon] ?? <Target size={18} />;

          const isAccent = section.icon === 'shield' || section.icon === 'star' || section.icon === 'trending';

          return (

            <motion.section

              key={section.id}

              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.5, delay: 0.18 + si * 0.08 }}

              className="mb-12"

            >

              <SectionHeading icon={sectionIcon} title={section.title} accent={isAccent} />



              {/* پاراگراف‌های سکشن */}

              {section.paragraphs?.filter(p => p.visible).map((para, pi) => (

                <p key={para.id} className={`${prose} ${pi > 0 ? 'mt-5' : ''}`}>{para.text}</p>

              ))}



              {/* Quote Box */}

              {section.quoteText && (

                <div

                  className="my-6 rounded-2xl px-6 py-5"

                  style={{

                    background: isAccent

                      ? 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(251,191,36,0.06) 100%)'

                      : 'linear-gradient(135deg, rgba(0,188,212,0.08) 0%, rgba(167,139,250,0.06) 100%)',

                    border: `1px solid ${isAccent ? 'rgba(245,158,11,0.25)' : 'rgba(0,188,212,0.2)'}`,

                  }}

                >

                  <p className={`text-base font-semibold text-center leading-relaxed ${isAccent ? 'text-amber-200' : 'text-white'}`}>

                    {section.quoteText}

                  </p>

                </div>

              )}

            </motion.section>

          );

        })}



        <InlineBannerRenderer banners={banners} page="about" section="after-hero" />



        {/* ── تیم — دینامیک از CMS ── */}

        {(settings.about_page_team.length > 0 || settings.team.length > 0) && (

          <motion.section

            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.26 }}

            id="team"

            className="mb-12"

          >

            <SectionHeading icon={<Users size={18} />} title={__t("تیم کپیتال نتورک")} />



            {/* اگر about_page_team پر باشد از آن بخوان، وگرنه از team قدیمی */}

            {(() => {

              const members = settings.about_page_team.length > 0

                ? settings.about_page_team.filter(m => m.visible)

                : settings.team;

              return members.length > 0 ? (

                <div className="mt-7 grid gap-4">

                  {members.map((member, i) => (

                      <motion.div

                        key={(member as any).id ?? i}

                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}

                        className="rounded-2xl p-5 flex items-center gap-5"

                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}

                      >

                        {member.avatar ? (

                          <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-cyan-500/20" />

                        ) : (

                          <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-base"

                            style={{ background: 'linear-gradient(135deg,#00BCD4,#00838F)' }}>

                            {member.name[0]}

                          </div>

                        )}

                        <div className="min-w-0">

                          <p className="text-base font-bold text-white">{member.name}</p>

                          <p className="text-xs text-cyan-400 mt-1 font-medium">{member.role}</p>

                          {member.bio && <p className="mt-2 text-sm text-slate-400 leading-relaxed">{member.bio}</p>}

                        </div>

                      </motion.div>

                    ))}

                  </div>

                ) : null;

              })()}

          </motion.section>

        )}



        <InlineBannerRenderer banners={banners} page="about" section="after-team" />



        {/* ── CTA ── */}

        <motion.div

          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.82 }}

          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"

        >

          <button

            onClick={() => onNavigate('evaluation')}

            className="px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all"

            style={{ background: 'linear-gradient(135deg,#00BCD4,#00838F)' }}

            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}

            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}

          >

            {__t("درخواست ارزیابی رایگان")}

          </button>

          <button

            onClick={() => onNavigate('contact')}

            className="px-7 py-3.5 rounded-xl text-sm font-semibold transition-all"

            style={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}

            onMouseEnter={e => {

              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,1)';

              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.3)';

            }}

            onMouseLeave={e => {

              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)';

              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)';

            }}

          >

            {__t("تماس با ما")}

          </button>

        </motion.div>



        <InlineBannerRenderer banners={banners} page="about" section="before-footer" />



      </div>

    </div>

  );

}



// ─── App ─────────────────────────────────────────────────────────────────────



// مسیر پنل ادمین — عمداً غیر واضح نگه داشته شده

const ADMIN_SECRET_PATH = '/cp-secure';

const ADMIN_SECRET_HASH = 'cp-secure';



function checkIsAdminRoute(): boolean {

  if (typeof window === 'undefined') return false;

  const { pathname, hash } = window.location;



  return (

    pathname === ADMIN_SECRET_PATH ||

    pathname.startsWith(`${ADMIN_SECRET_PATH}/`) ||

    hash.replace(/^#\/?/, '') === ADMIN_SECRET_HASH ||

    hash.replace(/^#\/?/, '').startsWith(`${ADMIN_SECRET_HASH}/`)

  );

}



// باگ ۳ — چک می‌کند آیا hash مربوط به admin هست تا MainApp آن را parse نکند

export function isAdminHash(): boolean {

  if (typeof window === 'undefined') return false;

  const h = window.location.hash.replace(/^#\/?/, '');

  return h === ADMIN_SECRET_HASH || h.startsWith(`${ADMIN_SECRET_HASH}/`);

}



export default function App() {

  // مسیرهای پنل ادمین همیشه باید به پنل هدایت شوند، حتی اگر هنوز session وجود نداشته باشد.

  // در این حالت، خود AdminPanel مسئول نمایش فرم ورود است.

  const [isAdmin, setIsAdmin] = useState<boolean>(() => checkIsAdminRoute());



  useEffect(() => {

    let cancelled = false;



    const handler = () => {

      if (!cancelled) setIsAdmin(checkIsAdminRoute());

    };



    window.addEventListener('popstate', handler);

    window.addEventListener('hashchange', handler);



    return () => {

      cancelled = true;

      window.removeEventListener('popstate', handler);

      window.removeEventListener('hashchange', handler);

    };

  }, []);



  if (isAdmin) {

    return (

      <Suspense fallback={<PageSuspenseFallback />}>

        <AdminPanel />

      </Suspense>

    );

  }



  return <MainApp />;

}





// ─── Mobile Bottom Navigation Bar — Fancy Floating Design ───────────────────

// طراحی floating pill با glow، انیمیشن‌های نرم، و دکمه CTA مرکزی برجسته



const BOTTOM_NAV_ITEMS: Array<{

  label: string;

  page: PageKey;

  icon: React.ReactNode;

  activeIcon?: React.ReactNode;

  color: string;        // رنگ glow هر آیتم

}> = [

  { label: 'خانه',    page: 'home',     icon: <Home size={21} />,      color: '#00BCD4' },

  { label: 'خدمات',  page: 'services', icon: <Briefcase size={21} />, color: '#f59e0b' },

  { label: 'بلاگ',   page: 'blog',     icon: <BookOpen size={21} />,  color: '#a78bfa' },

  { label: 'تماس',   page: 'contact',  icon: <PhoneCall size={21} />, color: '#34d399' },

  { label: 'درباره', page: 'about',    icon: <Users size={21} />,     color: '#60a5fa' },

];



function MobileBottomNav({

  currentPage,

  onNavigate,

  currentUser,

  onOpenAuth,

  onOpenDashboard,

}: {

  currentPage: PageKey;

  onNavigate: (page: PageKey) => void;

  currentUser: AuthUser | null;

  onOpenAuth: () => void;

  onOpenDashboard: () => void;

}) {

  const displayName = currentUser?.name?.split(' ')[0] ?? currentUser?.email?.split('@')[0] ?? '';

  const initial = displayName.charAt(0).toUpperCase();



  // آیتم active فعلی برای گرفتن رنگش

  const activeItem = BOTTOM_NAV_ITEMS.find(i => i.page === currentPage);

  const activeColor = activeItem?.color ?? '#00BCD4';



  return (

    <>

      {/* ── کی‌فریم‌های انیمیشن inline ── */}

      <style>{`

        @keyframes bnav-glow-pulse {

          0%,100% { opacity:.7; transform:scale(1); }

          50%      { opacity:1; transform:scale(1.18); }

        }

        @keyframes bnav-dot-ping {

          0%   { transform:scale(1);   opacity:.8; }

          70%  { transform:scale(2.2); opacity:0;  }

          100% { transform:scale(1);   opacity:0;  }

        }

        @keyframes bnav-auth-shine {

          0%   { left:-60%; }

          100% { left:120%; }

        }

      `}</style>



      <nav

        className="md:hidden fixed bottom-0 left-0 right-0 z-40"

        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}

      >

        {/* ── پوسته اصلی نوار — شیشه‌ای تیره ── */}

        <div

          className="relative mx-3 mb-2 rounded-2xl flex items-center px-1"

          style={{

            background: 'rgba(8, 16, 32, 0.92)',

            border: '1px solid rgba(255,255,255,0.09)',

            backdropFilter: 'blur(28px)',

            WebkitBackdropFilter: 'blur(28px)',

            boxShadow: `0 -2px 0 rgba(255,255,255,0.04) inset, 0 8px 40px rgba(0,0,0,0.55), 0 0 32px ${activeColor}18`,

            height: 62,

          }}

        >



          {/* ── حلقه glow متحرک زیر آیتم active ── */}

          {BOTTOM_NAV_ITEMS.map((item) => (

            item.page === currentPage && (

              <motion.div

                key={`glow-${item.page}`}

                layoutId="bnav-glow"

                className="absolute bottom-1 pointer-events-none rounded-xl"

                style={{

                  width: 44,

                  height: 44,

                  background: `radial-gradient(circle, ${item.color}28 0%, transparent 72%)`,

                  filter: `blur(6px)`,

                  left: '50%',

                  transform: 'translateX(-50%)',

                }}

                transition={{ type: 'spring', stiffness: 380, damping: 30 }}

              />

            )

          ))}



          {/* ── ۵ آیتم ناوبری ── */}

          {BOTTOM_NAV_ITEMS.map((item) => {

            const active = currentPage === item.page;

            return (

              <motion.button

                key={item.page}

                type="button"

                onClick={() => onNavigate(item.page)}

                className="flex flex-col items-center justify-center gap-[2px] flex-1 relative"

                style={{ height: 62 }}

                aria-label={item.label}

                whileTap={{ scale: 0.88 }}

                transition={{ type: 'spring', stiffness: 500, damping: 28 }}

              >

                {/* pill پس‌زمینه active */}

                {active && (

                  <motion.div

                    layoutId="bnav-pill"

                    className="absolute inset-x-1 rounded-xl"

                    style={{

                      top: 8, bottom: 8,

                      background: `linear-gradient(160deg, ${item.color}22, ${item.color}0c)`,

                      border: `1px solid ${item.color}30`,

                    }}

                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}

                  />

                )}



                {/* آیکون */}

                <motion.span

                  className="relative z-10 flex items-center justify-center"

                  animate={active

                    ? { y: -1, scale: 1.12 }

                    : { y: 0,  scale: 1    }

                  }

                  transition={{ type: 'spring', stiffness: 460, damping: 26 }}

                  style={{ color: active ? item.color : 'rgba(255,255,255,0.35)' }}

                >

                  {item.icon}



                  {/* نقطه درخشان روی آیکون active */}

                  {active && (

                    <motion.span

                      className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"

                      style={{ background: item.color }}

                      initial={{ scale: 0 }}

                      animate={{ scale: 1 }}

                      transition={{ type: 'spring', stiffness: 500 }}

                    />

                  )}

                </motion.span>



                {/* برچسب */}

                <motion.span

                  className="relative z-10 font-bold"

                  style={{ fontSize: 9, letterSpacing: '0.03em' }}

                  animate={{

                    color: active ? item.color : 'rgba(255,255,255,0.25)',

                    y: active ? 0 : 1,

                  }}

                  transition={{ duration: 0.18 }}

                >

                  {item.label}

                </motion.span>

              </motion.button>

            );

          })}



          {/* ── خط جداکننده ── */}

          <div

            className="flex-shrink-0 self-center"

            style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)', margin: '0 2px' }}

          />



          {/* ── دکمه ورود / پروفایل ── */}

          {currentUser ? (

            /* لاگین — آواتار با ring pulse */

            <motion.button

              type="button"

              onClick={onOpenDashboard}

              className="flex flex-col items-center justify-center gap-[3px] flex-shrink-0 relative"

              style={{ width: 56, height: 62 }}

              aria-label={__t("پنل کاربری")}

              whileTap={{ scale: 0.88 }}

              transition={{ type: 'spring', stiffness: 500, damping: 28 }}

            >

              <span className="relative">

                {/* حلقه ping */}

                <span

                  className="absolute inset-0 rounded-full"

                  style={{

                    border: '1.5px solid #22c55e',

                    animation: 'bnav-dot-ping 2.4s ease-out infinite',

                  }}

                />

                <span

                  className="relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-black"

                  style={{

                    background: 'linear-gradient(135deg, #00BCD4 0%, #0e7490 100%)',

                    color: '#fff',

                    boxShadow: '0 0 0 2px rgba(0,188,212,0.35), 0 0 12px rgba(0,188,212,0.25)',

                  }}

                >

                  {initial || <User size={14} />}

                </span>

                {/* نقطه آنلاین */}

                <span

                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"

                  style={{ background: '#22c55e', borderColor: 'rgb(8,16,32)' }}

                />

              </span>

              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>

                {__t("پروفایل")}

              </span>

            </motion.button>

          ) : (

            /* لاگ‌اوت — دکمه CTA با shine animation */

            <motion.button

              type="button"

              onClick={onOpenAuth}

              className="flex flex-col items-center justify-center gap-[3px] flex-shrink-0 relative overflow-hidden"

              style={{

                width: 60,

                height: 50,

                margin: '0 2px',

                borderRadius: 14,

                background: 'linear-gradient(135deg, #00BCD4 0%, #0891b2 50%, #f59e0b 100%)',

                boxShadow: '0 0 20px rgba(0,188,212,0.35), 0 2px 8px rgba(0,0,0,0.4)',

              }}

              aria-label={__t("ورود")}

              whileTap={{ scale: 0.88 }}

              transition={{ type: 'spring', stiffness: 500, damping: 28 }}

            >

              {/* shine sweep */}

              <span

                className="absolute top-0 bottom-0 w-8 skew-x-[-18deg] pointer-events-none"

                style={{

                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',

                  animation: 'bnav-auth-shine 2.8s ease-in-out infinite',

                }}

              />

              <User size={18} style={{ color: '#fff', position: 'relative', zIndex: 1 }} />

              <span style={{ fontSize: 9, color: '#fff', fontWeight: 800, letterSpacing: '0.04em', zIndex: 1 }}>

                {__t("ورود")}

              </span>

            </motion.button>

          )}



        </div>

      </nav>

    </>

  );

}





function MainApp() {

  const [currentPage, setCurrentPage] = useState<PageKey>('home');

  const [currentCategory, setCurrentCategory] = useState<BlogFilter>('all');

  const [currentPostSlug, setCurrentPostSlug] = useState<string | null>(null);

  const [currentServiceSlug, setCurrentServiceSlug] = useState<string | null>(null);

  const [currentAnchor, setCurrentAnchor] = useState<string | undefined>(undefined);

  const [isMobile, setIsMobile] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const searchInputRef = useRef<HTMLInputElement | null>(null);



  // ── Site settings (Realtime) ───────────────────────────────────────────────

  const settings = useSettings();



  // ── Auth state ─────────────────────────────────────────────────────────────

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [dashboardOpen, setDashboardOpen] = useState(false);



  // Hydrate session on mount & subscribe to changes

  useEffect(() => {

    getUserSession().then(({ user }) => setCurrentUser(user));

    const unsub = onUserAuthChange(user => setCurrentUser(user));

    return unsub;

  }, []);



  useEffect(() => {

    const check = () => setIsMobile(window.innerWidth < 768);

    check();

    window.addEventListener('resize', check);

    return () => window.removeEventListener('resize', check);

  }, []);



  useEffect(() => {

    // باگ ۳ — اگر hash مربوط به admin است، MainApp نباید آن را parse کند

    if (isAdminHash()) return;



    const { page, category, postSlug, serviceSlug, anchor } = getInitialPage() as { page: PageKey; category?: BlogFilter; postSlug?: string; serviceSlug?: string; anchor?: string };

    const routePage = page as RouteParams['page'];

    setCurrentPage(page);

    if (category) setCurrentCategory(category);

    if (postSlug) setCurrentPostSlug(postSlug);

    if (serviceSlug) setCurrentServiceSlug(serviceSlug);

    if (anchor) setCurrentAnchor(anchor);



    const routeParams: RouteParams = {

      page: routePage,

      ...(postSlug ? { postSlug } : {}),

      ...(serviceSlug ? { serviceSlug } : {}),

      ...(category ? { category } : {}),

    };

    const nextPath = buildPath({

      ...routeParams,

      linkId: resolveRouteLinkId(routeParams),

    });



    if (`${window.location.pathname}${window.location.search}` !== nextPath) {

      window.history.replaceState(null, '', nextPath);

    }

  }, []);



  // ── Track page view هر بار که صفحه تغییر می‌کنه ─────────────────────────

  useEffect(() => {

    const pageName = currentPostSlug ? `blog-post/${currentPostSlug}` : currentPage;

    trackPageView(pageName);

  }, [currentPage, currentPostSlug]);



  useEffect(() => {

    if (currentAnchor) {

      // Scroll to anchor after page render

      setTimeout(() => {

        const element = document.getElementById(currentAnchor);

        if (element) {

          element.scrollIntoView({ behavior: 'smooth', block: 'start' });

        }

      }, 100);

    }

  }, [currentPage, currentAnchor]);



  useEffect(() => {

    if (searchOpen) {

      searchInputRef.current?.focus();

    }

  }, [searchOpen]);



  const handleNavigate = (page: PageKey, postSlug?: string, category?: BlogFilter, anchor?: string, serviceSlug?: string) => {

    setCurrentPage(page);

    if (category) setCurrentCategory(category);

    if (postSlug) setCurrentPostSlug(postSlug);

    if (serviceSlug) setCurrentServiceSlug(serviceSlug);

    if (anchor) setCurrentAnchor(anchor);



    const routeParams: RouteParams = {

      page: page as RouteParams['page'],

      ...(postSlug ? { postSlug } : {}),

      ...(serviceSlug ? { serviceSlug } : {}),

      ...(category ? { category } : {}),

    };

    const nextPath = `${buildPath({

      ...routeParams,

      linkId: resolveRouteLinkId(routeParams),

    })}${anchor ? `#${anchor}` : ''}`;



    window.history.pushState(null, '', nextPath);

    window.scrollTo({ top: 0, behavior: 'smooth' });

  };



  const handleLogout = async () => {

    await userLogout();

    setCurrentUser(null);

    setDashboardOpen(false);

  };



  const openSearch = () => {

    setSearchQuery('');

    setSearchOpen(true);

  };



  const closeSearch = () => {

    setSearchOpen(false);

  };



  const searchItems = useMemo<SearchItem[]>(() => {

    const normalize = (...values: Array<string | undefined>) =>

      values.filter(Boolean).join(' ').toLowerCase();



    const pageItems: SearchItem[] = [

      {

        id: 'page-home',

        type: 'page',

        title: __t("خانه"),

        description: settings.home_hero_desc,

        page: 'home',

        searchText: normalize(

          settings.home_hero_title,

          settings.home_hero_desc,

          settings.home_hero_tagline,

          settings.home_services_title,

          settings.home_services_desc,

          ...settings.home_why_us.flatMap((item) => [item.title, item.desc]),

          ...settings.home_stats.map((item) => item.label),

          ...settings.home_faq_items.flatMap((item) => [item.q, item.a]),

        ),

      },

      {

        id: 'page-services',

        type: 'page',

        title: __t("خدمات"),

        description: settings.services_hero_desc,

        page: 'services',

        searchText: normalize(

          settings.services_hero_title,

          settings.services_hero_desc,

          ...settings.services_cards.flatMap((card) => [card.title, card.desc, ...(card.features ?? [])]),

        ),

      },

      {

        id: 'page-process',

        type: 'page',

        title: __t("فرآیند"),

        description: settings.process_hero_desc,

        page: 'process',

        searchText: normalize(

          settings.process_hero_title,

          settings.process_hero_desc,

          ...settings.process_steps.flatMap((step) => [step.title, step.text]),

        ),

      },

      {

        id: 'page-blog',

        type: 'page',

        title: __t("بلاگ"),

        description: __t("مقالات تخصصی در حوزه سرمایه‌گذاری و استراتژی کسب‌وکار"),

        page: 'blog',

        searchText: normalize(__t("بلاگ"), __t("مقالات"), __t("سرمایه‌گذاری"), 'Pitch Deck', __t("مدل مالی"), __t("استارتاپ"), __t("تجربه")),

      },

      {

        id: 'page-contact',

        type: 'page',

        title: __t("تماس با ما"),

        description: settings.contact_hero_desc,

        page: 'contact',

        searchText: normalize(

          settings.contact_hero_title,

          settings.contact_hero_desc,

          settings.contact_phone,

          settings.contact_email,

          settings.working_hours,

          settings.contact_whatsapp,

        ),

      },

      {

        id: 'page-about',

        type: 'page',

        title: __t("درباره ما"),

        description: settings.about_hero_desc,

        page: 'about',

        searchText: normalize(

          settings.about_hero_title,

          settings.about_hero_desc,

          ...(settings.about_mission ? [settings.about_mission.title, settings.about_mission.text] : []),

          ...(settings.about_experience ? [settings.about_experience.title, settings.about_experience.text] : []),

          ...(settings.about_values ? [settings.about_values.title, settings.about_values.text] : []),

          settings.about_story_title,

          settings.about_story_desc,

          ...settings.about_story_items,

        ),

      },

      {

        id: 'page-evaluation',

        type: 'page',

        title: __t("درخواست ارزیابی"),

        description: __t("ارزیابی آماده‌سازی استارتاپ برای جذب سرمایه"),

        page: 'evaluation',

        searchText: normalize(settings.home_ready_title, settings.home_ready_desc, __t("ارزیابی"), __t("سرمایه‌گذاری"), 'Pitch Deck'),

      },

    ];



    const blogItems: SearchItem[] = blogPosts.map((post) => ({

      id: `blog-${post.id}`,

      type: 'blog',

      title: post.title,

      description: post.excerpt,

      page: 'blog',

      postSlug: post.slug,

      searchText: normalize(

        post.title,

        post.excerpt,

        post.content,

        post.tags.join(' '),

        post.author.name,

        blogCategories[post.category]?.label,

      ),

    }));



    return [...pageItems, ...blogItems];

  }, [settings]);



  const searchQueryNormalized = searchQuery.trim().toLowerCase();

  const filteredSearchItems = useMemo(() => {

    if (!searchQueryNormalized) return [];

    return searchItems

      .filter((item) => item.searchText.includes(searchQueryNormalized))

      .sort((a, b) => {

        if (a.type !== b.type) return a.type === 'page' ? -1 : 1;

        return a.title.localeCompare(b.title, 'fa');

      });

  }, [searchItems, searchQueryNormalized]);



  const pageSearchResults = filteredSearchItems.filter((item) => item.type === 'page');

  const blogSearchResults = filteredSearchItems.filter((item) => item.type === 'blog');



  const handleSearchSelect = (item: SearchItem) => {

    setSearchOpen(false);

    setSearchQuery('');

    if (item.type === 'blog' && item.postSlug) {

      handleNavigate('blog-post', item.postSlug);

    } else {

      handleNavigate(item.page);

    }

  };



  const pageContent = (

    <Suspense fallback={<PageSuspenseFallback />}>

      {currentPage === 'home' && <HomePage settings={settings} onNavigate={handleNavigate} />}

      {currentPage === 'services' && <ServicesPage onNavigate={handleNavigate} settings={settings} />}

      {currentPage === 'service-detail' && (

        <ServiceSubPageView

          slug={currentServiceSlug || ''}

          onBack={() => handleNavigate('services')}

        />

      )}

      {currentPage === 'process' && <ProcessPage onNavigate={handleNavigate} settings={settings} />}

      {currentPage === 'blog' && <BlogListingPage initialCategory={currentCategory} onRead={(slug) => handleNavigate('blog-post', slug)} banners={settings.inline_banners ?? []} />}

      {currentPage === 'blog-post' && <EnterpriseBlogPostPage slug={currentPostSlug || ''} onBack={() => handleNavigate('blog', undefined, currentCategory)} />}

      {currentPage === 'contact' && <ContactPage onNavigate={handleNavigate} settings={settings} />}

      {currentPage === 'evaluation' && <EvaluationPage onNavigate={handleNavigate} settings={settings} />}

      {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} settings={settings} />}

      {currentPage !== 'evaluation' && <Footer onNavigate={handleNavigate} settings={settings} />}

    </Suspense>

  );



  // Mobile shell only needs the fallback pages: blog, blog-post, evaluation

  // home/services/process/contact/about are handled by dedicated mobile components inside MobileAppShell

  const mobilePassthroughContent = (

    <Suspense fallback={<PageSuspenseFallback />}>

      {currentPage === 'blog' && <BlogListingPage initialCategory={currentCategory} onRead={(slug) => handleNavigate('blog-post', slug)} banners={settings.inline_banners ?? []} />}

      {currentPage === 'blog-post' && <EnterpriseBlogPostPage slug={currentPostSlug || ''} onBack={() => handleNavigate('blog', undefined, currentCategory)} />}

      {currentPage === 'evaluation' && <EvaluationPage onNavigate={handleNavigate} settings={settings} />}

    </Suspense>

  );



  // تبدیل currentPage به BannerPage (صفحاتی که در BannerPage نیستند را به 'home' map می‌کنیم)

  const bannerPage = (['home','services','process','blog','about','contact','evaluation'] as BannerPage[])

    .includes(currentPage as BannerPage)

    ? (currentPage as BannerPage)

    : 'home';



  return (

    <div className="min-h-screen relative" dir="rtl">

      {!isMobile && currentPage !== 'evaluation' && <AnimatedCanvas />}

      {/* ── Global fixed banners — یک بار رندر می‌شود برای همه صفحات ── */}

      <GlobalFixedBanners banners={settings.inline_banners ?? []} currentPage={bannerPage} />



      {isMobile ? (

        <MobileAppShell

          currentPage={currentPage}

          currentUser={currentUser}

          onNavigate={handleNavigate}

          onOpenAuth={() => setAuthModalOpen(true)}

          onOpenDashboard={() => setDashboardOpen(true)}

          onOpenSearch={openSearch}

          settings={settings}

        >

          {mobilePassthroughContent}

        </MobileAppShell>

      ) : (

        <div className="relative" style={{ zIndex: 1 }}>

          <Navbar

            currentPage={currentPage}

            onNavigate={handleNavigate}

            onNavigateServiceDetail={(slug) => handleNavigate('service-detail', undefined, undefined, undefined, slug)}

            currentUser={currentUser}

            onOpenAuth={() => setAuthModalOpen(true)}

            onOpenDashboard={() => setDashboardOpen(true)}

            onOpenSearch={openSearch}

            settings={settings}

          />

          <div className="pb-0 md:pb-0">

            {pageContent}

          </div>

        </div>

      )}



      <AnimatePresence>

        {searchOpen && (

          <motion.div

            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            onClick={closeSearch}

          >

            <motion.div

              className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl"

              initial={{ y: -24, opacity: 0 }}

              animate={{ y: 0, opacity: 1 }}

              exit={{ y: -24, opacity: 0 }}

              transition={{ type: 'spring', stiffness: 300, damping: 26 }}

              onClick={(e) => e.stopPropagation()}

            >

              <div className="flex flex-col gap-4 p-5 sm:p-6">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <h2 className="text-xl font-bold text-white">{__t("جستجوی سریع سایت")}</h2>

                    <p className="mt-1 text-sm text-slate-400">

                      {__t("عبارت مورد نظر خود را وارد کنید تا صفحات و مقالات مرتبط را بیابید.")}

                    </p>

                  </div>

                  <button

                    type="button"

                    onClick={closeSearch}

                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"

                  >

                    {__t("بستن")}

                  </button>

                </div>



                <div className="relative">

                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} aria-hidden="true" />

                  <input

                    ref={searchInputRef}

                    type="text"

                    value={searchQuery}

                    onChange={(e) => setSearchQuery(e.target.value)}

                    onKeyDown={(e) => {

                      if (e.key === 'Escape') closeSearch();

                    }}

                    placeholder={__t("جستجو در صفحات و مقالات...")}

                    className="w-full rounded-2xl border border-white/10 bg-slate-900/90 py-4 pr-14 pl-4 text-sm text-white placeholder-white/45 outline-none transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"

                    aria-label={__t("جستجوی سایت")}

                  />

                </div>



                <div className="max-h-[60vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/90 p-3">

                  {searchQueryNormalized === '' ? (

                    <div className="rounded-2xl bg-white/5 p-6 text-center text-sm text-slate-400">

                      {__t("برای دیدن نتایج، یک کلمه یا عبارت را وارد کنید.")}

                    </div>

                  ) : filteredSearchItems.length === 0 ? (

                    <div className="rounded-2xl bg-white/5 p-6 text-center text-sm text-slate-400">

                      {__t("نتیجه‌ای یافت نشد.")}

                    </div>

                  ) : (

                    <div className="space-y-4">

                      {pageSearchResults.length > 0 && (

                        <div>

                          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">

                            {__t("صفحات")}

                          </div>

                          <div className="space-y-2">

                            {pageSearchResults.map((item) => (

                              <button

                                key={item.id}

                                type="button"

                                onClick={() => handleSearchSelect(item)}

                                className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-right text-sm text-white transition hover:border-teal-400/40 hover:bg-white/10"

                              >

                                <div className="font-semibold text-white">{item.title}</div>

                                <div className="mt-1 text-xs text-slate-400">{item.description}</div>

                              </button>

                            ))}

                          </div>

                        </div>

                      )}



                      {blogSearchResults.length > 0 && (

                        <div>

                          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">

                            {__t("مقالات")}

                          </div>

                          <div className="space-y-2">

                            {blogSearchResults.map((item) => (

                              <button

                                key={item.id}

                                type="button"

                                onClick={() => handleSearchSelect(item)}

                                className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-right text-sm text-white transition hover:border-teal-400/40 hover:bg-white/10"

                              >

                                <div className="font-semibold text-white">{item.title}</div>

                                <div className="mt-1 text-xs text-slate-400">{item.description}</div>

                              </button>

                            ))}

                          </div>

                        </div>

                      )}

                    </div>

                  )}

                </div>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>



      {/* ── Auth Modal ──────────────────────────────────────────────────────── */}

      <AuthModal

        isOpen={authModalOpen}

        onClose={() => setAuthModalOpen(false)}

        onAuthSuccess={user => { setCurrentUser(user); setDashboardOpen(true); }}

      />



      {/* ── User Dashboard ──────────────────────────────────────────────────── */}

      {currentUser && dashboardOpen && (

        <Suspense fallback={null}>

          <UserDashboard

            user={currentUser}

            onClose={() => setDashboardOpen(false)}

            onLogout={handleLogout}

          />

        </Suspense>

      )}



      {/* SocialFloatWidget همیشه رندر می‌شود؛ درون خودش چک می‌کند آیا باید نمایش دهد */}

      {/* ChatWidget فقط وقتی social_float فعال نیست نمایش داده می‌شود */}

      <SocialFloatWidget settings={settings} />

      {!settings.social_float_enabled && <ChatWidget />}



      {/* ── Popup Ads ── */}

      {settings.popup_ads?.length > 0 && (

        <PopupAdRenderer ads={settings.popup_ads} currentPage={currentPostSlug ? 'blog-post' : currentPage} />

      )}



    </div>

  );

}

