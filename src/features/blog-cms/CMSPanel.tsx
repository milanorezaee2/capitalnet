// ─── Enterprise Blog CMS — Main CMS Panel (Router + Layout) ──────────────────
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Plus, Clock, Calendar, Folder,
  Tag, UserCircle2, MessageSquare, Image, TrendingUp, Settings,
  Activity, ChevronLeft, BookOpen, ChevronRight,
} from 'lucide-react';

// ── Pages ──────────────────────────────────────────────────────────────────
import CMSDashboard from './pages/CMSDashboard';
import CMSPostsPage from './pages/CMSPostsPage';
import CMSEditor from './pages/CMSEditor';
import CMSCategoriesPage from './pages/CMSCategoriesPage';
import CMSTagsPage from './pages/CMSTagsPage';
import CMSAuthorsPage from './pages/CMSAuthorsPage';
import CMSCommentsPage from './pages/CMSCommentsPage';
import CMSMediaPage from './pages/CMSMediaPage';
import CMSSettingsPage from './pages/CMSSettingsPage';
import CMSAnalyticsPage from './pages/CMSAnalyticsPage';
import CMSActivityPage from './pages/CMSActivityPage';

import type { BlogPostRow } from '../../lib/blogApi';

export type CMSPage =
  | 'blog-dashboard'
  | 'blog-posts' | 'blog-new-post' | 'blog-edit-post' | 'blog-drafts' | 'blog-scheduled'
  | 'blog-categories' | 'blog-tags' | 'blog-authors'
  | 'blog-comments' | 'blog-media'
  | 'blog-seo' | 'blog-settings'
  | 'blog-analytics' | 'blog-activity' | 'blog-revisions';

export const CMS_PAGES: CMSPage[] = [
  'blog-dashboard', 'blog-posts', 'blog-new-post', 'blog-edit-post',
  'blog-drafts', 'blog-scheduled', 'blog-categories', 'blog-tags',
  'blog-authors', 'blog-comments', 'blog-media', 'blog-seo',
  'blog-settings', 'blog-analytics', 'blog-activity', 'blog-revisions',
];

