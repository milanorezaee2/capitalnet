// ─── Enterprise Blog CMS — Activity Log ──────────────────────────────────────
import { useState, useEffect } from 'react';
import { Activity, RefreshCw, User, Clock, Globe, Search } from 'lucide-react';
import { fetchActivityLog } from '../api';
import type { ActivityLog } from '../types';

const ACTION_STYLE: Record<string, { label: string; color: string }> = {
  create:   { label: 'ایجاد',         color: '#22c55e' },
  update:   { label: 'ویرایش',        color: '#3b82f6' },
  delete:   { label: 'حذف',           color: '#ef4444' },
  publish:  { label: 'انتشار',        color: '#00BCD4' },
  unpublish:{ label: 'لغو انتشار',    color: '#f59e0b' },
  login:    { label: 'ورود',          color: '#8b5cf6' },
  logout:   { label: 'خروج',          color: '#94a3b8' },
  settings: { label: 'تنظیمات',       color: '#f59e0b' },
};

const RESOURCE_LABEL: Record<string, string> = {
  post: 'مقاله', category: 'دسته‌بندی', tag: 'برچسب',
  author: 'نویسنده', comment: 'نظر', media: 'رسانه',
  settings: 'تنظیمات', auth: 'احراز هویت',
};

export default function CMSActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); setLogs(await fetchActivityLog(100)); setLoading(false); };

  const filtered = logs.filter(l => {
    if (filterAction !== 'all' && l.action !== filterAction) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.user_name.toLowerCase().includes(q) || (l.resource_title ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  const inputSt = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">گزارش فعالیت</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>ثبت تمام عملیات سیستم</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="جستجو در فعالیت‌ها..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={inputSt} />
        </div>
        {['all', 'create', 'update', 'delete', 'publish', 'login'].map(a => {
          const cfg = a === 'all' ? { label: 'همه', color: '#94a3b8' } : ACTION_STYLE[a];
          return (
            <button key={a} onClick={() => setFilterAction(a)}
              className="px-3 py-2 rounded-xl text-xs transition-all"
              style={filterAction === a
                ? { background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {cfg.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Activity size={32} className="mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>فعالیتی ثبت نشده</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>با شروع کار در پنل، فعالیت‌ها اینجا نمایش داده می‌شوند</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const actionStyle = ACTION_STYLE[log.action] ?? { label: log.action, color: '#94a3b8' };
            return (
              <div key={log.id} className="flex items-start gap-3 px-4 py-3 rounded-2xl transition-colors hover:bg-white/[0.02]"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Action indicator */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${actionStyle.color}15` }}>
                  <Activity size={14} style={{ color: actionStyle.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${actionStyle.color}15`, color: actionStyle.color }}>
                      {actionStyle.label}
                    </span>
                    <span className="text-xs font-medium text-white">{RESOURCE_LABEL[log.resource_type] ?? log.resource_type}</span>
                    {log.resource_title && (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>— {log.resource_title}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <User size={10} /> {log.user_name}
                    </span>
                    {log.user_ip && (
                      <span className="flex items-center gap-1 text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <Globe size={10} /> {log.user_ip}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <Clock size={10} />
                      {new Date(log.created_at).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  {log.details && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{log.details}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
