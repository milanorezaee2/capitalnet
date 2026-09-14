import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Plus, Trash2, ChevronDown, ChevronUp,
  Eye, EyeOff, Phone, Mail, MapPin, Clock,
  CheckCircle2, Shield, Users, Zap, Star, Globe,
  MessageSquare, TrendingUp,
} from 'lucide-react';
import { DEFAULT_SETTINGS, fetchSettings, saveSettings } from '../../lib/settingsApi';
import type { SiteSettings, ContactStatItem } from '../../lib/settingsApi';

// ── استایل‌های مشترک ────────────────────────────────────────────────────────
const inputCls = 'w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  (e.target.style.borderColor = 'rgba(0,188,212,0.5)');
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  (e.target.style.borderColor = 'rgba(255,255,255,0.1)');

// ── آیکون‌های آمار ────────────────────────────────────────────────────────────
const STAT_ICONS: Array<{ key: string; label: string; node: React.ReactNode }> = [
  { key: 'clock',    label: 'ساعت',      node: <Clock size={14} /> },
  { key: 'check',    label: 'تأیید',     node: <CheckCircle2 size={14} /> },
  { key: 'shield',   label: 'امنیت',     node: <Shield size={14} /> },
  { key: 'users',    label: 'تیم',       node: <Users size={14} /> },
  { key: 'zap',      label: 'سریع',      node: <Zap size={14} /> },
  { key: 'phone',    label: 'تلفن',      node: <Phone size={14} /> },
  { key: 'mail',     label: 'ایمیل',     node: <Mail size={14} /> },
  { key: 'star',     label: 'ستاره',     node: <Star size={14} /> },
  { key: 'globe',    label: 'جهانی',     node: <Globe size={14} /> },
  { key: 'trending', label: 'رشد',       node: <TrendingUp size={14} /> },
  { key: 'message',  label: 'پیام',      node: <MessageSquare size={14} /> },
];

