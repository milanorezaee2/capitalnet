// ─── Enterprise Blog CMS — Dashboard ─────────────────────────────────────────
import { useState, useEffect } from 'react';
import {
  FileText, Eye, MessageSquare, Tag, Folder,
  TrendingUp, Clock, CheckCircle, AlertCircle, Calendar,
  Activity, Star, BarChart3, ArrowUpRight, Zap,
} from 'lucide-react';
import { fetchAllPosts } from '../../../lib/blogApi';
import { fetchCategories, fetchTags, fetchComments, fetchBlogAnalytics, fetchActivityLog } from '../api';
import type { BlogPostRow } from '../../../lib/blogApi';
import type { ActivityLog } from '../types';

interface CMSDashboardProps {
  onNavigate: (page: string) => void;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
  onClick?: () => void;
}

function StatCard({ label, value, icon, color, sub, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 transition-all ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, color }}>
          {icon}
        </div>
        {onClick && <ArrowUpRight size={14} style={{ color: 'rgba(255,255,255,0.25)' }} />}
      </div>
      <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString('fa-IR') : value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
    </div>
  );
}

const ACTION_COLOR: Record<string, string> = {
  create: '#22c55e', update: '#3b82f6', delete: '#ef4444',
  publish: '#00BCD4', unpublish: '#f59e0b', login: '#8b5cf6',
  logout: '#94a3b8', settings: '#f59e0b',
};
const ACTION_LABEL: Record<string, string> = {
  create: 'ایجاد', update: 'ویرایش', delete: 'حذف',
  publish: 'انتشار', unpublish: 'لغو انتشار', login: 'ورود',
  logout: 'خروج', settings: 'تنظیمات',
};

