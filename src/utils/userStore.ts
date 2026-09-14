// ─── User Auth Store ──────────────────────────────────────────────────────────
// مدیریت session کاربران عادی (نه ادمین) با Supabase Auth

import { supabase } from '../lib/supabaseApi';
import { recordLogin } from '../lib/usersApi';
import type { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

// ── Login ──────────────────────────────────────────────────────────────────────
export async function userLogin(
  email: string,
  password: string
): Promise<{ user: AuthUser; error: null } | { user: null; error: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { user: null, error: error?.message ?? 'خطا در ورود' };
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? email,
      name: data.user.user_metadata?.full_name as string | undefined,
    },
    error: null,
  };
  // Fire-and-forget: record login timestamp and create admin notification
  // (do not block the login response on this operation)
  void recordLogin(data.user.id).catch(err => console.warn('[userStore] recordLogin failed', err));
}

// ── Sign Up ────────────────────────────────────────────────────────────────────
export async function userSignup(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: AuthUser | null; requiresConfirmation: boolean; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { user: null, requiresConfirmation: false, error: error.message };
  }

  if (data.session && data.user) {
    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? email,
        name: fullName,
      },
      requiresConfirmation: false,
      error: null,
    };
  }

  // email confirmation required
  return { user: null, requiresConfirmation: true, error: null };
}

// ── Logout ─────────────────────────────────────────────────────────────────────
export async function userLogout(): Promise<void> {
  await supabase.auth.signOut();
}

// ── Get current session ────────────────────────────────────────────────────────
export async function getUserSession(): Promise<{
  user: AuthUser | null;
  session: Session | null;
}> {
  const { data } = await supabase.auth.getSession();
  const session = data.session ?? null;

  if (!session?.user?.email) {
    return { user: null, session: null };
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.full_name as string | undefined,
    },
    session,
  };
}

// ── Subscribe to auth state changes ───────────────────────────────────────────
export function onUserAuthChange(
  callback: (user: AuthUser | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user?.email) {
      callback({
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name as string | undefined,
      });
    } else {
      callback(null);
    }
  });
  return () => data.subscription.unsubscribe();
}

// ── Legacy compatibility export ───────────────────────────────────────────────
export function addUserAction(
  userId: string,
  actionType: string,
  description: string,
  metadata?: Record<string, unknown>
): void {
  console.log('User action:', { userId, actionType, description, metadata });
}
