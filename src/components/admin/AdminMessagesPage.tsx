import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Mail, Archive,
  MailOpen, Reply, CheckCircle2, MessageSquare,
  Settings2, Trash2, X, Download,
} from 'lucide-react';
import {
  fetchMessages, updateMessageStatus, saveAdminReply,
  deleteMessage, deleteMessages,
} from '../../lib/messagesApi';
import type { ContactMessage, MessageStatus } from '../../lib/messagesApi';

const STATUS_CONFIG: Record<MessageStatus, { label: string; color: string }> = {
  unread:   { label: 'خوانده‌نشده', color: '#f59e0b' },
  read:     { label: 'خوانده‌شده',  color: '#94a3b8' },
  replied:  { label: 'پاسخ داده شد', color: '#22c55e' },
  archived: { label: 'آرشیو',       color: '#475569' },
};

interface MessagePanelProps {
  msg: ContactMessage;
  onClose: () => void;
  onStatusChange: (id: string, s: MessageStatus) => void;
}

function MessagePanel({ msg, onClose, onStatusChange }: MessagePanelProps) {
  const [reply, setReply] = useState(msg.admin_reply ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSaving(true);
    const ok = await saveAdminReply(msg.id, reply);
    setSaving(false);
    if (ok) {
      setSaved(true);
      onStatusChange(msg.id, 'replied');
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="fixed top-0 left-0 bottom-0 w-full sm:w-[480px] z-50 flex flex-col overflow-y-auto"
      style={{ background: '#07111e', borderRight: '1px solid rgba(255,255,255,0.08)' }}
      dir="rtl"
    >
      <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
        style={{ background: '#07111e', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="font-bold text-white text-base">{msg.full_name}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">✕</button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
          <span>{msg.email}</span>
          <span>·</span>
          <span>{fmtDate(msg.created_at)}</span>
          <span
            className="px-2 py-0.5 rounded-full ml-auto"
            style={{ background: `${STATUS_CONFIG[msg.status].color}15`, color: STATUS_CONFIG[msg.status].color }}>
            {STATUS_CONFIG[msg.status].label}
          </span>
        </div>

        {/* Subject */}
        {msg.subject && (
          <div>
            <p className="text-xs text-slate-500 mb-1">موضوع</p>
            <p className="text-sm font-medium text-white">{msg.subject}</p>
          </div>
        )}

        {/* Message body */}
        <div>
          <p className="text-xs text-slate-500 mb-2">پیام</p>
          <div className="p-4 rounded-xl text-sm text-slate-200 leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {msg.message}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {(['read', 'replied', 'archived'] as MessageStatus[]).map(s => (
            <button key={s} onClick={() => onStatusChange(msg.id, s)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={msg.status === s
                ? { background: `${STATUS_CONFIG[s].color}20`, color: STATUS_CONFIG[s].color, border: `1px solid ${STATUS_CONFIG[s].color}40` }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {s === 'read' && <MailOpen size={12} />}
              {s === 'replied' && <CheckCircle2 size={12} />}
              {s === 'archived' && <Archive size={12} />}
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {/* Admin Reply */}
        <div>
          <p className="text-xs text-slate-500 mb-2">پاسخ داخلی (یادداشت برای پیگیری)</p>
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={4}
            placeholder="پاسخ یا یادداشت داخلی..."
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(0,188,212,0.4)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          <button onClick={handleReply} disabled={saving || !reply.trim()}
            className="mt-2 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80 disabled:opacity-40"
            style={{ background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
            <Reply size={12} />
            {saved ? '✓ ذخیره شد' : saving ? 'در حال ذخیره...' : 'ذخیره پاسخ'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Manage Panel for Messages ────────────────────────────────────────────────

function MessagesManagePanel({
  messages,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  onDeleteAll,
  onClose,
}: {
  messages: ContactMessage[];
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
      <p className="text-xs text-slate-500">
        ⚠ تمام حذف‌ها <strong className="text-red-400">غیرقابل بازگشت</strong> هستند و از دیتابیس دائمی پاک می‌شوند.
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onSelectAll}
          className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
          انتخاب همه ({messages.length})
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
      {messages.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          {messages.map(m => (
            <label key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5">
              <input type="checkbox" checked={selectedIds.has(m.id)} onChange={() => onToggle(m.id)}
                className="w-3.5 h-3.5 accent-red-500 cursor-pointer flex-shrink-0" />
              <span className="text-sm text-white truncate flex-1">{m.full_name}</span>
              <span className="text-xs text-slate-500 flex-shrink-0">{m.email ?? ''}</span>
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
                  <Trash2 size={13} /> تأیید — حذف {selectedIds.size} پیام
                </button>
                <button onClick={() => setConfirmSelected(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">انصراف</button>
              </>
            ) : (
              <button onClick={() => setConfirmSelected(true)}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl transition-all hover:opacity-90"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                <Trash2 size={13} /> حذف {selectedIds.size} پیام انتخاب‌شده
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
                <Trash2 size={13} /> تأیید — حذف همه {messages.length} پیام
              </button>
              <button onClick={() => setConfirmAll(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">انصراف</button>
            </>
          ) : (
            <button onClick={() => setConfirmAll(true)}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl transition-all hover:opacity-90"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Trash2 size={13} /> حذف همه پیام‌ها
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CSV Download for Messages ────────────────────────────────────────────────

function downloadMessagesCSV(messages: ContactMessage[]) {
  const headers = ['نام', 'ایمیل', 'موضوع', 'پیام', 'وضعیت', 'تاریخ'];
  const rows = messages.map(m => [
    m.full_name,
    m.email ?? '',
    m.subject ?? '',
    m.message,
    m.status,
    new Date(m.created_at).toLocaleDateString('fa-IR'),
  ]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csvContent = '\uFEFF' + [headers, ...rows].map(r => r.map(escape).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `messages-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<MessageStatus | 'all'>('all');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [showManage, setShowManage] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    const data = await fetchMessages({
      status: filterStatus === 'all' ? undefined : filterStatus,
      search: q || undefined,
    });
    setMessages(data);
    setLoading(false);
  }, [filterStatus]);

  // تغییر فیلتر وضعیت بلافاصله fetch می‌کند
  useEffect(() => { load(search); }, [filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // search با debounce 350ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(search), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (id: string, status: MessageStatus) => {
    await updateMessageStatus(id, status);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const handleDeleteOne = async (id: string) => {
    await deleteMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    if (selected?.id === id) setSelected(null);
  };

  const handleDeleteSelected = async () => {
    const ids = [...selectedIds];
    await deleteMessages(ids);
    setMessages(prev => prev.filter(m => !selectedIds.has(m.id)));
    setSelectedIds(new Set());
  };

  const handleDeleteAll = async () => {
    await deleteMessages(messages.map(m => m.id));
    setMessages([]);
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

  const handleOpen = async (msg: ContactMessage) => {
    setSelected(msg);
    if (msg.status === 'unread') {
      await updateMessageStatus(msg.id, 'read');
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
    }
  };


  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">صندوق پیام‌ها</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {messages.length} پیام
            {unreadCount > 0 && <span className="mr-2 text-amber-400">{unreadCount} خوانده‌نشده</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => downloadMessagesCSV(messages)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Download size={14} />دانلود CSV
          </button>
          <button onClick={() => setShowManage(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
            style={showManage
              ? { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
              : { background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)' }}>
            <Settings2 size={14} />مدیریت
          </button>
          <button onClick={() => load(search)} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
            style={{ background: 'rgba(0,188,212,0.1)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />بروزرسانی
          </button>
        </div>
      </div>

      {/* پنل مدیریت */}
      <AnimatePresence>
        {showManage && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}>
            <MessagesManagePanel
              messages={messages}
              selectedIds={selectedIds}
              onToggle={toggleId}
              onSelectAll={() => setSelectedIds(new Set(messages.map(m => m.id)))}
              onClearSelection={() => setSelectedIds(new Set())}
              onDeleteSelected={handleDeleteSelected}
              onDeleteAll={handleDeleteAll}
              onClose={() => setShowManage(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'unread', 'read', 'replied', 'archived'] as const).map(s => {
          const count = s === 'all' ? messages.length : messages.filter(m => m.status === s).length;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all"
              style={filterStatus === s
                ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {s === 'all' ? 'همه' : STATUS_CONFIG[s].label}
              <span className="px-1.5 py-0.5 rounded-full text-[10px]"
                style={{ background: 'rgba(255,255,255,0.08)' }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(search)}
          placeholder="جستجو نام، ایمیل، موضوع..."
          className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
      </div>

      {/* Messages list */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">پیامی یافت نشد</p>
          </div>
        ) : (
          <div>
            {messages.map((msg, i) => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleOpen(msg)}
                className="flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: selectedIds.has(msg.id) ? 'rgba(239,68,68,0.04)' : 'transparent',
                }}
                onMouseEnter={e => { if (!selectedIds.has(msg.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = selectedIds.has(msg.id) ? 'rgba(239,68,68,0.04)' : 'transparent'; }}
              >
                {/* Checkbox */}
                <input type="checkbox"
                  checked={selectedIds.has(msg.id)}
                  onChange={e => { e.stopPropagation(); toggleId(msg.id); }}
                  onClick={e => e.stopPropagation()}
                  className="w-3.5 h-3.5 accent-red-500 cursor-pointer flex-shrink-0 mt-1" />

                {/* Icon */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: msg.status === 'unread' ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.06)' }}>
                  {msg.status === 'unread'
                    ? <Mail size={16} className="text-amber-400" />
                    : msg.status === 'replied'
                    ? <CheckCircle2 size={16} className="text-green-400" />
                    : <MailOpen size={16} className="text-slate-500" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm font-medium truncate ${msg.status === 'unread' ? 'text-white' : 'text-slate-300'}`}>
                      {msg.full_name}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs"
                        style={{ color: STATUS_CONFIG[msg.status].color }}>
                        {STATUS_CONFIG[msg.status].label}
                      </span>
                      <span className="text-xs text-slate-600">{fmtDate(msg.created_at)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{msg.email}</p>
                  {msg.subject && <p className="text-xs text-slate-400 mt-0.5 truncate">{msg.subject}</p>}
                  <p className="text-xs text-slate-500 mt-1 truncate">{msg.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Message Panel */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
            <MessagePanel key={selected.id} msg={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
          </>
        )}
      </AnimatePresence>
      {/* دکمه حذف در پنل پیام باز */}
      <AnimatePresence>
        {selected && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              onClick={() => { if (confirm('این پیام حذف شود؟ غیرقابل بازگشت است.')) handleDeleteOne(selected.id); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-2xl transition-all hover:opacity-90"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Trash2 size={14} />
              حذف این پیام
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
