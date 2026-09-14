/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Services CMS Admin API Layer
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { supabase } from '@/lib/supabase';
import {
  Service,
  ServiceCategory,
  ServiceFeature,
  ServiceBenefit,
  ProcessStep,
  Deliverable,
  Technology,
  PricingPlan,
  ComparisonTable,
  Portfolio,
  CaseStudy,
  Statistic,
  ClientLogo,
  Testimonial,
  TeamMember,
  FAQ,
  ContactForm,
  Newsletter,
  RelatedContent,
  CTA,
  SEOSettings,
  MediaAsset,
  PageSettings,
  ActivityLog,
  ActivityAction,
  PaginatedResponse,
  ApiResponse,
  Revision,
} from '@/types/servicesCms';

const TABLES = {
  SERVICES: 'services_cms_services',
  CATEGORIES: 'services_cms_categories',
  FEATURES: 'services_cms_features',
  BENEFITS: 'services_cms_benefits',
  PROCESS_STEPS: 'services_cms_process_steps',
  DELIVERABLES: 'services_cms_deliverables',
  TECHNOLOGIES: 'services_cms_technologies',
  PRICING_PLANS: 'services_cms_pricing_plans',
  COMPARISON_TABLES: 'services_cms_comparison_tables',
  PORTFOLIO: 'services_cms_portfolio',
  CASE_STUDIES: 'services_cms_case_studies',
  STATISTICS: 'services_cms_statistics',
  CLIENT_LOGOS: 'services_cms_client_logos',
  TESTIMONIALS: 'services_cms_testimonials',
  TEAM_MEMBERS: 'services_cms_team_members',
  FAQS: 'services_cms_faqs',
  CONTACT_FORMS: 'services_cms_contact_forms',
  NEWSLETTERS: 'services_cms_newsletters',
  RELATED_CONTENT: 'services_cms_related_content',
  CTAS: 'services_cms_ctas',
  ACTIVITY_LOG: 'services_cms_activity_log',
  REVISIONS: 'services_cms_revisions',
  PAGE_SETTINGS: 'services_cms_page_settings',
  SEO_SETTINGS: 'services_cms_seo_settings',
  MEDIA_ASSETS: 'services_cms_media_assets',
};

// ─────────────────────────────────────────────────────────────────────────────
// Activity Logging
// ─────────────────────────────────────────────────────────────────────────────

