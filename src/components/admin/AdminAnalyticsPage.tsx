import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw, TrendingUp, Users, MessageSquare,
  FileText, Eye, ArrowUpRight, ArrowDownRight,
  BarChart3, Activity,
} from 'lucide-react';
import { fetchAnalytics } from '../../lib/analyticsApi';
import type { AnalyticsSnapshot } from '../../lib/analyticsApi';

// ── Tiny SVG Bar Chart ────────────────────────────────────────────────────────
function MiniBarChart({ data, color = '#00BCD4', height = 48 }: {
  data: Array<{ date: string; count: number }>;
  color?: string;
  height?: number;
}) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  const w = 100 / data.length;

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const barH = (d.count / max) * (height - 4);
        const x = i * w + w * 0.1;
        const barW = w * 0.8;
        return (
          <g key={i}>
            <rect
              x={x} y={height - barH} width={barW} height={barH}
              rx="1" fill={color} opacity={d.count === 0 ? 0.12 : 0.75}
            />
            {d.count > 0 && barH > 8 && (
              <text x={x + barW / 2} y={height - barH - 2}
                textAnchor="middle" fontSize="4" fill={color} opacity="0.8">
                {d.count}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Tiny SVG Line Sparkline ───────────────────────────────────────────────────
function Sparkline({ data, color = '#00BCD4' }: {
  data: Array<{ count: number }>;
  color?: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 30 - (d.count / max) * 28;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-8">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 80 }: {
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="rounded-full border-4" style={{ width: size - 8, height: size - 8, borderColor: 'rgba(255,255,255,0.08)' }} />
    </div>
  );

  let offset = -90;
  const r = 30;
  const cx = 40, cy = 40;
  const circumference = 2 * Math.PI * r;

  return (
    <svg viewBox="0 0 80 80" style={{ width: size, height: size }}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const rotation = offset;
        offset += pct * 360;
        return (
          <circle key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-(rotation / 360) * circumference}
            transform={`rotate(-90 ${cx} ${cy})`}
            opacity="0.85"
          />
        );
      })}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fontWeight="bold" fill="white">
        {total}
      </text>
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({
  icon, label, value, sub, color, trend, sparkData,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  trend?: number;
  sparkData?: Array<{ count: number }>;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs font-medium"
            style={{ color: trend >= 0 ? '#22c55e' : '#ef4444' }}>
            {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color }}>{sub}</p>}
      {sparkData && sparkData.length > 1 && (
        <div className="mt-3 opacity-60">
          <Sparkline data={sparkData} color={color} />
        </div>
      )}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const snap = await fetchAnalytics();
    setData(snap);
    if (!silent) setLoading(false);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    load();
    // interval با silent=true — بدون flash کردن UI
    const interval = setInterval(() => load(true), 60_000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <span className="w-10 h-10 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin block mx-auto" />
          <p className="text-slate-400 text-sm">در حال بارگذاری آمار...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const last30Days = data.viewsByDay.slice(-30);
  const last30Leads = data.leadsByDay.slice(-30);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">آنالیتیکس</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            آخرین بروزرسانی: {lastRefresh.toLocaleTimeString('fa-IR')}
          </p>
        </div>
        <button onClick={() => load()} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:opacity-80"
          style={{ background: 'rgba(0,188,212,0.1)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          بروزرسانی
        </button>
      </div>

      {/* ── KPI Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<Eye size={18} />}
          label="بازدید کل"
          value={data.totalViews.toLocaleString('fa-IR')}
          sub={`+${data.viewsToday} امروز`}
          color="#00BCD4"
          sparkData={last30Days}
        />
        <KPICard icon={<Users size={18} />}
          label="کل لیدها"
          value={data.totalLeads.toLocaleString('fa-IR')}
          sub={`+${data.leadsThisWeek} این هفته`}
          color="#a78bfa"
          sparkData={last30Leads}
        />
        <KPICard icon={<MessageSquare size={18} />}
          label="پیام‌ها"
          value={data.totalMessages.toLocaleString('fa-IR')}
          sub={data.unreadMessages > 0 ? `${data.unreadMessages} خوانده‌نشده` : 'همه خوانده شده'}
          color="#f59e0b"
        />
        <KPICard icon={<TrendingUp size={18} />}
          label="نرخ تبدیل"
          value={`${data.conversionRate}٪`}
          sub="بازدید → لید"
          color="#22c55e"
        />
      </div>

      {/* ── Secondary KPIs ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'بازدید امروز',     value: data.viewsToday,        color: '#00BCD4' },
          { label: 'بازدید این هفته',  value: data.viewsThisWeek,     color: '#00BCD4' },
          { label: 'لید این ماه',      value: data.leadsThisMonth,    color: '#a78bfa' },
          { label: 'بازدید بلاگ',      value: data.totalBlogViews,    color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-lg font-bold" style={{ color: s.color }}>
              {s.value.toLocaleString('fa-IR')}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Page Views Chart */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-teal-400" />
            <h3 className="text-sm font-semibold text-white">بازدید ۳۰ روز گذشته</h3>
          </div>
          {last30Days.length > 0 ? (
            <>
              <MiniBarChart data={last30Days} color="#00BCD4" height={80} />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>{last30Days[0]?.date}</span>
                <span>{last30Days[last30Days.length - 1]?.date}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-20 text-slate-600 text-sm">
              داده‌ای برای نمایش وجود ندارد
            </div>
          )}
        </div>

        {/* Leads Chart */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-purple-400" />
            <h3 className="text-sm font-semibold text-white">لیدهای ۳۰ روز گذشته</h3>
          </div>
          {last30Leads.length > 0 ? (
            <>
              <MiniBarChart data={last30Leads} color="#a78bfa" height={80} />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>{last30Leads[0]?.date}</span>
                <span>{last30Leads[last30Leads.length - 1]?.date}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-20 text-slate-600 text-sm">
              داده‌ای برای نمایش وجود ندارد
            </div>
          )}
        </div>
      </div>

      {/* ── Distribution Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Leads by Type */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">نوع لیدها</h3>
          <div className="flex items-center gap-5">
            <DonutChart segments={[
              { label: 'فاندر',         value: data.leadsByType.founder,  color: '#00BCD4' },
              { label: 'سرمایه‌گذار',  value: data.leadsByType.investor, color: '#a78bfa' },
            ]} size={80} />
            <div className="space-y-2">
              {[
                { label: 'فاندر',        value: data.leadsByType.founder,  color: '#00BCD4' },
                { label: 'سرمایه‌گذار', value: data.leadsByType.investor, color: '#a78bfa' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-slate-400">{s.label}</span>
                  <span className="text-xs font-bold text-white mr-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leads by Status */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">وضعیت لیدها</h3>
          <div className="flex items-center gap-5">
            <DonutChart segments={[
              { label: 'جدید',       value: data.leadsByStatus['new']       ?? 0, color: '#00BCD4' },
              { label: 'در بررسی',  value: data.leadsByStatus['in_review'] ?? 0, color: '#f59e0b' },
              { label: 'تأیید',     value: data.leadsByStatus['approved']  ?? 0, color: '#22c55e' },
              { label: 'رد شده',    value: data.leadsByStatus['rejected']  ?? 0, color: '#ef4444' },
            ]} size={80} />
            <div className="space-y-2">
              {[
                { label: 'جدید',      value: data.leadsByStatus['new']       ?? 0, color: '#00BCD4' },
                { label: 'در بررسی', value: data.leadsByStatus['in_review'] ?? 0, color: '#f59e0b' },
                { label: 'تأیید',    value: data.leadsByStatus['approved']  ?? 0, color: '#22c55e' },
                { label: 'رد شده',   value: data.leadsByStatus['rejected']  ?? 0, color: '#ef4444' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-slate-400">{s.label}</span>
                  <span className="text-xs font-bold text-white mr-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Stats */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">آمار بلاگ</h3>
          <div className="space-y-3">
            {[
              { label: 'کل پست‌ها',       value: data.totalPosts,     color: '#f59e0b' },
              { label: 'منتشر شده',        value: data.publishedPosts, color: '#22c55e' },
              { label: 'مجموع بازدید',     value: data.totalBlogViews, color: '#00BCD4' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{s.label}</span>
                <span className="text-sm font-bold" style={{ color: s.color }}>
                  {s.value.toLocaleString('fa-IR')}
                </span>
              </div>
            ))}
            <div className="h-px mt-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">پیش‌نویس</span>
              <span className="text-sm font-bold text-slate-400">
                {(data.totalPosts - data.publishedPosts).toLocaleString('fa-IR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Pages + Top Posts ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Pages */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <BarChart3 size={15} className="text-teal-400" />
            <h3 className="text-sm font-semibold text-white">پربازدیدترین صفحات (۳۰ روز)</h3>
          </div>
          {data.viewsByPage.length === 0 ? (
            <div className="text-center py-8 text-slate-600 text-sm">داده‌ای موجود نیست</div>
          ) : (
            <div className="p-3 space-y-2">
              {data.viewsByPage.map((item, i) => {
                const max = data.viewsByPage[0]?.count ?? 1;
                const pct = (item.count / max) * 100;
                return (
                  <div key={item.page}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-300 font-mono truncate max-w-[180px]">
                        {item.page === '/' || item.page === 'home' ? '🏠 صفحه اصلی' : item.page}
                      </span>
                      <span className="text-xs font-bold text-teal-400 mr-2">{item.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: i === 0 ? '#00BCD4' : 'rgba(0,188,212,0.4)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Blog Posts */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <FileText size={15} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">پربازدیدترین پست‌های بلاگ</h3>
          </div>
          {data.topPosts.length === 0 ? (
            <div className="text-center py-8 text-slate-600 text-sm">پستی منتشر نشده</div>
          ) : (
            <div className="p-3 space-y-2">
              {data.topPosts.map((post, i) => {
                const max = data.topPosts[0]?.views ?? 1;
                const pct = (post.views / max) * 100;
                return (
                  <div key={post.slug}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-300 truncate max-w-[200px]">{post.title}</span>
                      <span className="text-xs font-bold text-amber-400 mr-2 flex-shrink-0">
                        {post.views.toLocaleString('fa-IR')}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: i === 0 ? '#f59e0b' : 'rgba(245,158,11,0.4)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Footer ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(0,188,212,0.04)', border: '1px solid rgba(0,188,212,0.12)' }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'نرخ تبدیل',        value: `${data.conversionRate}٪`,                      color: '#22c55e' },
            { label: 'میانگین لید/هفته', value: (data.totalLeads / Math.max(4, 1)).toFixed(1),  color: '#a78bfa' },
            { label: 'پیام‌های باز',     value: data.unreadMessages.toLocaleString('fa-IR'),     color: '#f59e0b' },
            { label: 'پست منتشر شده',    value: data.publishedPosts.toLocaleString('fa-IR'),     color: '#00BCD4' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
