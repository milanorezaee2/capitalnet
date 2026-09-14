/**
 * Process Deliverables Section Editor
 */

import { useState } from 'react';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

interface ProcessDeliverablesEditorProps {
  onSave: () => void;
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;
}

export default function ProcessDeliverablesEditor({ hasChanges, setHasChanges }: ProcessDeliverablesEditorProps) {
  const [deliverablesData, setDeliverablesData] = useState({
    enabled: true,
    title: 'خروجی‌های پروژه',
    description: 'محصولات و تحویل‌های هر مرحله از پروژه',
    deliverables: [
      {
        id: 'del-1',
        title: 'تحلیل نیازها',
        description: 'مستند کامل تحلیل نیازها و اهداف پروژه',
        type: 'document',
        format: 'PDF',
        included: true,
      },
    ],
  });

  const handleChange = (path: string, value: any) => {
    setDeliverablesData(prev => {
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
              checked={deliverablesData.enabled}
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
          <CheckCircle className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-800">عنوان و توضیحات</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان</label>
            <input
              type="text"
              value={deliverablesData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
            <textarea
              value={deliverablesData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Deliverables */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">خروجی‌ها</h3>
          <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium">
            <Plus className="w-4 h-4" />
            افزودن خروجی
          </button>
        </div>
        
        <div className="space-y-4">
          {deliverablesData.deliverables.map((item, index) => (
            <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-800">خروجی {index + 1}</span>
                <button className="p-1 text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const newDeliverables = [...deliverablesData.deliverables];
                      newDeliverables[index].title = e.target.value;
                      handleChange('deliverables', newDeliverables);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => {
                      const newDeliverables = [...deliverablesData.deliverables];
                      newDeliverables[index].description = e.target.value;
                      handleChange('deliverables', newDeliverables);
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع</label>
                    <select
                      value={item.type}
                      onChange={(e) => {
                        const newDeliverables = [...deliverablesData.deliverables];
                        newDeliverables[index].type = e.target.value;
                        handleChange('deliverables', newDeliverables);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    >
                      <option value="document">سند</option>
                      <option value="design">طراحی</option>
                      <option value="code">کد</option>
                      <option value="training">آموزش</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">فرمت</label>
                    <input
                      type="text"
                      value={item.format}
                      onChange={(e) => {
                        const newDeliverables = [...deliverablesData.deliverables];
                        newDeliverables[index].format = e.target.value;
                        handleChange('deliverables', newDeliverables);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.included}
                    onChange={(e) => {
                      const newDeliverables = [...deliverablesData.deliverables];
                      newDeliverables[index].included = e.target.checked;
                      handleChange('deliverables', newDeliverables);
                    }}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <label className="text-sm text-gray-700">شامل در پروژه</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
