import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Building2,
  Briefcase,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '../lib/supabaseApi';
import { upsertUserProfile, recordLogin } from '../lib/usersApi';

import { t } from '@/i18n';


// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  initialTab?: 'login' | 'signup';
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function InputField({
  label,
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  rightSlot,
}: {
  label: string;
  icon: React.ElementType;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full pr-9 pl-10 py-2.5 rounded-xl text-sm text-white outline-none transition-all duration-200 placeholder-slate-600"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(56,189,248,0.55)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')}
        />
        {rightSlot && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialTab = 'login',
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);

  // login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);

  // signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCompany, setSignupCompany] = useState('');
  const [signupPosition, setSignupPosition] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const overlayRef = useRef<HTMLDivElement>(null);
  const keepSuccessOnTabSwitch = useRef(false);

  // Reset form when switching tabs
  useEffect(() => {
    setError('');
    if (keepSuccessOnTabSwitch.current) {
      keepSuccessOnTabSwitch.current = false;
    } else {
      setSuccessMsg('');
    }
  }, [tab]);

  // Reset all when closed
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccessMsg('');
      setLoginEmail('');
      setLoginPassword('');
      setSignupName('');
      setSignupEmail('');
      setSignupPhone('');
      setSignupCompany('');
      setSignupPosition('');
      setSignupPassword('');
      setSignupConfirm('');
      setTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Login ──────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError(t("ایمیل و رمز عبور را وارد کنید"));
      return;
    }
    setLoading(true);
    setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    setLoading(false);
    if (authError || !data.user) {
      if (
        authError?.message.includes('Email not confirmed') ||
        authError?.message.includes('email_not_confirmed')
      ) {
        setError(t("ایمیل شما هنوز تأیید نشده است. لطفاً ایمیل خود را بررسی کنید"));
      } else {
        setError(t("ایمیل یا رمز عبور اشتباه است"));
      }
      return;
    }
    // اگر پروفایل در public.users وجود ندارد، آن را ایجاد کن
    // (پوشش‌دهی حالتی که DB Trigger نصب نشده یا قبلاً نصب نبوده)
    // اگر داده‌های pending از زمان ثبت‌نام در localStorage وجود دارند، آن‌ها را هم merge کن
    let pendingProfile: Record<string, string | null> = {};
    try {
      const raw = localStorage.getItem(`pending_profile_${(data.user.email ?? loginEmail).trim()}`);
      if (raw) {
        pendingProfile = JSON.parse(raw);
        localStorage.removeItem(`pending_profile_${(data.user.email ?? loginEmail).trim()}`);
      }
    } catch (_) { /* ignore */ }
    upsertUserProfile({
      id: data.user.id,
      email: data.user.email ?? loginEmail.trim(),
      full_name:    (pendingProfile.full_name    ?? data.user.user_metadata?.full_name    ?? null) as string | null,
      phone:        (pendingProfile.phone        ?? data.user.user_metadata?.phone        ?? null) as string | null,
      company_name: (pendingProfile.company_name ?? data.user.user_metadata?.company_name ?? null) as string | null,
      position:     (pendingProfile.position     ?? data.user.user_metadata?.position     ?? null) as string | null,
    });
    // ثبت زمان آخرین لاگین (fire-and-forget — UI را بلاک نمی‌کند)
    recordLogin(data.user.id);
    onAuthSuccess({
      id: data.user.id,
      email: data.user.email ?? loginEmail,
      name: data.user.user_metadata?.full_name as string | undefined,
    });
    onClose();
  };

  // ── Sign Up ────────────────────────────────────────────────────────────────

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setError(t("نام، ایمیل و رمز عبور الزامی هستند"));
      return;
    }
    if (signupPassword.length < 6) {
      setError(t("رمز عبور باید حداقل ۶ کاراکتر باشد"));
      return;
    }
    if (signupPassword !== signupConfirm) {
      setError(t("رمز عبور و تکرار آن مطابقت ندارند"));
      return;
    }
    setLoading(true);
    setError('');
    const { data, error: authError } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPassword,
      options: {
        data: {
          full_name: signupName.trim(),
          phone: signupPhone.trim() || null,
          company_name: signupCompany.trim() || null,
          position: signupPosition.trim() || null,
        },
      },
    });
    setLoading(false);
    if (authError) {
      console.error('[AuthModal] signup error:', authError.message, authError);
      if (
        authError.message.includes('already registered') ||
        authError.message.includes('User already registered')
      ) {
        setError(t("این ایمیل قبلاً ثبت شده است"));
      } else if (
        authError.message.includes('rate limit') ||
        authError.message.includes('over_email_send_rate_limit')
      ) {
        // Rate limit: ثبت‌نام احتمالاً انجام شده اما ایمیل ارسال نشد
        // اطلاعات را پر کن و به تب ورود برو
        setLoginEmail(signupEmail.trim());
        setLoginPassword(signupPassword);
        keepSuccessOnTabSwitch.current = true;
        setSuccessMsg(t("حساب ساخته شد. اطلاعات ورود آماده است. روی «ورود به حساب» کلیک کنید."));
        setTab('login');
        return;
      } else if (authError.message.includes('Invalid email')) {
        setError(t("فرمت ایمیل صحیح نیست"));
      } else if (authError.message.includes('Password should be')) {
        setError(t("رمز عبور باید حداقل ۶ کاراکتر باشد"));
      } else if (
        authError.message.includes('signup is disabled') ||
        authError.message.includes('Signups not allowed')
      ) {
        setError(t("ثبت‌نام در حال حاضر غیرفعال است. با پشتیبانی تماس بگیرید"));
      } else {
        setError(t('خطا: {message}', { message: authError.message }));
      }
      return;
    }
    // اگر session بلافاصله برگشت (Email Confirmation غیرفعال)
    if (data.session && data.user) {
      // session را در client ست کن تا RLS بتواند کاربر را شناسایی کند
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      // ذخیره پروفایل در جدول public.users (حالا authenticated هستیم)
      await upsertUserProfile({
        id: data.user.id,
        email: signupEmail.trim(),
        full_name: signupName.trim(),
        phone: signupPhone.trim() || null,
        company_name: signupCompany.trim() || null,
        position: signupPosition.trim() || null,
      });
      recordLogin(data.user.id);
      onAuthSuccess({
        id: data.user.id,
        email: data.user.email ?? signupEmail.trim(),
        name: data.user.user_metadata?.full_name as string | undefined,
      });
      onClose();
      return;
    }
    // پس از ثبت‌نام، اطلاعات پروفایل را در localStorage ذخیره کن
    // تا در اولین لاگین (بعد از تأیید ایمیل) به public.users وارد شود
    // این پوشش‌دهی حالتی است که DB Trigger نصب نشده باشد
    try {
      localStorage.setItem(
        `pending_profile_${signupEmail.trim()}`,
        JSON.stringify({
          full_name:    signupName.trim(),
          phone:        signupPhone.trim() || null,
          company_name: signupCompany.trim() || null,
          position:     signupPosition.trim() || null,
        })
      );
    } catch (_) { /* localStorage ممکن است در بعضی مرورگرها محدود باشد */ }
    setLoginEmail(signupEmail.trim());
    setLoginPassword(signupPassword);
    keepSuccessOnTabSwitch.current = true;
    // اگر نیاز به تأیید ایمیل باشد، پیام مناسب نشان بده
    const needsConfirmation = !data.session;
    setSuccessMsg(
      needsConfirmation
        ? t("ثبت‌نام موفق! یک ایمیل تأیید برای شما ارسال شد. پس از تأیید ایمیل، می‌توانید وارد شوید.")
        : t("حساب ساخته شد. اطلاعات ورود آماده است. روی «ورود به حساب» کلیک کنید.")
    );
    setTab('login');
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(3, 7, 18, 0.78)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === overlayRef.current) onClose(); }}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-sm"
              dir="rtl"
            >
              {/* Glow ring */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ boxShadow: '0 0 0 1px rgba(56,189,248,0.12), 0 24px 60px rgba(0,0,0,0.6)' }}
              />

              <div
                className="relative rounded-2xl overflow-hidden"
                style={{ background: 'rgba(8, 16, 34, 0.97)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {tab === 'login' ? t("ورود به حساب کاربری") : t("ایجاد حساب کاربری")}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Capital Network</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label={t("بستن")}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Tab switcher */}
                <div className="mx-6 mb-5 flex rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                      tab === 'login'
                        ? 'text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    style={tab === 'login' ? { background: 'rgba(56,189,248,0.15)', color: '#7dd3fc' } : {}}
                  >
                    <LogIn size={15} />
                    {t("ورود")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                      tab === 'signup'
                        ? 'text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    style={tab === 'signup' ? { background: 'rgba(56,189,248,0.15)', color: '#7dd3fc' } : {}}
                  >
                    <UserPlus size={15} />
                    {t("ثبت‌نام")}
                  </button>
                </div>

                {/* Forms */}
                <div className="px-6 pb-6">
                  <AnimatePresence mode="wait">
                    {tab === 'login' ? (
                      <motion.form
                        key="login"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.18 }}
                        onSubmit={handleLogin}
                        className="space-y-4"
                      >
                        <InputField
                          label={t("ایمیل")}
                          icon={Mail}
                          type="email"
                          value={loginEmail}
                          onChange={setLoginEmail}
                          placeholder="example@email.com"
                          autoComplete="email"
                        />
                        <InputField
                          label={t("رمز عبور")}
                          icon={Lock}
                          type={showLoginPw ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={setLoginPassword}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          rightSlot={
                            <button
                              type="button"
                              onClick={() => setShowLoginPw(v => !v)}
                              className="text-slate-500 hover:text-slate-300 transition-colors"
                            >
                              {showLoginPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          }
                        />
                        {error && <ErrorBanner message={error} />}
                        {successMsg && <SuccessBanner message={successMsg} />}
                        <SubmitButton loading={loading} label={t("ورود به حساب")} />
                        <p className="text-center text-xs text-slate-600 pt-1">
                          {t("حساب ندارید؟")}{' '}
                          <button type="button" onClick={() => setTab('signup')} className="text-sky-400 hover:text-sky-300 transition-colors">
                            {t("ثبت‌نام کنید")}
                          </button>
                        </p>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="signup"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.18 }}
                        onSubmit={handleSignup}
                        className="space-y-4"
                      >
                        <InputField
                          label={t("نام و نام خانوادگی *")}
                          icon={User}
                          type="text"
                          value={signupName}
                          onChange={setSignupName}
                          placeholder={t("نام کامل")}
                          autoComplete="name"
                        />
                        <InputField
                          label={t("ایمیل *")}
                          icon={Mail}
                          type="email"
                          value={signupEmail}
                          onChange={setSignupEmail}
                          placeholder={t("ایمیل شما")}
                          autoComplete="email"
                        />
                        <InputField
                          label={t("شماره تلفن")}
                          icon={Phone}
                          type="tel"
                          value={signupPhone}
                          onChange={setSignupPhone}
                          placeholder={t("شماره تلفن")}
                          autoComplete="tel"
                        />
                        <InputField
                          label={t("نام شرکت")}
                          icon={Building2}
                          type="text"
                          value={signupCompany}
                          onChange={setSignupCompany}
                          placeholder={t("نام شرکت")}
                          autoComplete="organization"
                        />
                        <InputField
                          label={t("سمت / موقعیت شغلی")}
                          icon={Briefcase}
                          type="text"
                          value={signupPosition}
                          onChange={setSignupPosition}
                          placeholder={t("سمت شغلی")}
                          autoComplete="organization-title"
                        />
                        <InputField
                          label={t("رمز عبور")}
                          icon={Lock}
                          type={showSignupPw ? 'text' : 'password'}
                          value={signupPassword}
                          onChange={setSignupPassword}
                          placeholder={t("حداقل ۶ کاراکتر")}
                          autoComplete="new-password"
                          rightSlot={
                            <button
                              type="button"
                              onClick={() => setShowSignupPw(v => !v)}
                              className="text-slate-500 hover:text-slate-300 transition-colors"
                            >
                              {showSignupPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          }
                        />
                        <InputField
                          label={t("تکرار رمز عبور")}
                          icon={Lock}
                          type={showConfirmPw ? 'text' : 'password'}
                          value={signupConfirm}
                          onChange={setSignupConfirm}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          rightSlot={
                            <button
                              type="button"
                              onClick={() => setShowConfirmPw(v => !v)}
                              className="text-slate-500 hover:text-slate-300 transition-colors"
                            >
                              {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          }
                        />
                        {error && <ErrorBanner message={error} />}
                        {successMsg && <SuccessBanner message={successMsg} />}
                        <SubmitButton loading={loading} label={t("ایجاد حساب")} />
                        <p className="text-center text-xs text-slate-600 pt-1">
                          {t("حساب دارید؟")}{' '}
                          <button type="button" onClick={() => setTab('login')} className="text-sky-400 hover:text-sky-300 transition-colors">
                            {t("وارد شوید")}
                          </button>
                        </p>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-300"
      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
    >
      <AlertCircle size={14} className="shrink-0" />
      {message}
    </motion.div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-emerald-300"
      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
    >
      <CheckCircle2 size={14} className="shrink-0" />
      {message}
    </motion.div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-[#0B1628] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)' }}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-sky-200/30 border-t-sky-800 rounded-full animate-spin" />
      ) : null}
      {loading ? t("لطفاً صبر کنید...") : label}
    </button>
  );
}
