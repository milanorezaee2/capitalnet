/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 🏢 ENTERPRISE SERVICE CMS - DATABASE SCHEMA & TYPES
 * 
 * مدل‌های کامل برای سیستم مدیریت خدمات
 * Complete data models for Services CMS
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export enum ServiceStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  SEO_MANAGER = 'seo_manager',
  CONTENT_MANAGER = 'content_manager',
  VIEWER = 'viewer',
}

export enum ActivityAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  PUBLISH = 'publish',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  PDF = 'pdf',
  DOCUMENT = 'document',
  OTHER = 'other',
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE DOMAIN MODELS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Service - خدمت اصلی
 */
export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnail?: string;
  image?: string;
  status: ServiceStatus;
  categoryId?: string;
  featured: boolean;
  order: number;
  views: number;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  seoId?: string;
  version: number;
}

/**
 * ServiceCategory - دسته‌بندی خدمات
 */
export interface ServiceCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon?: string;
  image?: string;
  color?: string;
  order: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * ServiceFeature - ویژگی خدمت
 */
export interface ServiceFeature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  color?: string;
  status: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * ServiceBenefit - مزایا
 */
export interface ServiceBenefit {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * ProcessStep - مراحل انجام پروژه
 */
export interface ProcessStep {
  id: string;
  step: number;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  color?: string;
  link?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Deliverable - خروجی‌های پروژه
 */
export interface Deliverable {
  id: string;
  title: string;
  description: string;
  icon?: string;
  file?: string;
  downloadLink?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Technology - تکنولوژی
 */
export interface Technology {
  id: string;
  name: string;
  logo?: string;
  color?: string;
  link?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * PricingPlan - پلن قیمت‌گذاری
 */
export interface PricingPlan {
  id: string;
  title: string;
  price: number;
  discount?: number;
  currency: string;
  description: string;
  features: string[];
  limitations: string[];
  badge?: string;
  color?: string;
  buttonText: string;
  buttonLink: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * ComparisonTable - جدول مقایسه
 */
export interface ComparisonTable {
  id: string;
  title: string;
  headers: string[];
  rows: ComparisonRow[];
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonRow {
  id: string;
  label: string;
  values: string[];
}

/**
 * Portfolio - نمونه‌کار
 */
export interface Portfolio {
  id: string;
  image?: string;
  title: string;
  description: string;
  category?: string;
  technologies: string[];
  link?: string;
  featured: boolean;
  order: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * CaseStudy - مطالعات موردی
 */
export interface CaseStudy {
  id: string;
  title: string;
  challenge: string;
  solution: string;
  result: string;
  image?: string;
  statistics: {
    label: string;
    value: string;
  }[];
  link?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Statistic - آمار
 */
export interface Statistic {
  id: string;
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * ClientLogo - لوگوی مشتریان
 */
export interface ClientLogo {
  id: string;
  logo: string;
  alt?: string;
  link?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Testimonial - نظرات مشتریان
 */
export interface Testimonial {
  id: string;
  image?: string;
  name: string;
  position: string;
  company: string;
  rating: number;
  content: string;
  status: boolean;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * TeamMember - اعضای تیم
 */
export interface TeamMember {
  id: string;
  image?: string;
  name: string;
  position: string;
  expertise: string[];
  bio?: string;
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * FAQ - سوالات متداول
 */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  status: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ContactForm - تنظیمات فرم تماس
 */
export interface ContactForm {
  id: string;
  enabled: boolean;
  fields: FormField[];
  successMessage: string;
  errorMessage: string;
  recipientEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
}

/**
 * Newsletter - تنظیمات خبرنامه
 */
export interface Newsletter {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
  successMessage: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * RelatedContent - محتوای مرتبط
 */
export interface RelatedContent {
  id: string;
  blogArticles: string[];
  relatedServices: string[];
  autoSelect: boolean;
  count: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * CTA - فراخوان عمل
 */
export interface CTA {
  id: string;
  title: string;
  description: string;
  image?: string;
  background?: string;
  buttonText: string;
  buttonLink: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * SEOSettings - تنظیمات SEO
 */
export interface SEOSettings {
  id: string;
  metaTitle: string;
  metaDescription: string;
  canonical?: string;
  robots?: string;
  focusKeyword?: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  schemas: {
    serviceSchema: boolean;
    faqSchema: boolean;
    breadcrumb: boolean;
    organization: boolean;
    review: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * MediaAsset - دارایی‌های رسانه‌ای
 */
export interface MediaAsset {
  id: string;
  url: string;
  type: MediaType;
  name: string;
  alt?: string;
  caption?: string;
  size: number;
  width?: number;
  height?: number;
  mimeType: string;
  folder?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * PageSettings - تنظیمات صفحه
 */
export interface PageSettings {
  id: string;
  showBreadcrumb: boolean;
  showHero: boolean;
  showFAQ: boolean;
  showTeam: boolean;
  showPricing: boolean;
  showPortfolio: boolean;
  showContactForm: boolean;
  showNewsletter: boolean;
  showCTA: boolean;
  showCaseStudies: boolean;
  showTestimonials: boolean;
  showRelatedContent: boolean;
  sectionOrder: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Revision - نسخه‌های صفحه
 */
export interface Revision {
  id: string;
  entityType: string;
  entityId: string;
  data: Record<string, any>;
  changesSummary: string;
  createdBy: string;
  createdAt: string;
  isAutoSave: boolean;
}

/**
 * ActivityLog - گزارش فعالیت
 */
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: ActivityAction;
  entityType: string;
  entityId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

/**
 * Permission - سطح دسترسی
 */
export interface Permission {
  id: string;
  role: UserRole;
  resource: string;
  actions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    publish: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM STATE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isDirty: boolean;
  isSaving: boolean;
  isValid: boolean;
}

export interface BulkAction {
  type: 'publish' | 'archive' | 'delete' | 'duplicate';
  itemIds: string[];
}
