/**
 * Process Hero Section Editor
 * WordPress-like editor for hero section
 */

import { useState } from 'react';
import { Save, Eye, Plus, Trash2, Upload, Image as ImageIcon, Type, Link2, Settings } from 'lucide-react';

interface ProcessHeroEditorProps {
  onSave: () => void;
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;
}

export default function ProcessHeroEditor({ hasChanges, setHasChanges }: ProcessHeroEditorProps) {
  const [heroData, setHeroData] = useState({
    enabled: true,
    badge: {
      enabled: true,
      text: 'فرآیند استاندارد',
      variant: 'primary',
    },
    title: 'فرآیند همکاری حرفه‌ای با شرکت ما',
    subtitle: 'مسیر موفقیت پروژه شما از شروع تا تحویل',
    description: 'با فرآیند استاندارد و حرفه‌ای ما، پروژه خود را با اطمینان و کیفیت بالا پیش ببرید.',
    primaryCTA: {
      text: 'شروع پروژه',
      url: '#contact',
      variant: 'primary',
      size: 'lg',
    },
    secondaryCTA: {
      text: 'مشاوره رایگان',
      url: '#contact',
      variant: 'outline',
      size: 'lg',
    },
    media: {
      type: 'image',
    },
    statistics: {
      enabled: true,
      items: [
        { label: 'پروژه موفق', value: '150+', prefix: '', suffix: '' },
        { label: 'رضایت مشتری', value: '98%', prefix: '', suffix: '' },
        { label: 'سال تجربه', value: '10+', prefix: '', suffix: '' },
        { label: 'تیم متخصص', value: '50+', prefix: '', suffix: '' },
      ],
    },
    background: {
      type: 'gradient',
      value: 'from-gray-900 via-gray-800 to-gray-900',
    },
  });

  const handleChange = (path: string, value: any) => {
    setHeroData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Enable/Disable Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">فعال/غیرفعال کردن بخش</h3>
            <p className="text-sm text-gray-500">این بخش را در صفحه نمایش دهید یا مخفی کنید</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={heroData.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" />
          </label>
        </div>
      </div>

      {/* Badge Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Type className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-800">تنظیمات نشانک (Badge)</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">نمایش نشانک</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={heroData.badge.enabled}
                onChange={(e) => handleChange('badge.enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" />
            </label>
          </div>
          
          {heroData.badge.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">متن نشانک</label>
                <input
                  type="text"
                  value={heroData.badge.text}
                  onChange={(e) => handleChange('badge.text', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="متن نشانک"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع نشانک</label>
                <select
                  value={heroData.badge.variant}
                  onChange={(e) => handleChange('badge.variant', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="primary">اصلی</option>
                  <option value="secondary">ثانویه</option>
                  <option value="accent">اکسنت</option>
                  <option value="success">موفقیت</option>
                  <option value="warning">هشدار</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title and Subtitle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Type className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-800">عنوان و توضیحات</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان اصلی</label>
            <input
              type="text"
              value={heroData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="عنوان اصلی"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان فرعی</label>
            <input
              type="text"
              value={heroData.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="عنوان فرعی"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
            <textarea
              value={heroData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="توضیحات"
            />
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Link2 className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-800">دکمه‌های CTA</h3>
        </div>
        
        <div className="space-y-6">
          {/* Primary CTA */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">دکمه اصلی</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">متن دکمه</label>
                <input
                  type="text"
                  value={heroData.primaryCTA.text}
                  onChange={(e) => handleChange('primaryCTA.text', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">لینک</label>
                <input
                  type="text"
                  value={heroData.primaryCTA.url}
                  onChange={(e) => handleChange('primaryCTA.url', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع</label>
                <select
                  value={heroData.primaryCTA.variant}
                  onChange={(e) => handleChange('primaryCTA.variant', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="primary">اصلی</option>
                  <option value="secondary">ثانویه</option>
                  <option value="outline">حاشیه‌دار</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">دکمه ثانویه</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">متن دکمه</label>
                <input
                  type="text"
                  value={heroData.secondaryCTA.text}
                  onChange={(e) => handleChange('secondaryCTA.text', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">لینک</label>
                <input
                  type="text"
                  value={heroData.secondaryCTA.url}
                  onChange={(e) => handleChange('secondaryCTA.url', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-cyan-600" />
            <h3 className="text-lg font-bold text-gray-800">آمار</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={heroData.statistics.enabled}
              onChange={(e) => handleChange('statistics.enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" />
          </label>
        </div>
        
        {heroData.statistics.enabled && (
          <div className="space-y-4">
            {heroData.statistics.items.map((stat, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-800">آمار {index + 1}</span>
                  <button className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">برچسب</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const newItems = [...heroData.statistics.items];
                        newItems[index].label = e.target.value;
                        handleChange('statistics.items', newItems);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">مقدار</label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const newItems = [...heroData.statistics.items];
                        newItems[index].value = e.target.value;
                        handleChange('statistics.items', newItems);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium">
              <Plus className="w-4 h-4" />
              افزودن آمار جدید
            </button>
          </div>
        )}
      </div>

      {/* Background Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ImageIcon className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-800">تنظیمات پس‌زمینه</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع پس‌زمینه</label>
            <select
              value={heroData.background.type}
              onChange={(e) => handleChange('background.type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="gradient">گرادیانت</option>
              <option value="image">تصویر</option>
              <option value="solid">رنگ ساده</option>
            </select>
          </div>
          
          {heroData.background.type === 'gradient' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">کلاس گرادیانت</label>
              <input
                type="text"
                value={heroData.background.value}
                onChange={(e) => handleChange('background.value', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="from-gray-900 via-gray-800 to-gray-900"
              />
            </div>
          )}
          
          {heroData.background.type === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تصویر پس‌زمینه</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">برای آپلود کلیک کنید یا فایل را بکشید</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
