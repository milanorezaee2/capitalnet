// ─── Services Feature Exports ─────────────────────────────────────────────────────────────

// Service Page (now using Enterprise implementation)
export { ServicePage } from './components/ServicePage';
export { servicePageContent } from './data/servicePageContent';

// Enterprise Service Page exports
export { EnterpriseServicePage } from './components/EnterpriseServicePage';
export type { EnterpriseServicePageProps } from './components/EnterpriseServicePage';

// Enterprise data models
export type {
  Service,
  ServiceCategoryEntity,
  Feature,
  Benefit,
  ProcessStep,
  PricingPlan,
  PortfolioItem,
  CaseStudy,
  Statistic,
  ClientLogo,
  Testimonial,
  TeamMember,
  FAQ,
  CTASection,
  ContactForm,
  RelatedService,
  RelatedBlogPost,
  Newsletter,
  EnterpriseServicePageContent,
  HeroContent,
  IntroductionContent,
  ComparisonTable,
} from './types/enterprise';

export {
  ServiceStatus,
  ServiceCategory,
  PricingPlanType,
  MediaType,
  TestimonialRating,
} from './types/enterprise';

// Sample data
export { enterpriseServiceContent } from './data/enterpriseContent';

// Design system
export { designSystem } from './design-system';

// Hooks
export { useServiceSEO, useFAQSchema } from './hooks';

// UI Components
export {
  Button,
  Card,
  Badge,
  Input,
  Section,
  ServiceCard,
  PricingCard,
  TestimonialCard,
  Timeline,
  FAQ as FAQComponent,
  StatCard,
} from './components/ui';

// Section Components
export {
  Hero,
  Introduction,
  Categories,
  Features,
  Process,
  Pricing,
  Portfolio,
  CaseStudies,
  Statistics,
  ClientLogos,
  Testimonials,
  Team,
  FAQSection,
  Contact,
  Related,
  NewsletterSection,
} from './components/sections';
