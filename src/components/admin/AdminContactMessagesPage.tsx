import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, RefreshCw, ChevronDown,
  Mail, CheckCircle2, Clock, Archive, MessageSquare,
  StickyNote, Trash2, Download, Eye, Settings2, X,
  Bell, Wifi, Send, CornerUpLeft,
} from 'lucide-react';
import {
  fetchMessages, updateMessageStatus, saveAdminReply,
  deleteMessage, deleteMessages,
} from '../../lib/messagesApi';
import type { ContactMessage, MessageStatus } from '../../lib/messagesApi';
import { supabase } from '../../lib/supabaseApi';

// ── وضعیت‌ها ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<MessageStatus, { label: string; color: string; icon: React.ReactNode }> = {
  unread:   { label: 'خوانده‌نشده', color: '#00BCD4', icon: <Bell size={12} /> },
  read:     { label: 'خوانده‌شده',  color: '#22c55e', icon: <CheckCircle2 size={12} /> },
  replied:  { label: 'پاسخ داده‌شده', color: '#a78bfa', icon: <CornerUpLeft size={12} /> },
  archived: { label: 'آرشیو',        color: '#f59e0b', icon: <Archive size={12} /> },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function NewMessageToast({ msg, onClose }: { msg: ContactMessage; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 6000); return () => clearTimeout(t); }, [onClose]);
  const avatar = (msg.full_name ?? msg.email ?? 'M').charAt(0).toUpperCase();
  return (
    <motion.div
      initial={{ opacity: 0, y: -24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
      style={{ background: 'rgba(8,20,44,0.97)', border: '1px solid rgba(0,188,212,0.35)', minWidth: 280, boxShadow: '0 8px 32px rgba(0,188,212,0.15)' }}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#00BCD4,#7c5cd8)' }}>
          {avatar}
        </div>
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
          style={{ background: '#00BCD4', borderColor: '#08142c', animation: 'pulse 1.5s infinite' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#00BCD4' }}>
          <Bell size={11} /> پیام جدید از سایت!
        </p>
        <p className="text-sm font-bold text-white truncate">{msg.full_name || 'ناشناس'}</p>
        <p className="text-xs truncate text-slate-400">{msg.subject || msg.email}</p>
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors flex-shrink-0 p-1">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: MessageStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
      style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

// ── CSV Download ───────────────────────────────────────────────────────────────
type CsvField = 'all' | 'name' | 'email';

function downloadCSV(msgs: ContactMessage[], field: CsvField) {
  let headers: string[];
  let rows: string[][];

  if (field === 'all') {
    headers = ['نام', 'ایمیل', 'موضوع', 'پیام', 'وضعیت', 'تاریخ', 'پاسخ ادمین'];
    rows = msgs.map(m => [
      m.full_name,
      m.email ?? '',
      m.subject ?? '',
      m.message,
      STATUS_CONFIG[m.status].label,
      new Date(m.created_at).toLocaleDateString('fa-IR'),
      m.admin_reply ?? '',
    ]);
  } else if (field === 'name') {
    headers = ['نام'];
    rows = msgs.map(m => [m.full_name]);
  } else {
    headers = ['ایمیل'];
    rows = msgs.map(m => [m.email ?? '']);
  }

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contact-messages-${field}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Manage Panel ───────────────────────────────────────────────────────────────
function ManagePanel({
  msgs, selectedIds, onToggle, onSelectAll, onClearSelection,
  onDeleteSelected, onDeleteAll, onClose,
}: {
  msgs: ContactMessage[]; selectedIds: Set<string>;
  onToggle: (id: string) => void; onSelectAll: () => void;
  onClearSelection: () => void; onDeleteSelected: () => void;
  onDeleteAll: () => void; onClose: () => void;
}) {
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmSel, setConfirmSel] = useState(false);

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.18)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 size={15} className="text-red-400" />
          <h3 className="text-sm font-bold text-white">مدیریت و حذف پیام‌ها</h3>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white p-1 transition-colors"><X size={15} /></button>
      </div>
      <p className="text-xs text-slate-500">⚠ تمام حذف‌ها <strong className="text-red-400">غیرقابل بازگشت</strong> هستند.</p>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onSelectAll}
          className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
          انتخاب همه ({msgs.length})
        </button>
        {selectedIds.size > 0 && (
          <button onClick={onClearSelection}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            لغو انتخاب
          </button>
        )}
        {selectedIds.size > 0 && (
          <span className="text-xs text-teal-400 font-semibold">{selectedIds.size} مورد انتخاب</span>
        )}
      </div>
      {msgs.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          {msgs.map(m => (
            <label key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5">
              <input type="checkbox" checked={selectedIds.has(m.id)} onChange={() => onToggle(m.id)}
                className="w-3.5 h-3.5 accent-red-500 cursor-pointer flex-shrink-0" />
              <span className="text-sm text-white truncate flex-1">{m.full_name}</span>
              <span className="text-xs text-slate-500 flex-shrink-0 hidden sm:inline">{m.email}</span>
              <StatusBadge status={m.status} />
            </label>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {selectedIds.size > 0 && (
          confirmSel ? (
            <div className="flex items-center gap-2">
              <button onClick={() => { onDeleteSelected(); setConfirmSel(false); }}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-bold"
                style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                <Trash2 size={13} /> تأیید — حذف {selectedIds.size}
              </button>
              <button onClick={() => setConfirmSel(false)} className="text-xs text-slate-500 hover:text-slate-300">انصراف</button>
            </div>
          ) : (
            <button onClick={() => setConfirmSel(true)}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
              <Trash2 size={13} /> حذف {selectedIds.size} انتخاب‌شده
            </button>
          )
        )}
        {confirmAll ? (
          <div className="flex items-center gap-2">
            <button onClick={() => { onDeleteAll(); setConfirmAll(false); }}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-bold"
              style={{ background: 'rgba(239,68,68,0.25)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.5)' }}>
              <Trash2 size={13} /> تأیید — حذف همه {msgs.length}
            </button>
            <button onClick={() => setConfirmAll(false)} className="text-xs text-slate-500 hover:text-slate-300">انصراف</button>
          </div>
        ) : (
          <button onClick={() => setConfirmAll(true)}
            className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={13} /> حذف همه پیام‌ها
          </button>
        )}
      </div>
    </div>
  );
}

// ── Message Drawer ─────────────────────────────────────────────────────────────
function MessageDrawer({ msg, onClose, onStatusChange, onReplySave, onDelete }: {
  msg: ContactMessage;
  onClose: () => void;
  onStatusChange: (id: string, s: MessageStatus) => void;
  onReplySave: (id: string, reply: string) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [reply, setReply] = useState(msg.admin_reply ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fmt = (v: string | null | undefined) => v || '—';
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleSaveReply = async () => {
    setSaving(true);
    await onReplySave(msg.id, reply);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="fixed top-0 left-0 bottom-0 w-full sm:w-[500px] z-50 flex flex-col overflow-y-auto"
      style={{ background: '#07111e', borderRight: '1px solid rgba(255,255,255,0.08)' }}
      dir="rtl"
    >
      {/* سربرگ */}
      <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
        style={{ background: '#07111e', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#00BCD4,#7c5cd8)' }}>
            {(msg.full_name ?? 'M').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm truncate">{msg.full_name}</h3>
            <p className="text-xs text-slate-500 truncate">{msg.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 flex-shrink-0"><X size={16} /></button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* وضعیت و تاریخ */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={msg.status} />
          <span className="text-xs text-slate-500">{fmtDate(msg.created_at)}</span>
        </div>

        {/* اطلاعات تماس */}
        <section>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">اطلاعات فرستنده</h4>
          <div className="space-y-2 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { label: 'نام', value: fmt(msg.full_name) },
              { label: 'ایمیل', value: fmt(msg.email) },
              { label: 'موضوع', value: fmt(msg.subject) },
            ].map(row => (
              <div key={row.label} className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[60px] flex-shrink-0">{row.label}:</span>
                <span className="text-white break-all">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* متن پیام */}
        <section>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">متن پیام</h4>
          <div className="p-4 rounded-xl text-sm text-slate-200 leading-relaxed"
            style={{ background: 'rgba(0,188,212,0.04)', border: '1px solid rgba(0,188,212,0.1)', whiteSpace: 'pre-wrap' }}>
            {msg.message}
          </div>
        </section>

        {/* پاسخ قبلی (اگر وجود داشت) */}
        {msg.admin_reply && msg.status === 'replied' && (
          <section>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">پاسخ قبلی ادمین</h4>
            <div className="p-3 rounded-xl text-sm text-slate-300 leading-relaxed"
              style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', whiteSpace: 'pre-wrap' }}>
              {msg.admin_reply}
            </div>
            {msg.replied_at && (
              <p className="text-xs text-slate-600 mt-1.5">{fmtDate(msg.replied_at)}</p>
            )}
          </section>
        )}

        {/* تغییر وضعیت */}
        <section>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">تغییر وضعیت</h4>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_CONFIG) as MessageStatus[]).map(s => (
              <button key={s} onClick={() => onStatusChange(msg.id, s)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-80"
                style={msg.status === s
                  ? { background: `${STATUS_CONFIG[s].color}20`, color: STATUS_CONFIG[s].color, border: `1px solid ${STATUS_CONFIG[s].color}50` }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </section>

        {/* پاسخ به پیام */}
        <section>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">یادداشت / پاسخ داخلی</h4>
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={5}
            placeholder="پاسخ یا یادداشت داخلی..."
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(0,188,212,0.4)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          <button onClick={handleSaveReply} disabled={saving || !reply.trim()}
            className="mt-2 flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-40"
            style={saved
              ? { background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }
              : { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
            {saving
              ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : <Send size={12} />}
            {saving ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : 'ذخیره پاسخ'}
          </button>
        </section>

        {/* حذف */}
        <button
          onClick={() => { if (confirm('این پیام حذف شود؟ این عمل قابل بازگشت نیست.')) onDelete(msg.id); }}
          className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors">
          <Trash2 size={13} />
          حذف این پیام (غیرقابل بازگشت)
        </button>
      </div>
    </motion.div>
  );
}

// ── صفحه اصلی ─────────────────────────────────────────────────────────────────
export default function AdminContactMessagesPage() {
  const [msgs, setMsgs] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<MessageStatus | 'all'>('all');
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ContactMessage[]>([]);
  const [newBadge, setNewBadge] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    const data = await fetchMessages({
      status: filterStatus === 'all' ? undefined : filterStatus,
      search: q || undefined,
    });
    setMsgs(data);
    setLoading(false);
    isFirstLoad.current = false;
  }, [filterStatus]);

  useEffect(() => { load(search); }, [filterStatus]); // eslint-disable-line
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(search), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]); // eslint-disable-line

  // ── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('admin-contact-messages-rt')
      .on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'contact_messages' },
        (payload: any) => {
          const newMsg = payload.new as ContactMessage;
          if (isFirstLoad.current) return;
          const statusMatch = filterStatus === 'all' || newMsg.status === filterStatus;
          if (statusMatch) {
            setMsgs(prev => prev.find(m => m.id === newMsg.id) ? prev : [newMsg, ...prev]);
          }
          setToasts(prev => [...prev, newMsg]);
          setNewBadge(n => n + 1);
        }
      )
      .on('postgres_changes' as any, { event: 'UPDATE', schema: 'public', table: 'contact_messages' },
        (payload: any) => {
          const updated = payload.new as ContactMessage;
          setMsgs(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m));
          setSelectedMsg(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev);
        }
      )
      .subscribe();
    const t = setTimeout(() => { isFirstLoad.current = false; }, 2000);
    return () => { clearTimeout(t); supabase.removeChannel(channel); };
  }, []); // eslint-disable-line

  const handleStatusChange = async (id: string, status: MessageStatus) => {
    await updateMessageStatus(id, status);
    setMsgs(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    if (selectedMsg?.id === id) setSelectedMsg(prev => prev ? { ...prev, status } : null);
  };

  const handleReplySave = async (id: string, admin_reply: string) => {
    await saveAdminReply(id, admin_reply);
    setMsgs(prev => prev.map(m => m.id === id ? { ...m, admin_reply, status: 'replied', replied_at: new Date().toISOString() } : m));
    if (selectedMsg?.id === id) setSelectedMsg(prev => prev ? { ...prev, admin_reply, status: 'replied' } : null);
  };

  const handleDelete = async (id: string) => {
    await deleteMessage(id);
    setMsgs(prev => prev.filter(m => m.id !== id));
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    setSelectedMsg(null);
  };

  const handleDeleteSelected = async () => {
    const ids = [...selectedIds];
    await deleteMessages(ids);
    setMsgs(prev => prev.filter(m => !selectedIds.has(m.id)));
    setSelectedIds(new Set());
  };

  const handleDeleteAll = async () => {
    const ids = msgs.map(m => m.id);
    await deleteMessages(ids);
    setMsgs([]); setSelectedIds(new Set()); setShowManage(false);
  };

  const toggleId = (id: string) => setSelectedIds(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const stats = {
    total:    msgs.length,
    unread:   msgs.filter(m => m.status === 'unread').length,
    replied:  msgs.filter(m => m.status === 'replied').length,
    archived: msgs.filter(m => m.status === 'archived').length,
  };

  return (
    <>
      {/* ── Toasts ── */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none" style={{ width: 320 }}>
        <AnimatePresence>
          {toasts.map((m, i) => (
            <div key={`${m.id}-${i}`} className="pointer-events-auto">
              <NewMessageToast msg={m} onClose={() => setToasts(prev => prev.filter((_, j) => j !== i))} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      <div className="space-y-5" dir="rtl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">پیام‌های فرم تماس</h1>
              <span className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Wifi size={10} /> آنلاین
              </span>
              {newBadge > 0 && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setNewBadge(0)}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(0,188,212,0.15)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.3)' }}>
                  <Bell size={10} />{newBadge} جدید
                </motion.button>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{msgs.length} پیام در دیتابیس</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* دانلود */}
            <div className="relative">
              <button onClick={() => { setShowDownload(v => !v); setShowManage(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Download size={14} /> دانلود
                <ChevronDown size={13} className={`transition-transform ${showDownload ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showDownload && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    className="absolute left-0 top-full mt-2 z-30 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: '#0d1f35', border: '1px solid rgba(255,255,255,0.1)', minWidth: 200 }}
                  >
                    {([
                      { field: 'all'   as CsvField, label: 'دانلود همه اطلاعات (CSV)' },
                      { field: 'name'  as CsvField, label: 'فقط نام‌ها' },
                      { field: 'email' as CsvField, label: 'فقط ایمیل‌ها' },
                    ]).map(opt => (
                      <button key={opt.field}
                        onClick={() => { downloadCSV(msgs, opt.field); setShowDownload(false); }}
                        className="w-full text-right px-4 py-2.5 text-sm text-white hover:bg-white/8 transition-colors flex items-center gap-2">
                        <Download size={13} className="text-green-400 flex-shrink-0" />
                        {opt.label}
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
              <Settings2 size={14} /> مدیریت
            </button>

            {/* بروزرسانی */}
            <button onClick={() => load(search)} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
              style={{ background: 'rgba(0,188,212,0.1)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> بروزرسانی
            </button>
          </div>
        </div>

        {/* ── Manage Panel ── */}
        <AnimatePresence>
          {showManage && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}>
              <ManagePanel msgs={msgs} selectedIds={selectedIds}
                onToggle={toggleId}
                onSelectAll={() => setSelectedIds(new Set(msgs.map(m => m.id)))}
                onClearSelection={() => setSelectedIds(new Set())}
                onDeleteSelected={handleDeleteSelected}
                onDeleteAll={handleDeleteAll}
                onClose={() => setShowManage(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'کل پیام‌ها', value: stats.total, color: '#00BCD4' },
            { label: 'خوانده‌نشده', value: stats.unread, color: '#f59e0b' },
            { label: 'پاسخ داده‌شده', value: stats.replied, color: '#a78bfa' },
            { label: 'آرشیو', value: stats.archived, color: '#22c55e' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search + Filter ── */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="جستجو نام، ایمیل، موضوع..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <button onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ background: showFilters ? 'rgba(0,188,212,0.12)' : 'rgba(255,255,255,0.05)', color: showFilters ? '#00BCD4' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Filter size={14} /> فیلتر
            <ChevronDown size={13} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 overflow-hidden">
              {(['all', 'unread', 'read', 'replied', 'archived'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={filterStatus === s
                    ? { background: 'rgba(0,188,212,0.15)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.3)' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {s === 'all' ? 'همه وضعیت‌ها' : STATUS_CONFIG[s as MessageStatus]?.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Table ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
            </div>
          ) : msgs.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare size={36} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">پیامی یافت نشد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox"
                        checked={selectedIds.size === msgs.length && msgs.length > 0}
                        onChange={() => selectedIds.size === msgs.length
                          ? setSelectedIds(new Set())
                          : setSelectedIds(new Set(msgs.map(m => m.id)))}
                        className="w-3.5 h-3.5 accent-red-500 cursor-pointer" />
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">نام / ایمیل</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 hidden sm:table-cell">موضوع</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 hidden md:table-cell">پیام</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 hidden lg:table-cell">تاریخ</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">وضعیت</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {msgs.map((msg, i) => (
                    <motion.tr key={msg.id}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}
                      className="transition-colors"
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: selectedIds.has(msg.id) ? 'rgba(239,68,68,0.05)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!selectedIds.has(msg.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = selectedIds.has(msg.id) ? 'rgba(239,68,68,0.05)' : 'transparent'; }}
                    >
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedIds.has(msg.id)} onChange={() => toggleId(msg.id)}
                          className="w-3.5 h-3.5 accent-red-500 cursor-pointer" />
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedMsg(msg)}>
                        <p className={`font-medium ${msg.status === 'unread' ? 'text-white' : 'text-slate-300'}`}>
                          {msg.full_name}
                          {msg.status === 'unread' && (
                            <span className="mr-2 inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 align-middle" />
                          )}
                        </p>
                        <p className="text-xs text-slate-500">{msg.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-slate-300 text-xs max-w-[160px] truncate">
                        {msg.subject || '—'}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-400 text-xs max-w-[200px]">
                        <span className="truncate block">{msg.message.slice(0, 60)}{msg.message.length > 60 ? '…' : ''}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs whitespace-nowrap">
                        {fmtDate(msg.created_at)}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={msg.status} /></td>
                      <td className="px-4 py-3">
                        <button className="text-slate-500 hover:text-teal-400 transition-colors p-1"
                          onClick={() => setSelectedMsg(msg)}>
                          <Eye size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Drawer ── */}
        <AnimatePresence>
          {selectedMsg && (
            <>
              <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedMsg(null)} />
              <MessageDrawer
                key={selectedMsg.id}
                msg={selectedMsg}
                onClose={() => setSelectedMsg(null)}
                onStatusChange={handleStatusChange}
                onReplySave={handleReplySave}
                onDelete={handleDelete}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
