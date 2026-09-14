// ─── Admin Auth Store ─────────────────────────────────────────────────────────
// احراز هویت ادمین: ابتدا Supabase Auth، سپس تأیید در جدول admins

import { supabase } from '../lib/supabaseApi';
import { recordLogin } from '../lib/usersApi';
import type { Session } from '@supabase/supabase-js';

// نگه‌دارنده ادمین فعلی در حافظه — برای جلوگیری از logout تکراری
// بدون نیاز به react state
let _currentAdminEmail: string | null = null;

// باگ ۵ — اعتبارنامه‌های dev از env می‌آیند، نه hardcode در source
// در .env.local تعریف کنید:
//   VITE_DEV_ADMIN_EMAIL=admin@capnet.io
//   VITE_DEV_ADMIN_PASSWORD=your-dev-password
const DEV_ADMIN_FALLBACK_EMAIL    = import.meta.env.VITE_DEV_ADMIN_EMAIL    ?? '';
const DEV_ADMIN_FALLBACK_PASSWORD = import.meta.env.VITE_DEV_ADMIN_PASSWORD ?? '';
const DEV_ADMIN_SESSION_KEY = 'dev-admin-session';

function hasSupabaseAuthConfig(): boolean {
  const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
  return Boolean(
    url &&
    key &&
    !url.includes('your-project-id') &&
    !url.includes('placeholder') &&
    key !== 'your-anon-key-here' &&
    key !== 'placeholder-key'
  );
}

async function withTimeout<T>(promise: Promise<T>, fallback: T, ms = 4000): Promise<T> {
  let settled = false;

  return await new Promise<T>((resolve) => {
    const timer = globalThis.setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(fallback);
      }
    }, ms);

    promise
      .then(value => {
        if (!settled) {
          settled = true;
          globalThis.clearTimeout(timer);
          resolve(value);
        }
      })
      .catch(() => {
        if (!settled) {
          settled = true;
          globalThis.clearTimeout(timer);
          resolve(fallback);
        }
      });
  });
}

function readDevAdminSession(): AdminUser | null {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null;
  // اگر env تنظیم نشده باشد، dev-fallback غیرفعال است
  if (!DEV_ADMIN_FALLBACK_EMAIL) return null;

  try {
    const stored = window.localStorage.getItem(DEV_ADMIN_SESSION_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<AdminUser> & { email?: string };
    if (!parsed?.email || parsed.email.toLowerCase() !== DEV_ADMIN_FALLBACK_EMAIL.toLowerCase()) return null;

    return {
      id: parsed.id ?? 'dev-admin',
      email: parsed.email,
      name: parsed.name ?? 'Admin',
    };
  } catch {
    return null;
  }
}

function persistDevAdminSession(user: AdminUser): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') return;
  window.localStorage.setItem(DEV_ADMIN_SESSION_KEY, JSON.stringify(user));
}

function clearDevAdminSession(): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') return;
  window.localStorage.removeItem(DEV_ADMIN_SESSION_KEY);
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

// ── بررسی اینکه آیا ایمیل در جدول admins وجود دارد ────────────────────────────
// SECURITY DEFINER تابع is_admin() از سمت سرور چک می‌کند — نیازی به query مستقیم نیست
// اما چون anon role نمی‌تواند admins بخواند، از RPC استفاده می‌کنیم
type AdminRoleCheckResult = 'yes' | 'no' | 'error';

async function verifyAdminRole(email: string): Promise<AdminRoleCheckResult> {
  const queryRole = async () =>
    supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle();

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const { data, error } = await queryRole();

    if (error) {
      console.warn('[Admin] verifyAdminRole attempt', attempt, 'failed', error);
      if (attempt === 2) return 'error';
      continue;
    }

    if (data) return 'yes';

    // data===null + error===null می‌تواند به معنای سایلنت RLS reject باشد.
    // اگر در حال حاضر همین email ادمین فعال است، حالت را محافظت می‌کنیم.
    if (_currentAdminEmail && email.toLowerCase() === _currentAdminEmail.toLowerCase()) {
      if (import.meta.env.DEV) {
        console.warn('[Admin] verifyAdminRole: empty result for active admin — treating as error to preserve session', email);
      }
      return 'error';
    }

    return 'no';
  }

  return 'error';
}

// ── Login ──────────────────────────────────────────────────────────────────────
export async function adminLogin(
  email: string,
  password: string
): Promise<{ user: AdminUser; error: null } | { user: null; error: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (
    import.meta.env.DEV &&
    DEV_ADMIN_FALLBACK_EMAIL &&
    DEV_ADMIN_FALLBACK_PASSWORD &&
    normalizedEmail === DEV_ADMIN_FALLBACK_EMAIL.toLowerCase() &&
    password === DEV_ADMIN_FALLBACK_PASSWORD
  ) {
    const user = {
      id: 'dev-admin',
      email: DEV_ADMIN_FALLBACK_EMAIL,
      name: 'Admin',
    };
    _currentAdminEmail = user.email;
    persistDevAdminSession(user);
    // record dev admin login (fire-and-forget)
    void recordLogin(user.id).catch(() => {});
    return { user, error: null };
  }

  if (!hasSupabaseAuthConfig()) {
    return { user: null, error: 'ایمیل یا رمز عبور اشتباه است' };
  }

  const authResult = await withTimeout(
    supabase.auth.signInWithPassword({ email, password }),
    { data: { user: null }, error: { message: 'timeout' } } as any,
    5000
  );
  const { data, error } = authResult;

  if (error || !data.user?.email) {
    return { user: null, error: 'ایمیل یا رمز عبور اشتباه است' };
  }

  // تأیید Role: ایمیل باید در جدول admins باشد
  const isAdmin = await verifyAdminRole(data.user.email);
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { user: null, error: 'ایمیل یا رمز عبور اشتباه است' };
  }

  const user: AdminUser = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.name as string ?? 'Admin',
  };
  _currentAdminEmail = user.email;
  // record admin login (fire-and-forget)
  void recordLogin(user.id).catch(() => {});
  return { user, error: null };
}

