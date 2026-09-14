/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Services CMS Admin - Special Management Components
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import {
  Save,
  Upload,
  Search,
  Trash2,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Copy,
  ExternalLink,
  Globe,
  Tag,
  Share2,
  Layout,
} from 'lucide-react';
import { seoSettingsApi, mediaAssetsApi } from '@/lib/cmsApi';
import { SEOSettings, MediaAsset, MediaType } from '@/types/servicesCms';

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function HeroSectionManager() {
  const [hero, setHero] = useState({
    title: 'خدمات حرفه‌ای برای کسب‌وکار شما',
    subtitle: 'ما بهترین راهکارها را ارائه می‌دهیم',
    description: 'با تیم متخصص ما، به اهداف تجاری خود برسید',
    ctaText: 'شروع کنید',
    ctaLink: '#contact',
    secondaryCtaText: 'بیشتر بدانید',
    secondaryCtaLink: '#services',
    backgroundImage: '',
    overlayOpacity: 0.5,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      // Save to localStorage for now - can be connected to API later
      localStorage.setItem('services-hero', JSON.stringify(hero));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save hero:', error);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('services-hero');
    if (saved) {
      setHero(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">تنظیمات بخش Hero</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="عنوان اصلی"
            value={hero.title}
            onChange={(e) => setHero({ ...hero, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="text"
            placeholder="زیرعنوان"
            value={hero.subtitle}
            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <textarea
            placeholder="توضیح"
            value={hero.description}
            onChange={(e) => setHero({ ...hero, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="متن دکمه اصلی"
              value={hero.ctaText}
              onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="لینک دکمه اصلی"
              value={hero.ctaLink}
              onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="متن دکمه ثانویه"
              value={hero.secondaryCtaText}
              onChange={(e) => setHero({ ...hero, secondaryCtaText: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="لینک دکمه ثانویه"
              value={hero.secondaryCtaLink}
              onChange={(e) => setHero({ ...hero, secondaryCtaLink: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <input
            type="text"
            placeholder="تصویر پس‌زمینه (URL)"
            value={hero.backgroundImage}
            onChange={(e) => setHero({ ...hero, backgroundImage: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <div>
            <label className="block text-sm text-slate-700 mb-2">شفافیت پس‌زمینه: {hero.overlayOpacity}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={hero.overlayOpacity}
              onChange={(e) => setHero({ ...hero, overlayOpacity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> ذخیره تنظیمات
          </button>
          {saved && <span className="text-green-600 font-medium">✓ تنظیمات ذخیره شد</span>}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">پیش‌نمایش</h3>
        <div
          className="relative rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center text-center p-8"
          style={{
            backgroundImage: hero.backgroundImage ? `url(${hero.backgroundImage})` : 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            className="absolute inset-0 bg-slate-900"
            style={{ opacity: hero.overlayOpacity }}
          />
          <div className="relative z-10 text-white">
            <h2 className="text-4xl font-black mb-2">{hero.title}</h2>
            <p className="text-xl mb-4">{hero.subtitle}</p>
            <p className="text-lg mb-6 opacity-90">{hero.description}</p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition">
                {hero.ctaText}
              </button>
              <button className="px-6 py-3 bg-white text-slate-800 rounded-lg hover:bg-slate-100 transition">
                {hero.secondaryCtaText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO SETTINGS MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function SEOSettingsManager() {
  const [settings, setSettings] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await seoSettingsApi.get();
      setSettings(
        data || {
          id: '',
          metaTitle: '',
          metaDescription: '',
          keywords: [],
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
          twitterCard: 'summary_large_image',
          twitterTitle: '',
          twitterDescription: '',
          twitterImage: '',
          canonical: '',
          robots: 'index,follow',
          schemas: {
            serviceSchema: false,
            faqSchema: false,
            breadcrumb: false,
            organization: false,
            review: false,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to load SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      await seoSettingsApi.update(settings, 'user-id');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save SEO settings:', error);
    }
  };

  if (!settings) return <div>درحال بارگذاری...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5" /> تنظیمات SEO
        </h2>

        {/* Meta Tags */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Meta Tags
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Meta Title"
                value={settings.metaTitle}
                onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <textarea
                placeholder="Meta Description"
                value={settings.metaDescription}
                onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={3}
              />
              <input
                type="text"
                placeholder="Keywords (جدا شده با کاما)"
                value={settings.keywords.join(', ')}
                onChange={(e) => setSettings({ ...settings, keywords: e.target.value.split(',').map(k => k.trim()) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="Canonical URL"
                value={settings.canonical ?? ''}
                onChange={(e) => setSettings({ ...settings, canonical: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <select
                value={settings.robots}
                onChange={(e) => setSettings({ ...settings, robots: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="index,follow">index,follow</option>
                <option value="noindex,follow">noindex,follow</option>
                <option value="index,nofollow">index,nofollow</option>
                <option value="noindex,nofollow">noindex,nofollow</option>
              </select>
            </div>
          </div>

          {/* Open Graph */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Open Graph
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="OG Title"
                value={settings.ogTitle}
                onChange={(e) => setSettings({ ...settings, ogTitle: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <textarea
                placeholder="OG Description"
                value={settings.ogDescription}
                onChange={(e) => setSettings({ ...settings, ogDescription: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={3}
              />
              <input
                type="text"
                placeholder="OG Image URL"
                value={settings.ogImage}
                onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Twitter Card */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Twitter Card
            </h3>
            <div className="space-y-4">
              <select
                value={settings.twitterCard}
                onChange={(e) => setSettings({ ...settings, twitterCard: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="summary">summary</option>
                <option value="summary_large_image">summary_large_image</option>
                <option value="app">app</option>
                <option value="player">player</option>
              </select>
              <input
                type="text"
                placeholder="Twitter Title"
                value={settings.twitterTitle}
                onChange={(e) => setSettings({ ...settings, twitterTitle: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <textarea
                placeholder="Twitter Description"
                value={settings.twitterDescription}
                onChange={(e) => setSettings({ ...settings, twitterDescription: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={3}
              />
              <input
                type="text"
                placeholder="Twitter Image URL"
                value={settings.twitterImage}
                onChange={(e) => setSettings({ ...settings, twitterImage: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Schema */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Layout className="w-4 h-4" /> Schema.org JSON-LD
            </h3>
            <textarea
              placeholder="Schema JSON-LD"
              value={JSON.stringify(settings.schemas ?? {}, null, 2)}
              onChange={(e) => {
                try { setSettings({ ...settings, schemas: JSON.parse(e.target.value) }); } catch { /* ignore invalid JSON */ }
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
              rows={8}
            />
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> ذخیره تنظیمات
          </button>
          {saved && <span className="text-green-600 font-medium">✓ تنظیمات ذخیره شد</span>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA LIBRARY MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function MediaLibraryManager() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaType | ''>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await mediaAssetsApi.list();
      setAssets(data);
    } catch (error) {
      console.error('Failed to load media assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // In a real implementation, you would upload to Supabase Storage
      // For now, we'll create a mock asset
      const mockAsset: Omit<MediaAsset, 'id' | 'createdAt' | 'updatedAt'> = {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? MediaType.IMAGE : file.type.startsWith('video/') ? MediaType.VIDEO : MediaType.DOCUMENT,
        size: file.size,
        mimeType: file.type,
        alt: file.name,
        folder: '',
        uploadedBy: 'user-id',
      };
      await mediaAssetsApi.create(mockAsset, 'user-id');
      loadAssets();
    } catch (error) {
      console.error('Failed to upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await mediaAssetsApi.delete(id, 'user-id');
      loadAssets();
      if (selectedAsset?.id === id) setSelectedAsset(null);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const filteredAssets = assets.filter(
    (asset) =>
      (!searchQuery || asset.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!typeFilter || asset.type === typeFilter)
  );

  const getTypeIcon = (type: MediaType) => {
    switch (type) {
      case MediaType.IMAGE:
        return <ImageIcon className="w-5 h-5" />;
      case MediaType.VIDEO:
        return <Video className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">همه انواع</option>
          <option value="image">تصویر</option>
          <option value="video">ویدیو</option>
          <option value="audio">صوتی</option>
          <option value="document">سند</option>
        </select>

        <label className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>آپلود</span>
          <input type="file" onChange={handleUpload} className="hidden" />
        </label>

        {uploading && <span className="text-slate-600">درحال آپلود...</span>}
      </div>

      <div className="flex gap-4">
        {/* Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className={`bg-white rounded-lg shadow overflow-hidden cursor-pointer transition ${
                  selectedAsset?.id === asset.id ? 'ring-2 ring-cyan-500' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="aspect-square bg-slate-100 flex items-center justify-center">
                  {asset.type === 'image' ? (
                    <img src={asset.url} alt={asset.alt || asset.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400">{getTypeIcon(asset.type)}</div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium text-slate-800 truncate">{asset.name}</p>
                  <p className="text-xs text-slate-500">{formatSize(asset.size)}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
              هیچ مدیایی یافت نشد
            </div>
          )}
        </div>

        {/* Details Panel */}
        {selectedAsset && (
          <div className="w-80 bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-slate-800 mb-4">جزئیات</h3>

            {selectedAsset.type === 'image' && (
              <img
                src={selectedAsset.url}
                alt={selectedAsset.alt || selectedAsset.name}
                className="w-full rounded-lg mb-4"
              />
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">نام</label>
                <p className="font-medium text-slate-800">{selectedAsset.name}</p>
              </div>

              <div>
                <label className="text-sm text-slate-600">نوع</label>
                <p className="font-medium text-slate-800">{selectedAsset.type}</p>
              </div>

              <div>
                <label className="text-sm text-slate-600">حجم</label>
                <p className="font-medium text-slate-800">{formatSize(selectedAsset.size)}</p>
              </div>

              <div>
                <label className="text-sm text-slate-600">MIME Type</label>
                <p className="font-medium text-slate-800 text-xs">{selectedAsset.mimeType}</p>
              </div>

              <div>
                <label className="text-sm text-slate-600">URL</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={selectedAsset.url}
                    readOnly
                    className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs bg-slate-50"
                  />
                  <button
                    onClick={() => handleCopyUrl(selectedAsset.url)}
                    className="p-1 hover:bg-slate-100 rounded"
                    title="کپی"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={selectedAsset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-slate-100 rounded"
                    title="باز کردن"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-600">Alt Text</label>
                <input
                  type="text"
                  value={selectedAsset.alt || ''}
                  onChange={async (e) => {
                    await mediaAssetsApi.update(selectedAsset.id, { alt: e.target.value }, 'user-id');
                    setSelectedAsset({ ...selectedAsset, alt: e.target.value });
                  }}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Caption</label>
                <input
                  type="text"
                  value={selectedAsset.caption || ''}
                  onChange={async (e) => {
                    await mediaAssetsApi.update(selectedAsset.id, { caption: e.target.value }, 'user-id');
                    setSelectedAsset({ ...selectedAsset, caption: e.target.value });
                  }}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm mt-1"
                />
              </div>

              <button
                onClick={() => handleDelete(selectedAsset.id)}
                className="w-full px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> حذف
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default {
  HeroSectionManager,
  SEOSettingsManager,
  MediaLibraryManager,
};
