// ─── Enterprise Blog CMS — Blog Settings ─────────────────────────────────────
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Settings, Eye, Bell, BookOpen, Heart } from 'lucide-react';
import { fetchBlogSettings, saveBlogSettings } from '../api';
import type { BlogSettings } from '../types';

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}
function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <p className="text-sm text-white">{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{description}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
        style={{ background: value ? '#00BCD4' : 'rgba(255,255,255,0.15)' }}>
        <span className="absolute top-1 transition-all w-4 h-4 rounded-full bg-white shadow"
          style={{ right: value ? '4px' : 'auto', left: value ? 'auto' : '4px' }} />
      </button>
    </div>
  );
}

export default function CMSSettingsPage() {
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { fetchBlogSettings().then(s => { setSettings(s); setLoading(false); }); }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await saveBlogSettings(settings);
    setSaving(false);
    showToast('تنظیمات ذخیره شد');
  };

  const set = (k: keyof BlogSettings, v: any) => setSettings(s => s ? { ...s, [k]: v } : s);

  const inputSt = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
  const inputCls = 'px-3 py-2 rounded-xl text-sm text-white outline-none';

  if (loading || !settings) return (
    <div className="flex items-center justify-center py-16">
      <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );

  const sections = [
    {
      title: 'نمایش محتوا', icon: <Eye size={16} />, rows: [
        { key: 'show_author',    label: 'نمایش نویسنده',            description: 'نام و تصویر نویسنده در مقاله' },
        { key: 'show_date',      label: 'نمایش تاریخ',              description: 'تاریخ انتشار مقاله' },
        { key: 'show_read_time', label: 'نمایش زمان مطالعه',        description: 'مدت تخمینی مطالعه' },
        { key: 'show_views',     label: 'نمایش بازدید',             description: 'تعداد بازدیدهای مقاله' },
        { key: 'show_share',     label: 'نمایش دکمه اشتراک‌گذاری', description: 'دکمه‌های شبکه‌های اجتماعی' },
      ] as Array<{ key: keyof BlogSettings; label: string; description?: string }>,
    },
    {
      title: 'تعامل کاربران', icon: <Heart size={16} />, rows: [
        { key: 'show_like',       label: 'دکمه لایک',             description: 'کاربران بتوانند لایک کنند' },
        { key: 'comments_enabled', label: 'نظرات',               description: 'سیستم نظردهی فعال باشد' },
        { key: 'bookmarks_enabled', label: 'بوکمارک',            description: 'کاربران مقاله را ذخیره کنند' },
        { key: 'ratings_enabled',   label: 'امتیازدهی',          description: 'کاربران به مقاله امتیاز دهند' },
      ] as Array<{ key: keyof BlogSettings; label: string; description?: string }>,
    },
    {
      title: 'مقالات مرتبط', icon: <BookOpen size={16} />, rows: [
        { key: 'show_related',   label: 'مقالات مرتبط',         description: 'نمایش مقالات مشابه' },
        { key: 'show_prev_next', label: 'مقاله قبلی/بعدی',      description: 'ناوبری بین مقالات' },
        { key: 'show_newsletter', label: 'خبرنامه',              description: 'فرم عضویت در خبرنامه' },
      ] as Array<{ key: keyof BlogSettings; label: string; description?: string }>,
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl" dir="rtl">
      {/* Toast */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
          {toast}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">تنظیمات بلاگ</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>پیکربندی کلی سیستم بلاگ</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          ذخیره
        </button>
      </div>

      {/* General Settings */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Settings size={16} style={{ color: '#00BCD4' }} />
          <h2 className="text-sm font-semibold text-white">تنظیمات عمومی</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>تعداد مقالات در هر صفحه</label>
            <input type="number" min={1} max={50} value={settings.posts_per_page}
              onChange={e => set('posts_per_page', +e.target.value)}
              className={`${inputCls} w-full`} style={inputSt} />
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>قالب نمایش بلاگ</label>
            <select value={settings.blog_layout} onChange={e => set('blog_layout', e.target.value)}
              className={`${inputCls} w-full`} style={inputSt}>
              <option value="grid">شبکه‌ای (Grid)</option>
              <option value="list">لیستی (List)</option>
              <option value="masonry">ماسونری</option>
            </select>
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>تأیید نظرات</label>
            <select value={settings.comments_moderation} onChange={e => set('comments_moderation', e.target.value)}
              className={`${inputCls} w-full`} style={inputSt}>
              <option value="manual">دستی — نظرات باید تأیید شوند</option>
              <option value="auto">خودکار — نظرات مستقیم نمایش داده می‌شوند</option>
            </select>
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>سئو خودکار</label>
            <select value={settings.auto_seo ? '1' : '0'} onChange={e => set('auto_seo', e.target.value === '1')}
              className={`${inputCls} w-full`} style={inputSt}>
              <option value="1">فعال — پیشنهاد خودکار عنوان و توضیح</option>
              <option value="0">غیرفعال — تنظیم دستی</option>
            </select>
          </div>
        </div>
      </div>

      {/* Newsletter Settings */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Bell size={16} style={{ color: '#f59e0b' }} />
          <h2 className="text-sm font-semibold text-white">خبرنامه</h2>
        </div>
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>عنوان بخش خبرنامه</label>
          <input value={settings.newsletter_title ?? ''} onChange={e => set('newsletter_title', e.target.value)}
            placeholder="عضویت در خبرنامه" className={`${inputCls} w-full`} style={inputSt} />
        </div>
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>توضیحات خبرنامه</label>
          <textarea value={settings.newsletter_description ?? ''} onChange={e => set('newsletter_description', e.target.value)}
            rows={2} placeholder="جدیدترین مقالات را در ایمیل خود دریافت کنید"
            className={`${inputCls} w-full resize-none`} style={inputSt} />
        </div>
      </div>

      {/* Toggle Sections */}
      {sections.map(section => (
        <div key={section.title} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-2">
            {section.icon}
            <h2 className="text-sm font-semibold text-white">{section.title}</h2>
          </div>
          <div>
            {section.rows.map(row => (
              <ToggleRow key={row.key} label={row.label} description={row.description}
                value={settings[row.key] as boolean}
                onChange={v => set(row.key, v)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
