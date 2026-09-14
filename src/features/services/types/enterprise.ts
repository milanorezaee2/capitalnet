// ─── Enterprise Service Page - Complete Data Models ───────────────────────────────────
// Comprehensive TypeScript types for all service page entities
// All data is designed to be CMS-manageable

// ── Enums ─────────────────────────────────────────────────────────────────────────────

export enum ServiceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ServiceCategory {
  STRATEGY = 'strategy',
  DESIGN = 'design',
  DEVELOPMENT = 'development',
  MARKETING = 'marketing',
  CONSULTING = 'consulting',
}

export enum PricingPlanType {
  BASIC = 'basic',
  GROWTH = 'growth',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  ICON = 'icon',
  DOCUMENT = 'document',
}

export enum TestimonialRating {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

// ── Core Service Entity ─────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  category: ServiceCategory;
  status: ServiceStatus;
  featured: boolean;
  sortOrder: number;
  
  // Media
  thumbnail?: Media;
  heroImage?: Media;
  gallery?: Media[];
  
  // Pricing
  pricing?: PricingPlan[];
  
  // Content
  features?: Feature[];
  benefits?: Benefit[];
  deliverables?: string[];
  technologies?: Technology[];
  
  // Process
  processSteps?: ProcessStep[];
  
  // Social Proof
  testimonials?: Testimonial[];
  caseStudies?: CaseStudy[];
  portfolioItems?: PortfolioItem[];
  
  // SEO
  seo?: SEOSettings;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  author?: string;
}

// ── Category Entity ───────────────────────────────────────────────────────────────────

export interface ServiceCategoryEntity {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  featured: boolean;
  services?: Service[];
}

// ── Feature Entity ────────────────────────────────────────────────────────────────────

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  status: 'active' | 'coming_soon' | 'beta';
  category?: string;
  sortOrder: number;
}

// ── Benefit Entity ────────────────────────────────────────────────────────────────────

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon?: string;
  sortOrder: number;
}

// ── Process Step Entity ─────────────────────────────────────────────────────────────

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  duration?: string;
  icon?: string;
  sortOrder: number;
}

// ── Deliverable Entity ───────────────────────────────────────────────────────────────

export interface Deliverable {
  id: string;
  title: string;
  description?: string;
  format: string;
  included: boolean;
  sortOrder: number;
}

// ── Technology Entity ───────────────────────────────────────────────────────────────

export interface Technology {
  id: string;
  name: string;
  version?: string;
  category: string;
  icon?: string;
  url?: string;
  featured: boolean;
}

// ── Pricing Plan Entity ─────────────────────────────────────────────────────────────

export interface PricingPlan {
  id: string;
  name: string;
  type: PricingPlanType;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly' | 'one_time';
  description: string;
  features: PricingFeature[];
  limitations?: string[];
  featured: boolean;
  sortOrder: number;
  ctaLabel: string;
  ctaLink?: string;
}

export interface PricingFeature {
  id: string;
  title: string;
  description?: string;
  included: boolean;
  limit?: number;
}

// ── Portfolio Item Entity ────────────────────────────────────────────────────────────

export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  client?: string;
  thumbnail: Media;
  images?: Media[];
  technologies: string[];
  category: string;
  featured: boolean;
  sortOrder: number;
  url?: string;
  caseStudy?: CaseStudy;
}

// ── Case Study Entity ────────────────────────────────────────────────────────────────

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string;
  metrics?: CaseStudyMetric[];
  thumbnail?: Media;
  gallery?: Media[];
  testimonial?: Testimonial;
  technologies: string[];
  featured: boolean;
  sortOrder: number;
  publishedAt?: string;
}

export interface CaseStudyMetric {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

// ── Statistic Entity ───────────────────────────────────────────────────────────────

export interface Statistic {
  id: string;
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  description?: string;
  category: string;
  sortOrder: number;
}

// ── Client Logo Entity ──────────────────────────────────────────────────────────────

export interface ClientLogo {
  id: string;
  name: string;
  logo: Media;
  url?: string;
  featured: boolean;
  sortOrder: number;
}

// ── Testimonial Entity ─────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: TestimonialRating;
  avatar?: Media;
  featured?: boolean;
  verified?: boolean;
  sortOrder: number;
  serviceId?: string;
  projectId?: string;
}

// ── Team Member Entity ──────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatar?: Media;
  social?: SocialLinks;
  expertise?: string[];
  featured: boolean;
  sortOrder: number;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

// ── FAQ Entity ───────────────────────────────────────────────────────────────────────

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
  featured: boolean;
}

// ── CTA Section Entity ───────────────────────────────────────────────────────────────

export interface CTASection {
  id: string;
  type: 'contact' | 'consultation' | 'demo' | 'trial';
  title: string;
  description: string;
  primaryButton: {
    label: string;
    link: string;
    variant?: 'primary' | 'secondary';
  };
  secondaryButton?: {
    label: string;
    link: string;
  };
  backgroundImage?: Media;
  enabled: boolean;
}

// ── Contact Form Entity ──────────────────────────────────────────────────────────────

export interface ContactForm {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  submitButton: {
    label: string;
  };
  successMessage: string;
  enabled: boolean;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

// ── Related Content Entity ───────────────────────────────────────────────────────────

export interface RelatedService {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail?: Media;
}

export interface RelatedBlogPost {
  id: string;
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  thumbnail?: Media;
}

// ── Newsletter Entity ────────────────────────────────────────────────────────────────

export interface Newsletter {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  buttonLabel: string;
  enabled: boolean;
}

// ── Media Entity ────────────────────────────────────────────────────────────────────

export interface Media {
  id: string;
  type: MediaType;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  size?: number;
  format?: string;
}

// ── SEO Settings Entity ─────────────────────────────────────────────────────────────

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: Media;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: Media;
  noindex?: boolean;
  nofollow?: boolean;
}

