/**
 * Process SEO Section Editor
 */

import { useState } from 'react';
import { Globe } from 'lucide-react';

interface ProcessSEOEditorProps {
  onSave: () => void;
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;
}

export default function ProcessSEOEditor({ hasChanges, setHasChanges }: ProcessSEOEditorProps) {
  const [seoData, setSeoData] = useState({
    metaTitle: 'فرآیند همکاری حرفه‌ای | Capital Network',
    metaDescription: 'با فرآیند استاندارد و حرفه‌ای ما، پروژه خود را با اطمینان و کیفیت بالا پیش ببرید.',
    canonicalUrl: 'https://capitalnetwork.ir/process/enterprise-process',
    ogTitle: 'فرآیند همکاری حرفه‌ای با Capital Network',
    ogDescription: 'مسیر موفقیت پروژه شما از شروع تا تحویل با تیم متخصص ما',
    ogImage: '/images/og-process.jpg',
    noindex: false,
    nofollow: false,
  });

  const handleChange = (path: string, value: any) => {
    setSeoData(prev => {
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
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-bold text-gray-800">تنظیمات SEO</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان متا</label>
            <input
              type="text"
              value={seoData.metaTitle}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات متا</label>
            <textarea
              value={seoData.metaDescription}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL کانونیکال</label>
            <input
              type="text"
              value={seoData.canonicalUrl}
              onChange={(e) => handleChange('canonicalUrl', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان Open Graph</label>
            <input
              type="text"
              value={seoData.ogTitle}
              onChange={(e) => handleChange('ogTitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تصویر Open Graph</label>
            <input
              type="text"
              value={seoData.ogImage}
              onChange={(e) => handleChange('ogImage', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={seoData.noindex}
                onChange={(e) => handleChange('noindex', e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <label className="text-sm text-gray-700">No Index</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={seoData.nofollow}
                onChange={(e) => handleChange('nofollow', e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <label className="text-sm text-gray-700">No Follow</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
