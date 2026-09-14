/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Services CMS Admin Dashboard
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Eye,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { servicesApi, activityLogApi } from '@/lib/cmsApi';
import { ActivityLog, Service } from '@/types/servicesCms';

interface DashboardStats {
  totalServices: number;
  publishedServices: number;
  draftServices: number;
  scheduledServices: number;
  totalViews: number;
  conversionRate: number;
  formSubmissions: number;
  recentActivity: ActivityLog[];
}

export function ServicesDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalServices: 0,
    publishedServices: 0,
    draftServices: 0,
    scheduledServices: 0,
    totalViews: 0,
    conversionRate: 0,
    formSubmissions: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load services count
      const servicesList = await servicesApi.list(1, 1000);

      const published = servicesList.data.filter((s: Service) => s.status === 'published').length;
      const draft = servicesList.data.filter((s: Service) => s.status === 'draft').length;
      const scheduled = servicesList.data.filter((s: Service) => s.status === 'scheduled')
        .length;
      const totalViews = servicesList.data.reduce((sum: number, s: Service) => sum + (s.views || 0), 0);

      // Load recent activity
      const activity = await activityLogApi.list(10);

      setStats({
        totalServices: servicesList.total,
        publishedServices: published,
        draftServices: draft,
        scheduledServices: scheduled,
        totalViews,
        conversionRate: 3.8,
        formSubmissions: 124,
        recentActivity: activity,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    change,
    color,
  }: {
    icon: React.FC<any>;
    title: string;
    value: string | number;
    change?: string;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6 border-r-4" style={{ borderColor: color }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {change && <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {change}
          </p>}
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 h-24 animate-pulse bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          title="کل خدمات"
          value={stats.totalServices}
          change="+2 این ماه"
          color="#3B82F6"
        />
        <StatCard
          icon={CheckCircle2}
          title="خدمات منتشر شده"
          value={stats.publishedServices}
          change="+1"
          color="#10B981"
        />
        <StatCard
          icon={Clock}
          title="پیش‌نویس‌ها"
          value={stats.draftServices}
          color="#F59E0B"
        />
        <StatCard
          icon={Eye}
          title="کل بازدید"
          value={stats.totalViews.toLocaleString()}
          change="+12%"
          color="#8B5CF6"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Target}
          title="نرخ تبدیل"
          value={`${stats.conversionRate}%`}
          color="#EC4899"
        />
        <StatCard
          icon={Users}
          title="فرم‌های ارسال شده"
          value={stats.formSubmissions}
          change="+8"
          color="#06B6D4"
        />
        <StatCard
          icon={AlertCircle}
          title="خدمات زمان‌بندی شده"
          value={stats.scheduledServices}
          color="#EF4444"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">آخرین فعالیت‌ها</h2>
        </div>

        <div className="space-y-2">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 hover:bg-slate-50 rounded transition"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{activity.description}</p>
                  <p className="text-xs text-slate-500">توسط: {activity.userName}</p>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(activity.createdAt).toLocaleDateString('fa-IR')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-4">فعالیتی برای نمایش نیست</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg shadow p-6 text-white">
        <h2 className="text-lg font-bold mb-4">اقدامات سریع</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded transition">
            + خدمت جدید
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded transition">
            مشاهده تغییرات
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded transition">
            تنظیمات صفحه
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded transition">
            گزارش SEO
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServicesDashboard;