// ── Page Settings Entity ────────────────────────────────────────────────────────────

export interface ServicePageSettings {
  enabled: boolean;
  hero: {
    badge: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    backgroundImage?: Media;
  };
  sections: {
    introduction: boolean;
    categories: boolean;
    features: boolean;
    benefits: boolean;
    whyChooseUs: boolean;
    process: boolean;
    deliverables: boolean;
    technologies: boolean;
    pricing: boolean;
    comparison: boolean;
    portfolio: boolean;
    caseStudies: boolean;
    statistics: boolean;
    clientLogos: boolean;
    testimonials: boolean;
    team: boolean;
    faq: boolean;
    cta: boolean;
    contact: boolean;
    relatedServices: boolean;
    relatedBlog: boolean;
    newsletter: boolean;
  };
  layout: {
    maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    spacing: 'compact' | 'normal' | 'relaxed';
  };
}

// ── Custom Section Builder Types ─────────────────────────────────────────────

export type CustomBlockType =
  | 'heading'
  | 'text'
  | 'image'
  | 'icon'
  | 'badge'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'two_col'
  | 'card'
  | 'highlight'
  | 'sticker';

export interface CustomBlock {
  id: string;
  type: CustomBlockType;
  // heading / text / badge / button / highlight / card
  content?: string;
  // heading
  level?: 'h2' | 'h3' | 'h4';
  // text
  align?: 'right' | 'center' | 'left';
  // image
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  // icon (Emoji or Lucide name)
  icon?: string;
  iconSize?: 'sm' | 'md' | 'lg' | 'xl';
  iconColor?: string;
  // badge
  badgeColor?: string;
  // button
  buttonUrl?: string;
  buttonVariant?: 'primary' | 'outline' | 'ghost';
  // divider
  dividerStyle?: 'line' | 'dots' | 'wave';
  // spacer
  spacerSize?: 'xs' | 'sm' | 'md' | 'lg';
  // two_col — each col is an array of sub-block ids (we store as text)
  colLeft?: string;
  colRight?: string;
  // card
  cardAccent?: string;
  cardSubtitle?: string;
  // sticker (emoji big display)
  sticker?: string;
  stickerSize?: 'md' | 'lg' | 'xl';
  // style overrides
  textColor?: string;
  bgColor?: string;
  paddingY?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CustomSection {
  id: string;
  title: string;            // admin label
  eyebrow?: string;         // small label above heading
  heading?: string;         // section heading
  headingAlign?: 'right' | 'center' | 'left';
  accentColor?: string;     // theme colour for this section
  bgVariant?: 'dark' | 'darker' | 'transparent';
  enabled: boolean;
  position: number;         // order among ALL page sections (0 = after hero, higher = later)
  blocks: CustomBlock[];
}

// ── Services Overview Item ────────────────────────────────────────────────────

export interface ServicesOverviewItem {
  id: string;
  title: string;
  description: string;
  /** hex color used for icon bg tint + accent decoration */
  accent: string;
  sortOrder: number;
}

export interface ServicesOverviewContent {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  intro: string;
  bottomNote: string;
  items: ServicesOverviewItem[];
}

// ── Complete Page Content Entity ─────────────────────────────────────────────────────

export interface EnterpriseServicePageContent {
  settings: ServicePageSettings;
  hero: HeroContent;
  introduction: IntroductionContent;
  servicesOverview: ServicesOverviewContent;
  categories: ServiceCategoryEntity[];
  features: Feature[];
  benefits: Benefit[];
  whyChooseUs: WhyChooseUsContent;
  process: ProcessStep[];
  deliverables: Deliverable[];
  technologies: Technology[];
  pricingPlans: PricingPlan[];
  comparison: ComparisonTable;
  portfolio: PortfolioItem[];
  caseStudies: CaseStudy[];
  statistics: Statistic[];
  clientLogos: ClientLogo[];
  testimonials: Testimonial[];
  team: TeamMember[];
  faqs: FAQ[];
  cta: CTASection;
  contact: ContactForm;
  relatedServices: RelatedService[];
  relatedBlog: RelatedBlogPost[];
  newsletter: Newsletter;
  customSections: CustomSection[];
}

// ── Content Sub-Types ───────────────────────────────────────────────────────────────

export interface HeroContent {
  badge: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  stats: Array<{ label: string; value: string }>;
  trustBadges: string[];
  backgroundImage?: Media;
}

export interface IntroductionContent {
  title: string;
  description: string;
  uses: string[];
  audience: string[];
  value: string[];
  advantages: string[];
}

export interface WhyChooseUsContent {
  title: string;
  description: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    accent: string;
  }>;
}

export interface ComparisonTable {
  title: string;
  description: string;
  columns: string[];
  rows: Array<{
    label: string;
    values: string[];
  }>;
}

// ── API Response Types ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ServiceFilters {
  category?: ServiceCategory;
  status?: ServiceStatus;
  featured?: boolean;
  search?: string;
}

// ── Form Submission Types ────────────────────────────────────────────────────────────

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: string;
  message: string;
  file?: File;
}

export interface NewsletterFormData {
  email: string;
}