// ── Logout ─────────────────────────────────────────────────────────────────────
export async function adminLogout(): Promise<void> {
  _currentAdminEmail = null;
  clearDevAdminSession();
  // صفحه آخر ادمین را پاک می‌کنیم تا بعد از logout برای کاربر بعدی باقی نماند
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('admin-current-page');
  }
  await supabase.auth.signOut();
}

// ── Get current session (با تأیید role) ───────────────────────────────────────
export async function getAdminSession(): Promise<{
  user: AdminUser | null;
  session: Session | null;
  adminCheck?: AdminRoleCheckResult;
}> {
  const devSession = readDevAdminSession();
  if (devSession) {
    return { user: devSession, session: null, adminCheck: 'yes' };
  }

  if (!hasSupabaseAuthConfig()) {
    return { user: null, session: null };
  }

  const authResult = await withTimeout(
    supabase.auth.getSession(),
    { data: { session: null } } as any,
    4000
  );
  const session = authResult?.data?.session ?? null;

  if (!session?.user?.email) {
    if (import.meta.env.DEV) {
      console.debug('[Admin] getAdminSession: no active session');
    }
    return { user: null, session: null };
  }

  const roleCheck = await verifyAdminRole(session.user.email);
  if (roleCheck === 'yes') {
    const user: AdminUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.name as string ?? 'Admin',
    };
    _currentAdminEmail = user.email;
    return { user, session, adminCheck: 'yes' };
  }

  if (roleCheck === 'no') {
    if (import.meta.env.DEV) {
      console.warn('[Admin] getAdminSession: user is not admin', session.user.email);
    }
    await supabase.auth.signOut();
    return { user: null, session: null, adminCheck: 'no' };
  }

  if (import.meta.env.DEV) {
    console.warn('[Admin] getAdminSession: admin role verification errored', session.user.email);
  }

  return { user: null, session, adminCheck: 'error' };
}

// ── Subscribe to auth state changes ───────────────────────────────────────────
// قانون کلی: فقط SIGNED_OUT = logout قطعی.
// هیچ رویداد دیگری (از جمله رویدادهایی که بر اثر database write فایر می‌شوند)
// نباید ادمین را logout کند.
//
// رویدادهای ایمن (نادیده گرفته می‌شوند):
//   TOKEN_REFRESHED  — token جدید گرفته شده، session همچنان معتبر است
//   USER_UPDATED     — metadata کاربر عوض شده، session معتبر است
//   PASSWORD_RECOVERY — بازیابی رمز، ربطی به session ادمین ندارد
//   SIGNED_IN        — اگر ادمین از قبل لاگین باشد، این رویداد تکراری است
//                      (بعد از upsert/write در Supabase ممکن است emit شود)
export function onAdminAuthChange(
  callback: (user: AdminUser | null) => void
): () => void {
  let latestCallId = 0;

  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (import.meta.env.DEV) {
      console.debug('[AdminAuth] onAuthStateChange', {
        event,
        email: session?.user?.email,
        currentAdminEmail: _currentAdminEmail,
      });
    }

    // ── تنها رویداد logout قطعی ─────────────────────────────────────────────
    if (event === 'SIGNED_OUT') {
      _currentAdminEmail = null;
      callback(null);
      return;
    }

    // ── اگر ادمین از قبل لاگین است، هیچ رویدادی نباید session را زیر سوال ببرد ──
    // Supabase بعد از هر database write (مثل saveSettings) ممکن است SIGNED_IN،
    // TOKEN_REFRESHED، MFA_CHALLENGE_VERIFIED، INITIAL_SESSION و ... emit کند.
    // تنها SIGNED_OUT واقعاً logout است. سایر رویدادها برای ادمین فعلی skip می‌شوند.
    if (
      _currentAdminEmail &&
      session?.user?.email &&
      session.user.email.toLowerCase() === _currentAdminEmail.toLowerCase()
    ) {
      if (import.meta.env.DEV) {
        console.debug('[AdminAuth] event for already-logged-in admin — skipped', event, session.user.email);
      }
      return;
    }

    // ── رویدادهایی که هرگز نباید وضعیت ادمین را تغییر دهند ─────────────────
    if (
      event === 'TOKEN_REFRESHED' ||
      event === 'USER_UPDATED' ||
      event === 'PASSWORD_RECOVERY'
    ) {
      return;
    }

    // ── INITIAL_SESSION / SIGNED_IN جدید: تأیید role لازم است ──────────────
    if (!session?.user?.email) {
      if (import.meta.env.DEV) {
        console.debug('[AdminAuth] auth event without email — ignored', event);
      }
      return;
    }

    // race-condition guard: فقط آخرین call نتیجه می‌دهد
    const callId = ++latestCallId;

    const roleCheck = await verifyAdminRole(session.user.email);

    if (callId !== latestCallId) return;

    if (roleCheck === 'error') {
      // خطای شبکه/DB یا RLS سایلنت → وضعیت فعلی را حفظ می‌کنیم
      if (import.meta.env.DEV) {
        console.warn('[AdminAuth] role verification error — keeping current state', event);
      }
      return;
    }

    if (roleCheck === 'no') {
      _currentAdminEmail = null;
      callback(null);
      return;
    }

    const user: AdminUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.name as string ?? 'Admin',
    };
    _currentAdminEmail = user.email;
    callback(user);
  });

  return () => data.subscription.unsubscribe();
}

export type { Session };
