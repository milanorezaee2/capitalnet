/**
 * Enterprise Process Page API Service
 * Service layer for fetching process page data from Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { 
  ProcessPage, 
  ProcessPageResponse, 
  ProcessPageListResponse,
  ContactFormData,
  ContactFormState 
} from '../types/process';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Process Page Service
 */
export class ProcessService {
  private static instance: ProcessService;

  private constructor() {}

  public static getInstance(): ProcessService {
    if (!ProcessService.instance) {
      ProcessService.instance = new ProcessService();
    }
    return ProcessService.instance;
  }

  /**
   * Fetch a single process page by slug
   */
  async getProcessPage(slug: string, locale: string = 'fa'): Promise<ProcessPageResponse> {
    try {
      const { data, error } = await supabase
        .from('process_pages')
        .select(`
          *,
          hero:process_hero(*),
          overview:process_overview(*),
          timeline:process_timeline(
            *,
            steps:process_timeline_steps(*)
          ),
          workflow:process_workflow(
            *,
            nodes:process_workflow_nodes(*),
            connections:process_workflow_connections(*)
          ),
          deliverables:process_deliverables(
            *,
            deliverables:process_deliverable_items(*)
          ),
          timeline_schedule:process_timeline_schedule(
            *,
            phases:process_timeline_phases(*)
          ),
          team:process_team(
            *,
            roles:process_team_roles(*)
          ),
          technologies:process_technologies(
            *,
            categories:process_technology_categories(
              *,
              technologies:process_technology_items(*)
            )
          ),
          quality_assurance:process_quality_assurance(
            *,
            processes:process_qa_processes(*)
          ),
          statistics:process_statistics(
            *,
            statistics:process_statistic_items(*)
          ),
          testimonials:process_testimonials(
            *,
            testimonials:process_testimonial_items(*)
          ),
          faq:process_faq(
            *,
            faqs:process_faq_items(*)
          ),
          cta:process_cta(*),
          contact:process_contact(
            *,
            form:process_contact_form(*),
            contact_info:process_contact_info(*)
          ),
          related_services:process_related_services(
            *,
            items:process_related_content_items(*)
          ),
          related_blog:process_related_blog(
            *,
            items:process_related_content_items(*)
          ),
          newsletter:process_newsletter(
            *,
            social_links:process_social_links(*)
          )
        `)
        .eq('slug', slug)
        .eq('locale', locale)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      return {
        data: this.transformProcessPage(data),
        meta: {
          version: '1.0.0',
          cachedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error fetching process page:', error);
      throw error;
    }
  }

  /**
   * Fetch all process pages
   */
  async getProcessPages(
    locale: string = 'fa',
    page: number = 1,
    pageSize: number = 10
  ): Promise<ProcessPageListResponse> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('process_pages')
        .select('*', { count: 'exact' })
        .eq('locale', locale)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: data.map(page => this.transformProcessPage(page)),
        meta: {
          total: count || 0,
          page,
          pageSize,
        },
      };
    } catch (error) {
      console.error('Error fetching process pages:', error);
      throw error;
    }
  }

  /**
   * Submit contact form
   */
  async submitContactForm(
    pageId: string,
    formData: ContactFormData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase
        .from('process_submissions')
        .insert({
          process_page_id: pageId,
          form_data: formData,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'فرم با موفقیت ارسال شد',
      };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return {
        success: false,
        message: 'خطا در ارسال فرم. لطفاً مجدداً تلاش کنید.',
      };
    }
  }

  /**
   * Subscribe to newsletter
   */
  async subscribeToNewsletter(
    email: string,
    pageId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email,
          process_page_id: pageId,
          subscribed_at: new Date().toISOString(),
        });

      if (error) throw error;

      return {
        success: true,
        message: 'عضویت شما با موفقیت انجام شد',
      };
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return {
        success: false,
        message: 'خطا در عضویت. لطفاً مجدداً تلاش کنید.',
      };
    }
  }

  /**
   * Transform database response to ProcessPage type
   */
  private transformProcessPage(data: any): ProcessPage {
    return {
      id: data.id,
      slug: data.slug,
      locale: data.locale,
      status: data.status,
      hero: this.transformHero(data.hero),
      overview: this.transformOverview(data.overview),
      timeline: this.transformTimeline(data.timeline),
      workflow: this.transformWorkflow(data.workflow),
      deliverables: this.transformDeliverables(data.deliverables),
      timelineSchedule: this.transformTimelineSchedule(data.timeline_schedule),
      team: this.transformTeam(data.team),
      technologies: this.transformTechnologies(data.technologies),
      qualityAssurance: this.transformQualityAssurance(data.quality_assurance),
      statistics: this.transformStatistics(data.statistics),
      testimonials: this.transformTestimonials(data.testimonials),
      faq: this.transformFAQ(data.faq),
      cta: this.transformCTA(data.cta),
      contact: this.transformContact(data.contact),
      relatedServices: this.transformRelatedContent(data.related_services),
      relatedBlog: this.transformRelatedContent(data.related_blog),
      newsletter: this.transformNewsletter(data.newsletter),
      seo: this.transformSEO(data.seo),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      publishedAt: data.published_at,
    };
  }

  private transformHero(data: any): any {
    if (!data) return this.getDefaultHero();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 1,
      badge: data.badge || { enabled: false, text: '', variant: 'primary' },
      title: data.title || '',
      subtitle: data.subtitle || '',
      description: data.description || '',
      primaryCTA: data.primary_cta || { text: '', url: '', variant: 'primary', size: 'lg' },
      secondaryCTA: data.secondary_cta,
      media: data.media || { type: 'image' },
      statistics: data.statistics,
      trustIndicators: data.trust_indicators,
      background: data.background || { type: 'gradient', value: '' },
    };
  }

  private transformOverview(data: any): any {
    if (!data) return this.getDefaultOverview();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 2,
      title: data.title || '',
      description: data.description || '',
      objectives: data.objectives || [],
      methodology: data.methodology || '',
      benefits: data.benefits || [],
      valueProposition: data.value_proposition || '',
      media: data.media,
    };
  }

  private transformTimeline(data: any): any {
    if (!data) return this.getDefaultTimeline();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 3,
      title: data.title || '',
      description: data.description || '',
      variant: data.variant || 'vertical',
      steps: (data.steps || []).map((step: any) => ({
        id: step.id,
        order: step.order,
        number: step.number,
        title: step.title,
        description: step.description,
        detailedDescription: step.detailed_description,
        icon: step.icon,
        iconType: step.icon_type,
        image: step.image,
        duration: step.duration,
        durationValue: step.duration_value,
        outputs: step.outputs || [],
        responsibilities: step.responsibilities || [],
        status: step.status,
        dependencies: step.dependencies,
        milestone: step.milestone,
        deliverables: step.deliverables,
        teamRoles: step.team_roles,
      })),
    };
  }

  private transformWorkflow(data: any): any {
    if (!data) return this.getDefaultWorkflow();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 4,
      title: data.title || '',
      description: data.description || '',
      type: data.type || 'flowchart',
      nodes: (data.nodes || []).map((node: any) => ({
        id: node.id,
        type: node.type,
        label: node.label,
        description: node.description,
        icon: node.icon,
        position: node.position,
        style: node.style,
        metadata: node.metadata,
      })),
      connections: (data.connections || []).map((conn: any) => ({
        id: conn.id,
        from: conn.from,
        to: conn.to,
        label: conn.label,
        type: conn.type,
        animated: conn.animated,
        condition: conn.condition,
      })),
      layout: data.layout,
    };
  }

  private transformDeliverables(data: any): any {
    if (!data) return this.getDefaultDeliverables();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 5,
      title: data.title || '',
      description: data.description || '',
      deliverables: (data.deliverables || []).map((del: any) => ({
        id: del.id,
        stepId: del.step_id,
        title: del.title,
        description: del.description,
        type: del.type,
        format: del.format,
        quantity: del.quantity,
        specifications: del.specifications,
        preview: del.preview,
        downloadUrl: del.download_url,
        included: del.included ?? true,
      })),
    };
  }

  private transformTimelineSchedule(data: any): any {
    if (!data) return this.getDefaultTimelineSchedule();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 6,
      title: data.title || '',
      description: data.description || '',
      totalDuration: data.total_duration || '',
      totalDurationValue: data.total_duration_value,
      phases: (data.phases || []).map((phase: any) => ({
        id: phase.id,
        name: phase.name,
        startDate: phase.start_date,
        endDate: phase.end_date,
        duration: phase.duration,
        durationValue: phase.duration_value,
        steps: phase.steps,
        dependencies: phase.dependencies,
        color: phase.color,
        milestone: phase.milestone,
      })),
      ganttChart: data.gantt_chart,
    };
  }

  private transformTeam(data: any): any {
    if (!data) return this.getDefaultTeam();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 7,
      title: data.title || '',
      description: data.description || '',
      roles: (data.roles || []).map((role: any) => ({
        id: role.id,
        stepId: role.step_id,
        name: role.name,
        title: role.title,
        role: role.role,
        expertise: role.expertise || [],
        avatar: role.avatar,
        bio: role.bio,
        responsibilities: role.responsibilities || [],
        linkedinUrl: role.linkedin_url,
        email: role.email,
      })),
    };
  }

  private transformTechnologies(data: any): any {
    if (!data) return this.getDefaultTechnologies();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 8,
      title: data.title || '',
      description: data.description || '',
      categories: (data.categories || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        technologies: (cat.technologies || []).map((tech: any) => ({
          id: tech.id,
          name: tech.name,
          description: tech.description,
          version: tech.version,
          icon: tech.icon,
          logo: tech.logo,
          website: tech.website,
          documentationUrl: tech.documentation_url,
          proficiency: tech.proficiency,
        })),
      })),
    };
  }

  private transformQualityAssurance(data: any): any {
    if (!data) return this.getDefaultQualityAssurance();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 9,
      title: data.title || '',
      description: data.description || '',
      processes: (data.processes || []).map((proc: any) => ({
        id: proc.id,
        name: proc.name,
        description: proc.description,
        type: proc.type,
        tools: proc.tools,
        standards: proc.standards,
        frequency: proc.frequency,
      })),
    };
  }

  private transformStatistics(data: any): any {
    if (!data) return this.getDefaultStatistics();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 10,
      title: data.title || '',
      description: data.description || '',
      statistics: (data.statistics || []).map((stat: any) => ({
        id: stat.id,
        label: stat.label,
        value: stat.value,
        prefix: stat.prefix,
        suffix: stat.suffix,
        description: stat.description,
        icon: stat.icon,
        color: stat.color,
        animated: stat.animated ?? true,
      })),
      layout: data.layout,
    };
  }

  private transformTestimonials(data: any): any {
    if (!data) return this.getDefaultTestimonials();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 11,
      title: data.title || '',
      description: data.description || '',
      testimonials: (data.testimonials || []).map((test: any) => ({
        id: test.id,
        name: test.name,
        title: test.title,
        company: test.company,
        avatar: test.avatar,
        rating: test.rating,
        maxRating: test.max_rating,
        text: test.text,
        projectType: test.project_type,
        date: test.date,
        linkedinUrl: test.linkedin_url,
        websiteUrl: test.website_url,
        featured: test.featured,
      })),
      layout: data.layout,
    };
  }

  private transformFAQ(data: any): any {
    if (!data) return this.getDefaultFAQ();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 12,
      title: data.title || '',
      description: data.description || '',
      faqs: (data.faqs || []).map((faq: any) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order: faq.order,
        featured: faq.featured,
      })),
      layout: data.layout,
    };
  }

  private transformCTA(data: any): any {
    if (!data) return this.getDefaultCTA();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 13,
      variant: data.variant || 'banner',
      title: data.title || '',
      description: data.description || '',
      primaryCTA: data.primary_cta || { text: '', url: '', variant: 'primary', size: 'lg' },
      secondaryCTA: data.secondary_cta,
      background: data.background,
      dismissible: data.dismissible,
    };
  }

  private transformContact(data: any): any {
    if (!data) return this.getDefaultContact();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 14,
      title: data.title || '',
      description: data.description || '',
      form: {
        fields: (data.form?.fields || []).map((field: any) => ({
          id: field.id,
          type: field.type,
          name: field.name,
          label: field.label,
          placeholder: field.placeholder,
          required: field.required,
          validation: field.validation,
          options: field.options,
          description: field.description,
          defaultValue: field.default_value,
        })),
        submitButton: data.form?.submit_button || { text: 'ارسال', variant: 'primary', size: 'lg' },
        successMessage: data.form?.success_message || 'فرم با موفقیت ارسال شد',
        errorMessage: data.form?.error_message,
        privacyPolicy: data.form?.privacy_policy,
        recaptchaEnabled: data.form?.recaptcha_enabled,
      },
      contactInfo: (data.contact_info || []).map((info: any) => ({
        id: info.id,
        type: info.type,
        label: info.label,
        value: info.value,
        icon: info.icon,
        link: info.link,
      })),
    };
  }

  private transformRelatedContent(data: any): any {
    if (!data) return this.getDefaultRelatedContent();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 15,
      title: data.title || '',
      description: data.description || '',
      items: (data.items || []).map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        slug: item.slug,
        image: item.image,
        category: item.category,
        date: item.date,
        readTime: item.read_time,
      })),
      maxItems: data.max_items,
      layout: data.layout,
    };
  }

  private transformNewsletter(data: any): any {
    if (!data) return this.getDefaultNewsletter();
    return {
      enabled: data.enabled ?? true,
      order: data.order ?? 16,
      title: data.title || '',
      description: data.description || '',
      form: {
        emailPlaceholder: data.form?.email_placeholder || 'ایمیل خود را وارد کنید',
        submitButton: data.form?.submit_button || { text: 'عضویت', variant: 'primary', size: 'lg' },
        successMessage: data.form?.success_message || 'عضویت شما با موفقیت انجام شد',
        privacyPolicy: data.form?.privacy_policy,
      },
      socialLinks: (data.social_links || []).map((link: any) => ({
        id: link.id,
        platform: link.platform,
        url: link.url,
        icon: link.icon,
        label: link.label,
      })),
    };
  }

  private transformSEO(data: any): any {
    return {
      metaTitle: data?.meta_title || '',
      metaDescription: data?.meta_description || '',
      canonicalUrl: data?.canonical_url,
      ogTitle: data?.og_title,
      ogDescription: data?.og_description,
      ogImage: data?.og_image,
      twitterCard: data?.twitter_card,
      twitterTitle: data?.twitter_title,
      twitterDescription: data?.twitter_description,
      twitterImage: data?.twitter_image,
      noindex: data?.noindex,
      nofollow: data?.nofollow,
      structuredData: data?.structured_data,
    };
  }

  // Default values for fallback
  private getDefaultHero() {
    return {
      enabled: true,
      order: 1,
      badge: { enabled: false, text: '', variant: 'primary' },
      title: 'فرآیند همکاری با ما',
      subtitle: 'مسیر موفقیت پروژه شما',
      description: 'با فرآیند استاندارد و حرفه‌ای ما، پروژه خود را با اطمینان پیش ببرید',
      primaryCTA: { text: 'شروع پروژه', url: '#contact', variant: 'primary', size: 'lg' },
      media: { type: 'image' },
      background: { type: 'gradient', value: '' },
    };
  }

  private getDefaultOverview() {
    return {
      enabled: true,
      order: 2,
      title: 'معرفی فرآیند',
      description: 'فرآیند جامع و استاندارد برای اجرای پروژه‌های موفق',
      objectives: [],
      methodology: '',
      benefits: [],
      valueProposition: '',
    };
  }

  private getDefaultTimeline() {
    return {
      enabled: true,
      order: 3,
      title: 'مراحل پروژه',
      description: 'مسیر کامل اجرای پروژه از شروع تا تحویل',
      variant: 'vertical',
      steps: [],
    };
  }

  private getDefaultWorkflow() {
    return {
      enabled: true,
      order: 4,
      title: 'نمودار جریان کار',
      description: 'نمایش بصری فرآیند اجرای پروژه',
      type: 'flowchart',
      nodes: [],
      connections: [],
    };
  }

  private getDefaultDeliverables() {
    return {
      enabled: true,
      order: 5,
      title: 'خروجی‌ها',
      description: 'محصولات و تحویل‌های هر مرحله',
      deliverables: [],
    };
  }

  private getDefaultTimelineSchedule() {
    return {
      enabled: true,
      order: 6,
      title: 'زمان‌بندی پروژه',
      description: 'برنامه زمانی کامل اجرای پروژه',
      totalDuration: '',
      phases: [],
    };
  }

  private getDefaultTeam() {
    return {
      enabled: true,
      order: 7,
      title: 'تیم پروژه',
      description: 'متخصصان و اعضای تیم اجرایی',
      roles: [],
    };
  }

  private getDefaultTechnologies() {
    return {
      enabled: true,
      order: 8,
      title: 'تکنولوژی‌ها',
      description: 'فناوری‌ها و ابزارهای مورد استفاده',
      categories: [],
    };
  }

  private getDefaultQualityAssurance() {
    return {
      enabled: true,
      order: 9,
      title: 'تضمین کیفیت',
      description: 'فرآیندهای کنترل کیفیت و تست',
      processes: [],
    };
  }

  private getDefaultStatistics() {
    return {
      enabled: true,
      order: 10,
      title: 'آمار و ارقام',
      description: 'دستاوردها و آمار پروژه‌ها',
      statistics: [],
    };
  }

  private getDefaultTestimonials() {
    return {
      enabled: true,
      order: 11,
      title: 'نظرات مشتریان',
      description: 'تجربه مشتریان ما با همکاری',
      testimonials: [],
    };
  }

  private getDefaultFAQ() {
    return {
      enabled: true,
      order: 12,
      title: 'سوالات متداول',
      description: 'پاسخ به سوالات رایج',
      faqs: [],
    };
  }

  private getDefaultCTA() {
    return {
      enabled: true,
      order: 13,
      variant: 'banner',
      title: 'آماده شروع پروژه هستید؟',
      description: 'همین حالا با ما تماس بگیرید و مشاوره رایگان دریافت کنید',
      primaryCTA: { text: 'تماس با ما', url: '#contact', variant: 'primary', size: 'lg' },
    };
  }

  private getDefaultContact() {
    return {
      enabled: true,
      order: 14,
      title: 'تماس با ما',
      description: 'برای شروع همکاری با ما تماس بگیرید',
      form: {
        fields: [],
        submitButton: { text: 'ارسال', variant: 'primary', size: 'lg' },
        successMessage: 'فرم با موفقیت ارسال شد',
      },
      contactInfo: [],
    };
  }

  private getDefaultRelatedContent() {
    return {
      enabled: true,
      order: 15,
      title: 'محتوای مرتبط',
      description: 'خدمات و مقالات مرتبط',
      items: [],
    };
  }

  private getDefaultNewsletter() {
    return {
      enabled: true,
      order: 16,
      title: 'خبرنامه',
      description: 'از آخرین اخبار و مقالات باخبر شوید',
      form: {
        emailPlaceholder: 'ایمیل خود را وارد کنید',
        submitButton: { text: 'عضویت', variant: 'primary', size: 'lg' },
        successMessage: 'عضویت شما با موفقیت انجام شد',
      },
      socialLinks: [],
    };
  }
}

// Export singleton instance
export const processService = ProcessService.getInstance();
