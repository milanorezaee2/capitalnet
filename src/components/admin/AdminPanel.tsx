import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { getAdminSession, onAdminAuthChange } from '../../utils/adminStore';
import type { AdminUser } from '../../utils/adminStore';
import { supabase } from '../../lib/supabaseApi';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import type { AdminPage } from './AdminLayout';
import AdminDashboard, { NewUserAlertBanner } from './AdminDashboard';
import AdminLeadsPage from './AdminLeadsPage';
import AdminUsersPage from './AdminUsersPage';
import AdminMessagesPage from './AdminMessagesPage';
import AdminBlogPage from '../AdminBlogPage';
import AdminTestimonialsPage from './AdminTestimonialsPage';
import AdminSettingsPage from './AdminSettingsPage';
import AdminAnalyticsPage from './AdminAnalyticsPage';
import AdminLiveChatPage from './AdminLiveChatPage';
import AdminSocialMediaPage from './AdminSocialMediaPage';
import AdminPageContentPage from './AdminPageContentPage';
import AdminEvaluationPage from './AdminEvaluationPage';
import AdminSEOPage from './AdminSEOPage';
import AdminPopupAdsPage from './AdminPopupAdsPage';
import AdminBannersPage from './AdminBannersPage';
import AdminServicesPage from './AdminServicesPage';
import AdminServiceSubPages from './AdminServiceSubPages';
import AdminProcessCMS from './AdminProcessCMS';
import AdminAboutCMSPage from './AdminAboutCMSPage';
import AdminContactCMSPage from './AdminContactCMSPage';
import AdminContactMessagesPage from './AdminContactMessagesPage';
import { getUnreadCount } from '../../lib/messagesApi';
import type { UserProfile } from '../../lib/usersApi';
import CMSPanel from '../../features/blog-cms/CMSPanel';

const ADMIN_PAGE_STORAGE_KEY = 'admin-current-page';

function getInitialAdminPage(): AdminPage {
  if (typeof window === 'undefined') return 'dashboard';
  const savedPage = window.localStorage.getItem(ADMIN_PAGE_STORAGE_KEY);
  const validPages: AdminPage[] = [
    'dashboard', 'leads', 'evaluation', 'users', 'messages', 'contact-messages', 'chat',
    'page-content', 'about-cms', 'contact-cms',
    'blog', 'blog-cms', 'testimonials', 'analytics', 'social-media', 'settings', 'seo',
    'popup-ads', 'banners', 'services', 'service-subpages', 'process-cms',
  ];
  return validPages.includes(savedPage as AdminPage) ? (savedPage as AdminPage) : 'dashboard';
}

