// ─── Analytics API ────────────────────────────────────────────────────────────
import { supabase } from './supabaseApi';

// ── Track a page view (called from App) ──────────────────────────────────────
export async function trackPageView(page: string): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    await (supabase as any).from('page_views').insert({
      page,
      session_id: sessionId,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent.slice(0, 200),
    });
  } catch {
    // silent — analytics should never break the app
  }
}

function getOrCreateSessionId(): string {
  const key = 'cn_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// ── Full analytics snapshot (admin only) ─────────────────────────────────────
export interface AnalyticsSnapshot {
  // Page views
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  viewsByPage: Array<{ page: string; count: number }>;
  viewsByDay: Array<{ date: string; count: number }>;

  // Leads
  totalLeads: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  leadsByType: { founder: number; investor: number };
  leadsByStatus: Record<string, number>;
  leadsByDay: Array<{ date: string; count: number }>;

  // Messages
  totalMessages: number;
  unreadMessages: number;
  messagesThisWeek: number;

  // Blog
  totalPosts: number;
  publishedPosts: number;
  totalBlogViews: number;
  topPosts: Array<{ title: string; slug: string; views: number }>;

  // Conversion
  conversionRate: number; // leads / page_views * 100
}

export async function fetchAnalytics(): Promise<AnalyticsSnapshot> {
  const today     = daysAgo(0);
  const week7     = daysAgo(7);
  const month30   = daysAgo(30);

  // ── Run all queries in parallel ───────────────────────────────────────────
  const [
    pvAll, pvToday, pvWeek, pvMonth, pvByPage, pvByDay,
    leadsAll, msgAll, postsAll,
  ] = await Promise.all([
    // Page views
    (supabase as any).from('page_views').select('id', { count: 'exact', head: true }),
    (supabase as any).from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', today),
    (supabase as any).from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', week7),
    (supabase as any).from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', month30),
    (supabase as any).from('page_views').select('page').gte('created_at', month30),
    (supabase as any).from('page_views').select('created_at').gte('created_at', month30).order('created_at', { ascending: true }),
    // Leads
    (supabase as any).from('assessments').select('id, profile_type, status, created_at'),
    // Messages
    (supabase as any).from('contact_messages').select('id, status, created_at'),
    // Blog
    (supabase as any).from('blog_posts').select('id, title, slug, status, views').order('views', { ascending: false }),
  ]);

  // ── Page views by page ────────────────────────────────────────────────────
  const pageMap: Record<string, number> = {};
  for (const row of (pvByPage.data ?? [])) {
    pageMap[row.page] = (pageMap[row.page] ?? 0) + 1;
  }
  const viewsByPage = Object.entries(pageMap)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // ── Page views by day (last 30 days) ──────────────────────────────────────
  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
    dayMap[key] = 0;
  }
  for (const row of (pvByDay.data ?? [])) {
    const key = new Date(row.created_at).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
    if (key in dayMap) dayMap[key]++;
  }
  const viewsByDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

  // ── Leads ─────────────────────────────────────────────────────────────────
  const leads = leadsAll.data ?? [];
  const leadsByType = {
    founder:  leads.filter((l: any) => l.profile_type === 'founder').length,
    investor: leads.filter((l: any) => l.profile_type === 'investor').length,
  };
  const leadsByStatus: Record<string, number> = {};
  for (const l of leads) {
    leadsByStatus[l.status] = (leadsByStatus[l.status] ?? 0) + 1;
  }
  const leadsWeek  = leads.filter((l: any) => l.created_at >= week7).length;
  const leadsMonth = leads.filter((l: any) => l.created_at >= month30).length;

  // Leads by day
  const ldayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    ldayMap[d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })] = 0;
  }
  for (const l of leads) {
    const key = new Date(l.created_at).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
    if (key in ldayMap) ldayMap[key]++;
  }
  const leadsByDay = Object.entries(ldayMap).map(([date, count]) => ({ date, count }));

  // ── Messages ──────────────────────────────────────────────────────────────
  const msgs = msgAll.data ?? [];
  const unreadMessages  = msgs.filter((m: any) => m.status === 'unread').length;
  const messagesWeek    = msgs.filter((m: any) => m.created_at >= week7).length;

  // ── Blog ──────────────────────────────────────────────────────────────────
  const posts = postsAll.data ?? [];
  const publishedPosts  = posts.filter((p: any) => p.status === 'published').length;
  const totalBlogViews  = posts.reduce((s: number, p: any) => s + (p.views ?? 0), 0);
  const topPosts = posts
    .filter((p: any) => p.status === 'published')
    .slice(0, 5)
    .map((p: any) => ({ title: p.title, slug: p.slug, views: p.views ?? 0 }));

  // ── Conversion rate ───────────────────────────────────────────────────────
  const totalViews = pvAll.count ?? 0;
  const conversionRate = totalViews > 0
    ? +((leads.length / totalViews) * 100).toFixed(2)
    : 0;

  return {
    totalViews,
    viewsToday:     pvToday.count ?? 0,
    viewsThisWeek:  pvWeek.count ?? 0,
    viewsThisMonth: pvMonth.count ?? 0,
    viewsByPage,
    viewsByDay,
    totalLeads:     leads.length,
    leadsThisWeek:  leadsWeek,
    leadsThisMonth: leadsMonth,
    leadsByType,
    leadsByStatus,
    leadsByDay,
    totalMessages:  msgs.length,
    unreadMessages,
    messagesThisWeek: messagesWeek,
    totalPosts:     posts.length,
    publishedPosts,
    totalBlogViews,
    topPosts,
    conversionRate,
  };
}
