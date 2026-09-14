import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Clock, CheckCircle2, Send, MessageCircle } from 'lucide-react';
import type { SiteSettings } from '../lib/settingsApi';
import { insertContactMessage } from '../lib/messagesApi';

interface Props {
  settings: SiteSettings;
  onNavigate: (page: string) => void;
  themeMode?: 'dark' | 'light';
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function MobileContactPage({ settings, themeMode = 'dark' }: Props) {
  const isLight = themeMode === 'light';
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');
    try {
      const ok = await insertContactMessage({
        full_name: form.name,
        email: form.email,
        subject: form.subject || undefined,
        message: form.message,
      });
      setStatus(ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const contactItems = [
    {
      icon: Phone,
      label: 'تلفن',
      value: settings.contact_phone,
      color: '#06b6d4',
      href: `tel:${settings.contact_phone}`,
    },
    {
      icon: Mail,
      label: 'ایمیل',
      value: settings.contact_email,
      color: '#f59e0b',
      href: `mailto:${settings.contact_email}`,
    },
    {
      icon: Clock,
      label: 'ساعات کاری',
      value: settings.working_hours ?? 'شنبه تا چهارشنبه، ۹ تا ۱۸',
      color: '#10b981',
      href: undefined,
    },
  ];

  const inputClass = (field: string) =>
    `w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-200 border ${
      isLight
        ? `bg-white text-slate-900 placeholder:text-slate-400 ${focused === field ? 'border-cyan-500/60 shadow-[0_0_0_3px_rgba(6,182,212,0.12)]' : 'border-slate-200'}`
        : `bg-white/[0.04] text-white placeholder:text-white/25 ${focused === field ? 'border-cyan-500/60 shadow-[0_0_0_3px_rgba(6,182,212,0.12)]' : 'border-white/[0.07]'}`
    }`;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="px-4 pt-5 pb-4 space-y-5"
    >
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp}>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-widest text-cyan-400/80 border border-cyan-400/20 bg-cyan-400/[0.06]">
          <MessageCircle size={10} />
          CONTACT
        </span>
        <h1 className={`mt-2.5 text-[22px] font-black leading-[1.25] tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {settings.contact_hero_title}
        </h1>
        <p className={`mobile-justified-text mt-2 text-sm leading-[1.8] font-medium ${isLight ? 'text-slate-600' : 'text-white/50'}`}>
          {settings.contact_hero_desc}
        </p>
      </motion.div>

      {/* ── Contact Info Cards ── */}
      <motion.div variants={fadeUp} className="space-y-2">
        {contactItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <div
              className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors ${isLight ? 'border-slate-200 bg-white/80 active:bg-slate-50' : 'border-white/[0.06] bg-white/[0.03] active:bg-white/[0.06]'}`}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}
              >
                <Icon size={16} style={{ color: item.color }} />
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-white/35'}`}>{item.label}</p>
                <p className={`text-sm font-semibold truncate mt-0.5 leading-none ${isLight ? 'text-slate-800' : 'text-white/80'}`}>{item.value}</p>
              </div>
            </div>
          );

          return item.href ? (
            <a key={item.label} href={item.href}>{content}</a>
          ) : (
            <div key={item.label}>{content}</div>
          );
        })}
      </motion.div>

      {/* ── Contact Form ── */}
      <motion.div variants={fadeUp}>
        <p className={`mb-3 text-[11px] font-black uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-white/30'}`}>ارسال پیام</p>

        <AnimatePresence mode="wait">
          {status === 'sent' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex flex-col items-center gap-3 rounded-2xl p-8 border text-center ${isLight ? 'border-emerald-300/40 bg-emerald-50' : 'border-emerald-400/25 bg-emerald-400/[0.05]'}`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 border border-emerald-400/30">
                <CheckCircle2 size={26} className="text-emerald-400" />
              </div>
              <div>
                <p className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>پیام ارسال شد</p>
                <p className={`text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-white/50'}`}>تیم ما در اسرع وقت پاسخ می‌دهد.</p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              {/* Name */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-600' : 'text-white/45'}`}>نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  placeholder="مثال: علی رضایی"
                  className={inputClass('name')}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-600' : 'text-white/45'}`}>ایمیل</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="email@example.com"
                  className={inputClass('email')}
                  dir="ltr"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-600' : 'text-white/45'}`}>موضوع <span className={isLight ? 'text-slate-400' : 'text-white/20'}>(اختیاری)</span></label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  onFocus={() => setFocused('subject')}
                  onBlur={() => setFocused(null)}
                  placeholder="موضوع پیام را بنویسید"
                  className={inputClass('subject')}
                />
              </div>

              {/* Message */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-600' : 'text-white/45'}`}>پیام</label>
                <textarea
                  value={form.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  placeholder="پیام خود را بنویسید..."
                  rows={4}
                  className={`${inputClass('message')} resize-none leading-relaxed`}
                  required
                />
              </div>

              {/* Error */}
              {status === 'error' && (
                <p className="text-xs text-red-400 font-medium">
                  خطایی رخ داد. لطفاً دوباره امتحان کنید.
                </p>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={status === 'sending'}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-slate-900 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #f59e0b)' }}
              >
                {status === 'sending' ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-slate-900/40 border-t-slate-900 animate-spin" />
                    در حال ارسال...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    ارسال پیام
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
