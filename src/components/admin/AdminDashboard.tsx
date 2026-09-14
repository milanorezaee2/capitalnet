import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, FileText, TrendingUp,
  UserCheck, Clock, RefreshCw, ArrowUpRight,
  UserCircle2, Mail, Building2, Bell, LogIn,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseApi';
import type { AdminPage } from './AdminLayout';
import type { UserProfile } from '../../lib/usersApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  totalUsers: number;
  newUsers: number;
  totalLeads: number;
  newLeads: number;
  totalMessages: number;
  unreadMessages: number;
  totalPosts: number;
  publishedPosts: number;
  founderLeads: number;
  investorLeads: number;
}

interface RecentLead {
  id: string;
  full_name: string;
  email: string;
  profile_type: string;
  company_name: string | null;
  org_name: string | null;
  stage: string | null;
  created_at: string;
  status: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:       { label: 'جدید',      color: '#00BCD4' },
  in_review: { label: 'در بررسی',  color: '#f59e0b' },
  approved:  { label: 'تأییدشده', color: '#22c55e' },
  rejected:  { label: 'رد شده',   color: '#ef4444' },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, color, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 transition-all"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : {}}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        {onClick && (
          <ArrowUpRight size={14} style={{ color: `${color}80` }} />
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
    </motion.div>
  );
}

// ─── New User Toast (global — shown from dashboard too) ───────────────────────