async function logActivity(
  action: ActivityAction,
  entityType: string,
  entityId: string | undefined,
  description: string,
  userId: string,
  userName: string
) {
  try {
    await supabase.from(TABLES.ACTIVITY_LOG).insert({
      action,
      entityType,
      entityId,
      description,
      userId,
      userName,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES API
// ─────────────────────────────────────────────────────────────────────────────

export const servicesApi = {
  // List services with pagination
  async list(
    page = 1,
    pageSize = 10,
    search?: string,
    status?: string
  ): Promise<PaginatedResponse<Service>> {
    let query = supabase.from(TABLES.SERVICES).select('*', { count: 'exact' });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query
      .order('order', { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    return {
      data: data as Service[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  // Get single service
  async get(id: string): Promise<Service> {
    const { data, error } = await supabase
      .from(TABLES.SERVICES)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Service;
  },

  // Create service
  async create(
    service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string,
    userName: string
  ): Promise<Service> {
    const { data, error } = await supabase
      .from(TABLES.SERVICES)
      .insert({
        ...service,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        updatedBy: userId,
        version: 1,
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(
      ActivityAction.CREATE,
      'Service',
      data.id,
      `Created service: ${data.title}`,
      userId,
      userName
    );

    return data as Service;
  },

  // Update service
  async update(
    id: string,
    updates: Partial<Service>,
    userId: string,
    userName: string
  ): Promise<Service> {
    // Save revision before update
    const current = await this.get(id);
    await supabase.from(TABLES.REVISIONS).insert({
      entityType: 'Service',
      entityId: id,
      data: current,
      changesSummary: `Updated at ${new Date().toISOString()}`,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      isAutoSave: false,
    });

    const { data, error } = await supabase
      .from(TABLES.SERVICES)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
        version: (current.version || 1) + 1,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(
      ActivityAction.UPDATE,
      'Service',
      id,
      `Updated service: ${current.title}`,
      userId,
      userName
    );

    return data as Service;
  },

  // Delete service
  async delete(id: string, userId: string, userName: string): Promise<void> {
    const service = await this.get(id);

    const { error } = await supabase
      .from(TABLES.SERVICES)
      .delete()
      .eq('id', id);

    if (error) throw error;

    await logActivity(
      ActivityAction.DELETE,
      'Service',
      id,
      `Deleted service: ${service.title}`,
      userId,
      userName
    );
  },

  // Publish service
  async publish(id: string, userId: string, userName: string): Promise<Service> {
    const service = await this.get(id);
    const updated = await this.update(
      id,
      { status: 'published' as any, publishedAt: new Date().toISOString() },
      userId,
      userName
    );

    await logActivity(
      ActivityAction.PUBLISH,
      'Service',
      id,
      `Published service: ${service.title}`,
      userId,
      userName
    );

    return updated;
  },

  // Archive service
  async archive(id: string, userId: string, userName: string): Promise<Service> {
    const service = await this.get(id);
    return await this.update(id, { status: 'archived' as any }, userId, userName);
  },

  // Duplicate service
  async duplicate(id: string, userId: string, userName: string): Promise<Service> {
    const service = await this.get(id);
    const newService = {
      ...service,
      title: `${service.title} (Copy)`,
      slug: `${service.slug}-copy-${Date.now()}`,
      status: 'draft' as any,
    };

    return await this.create(
      { ...newService, id: undefined, createdBy: undefined, updatedBy: undefined } as any,
      userId,
      userName
    );
  },

  // Bulk actions
  async bulkPublish(ids: string[], userId: string, userName: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.SERVICES)
      .update({
        status: 'published',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      })
      .in('id', ids);

    if (error) throw error;
  },

  async bulkDelete(ids: string[], userId: string, userName: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.SERVICES)
      .delete()
      .in('id', ids);

    if (error) throw error;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES API
// ─────────────────────────────────────────────────────────────────────────────

export const categoriesApi = {
  async list(): Promise<ServiceCategory[]> {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as ServiceCategory[];
  },

  async get(id: string): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ServiceCategory;
  },

  async create(category: Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .insert({
        ...category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'Category', data.id, `Created: ${category.title}`, userId, 'Admin');

    return data as ServiceCategory;
  },

  async update(id: string, updates: Partial<ServiceCategory>, userId: string): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'Category', id, `Updated: ${updates.title}`, userId, 'Admin');

    return data as ServiceCategory;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.CATEGORIES).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'Category', id, 'Deleted category', userId, 'Admin');
  },

  async reorder(items: { id: string; order: number }[], userId: string): Promise<void> {
    for (const item of items) {
      await supabase
        .from(TABLES.CATEGORIES)
        .update({ order: item.order, updatedAt: new Date().toISOString() })
        .eq('id', item.id);
    }

    await logActivity(ActivityAction.UPDATE, 'Category', undefined, 'Reordered categories', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURES API
// ─────────────────────────────────────────────────────────────────────────────

export const featuresApi = {
  async list(): Promise<ServiceFeature[]> {
    const { data, error } = await supabase
      .from(TABLES.FEATURES)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as ServiceFeature[];
  },

  async create(feature: Omit<ServiceFeature, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<ServiceFeature> {
    const { data, error } = await supabase
      .from(TABLES.FEATURES)
      .insert({
        ...feature,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'Feature', data.id, `Created: ${feature.title}`, userId, 'Admin');

    return data as ServiceFeature;
  },

  async update(id: string, updates: Partial<ServiceFeature>, userId: string): Promise<ServiceFeature> {
    const { data, error } = await supabase
      .from(TABLES.FEATURES)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'Feature', id, `Updated: ${updates.title}`, userId, 'Admin');

    return data as ServiceFeature;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.FEATURES).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'Feature', id, 'Deleted feature', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PRICING PLANS API
// ─────────────────────────────────────────────────────────────────────────────

export const pricingApi = {
  async list(): Promise<PricingPlan[]> {
    const { data, error } = await supabase
      .from(TABLES.PRICING_PLANS)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as PricingPlan[];
  },

  async create(plan: Omit<PricingPlan, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<PricingPlan> {
    const { data, error } = await supabase
      .from(TABLES.PRICING_PLANS)
      .insert({
        ...plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'PricingPlan', data.id, `Created: ${plan.title}`, userId, 'Admin');

    return data as PricingPlan;
  },

  async update(id: string, updates: Partial<PricingPlan>, userId: string): Promise<PricingPlan> {
    const { data, error } = await supabase
      .from(TABLES.PRICING_PLANS)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'PricingPlan', id, `Updated: ${updates.title}`, userId, 'Admin');

    return data as PricingPlan;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.PRICING_PLANS).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'PricingPlan', id, 'Deleted pricing plan', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE SETTINGS API
// ─────────────────────────────────────────────────────────────────────────────

export const pageSettingsApi = {
  async get(): Promise<PageSettings | null> {
    const { data, error } = await supabase
      .from(TABLES.PAGE_SETTINGS)
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as PageSettings) || null;
  },

  async update(settings: Partial<PageSettings>, userId: string): Promise<PageSettings> {
    const existing = await this.get();

    if (!existing) {
      const { data, error } = await supabase
        .from(TABLES.PAGE_SETTINGS)
        .insert({
          ...settings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as PageSettings;
    }

    const { data, error } = await supabase
      .from(TABLES.PAGE_SETTINGS)
      .update({
        ...settings,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'PageSettings', existing.id, 'Updated page settings', userId, 'Admin');

    return data as PageSettings;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS API
// ─────────────────────────────────────────────────────────────────────────────

export const testimonialApi = {
  async list(): Promise<Testimonial[]> {
    const { data, error } = await supabase
      .from(TABLES.TESTIMONIALS)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as Testimonial[];
  },

  async create(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Testimonial> {
    const { data, error } = await supabase
      .from(TABLES.TESTIMONIALS)
      .insert({
        ...testimonial,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'Testimonial', data.id, `Created: ${testimonial.name}`, userId, 'Admin');

    return data as Testimonial;
  },

  async update(id: string, updates: Partial<Testimonial>, userId: string): Promise<Testimonial> {
    const { data, error } = await supabase
      .from(TABLES.TESTIMONIALS)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'Testimonial', id, `Updated: ${updates.name}`, userId, 'Admin');

    return data as Testimonial;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.TESTIMONIALS).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'Testimonial', id, 'Deleted testimonial', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FAQ API
// ─────────────────────────────────────────────────────────────────────────────

export const faqApi = {
  async list(): Promise<FAQ[]> {
    const { data, error } = await supabase
      .from(TABLES.FAQS)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as FAQ[];
  },

  async create(faq: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<FAQ> {
    const { data, error } = await supabase
      .from(TABLES.FAQS)
      .insert({
        ...faq,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'FAQ', data.id, `Created FAQ`, userId, 'Admin');

    return data as FAQ;
  },

  async update(id: string, updates: Partial<FAQ>, userId: string): Promise<FAQ> {
    const { data, error } = await supabase
      .from(TABLES.FAQS)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'FAQ', id, `Updated FAQ`, userId, 'Admin');

    return data as FAQ;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.FAQS).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'FAQ', id, 'Deleted FAQ', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY LOG API
// ─────────────────────────────────────────────────────────────────────────────

export const activityLogApi = {
  async list(limit = 50): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from(TABLES.ACTIVITY_LOG)
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ActivityLog[];
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// BENEFITS API
// ─────────────────────────────────────────────────────────────────────────────

export const benefitsApi = {
  async list(): Promise<ServiceBenefit[]> {
    const { data, error } = await supabase
      .from(TABLES.BENEFITS)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as ServiceBenefit[];
  },

  async create(benefit: Omit<ServiceBenefit, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<ServiceBenefit> {
    const { data, error } = await supabase
      .from(TABLES.BENEFITS)
      .insert({
        ...benefit,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'Benefit', data.id, `Created: ${benefit.title}`, userId, 'Admin');

    return data as ServiceBenefit;
  },

  async update(id: string, updates: Partial<ServiceBenefit>, userId: string): Promise<ServiceBenefit> {
    const { data, error } = await supabase
      .from(TABLES.BENEFITS)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'Benefit', id, `Updated: ${updates.title}`, userId, 'Admin');

    return data as ServiceBenefit;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.BENEFITS).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'Benefit', id, 'Deleted benefit', userId, 'Admin');
  },

  async reorder(items: { id: string; order: number }[], userId: string): Promise<void> {
    for (const item of items) {
      await supabase
        .from(TABLES.BENEFITS)
        .update({ order: item.order, updatedAt: new Date().toISOString() })
        .eq('id', item.id);
    }

    await logActivity(ActivityAction.UPDATE, 'Benefit', undefined, 'Reordered benefits', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS STEPS API
// ─────────────────────────────────────────────────────────────────────────────

export const processStepsApi = {
  async list(): Promise<ProcessStep[]> {
    const { data, error } = await supabase
      .from(TABLES.PROCESS_STEPS)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as ProcessStep[];
  },

  async create(step: Omit<ProcessStep, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<ProcessStep> {
    const { data, error } = await supabase
      .from(TABLES.PROCESS_STEPS)
      .insert({
        ...step,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'ProcessStep', data.id, `Created: ${step.title}`, userId, 'Admin');

    return data as ProcessStep;
  },

  async update(id: string, updates: Partial<ProcessStep>, userId: string): Promise<ProcessStep> {
    const { data, error } = await supabase
      .from(TABLES.PROCESS_STEPS)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'ProcessStep', id, `Updated: ${updates.title}`, userId, 'Admin');

    return data as ProcessStep;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.PROCESS_STEPS).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'ProcessStep', id, 'Deleted process step', userId, 'Admin');
  },

  async reorder(items: { id: string; order: number }[], userId: string): Promise<void> {
    for (const item of items) {
      await supabase
        .from(TABLES.PROCESS_STEPS)
        .update({ order: item.order, updatedAt: new Date().toISOString() })
        .eq('id', item.id);
    }

    await logActivity(ActivityAction.UPDATE, 'ProcessStep', undefined, 'Reordered process steps', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERABLES API
// ─────────────────────────────────────────────────────────────────────────────

export const deliverablesApi = {
  async list(): Promise<Deliverable[]> {
    const { data, error } = await supabase
      .from(TABLES.DELIVERABLES)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as Deliverable[];
  },

  async create(deliverable: Omit<Deliverable, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Deliverable> {
    const { data, error } = await supabase
      .from(TABLES.DELIVERABLES)
      .insert({
        ...deliverable,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'Deliverable', data.id, `Created: ${deliverable.title}`, userId, 'Admin');

    return data as Deliverable;
  },

  async update(id: string, updates: Partial<Deliverable>, userId: string): Promise<Deliverable> {
    const { data, error } = await supabase
      .from(TABLES.DELIVERABLES)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'Deliverable', id, `Updated: ${updates.title}`, userId, 'Admin');

    return data as Deliverable;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.DELIVERABLES).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'Deliverable', id, 'Deleted deliverable', userId, 'Admin');
  },

  async reorder(items: { id: string; order: number }[], userId: string): Promise<void> {
    for (const item of items) {
      await supabase
        .from(TABLES.DELIVERABLES)
        .update({ order: item.order, updatedAt: new Date().toISOString() })
        .eq('id', item.id);
    }

    await logActivity(ActivityAction.UPDATE, 'Deliverable', undefined, 'Reordered deliverables', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TECHNOLOGIES API
// ─────────────────────────────────────────────────────────────────────────────

export const technologiesApi = {
  async list(): Promise<Technology[]> {
    const { data, error } = await supabase
      .from(TABLES.TECHNOLOGIES)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as Technology[];
  },

  async create(technology: Omit<Technology, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Technology> {
    const { data, error } = await supabase
      .from(TABLES.TECHNOLOGIES)
      .insert({
        ...technology,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'Technology', data.id, `Created: ${technology.name}`, userId, 'Admin');

    return data as Technology;
  },

  async update(id: string, updates: Partial<Technology>, userId: string): Promise<Technology> {
    const { data, error } = await supabase
      .from(TABLES.TECHNOLOGIES)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'Technology', id, `Updated: ${updates.name}`, userId, 'Admin');

    return data as Technology;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.TECHNOLOGIES).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'Technology', id, 'Deleted technology', userId, 'Admin');
  },

  async reorder(items: { id: string; order: number }[], userId: string): Promise<void> {
    for (const item of items) {
      await supabase
        .from(TABLES.TECHNOLOGIES)
        .update({ order: item.order, updatedAt: new Date().toISOString() })
        .eq('id', item.id);
    }

    await logActivity(ActivityAction.UPDATE, 'Technology', undefined, 'Reordered technologies', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON TABLES API
// ─────────────────────────────────────────────────────────────────────────────

export const comparisonTablesApi = {
  async list(): Promise<ComparisonTable[]> {
    const { data, error } = await supabase
      .from(TABLES.COMPARISON_TABLES)
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data as ComparisonTable[];
  },

  async get(id: string): Promise<ComparisonTable> {
    const { data, error } = await supabase
      .from(TABLES.COMPARISON_TABLES)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ComparisonTable;
  },

  async create(table: Omit<ComparisonTable, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<ComparisonTable> {
    const { data, error } = await supabase
      .from(TABLES.COMPARISON_TABLES)
      .insert({
        ...table,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'ComparisonTable', data.id, `Created: ${table.title}`, userId, 'Admin');

    return data as ComparisonTable;
  },

  async update(id: string, updates: Partial<ComparisonTable>, userId: string): Promise<ComparisonTable> {
    const { data, error } = await supabase
      .from(TABLES.COMPARISON_TABLES)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'ComparisonTable', id, `Updated: ${updates.title}`, userId, 'Admin');

    return data as ComparisonTable;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.COMPARISON_TABLES).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'ComparisonTable', id, 'Deleted comparison table', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO API
// ─────────────────────────────────────────────────────────────────────────────

export const portfolioApi = {
  async list(): Promise<Portfolio[]> {
    const { data, error } = await supabase
      .from(TABLES.PORTFOLIO)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as Portfolio[];
  },

  async create(item: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Portfolio> {
    const { data, error } = await supabase
      .from(TABLES.PORTFOLIO)
      .insert({
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'Portfolio', data.id, `Created: ${item.title}`, userId, 'Admin');

    return data as Portfolio;
  },

  async update(id: string, updates: Partial<Portfolio>, userId: string): Promise<Portfolio> {
    const { data, error } = await supabase
      .from(TABLES.PORTFOLIO)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'Portfolio', id, `Updated: ${updates.title}`, userId, 'Admin');

    return data as Portfolio;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.PORTFOLIO).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'Portfolio', id, 'Deleted portfolio item', userId, 'Admin');
  },

  async reorder(items: { id: string; order: number }[], userId: string): Promise<void> {
    for (const item of items) {
      await supabase
        .from(TABLES.PORTFOLIO)
        .update({ order: item.order, updatedAt: new Date().toISOString() })
        .eq('id', item.id);
    }

    await logActivity(ActivityAction.UPDATE, 'Portfolio', undefined, 'Reordered portfolio', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CASE STUDIES API
// ─────────────────────────────────────────────────────────────────────────────

export const caseStudiesApi = {
  async list(): Promise<CaseStudy[]> {
    const { data, error } = await supabase
      .from(TABLES.CASE_STUDIES)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as CaseStudy[];
  },

  async create(study: Omit<CaseStudy, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<CaseStudy> {
    const { data, error } = await supabase
      .from(TABLES.CASE_STUDIES)
      .insert({
        ...study,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'CaseStudy', data.id, `Created: ${study.title}`, userId, 'Admin');

    return data as CaseStudy;
  },

  async update(id: string, updates: Partial<CaseStudy>, userId: string): Promise<CaseStudy> {
    const { data, error } = await supabase
      .from(TABLES.CASE_STUDIES)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'CaseStudy', id, `Updated: ${updates.title}`, userId, 'Admin');

    return data as CaseStudy;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.CASE_STUDIES).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'CaseStudy', id, 'Deleted case study', userId, 'Admin');
  },

  async reorder(items: { id: string; order: number }[], userId: string): Promise<void> {
    for (const item of items) {
      await supabase
        .from(TABLES.CASE_STUDIES)
        .update({ order: item.order, updatedAt: new Date().toISOString() })
        .eq('id', item.id);
    }

    await logActivity(ActivityAction.UPDATE, 'CaseStudy', undefined, 'Reordered case studies', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STATISTICS API
// ─────────────────────────────────────────────────────────────────────────────

export const statisticsApi = {
  async list(): Promise<Statistic[]> {
    const { data, error } = await supabase
      .from(TABLES.STATISTICS)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as Statistic[];
  },

  async create(stat: Omit<Statistic, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Statistic> {
    const { data, error } = await supabase
      .from(TABLES.STATISTICS)
      .insert({
        ...stat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'Statistic', data.id, `Created: ${stat.label}`, userId, 'Admin');

    return data as Statistic;
  },

  async update(id: string, updates: Partial<Statistic>, userId: string): Promise<Statistic> {
    const { data, error } = await supabase
      .from(TABLES.STATISTICS)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'Statistic', id, `Updated: ${updates.label}`, userId, 'Admin');

    return data as Statistic;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.STATISTICS).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'Statistic', id, 'Deleted statistic', userId, 'Admin');
  },

  async reorder(items: { id: string; order: number }[], userId: string): Promise<void> {
    for (const item of items) {
      await supabase
        .from(TABLES.STATISTICS)
        .update({ order: item.order, updatedAt: new Date().toISOString() })
        .eq('id', item.id);
    }

    await logActivity(ActivityAction.UPDATE, 'Statistic', undefined, 'Reordered statistics', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT LOGOS API
// ─────────────────────────────────────────────────────────────────────────────

export const clientLogosApi = {
  async list(): Promise<ClientLogo[]> {
    const { data, error } = await supabase
      .from(TABLES.CLIENT_LOGOS)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as ClientLogo[];
  },

  async create(logo: Omit<ClientLogo, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<ClientLogo> {
    const { data, error } = await supabase
      .from(TABLES.CLIENT_LOGOS)
      .insert({
        ...logo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'ClientLogo', data.id, 'Created client logo', userId, 'Admin');

    return data as ClientLogo;
  },

  async update(id: string, updates: Partial<ClientLogo>, userId: string): Promise<ClientLogo> {
    const { data, error } = await supabase
      .from(TABLES.CLIENT_LOGOS)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'ClientLogo', id, 'Updated client logo', userId, 'Admin');

    return data as ClientLogo;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.CLIENT_LOGOS).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'ClientLogo', id, 'Deleted client logo', userId, 'Admin');
  },

  async reorder(items: { id: string; order: number }[], userId: string): Promise<void> {
    for (const item of items) {
      await supabase
        .from(TABLES.CLIENT_LOGOS)
        .update({ order: item.order, updatedAt: new Date().toISOString() })
        .eq('id', item.id);
    }

    await logActivity(ActivityAction.UPDATE, 'ClientLogo', undefined, 'Reordered client logos', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MEMBERS API
// ─────────────────────────────────────────────────────────────────────────────

export const teamMembersApi = {
  async list(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from(TABLES.TEAM_MEMBERS)
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as TeamMember[];
  },

  async create(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<TeamMember> {
    const { data, error } = await supabase
      .from(TABLES.TEAM_MEMBERS)
      .insert({
        ...member,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'TeamMember', data.id, `Created: ${member.name}`, userId, 'Admin');

    return data as TeamMember;
  },

  async update(id: string, updates: Partial<TeamMember>, userId: string): Promise<TeamMember> {
    const { data, error } = await supabase
      .from(TABLES.TEAM_MEMBERS)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'TeamMember', id, `Updated: ${updates.name}`, userId, 'Admin');

    return data as TeamMember;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.TEAM_MEMBERS).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'TeamMember', id, 'Deleted team member', userId, 'Admin');
  },

  async reorder(items: { id: string; order: number }[], userId: string): Promise<void> {
    for (const item of items) {
      await supabase
        .from(TABLES.TEAM_MEMBERS)
        .update({ order: item.order, updatedAt: new Date().toISOString() })
        .eq('id', item.id);
    }

    await logActivity(ActivityAction.UPDATE, 'TeamMember', undefined, 'Reordered team members', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT FORM API
// ─────────────────────────────────────────────────────────────────────────────

export const contactFormApi = {
  async get(): Promise<ContactForm | null> {
    const { data, error } = await supabase
      .from(TABLES.CONTACT_FORMS)
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as ContactForm) || null;
  },

  async update(form: Partial<ContactForm>, userId: string): Promise<ContactForm> {
    const existing = await this.get();

    if (!existing) {
      const { data, error } = await supabase
        .from(TABLES.CONTACT_FORMS)
        .insert({
          ...form,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as ContactForm;
    }

    const { data, error } = await supabase
      .from(TABLES.CONTACT_FORMS)
      .update({
        ...form,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'ContactForm', existing.id, 'Updated contact form', userId, 'Admin');

    return data as ContactForm;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// NEWSLETTER API
// ─────────────────────────────────────────────────────────────────────────────

export const newsletterApi = {
  async get(): Promise<Newsletter | null> {
    const { data, error } = await supabase
      .from(TABLES.NEWSLETTERS)
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as Newsletter) || null;
  },

  async update(newsletter: Partial<Newsletter>, userId: string): Promise<Newsletter> {
    const existing = await this.get();

    if (!existing) {
      const { data, error } = await supabase
        .from(TABLES.NEWSLETTERS)
        .insert({
          ...newsletter,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as Newsletter;
    }

    const { data, error } = await supabase
      .from(TABLES.NEWSLETTERS)
      .update({
        ...newsletter,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'Newsletter', existing.id, 'Updated newsletter', userId, 'Admin');

    return data as Newsletter;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// RELATED CONTENT API
// ─────────────────────────────────────────────────────────────────────────────

export const relatedContentApi = {
  async get(): Promise<RelatedContent | null> {
    const { data, error } = await supabase
      .from(TABLES.RELATED_CONTENT)
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as RelatedContent) || null;
  },

  async update(content: Partial<RelatedContent>, userId: string): Promise<RelatedContent> {
    const existing = await this.get();

    if (!existing) {
      const { data, error } = await supabase
        .from(TABLES.RELATED_CONTENT)
        .insert({
          ...content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as RelatedContent;
    }

    const { data, error } = await supabase
      .from(TABLES.RELATED_CONTENT)
      .update({
        ...content,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'RelatedContent', existing.id, 'Updated related content', userId, 'Admin');

    return data as RelatedContent;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CTA API
// ─────────────────────────────────────────────────────────────────────────────

export const ctaApi = {
  async get(): Promise<CTA | null> {
    const { data, error } = await supabase
      .from(TABLES.CTAS)
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as CTA) || null;
  },

  async update(cta: Partial<CTA>, userId: string): Promise<CTA> {
    const existing = await this.get();

    if (!existing) {
      const { data, error } = await supabase
        .from(TABLES.CTAS)
        .insert({
          ...cta,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as CTA;
    }

    const { data, error } = await supabase
      .from(TABLES.CTAS)
      .update({
        ...cta,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'CTA', existing.id, 'Updated CTA', userId, 'Admin');

    return data as CTA;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SEO SETTINGS API
// ─────────────────────────────────────────────────────────────────────────────

export const seoSettingsApi = {
  async get(): Promise<SEOSettings | null> {
    const { data, error } = await supabase
      .from(TABLES.SEO_SETTINGS)
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as SEOSettings) || null;
  },

  async update(settings: Partial<SEOSettings>, userId: string): Promise<SEOSettings> {
    const existing = await this.get();

    if (!existing) {
      const { data, error } = await supabase
        .from(TABLES.SEO_SETTINGS)
        .insert({
          ...settings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as SEOSettings;
    }

    const { data, error } = await supabase
      .from(TABLES.SEO_SETTINGS)
      .update({
        ...settings,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'SEOSettings', existing.id, 'Updated SEO settings', userId, 'Admin');

    return data as SEOSettings;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA ASSETS API
// ─────────────────────────────────────────────────────────────────────────────

export const mediaAssetsApi = {
  async list(folder?: string): Promise<MediaAsset[]> {
    let query = supabase
      .from(TABLES.MEDIA_ASSETS)
      .select('*')
      .order('createdAt', { ascending: false });

    if (folder) {
      query = query.eq('folder', folder);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as MediaAsset[];
  },

  async create(asset: Omit<MediaAsset, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<MediaAsset> {
    const { data, error } = await supabase
      .from(TABLES.MEDIA_ASSETS)
      .insert({
        ...asset,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadedBy: userId,
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.CREATE, 'MediaAsset', data.id, `Uploaded: ${asset.name}`, userId, 'Admin');

    return data as MediaAsset;
  },

  async update(id: string, updates: Partial<MediaAsset>, userId: string): Promise<MediaAsset> {
    const { data, error } = await supabase
      .from(TABLES.MEDIA_ASSETS)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logActivity(ActivityAction.UPDATE, 'MediaAsset', id, `Updated: ${updates.name}`, userId, 'Admin');

    return data as MediaAsset;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase.from(TABLES.MEDIA_ASSETS).delete().eq('id', id);

    if (error) throw error;

    await logActivity(ActivityAction.DELETE, 'MediaAsset', id, 'Deleted media asset', userId, 'Admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// REVISIONS API
// ─────────────────────────────────────────────────────────────────────────────

export const revisionsApi = {
  async list(entityId: string): Promise<Revision[]> {
    const { data, error } = await supabase
      .from(TABLES.REVISIONS)
      .select('*')
      .eq('entityId', entityId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data as Revision[];
  },

  async restore(revisionId: string, userId: string): Promise<void> {
    const { data: revision } = await supabase
      .from(TABLES.REVISIONS)
      .select('*')
      .eq('id', revisionId)
      .single();

    if (!revision) throw new Error('Revision not found');

    const table = TABLES[revision.entityType.toUpperCase() as keyof typeof TABLES] as string;
    const { error } = await supabase
      .from(table)
      .update({
        ...revision.data,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      })
      .eq('id', revision.entityId);

    if (error) throw error;

    await logActivity(ActivityAction.RESTORE, revision.entityType, revision.entityId, 'Restored revision', userId, 'Admin');
  },
};

// Export all APIs
export const cmsApi = {
  services: servicesApi,
  categories: categoriesApi,
  features: featuresApi,
  benefits: benefitsApi,
  processSteps: processStepsApi,
  deliverables: deliverablesApi,
  technologies: technologiesApi,
  pricing: pricingApi,
  comparisonTables: comparisonTablesApi,
  portfolio: portfolioApi,
  caseStudies: caseStudiesApi,
  statistics: statisticsApi,
  clientLogos: clientLogosApi,
  testimonials: testimonialApi,
  teamMembers: teamMembersApi,
  faq: faqApi,
  contactForm: contactFormApi,
  newsletter: newsletterApi,
  relatedContent: relatedContentApi,
  cta: ctaApi,
  seoSettings: seoSettingsApi,
  mediaAssets: mediaAssetsApi,
  revisions: revisionsApi,
  pageSettings: pageSettingsApi,
  activityLog: activityLogApi,
};
