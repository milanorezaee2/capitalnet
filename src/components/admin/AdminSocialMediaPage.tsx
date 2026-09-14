// ─── Admin Social Media Page ─────────────────────────────────────────────────
// ادمین می‌تواند شبکه‌های اجتماعی شناور سایت را مدیریت کند
// حداکثر 4 آیکون نمایش داده می‌شود (جایگزین دکمه چت)

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Power, Plus, Trash2, ArrowUp, ArrowDown,
  Twitter, Linkedin, Instagram, Youtube, Facebook,
  MessageCircle, Send, Globe, AlertCircle, Eye,
} from 'lucide-react';
import { fetchSettings, saveSettings } from '../../lib/settingsApi';
import { normalizeExternalUrl } from '../../lib/urlHelpers';
import type { SiteSettings, SocialFloatItem, SocialNetwork } from '../../lib/settingsApi';

// آیکون TikTok به‌صورت SVG اینلاین (در lucide-react موجود نیست)
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.36 6.36 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.71a8.16 8.16 0 0 0 4.77 1.52V6.78a4.85 4.85 0 0 1-1-.09z"/>
    </svg>
  );
}

const MAX_FLOAT = 4;

const NETWORK_CONFIG: Record<SocialNetwork, {
  label: string;
  icon: React.ReactNode;
  color: string;
  placeholder: string;
}> = {
  twitter:   { label: 'Twitter / X',  icon: <Twitter size={18} />,        color: '#1DA1F2', placeholder: 'https://twitter.com/...' },
  linkedin:  { label: 'LinkedIn',      icon: <Linkedin size={18} />,       color: '#0A66C2', placeholder: 'https://linkedin.com/company/...' },
  instagram: { label: 'Instagram',     icon: <Instagram size={18} />,      color: '#E1306C', placeholder: 'https://instagram.com/...' },
  youtube:   { label: 'YouTube',       icon: <Youtube size={18} />,        color: '#FF0000', placeholder: 'https://youtube.com/...' },
  telegram:  { label: 'Telegram',      icon: <Send size={18} />,           color: '#2CA5E0', placeholder: 'https://t.me/...' },
  whatsapp:  { label: 'WhatsApp',      icon: <MessageCircle size={18} />,  color: '#25D366', placeholder: 'https://wa.me/...' },
  facebook:  { label: 'Facebook',      icon: <Facebook size={18} />,       color: '#1877F2', placeholder: 'https://facebook.com/...' },
  tiktok:    { label: 'TikTok',        icon: <TikTokIcon size={18} />,     color: '#010101', placeholder: 'https://tiktok.com/@...' },
};

const ALL_NETWORKS = Object.keys(NETWORK_CONFIG) as SocialNetwork[];

function NetworkIcon({ network, size = 20 }: { network: SocialNetwork; size?: number }) {
  const cfg = NETWORK_CONFIG[network];
  return (
    <span style={{ color: cfg.color }} className="flex-shrink-0">
      {network === 'twitter'   && <Twitter size={size} />}
      {network === 'linkedin'  && <Linkedin size={size} />}
      {network === 'instagram' && <Instagram size={size} />}
      {network === 'youtube'   && <Youtube size={size} />}
      {network === 'telegram'  && <Send size={size} />}
      {network === 'whatsapp'  && <MessageCircle size={size} />}
      {network === 'facebook'  && <Facebook size={size} />}
      {network === 'tiktok'    && <TikTokIcon size={size} />}
    </span>
  );
}

