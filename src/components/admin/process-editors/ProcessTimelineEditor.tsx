/**
 * Process Timeline Section Editor
 */

import { useState } from 'react';
import { Plus, Trash2, Clock, ArrowUp, ArrowDown } from 'lucide-react';

interface ProcessTimelineEditorProps {
  onSave: () => void;
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;
}

export default function ProcessTimelineEditor({ hasChanges, setHasChanges }: ProcessTimelineEditorProps) {
  const [timelineData, setTimelineData] = useState({
    enabled: true,
    title: 'مراحل اجرای پروژه',
    description: 'مسیر کامل اجرای پروژه از مشاوره اولیه تا تحویل نهایی',
    variant: 'vertical',
    steps: [
      {
        id: 'step-1',
        order: 1,
        number: 1,
        title: 'مشاوره و تحلیل نیاز',
        description: 'بررسی کامل نیازها و اهداف پروژه',
        detailedDescription: 'در این مرحله، تیم ما با شما جلسه مشاوره برگزار کرده و نیازها، اهداف، و بودجه پروژه را به دقت بررسی می‌کند.',
        icon: '💡',
        duration: '1-2 هفته',
        milestone: true,
      },
      {
        id: 'step-2',
        order: 2,
        number: 2,
        title: 'طراحی و برنامه‌ریزی',
        description: 'طراحی کامل راهکار و برنامه‌ریزی اجرایی',
        detailedDescription: 'بر اساس تحلیل نیازها، راهکار جامع طراحی شده و برنامه اجرایی دقیق تهیه می‌شود.',
        icon: '📋',
        duration: '2-3 هفته',
        milestone: true,
      },
    ],
  });

  const handleChange = (path: string, value: any) => {
    setTimelineData(prev => {
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

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...timelineData.steps];
    if (direction === 'up' && index > 0) {
      [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
    } else if (direction === 'down' && index < newSteps.length - 1) {
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    }
    handleChange('steps', newSteps);
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
              checked={timelineData.enabled}
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
          <Clock className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-800">عنوان و توضیحات</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان</label>
            <input
              type="text"
              value={timelineData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
            <textarea
              value={timelineData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع نمایش</label>
            <select
              value={timelineData.variant}
              onChange={(e) => handleChange('variant', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="vertical">عمودی</option>
              <option value="horizontal">افقی</option>
              <option value="responsive">ریسپانسیو</option>
            </select>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">مراحل</h3>
          <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium">
            <Plus className="w-4 h-4" />
            افزودن مرحله
          </button>
        </div>
        
        <div className="space-y-4">
          {timelineData.steps.map((step, index) => (
            <div key={step.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-800">مرحله {index + 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === timelineData.steps.length - 1}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const newSteps = [...timelineData.steps];
                      newSteps[index].title = e.target.value;
                      handleChange('steps', newSteps);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات کوتاه</label>
                  <input
                    type="text"
                    value={step.description}
                    onChange={(e) => {
                      const newSteps = [...timelineData.steps];
                      newSteps[index].description = e.target.value;
                      handleChange('steps', newSteps);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات کامل</label>
                  <textarea
                    value={step.detailedDescription}
                    onChange={(e) => {
                      const newSteps = [...timelineData.steps];
                      newSteps[index].detailedDescription = e.target.value;
                      handleChange('steps', newSteps);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">آیکون (ایموجی)</label>
                    <input
                      type="text"
                      value={step.icon}
                      onChange={(e) => {
                        const newSteps = [...timelineData.steps];
                        newSteps[index].icon = e.target.value;
                        handleChange('steps', newSteps);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان</label>
                    <input
                      type="text"
                      value={step.duration}
                      onChange={(e) => {
                        const newSteps = [...timelineData.steps];
                        newSteps[index].duration = e.target.value;
                        handleChange('steps', newSteps);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={step.milestone}
                    onChange={(e) => {
                      const newSteps = [...timelineData.steps];
                      newSteps[index].milestone = e.target.checked;
                      handleChange('steps', newSteps);
                    }}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <label className="text-sm text-gray-700">این مرحله یک نقطه عطف است</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