export default function AdminPanel() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [currentPage, setCurrentPage] = useState<AdminPage>(getInitialAdminPage);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  const [newUsersBadge, setNewUsersBadge] = useState(0);
  const [globalUserAlerts, setGlobalUserAlerts] = useState<UserProfile[]>([]);
  const isReady = useRef(false);

  // ── بررسی session موجود هنگام باز شدن پنل ──────────────────────────────────
  useEffect(() => {
    getAdminSession()
      .then(({ user }) => {
        if (import.meta.env.DEV) {
          console.debug('[AdminPanel] initial admin session', { user });
        }
        setAdminUser(user);
      })
      .catch(error => {
        console.error('[AdminPanel] getAdminSession failed', error);
        setAdminUser(null);
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  // ── گوش دادن به تغییرات auth ─────────────────────────────────────────────
  // فقط بعد از checkingAuth تمام شد subscribe می‌کنیم تا INITIAL_SESSION
  // با getAdminSession تداخل نداشته باشد
  useEffect(() => {
    if (checkingAuth) return;
    const unsubscribe = onAdminAuthChange(user => {
      if (import.meta.env.DEV) {
        console.debug('[AdminPanel] auth state changed', { user });
      }
      setAdminUser(user);
    });
    return unsubscribe;
  }, [checkingAuth]);

  // ── شمارش پیام‌های خوانده‌نشده چت ────────────────────────────────────────
  const refreshChatBadge = async () => {
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_type', 'admin');
    setUnreadChats(count ?? 0);
  };

  // ── Realtime: اعلان فوری به جای polling ──────────────────────────────────
  useEffect(() => {
    if (!adminUser) return;

    // بار اول
    getUnreadCount().then(setUnreadMessages);
    refreshChatBadge();

    // آماده شدن برای رویدادهای جدید (جلوگیری از false-positive در بارگذاری اولیه)
    const readyTimer = setTimeout(() => { isReady.current = true; }, 2500);

    // Realtime subscription
    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'contact_messages' },
        () => setUnreadMessages(n => n + 1)
      )
      .on(
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'contact_messages', filter: 'status=eq.read' },
        () => getUnreadCount().then(setUnreadMessages)
      )
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        () => refreshChatBadge()
      )
      .on(
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
        () => refreshChatBadge()
      )
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'users' },
        (payload: any) => {
          if (!isReady.current) return;
          const u = payload.new as UserProfile;
          if (u.email === 'admin@capnet.io') return;
          // badge در sidebar
          setNewUsersBadge(n => n + 1);
          // الارم global (فقط وقتی در صفحه کاربران نیستیم)
          setGlobalUserAlerts(prev => [...prev, u]);
        }
      )
      .on(
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'users' },
        (payload: any) => {
          if (!isReady.current) return;
          const u = payload.new as UserProfile;
          if (!u.last_login_at) return;
          if (u.email === 'admin@capnet.io') return;
          // فقط وقتی last_login_at تازه آپدیت شده (= کاربر لاگین کرده)
          const prev = payload.old as UserProfile;
          if (u.last_login_at === prev?.last_login_at) return;
          // badge در sidebar
          setNewUsersBadge(n => n + 1);
          // الارم global با متن متفاوت
          setGlobalUserAlerts(alerts => [...alerts, { ...u, _loginAlert: true } as any]);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(readyTimer);
      supabase.removeChannel(channel);
    };
  }, [adminUser]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (checkingAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#030612' }}
      >
        <span className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not logged in → Show Login ────────────────────────────────────────────
  if (!adminUser) {
    return (
      <AdminLogin
          onLogin={async (user) => {
            // If the child provides the authenticated AdminUser, use it immediately
            // to avoid a race where Supabase session isn't yet observable.
            if (user) {
              if (import.meta.env.DEV) {
                console.debug('[AdminPanel] admin logged in (immediate)', { user });
              }
              setAdminUser(user);
              return;
            }

            // Fallback: query the session as before
            const { user: sessUser } = await getAdminSession();
            if (import.meta.env.DEV) {
              console.debug('[AdminPanel] admin logged in (fetched)', { user: sessUser });
            }
            if (sessUser) setAdminUser(sessUser);
          }}
        />
    );
  }

  // ── Logged in → Show Panel ────────────────────────────────────────────────
  const handleNavigate = (page: AdminPage) => {
    if (import.meta.env.DEV) {
      console.debug('[AdminPanel] navigate', { page });
    }
    window.localStorage.setItem(ADMIN_PAGE_STORAGE_KEY, page);
    setCurrentPage(page);
    if (page === 'users') setNewUsersBadge(0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':    return <AdminDashboard key="dashboard" onNavigate={handleNavigate} />;
      case 'leads':        return <AdminLeadsPage key="leads" />;
      case 'evaluation':   return <AdminEvaluationPage key="evaluation" />;
      case 'users':        return <AdminUsersPage key="users" />;
      case 'messages':     return <AdminMessagesPage key="messages" />;
      case 'chat':         return <AdminLiveChatPage key="chat" />;
      case 'page-content': return <AdminPageContentPage key="page-content" />;
      case 'blog':         return <AdminBlogPage key="blog" />;
      case 'testimonials': return <AdminTestimonialsPage key="testimonials" />;
      case 'analytics':    return <AdminAnalyticsPage key="analytics" />;
      case 'social-media': return <AdminSocialMediaPage key="social-media" />;
      case 'settings':     return <AdminSettingsPage key="settings" />;
      case 'seo':          return <AdminSEOPage key="seo" />;
      case 'popup-ads':    return <AdminPopupAdsPage key="popup-ads" />;
      case 'banners':      return <AdminBannersPage key="banners" />;
      case 'services':          return <AdminServicesPage key="services" />;
      case 'service-subpages':  return <AdminServiceSubPages key="service-subpages" />;
      case 'process-cms':       return <AdminProcessCMS key="process-cms" />;
      case 'about-cms':             return <AdminAboutCMSPage key="about-cms" />;
      case 'contact-cms':           return <AdminContactCMSPage key="contact-cms" />;
      case 'contact-messages':      return <AdminContactMessagesPage key="contact-messages" />;
      default:             return <AdminDashboard key="dashboard" onNavigate={setCurrentPage} />;
    }
  };

  // ── Blog CMS Enterprise renders full-screen (outside AdminLayout) ─────────
  if (currentPage === 'blog-cms') {
    return (
      <>
        {globalUserAlerts.length > 0 && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none" style={{ width: 360 }}>
            <AnimatePresence>
              {globalUserAlerts.map((u, i) => (
                <div key={`gua-${u.id}-${i}`} className="pointer-events-auto">
                  <NewUserAlertBanner
                    user={u}
                    onClose={() => setGlobalUserAlerts(prev => prev.filter((_, j) => j !== i))}
                    onView={() => { setGlobalUserAlerts([]); handleNavigate('users'); }}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <CMSPanel
          key="blog-cms"
          onBack={() => handleNavigate('dashboard')}
          initialPage="blog-dashboard"
        />
      </>
    );
  }

  return (
    <>
      {/* ── Global new-user alerts (نمایش در همه صفحات پنل جز صفحه کاربران) ── */}
      {currentPage !== 'users' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none" style={{ width: 360 }}>
          <AnimatePresence>
            {globalUserAlerts.map((u, i) => (
              <div key={`gua-${u.id}-${i}`} className="pointer-events-auto">
                <NewUserAlertBanner
                  user={u}
                  onClose={() => setGlobalUserAlerts(prev => prev.filter((_, j) => j !== i))}
                  onView={() => {
                    setGlobalUserAlerts([]);
                    handleNavigate('users');
                  }}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AdminLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        adminEmail={adminUser.email}
        onLogout={() => setAdminUser(null)}
        badges={{ messages: unreadMessages, chat: unreadChats, users: newUsersBadge }}
      >
        {renderPage()}
      </AdminLayout>
    </>
  );
}
