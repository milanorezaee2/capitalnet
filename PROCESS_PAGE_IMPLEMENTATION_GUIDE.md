# Enterprise Process Page - Implementation Guide

## Overview

This guide provides comprehensive documentation for implementing and using the Enterprise Process Page system. The system is designed to be modern, scalable, and fully manageable through a CMS panel.

## Architecture

### Feature-Based Architecture

The project follows a feature-based architecture pattern:

```
src/
├── components/
│   ├── ui/              # Reusable base components
│   ├── process/         # Process-specific components
│   ├── seo/             # SEO components
│   ├── accessibility/   # Accessibility components
│   └── performance/     # Performance components
├── features/
│   └── process/         # Process page feature
├── services/
│   └── processService.ts # API service layer
├── types/
│   └── process.ts       # TypeScript types
├── hooks/
│   ├── useAccessibility.ts
│   └── usePerformance.ts
├── config/
│   └── design-tokens.ts # Design system tokens
├── utils/
│   └── seo.ts           # SEO utilities
└── mocks/
    └── processPageMock.ts # Sample data
```

## Design System

### Design Tokens

The design system uses comprehensive tokens for consistency:

```typescript
import { designTokens } from './config/design-tokens';

// Colors
designTokens.colors.primary[500]
designTokens.colors.background.DEFAULT

// Typography
designTokens.typography.fontSize.h1
designTokens.typography.fontWeight.bold

// Spacing
designTokens.spacing[4] // 1rem

// Border Radius
designTokens.borderRadius.lg

// Shadows
designTokens.shadows['glass-md']
```

### Component Variants

All components support multiple variants:

- **Button**: `primary`, `secondary`, `outline`, `ghost`, `link`
- **Badge**: `primary`, `secondary`, `accent`, `success`, `warning`, `error`, `info`
- **Card**: `default`, `glass`, `elevated`, `outlined`

## Data Models

### Core Types

All data models are defined in `src/types/process.ts`:

```typescript
import { ProcessPage, ProcessStep, WorkflowDiagram } from './types/process';
```

### Data Structure

The ProcessPage follows a normalized structure:

- **Hero Section**: Main banner with CTAs and statistics
- **Overview Section**: Process introduction and objectives
- **Timeline Section**: Step-by-step process visualization
- **Workflow Section**: Interactive flowcharts and diagrams
- **Deliverables Section**: Project outputs and deliverables
- **Timeline Schedule**: Project phases and milestones
- **Team Section**: Team members and responsibilities
- **Technologies Section**: Tech stack and tools
- **Quality Assurance**: QA processes and standards
- **Statistics Section**: Key metrics and achievements
- **Testimonials Section**: Customer reviews
- **FAQ Section**: Common questions and answers
- **CTA Section**: Call-to-action banners
- **Contact Section**: Contact form and information
- **Related Services**: Related service offerings
- **Related Blog**: Related blog posts
- **Newsletter Section**: Newsletter subscription

## Components

### Base Components

#### Button

```tsx
import { Button } from './components/ui/Button';

<Button variant="primary" size="lg" icon={<ArrowRight />}>
  Click Me
</Button>
```

#### Badge

```tsx
import { Badge } from './components/ui/Badge';

<Badge text="New" variant="success" size="md" />
```

#### Card

```tsx
import { Card } from './components/ui/Card';

<Card variant="glass" hover={true}>
  <p>Card content</p>
</Card>
```

### Process Components

#### StepCard

```tsx
import { StepCard } from './components/process/StepCard';

<StepCard 
  step={processStep} 
  variant="default"
  expanded={true}
  onToggle={() => {}}
/>
```

#### Timeline

```tsx
import { Timeline } from './components/process/Timeline';

<Timeline 
  steps={processSteps} 
  variant="vertical"
/>
```

#### WorkflowDiagram

```tsx
import { WorkflowDiagram } from './components/process/WorkflowDiagram';

<WorkflowDiagram 
  workflow={workflowData} 
  interactive={true}
/>
```

