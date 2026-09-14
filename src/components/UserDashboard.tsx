import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Building2, Briefcase,
  FileText, MessageSquare, Bell, LogOut,
  X, CheckCircle2, Clock, AlertCircle, XCircle,
  ChevronLeft, RefreshCw,
} from 'lucide-react';
import type { AuthUser } from './AuthModal';
import { userLogout } from '../utils/userStore';
import { fetchUserLeads } from '../lib/leadsApi';
import type { Lead, LeadStatus } from '../lib/leadsApi';
import { fetchUserMessages } from '../lib/messagesApi';
import type { ContactMessage } from '../lib/messagesApi';
import { supabase } from '../lib/supabaseApi';

import { t } from '@/i18n';


// ─── Types ────────────────────────────────────────────────────────────────────

type DashTab = 'overview' | 'leads' | 'messages' | 'profile';

const STATUS_CFG: Record<LeadStatus, { label: string; color: string; icon: React.ReactNode }> = {
  new:       { label: 'جدید',       color: '#00BCD4', icon: <AlertCircle size={12} /> },
  in_review: { label: 'در بررسی',   color: '#f59e0b', icon: <Clock size={12} /> },
  approved:  { label: 'تأیید شده',  color: '#22c55e', icon: <CheckCircle2 size={12} /> },
  rejected:  { label: 'رد شده',    color: '#ef4444', icon: <XCircle size={12} /> },
};

