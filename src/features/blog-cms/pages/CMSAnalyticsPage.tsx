// ─── Enterprise Blog CMS — Analytics Page ────────────────────────────────────
import { useState, useEffect } from 'react';
import { Eye, Users, Clock, TrendingDown, TrendingUp, BarChart3, Globe } from 'lucide-react';
import { fetchBlogAnalytics } from '../api';
import type { BlogAnalyticsData } from '../api';

export default function CMSAnalyticsPage() {
  const [data, setData] = useState<BlogAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => { fetchBlogAnalytics().then(d => { setData(d); setLoading(false); }); }, []);

  if (loading || !data) return (
    <div className="flex items-center justify-center py-20">
      <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );

  const viewsSlice = activeRange === '7d' ? data.viewsByDay.slice(-7) : activeRange === '90d' ? data.viewsByDay : data.viewsByDay.slice(-30);
  const maxViews = Math.max(...viewsSlice.map(d => d.views));

  return (
    <div className="space-y-5" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-white">آنالیتیکس بلاگ</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>آمار و عملکرد محتوا</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'کل بازدید', value: data.totalViews.toLocaleString('fa-IR'), icon: <Eye size={18} />, color: '#00BCD4', trend: '+۱۲٪' },
          { label: 'بازدیدکنندگان', value: data.uniqueVisitors.toLocaleString('fa-IR'), icon: <Users size={18} />, color: '#8b5cf6', trend: '+۸٪' },
          { label: 'میانگین مطالعه', value: data.avgReadTime, icon: <Clock size={18} />, color: '#22c55e', trend: '+۰.۳' },
          { label: 'نرخ خروج', value: data.bounceRate, icon: <TrendingDown size={18} />, color: '#f59e0b', trend: '-۵٪' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${k.color}18`, color: k.color }}>
                {k.icon}
              </div>
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>{k.trend}</span>
            </div>
            <p className="text-2xl font-bold text-white">{k.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Views Chart */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} style={{ color: '#00BCD4' }} />
            <h3 className="text-sm font-semibold text-white">بازدید روزانه</h3>
          </div>
          <div className="flex gap-1">
            {(['7d', '30d', '90d'] as const).map(r => (
              <button key={r} onClick={() => setActiveRange(r)}
                className="px-2.5 py-1 rounded-lg text-xs transition-all"
                style={activeRange === r
                  ? { background: 'rgba(0,188,212,0.15)', color: '#00BCD4' }
                  : { color: 'rgba(255,255,255,0.4)' }}>
                {r === '7d' ? '۷ روز' : r === '30d' ? '۳۰ روز' : '۹۰ روز'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-0.5 h-36">
          {viewsSlice.map((d, i) => {
            const h = maxViews > 0 ? Math.max((d.views / maxViews) * 100, 3) : 3;
            return (
              <div key={i} title={`${d.date}: ${d.views.toLocaleString('fa-IR')}`}
                className="flex-1 rounded-t-sm cursor-pointer transition-all hover:opacity-80"
                style={{ height: `${h}%`, background: i === viewsSlice.length - 1 ? '#00BCD4' : 'rgba(0,188,212,0.35)' }} />
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{viewsSlice[0]?.date}</span>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{viewsSlice[viewsSlice.length - 1]?.date}</span>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Top Posts */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <TrendingUp size={15} style={{ color: '#22c55e' }} />
            <h3 className="text-sm font-semibold text-white">مقالات پربازدید</h3>
          </div>
          <div className="p-2">
            {data.topPosts.map((post, i) => {
              const maxV = data.topPosts[0]?.views ?? 1;
              const pct = (post.views / maxV) * 100;
              return (
                <div key={i} className="px-2 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ background: i === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)', color: i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.4)' }}>
                      {(i + 1).toLocaleString('fa-IR')}
                    </span>
                    <p className="text-xs text-white flex-1 line-clamp-1">{post.title}</p>
                    <span className="text-xs flex-shrink-0 font-medium" style={{ color: '#00BCD4' }}>
                      {post.views.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <div className="mr-7 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: i === 0 ? '#f59e0b' : '#00BCD4' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Globe size={15} style={{ color: '#8b5cf6' }} />
            <h3 className="text-sm font-semibold text-white">منابع ورودی</h3>
          </div>
          <div className="p-3 space-y-3">
            {data.trafficSources.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.source}</span>
                  <span className="text-xs font-semibold text-white">{s.pct}٪</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: `hsl(${200 + i * 35}, 70%, 60%)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Author Performance */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Users size={15} style={{ color: '#f472b6' }} />
          <h3 className="text-sm font-semibold text-white">عملکرد نویسندگان</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['نویسنده', 'مقالات', 'کل بازدید', 'میانگین بازدید'].map(h => (
                  <th key={h} className="text-right px-4 py-2.5 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.authorPerformance.map((a, i) => (
                <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-4 py-3 text-sm font-medium text-white">{a.name}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{a.posts.toLocaleString('fa-IR')}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#00BCD4' }}>{a.views.toLocaleString('fa-IR')}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {Math.round(a.views / Math.max(a.posts, 1)).toLocaleString('fa-IR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
