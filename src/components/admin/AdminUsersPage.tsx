import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, User, Phone, Building2,
  Briefcase, Mail, Trash2, X, Calendar, Users,
  Wifi, Bell, LogIn, Settings2, Download,
} from 'lucide-react';
import { fetchAllUsers, deleteUserProfile, deleteUsers } from '../../lib/usersApi';
import type { UserProfile } from '../../lib/usersApi';
import { supabase } from '../../lib/supabaseApi';

// ─── User Drawer ──────────────────────────────────────────────────────────────

function UserDrawer({
  user,
  onClose,
  onDelete,
}: {
  user: UserProfile;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const fmt = (v: string | null | undefined) => v?.trim() || '—';
  const fmtDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString('fa-IR', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : '—';

  const rows = [
    { icon: <User size={15} />,      label: 'نام کامل',        value: fmt(user.full_name) },
    { icon: <Mail size={15} />,      label: 'ایمیل',           value: fmt(user.email) },
    { icon: <Phone size={15} />,     label: 'شماره تلفن',      value: fmt(user.phone) },
    { icon: <Building2 size={15} />, label: 'نام شرکت',        value: fmt(user.company_name) },
    { icon: <Briefcase size={15} />, label: 'سمت',             value: fmt(user.position) },
    { icon: <Calendar size={15} />,  label: 'تاریخ ثبت‌نام',  value: fmtDate(user.created_at) },
    { icon: <LogIn size={15} />,     label: 'آخرین لاگین',     value: fmtDate(user.last_login_at ?? undefined) },
  ];

  const avatar = (user.full_name ?? user.email ?? 'U').charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="fixed top-0 left-0 bottom-0 w-full sm:w-[420px] z-50 flex flex-col overflow-y-auto"
      style={{ background: '#07111e', borderRight: '1px solid rgba(255,255,255,0.08)' }}
      dir="rtl"
    >
      <div
        className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
        style={{ background: '#07111e', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h3 className="font-bold text-white text-base">جزئیات کاربر</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-5 space-y-6 flex-1">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)' }}
          >
            {avatar}
          </div>
          <div>
            <p className="text-white font-bold text-base">{fmt(user.full_name)}</p>
            <p className="text-slate-400 text-sm">{fmt(user.email)}</p>
          </div>
        </div>

        {/* Info rows */}
        <section>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            اطلاعات پروفایل
          </h4>
          <div className="rounded-xl overflow-hidden divide-y divide-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            {rows.map(row => (
              <div key={row.label}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="text-slate-500 flex-shrink-0">{row.icon}</span>
                <span className="text-xs text-slate-400 w-24 flex-shrink-0">{row.label}</span>
                <span className="text-sm text-white flex-1 break-all">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={() => { if (confirm(`کاربر «${fmt(user.full_name)}» حذف شود؟`)) onDelete(user.id); }}
          className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors mt-auto"
        >
          <Trash2 size={13} />
          حذف این کاربر
        </button>
      </div>
    </motion.div>
  );
}

// ─── New-user Toast ───────────────────────────────────────────────────────────

function NewUserToast({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  const avatar = (user.full_name ?? user.email ?? 'U').charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: -24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="fixed top-5 left-1/2 z-[200] -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
      style={{
        background: 'rgba(8,20,44,0.97)',
        border: '1px solid rgba(56,189,248,0.35)',
        minWidth: 280,
        boxShadow: '0 8px 32px rgba(56,189,248,0.15)',
      }}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)' }}
        >
          {avatar}
        </div>
        {/* pulse dot */}
        <span
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2"
          style={{ borderColor: '#08142c', animation: 'pulse 1.5s infinite' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-sky-400 flex items-center gap-1">
          <Bell size={11} /> کاربر جدید ثبت‌نام کرد!
        </p>
        <p className="text-sm font-bold text-white truncate">
          {user.full_name || user.email || 'کاربر ناشناس'}
        </p>
        {user.email && (
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
        )}
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors flex-shrink-0 p-1">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── CSV Download for Users ───────────────────────────────────────────────────

type UserCsvField = 'all' | 'name' | 'email' | 'phone';

function downloadUsersCSV(users: UserProfile[], field: UserCsvField) {
  let headers: string[];
  let rows: string[][];

  if (field === 'all') {
    headers = ['نام', 'ایمیل', 'شماره تلفن', 'شرکت', 'سمت', 'تاریخ ثبت‌نام'];
    rows = users.map(u => [
      u.full_name ?? '',
      u.email ?? '',
      u.phone ?? '',
      u.company_name ?? '',
      u.position ?? '',
      u.created_at ? new Date(u.created_at).toLocaleDateString('fa-IR') : '',
    ]);
  } else if (field === 'name') {
    headers = ['نام'];
    rows = users.map(u => [u.full_name ?? '']);
  } else if (field === 'email') {
    headers = ['ایمیل'];
    rows = users.map(u => [u.email ?? '']);
  } else {
    headers = ['شماره تلفن'];
    rows = users.map(u => [u.phone ?? '']);
  }

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csvContent = '\uFEFF' + [headers, ...rows].map(r => r.map(escape).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users-${field}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Manage Panel for Users ───────────────────────────────────────────────────

function UsersManagePanel({
  users,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  onDeleteAll,
  onClose,
}: {
  users: UserProfile[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onDeleteAll: () => void;
  onClose: () => void;
}) {
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmSelected, setConfirmSelected] = useState(false);
  const fmt = (v: string | null | undefined) => v?.trim() || '—';

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.18)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 size={15} className="text-red-400" />
          <h3 className="text-sm font-bold text-white">مدیریت و حذف کاربران</h3>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white p-1 transition-colors"><X size={15} /></button>
      </div>
      <p className="text-xs text-slate-500">
        ⚠ تمام حذف‌ها <strong className="text-red-400">غیرقابل بازگشت</strong> هستند و از دیتابیس دائمی پاک می‌شوند.
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onSelectAll}
          className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
          انتخاب همه ({users.length})
        </button>
        {selectedIds.size > 0 && (
          <button onClick={onClearSelection}
            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            لغو انتخاب
          </button>
        )}
        {selectedIds.size > 0 && <span className="text-xs text-teal-400 font-semibold">{selectedIds.size} مورد انتخاب شده</span>}
      </div>
      {users.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          {users.map(u => (
            <label key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5">
              <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => onToggle(u.id)}
                className="w-3.5 h-3.5 accent-red-500 cursor-pointer flex-shrink-0" />
              <span className="text-sm text-white truncate flex-1">{fmt(u.full_name)}</span>
              <span className="text-xs text-slate-500 flex-shrink-0">{fmt(u.email)}</span>
            </label>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3 pt-1 border-t border-white/8">
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            {confirmSelected ? (
              <>
                <button onClick={() => { onDeleteSelected(); setConfirmSelected(false); }}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-bold transition-all hover:opacity-90"
                  style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                  <Trash2 size={13} /> تأیید — حذف {selectedIds.size} کاربر
                </button>
                <button onClick={() => setConfirmSelected(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">انصراف</button>
              </>
            ) : (
              <button onClick={() => setConfirmSelected(true)}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl transition-all hover:opacity-90"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                <Trash2 size={13} /> حذف {selectedIds.size} کاربر انتخاب‌شده
              </button>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          {confirmAll ? (
            <>
              <button onClick={() => { onDeleteAll(); setConfirmAll(false); }}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-bold transition-all hover:opacity-90"
                style={{ background: 'rgba(239,68,68,0.25)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.5)' }}>
                <Trash2 size={13} /> تأیید — حذف همه {users.length} کاربر
              </button>
              <button onClick={() => setConfirmAll(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">انصراف</button>
            </>
          ) : (
            <button onClick={() => setConfirmAll(true)}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl transition-all hover:opacity-90"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Trash2 size={13} /> حذف همه کاربران
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [toasts, setToasts] = useState<UserProfile[]>([]);
  const [newBadge, setNewBadge] = useState(0);
  const [showDownload, setShowDownload] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllUsers({ search: search || undefined });
    setUsers(data);
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  // ── Realtime: کاربر جدید + آخرین لاگین ──────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('admin-users-realtime')
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'users' },
        (payload: any) => {
          const newUser = payload.new as UserProfile;

          // اولین بارگذاری را نادیده بگیر
          if (isFirstLoad.current) return;

          // کاربر ادمین را نادیده بگیر
          if (newUser.email === 'admin@capnet.io') return;

          // لیست را آپدیت کن
          setUsers(prev => {
            if (prev.find(u => u.id === newUser.id)) return prev;
            return [newUser, ...prev];
          });

          // toast نمایش بده
          setToasts(prev => [...prev, newUser]);
          setNewBadge(n => n + 1);
        }
      )
      .on(
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'users' },
        (payload: any) => {
          const updated = payload.new as UserProfile;
          // آپدیت ردیف مربوطه در لیست (بدون toast — فقط آپدیت خاموش)
          setUsers(prev =>
            prev.map(u => u.id === updated.id ? { ...u, ...updated } : u)
          );
          // اگر drawer این کاربر باز بود، آن را هم آپدیت کن
          setSelected(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev);
        }
      )
      .subscribe();

    // بعد از mount کوتاه صبر کن تا INSERT های اولیه فیلتر شوند
    const t = setTimeout(() => { isFirstLoad.current = false; }, 2000);

    return () => {
      clearTimeout(t);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string) => {
    await deleteUserProfile(id);
    setUsers(prev => prev.filter(u => u.id !== id));
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    setSelected(null);
  };

  const handleDeleteSelected = async () => {
    const ids = [...selectedIds];
    await deleteUsers(ids);
    setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
    setSelectedIds(new Set());
  };

  const handleDeleteAll = async () => {
    await deleteUsers(users.map(u => u.id));
    setUsers([]);
    setSelectedIds(new Set());
    setShowManage(false);
  };

  const toggleId = (id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const dismissToast = (idx: number) => {
    setToasts(prev => prev.filter((_, i) => i !== idx));
  };

  const fmtDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString('fa-IR', {
          month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : '—';

  const fmt = (v: string | null | undefined) => v?.trim() || '—';
  const withPhone   = users.filter(u => u.phone?.trim()).length;
  const withCompany = users.filter(u => u.company_name?.trim()).length;

  return (
    <>
      {/* ── Toasts ── */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none" style={{ width: 320 }}>
        <AnimatePresence>
          {toasts.map((u, i) => (
            <div key={`${u.id}-${i}`} className="pointer-events-auto">
              <NewUserToast user={u} onClose={() => dismissToast(i)} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      <div className="space-y-5" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">مدیریت کاربران</h1>
              <span className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Wifi size={10} />آنلاین
              </span>
              {newBadge > 0 && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setNewBadge(0)}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <Bell size={10} />{newBadge} جدید
                </motion.button>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{users.length} کاربر ثبت‌نام کرده</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* دانلود */}
            <div className="relative">
              <button onClick={() => { setShowDownload(v => !v); setShowManage(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Download size={14} />دانلود
                <span className={`transition-transform text-xs ${showDownload ? 'rotate-180' : ''}`}>▾</span>
              </button>
              <AnimatePresence>
                {showDownload && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute left-0 top-full mt-2 z-30 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: '#0d1f35', border: '1px solid rgba(255,255,255,0.1)', minWidth: 180 }}>
                    {([
                      { field: 'all'   as UserCsvField, label: 'دانلود همه اطلاعات' },
                      { field: 'name'  as UserCsvField, label: 'فقط نام‌ها' },
                      { field: 'email' as UserCsvField, label: 'فقط ایمیل‌ها' },
                      { field: 'phone' as UserCsvField, label: 'فقط شماره‌ها' },
                    ]).map(opt => (
                      <button key={opt.field} onClick={() => { downloadUsersCSV(users, opt.field); setShowDownload(false); }}
                        className="w-full text-right px-4 py-2.5 text-sm text-white hover:bg-white/8 transition-colors flex items-center gap-2">
                        <Download size={13} className="text-green-400 flex-shrink-0" />{opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* مدیریت */}
            <button onClick={() => { setShowManage(v => !v); setShowDownload(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
              style={showManage
                ? { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
                : { background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)' }}>
              <Settings2 size={14} />مدیریت
            </button>
            <button onClick={() => { load(); setNewBadge(0); }} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
              style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />بروزرسانی
            </button>
          </div>
        </div>

        {/* پنل مدیریت */}
        <AnimatePresence>
          {showManage && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}>
              <UsersManagePanel
                users={users}
                selectedIds={selectedIds}
                onToggle={toggleId}
                onSelectAll={() => setSelectedIds(new Set(users.map(u => u.id)))}
                onClearSelection={() => setSelectedIds(new Set())}
                onDeleteSelected={handleDeleteSelected}
                onDeleteAll={handleDeleteAll}
                onClose={() => setShowManage(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'کل کاربران',   value: users.length, color: '#38bdf8' },
            { label: 'با شماره تلفن', value: withPhone,    color: '#a78bfa' },
            { label: 'با نام شرکت',   value: withCompany,  color: '#34d399' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="جستجو نام، ایمیل، شرکت، تلفن..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(56,189,248,0.4)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-6 h-6 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <Users size={36} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">هنوز کاربری ثبت‌نام نکرده</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">نام / ایمیل</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 hidden sm:table-cell">شماره تلفن</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 hidden md:table-cell">شرکت</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 hidden lg:table-cell">سمت</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 hidden lg:table-cell">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {users.map((user, i) => {
                      const avatar = (user.full_name ?? user.email ?? 'U').charAt(0).toUpperCase();
                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i < 10 ? i * 0.03 : 0 }}
                          className="cursor-pointer transition-colors"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.04)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          onClick={() => setSelected(user)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)' }}>
                                {avatar}
                              </div>
                              <div>
                                <p className="font-medium text-white">{fmt(user.full_name)}</p>
                                <p className="text-xs text-slate-500">{fmt(user.email)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            {user.phone?.trim()
                              ? <span className="flex items-center gap-1.5 text-xs text-slate-300"><Phone size={12} className="text-slate-500" />{user.phone}</span>
                              : <span className="text-xs text-slate-600">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {user.company_name?.trim()
                              ? <span className="flex items-center gap-1.5 text-xs text-slate-300"><Building2 size={12} className="text-slate-500" />{user.company_name}</span>
                              : <span className="text-xs text-slate-600">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {user.position?.trim()
                              ? <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                                  style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8' }}>
                                  <Briefcase size={11} />{user.position}
                                </span>
                              : <span className="text-xs text-slate-600">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar size={11} />{fmtDate(user.created_at)}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Drawer */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
              <UserDrawer key={selected.id} user={selected} onClose={() => setSelected(null)} onDelete={handleDelete} />
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