export default function AdminSocialMediaPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [addNetwork, setAddNetwork] = useState<SocialNetwork>('telegram');
  const [addUrl, setAddUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchSettings().then(s => { setSettings(s); setLoading(false); });
  }, []);

  const items = settings?.social_float_items ?? [];
  const enabled = settings?.social_float_enabled ?? false;
  const activeCount = items.filter(i => i.active).length;

  // ── هسته مرکزی: state + Supabase را همزمان آپدیت می‌کند ──────────────────
  // هر تغییری (add/remove/toggle/move/url) از اینجا عبور می‌کند
  const persist = async (newItems: SocialFloatItem[], newEnabled?: boolean) => {
    if (!settings) return;
    const resolvedEnabled = newEnabled !== undefined ? newEnabled : settings.social_float_enabled;
    const sanitized = newItems
      .map(item => ({ ...item, url: normalizeExternalUrl(item.url) }))
      .filter(item => item.url);

    // اول state را آپدیت کن تا UI فوری واکنش نشان دهد
    setSettings({ ...settings, social_float_items: sanitized, social_float_enabled: resolvedEnabled });

    // بعد Supabase را ذخیره کن
    const ok = await saveSettings({ social_float_items: sanitized, social_float_enabled: resolvedEnabled });
    if (!ok) setError('خطا در ذخیره‌سازی. لطفاً دوباره امتحان کنید.');
  };

  // ── دکمه «ذخیره» — برای ویرایش URL که real-time ذخیره نمی‌شود ────────────
  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    await persist(settings.social_float_items, settings.social_float_enabled);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── toggle کل ویجت ────────────────────────────────────────────────────────
  const toggleEnabled = () => persist(items, !enabled);

  // ── فعال/غیرفعال کردن یک آیتم ─────────────────────────────────────────────
  const toggleItem = (i: number) => {
    const next = items.map((item, idx) =>
      idx === i ? { ...item, active: !item.active } : item
    );
    if (next.filter(x => x.active).length > MAX_FLOAT) return;
    persist(next);
  };

  // ── حذف آیتم ──────────────────────────────────────────────────────────────
  const removeItem = (i: number) => persist(items.filter((_, idx) => idx !== i));

  // ── جابجایی ترتیب ─────────────────────────────────────────────────────────
  const moveItem = (i: number, dir: 'up' | 'down') => {
    const next = [...items];
    const target = dir === 'up' ? i - 1 : i + 1;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    persist(next);
  };

  // ── اضافه کردن شبکه جدید — فوری ذخیره می‌شود ─────────────────────────────
  const addItem = () => {
    if (!addUrl.trim()) return;
    if (items.some(x => x.network === addNetwork)) return;
    const currentActive = items.filter(x => x.active).length;
    const newItems: SocialFloatItem[] = [
      ...items,
      { network: addNetwork, url: normalizeExternalUrl(addUrl.trim()), active: currentActive < MAX_FLOAT },
    ];
    // اگر اولین آیتم است و ویجت خاموش بود، خودکار روشن کن
    const newEnabled = newItems.length === 1 && !enabled ? true : enabled;
    persist(newItems, newEnabled);
    setAddUrl('');
    setShowAddForm(false);
  };

  // ── ویرایش URL — فقط local state (ذخیره با دکمه «ذخیره») ─────────────────
  const updateUrl = (i: number, url: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      social_float_items: items.map((item, idx) => idx === i ? { ...item, url } : item),
    });
  };

  // ── loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="w-7 h-7 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl" dir="rtl">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">شبکه‌های اجتماعی شناور</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            آیکون‌هایی که در گوشه پایین سایت نمایش داده می‌شوند (جایگزین دکمه چت)
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
          style={saved
            ? { background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.4)' }
            : { background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
          {saving
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save size={14} />}
          {saving ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : 'ذخیره تغییرات'}
        </button>
      </div>

      {/* ── خطا ─────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm text-red-300 flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertCircle size={14} />{error}
        </div>
      )}

      {/* ── Toggle کلی ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: enabled ? 'rgba(0,188,212,0.12)' : 'rgba(255,255,255,0.05)' }}>
            <Globe size={18} className={enabled ? 'text-teal-400' : 'text-slate-500'} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">نمایش آیکون‌های شناور در سایت</p>
            <p className="text-xs mt-0.5">
              {enabled && activeCount > 0
                ? <span className="text-teal-400">{activeCount} آیکون فعال — در گوشه سایت نمایش داده می‌شود</span>
                : enabled && activeCount === 0
                  ? <span className="text-amber-400">⚠ هیچ آیکون فعالی وجود ندارد — ابتدا شبکه‌ای اضافه کنید</span>
                  : <span className="text-slate-500">غیرفعال — دکمه چت (اگر فعال باشد) نمایش داده می‌شود</span>}
            </p>
          </div>
        </div>
        <button
          onClick={toggleEnabled}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={enabled
            ? { background: 'rgba(0,188,212,0.15)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.3)' }
            : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <Power size={14} />
          {enabled ? 'فعال — خاموش کن' : 'غیرفعال — روشن کن'}
        </button>
      </div>

      {/* ── هشدار: فعال ولی بدون آیتم ──────────────────────────────────────── */}
      {enabled && activeCount === 0 && (
        <div className="px-4 py-3 rounded-xl text-sm text-amber-300 flex items-start gap-2"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>
            ویجت شناور <strong>فعال</strong> است ولی هیچ آیکونی اضافه نشده — در سایت نمایش داده نخواهد شد.
            از بخش پایین یک شبکه اجتماعی اضافه کنید.
          </span>
        </div>
      )}

      {/* ── ظرفیت ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-4"
        style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
        <p className="text-xs text-amber-300 flex items-center gap-2">
          <AlertCircle size={13} />
          حداکثر <strong>4 آیکون</strong> می‌توانند همزمان فعال باشند.
          فعلاً <strong>{activeCount} از {MAX_FLOAT}</strong> ظرفیت استفاده شده است.
        </p>
      </div>

      {/* ── لیست آیتم‌ها ────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">آیکون‌های اضافه‌شده</h3>

        {items.length === 0 && (
          <div className="text-center py-10 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Globe size={32} className="text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">هنوز شبکه‌ای اضافه نشده</p>
            <p className="text-slate-600 text-xs mt-1">از بخش پایین یک شبکه اجتماعی اضافه کنید</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {items.map((item, i) => {
            const cfg = NETWORK_CONFIG[item.network];
            return (
              <motion.div
                key={item.network}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                className="rounded-2xl p-4 space-y-3"
                style={{
                  background: item.active ? 'rgba(0,188,212,0.05)' : 'rgba(255,255,255,0.03)',
                  border: item.active ? '1px solid rgba(0,188,212,0.2)' : '1px solid rgba(255,255,255,0.07)',
                }}>
                <div className="flex items-center justify-between gap-3">
                  {/* اطلاعات شبکه */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}40` }}>
                      <NetworkIcon network={item.network} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{cfg.label}</p>
                      <p className="text-xs mt-0.5">
                        {item.active
                          ? <span className="text-teal-400">● فعال</span>
                          : <span className="text-slate-600">○ غیرفعال</span>}
                      </p>
                    </div>
                  </div>

                  {/* کنترل‌ها */}
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => moveItem(i, 'up')} disabled={i === 0}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors disabled:opacity-30"
                      title="بالاتر">
                      <ArrowUp size={13} />
                    </button>
                    <button onClick={() => moveItem(i, 'down')} disabled={i === items.length - 1}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors disabled:opacity-30"
                      title="پایین‌تر">
                      <ArrowDown size={13} />
                    </button>
                    <button
                      onClick={() => toggleItem(i)}
                      disabled={!item.active && activeCount >= MAX_FLOAT}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                      style={item.active
                        ? { background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.25)' }
                        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {item.active ? 'فعال' : 'غیرفعال'}
                    </button>
                    <button
                      onClick={() => removeItem(i)}
                      className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="حذف">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* URL */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">آدرس لینک</label>
                  <input
                    value={item.url}
                    onChange={e => updateUrl(i, e.target.value)}
                    placeholder={cfg.placeholder}
                    dir="ltr"
                    className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(0,188,212,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── اضافه کردن شبکه جدید ────────────────────────────────────────────── */}
      <div>
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={items.length >= ALL_NETWORKS.length}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 disabled:opacity-40"
            style={{ background: 'rgba(0,188,212,0.08)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.18)' }}>
            <Plus size={15} />
            اضافه کردن شبکه جدید
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(0,188,212,0.04)', border: '1px solid rgba(0,188,212,0.18)' }}>
            <h3 className="text-sm font-semibold text-white">اضافه کردن شبکه جدید</h3>

            {/* انتخاب شبکه */}
            <div className="flex flex-wrap gap-2">
              {ALL_NETWORKS.filter(n => !items.some(x => x.network === n)).map(n => {
                const cfg = NETWORK_CONFIG[n];
                return (
                  <button
                    key={n}
                    onClick={() => setAddNetwork(n)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                    style={addNetwork === n
                      ? { background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}50` }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <NetworkIcon network={n} size={14} />
                    {cfg.label}
                  </button>
                );
              })}
              {ALL_NETWORKS.filter(n => !items.some(x => x.network === n)).length === 0 && (
                <p className="text-xs text-slate-500">همه شبکه‌ها اضافه شده‌اند</p>
              )}
            </div>

            {/* URL */}
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">آدرس لینک</label>
              <input
                value={addUrl}
                onChange={e => setAddUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder={NETWORK_CONFIG[addNetwork]?.placeholder ?? ''}
                dir="ltr"
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(0,188,212,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={addItem}
                disabled={!addUrl.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
                <Plus size={14} />
                اضافه کن
              </button>
              <button
                onClick={() => { setShowAddForm(false); setAddUrl(''); }}
                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
                انصراف
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── پیش‌نمایش ───────────────────────────────────────────────────────── */}
      {items.filter(x => x.active).length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Eye size={13} className="text-slate-400" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">پیش‌نمایش</h3>
            {!enabled && (
              <span className="text-xs text-amber-400 mr-auto">
                ⚠ برای نمایش در سایت، ویجت را فعال کنید
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {items.filter(x => x.active).slice(0, MAX_FLOAT).map(item => {
              const cfg = NETWORK_CONFIG[item.network];
              return (
                <div
                  key={item.network}
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: `${cfg.color}22`,
                    border: `1px solid ${cfg.color}55`,
                    boxShadow: `0 4px 16px ${cfg.color}33`,
                  }}>
                  <NetworkIcon network={item.network} size={22} />
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            این آیکون‌ها در گوشه پایین-راست سایت به صورت عمودی نمایش داده می‌شوند.
          </p>
        </div>
      )}
    </div>
  );
}