// ── Sidebar navigation config ──────────────────────────────────────────────
interface NavItem { id: CMSPage; label: string; icon: React.ReactNode; badge?: number }
interface NavGroup { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'مدیریت',
    items: [
      { id: 'blog-dashboard', label: 'داشبورد', icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    label: 'محتوا',
    items: [
      { id: 'blog-posts',     label: 'همه مقالات',   icon: <FileText size={16} /> },
      { id: 'blog-new-post',  label: 'پست جدید',     icon: <Plus size={16} /> },
      { id: 'blog-drafts',    label: 'پیش‌نویس‌ها',  icon: <Clock size={16} /> },
      { id: 'blog-scheduled', label: 'زمان‌بندی',    icon: <Calendar size={16} /> },
    ],
  },
  {
    label: 'سازمان‌دهی',
    items: [
      { id: 'blog-categories', label: 'دسته‌بندی‌ها', icon: <Folder size={16} /> },
      { id: 'blog-tags',       label: 'برچسب‌ها',     icon: <Tag size={16} /> },
      { id: 'blog-authors',    label: 'نویسندگان',    icon: <UserCircle2 size={16} /> },
    ],
  },
  {
    label: 'رسانه و تعامل',
    items: [
      { id: 'blog-media',    label: 'کتابخانه رسانه', icon: <Image size={16} /> },
      { id: 'blog-comments', label: 'نظرات',          icon: <MessageSquare size={16} /> },
    ],
  },
  {
    label: 'آمار و پیکربندی',
    items: [
      { id: 'blog-analytics', label: 'آنالیتیکس',     icon: <TrendingUp size={16} /> },
      { id: 'blog-activity',  label: 'گزارش فعالیت',  icon: <Activity size={16} /> },
      { id: 'blog-settings',  label: 'تنظیمات',       icon: <Settings size={16} /> },
    ],
  },
];

const PAGE_TITLES: Record<CMSPage, string> = {
  'blog-dashboard':  'داشبورد بلاگ',
  'blog-posts':      'مدیریت مقالات',
  'blog-new-post':   'پست جدید',
  'blog-edit-post':  'ویرایش مقاله',
  'blog-drafts':     'پیش‌نویس‌ها',
  'blog-scheduled':  'زمان‌بندی شده',
  'blog-categories': 'دسته‌بندی‌ها',
  'blog-tags':       'برچسب‌ها',
  'blog-authors':    'نویسندگان',
  'blog-comments':   'نظرات',
  'blog-media':      'کتابخانه رسانه',
  'blog-seo':        'مدیریت SEO',
  'blog-settings':   'تنظیمات بلاگ',
  'blog-analytics':  'آنالیتیکس',
  'blog-activity':   'گزارش فعالیت',
  'blog-revisions':  'نسخه‌ها',
};

// ── CMS Sidebar ────────────────────────────────────────────────────────────
function CMSSidebar({
  currentPage, onNavigate, badges, onBack,
}: {
  currentPage: CMSPage;
  onNavigate: (page: CMSPage) => void;
  badges?: Partial<Record<CMSPage, number>>;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Back to main panel */}
      <button onClick={onBack}
        className="flex items-center gap-2 px-4 py-3 text-xs font-medium transition-colors hover:bg-white/5"
        style={{ color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <ChevronRight size={14} /> بازگشت به پنل
      </button>

      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)' }}>
          <BookOpen size={14} style={{ color: '#fff' }} />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">Blog CMS</p>
          <p className="text-[10px] mt-0.5" style={{ color: '#00BCD4' }}>Enterprise</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
            <p className="px-3 mb-1.5 text-[9px] font-bold tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.2)' }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = currentPage === item.id;
                const badge = badges?.[item.id];
                return (
                  <button key={item.id} onClick={() => onNavigate(item.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: isActive ? 'rgba(0,188,212,0.12)' : 'transparent',
                      color: isActive ? '#00BCD4' : 'rgba(255,255,255,0.55)',
                      border: isActive ? '1px solid rgba(0,188,212,0.2)' : '1px solid transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                      }
                    }}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="flex-1 text-right text-xs">{item.label}</span>
                    {badge !== undefined && badge > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center"
                        style={{ background: 'rgba(239,68,68,0.85)', color: '#fff' }}>
                        {badge}
                      </span>
                    )}
                    {isActive && <ChevronLeft size={12} className="flex-shrink-0 opacity-50" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

// ── Main CMS Panel ─────────────────────────────────────────────────────────
export interface CMSPanelProps {
  /** Called when user clicks "back to main panel" */
  onBack: () => void;
  initialPage?: CMSPage;
}

export default function CMSPanel({ onBack, initialPage = 'blog-dashboard' }: CMSPanelProps) {
  const [currentPage, setCurrentPage] = useState<CMSPage>(initialPage);
  const [editPost, setEditPost] = useState<BlogPostRow | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persist CMS page in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cms-current-page') as CMSPage | null;
    if (saved && CMS_PAGES.includes(saved) && initialPage === 'blog-dashboard') {
      setCurrentPage(saved);
    }
  }, []);

  const navigateTo = async (page: CMSPage, postId?: string) => {
    if (page === 'blog-edit-post' && postId) {
      // Fetch the post to edit
      const { fetchAllPosts } = await import('../../lib/blogApi');
      const posts = await fetchAllPosts();
      const found = (posts as BlogPostRow[]).find((p: BlogPostRow) => p.id === postId);
      setEditPost(found ?? null);
    }
    localStorage.setItem('cms-current-page', page);
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const handleEditorSaved = () => {
    setEditPost(null);
    navigateTo('blog-posts');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'blog-dashboard':  return <CMSDashboard onNavigate={(p) => navigateTo(p as CMSPage)} />;
      case 'blog-posts':      return <CMSPostsPage onNavigate={(p, id) => navigateTo(p as CMSPage, id)} />;
      case 'blog-new-post':   return <CMSEditor post={null} onBack={() => navigateTo('blog-posts')} onSaved={handleEditorSaved} />;
      case 'blog-edit-post':  return <CMSEditor post={editPost} onBack={() => navigateTo('blog-posts')} onSaved={handleEditorSaved} />;
      case 'blog-drafts':     return <CMSPostsPage onNavigate={(p, id) => navigateTo(p as CMSPage, id)} initialFilter="draft" />;
      case 'blog-scheduled':  return <CMSPostsPage onNavigate={(p, id) => navigateTo(p as CMSPage, id)} initialFilter="scheduled" />;
      case 'blog-categories': return <CMSCategoriesPage />;
      case 'blog-tags':       return <CMSTagsPage />;
      case 'blog-authors':    return <CMSAuthorsPage />;
      case 'blog-comments':   return <CMSCommentsPage />;
      case 'blog-media':      return <CMSMediaPage />;
      case 'blog-analytics':  return <CMSAnalyticsPage />;
      case 'blog-settings':   return <CMSSettingsPage />;
      case 'blog-activity':   return <CMSActivityPage />;
      default:                return <CMSDashboard onNavigate={(p) => navigateTo(p as CMSPage)} />;
    }
  };

  const pageTitle = PAGE_TITLES[currentPage] ?? 'بلاگ';

  return (
    <div className="flex h-screen" style={{ background: '#07111e', color: '#e2e8f0' }} dir="rtl">
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-52 flex-shrink-0 sticky top-0 h-screen overflow-hidden"
        style={{ background: 'rgba(4,8,18,0.97)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
      >
        <CMSSidebar currentPage={currentPage} onNavigate={navigateTo} onBack={onBack} />
      </aside>

      {/* ── Mobile Sidebar ──────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside key="sidebar" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-52 z-50 lg:hidden"
              style={{ background: 'rgba(4,8,18,0.99)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
              <CMSSidebar currentPage={currentPage} onNavigate={navigateTo} onBack={onBack} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 lg:px-5 py-3 sticky top-0 z-30"
          style={{
            background: 'rgba(7,17,30,0.95)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
          }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <span>بلاگ</span>
              <ChevronLeft size={10} />
              <span style={{ color: '#fff' }}>{pageTitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-1 rounded-full"
              style={{ background: 'rgba(0,188,212,0.1)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
              Enterprise CMS
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-5">
          <AnimatePresence mode="wait">
            <motion.div key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
