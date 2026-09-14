/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Services CMS Admin - Additional Managers
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { Save, Eye, EyeOff, Activity, Download, Filter } from 'lucide-react';
import { pageSettingsApi, activityLogApi } from '@/lib/cmsApi';
import { PageSettings, ActivityLog, ActivityAction } from '@/types/servicesCms';

// ─────────────────────────────────────────────────────────────────────────────
// PAGE SETTINGS MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function PageSettingsManager() {
  const [settings, setSettings] = useState<PageSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await pageSettingsApi.get();
      setSettings(
        data || {
          id: '',
          showBreadcrumb: true,
          showHero: true,
          showFAQ: true,
          showTeam: true,
          showPricing: true,
          showPortfolio: true,
          showContactForm: true,
          showNewsletter: true,
          showCTA: true,
          showCaseStudies: true,
          showTestimonials: true,
          showRelatedContent: true,
          sectionOrder: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to load page settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await pageSettingsApi.update(settings!, 'user-id');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const toggleSection = (key: keyof PageSettings) => {
    if (settings) {
      setSettings({
        ...settings,
        [key]: !(settings[key] as any),
      });
    }
  };

  if (!settings) return <div>درحال بارگذاری...</div>;

  const sections = [
    { key: 'showBreadcrumb' as const, label: 'نمایش Breadcrumb' },
    { key: 'showHero' as const, label: 'نمایش بخش معرفی' },
    { key: 'showFAQ' as const, label: 'نمایش سوالات متداول' },
    { key: 'showTeam' as const, label: 'نمایش اعضای تیم' },
    { key: 'showPricing' as const, label: 'نمایش قیمت‌گذاری' },
    { key: 'showPortfolio' as const, label: 'نمایش نمونه‌کارها' },
    { key: 'showContactForm' as const, label: 'نمایش فرم تماس' },
    { key: 'showNewsletter' as const, label: 'نمایش خبرنامه' },
    { key: 'showCTA' as const, label: 'نمایش فراخوان عمل' },
    { key: 'showCaseStudies' as const, label: 'نمایش مطالعات موردی' },
    { key: 'showTestimonials' as const, label: 'نمایش نظرات' },
    { key: 'showRelatedContent' as const, label: 'نمایش محتوای مرتبط' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">نمایش/پنهان بخش‌های صفحه</h2>

        <div className="space-y-3">
          {sections.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-700">{label}</span>
              <button
                onClick={() => toggleSection(key)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings[key] ? 'bg-green-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings[key] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> ذخیره تنظیمات
          </button>
          {saved && <span className="text-green-600 font-medium">✓ تنظیمات ذخیره شد</span>}
        </div>
      </div>

      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <p className="text-sm text-cyan-900">
          📌 <strong>نکته:</strong> شما می‌توانید تعیین کنید کدام بخش‌های صفحه خدمات برای بازدیدکنندگان نمایش
          داده شود.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY LOG VIEWER
// ─────────────────────────────────────────────────────────────────────────────

export function ActivityLogViewer() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState<ActivityAction | ''>('');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await activityLogApi.list(100);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: ActivityAction) => {
    const icons: Record<ActivityAction, string> = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      publish: '📤',
      archive: '📦',
      restore: '♻️',
      login: '🔓',
      logout: '🔒',
    };
    return icons[action];
  };

  const getActionColor = (action: ActivityAction) => {
    const colors: Record<ActivityAction, string> = {
      create: 'bg-green-100 text-green-700',
      update: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      publish: 'bg-purple-100 text-purple-700',
      archive: 'bg-orange-100 text-orange-700',
      restore: 'bg-cyan-100 text-cyan-700',
      login: 'bg-emerald-100 text-emerald-700',
      logout: 'bg-amber-100 text-amber-700',
    };
    return colors[action];
  };

  const filtered = activities.filter((a) => !actionFilter || a.action === actionFilter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Filter className="w-4 h-4 text-slate-600" />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as any)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">تمام فعالیت‌ها</option>
          <option value="create">ایجاد</option>
          <option value="update">بهروز‌رسانی</option>
          <option value="delete">حذف</option>
          <option value="publish">انتشار</option>
          <option value="archive">بایگانی</option>
        </select>
        <button
          onClick={() => {
            const csv = filtered
              .map(
                (a) =>
                  `${new Date(a.createdAt).toLocaleString('fa-IR')},${a.action},${a.description},${
                    a.userName
                  },${a.ipAddress || '-'}`
              )
              .join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `activity-log-${Date.now()}.csv`;
            link.click();
          }}
          className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> دانلود
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">فعالیتی برای نمایش نیست</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filtered.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-3">
                    <div className={`px-3 py-1 rounded text-sm font-medium ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{activity.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        <span>📍 {activity.userName}</span>
                        <span>🕐 {new Date(activity.createdAt).toLocaleString('fa-IR')}</span>
                        {activity.ipAddress && <span>🌐 {activity.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-slate-600 text-center py-2">
        نمایش {filtered.length} از {activities.length} فعالیت
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADVANCED STATISTICS
// ─────────────────────────────────────────────────────────────────────────────

export function AdminStatistics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">تغییرات امروز</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">12</p>
          </div>
          <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">📊</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium">محتوای منتشر شده</p>
            <p className="text-2xl font-bold text-green-900 mt-1">24</p>
          </div>
          <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">📤</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-600 font-medium">پیش‌نویس‌های در حال انجام</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">5</p>
          </div>
          <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">✏️</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600 font-medium">کاربران فعال</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">3</p>
          </div>
          <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">👥</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600 font-medium">بایگانی شده</p>
            <p className="text-2xl font-bold text-red-900 mt-1">2</p>
          </div>
          <div className="w-12 h-12 bg-red-200 rounded-lg flex items-center justify-center">📦</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-6 border border-cyan-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cyan-600 font-medium">میانگین وقت ویرایش</p>
            <p className="text-2xl font-bold text-cyan-900 mt-1">4.2 دقیقه</p>
          </div>
          <div className="w-12 h-12 bg-cyan-200 rounded-lg flex items-center justify-center">⏱️</div>
        </div>
      </div>
    </div>
  );
}

export default { PageSettingsManager, ActivityLogViewer, AdminStatistics };
