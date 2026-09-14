/**
 * Process Related Services Section Editor
 */

import { useState } from 'react';
import { Layers } from 'lucide-react';

interface ProcessRelatedServicesEditorProps {
  onSave: () => void;
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;
}

export default function ProcessRelatedServicesEditor({ hasChanges, setHasChanges }: ProcessRelatedServicesEditorProps) {
  const [servicesData, setServicesData] = useState({
    enabled: true,
    title: 'خدمات مرتبط',
    description: 'سایر خدمات ما که ممکن است برای شما مفید باشد',
  });

  const handleChange = (path: string, value: any) => {
    setServicesData(prev => {
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">فعال/غیرفعال کردن بخش</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={servicesData.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-800">تنظیمات خدمات مرتبط</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان</label>
            <input
              type="text"
              value={servicesData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
            <textarea
              value={servicesData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
