/**
 * Process Schedule Section Editor
 */

import { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface ProcessScheduleEditorProps {
  onSave: () => void;
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;
}

export default function ProcessScheduleEditor({ hasChanges, setHasChanges }: ProcessScheduleEditorProps) {
  const [scheduleData, setScheduleData] = useState({
    enabled: true,
    title: 'زمان‌بندی پروژه',
    description: 'برنامه زمانی کامل اجرای پروژه',
    totalDuration: '8-12 هفته',
    ganttChart: true,
  });

  const handleChange = (path: string, value: any) => {
    setScheduleData(prev => {
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
              checked={scheduleData.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-800">تنظیمات زمان‌بندی</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان</label>
            <input
              type="text"
              value={scheduleData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مدت زمان کل</label>
            <input
              type="text"
              value={scheduleData.totalDuration}
              onChange={(e) => handleChange('totalDuration', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={scheduleData.ganttChart}
              onChange={(e) => handleChange('ganttChart', e.target.checked)}
              className="w-4 h-4 text-cyan-600 rounded"
            />
            <label className="text-sm text-gray-700">نمایش نمودار گانت</label>
          </div>
        </div>
      </div>
    </div>
  );
}
