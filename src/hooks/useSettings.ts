// ─── useSettings ─────────────────────────────────────────────────────────────
// تنظیمات سایت را از Supabase می‌خواند و با Realtime آپدیت می‌کند.
// هر بار که ادمین چیزی ذخیره کند، سایت بلافاصله (بدون refresh) تغییر می‌کند.
//
// ── Performance Optimisations ─────────────────────────────────────────────────
// 1. localStorage SWR cache: اولین بار از cache نمایش می‌دهد → zero blank flash
// 2. Background refresh: بعد از 5 دقیقه به‌روزرسانی بی‌صدا
// 3. Memory singleton: از duplicate fetch در StrictMode / re-mount جلوگیری می‌کند
// 4. Realtime WebSocket: فقط یک connection برای همه mount‌ها

import { useState, useEffect, useMemo } from 'react';
import { fetchSettings, DEFAULT_SETTINGS } from '../lib/settingsApi';
import { useLanguage, deepTranslate } from '../i18n';
import type { SiteSettings } from '../lib/settingsApi';
import { supabase } from '../lib/supabaseApi';

const LS_KEY   = 'cn_settings_v2';
const LS_TTL   = 5 * 60 * 1000; // 5 دقیقه TTL

// ── localStorage helpers ───────────────────────────────────────────────────
function readFromStorage(): SiteSettings | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: SiteSettings; ts: number };
    if (Date.now() - parsed.ts > LS_TTL) return null; // منقضی شده
    return parsed.data;
  } catch {
    return null;
  }
}

function writeToStorage(data: SiteSettings): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // اگر storage پر باشد، نادیده بگیر
  }
}

function invalidateStorage(): void {
  try { localStorage.removeItem(LS_KEY); } catch { /* noop */ }
}

// ── In-memory singleton ────────────────────────────────────────────────────
let _memCache: SiteSettings | null = readFromStorage();
let _fetchPromise: Promise<SiteSettings> | null = null;
let _realtimeChannel: any = null;
let _realtimeSubscriberCount = 0;

function getOrFetchSettings(): Promise<SiteSettings> {
  if (_memCache) return Promise.resolve(_memCache);
  if (_fetchPromise) return _fetchPromise;
  _fetchPromise = fetchSettings()
    .then(s => {
      _memCache = s;
      writeToStorage(s);
      _fetchPromise = null;
      return s;
    })
    .catch(() => {
      _fetchPromise = null;
      return DEFAULT_SETTINGS;
    });
  return _fetchPromise;
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useSettings(): SiteSettings {
  // اگر memory یا localStorage cache وجود دارد، بلافاصله استفاده کن — بدون flash
  const [settings, setSettings] = useState<SiteSettings>(() => _memCache ?? DEFAULT_SETTINGS);
  const { lang } = useLanguage();

  useEffect(() => {
    let mounted = true;

    const applySettings = (s: SiteSettings) => {
      _memCache = s;
      writeToStorage(s);
      if (mounted) setSettings(s);
    };

    // بارگذاری اولیه — از singleton cache استفاده کن
    getOrFetchSettings().then(s => { if (mounted) setSettings(s); });

    // ── Realtime (WebSocket) ───────────────────────────────────────────────
    // یک channel مشترک برای جلوگیری از duplicate connection در StrictMode
    _realtimeSubscriberCount += 1;

    if (!_realtimeChannel) {
      try {
        const channel = (supabase as any).channel('site-settings-live');
        channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_settings' },
          () => {
            // cache را invalidate کن تا تغییرات ادمین بلافاصله اعمال شوند
            _memCache = null;
            invalidateStorage();
            fetchSettings()
              .then(applySettings)
              .catch(() => {});
          }
        );

        channel.subscribe((status: string) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('[useSettings] Realtime subscription issue:', status);
          }
        });

        _realtimeChannel = channel;
      } catch (error) {
        console.warn('[useSettings] Unable to attach realtime channel:', error);
      }
    }

    return () => {
      mounted = false;
      _realtimeSubscriberCount = Math.max(0, _realtimeSubscriberCount - 1);

      if (_realtimeSubscriberCount === 0 && _realtimeChannel) {
        try {
          void _realtimeChannel.unsubscribe();
          (supabase as any).removeChannel(_realtimeChannel);
        } catch (error) {
          console.warn('[useSettings] Unable to remove realtime channel:', error);
        }
        _realtimeChannel = null;
      }
    };
  }, []);

  // ── ترجمهٔ محتوای تنظیمات ─────────────────────────────────────────────────
  // تنظیمات سایت از Supabase (یا مقادیر پیش‌فرض) به فارسی می‌آیند. با ترجمهٔ
  // عمیق در همین نقطه، تمام بخش‌هایی که از settings استفاده می‌کنند (منو، فوتر،
  // اطلاعات تماس، بنرها و …) بدون نیاز به تغییر جداگانه دو زبانه می‌شوند.
  const localizedSettings = useMemo(
    () => deepTranslate(settings),
    [settings, lang]
  );

  return localizedSettings;
}
