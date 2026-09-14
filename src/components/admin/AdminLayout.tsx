import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCircle2,
  FileText,
  MessageSquare,
  Settings,
  Star,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  BarChart3,
  MessagesSquare,
  Share2,
  PanelLeft,
  ClipboardList,
  TrendingUp,
  Megaphone,
  BookOpen,
  Info,
  Phone,
  Layers,
} from 'lucide-react';
import { adminLogout } from '../../utils/adminStore';

export type AdminPage =
  | 'dashboard'
  | 'leads'
  | 'evaluation'
  | 'users'
  | 'messages'
  | 'contact-messages'
  | 'chat'
  | 'page-content'
  | 'about-cms'
  | 'contact-cms'
  | 'blog'
  | 'blog-cms'
  | 'testimonials'
  | 'analytics'
  | 'social-media'
  | 'settings'
  | 'seo'
  | 'popup-ads'
  | 'banners'
  | 'services'
  | 'service-subpages'
  | 'process-cms';

interface NavItem {
  id: AdminPage;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  adminEmail: string;
  onLogout: () => void;
  badges?: Partial<Record<AdminPage, number>>;
}

interface SidebarContentProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onCloseMobile: () => void;
  adminEmail: string;
  badges: Partial<Record<AdminPage, number>>;
  onLogout: () => void;
}

// ── گروه‌بندی سایدبار ──────────────────────────────────────────────────────────
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'مدیریت اطلاعات',
    items: [
      { id: 'dashboard',          label: 'داشبورد',            icon: <LayoutDashboard size={18} /> },
      { id: 'leads',              label: 'لیدها',               icon: <Users size={18} /> },
      { id: 'evaluation',         label: 'درخواست ارزیابی',     icon: <ClipboardList size={18} /> },
      { id: 'users',              label: 'کاربران سایت',        icon: <UserCircle2 size={18} /> },
      { id: 'messages',           label: 'پیام‌های سایت',       icon: <MessageSquare size={18} /> },
      { id: 'contact-messages',   label: 'فرم تماس',            icon: <Phone size={18} /> },
      { id: 'chat',               label: 'چت آنلاین',           icon: <MessagesSquare size={18} /> },
    ],
  },
  {
    label: 'محتوای سایت',
    items: [
      { id: 'services',         label: 'تنظیمات خدمات',     icon: <BookOpen size={18} /> },
      { id: 'service-subpages', label: 'صفحات خدمات',       icon: <PanelLeft size={18} /> },
      { id: 'process-cms',      label: 'مدیریت فرآیند',     icon: <TrendingUp size={18} /> },
      { id: 'about-cms',        label: 'صفحه درباره ما',    icon: <Info size={18} /> },
      { id: 'contact-cms',      label: 'صفحه تماس با ما',   icon: <Phone size={18} /> },
      { id: 'page-content',     label: 'مدیریت صفحات',      icon: <PanelLeft size={18} /> },
      { id: 'popup-ads',        label: 'پاپ‌آپ آگهی‌ها',    icon: <Megaphone size={18} /> },
      { id: 'banners',          label: 'بنرهای تبلیغاتی',   icon: <Layers size={18} /> },
      { id: 'blog',             label: 'بلاگ (قدیمی)',       icon: <FileText size={18} /> },
      { id: 'testimonials',     label: 'نظرات',              icon: <Star size={18} /> },
      { id: 'analytics',        label: 'آنالیتیکس',          icon: <BarChart3 size={18} /> },
    ],
  },
  {
    label: 'پیکربندی',
    items: [
      { id: 'social-media', label: 'شبکه‌های اجتماعی', icon: <Share2 size={18} /> },
      { id: 'settings',     label: 'تنظیمات سایت',      icon: <Settings size={18} /> },
      { id: 'seo',          label: 'سئو سایت',           icon: <TrendingUp size={18} /> },
    ],
  },
];

// flat list برای header title lookup
const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap(g => g.items);

// ── خارج از AdminLayout تعریف شده تا در هر render دوباره ساخته نشود ──────────
const SidebarContent = memo(function SidebarContent({
  currentPage,
  onNavigate,
  onCloseMobile,
  adminEmail,
  badges,
  onLogout: handleLogout,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="px-5 py-5 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)' }}
        >
          <span className="text-white font-black text-xs">CN</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">CapNet</p>
          <p className="text-teal-400/70 text-[11px] mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav — گروه‌بندی شده */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
            {/* Group label */}
            <p
              className="px-3 mb-1.5 text-[10px] font-bold tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              {group.label}
            </p>
            {/* Group items */}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = currentPage === item.id;
                const badge = badges[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); onCloseMobile(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: isActive ? 'rgba(0,188,212,0.12)' : 'transparent',
                      color: isActive ? '#00BCD4' : 'rgba(255,255,255,0.6)',
                      border: isActive ? '1px solid rgba(0,188,212,0.2)' : '1px solid transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
                      }
                    }}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="flex-1 text-right">{item.label}</span>
                    {badge !== undefined && badge > 0 && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                        style={{ background: 'rgba(239,68,68,0.85)', color: '#fff' }}
                      >
                        {badge}
                      </span>
                    )}
                    {isActive && <ChevronLeft size={14} className="flex-shrink-0 opacity-60" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User / Logout */}
      <div
        className="px-3 py-4 space-y-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-3 px-3 py-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)' }}
          >
            {adminEmail[0]?.toUpperCase() ?? 'A'}
          </div>
          <p className="text-xs text-slate-400 truncate flex-1 text-right">{adminEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: 'rgba(239,68,68,0.8)', border: '1px solid transparent' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
          }}
        >
          <LogOut size={16} />
          <span className="flex-1 text-right">خروج از پنل</span>
        </button>
      </div>
    </div>
  );
});

// ── AdminLayout ───────────────────────────────────────────────────────────────
export default function AdminLayout({
  children,
  currentPage,
  onNavigate,
  adminEmail,
  onLogout,
  badges = {},
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await adminLogout();
    onLogout();
  };

  const closeMobile = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex" style={{ background: '#07111e', color: '#e2e8f0' }} dir="rtl">
      {/* ── Desktop Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-0 h-screen overflow-hidden"
        style={{ background: 'rgba(4,8,18,0.97)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
      >
        <SidebarContent
          currentPage={currentPage}
          onNavigate={onNavigate}
          onCloseMobile={closeMobile}
          adminEmail={adminEmail}
          badges={badges}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={closeMobile}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-56 z-50 lg:hidden"
              style={{ background: 'rgba(4,8,18,0.99)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
            >
              <button
                onClick={closeMobile}
                className="absolute top-4 left-4 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
              <SidebarContent
                currentPage={currentPage}
                onNavigate={onNavigate}
                onCloseMobile={closeMobile}
                adminEmail={adminEmail}
                badges={badges}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 lg:px-6 py-3 sticky top-0 z-30"
          style={{
            background: 'rgba(7,17,30,0.95)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-base font-semibold text-white">
              {NAV_ITEMS.find(n => n.id === currentPage)?.label ?? 'پنل ادمین'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] px-2 py-1 rounded-full"
              style={{ background: 'rgba(0,188,212,0.1)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}
            >
              ادمین آنلاین
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
