// ─── Users API ────────────────────────────────────────────────────────────────
// ذخیره و مدیریت پروفایل کاربران در جدول public.users

import { supabase } from './supabaseApi';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  position: string | null;
  created_at?: string;
  last_login_at?: string | null;
}

// ── SELECT column list shared by all admin queries ────────────────────────────
// last_login_at فقط اگر در database باشد select می‌شود؛
// اگر ستون وجود نداشت Supabase یک خطای null-safe برمی‌گرداند که
// در fetchAllUsers آن را با یک fallback مدیریت می‌کنیم.
const USER_COLUMNS = 'id, email, full_name, phone, company_name, position, created_at, last_login_at' as const;

// ── Upsert (insert or update) profile ─────────────────────────────────────────
export async function upsertUserProfile(
  profile: Omit<UserProfile, 'created_at'>
): Promise<{ error: string | null }> {
  const { error } = await (supabase as any)
    .from('users')
    .upsert(
      {
        id:           profile.id,
        email:        profile.email,
        full_name:    profile.full_name,
        phone:        profile.phone,
        company_name: profile.company_name,
        position:     profile.position,
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('[usersApi] upsertUserProfile error:', error.message);
    return { error: error.message };
  }
  return { error: null };
}

// ── Record login timestamp (called after successful login) ───────────────────
export async function recordLogin(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    // اگر ستون هنوز در DB وجود نداشت، فقط warn می‌کنیم (بی‌خطر)
    console.warn('[usersApi] recordLogin error (column may not exist yet):', error.message);
  }

  try {
    // Insert an admin notification for this login
    const { error: insertErr } = await (supabase as any)
      .from('notifications')
      .insert([
        {
          type: 'user_login',
          payload: { userId: id },
          target_role: 'admin'
        }
      ]);
    if (insertErr) {
      console.warn('[usersApi] recordLogin: failed to insert notification:', insertErr.message);
    }
  } catch (e) {
    console.error('[usersApi] recordLogin: unexpected error inserting notification', e);
  }
}

// ── Fetch all users (admin use only) ─────────────────────────────────────────
export async function fetchAllUsers(opts?: {
  search?: string;
}): Promise<UserProfile[]> {
  let query = (supabase as any)
    .from('users')
    .select(USER_COLUMNS)
    .order('created_at', { ascending: false });

  if (opts?.search) {
    const s = `%${opts.search}%`;
    query = query.or(
      `full_name.ilike.${s},email.ilike.${s},company_name.ilike.${s},phone.ilike.${s}`
    );
  }

  const { data, error } = await query;
  if (error) {
    // اگر last_login_at هنوز در schema نیست، بدون آن دوباره امتحان کن
    if (error.message?.includes('last_login_at')) {
      console.warn('[usersApi] last_login_at column missing, falling back to query without it');
      const { data: fallback, error: fallbackError } = await (supabase as any)
        .from('users')
        .select('id, email, full_name, phone, company_name, position, created_at')
        .order('created_at', { ascending: false });
      if (fallbackError) {
        console.error('[usersApi] fetchAllUsers fallback error:', fallbackError.message);
        return [];
      }
      return (fallback ?? []) as UserProfile[];
    }
    console.error('[usersApi] fetchAllUsers error:', error.message);
    return [];
  }
  return (data ?? []) as UserProfile[];
}

// ── Delete user row (admin use only) ─────────────────────────────────────────
export async function deleteUserProfile(id: string): Promise<void> {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) console.error('[usersApi] deleteUserProfile error:', error.message);
}

// ── Delete multiple users by id list ─────────────────────────────────────────
export async function deleteUsers(ids: string[]): Promise<boolean> {
  if (!ids.length) return true;
  const { error } = await (supabase as any).from('users').delete().in('id', ids);
  if (error) { console.error('[deleteUsers]', error.message); return false; }
  return true;
}

// ── Update user profile (admin use only) ─────────────────────────────────────
export async function updateUserProfile(
  id: string,
  updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
): Promise<{ error: string | null }> {
  const { error } = await (supabase as any).from('users').update(updates).eq('id', id);
  if (error) {
    console.error('[usersApi] updateUserProfile error:', error.message);
    return { error: error.message };
  }
  return { error: null };
}