const genId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ── ویرایشگر آمار تماس ────────────────────────────────────────────────────────
function StatItemsEditor({ items, onChange }: {
  items: ContactStatItem[];
  onChange: (items: ContactStatItem[]) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const update = (id: string, patch: Partial<ContactStatItem>) =>
    onChange(items.map(it => it.id === id ? { ...it, ...patch } : it));
  const remove = (id: string) => onChange(items.filter(it => it.id !== id));
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };
  const moveDown = (idx: number) => {
    if (idx === items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {items.map((item, idx) => (
          <motion.div key={item.id}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-xl overflow-hidden" style={cardStyle}>
            {/* سربرگ آیتم */}
            <div className="flex items-center gap-2 px-4 py-3">
              <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="flex-1 flex items-center gap-2 text-right min-w-0">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: item.color + '22', border: `1px solid ${item.color}44` }}>
                  <span style={{ color: item.color }}>
                    {STAT_ICONS.find(i => i.key === item.icon)?.node ?? <CheckCircle2 size={14} />}
                  </span>
                </span>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-white truncate block">
                    {item.label || '(بدون برچسب)'}
                  </span>
                  <span className="text-xs text-slate-400">{item.value || '—'}</span>
                </div>
              </button>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => update(item.id, { visible: !item.visible })}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                  title={item.visible ? 'پنهان' : 'نمایش'}>
                  {item.visible
                    ? <Eye size={13} className="text-teal-400" />
                    : <EyeOff size={13} className="text-slate-500" />}
                </button>
                <button onClick={() => moveUp(idx)} disabled={idx === 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-30">
                  <ChevronUp size={13} className="text-slate-400" />
                </button>
                <button onClick={() => moveDown(idx)} disabled={idx === items.length - 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-30">
                  <ChevronDown size={13} className="text-slate-400" />
                </button>
                <button onClick={() => remove(item.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/15">
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>

            {/* محتوای ویرایش */}
            <AnimatePresence initial={false}>
              {expanded === item.id && (
                <motion.div key="body"
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div className="px-4 pb-4 pt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">برچسب</label>
                      <input value={item.label} onChange={e => update(item.id, { label: e.target.value })}
                        className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                        placeholder="مثلاً: زمان پاسخ" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">مقدار</label>
                      <input value={item.value} onChange={e => update(item.id, { value: e.target.value })}
                        className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                        placeholder="مثلاً: ۲۴ ساعت" />
                    </div>
                    {/* رنگ */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">رنگ آیکون</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={item.color}
                          onChange={e => update(item.id, { color: e.target.value })}
                          className="w-10 h-9 rounded-lg cursor-pointer border-0 p-0.5"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <input value={item.color} onChange={e => update(item.id, { color: e.target.value })}
                          className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                          placeholder="#00BCD4" />
                      </div>
                    </div>
                    {/* آیکون */}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">آیکون</label>
                      <select value={item.icon} onChange={e => update(item.id, { icon: e.target.value })}
                        className={inputCls} style={{ ...inputStyle, cursor: 'pointer' }}>
                        {STAT_ICONS.map(ic => (
                          <option key={ic.key} value={ic.key}>{ic.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      <button onClick={() => {
        const newItem: ContactStatItem = {
          id: genId(), icon: 'check', label: '', value: '', color: '#00BCD4', visible: true,
        };
        onChange([...items, newItem]);
        setExpanded(newItem.id);
      }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-teal-400 transition-all hover:bg-teal-400/10"
        style={{ border: '1px dashed rgba(0,188,212,0.35)' }}>
        <Plus size={15} />
        افزودن آیتم آمار
      </button>
    </div>
  );
}

// ── کامپوننت اصلی ─────────────────────────────────────────────────────────────
export default function AdminContactCMSPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchSettings()
      .then(s => { if (!cancelled) { setSettings(s ?? { ...DEFAULT_SETTINGS }); setLoading(false); } })
      .catch(() => { if (!cancelled) { setSettings({ ...DEFAULT_SETTINGS }); setLoading(false); setError('خطا در بارگذاری — از مقادیر پیش‌فرض استفاده شد.'); } });
    return () => { cancelled = true; };
  }, []);

  const set = <K extends keyof SiteSettings>(key: K, val: SiteSettings[K]) =>
    setSettings(prev => prev ? { ...prev, [key]: val } : prev);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true); setError('');
    const ok = await saveSettings(settings);
    setSaving(false);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    else setError('خطا در ذخیره‌سازی — لطفاً دوباره تلاش کنید.');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <span className="w-7 h-7 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );
  if (!settings) return null;

  const SaveBtn = () => (
    <button onClick={handleSave} disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
      style={{
        background: saved ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg,#00BCD4,#00838F)',
        color: saved ? '#22c55e' : '#fff',
        border: saved ? '1px solid rgba(34,197,94,0.35)' : 'none',
      }}>
      {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
      {saving ? 'در حال ذخیره...' : saved ? '✓ ذخیره شد' : 'ذخیره تغییرات'}
    </button>
  );

  return (
    <div className="space-y-5 max-w-3xl" dir="rtl">

      {/* ── سربرگ ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">صفحه «تماس با ما»</h1>
          <p className="text-sm text-slate-400 mt-0.5">مدیریت کامل محتوا، اطلاعات تماس، آمار و فرم</p>
        </div>
        <SaveBtn />
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm text-red-300"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>{error}</div>
      )}

      {/* ── نوار اطلاعات ── */}
      <div className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg,rgba(0,188,212,0.08),rgba(99,102,241,0.05))', border: '1px solid rgba(0,188,212,0.18)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(0,188,212,0.15)', border: '1px solid rgba(0,188,212,0.3)' }}>
          <Phone size={18} style={{ color: '#00BCD4' }} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">CMS کامل صفحه «تماس با ما»</p>
          <p className="text-xs text-slate-400 mt-0.5">ویرایش Hero، اطلاعات تماس، آمار و محتوای فرم — صفر تا صد</p>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,188,212,0.1)', background: 'rgba(0,188,212,0.04)' }}>
          <span className="text-sm font-bold text-teal-400">🏠 Hero — عنوان و توضیح</span>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">عنوان اصلی</label>
            <input value={settings.contact_hero_title}
              onChange={e => set('contact_hero_title', e.target.value)}
              className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              placeholder="با ما در تماس باشید" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">توضیح زیر عنوان</label>
            <textarea value={settings.contact_hero_desc}
              onChange={e => set('contact_hero_desc', e.target.value)}
              rows={3} className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              placeholder="برای هرگونه سوال یا مشاوره با ما تماس بگیرید" />
          </div>
        </div>
      </div>

      {/* ── اطلاعات تماس ── */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,188,212,0.1)', background: 'rgba(0,188,212,0.04)' }}>
          <span className="text-sm font-bold text-teal-400">📞 اطلاعات تماس مستقیم</span>
        </div>
        <div className="px-5 py-4 grid grid-cols-1 gap-4">
          {/* ایمیل */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(0,188,212,0.04)', border: '1px solid rgba(0,188,212,0.1)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Mail size={14} className="text-teal-400" />
              <span className="text-xs font-semibold text-teal-400">آدرس ایمیل</span>
            </div>
            <input value={settings.contact_email}
              onChange={e => set('contact_email', e.target.value)}
              className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              placeholder="invest@capitalnetwork.ir" dir="ltr" />
          </div>
          {/* تلفن */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(0,188,212,0.04)', border: '1px solid rgba(0,188,212,0.1)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Phone size={14} className="text-teal-400" />
              <span className="text-xs font-semibold text-teal-400">شماره تلفن</span>
            </div>
            <input value={settings.contact_phone}
              onChange={e => set('contact_phone', e.target.value)}
              className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              placeholder="+98 21 1234 5678" dir="ltr" />
          </div>
          {/* آدرس */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(0,188,212,0.04)', border: '1px solid rgba(0,188,212,0.1)' }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-teal-400" />
              <span className="text-xs font-semibold text-teal-400">آدرس دفتر</span>
            </div>
            <div className="space-y-2">
              <input value={settings.contact_address}
                onChange={e => set('contact_address', e.target.value)}
                className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                placeholder="تهران، خیابان ولیعصر، ..." />
              <input value={settings.contact_address_label}
                onChange={e => set('contact_address_label', e.target.value)}
                className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                placeholder="برچسب: مثلاً «آدرس دفتر مرکزی»" />
            </div>
          </div>
        </div>
      </div>

      {/* ── آمار / ویژگی‌ها ── */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,188,212,0.1)', background: 'rgba(0,188,212,0.04)' }}>
          <span className="text-sm font-bold text-teal-400">📊 آمار و ویژگی‌های برجسته</span>
          <p className="text-xs text-slate-500 mt-0.5">کارت‌های اطلاع‌رسانی نمایش داده‌شده در صفحه تماس</p>
        </div>
        <div className="px-5 py-4">
          <StatItemsEditor
            items={settings.contact_stat_items}
            onChange={val => set('contact_stat_items', val)}
          />
        </div>
      </div>

      {/* ── پیام فرم ── */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,188,212,0.1)', background: 'rgba(0,188,212,0.04)' }}>
          <span className="text-sm font-bold text-teal-400">📝 محتوای فرم تماس</span>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">عنوان فرم</label>
            <input value={settings.contact_form_title}
              onChange={e => set('contact_form_title', e.target.value)}
              className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              placeholder="ارسال پیام" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">توضیحات فرم (اختیاری)</label>
            <textarea value={settings.contact_form_desc}
              onChange={e => set('contact_form_desc', e.target.value)}
              rows={2} className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              placeholder="پیام خود را برای ما ارسال کنید..." />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">پیام موفقیت بعد از ارسال</label>
            <input value={settings.contact_success_msg}
              onChange={e => set('contact_success_msg', e.target.value)}
              className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              placeholder="پیام شما دریافت شد..." />
          </div>
        </div>
      </div>

      {/* ── ساعات کاری ── */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,188,212,0.1)', background: 'rgba(0,188,212,0.04)' }}>
          <span className="text-sm font-bold text-teal-400">🕐 ساعات کاری</span>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">روزهای کاری</label>
            <input value={settings.contact_working_days}
              onChange={e => set('contact_working_days', e.target.value)}
              className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              placeholder="شنبه تا چهارشنبه" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">ساعت کاری</label>
            <input value={settings.contact_working_hours}
              onChange={e => set('contact_working_hours', e.target.value)}
              className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              placeholder="۹ صبح تا ۶ عصر" />
          </div>
        </div>
      </div>

      {/* ── دکمه ذخیره پایین ── */}
      <div className="flex justify-end pt-2 pb-6">
        <SaveBtn />
      </div>
    </div>
  );
}