const MSG_STATUS_CFG: Record<string, { label: string; color: string }> = {
  unread:   { label: 'خوانده نشده', color: '#f59e0b' },
  read:     { label: 'خوانده شده',  color: '#94a3b8' },
  replied:  { label: 'پاسخ داده شد', color: '#22c55e' },
  archived: { label: 'آرشیو',       color: '#475569' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
    >
      {cfg.icon}{cfg.label}
    </span>
  );
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const ch = (name || 'U').charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-2xl font-black text-white flex-shrink-0"
      style={{
        width: size, height: size,
        fontSize: size * 0.38,
        background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
      }}
    >
      {ch}
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({
  leads, messages, user, onNavigate,
}: {
  leads: Lead[];
  messages: ContactMessage[];
  user: AuthUser;
  onNavigate: (tab: DashTab) => void;
}) {
  const newLeads      = leads.filter(l => l.status === 'new').length;
  const approvedLeads = leads.filter(l => l.status === 'approved').length;
  const repliedMsgs   = messages.filter(m => m.status === 'replied').length;

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(0,188,212,0.12) 0%, rgba(129,140,248,0.08) 100%)', border: '1px solid rgba(0,188,212,0.2)' }}
      >
        <Avatar name={user.name ?? user.email} size={52} />
        <div>
          <p className="text-white font-bold text-base">{user.name ?? t("کاربر عزیز")}</p>
          <p className="text-slate-400 text-sm">{user.email}</p>
          <p className="text-teal-400 text-xs mt-1">{t("به پنل شخصی خود خوش آمدید")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: t("درخواست‌های ارسالی"), value: leads.length, color: '#00BCD4', onClick: () => onNavigate('leads') },
          { label: t("تأیید شده"),          value: approvedLeads, color: '#22c55e', onClick: () => onNavigate('leads') },
          { label: t("پیام‌های شما"),       value: messages.length, color: '#a78bfa', onClick: () => onNavigate('messages') },
        ].map(s => (
          <button
            key={s.label}
            onClick={s.onClick}
            className="rounded-xl p-4 text-right transition-all hover:opacity-80 active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.color}20` }}
          >
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Notifications */}
      {(newLeads > 0 || repliedMsgs > 0) && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("اعلان‌ها")}</p>
          {newLeads > 0 && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(0,188,212,0.08)', border: '1px solid rgba(0,188,212,0.2)' }}
            >
              <Bell size={14} className="text-teal-400 flex-shrink-0" />
              <p className="text-sm text-teal-200">{newLeads} {t("درخواست ارزیابی شما در انتظار بررسی است")}</p>
            </div>
          )}
          {repliedMsgs > 0 && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <MessageSquare size={14} className="text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-200">{repliedMsgs} {t("پیام شما پاسخ داده شده است")}</p>
            </div>
          )}
        </div>
      )}

      {/* Recent leads */}
      {leads.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("آخرین درخواست‌ها")}</p>
            <button onClick={() => onNavigate('leads')} className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">
              {t("همه")} <ChevronLeft size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {leads.slice(0, 3).map(lead => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div>
                  <p className="text-sm text-white font-medium">{lead.company_name ?? lead.org_name ?? t("درخواست ارزیابی")}</p>
                  <p className="text-xs text-slate-500">{new Date(lead.created_at).toLocaleDateString('fa-IR')}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Leads tab ─────────────────────────────────────────────────────────────────
function LeadsTab({ leads, loading }: { leads: Lead[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText size={36} className="text-slate-700 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">{t("هنوز درخواست ارزیابی ارسال نکرده‌اید")}</p>
        <a
          href="/evaluation"
          className="mt-3 inline-block text-teal-400 text-sm hover:underline"
        >
          {t("ارسال درخواست ارزیابی")}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{leads.length} {t("درخواست ثبت‌شده")}</p>
      {leads.map(lead => (
        <div
          key={lead.id}
          className="rounded-xl p-4 space-y-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-white">
                {lead.company_name ?? lead.org_name ?? t("درخواست ارزیابی")}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {lead.profile_type === 'founder' ? t("🚀 فاندر") : t("💼 سرمایه‌گذار")}
                {' · '}
                {lead.stage ?? lead.stage_pref ?? '—'}
              </p>
            </div>
            <StatusBadge status={lead.status} />
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>{t("پیشرفت بررسی")}</span>
              <span>{lead.status === 'new' ? '25%' : lead.status === 'in_review' ? '60%' : lead.status === 'approved' ? '100%' : '0%'}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: lead.status === 'new' ? '25%' : lead.status === 'in_review' ? '60%' : lead.status === 'approved' ? '100%' : '5%',
                  background: STATUS_CFG[lead.status].color,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{new Date(lead.created_at).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <div className="flex items-center gap-3">
              {lead.deck_url && (
                <a href={lead.deck_url} target="_blank" rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 transition-colors">
                  {t("دانلود Pitch Deck")}
                </a>
              )}
              {lead.admin_notes && (
                <span className="text-teal-400">{t("یادداشت ادمین موجود است")}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Messages tab ──────────────────────────────────────────────────────────────
function MessagesTab({ messages, loading }: { messages: ContactMessage[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageSquare size={36} className="text-slate-700 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">{t("هنوز پیامی ارسال نکرده‌اید")}</p>
        <a
          href="/contact"
          className="mt-3 inline-block text-teal-400 text-sm hover:underline"
        >
          {t("ارسال پیام به تیم")}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{messages.length} {t("پیام ارسال‌شده")}</p>
      {messages.map(msg => {
        const statusCfg = MSG_STATUS_CFG[msg.status] ?? MSG_STATUS_CFG['read'];
        return (
          <div
            key={msg.id}
            className="rounded-xl p-4 space-y-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-white line-clamp-1">
                {msg.subject ?? t("پیام تماس")}
              </p>
              <span
                className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: `${statusCfg.color}18`, color: statusCfg.color }}
              >
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{msg.message}</p>
            {msg.admin_reply && (
              <div
                className="p-3 rounded-lg text-xs text-green-200"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}
              >
                <p className="font-semibold text-green-400 mb-1">{t("پاسخ تیم CapNet:")}</p>
                {msg.admin_reply}
              </div>
            )}
            <p className="text-xs text-slate-600">
              {new Date(msg.created_at).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const rows = [
    { icon: <User size={15} />,      label: t("نام"),           value: user.name ?? '—' },
    { icon: <Mail size={15} />,      label: t("ایمیل"),         value: user.email },
    { icon: <Phone size={15} />,     label: t("تلفن"),           value: '—' },
    { icon: <Building2 size={15} />, label: t("شرکت"),          value: '—' },
    { icon: <Briefcase size={15} />, label: t("سمت"),            value: '—' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Avatar name={user.name ?? user.email} size={56} />
        <div>
          <p className="text-white font-bold">{user.name ?? t("کاربر")}</p>
          <p className="text-slate-400 text-sm">{user.email}</p>
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden divide-y divide-white/5"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {rows.map(row => (
          <div key={row.label} className="flex items-center gap-3 px-4 py-3">
            <span className="text-slate-500 flex-shrink-0">{row.icon}</span>
            <span className="text-xs text-slate-400 w-20 flex-shrink-0">{row.label}</span>
            <span className="text-sm text-white flex-1 truncate">{row.value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <LogOut size={15} />
        {t("خروج از حساب کاربری")}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface UserDashboardProps {
  user: AuthUser;
  onClose: () => void;
  onLogout: () => void;
}

export default function UserDashboard({ user, onClose, onLogout }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashTab>('overview');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [l, m] = await Promise.all([
      fetchUserLeads(user.email),
      fetchUserMessages(user.email),
    ]);
    setLeads(l);
    setMessages(m);
    setLoading(false);
  }, [user.email]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time: دریافت اعلان تغییر وضعیت لیدها
  useEffect(() => {
    const channel = supabase
      .channel(`user-leads-${user.email}`)
      .on(
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'assessments', filter: `email=eq.${user.email}` },
        (payload: any) => {
          setLeads(prev => prev.map(l => l.id === payload.new.id ? { ...l, ...payload.new } : l));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user.email]);

  const handleLogout = async () => {
    await userLogout();
    onLogout();
    onClose();
  };

  const tabs: Array<{ id: DashTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'overview',  label: t("خلاصه"),        icon: <User size={15} /> },
    { id: 'leads',     label: t("درخواست‌ها"),   icon: <FileText size={15} />, badge: leads.length },
    { id: 'messages',  label: t("پیام‌ها"),      icon: <MessageSquare size={15} />, badge: messages.filter(m => m.status === 'replied').length },
    { id: 'profile',   label: t("پروفایل"),      icon: <User size={15} /> },
  ];

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-start justify-end p-4 pt-16"
        style={{ background: 'rgba(3,7,18,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(7,17,30,0.98)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(24px)',
            maxHeight: 'calc(100vh - 80px)',
          }}
          dir="rtl"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div>
              <h2 className="text-base font-bold text-white">{t("پنل کاربری")}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="flex px-2 pt-2 pb-0 gap-1 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium transition-all relative flex-1 justify-center"
                style={
                  activeTab === tab.id
                    ? { color: '#00BCD4', borderBottom: '2px solid #00BCD4', marginBottom: '-1px' }
                    : { color: 'rgba(255,255,255,0.4)' }
                }
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className="absolute -top-1 -left-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                    style={{ background: '#00BCD4', color: '#000' }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'overview' && (
                  <OverviewTab leads={leads} messages={messages} user={user} onNavigate={setActiveTab} />
                )}
                {activeTab === 'leads' && (
                  <LeadsTab leads={leads} loading={loading} />
                )}
                {activeTab === 'messages' && (
                  <MessagesTab messages={messages} loading={loading} />
                )}
                {activeTab === 'profile' && (
                  <ProfileTab user={user} onLogout={handleLogout} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
