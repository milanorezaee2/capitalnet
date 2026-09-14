// ─── Contact Messages API ─────────────────────────────────────────────────────
import { supabase } from './supabaseApi';

export type MessageStatus = 'unread' | 'read' | 'replied' | 'archived';

export interface ContactMessage {
  id: string;
  created_at: string;
  full_name: string;
  email: string | null;
  subject: string | null;
  message: string;
  status: MessageStatus;
  admin_reply: string | null;
  replied_at: string | null;
}

// ── Insert a new message (called from ContactPage form) ───────────────────────
export async function insertContactMessage(data: {
  full_name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<boolean> {
  const { error } = await (supabase as any).from('contact_messages').insert({
    full_name: data.full_name,
    email:     data.email,
    subject:   data.subject ?? null,
    message:   data.message,
    status:    'unread',
  });
  if (error) { console.error('[insertContactMessage]', error.message); return false; }
  return true;
}

// ── Fetch all messages (admin only) ──────────────────────────────────────────
export async function fetchMessages(filters?: {
  status?: MessageStatus;
  search?: string;
}): Promise<ContactMessage[]> {
  let query = supabase
    .from('contact_messages')
    .select('id, created_at, full_name, email, subject, message, status, admin_reply, replied_at')
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) { console.error('[fetchMessages]', error.message); return []; }
  return (data ?? []) as ContactMessage[];
}

// ── Fetch messages for a user (user dashboard) ────────────────────────────────
export async function fetchUserMessages(email: string): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, created_at, full_name, email, subject, message, status, admin_reply, replied_at')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) { console.error('[fetchUserMessages]', error.message); return []; }
  return (data ?? []) as ContactMessage[];
}

// ── Mark as read ──────────────────────────────────────────────────────────────
export async function markMessageRead(id: string): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('contact_messages')
    .update({ status: 'read' })
    .eq('id', id)
    .eq('status', 'unread');
  if (error) { console.error('[markMessageRead]', error.message); return false; }
  return true;
}

// ── Update message status ─────────────────────────────────────────────────────
export async function updateMessageStatus(id: string, status: MessageStatus): Promise<boolean> {
  const { error } = await (supabase as any).from('contact_messages').update({ status }).eq('id', id);
  if (error) { console.error('[updateMessageStatus]', error.message); return false; }
  return true;
}

// ── Save admin reply ──────────────────────────────────────────────────────────
export async function saveAdminReply(id: string, reply: string): Promise<boolean> {
  const { error } = await (supabase as any).from('contact_messages').update({
    admin_reply: reply,
    status: 'replied',
    replied_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) { console.error('[saveAdminReply]', error.message); return false; }
  return true;
}

// ── Delete a single message ───────────────────────────────────────────────────
export async function deleteMessage(id: string): Promise<boolean> {
  const { error } = await (supabase as any).from('contact_messages').delete().eq('id', id);
  if (error) { console.error('[deleteMessage]', error.message); return false; }
  return true;
}

// ── Delete multiple messages by id list ──────────────────────────────────────
export async function deleteMessages(ids: string[]): Promise<boolean> {
  if (!ids.length) return true;
  const { error } = await (supabase as any).from('contact_messages').delete().in('id', ids);
  if (error) { console.error('[deleteMessages]', error.message); return false; }
  return true;
}

// ── Unread count ──────────────────────────────────────────────────────────────
export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'unread');
  if (error) return 0;
  return count ?? 0;
}
