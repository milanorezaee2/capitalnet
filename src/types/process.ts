/**
 * Enterprise Process Page - TypeScript Data Models
 * Feature-Based Architecture with Normalized Data Structure
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export type ID = string;
export type Timestamp = string;
export type Locale = 'fa' | 'en';
export type Status = 'draft' | 'published' | 'archived';

export interface MediaAsset {
  id: ID;
  url: string;
  alt: string;
  type: 'image' | 'video' | 'icon' | 'illustration';
  width?: number;
  height?: number;
  mimeType?: string;
  size?: number;
  optimizedUrl?: string;
  webpUrl?: string;
  avifUrl?: string;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: Record<string, any>;
}

// ============================================================================
// PROCESS PAGE TYPES
// ============================================================================

export interface ProcessPage {
  id: ID;
  slug: string;
  locale: Locale;
  status: Status;
  hero: HeroSection;
  overview: ProcessOverview;
  timeline: TimelineProcess;
  workflow: WorkflowDiagram;
  deliverables: DeliverableSection;
  timelineSchedule: ProjectTimeline;
  team: TeamSection;
  technologies: TechnologySection;
  qualityAssurance: QualityAssuranceSection;
  statistics: StatisticsSection;
  testimonials: TestimonialSection;
  faq: FAQSection;
  cta: CTASection;
  contact: ContactSection;
  relatedServices: RelatedContentSection;
  relatedBlog: RelatedContentSection;
  newsletter: NewsletterSection;
  seo: SEOSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

export interface HeroSection {
  enabled: boolean;
  order: number;
  badge: {
    enabled: boolean;
    text: string;
    variant: 'primary' | 'secondary' | 'accent';
  };
  title: string;
  subtitle: string;
  description: string;
  primaryCTA: CTAButton;
  secondaryCTA?: CTAButton;
  media: {
    type: 'image' | 'video';
    asset?: MediaAsset;
    videoUrl?: string;
    posterImage?: MediaAsset;
  };
  statistics?: HeroStatistics;
  trustIndicators?: TrustIndicator[];
  background: {
    type: 'gradient' | 'image' | 'video' | 'color';
    value: string;
    overlay?: string;
  };
}

export interface CTAButton {
  text: string;
  url: string;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  icon?: string;
  openInNewTab?: boolean;
}

export interface HeroStatistics {
  enabled: boolean;
  items: {
    label: string;
    value: string;
    prefix?: string;
    suffix?: string;
  }[];
}

export interface TrustIndicator {
  id: ID;
  type: 'logo' | 'badge' | 'certification' | 'rating';
  title: string;
  description?: string;
  icon?: string;
  image?: MediaAsset;
  link?: string;
}

export interface ProcessOverview {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  objectives: string[];
  methodology: string;
  benefits: string[];
  valueProposition: string;
  media?: MediaAsset;
}

export interface TimelineProcess {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  variant: 'vertical' | 'horizontal' | 'responsive';
  steps: ProcessStep[];
}

export interface ProcessStep {
  id: ID;
  order: number;
  number: number;
  title: string;
  description: string;
  detailedDescription?: string;
  icon?: string;
  iconType?: 'lucide' | 'custom' | 'emoji';
  image?: MediaAsset;
  duration: string;
  durationValue?: number; // in days
  outputs: string[];
  responsibilities: string[];
  status?: 'pending' | 'in-progress' | 'completed';
  dependencies?: ID[]; // step IDs this depends on
  milestone?: boolean;
  deliverables?: ID[]; // reference to deliverables
  teamRoles?: ID[]; // reference to team roles
}

export interface WorkflowDiagram {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  type: 'flowchart' | 'pipeline' | 'roadmap' | 'circular';
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  layout?: 'top-to-bottom' | 'left-to-right' | 'circular';
}

export interface WorkflowNode {
  id: ID;
  type: 'start' | 'process' | 'decision' | 'end' | 'milestone';
  label: string;
  description?: string;
  icon?: string;
  position: { x: number; y: number };
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  };
  metadata?: Record<string, any>;
}

export interface WorkflowConnection {
  id: ID;
  from: ID;
  to: ID;
  label?: string;
  type?: 'solid' | 'dashed' | 'dotted';
  animated?: boolean;
  condition?: string;
}

export interface DeliverableSection {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  deliverables: Deliverable[];
}

export interface Deliverable {
  id: ID;
  stepId: ID;
  title: string;
  description: string;
  type: 'document' | 'code' | 'design' | 'report' | 'training' | 'meeting' | 'other';
  format?: string;
  quantity?: number;
  specifications?: string[];
  preview?: MediaAsset;
  downloadUrl?: string;
  included: boolean;
}

export interface ProjectTimeline {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  totalDuration: string;
  totalDurationValue?: number;
  phases: TimelinePhase[];
  ganttChart?: boolean;
}

export interface TimelinePhase {
  id: ID;
  name: string;
  startDate?: string;
  endDate?: string;
  duration: string;
  durationValue?: number;
  steps: ID[]; // reference to process steps
  dependencies?: ID[];
  color?: string;
  milestone?: boolean;
}

export interface TeamSection {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  roles: TeamRole[];
}

export interface TeamRole {
  id: ID;
  stepId?: ID;
  name: string;
  title: string;
  role: string;
  expertise: string[];
  avatar?: MediaAsset;
  bio?: string;
  responsibilities: string[];
  linkedinUrl?: string;
  email?: string;
}

export interface TechnologySection {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  categories: TechnologyCategory[];
}

export interface TechnologyCategory {
  id: ID;
  name: string;
  description?: string;
  technologies: Technology[];
}

export interface Technology {
  id: ID;
  name: string;
  description?: string;
  version?: string;
  icon?: string;
  logo?: MediaAsset;
  website?: string;
  documentationUrl?: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface QualityAssuranceSection {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  processes: QAProcess[];
}

export interface QAProcess {
  id: ID;
  name: string;
  description: string;
  type: 'testing' | 'review' | 'security' | 'optimization' | 'documentation';
  tools?: string[];
  standards?: string[];
  frequency?: string;
}

export interface StatisticsSection {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  statistics: Statistic[];
  layout?: 'grid' | 'carousel' | 'counter';
}

export interface Statistic {
  id: ID;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description?: string;
  icon?: string;
  color?: string;
  animated?: boolean;
}

export interface TestimonialSection {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  testimonials: Testimonial[];
  layout?: 'grid' | 'carousel' | 'masonry';
}

export interface Testimonial {
  id: ID;
  name: string;
  title: string;
  company: string;
  avatar?: MediaAsset;
  rating: number;
  maxRating?: number;
  text: string;
  projectType?: string;
  date?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  featured?: boolean;
}

export interface FAQSection {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  faqs: FAQ[];
  layout?: 'accordion' | 'grid' | 'list';
}

export interface FAQ {
  id: ID;
  question: string;
  answer: string;
  category?: string;
  order: number;
  featured?: boolean;
}

export interface CTASection {
  enabled: boolean;
  order: number;
  variant: 'banner' | 'section' | 'modal';
  title: string;
  description: string;
  primaryCTA: CTAButton;
  secondaryCTA?: CTAButton;
  background?: {
    type: 'gradient' | 'image' | 'color';
    value: string;
  };
  dismissible?: boolean;
}

export interface ContactSection {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  form: ContactForm;
  contactInfo?: ContactInfo[];
}

export interface ContactForm {
  fields: FormField[];
  submitButton: CTAButton;
  successMessage: string;
  errorMessage?: string;
  privacyPolicy?: string;
  recaptchaEnabled?: boolean;
}

export interface FormField {
  id: ID;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'range';
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    customMessage?: string;
  };
  options?: FormFieldOption[];
  description?: string;
  defaultValue?: any;
}

export interface FormFieldOption {
  value: string;
  label: string;
  icon?: string;
}

export interface ContactInfo {
  id: ID;
  type: 'email' | 'phone' | 'address' | 'hours' | 'social';
  label: string;
  value: string;
  icon?: string;
  link?: string;
}

export interface RelatedContentSection {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  items: RelatedContentItem[];
  maxItems?: number;
  layout?: 'grid' | 'carousel' | 'list';
}

export interface RelatedContentItem {
  id: ID;
  type: 'service' | 'blog' | 'case-study' | 'resource';
  title: string;
  description: string;
  slug: string;
  image?: MediaAsset;
  category?: string;
  date?: string;
  readTime?: string;
}

export interface NewsletterSection {
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  form: {
    emailPlaceholder: string;
    submitButton: CTAButton;
    successMessage: string;
    privacyPolicy?: string;
  };
  socialLinks?: SocialLink[];
}

export interface SocialLink {
  id: ID;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'github';
  url: string;
  icon?: string;
  label?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ProcessPageResponse {
  data: ProcessPage;
  meta?: {
    version: string;
    cachedAt?: Timestamp;
  };
}

export interface ProcessPageListResponse {
  data: ProcessPage[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

// ============================================================================
// FORM STATE TYPES
// ============================================================================

export interface ContactFormData {
  [key: string]: any;
}

export interface ContactFormState {
  data: ContactFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError?: string;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface ProcessCardProps {
  step: ProcessStep;
  variant?: 'default' | 'compact' | 'detailed';
  onClick?: (step: ProcessStep) => void;
  className?: string;
}

export interface TimelineProps {
  steps: ProcessStep[];
  variant?: 'vertical' | 'horizontal' | 'responsive';
  className?: string;
}

export interface WorkflowDiagramProps {
  workflow: WorkflowDiagram;
  interactive?: boolean;
  className?: string;
}

export interface StepCardProps {
  step: ProcessStep;
  expanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

export interface DeliverableCardProps {
  deliverable: Deliverable;
  className?: string;
}

export interface StatisticCardProps {
  statistic: Statistic;
  animate?: boolean;
  className?: string;
}

export interface TestimonialCardProps {
  testimonial: Testimonial;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export interface TeamCardProps {
  member: TeamRole;
  variant?: 'default' | 'compact';
  className?: string;
}

export interface FAQProps {
  faq: FAQ;
  defaultOpen?: boolean;
  className?: string;
}

export interface AccordionProps {
  items: FAQ[];
  allowMultiple?: boolean;
  className?: string;
}

export interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  className?: string;
}

export interface TagProps {
  text: string;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface TabsProps {
  items: {
    id: string;
    label: string;
    content: React.ReactNode;
    icon?: string;
  }[];
  defaultTab?: string;
  className?: string;
}

export interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}
