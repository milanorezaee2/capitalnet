// ─── Leads API ────────────────────────────────────────────────────────────────
// کار با جدول assessments (view: leads) در Supabase

import { supabase } from './supabaseApi';

export type LeadStatus = 'new' | 'in_review' | 'approved' | 'rejected';

export interface Lead {
  id: string;
  created_at: string;
  profile_type: 'founder' | 'investor';
  full_name: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  company_name: string | null;
  sector: string | null;
  stage: string | null;
  capital_required: string | null;
  one_liner: string | null;
  org_name: string | null;
  ticket_size: string | null;
  stage_pref: string | null;
  geo_pref: string | null;
  confidence: 'high' | 'low' | null;
  message: string | null;
  deck_url: string | null;
  status: LeadStatus;
  admin_notes: string | null;
}

export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'admin_notes' | 'status'> & {
  id?: string;
  created_at?: string;
  status?: LeadStatus;
  admin_notes?: string | null;
};

// ── Insert a new lead ─────────────────────────────────────────────────────────
export async function insertLead(data: LeadInsert): Promise<{ id: string } | null> {
  const { data: row, error } = await (supabase as any)
    .from('assessments')
    .insert({
      profile_type:     data.profile_type,
      full_name:        data.full_name,
      email:            data.email,
      phone:            data.phone ?? null,
      linkedin:         data.linkedin ?? null,
      company_name:     data.company_name ?? null,
      sector:           data.sector ?? null,
      stage:            data.stage ?? null,
      capital_required: data.capital_required ?? null,
      one_liner:        data.one_liner ?? null,
      org_name:         data.org_name ?? null,
      ticket_size:      data.ticket_size ?? null,
      stage_pref:       data.stage_pref ?? null,
      geo_pref:         data.geo_pref ?? null,
      confidence:       data.confidence ?? null,
      message:          data.message ?? null,
      deck_url:         data.deck_url ?? null,
      status:           data.status ?? 'new',
    })
    .select('id')
    .single();

  if (error) {
    console.error('[insertLead] code:', error.code, '| message:', error.message, '| details:', error.details, '| hint:', error.hint);
    throw new Error(error.message);
  }
  // Fire-and-forget: notify admins about new lead
  try {
    const leadId = (row as any)?.id;
    if (leadId) {
      void (supabase as any).from('notifications').insert([
        {
          type: 'new_lead',
          payload: { leadId, full_name: data.full_name, email: data.email },
          target_role: 'admin'
        }
      ]).catch((e: any) => console.warn('[insertLead] notification insert failed', e));
    }
  } catch (e) {
    console.warn('[insertLead] notification insertion error', e);
  }
  return row as { id: string };
}

// ── Fetch all leads (admin only) ──────────────────────────────────────────────
export async function fetchLeads(filters?: {
  status?: LeadStatus;
  profile_type?: 'founder' | 'investor';
  search?: string;
}): Promise<Lead[]> {
  let query = (supabase as any)
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.profile_type) query = query.eq('profile_type', filters.profile_type);
  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) { console.error('[fetchLeads]', error.message); return []; }
  return (data ?? []) as Lead[];
}

// ── Update lead status ────────────────────────────────────────────────────────
export async function updateLeadStatus(id: string, status: LeadStatus): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('assessments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) { console.error('[updateLeadStatus]', error.message); return false; }
  return true;
}

// ── Update admin notes ────────────────────────────────────────────────────────
export async function updateLeadNotes(id: string, admin_notes: string): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('assessments')
    .update({ admin_notes, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) { console.error('[updateLeadNotes]', error.message); return false; }
  return true;
}

// ── Update full lead fields (admin edit) ─────────────────────────────────────
export type LeadUpdate = Partial<Omit<Lead, 'id' | 'created_at'>>;

export async function updateLead(id: string, data: LeadUpdate): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('assessments')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) { console.error('[updateLead]', error.message); return false; }
  return true;
}

// ── Delete a lead ─────────────────────────────────────────────────────────────
export async function deleteLead(id: string): Promise<boolean> {
  const { error } = await (supabase as any).from('assessments').delete().eq('id', id);
  if (error) { console.error('[deleteLead]', error.message); return false; }
  return true;
}

// ── Delete multiple leads by id list ─────────────────────────────────────────
export async function deleteLeads(ids: string[]): Promise<boolean> {
  if (!ids.length) return true;
  const { error } = await (supabase as any).from('assessments').delete().in('id', ids);
  if (error) { console.error('[deleteLeads]', error.message); return false; }
  return true;
}

// ── Fetch leads for a specific user (user dashboard) ─────────────────────────
export async function fetchUserLeads(email: string): Promise<Lead[]> {
  const { data, error } = await (supabase as any)
    .from('assessments')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) { console.error('[fetchUserLeads]', error.message); return []; }
  return (data ?? []) as Lead[];
}

