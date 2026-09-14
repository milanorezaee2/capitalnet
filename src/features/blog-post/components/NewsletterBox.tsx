/**
 * NewsletterBox
 * Email subscription box with validation and success state.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

import { t } from '@/i18n';


interface Props {
  /** Optional callback when a valid email is submitted */
  onSubscribe?: (email: string) => Promise<void>;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function NewsletterBox({ onSubscribe }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg(t("ایمیل خود را وارد کنید."));
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMsg(t("آدرس ایمیل معتبر نیست."));
      return;
    }

    setStatus('loading');
    try {
      if (onSubscribe) await onSubscribe(email.trim());
      // Simulate async if no callback
      else await new Promise((r) => setTimeout(r, 800));
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg(t("خطایی رخ داد. لطفاً دوباره تلاش کنید."));
    }
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 p-6 md:p-8 mt-12"
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
          <Mail size={18} className="text-teal-400" aria-hidden="true" />
        </div>
        <div>
          <h2
            id="newsletter-heading"
            className="text-lg font-black text-white mb-1"
          >
            {t("عضویت در خبرنامه")}
          </h2>
          <p className="text-sm text-white/55">
            {t("آخرین مقالات و تحلیل‌های تخصصی را مستقیم در ایمیل خود دریافت کنید.")}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-emerald-300">
              {t("ثبت‌نام شما با موفقیت انجام شد! به زودی اولین خبرنامه را دریافت خواهید کرد.")}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            noValidate
            aria-label={t("فرم عضویت در خبرنامه")}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("ایمیل شما")}
                  required
                  aria-label={t("آدرس ایمیل")}
                  aria-invalid={!!errorMsg}
                  aria-describedby={errorMsg ? 'newsletter-error' : undefined}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pr-9 pl-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-black font-bold text-sm px-6 py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50 whitespace-nowrap"
              >
                {status === 'loading' ? (
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={15} aria-hidden="true" />
                )}
                {t("عضویت")}
              </button>
            </div>

            {errorMsg && (
              <p
                id="newsletter-error"
                className="flex items-center gap-1.5 mt-2 text-xs text-rose-400"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle size={13} aria-hidden="true" />
                {errorMsg}
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}
