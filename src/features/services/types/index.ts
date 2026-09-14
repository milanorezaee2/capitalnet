export interface ServicePageCategory {
  id: string;
  title: string;
  description: string;
  href: string;
  accent: string;
  icon: string;
}

export interface ServicePageFeature {
  id: string;
  title: string;
  description: string;
  status: string;
  accent: string;
}

export interface ServicePageBenefit {
  id: string;
  title: string;
  description: string;
}

export interface ServicePageProcessStep {
  id: string;
  title: string;
  description: string;
}

export interface ServicePagePricingPlan {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  limitations: string[];
  featured?: boolean;
  ctaLabel: string;
}

export interface ServicePagePortfolioItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  href: string;
  image: string;
}

export interface ServicePageCaseStudy {
  id: string;
  title: string;
  problem: string;
  solution: string;
  result: string;
  metric: string;
}

export interface ServicePageStatistic {
  id: string;
  value: string;
  label: string;
}

export interface ServicePageTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  avatar: string;
}

export interface ServicePageTeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

export interface ServicePageFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ServicePageContent {
  hero: {
    badge: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stats: Array<{ label: string; value: string }>;
    trustBadges: string[];
  };
  introduction: {
    title: string;
    description: string;
    uses: string[];
    audience: string[];
    value: string[];
    advantages: string[];
  };
  categories: ServicePageCategory[];
  featuredServices: Array<{
    title: string;
    description: string;
    href: string;
    accent: string;
  }>;
  whyChooseUs: {
    title: string;
    description: string;
    items: ServicePageFeature[];
  };
  features: ServicePageFeature[];
  benefits: ServicePageBenefit[];
  process: ServicePageProcessStep[];
  deliverables: string[];
  technologies: string[];
  pricingPlans: ServicePagePricingPlan[];
  comparisonRows: Array<{ label: string; basic: string; growth: string; enterprise: string }>;
  portfolio: ServicePagePortfolioItem[];
  caseStudies: ServicePageCaseStudy[];
  statistics: ServicePageStatistic[];
  clientLogos: string[];
  testimonials: ServicePageTestimonial[];
  team: ServicePageTeamMember[];
  faqs: ServicePageFaqItem[];
  cta: {
    title: string;
    description: string;
    buttonLabel: string;
  };
  contact: {
    title: string;
    description: string;
  };
  relatedServices: Array<{ title: string; description: string; href: string }>;
  relatedBlog: Array<{ title: string; description: string; href: string }>;
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    buttonLabel: string;
  };
}
