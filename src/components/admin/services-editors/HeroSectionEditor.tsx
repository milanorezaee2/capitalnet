// ─── Hero Section Editor ───────────────────────────────────────────────────────────────
// Rich text editor for the Hero section with live preview

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Link,
  Image as ImageIcon,
  Video,
  Code,
  Sparkles,
  Eye,
  Save,
  RefreshCw,
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react';

interface HeroSectionData {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trustBadges: string[];
  stats: Array<{
    label: string;
    value: string;
  }>;
  backgroundImage?: string;
}

interface HeroSectionEditorProps {
  data: HeroSectionData;
  onChange: (data: HeroSectionData) => void;
  onSave?: () => void;
  previewMode?: boolean;
}

export default function HeroSectionEditor({
  data,
  onChange,
  onSave,
  previewMode = false,
}: HeroSectionEditorProps) {
  const [localData, setLocalData] = useState<HeroSectionData>(data);
  const [showPreview, setShowPreview] = useState(previewMode);
  const [activeToolbar, setActiveToolbar] = useState(false);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleChange = (field: keyof HeroSectionData, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange(newData);
  };

  const addTrustBadge = () => {
    handleChange('trustBadges', [...localData.trustBadges, '']);
  };

  const removeTrustBadge = (index: number) => {
    handleChange('trustBadges', localData.trustBadges.filter((_, i) => i !== index));
  };

  const updateTrustBadge = (index: number, value: string) => {
    const newBadges = [...localData.trustBadges];
    newBadges[index] = value;
    handleChange('trustBadges', newBadges);
  };

  const addStat = () => {
    handleChange('stats', [...localData.stats, { label: '', value: '' }]);
  };

  const removeStat = (index: number) => {
    handleChange('stats', localData.stats.filter((_, i) => i !== index));
  };

  const updateStat = (index: number, field: 'label' | 'value', value: string) => {
    const newStats = [...localData.stats];
    newStats[index][field] = value;
    handleChange('stats', newStats);
  };

  if (showPreview) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <Eye className="w-5 h-5" />
            <span className="font-medium">پیش‌نمایش زنده</span>
          </div>
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {localData.eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
              {localData.eyebrow}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            {localData.title || 'عنوان اصلی'}
          </h1>
          {localData.subtitle && (
            <p className="text-xl font-semibold text-cyan-200">
              {localData.subtitle}
            </p>
          )}
          <p className="text-lg leading-relaxed text-slate-300">
            {localData.description || 'توضیحات بخش معرفی'}
          </p>

          <div className="flex flex-wrap gap-3">
            {localData.ctaPrimary && (
              <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                {localData.ctaPrimary}
              </button>
            )}
            {localData.ctaSecondary && (
              <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors">
                {localData.ctaSecondary}
              </button>
            )}
          </div>

          {localData.trustBadges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {localData.trustBadges.map((badge, index) => (
                badge && (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm text-slate-300"
                  >
                    {badge}
                  </span>
                )
              ))}
            </div>
          )}

          {localData.stats.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {localData.stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
                >
                  <p className="text-2xl font-black">{stat.value || '0'}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label || 'لیبل'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900">ویرایش بخش معرفی</h3>
            <p className="text-sm text-neutral-500">Hero Section</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            پیش‌نمایش
          </button>
          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              ذخیره
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Right Column - Text Fields */}
        <div className="space-y-6">
          {/* Eyebrow */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              متن بالای عنوان (Eyebrow)
            </label>
            <input
              type="text"
              value={localData.eyebrow}
              onChange={(e) => handleChange('eyebrow', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="مثال: راهکارهای توسعه و رشد دیجیتال"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              عنوان اصلی *
            </label>
            <input
              type="text"
              value={localData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-bold"
              placeholder="عنوان اصلی صفحه"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              زیرعنوان
            </label>
            <input
              type="text"
              value={localData.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="زیرعنوان"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              توضیحات *
            </label>
            <div className="border border-neutral-300 rounded-lg overflow-hidden">
              {/* Toolbar */}
              <div className="bg-neutral-50 border-b border-neutral-300 px-3 py-2 flex items-center gap-1">
                <button
                  onClick={() => setActiveToolbar(!activeToolbar)}
                  className="p-2 hover:bg-neutral-200 rounded transition-colors"
                  title="باز/بسته کردن نوار ابزار"
                >
                  <Type className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {activeToolbar && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1"
                    >
                      <div className="w-px h-6 bg-neutral-300 mx-1" />
                      <button className="p-2 hover:bg-neutral-200 rounded transition-colors" title="بولد">
                        <Bold className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-neutral-200 rounded transition-colors" title="ایتالیک">
                        <Italic className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-neutral-200 rounded transition-colors" title="زیرخط">
                        <Underline className="w-4 h-4" />
                      </button>
                      <div className="w-px h-6 bg-neutral-300 mx-1" />
                      <button className="p-2 hover:bg-neutral-200 rounded transition-colors" title="لیست">
                        <List className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-neutral-200 rounded transition-colors" title="لیست شماره‌دار">
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      <div className="w-px h-6 bg-neutral-300 mx-1" />
                      <button className="p-2 hover:bg-neutral-200 rounded transition-colors" title="لینک">
                        <Link className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-neutral-200 rounded transition-colors" title="تصویر">
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <textarea
                value={localData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 focus:outline-none resize-none"
                placeholder="توضیحات کامل بخش معرفی را وارد کنید..."
              />
            </div>
          </div>
        </div>

        {/* Left Column - CTAs and Stats */}
        <div className="space-y-6">
          {/* CTA Buttons */}
          <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
            <h4 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Type className="w-4 h-4" />
              دکمه‌های CTA
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  دکمه اصلی
                </label>
                <input
                  type="text"
                  value={localData.ctaPrimary}
                  onChange={(e) => handleChange('ctaPrimary', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="مثال: درخواست مشاوره رایگان"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  دکمه ثانویه
                </label>
                <input
                  type="text"
                  value={localData.ctaSecondary}
                  onChange={(e) => handleChange('ctaSecondary', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="مثال: مشاهده نمونه‌کارها"
                />
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                نشان‌های اعتماد
              </h4>
              <button
                onClick={addTrustBadge}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4" />
                افزودن
              </button>
            </div>
            <div className="space-y-2">
              {localData.trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-neutral-400 cursor-move" />
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => updateTrustBadge(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="نشان اعتماد"
                  />
                  <button
                    onClick={() => removeTrustBadge(index)}
                    className="p-2 text-error-500 hover:bg-error-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {localData.trustBadges.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-4">
                  هیچ نشان اعتمادی اضافه نشده است
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-neutral-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                آمار و ارقام
              </h4>
              <button
                onClick={addStat}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4" />
                افزودن
              </button>
            </div>
            <div className="space-y-3">
              {localData.stats.map((stat, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-bold"
                    placeholder="مقدار"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="لیبل"
                    />
                    <button
                      onClick={() => removeStat(index)}
                      className="p-2 text-error-500 hover:bg-error-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {localData.stats.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-4">
                  هیچ آماری اضافه نشده است
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