## API Integration

### Service Layer

The API service is implemented as a singleton:

```typescript
import { processService } from './services/processService';

// Fetch a single process page
const page = await processService.getProcessPage('enterprise-process', 'fa');

// Fetch all process pages
const pages = await processService.getProcessPages('fa', 1, 10);

// Submit contact form
const result = await processService.submitContactForm(pageId, formData);

// Subscribe to newsletter
const result = await processService.subscribeToNewsletter(email, pageId);
```

### Environment Variables

Required environment variables:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Setup

### Running Migrations

1. Copy the migration file to your Supabase project:

```bash
# Run the SQL migration in Supabase SQL Editor
# File: supabase-migrations-process-page.sql
```

2. The migration creates:
   - 30+ tables for all process page sections
   - Proper relationships and constraints
   - Row Level Security (RLS) policies
   - Indexes for performance
   - Triggers for updated_at timestamps

### Database Structure

Key tables:
- `process_pages` - Main process pages
- `process_hero` - Hero section
- `process_timeline` - Timeline section
- `process_timeline_steps` - Individual steps
- `process_workflow` - Workflow diagrams
- `process_deliverables` - Deliverables
- `process_team` - Team members
- And 20+ more section tables

## SEO Implementation

### Meta Tags

```tsx
import { SEOMetaTags } from './components/seo/SEOMetaTags';

<SEOMetaTags 
  seo={pageData.seo} 
  canonicalUrl="https://yourdomain.com/process/enterprise-process"
/>
```

### Structured Data

```tsx
import { StructuredData } from './components/seo/StructuredData';

<StructuredData 
  page={pageData}
  organizationName="Your Company"
  organizationUrl="https://yourdomain.com"
/>
```

### SEO Utilities

```typescript
import { 
  generateMetaTitle, 
  generateMetaDescription,
  generateSlug,
  validateSEO 
} from './utils/seo';

const title = generateMetaTitle('Process Page', 'Your Company');
const description = generateMetaDescription('Your description');
const slug = generateSlug('Your Title');
const validation = validateSEO(seoData);
```

## Accessibility

### WCAG 2.2 AA Compliance

The system includes comprehensive accessibility features:

#### Skip Links

```tsx
import { SkipLink } from './components/accessibility/SkipLink';

<SkipLink href="#main-content">Skip to main content</SkipLink>
```

#### Live Regions

```tsx
import { LiveRegion } from './components/accessibility/LiveRegion';

<LiveRegion message="Content updated" priority="polite" />
```

#### Accessibility Hooks

```typescript
import { 
  useKeyboardNavigation,
  useFocusTrap,
  useReducedMotion,
  useScreenReader
} from './hooks/useAccessibility';

const { focusedIndex, setFocusedIndex } = useKeyboardNavigation(
  items, 
  onSelect
);
const containerRef = useFocusTrap(isModalOpen);
const prefersReducedMotion = useReducedMotion();
```

## Performance Optimization

### Lazy Loading

```tsx
import { LazyImage } from './components/performance/LazyImage';

<LazyImage 
  src="/image.jpg" 
  alt="Description"
  threshold={0.1}
  blurDataURL="/blur.jpg"
/>
```

### Code Splitting

```tsx
import { CodeSplitWrapper } from './components/performance/CodeSplitWrapper';

<CodeSplitWrapper
  componentLoader={() => import('./HeavyComponent')}
  fallback={<LoadingState />}
/>
```

### Performance Hooks

```typescript
import { 
  useIntersectionObserver,
  useDebounce,
  useThrottle,
  useVirtualScroll
} from './hooks/usePerformance';

const { elementRef, isVisible } = useIntersectionObserver();
const debouncedValue = useDebounce(value, 300);
```

## Usage Example

### Basic Implementation

