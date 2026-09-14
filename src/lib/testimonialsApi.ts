// ─── Testimonials API ─────────────────────────────────────────────────────────
import { supabase } from './supabaseApi';

export interface Testimonial {
  id: string;
  created_at: string;
  name: string;
  role: string;
  company: string | null;
  text: string;
  avatar_url: string | null;
  sort_order: number;
  is_active: boolean;
}

// ── Fetch active testimonials (public site) ──────────────────────────────────
export async function fetchActiveTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) { console.error('[fetchActiveTestimonials]', error.message); return []; }
  return (data ?? []) as Testimonial[];
}

// ── Fetch all (admin) ─────────────────────────────────────────────────────────
export async function fetchAllTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) { console.error('[fetchAllTestimonials]', error.message); return []; }
  return (data ?? []) as Testimonial[];
}

// ── Create ────────────────────────────────────────────────────────────────────
export async function createTestimonial(
  data: Omit<Testimonial, 'id' | 'created_at'>
): Promise<Testimonial | null> {
  const { data: row, error } = await (supabase as any)
    .from('testimonials')
    .insert(data)
    .select('*')
    .single();
  if (error) { console.error('[createTestimonial]', error.message); return null; }
  return row as Testimonial;
}

// ── Update ────────────────────────────────────────────────────────────────────
export async function updateTestimonial(
  id: string,
  data: Partial<Omit<Testimonial, 'id' | 'created_at'>>
): Promise<boolean> {
  const { error } = await (supabase as any).from('testimonials').update(data).eq('id', id);
  if (error) { console.error('[updateTestimonial]', error.message); return false; }
  return true;
}

// ── Delete ────────────────────────────────────────────────────────────────────
export async function deleteTestimonial(id: string): Promise<boolean> {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) { console.error('[deleteTestimonial]', error.message); return false; }
  return true;
}

// ── Bulk update sort order ────────────────────────────────────────────────────
export async function updateSortOrders(
  items: Array<{ id: string; sort_order: number }>
): Promise<boolean> {
  for (const item of items) {
    const { error } = await (supabase as any)
      .from('testimonials')
      .update({ sort_order: item.sort_order })
      .eq('id', item.id);
    if (error) { console.error('[updateSortOrders]', error.message); return false; }
  }
  return true;
}