export function NewUserAlertBanner({
  user,
  onClose,
  onView,
}: {
  user: UserProfile & { _loginAlert?: boolean };
  onClose: () => void;
  onView: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 7000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isLogin = (user as any)._loginAlert === true;
  const avatar = (user.full_name ?? user.email ?? 'U').charAt(0).toUpperCase();
  const accentColor = isLogin ? '#34d399' : '#38bdf8';
  const accentBg    = isLogin ? 'rgba(52,211,153,0.15)' : 'rgba(56,189,248,0.15)';
  const accentBorder = isLogin ? 'rgba(52,211,153,0.4)' : 'rgba(56,189,248,0.4)';
  const glowColor   = isLogin ? 'rgba(52,211,153,0.18)' : 'rgba(56,189,248,0.18)';

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="fixed top-4 right-1/2 translate-x-1/2 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl"
      style={{
        background: 'rgba(6,16,38,0.98)',
        border: `1px solid ${accentBorder}`,
        boxShadow: `0 12px 40px ${glowColor}, 0 2px 8px rgba(0,0,0,0.5)`,
        minWidth: 300,
        maxWidth: 380,
      }}
    >
      {/* icon with pulse */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
          style={{ background: isLogin ? 'linear-gradient(135deg,#34d399,#059669)' : 'linear-gradient(135deg,#38bdf8,#818cf8)' }}>
          {isLogin ? <LogIn size={18} /> : avatar}
        </div>
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{ background: accentColor, border: '2px solid #060f26', animation: 'ping 1s cubic-bezier(0,0,.2,1) infinite' }} />
      </div>
      {/* text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {isLogin ? <LogIn size={11} style={{ color: accentColor }} /> : <Bell size={11} className="text-sky-400" />}
          <span className="text-[11px] font-semibold" style={{ color: accentColor }}>
            {isLogin ? 'کاربر وارد سایت شد!' : 'کاربر جدید ثبت‌نام کرد!'}
          </span>
        </div>
        <p className="text-sm font-bold text-white truncate">
          {user.full_name || user.email || 'کاربر ناشناس'}
        </p>
        {user.email && (
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
        )}
      </div>
      {/* actions */}
      <div className="flex flex-col gap-1.5 flex-shrink-0">
        <button
          onClick={onView}
          className="text-[11px] font-semibold px-3 py-1 rounded-lg transition-all"
          style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}
        >
          مشاهده
        </button>
        <button onClick={onClose} className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors px-1">
          بستن
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard({
  onNavigate,
}: {
  onNavigate: (page: AdminPage) => void;
}) {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, newUsers: 0,
    totalLeads: 0, newLeads: 0,
    totalMessages: 0, unreadMessages: 0,
    totalPosts: 0, publishedPosts: 0,
    founderLeads: 0, investorLeads: 0,
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [newUserAlerts, setNewUserAlerts] = useState<UserProfile[]>([]);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [leadsRes, messagesRes, postsRes, usersRes] = await Promise.all([
        (supabase as any).from('assessments').select('id, profile_type, status, created_at, full_name, email, company_name, org_name, stage'),
        (supabase as any).from('contact_messages').select('id, status'),
        (supabase as any).from('blog_posts').select('id, status'),
        (supabase as any).from('users').select('id, email, full_name, phone, company_name, position, created_at').order('created_at', { ascending: false }).limit(50),
      ]);

      const leads    = (leadsRes.data    ?? []) as RecentLead[];
      const messages = (messagesRes.data ?? []) as Array<{ id: string; status: string }>;
      const posts    = (postsRes.data    ?? []) as Array<{ id: string; status: string }>;
      const users    = (usersRes.data    ?? []) as UserProfile[];

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      setStats({
        totalUsers:      users.length,
        newUsers:        users.filter(u => u.created_at && u.created_at >= sevenDaysAgo).length,
        totalLeads:      leads.length,
        newLeads:        leads.filter(l => l.created_at >= sevenDaysAgo).length,
        totalMessages:   messages.length,
        unreadMessages:  messages.filter(m => m.status === 'unread').length,
        totalPosts:      posts.length,
        publishedPosts:  posts.filter(p => p.status === 'published').length,
        founderLeads:    leads.filter(l => l.profile_type === 'founder').length,
        investorLeads:   leads.filter(l => l.profile_type === 'investor').length,
      });

      setRecentLeads(
        [...leads]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
      );

      setRecentUsers(users.slice(0, 5));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // interval با silent=true — بدون flash کردن UI
    const interval = setInterval(() => fetchStats(true), 60_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // ── Realtime: کاربر جدید → الارم داشبورد ────────────────────────────────
  useEffect(() => {
    let ready = false;
    const t = setTimeout(() => { ready = true; }, 2500);

    const channel = supabase
      .channel('dashboard-new-users')
      .on('postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'users' },
        (payload: any) => {
          if (!ready) return;
          const u = payload.new as UserProfile;
          if (u.email === 'admin@capnet.io') return;
          // آمار را آپدیت کن
          setStats(s => ({ ...s, totalUsers: s.totalUsers + 1, newUsers: s.newUsers + 1 }));
          setRecentUsers(prev => [u, ...prev].slice(0, 5));
          // الارم
          setNewUserAlerts(prev => [...prev, u]);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(t);
      supabase.removeChannel(channel);
    };
  }, []);

  const dismissAlert = (idx: number) =>
    setNewUserAlerts(prev => prev.filter((_, i) => i !== idx));

  const fmt = (v: string | null | undefined) => v?.trim() || '—';
  const fmtDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—';

  return (
    <>
      {/* ── Global new-user alerts ── */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none" style={{ width: 360 }}>
        <AnimatePresence>
          {newUserAlerts.map((u, i) => (
            <div key={`alert-${u.id}-${i}`} className="pointer-events-auto">
              <NewUserAlertBanner
                user={u}
                onClose={() => dismissAlert(i)}
                onView={() => { dismissAlert(i); onNavigate('users'); }}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">داشبورد</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              آخرین بروزرسانی: {lastRefresh.toLocaleTimeString('fa-IR')}
            </p>
          </div>
          <button
            onClick={() => fetchStats()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 disabled:opacity-40"
            style={{ background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            بروزرسانی
          </button>
        </div>

        {/* Stats Grid — 5 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard
            icon={<UserCircle2 size={20} />}
            label="کاربران سایت"
            value={stats.totalUsers}
            sub={stats.newUsers > 0 ? `+${stats.newUsers} این هفته` : 'تازه ثبت‌نام'}
            color="#38bdf8"
            onClick={() => onNavigate('users')}
          />
          <StatCard
            icon={<Users size={20} />}
            label="کل لیدها"
            value={stats.totalLeads}
            sub={`+${stats.newLeads} این هفته`}
            color="#00BCD4"
            onClick={() => onNavigate('leads')}
          />
          <StatCard
            icon={<MessageSquare size={20} />}
            label="پیام‌ها"
            value={stats.totalMessages}
            sub={stats.unreadMessages > 0 ? `${stats.unreadMessages} خوانده‌نشده` : 'همه خوانده شده'}
            color="#a78bfa"
            onClick={() => onNavigate('messages')}
          />
          <StatCard
            icon={<FileText size={20} />}
            label="پست‌های بلاگ"
            value={stats.totalPosts}
            sub={`${stats.publishedPosts} منتشر شده`}
            color="#f59e0b"
            onClick={() => onNavigate('blog')}
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="فاندر / سرمایه‌گذار"
            value={`${stats.founderLeads} / ${stats.investorLeads}`}
            sub="تقسیم‌بندی لیدها"
            color="#22c55e"
          />
        </div>

        {/* Two-column: Recent Users + Recent Leads */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* ── Recent Users ── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <UserCircle2 size={16} className="text-sky-400" />
                <h3 className="text-sm font-semibold text-white">آخرین کاربران</h3>
                {stats.newUsers > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                    {stats.newUsers} جدید
                  </span>
                )}
              </div>
              <button onClick={() => onNavigate('users')}
                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors">
                مشاهده همه <ArrowUpRight size={13} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <span className="w-5 h-5 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-10">
                <UserCircle2 size={28} className="text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">هنوز کاربری ثبت‌نام نکرده</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                <AnimatePresence initial={false}>
                  {recentUsers.map((user, i) => {
                    const avatar = (user.full_name ?? user.email ?? 'U').charAt(0).toUpperCase();
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => onNavigate('users')}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8)' }}>
                          {avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{fmt(user.full_name)}</p>
                          <p className="text-xs text-slate-500 truncate">{fmt(user.email)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {user.company_name && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Building2 size={9} />{user.company_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-slate-600">
                            <Clock size={9} />{fmtDate(user.created_at)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Recent Leads ── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-teal-400" />
                <h3 className="text-sm font-semibold text-white">آخرین لیدها</h3>
              </div>
              <button onClick={() => onNavigate('leads')}
                className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors">
                مشاهده همه <ArrowUpRight size={13} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <span className="w-5 h-5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="text-center py-10">
                <Users size={28} className="text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">هنوز لیدی ثبت نشده</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentLeads.map((lead, i) => {
                  const st = STATUS_LABELS[lead.status] ?? { label: lead.status, color: '#94a3b8' };
                  return (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => onNavigate('leads')}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{lead.full_name}</p>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <Mail size={9} />{lead.email}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: `${st.color}18`, color: st.color }}>
                          {st.label}
                        </span>
                        <span className="text-[10px] text-slate-600 flex items-center gap-1">
                          <Clock size={9} />{fmtDate(lead.created_at)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { label: 'کاربران سایت',  sub: 'مشاهده ثبت‌نام‌ها',    color: '#38bdf8', page: 'users'    as AdminPage, icon: <UserCircle2 size={17} /> },
            { label: 'مدیریت لیدها',  sub: 'پیگیری درخواست‌ها',    color: '#00BCD4', page: 'leads'    as AdminPage, icon: <Users size={17} /> },
            { label: 'صندوق پیام‌ها', sub: 'پاسخ به پیام‌ها',      color: '#a78bfa', page: 'messages' as AdminPage, icon: <MessageSquare size={17} /> },
            { label: 'مدیریت بلاگ',   sub: 'نوشتن و ویرایش پست',   color: '#f59e0b', page: 'blog'     as AdminPage, icon: <FileText size={17} /> },
          ] as const).map(action => (
            <button
              key={action.page}
              onClick={() => onNavigate(action.page)}
              className="flex items-center gap-3 p-4 rounded-2xl text-right transition-all hover:opacity-80 active:scale-[0.98]"
              style={{ background: `${action.color}0a`, border: `1px solid ${action.color}25` }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${action.color}18` }}>
                <span style={{ color: action.color }}>{action.icon}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{action.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{action.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