export default function CMSDashboard({ onNavigate }: CMSDashboardProps) {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [pendingComments, setPendingComments] = useState(0);
  const [catCount, setCatCount] = useState(0);
  const [tagCount, setTagCount] = useState(0);
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof fetchBlogAnalytics>> | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAllPosts(),
      fetchComments(),
      fetchComments({ status: 'pending' }),
      fetchCategories(),
      fetchTags(),
      fetchBlogAnalytics(),
      fetchActivityLog(10),
    ]).then(([ps, comments, pending, cats, tags, anal, acts]) => {
      setPosts(ps as BlogPostRow[]);
      setCommentCount(comments.length);
      setPendingComments(pending.length);
      setCatCount(cats.length);
      setTagCount(tags.length);
      setAnalytics(anal);
      setActivity(acts);
      setLoading(false);
    });
  }, []);

  const published = posts.filter(p => p.status === 'published').length;
  const drafts = posts.filter(p => p.status === 'draft').length;
  const scheduled = posts.filter(p => p.status === 'scheduled').length;
  const featured = posts.filter(p => p.featured).length;
  const totalViews = posts.reduce((s, p) => s + (p.views ?? 0), 0);
  const topPost = [...posts].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0];

  const seoGood = posts.filter(p => (p as any).seo_score >= 70).length;
  const seoHealth = posts.length > 0 ? Math.round((seoGood / posts.length) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <span className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">داشبورد بلاگ</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            نمای کلی سیستم مدیریت محتوا
          </p>
        </div>
        <button
          onClick={() => onNavigate('blog-new-post')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}
        >
          <Zap size={14} />
          پست جدید
        </button>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="کل مقالات" value={posts.length} icon={<FileText size={18} />} color="#00BCD4" onClick={() => onNavigate('blog-posts')} />
        <StatCard label="منتشر شده" value={published} icon={<CheckCircle size={18} />} color="#22c55e" sub={`${drafts} پیش‌نویس`} onClick={() => onNavigate('blog-posts')} />
        <StatCard label="پیش‌نویس" value={drafts} icon={<Clock size={18} />} color="#f59e0b" onClick={() => onNavigate('blog-drafts')} />
        <StatCard label="زمان‌بندی" value={scheduled} icon={<Calendar size={18} />} color="#8b5cf6" onClick={() => onNavigate('blog-scheduled')} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="کل بازدید" value={totalViews} icon={<Eye size={16} />} color="#06b6d4" />
        <StatCard label="نظرات" value={commentCount} icon={<MessageSquare size={16} />} color="#a78bfa"
          sub={pendingComments > 0 ? `${pendingComments} در انتظار` : undefined}
          onClick={() => onNavigate('blog-comments')} />
        <StatCard label="ویژه" value={featured} icon={<Star size={16} />} color="#f59e0b" />
        <StatCard label="دسته‌بندی" value={catCount} icon={<Folder size={16} />} color="#10b981" onClick={() => onNavigate('blog-categories')} />
        <StatCard label="برچسب" value={tagCount} icon={<Tag size={16} />} color="#f472b6" onClick={() => onNavigate('blog-tags')} />
        <StatCard label="سئو سالم" value={`${seoHealth}٪`} icon={<TrendingUp size={16} />} color={seoHealth > 70 ? '#22c55e' : '#f59e0b'} />
      </div>

      {/* Mid Row: Top Post + Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Post */}
        {topPost && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} style={{ color: '#00BCD4' }} />
              <h3 className="text-sm font-semibold text-white">محبوب‌ترین مقاله</h3>
            </div>
            <div className="flex gap-3">
              {topPost.cover_image && (
                <img src={topPost.cover_image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">{topPost.title}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs flex items-center gap-1" style={{ color: '#00BCD4' }}>
                    <Eye size={11} /> {(topPost.views ?? 0).toLocaleString('fa-IR')} بازدید
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {topPost.author_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Traffic Sources */}
        {analytics && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} style={{ color: '#8b5cf6' }} />
              <h3 className="text-sm font-semibold text-white">منابع ورودی</h3>
            </div>
            <div className="space-y-2.5">
              {analytics.trafficSources.slice(0, 4).map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.source}</span>
                    <span className="text-xs font-semibold text-white">{s.pct}٪</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.pct}%`, background: `hsl(${200 + i * 30}, 70%, 60%)` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Views Chart */}
      {analytics && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} style={{ color: '#00BCD4' }} />
              <h3 className="text-sm font-semibold text-white">بازدید ۳۰ روز اخیر</h3>
            </div>
            <button onClick={() => onNavigate('blog-analytics')} className="text-xs" style={{ color: '#00BCD4' }}>
              مشاهده کامل ←
            </button>
          </div>
          <div className="flex items-end gap-1 h-24">
            {analytics.viewsByDay.map((d, i) => {
              const maxVal = Math.max(...analytics.viewsByDay.map(x => x.views));
              const h = Math.max((d.views / maxVal) * 100, 4);
              return (
                <div key={i} title={`${d.date}: ${d.views.toLocaleString('fa-IR')}`}
                  className="flex-1 rounded-t-sm transition-all cursor-pointer hover:opacity-80"
                  style={{ height: `${h}%`, background: i === analytics.viewsByDay.length - 1 ? '#00BCD4' : 'rgba(0,188,212,0.3)' }} />
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{analytics.viewsByDay[0]?.date}</span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{analytics.viewsByDay[analytics.viewsByDay.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Bottom Row: Top Posts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Posts Table */}
        {analytics && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <TrendingUp size={15} style={{ color: '#22c55e' }} />
                <h3 className="text-sm font-semibold text-white">مقالات پربازدید</h3>
              </div>
              <button onClick={() => onNavigate('blog-analytics')} className="text-xs" style={{ color: '#00BCD4' }}>همه ←</button>
            </div>
            <div className="p-2">
              {analytics.topPosts.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: i === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)', color: i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.4)' }}>
                    {(i + 1).toLocaleString('fa-IR')}
                  </span>
                  <p className="text-xs text-white flex-1 line-clamp-1">{p.title}</p>
                  <span className="text-xs flex-shrink-0" style={{ color: '#00BCD4' }}>
                    {p.views.toLocaleString('fa-IR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <Activity size={15} style={{ color: '#a78bfa' }} />
              <h3 className="text-sm font-semibold text-white">آخرین فعالیت‌ها</h3>
            </div>
            <button onClick={() => onNavigate('blog-activity')} className="text-xs" style={{ color: '#00BCD4' }}>همه ←</button>
          </div>
          <div className="p-2">
            {activity.length === 0 ? (
              <p className="text-center py-8 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>هنوز فعالیتی ثبت نشده</p>
            ) : (
              activity.slice(0, 6).map(log => (
                <div key={log.id} className="flex items-start gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: `${ACTION_COLOR[log.action]}20` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACTION_COLOR[log.action] }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white line-clamp-1">
                      <span style={{ color: ACTION_COLOR[log.action] }}>{ACTION_LABEL[log.action]}</span>
                      {' · '}{log.resource_title || log.resource_type}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {log.user_name} · {new Date(log.created_at).toLocaleString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pending Comments Alert */}
      {pendingComments > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          onClick={() => onNavigate('blog-comments')}
        >
          <AlertCircle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <p className="text-sm" style={{ color: '#f59e0b' }}>
            {pendingComments.toLocaleString('fa-IR')} نظر در انتظار تأیید است — برای بررسی کلیک کنید
          </p>
        </div>
      )}
    </div>
  );
}
