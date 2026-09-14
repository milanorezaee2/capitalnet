import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, RefreshCw, ChevronDown,
  User, CheckCircle2, Clock, XCircle, AlertCircle,
  StickyNote, Trash2, Download, Eye, Settings2, X,
  Bell, Wifi,
} from 'lucide-react';
import { fetchLeads, updateLeadStatus, updateLeadNotes, deleteLead, deleteLeads } from '../../lib/leadsApi';
import type { Lead, LeadStatus } from '../../lib/leadsApi';
import { supabase } from '../../lib/supabaseApi';

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: React.ReactNode }> = {
  new:       { label: 'جدید',      color: '#00BCD4', icon: <AlertCircle size={13} /> },
  in_review: { label: 'در بررسی',  color: '#f59e0b', icon: <Clock size={13} /> },
  approved:  { label: 'تأیید شده', color: '#22c55e', icon: <CheckCircle2 size={13} /> },
  rejected:  { label: 'رد شده',   color: '#ef4444', icon: <XCircle size={13} /> },
};

// ─── New-lead Toast ───────────────────────────────────────────────────────────

function NewLeadToast({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  const typeLabel = lead.profile_type === 'founder' ? 'فاندر' : 'سرمایه‌گذار';
  const typeColor = lead.profile_type === 'founder' ? '#00BCD4' : '#a78bfa';
  const avatar = (lead.full_name ?? lead.email ?? 'L').charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: -24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
      style={{
        background: 'rgba(8,20,44,0.97)',
        border: '1px solid rgba(0,188,212,0.35)',
        minWidth: 280,
        boxShadow: '0 8px 32px rgba(0,188,212,0.15)',
      }}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #00BCD4, #7c5cd8)' }}
        >
          {avatar}
        </div>
        <span
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
          style={{ background: typeColor, borderColor: '#08142c', animation: 'pulse 1.5s infinite' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#00BCD4' }}>
          <Bell size={11} /> لید جدید دریافت شد!
        </p>
        <p className="text-sm font-bold text-white truncate">{lead.full_name || 'ناشناس'}</p>
        <p className="text-xs truncate" style={{ color: typeColor }}>{typeLabel} — {lead.email}</p>
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors flex-shrink-0 p-1">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
      style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
    >
      {cfg.icon}{cfg.label}
    </span>
  );
}

// ─── CSV Download Helper ──────────────────────────────────────────────────────

type CsvField = 'all' | 'name' | 'email' | 'phone';

function downloadPDFs(leads: Lead[]) {
  const withDeck = leads.filter(l => l.deck_url);
  if (!withDeck.length) { alert('هیچ لیدی فایل PDF ندارد.'); return; }
  withDeck.forEach((l, i) => {
    setTimeout(() => { window.open(l.deck_url!, '_blank', 'noopener,noreferrer'); }, i * 400);
  });
}

function downloadCSV(leads: Lead[], field: CsvField) {
  let headers: string[];
  let rows: string[][];

  if (field === 'all') {
    headers = ['نام', 'ایمیل', 'شماره تلفن', 'نوع', 'شرکت/سازمان', 'مرحله', 'وضعیت', 'تاریخ', 'Pitch Deck'];
    rows = leads.map(l => [
      l.full_name,
      l.email,
      l.phone ?? '',
      l.profile_type === 'founder' ? 'فاندر' : 'سرمایه‌گذار',
      l.company_name ?? l.org_name ?? '',
      l.stage ?? l.stage_pref ?? '',
      STATUS_CONFIG[l.status].label,
      new Date(l.created_at).toLocaleDateString('fa-IR'),
      l.deck_url ?? '',
    ]);
  } else if (field === 'name') {
    headers = ['نام'];
    rows = leads.map(l => [l.full_name]);
  } else if (field === 'email') {
    headers = ['ایمیل'];
    rows = leads.map(l => [l.email]);
  } else {
    headers = ['شماره تلفن'];
    rows = leads.map(l => [l.phone ?? '']);
  }

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csvContent = '\uFEFF' + [headers, ...rows]
    .map(r => r.map(escape).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-${field}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Lead Drawer ──────────────────────────────────────────────────────────────

interface LeadDrawerProps {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (id: string, s: LeadStatus) => void;
  onNotesSave: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

function LeadDrawer({ lead, onClose, onStatusChange, onNotesSave, onDelete }: LeadDrawerProps) {
  const [notes, setNotes] = useState(lead.admin_notes ?? '');
  const [saving, setSaving] = useState(false);

  const handleSaveNotes = async () => {
    setSaving(true);
    await onNotesSave(lead.id, notes);
    setSaving(false);
  };

  const fmt = (v: string | null | undefined) => v || '—';
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
        <h3 className="font-bold text-white text-base">{lead.full_name}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={16} /></button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={lead.profile_type === 'founder'
              ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4' }
              : { background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>
            {lead.profile_type === 'founder' ? '🚀 فاندر' : '💼 سرمایه‌گذار'}
          </span>
          <StatusBadge status={lead.status} />
          <span className="text-xs text-slate-500">{fmtDate(lead.created_at)}</span>
        </div>

        <section>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">اطلاعات تماس</h4>
          <div className="space-y-2">
            {[
              { label: 'نام', value: lead.full_name },
              { label: 'ایمیل', value: lead.email },
              { label: 'تلفن', value: fmt(lead.phone) },
              { label: 'لینکدین', value: fmt(lead.linkedin) },
            ].map(row => (
              <div key={row.label} className="flex gap-2 text-sm">
                <span className="text-slate-500 min-w-[70px]">{row.label}:</span>
                <span className="text-white break-all">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        {lead.profile_type === 'founder' ? (
          <section>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">اطلاعات استارتاپ</h4>
            <div className="space-y-2">
              {[
                { label: 'شرکت', value: fmt(lead.company_name) },
                { label: 'حوزه', value: fmt(lead.sector) },
                { label: 'مرحله', value: fmt(lead.stage) },
                { label: 'سرمایه', value: fmt(lead.capital_required) },
              ].map(row => (
                <div key={row.label} className="flex gap-2 text-sm">
                  <span className="text-slate-500 min-w-[70px]">{row.label}:</span>
                  <span className="text-white">{row.value}</span>
                </div>
              ))}
            </div>
            {lead.one_liner && (
              <div className="mt-3 p-3 rounded-xl text-sm text-slate-300"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {lead.one_liner}
              </div>
            )}
          </section>
        ) : (
          <section>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">پروفایل سرمایه‌گذاری</h4>
            <div className="space-y-2">
              {[
                { label: 'سازمان', value: fmt(lead.org_name) },
                { label: 'Ticket Size', value: fmt(lead.ticket_size) },
                { label: 'Stage', value: fmt(lead.stage_pref) },
                { label: 'جغرافیا', value: fmt(lead.geo_pref) },
              ].map(row => (
                <div key={row.label} className="flex gap-2 text-sm">
                  <span className="text-slate-500 min-w-[80px]">{row.label}:</span>
                  <span className="text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {lead.message && (
          <section>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">پیام</h4>
            <p className="text-sm text-slate-300 leading-relaxed p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {lead.message}
            </p>
          </section>
        )}

        {lead.deck_url && (
          <div className="flex flex-col gap-2">
            <a href={lead.deck_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors">
              <Download size={15} />
              مشاهده Pitch Deck
            </a>
            <a href={lead.deck_url} download
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg w-fit transition-all hover:opacity-80"
              style={{ background: 'rgba(0,188,212,0.10)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
              <Download size={12} />
              دانلود فایل PDF
            </a>
          </div>
        )}

        <section>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">تغییر وضعیت</h4>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map(s => (
              <button key={s} onClick={() => onStatusChange(lead.id, s)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-80"
                style={lead.status === s
                  ? { background: `${STATUS_CONFIG[s].color}20`, color: STATUS_CONFIG[s].color, border: `1px solid ${STATUS_CONFIG[s].color}50` }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">یادداشت داخلی</h4>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
            placeholder="یادداشت‌های خصوصی..."
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(0,188,212,0.4)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
          <button onClick={handleSaveNotes} disabled={saving}
            className="mt-2 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
            <StickyNote size={12} />
            {saving ? 'در حال ذخیره...' : 'ذخیره یادداشت'}
          </button>
        </section>

        <button
          onClick={() => { if (confirm('این لید حذف شود؟ این عمل قابل بازگشت نیست.')) onDelete(lead.id); }}
          className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
          حذف این لید (غیرقابل بازگشت)
        </button>
      </div>
    </motion.div>
  );
}

// ─── Manage Panel ─────────────────────────────────────────────────────────────

function ManagePanel({
  leads,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  onDeleteAll,
  onClose,
}: {
  leads: Lead[];
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 size={15} className="text-red-400" />
          <h3 className="text-sm font-bold text-white">مدیریت و حذف لیدها</h3>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white p-1 transition-colors">
          <X size={15} />
        </button>
      </div>

      <p className="text-xs text-slate-500">
        ⚠ تمام حذف‌ها <strong className="text-red-400">غیرقابل بازگشت</strong> هستند و از دیتابیس به صورت دائمی پاک می‌شوند.
      </p>

      {/* انتخاب همه / پاک کردن */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onSelectAll}
          className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
          انتخاب همه ({leads.length})
        </button>
        {selectedIds.size > 0 && (
          <button onClick={onClearSelection}
            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            لغو انتخاب
          </button>
        )}
        {selectedIds.size > 0 && (
          <span className="text-xs text-teal-400 font-semibold">
            {selectedIds.size} مورد انتخاب شده
          </span>
        )}
      </div>

      {/* لیست چک‌باکس */}
      {leads.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          {leads.map(lead => (
            <label key={lead.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5">
              <input type="checkbox"
                checked={selectedIds.has(lead.id)}
                onChange={() => onToggle(lead.id)}
                className="w-3.5 h-3.5 accent-red-500 cursor-pointer flex-shrink-0" />
              <span className="text-sm text-white truncate flex-1">{lead.full_name}</span>
              <span className="text-xs text-slate-500 flex-shrink-0">{lead.email}</span>
              <StatusBadge status={lead.status} />
            </label>
          ))}
        </div>
      )}

      {/* دکمه‌های حذف */}
      <div className="flex flex-wrap gap-3 pt-1 border-t border-white/8">
        {/* حذف انتخاب‌شده‌ها */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            {confirmSelected ? (
              <>
                <button onClick={() => { onDeleteSelected(); setConfirmSelected(false); }}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-bold transition-all hover:opacity-90"
                  style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                  <Trash2 size={13} />
                  تأیید — حذف {selectedIds.size} لید
                </button>
                <button onClick={() => setConfirmSelected(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  انصراف
                </button>
              </>
            ) : (
              <button onClick={() => setConfirmSelected(true)}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl transition-all hover:opacity-90"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                <Trash2 size={13} />
                حذف {selectedIds.size} لید انتخاب‌شده
              </button>
            )}
          </div>
        )}

        {/* حذف همه */}
        <div className="flex items-center gap-2">
          {confirmAll ? (
            <>
              <button onClick={() => { onDeleteAll(); setConfirmAll(false); }}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-bold transition-all hover:opacity-90"
                style={{ background: 'rgba(239,68,68,0.25)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.5)' }}>
                <Trash2 size={13} />
                تأیید — حذف همه {leads.length} لید
              </button>
              <button onClick={() => setConfirmAll(false)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                انصراف
              </button>
            </>
          ) : (
            <button onClick={() => setConfirmAll(true)}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl transition-all hover:opacity-90"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Trash2 size={13} />
              حذف همه لیدها
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'founder' | 'investor'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Lead[]>([]);
  const [newBadge, setNewBadge] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    const data = await fetchLeads({
      status: filterStatus === 'all' ? undefined : filterStatus,
      profile_type: filterType === 'all' ? undefined : filterType,
      search: q || undefined,
    });
    setLeads(data);
    setLoading(false);
  }, [filterStatus, filterType]);

  useEffect(() => { load(search); }, [filterStatus, filterType]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(search), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Realtime: لید جدید + آپدیت وضعیت ────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('admin-leads-realtime')
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'assessments' },
        (payload: any) => {
          const newLead = payload.new as Lead;

          // اولین بارگذاری را نادیده بگیر
          if (isFirstLoad.current) return;

          // فقط اگر فیلتر فعلی با لید جدید مطابقت داشت، آن را نشان بده
          const statusMatch = filterStatus === 'all' || newLead.status === filterStatus;
          const typeMatch = filterType === 'all' || newLead.profile_type === filterType;
          if (statusMatch && typeMatch) {
            setLeads(prev => {
              if (prev.find(l => l.id === newLead.id)) return prev;
              return [newLead, ...prev];
            });
          }

          // Toast همیشه نمایش داده می‌شود صرف‌نظر از فیلتر
          setToasts(prev => [...prev, newLead]);
          setNewBadge(n => n + 1);
        }
      )
      .on(
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'assessments' },
        (payload: any) => {
          const updated = payload.new as Lead;
          // آپدیت ردیف مربوطه در لیست (بدون toast)
          setLeads(prev =>
            prev.map(l => l.id === updated.id ? { ...l, ...updated } : l)
          );
          // اگر drawer این لید باز بود، آن را هم آپدیت کن
          setSelectedLead(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev);
        }
      )
      .subscribe();

    // بعد از mount کوتاه صبر کن تا INSERT های اولیه فیلتر شوند
    const t = setTimeout(() => { isFirstLoad.current = false; }, 2000);

    return () => {
      clearTimeout(t);
      supabase.removeChannel(channel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await updateLeadStatus(id, status);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, status } : null);
  };

  const handleNotesSave = async (id: string, admin_notes: string) => {
    await updateLeadNotes(id, admin_notes);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, admin_notes } : l));
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, admin_notes } : null);
  };

  const handleDelete = async (id: string) => {
    await deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    setSelectedLead(null);
  };

  const handleDeleteSelected = async () => {
    const ids = [...selectedIds];
    await deleteLeads(ids);
    setLeads(prev => prev.filter(l => !selectedIds.has(l.id)));
    setSelectedIds(new Set());
  };

  const handleDeleteAll = async () => {
    const ids = leads.map(l => l.id);
    await deleteLeads(ids);
    setLeads([]);
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

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const stats = {
    total:    leads.length,
    new:      leads.filter(l => l.status === 'new').length,
    founders: leads.filter(l => l.profile_type === 'founder').length,
    approved: leads.filter(l => l.status === 'approved').length,
  };

  const dismissToast = (idx: number) => {
    setToasts(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <>
      {/* ── Toasts ── */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none" style={{ width: 320 }}>
        <AnimatePresence>
          {toasts.map((l, i) => (
            <div key={`${l.id}-${i}`} className="pointer-events-auto">
              <NewLeadToast lead={l} onClose={() => dismissToast(i)} />
            </div>
          ))}
        </AnimatePresence>
      </div>

    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">مدیریت لیدها</h1>
            <span className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Wifi size={10} />آنلاین
            </span>
            {newBadge > 0 && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setNewBadge(0)}
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(0,188,212,0.15)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.3)' }}>
                <Bell size={10} />{newBadge} جدید
              </motion.button>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{leads.length} لید در دیتابیس</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* دانلود */}
          <div className="relative">
            <button
              onClick={() => { setShowDownload(v => !v); setShowManage(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Download size={14} />
              دانلود
              <ChevronDown size={13} className={`transition-transform ${showDownload ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showDownload && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  className="absolute left-0 top-full mt-2 z-30 rounded-xl overflow-hidden shadow-2xl"
                  style={{ background: '#0d1f35', border: '1px solid rgba(255,255,255,0.1)', minWidth: 180 }}
                >
                  {([
                    { field: 'all'   as CsvField, label: 'دانلود همه اطلاعات (CSV)' },
                    { field: 'name'  as CsvField, label: 'فقط نام‌ها' },
                    { field: 'email' as CsvField, label: 'فقط ایمیل‌ها' },
                    { field: 'phone' as CsvField, label: 'فقط شماره‌ها' },
                  ]).map(opt => (
                    <button key={opt.field}
                      onClick={() => { downloadCSV(leads, opt.field); setShowDownload(false); }}
                      className="w-full text-right px-4 py-2.5 text-sm text-white hover:bg-white/8 transition-colors flex items-center gap-2">
                      <Download size={13} className="text-green-400 flex-shrink-0" />
                      {opt.label}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '2px 0' }} />
                  <button
                    onClick={() => { downloadPDFs(leads); setShowDownload(false); }}
                    className="w-full text-right px-4 py-2.5 text-sm text-white hover:bg-white/8 transition-colors flex items-center gap-2">
                    <Download size={13} className="text-teal-400 flex-shrink-0" />
                    دانلود PDF لیدها
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* مدیریت */}
          <button
            onClick={() => { setShowManage(v => !v); setShowDownload(false); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
            style={showManage
              ? { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
              : { background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)' }}>
            <Settings2 size={14} />
            مدیریت
          </button>

          {/* بروزرسانی */}
          <button onClick={() => load(search)} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
            style={{ background: 'rgba(0,188,212,0.1)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            بروزرسانی
          </button>
        </div>
      </div>

      {/* پنل مدیریت */}
      <AnimatePresence>
        {showManage && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}>
            <ManagePanel
              leads={leads}
              selectedIds={selectedIds}
              onToggle={toggleId}
              onSelectAll={() => setSelectedIds(new Set(leads.map(l => l.id)))}
              onClearSelection={() => setSelectedIds(new Set())}
              onDeleteSelected={handleDeleteSelected}
              onDeleteAll={handleDeleteAll}
              onClose={() => setShowManage(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'کل لیدها', value: stats.total, color: '#00BCD4' },
          { label: 'جدید', value: stats.new, color: '#f59e0b' },
          { label: 'فاندر', value: stats.founders, color: '#a78bfa' },
          { label: 'تأیید شده', value: stats.approved, color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="جستجو نام، ایمیل، شرکت..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
        <button onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
          style={{ background: showFilters ? 'rgba(0,188,212,0.12)' : 'rgba(255,255,255,0.05)', color: showFilters ? '#00BCD4' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Filter size={14} />
          فیلتر
          <ChevronDown size={13} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-3 overflow-hidden">
            <div className="flex gap-1.5">
              {(['all', 'new', 'in_review', 'approved', 'rejected'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={filterStatus === s
                    ? { background: 'rgba(0,188,212,0.15)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.3)' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {s === 'all' ? 'همه وضعیت‌ها' : STATUS_CONFIG[s as LeadStatus]?.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {(['all', 'founder', 'investor'] as const).map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={filterType === t
                    ? { background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {t === 'all' ? 'همه' : t === 'founder' ? 'فاندر' : 'سرمایه‌گذار'}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16">
            <User size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">لیدی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox"
                      checked={selectedIds.size === leads.length && leads.length > 0}
                      onChange={() => selectedIds.size === leads.length
                        ? setSelectedIds(new Set())
                        : setSelectedIds(new Set(leads.map(l => l.id)))}
                      className="w-3.5 h-3.5 accent-red-500 cursor-pointer" />
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">نام / ایمیل</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">نوع</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 hidden sm:table-cell">شرکت / سازمان</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 hidden md:table-cell">مرحله</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 hidden lg:table-cell">تاریخ</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">وضعیت</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <motion.tr key={lead.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="transition-colors"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: selectedIds.has(lead.id) ? 'rgba(239,68,68,0.05)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!selectedIds.has(lead.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = selectedIds.has(lead.id) ? 'rgba(239,68,68,0.05)' : 'transparent'; }}
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleId(lead.id)}
                        className="w-3.5 h-3.5 accent-red-500 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                      <p className="font-medium text-white">{lead.full_name}</p>
                      <p className="text-xs text-slate-500">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full"
                        style={lead.profile_type === 'founder'
                          ? { background: 'rgba(0,188,212,0.1)', color: '#00BCD4' }
                          : { background: 'rgba(167,139,250,0.1)', color: '#a78bfa' }}>
                        {lead.profile_type === 'founder' ? 'فاندر' : 'سرمایه‌گذار'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-300 text-xs">
                      {lead.company_name ?? lead.org_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-400 text-xs">
                      {lead.stage ?? lead.stage_pref ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">
                      {fmtDate(lead.created_at)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3">
                      <button className="text-slate-500 hover:text-teal-400 transition-colors p-1"
                        onClick={() => setSelectedLead(lead)}>
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

      {/* Lead Drawer */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedLead(null)} />
            <LeadDrawer
              key={selectedLead.id}
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onStatusChange={handleStatusChange}
              onNotesSave={handleNotesSave}
              onDelete={handleDelete}
            />
          </>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
