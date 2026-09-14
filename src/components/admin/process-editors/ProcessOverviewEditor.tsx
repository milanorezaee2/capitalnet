/**
 * Process Overview Section Editor
 */

import { useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';

interface ProcessOverviewEditorProps {
  onSave: () => void;
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;
}

export default function ProcessOverviewEditor({ hasChanges, setHasChanges }: ProcessOverviewEditorProps) {
  const [overviewData, setOverviewData] = useState({
    enabled: true,
    title: 'معرفی فرآیند همکاری',
    description: 'فرآیند جامع و استاندارد برای اجرای پروژه‌های موفق با کیفیت بالا و در زمان مقرر',
    objectives: [
      'تضمین کیفیت بالای خروجی نهایی',
      'شفافیت کامل در تمام مراحل پروژه',
      'ارتباط مداوم با مشتری',
      'تحویل به موقع پروژه',
    ],
    methodology: 'ما از متدولوژی Agile ترکیب با بهترین شیوه‌های مدیریت پروژه استفاده می‌کنیم.',
    benefits: [
      'کاهش ریسک و خطا در اجرا',
      'بهینه‌سازی زمان و هزینه',
      'افزایش شفافیت و اعتماد',
      'تضمین کیفیت نهایی',
    ],
    valueProposition: 'با فرآیند استاندارد ما، پروژه شما نه تنها با کیفیت بالا تحویل می‌شود، بلکه تجربه‌ای روان و حرفه‌ای را نیز خواهید داشت.',
  });

  const handleChange = (path: string, value: any) => {
    setOverviewData(prev => {
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
      {/* Enable/Disable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">فعال/غیرفعال کردن بخش</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={overviewData.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" />
          </label>
        </div>
      </div>

      {/* Title and Description */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-800">عنوان و توضیحات</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان</label>
            <input
              type="text"
              value={overviewData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
            <textarea
              value={overviewData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">اهداف</h3>
        <div className="space-y-3">
          {overviewData.objectives.map((objective, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={objective}
                onChange={(e) => {
                  const newObjectives = [...overviewData.objectives];
                  newObjectives[index] = e.target.value;
                  handleChange('objectives', newObjectives);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button className="p-2 text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium">
            <Plus className="w-4 h-4" />
            افزودن هدف
          </button>
        </div>
      </div>

      {/* Methodology */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">متدولوژی</h3>
        <textarea
          value={overviewData.methodology}
          onChange={(e) => handleChange('methodology', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Benefits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">مزایا</h3>
        <div className="space-y-3">
          {overviewData.benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => {
                  const newBenefits = [...overviewData.benefits];
                  newBenefits[index] = e.target.value;
                  handleChange('benefits', newBenefits);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button className="p-2 text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium">
            <Plus className="w-4 h-4" />
            افزودن مزیت
          </button>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">ارزش پیشنهادی</h3>
        <textarea
          value={overviewData.valueProposition}
          onChange={(e) => handleChange('valueProposition', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