```tsx
import React from 'react';
import { ProcessPage } from './features/process/ProcessPage';
import { processService } from './services/processService';
import { mockProcessPage } from './mocks/processPageMock';

function App() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // Use mock data for development
    setData(mockProcessPage);
    setLoading(false);
    
    // Or fetch from API
    // processService.getProcessPage('enterprise-process', 'fa')
    //   .then(response => setData(response.data))
    //   .catch(err => setError(err.message))
    //   .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <ProcessPage data={data} />;
}

export default App;
```

### With SEO and Accessibility

```tsx
import React from 'react';
import { ProcessPage } from './features/process/ProcessPage';
import { SEOMetaTags } from './components/seo/SEOMetaTags';
import { StructuredData } from './components/seo/StructuredData';
import { SkipLink } from './components/accessibility/SkipLink';

function ProcessPageWrapper() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    // Fetch data
    setData(mockProcessPage);
  }, []);

  if (!data) return null;

  return (
    <>
      <SEOMetaTags seo={data.seo} />
      <StructuredData page={data} />
      
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      
      <main id="main-content">
        <ProcessPage data={data} />
      </main>
    </>
  );
}
```

## Customization

### Theme Customization

Edit `src/config/design-tokens.ts` to customize:

```typescript
export const colors = {
  primary: {
    500: '#your-color', // Change primary color
 ),
  // ... other colors
};
```

### Component Styling

All components use Tailwind CSS with design tokens:

```tsx
<div className="bg-primary-500 text-white p-4 rounded-lg">
  Custom styled component
</div>
```

## Testing

### Using Mock Data

```typescript
import { mockProcessPage } from './mocks/processPageMock';

// Test with mock data
const testData = mockProcessPage;
```

### API Testing

```typescript
import { processService } from './services/processService';

// Test API calls
const page = await processService.getProcessPage('test-slug', 'fa');
console.log(page);
```

## Deployment

### Build Process

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Setup

Ensure environment variables are set:

```env
VITE_SUPABASE_URL=your-production-url
VITE_SUPABASE_ANON_KEY=your-production-key
```

## Best Practices

### 1. Always Use Types

```typescript
// Good
const step: ProcessStep = { /* ... */ };

// Bad
const step = { /* ... */ };
```

### 2. Use Design Tokens

```typescript
// Good
<div style={{ color: designTokens.colors.text.DEFAULT }}>

// Bad
<div style={{ color: '#ffffff' }}>
```

### 3. Lazy Load Heavy Components

```typescript
// Good
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Bad
import HeavyComponent from './HeavyComponent';
```

### 4. Always Include Alt Text

```tsx
// Good
<img src="/image.jpg" alt="Description of image" />

// Bad
<img src="/image.jpg" />
```

### 5. Use Semantic HTML

```tsx
// Good
<main>
  <section>
    <h2>Title</h2>
  </section>
</main>

// Bad
<div>
  <div>
    <div>Title</div>
  </div>
</div>
```

## Troubleshooting

### Common Issues

#### 1. API Connection Failed

**Solution**: Check environment variables and Supabase configuration.

#### 2. Components Not Rendering

**Solution**: Ensure all imports are correct and components are properly exported.

#### 3. Styling Issues

**Solution**: Verify Tailwind CSS configuration and design tokens.

#### 4. TypeScript Errors

**Solution**: Check type definitions and ensure proper typing.

## Performance Targets

- **Lighthouse Score**: >95
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3.5s
- **Cumulative Layout Shift**: <0.1
- **Largest Contentful Paint**: <2.5s

## Accessibility Targets

- **WCAG 2.2 AA**: Full compliance
- **Keyboard Navigation**: Complete
- **Screen Reader**: Full support
- **Color Contrast**: AA compliant
- **Focus Indicators**: Clear and visible

## Support

For issues or questions:

1. Check this documentation
2. Review code comments
3. Check TypeScript types
4. Review mock data examples

## License

This implementation is part of the Capital Network project.

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Author**: Capital Network Development Team
