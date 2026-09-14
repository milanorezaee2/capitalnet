/**
 * Process Workflow Section Editor
 */

import { useState } from 'react';
import { Plus, Trash2, Zap } from 'lucide-react';

interface ProcessWorkflowEditorProps {
  onSave: () => void;
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;
}

export default function ProcessWorkflowEditor({ hasChanges, setHasChanges }: ProcessWorkflowEditorProps) {
  const [workflowData, setWorkflowData] = useState({
    enabled: true,
    title: 'نمودار جریان کار',
    description: 'نمایش بصری فرآیند اجرای پروژه',
    type: 'flowchart',
    layout: 'top-to-bottom',
  });

  const handleChange = (path: string, value: any) => {
    setWorkflowData(prev => {
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
              checked={workflowData.enabled}
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
          <Zap className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-800">عنوان و توضیحات</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان</label>
            <input
              type="text"
              value={workflowData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
            <textarea
              value={workflowData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Workflow Type */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">نوع نمودار</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع</label>
            <select
              value={workflowData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="flowchart">فلوچارت</option>
              <option value="pipeline">پایپ‌لاین</option>
              <option value="roadmap">رودمپ</option>
              <option value="circular">دایره‌ای</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">چیدمان</label>
            <select
              value={workflowData.layout}
              onChange={(e) => handleChange('layout', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="top-to-bottom">از بالا به پایین</option>
              <option value="left-to-right">از چپ به راست</option>
              <option value="right-to-left">از راست به چپ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Placeholder for node editor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">گره‌ها (Nodes)</h3>
          <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium">
            <Plus className="w-4 h-4" />
            افزودن گره
          </button>
        </div>
        
        <div className="p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
          <p className="text-gray-500">ویرایشگر گره‌ها به زودی...</p>
        </div>
      </div>
    </div>
  );
}
