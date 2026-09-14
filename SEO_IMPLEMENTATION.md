# 🚀 SEO Implementation Guide - Capital Network

## 📋 فهرست

1. [معماری سایت](#معماری-سایت)
2. [صفحات جدید](#صفحات-جدید)
3. [Meta Tags و Schema Markup](#meta-tags--schema-markup)
4. [Sitemap و RSS Feed](#sitemap--rss-feed)
5. [Internal Linking](#internal-linking)
6. [Best Practices](#best-practices)

---

## 🏗️ معماری سایت

### Path-Based Routing
سایت از path-based routing استفاده می‌کند برای بهتر SEO:

```
✅ GOOD (SEO-Friendly):
/blog/vc-ready-deck-guide
/blog/category/investment
/blog/tag/pitch-deck
/blog/author/ali-rezaei

❌ OLD (Hash-based):
/#/blog-post/vc-ready-deck-guide
```

### فایل‌های روتر
- [src/router/routes.ts](src/router/routes.ts) - مسیریابی و تبدیل مسیرها

---

## 📄 صفحات جدید

### 1. Category Page
- **مسیر**: `/blog/category/[category-name]`
- **فایل**: [src/components/BlogArchivePages.tsx](src/components/BlogArchivePages.tsx)
- **SEO**: تمام پست‌های یک دسته‌بندی در یک صفحه

**استفاده در App.tsx**:
```tsx
import { CategoryPage } from './components/BlogArchivePages';

// در main render:
{currentPage === 'category' && (
  <CategoryPage 
    categoryName={categoryName} 
    posts={allPosts} 
    onNavigate={handleNavigate}
    onBack={() => handleNavigate('blog')}
  />
)}
```

### 2. Tag Page
- **مسیر**: `/blog/tag/[tag-name]`
- **فایل**: [src/components/BlogArchivePages.tsx](src/components/BlogArchivePages.tsx)
- **SEO**: تمام پست‌های یک تگ در یک صفحه

### 3. Author Page
- **مسیر**: `/blog/author/[author-name]`
- **فایل**: [src/components/BlogArchivePages.tsx](src/components/BlogArchivePages.tsx)
- **SEO**: تمام پست‌های یک نویسنده در یک صفحه

---

## 🏷️ Meta Tags و Schema Markup

### استفاده SEO Hook

```tsx
import { useSEOMetaTags, createBreadcrumbItems } from '../hooks/useSEOMetaTags';
import { generateBlogPostMetaTags, generateBlogPostSchema } from '../lib/seoGenerator';

export function BlogPostDetail({ slug, ...props }: BlogPostDetailProps) {
  const post = posts.find(p => p.slug === slug);
  
  // Meta Tags
  const metaTags = generateBlogPostMetaTags(post, baseUrl, fallbackImage);
  useSEOMetaTags(metaTags);

  // Schema Markup
  const schema = generateBlogPostSchema(post, baseUrl);
  const breadcrumb = generateBreadcrumbSchema(
    createBreadcrumbItems('blog-post'),
    baseUrl
  );
  useSEOMetaTags(metaTags, [schema, breadcrumb]);

  return (
    <article>
      {/* Content */}
    </article>
  );
}
```

### Schema Types

1. **BlogPosting**: برای مقالات بلاگ
2. **BreadcrumbList**: برای navigation سلسله
3. **CollectionPage**: برای صفحات دسته‌بندی
4. **Organization**: برای اطلاعات شرکت

---

## 🗺️ Sitemap و RSS Feed

### تولید Sitemap

```
/sitemap.xml - شامل:
  ✓ تمام صفحات اصلی
  ✓ تمام مقالات بلاگ
  ✓ تمام صفحات دسته‌بندی
  ✓ تمام صفحات تگ
  ✓ تمام صفحات نویسندگان
```

### تولید RSS Feed

```
/feed.xml - شامل:
  ✓ ۲۰ آخرین پست
  ✓ تمام metadata
  ✓ محتوای کامل
  ✓ author و category اطلاعات
```

### Robots.txt

```
/robots.txt - شامل:
  ✓ User-agent rules
  ✓ Crawl delay
  ✓ Sitemap reference
```

---

## 🔗 Internal Linking

### Related Posts Component

```tsx
import { RelatedPosts, Breadcrumb } from '../components/RelatedPosts';

export function BlogPostDetail({ slug, posts, onNavigate }: Props) {
  const post = posts.find(p => p.slug === slug);
  
  return (
    <article>
      <Breadcrumb 
        items={[
          { name: 'خانه', url: '/' },
          { name: 'بلاگ', url: '/blog' },
          { name: post.title }
        ]}
        onNavigate={onNavigate}
      />

      {/* Content */}

      <RelatedPosts 
        currentPost={post}
        allPosts={posts}
        onNavigate={(slug) => navigateToPost(slug)}
      />
    </article>
  );
}
```

### Algorithm برای Related Posts

1. **دسته‌بندی** (35 امتیاز)
2. **تگ‌های مشترک** (۵ امتیاز برای هر تگ)
3. **نویسنده** (۲۰ امتیاز)

---

## ✅ Best Practices

### 1. Meta Descriptions
- **طول**: ۱۵۰-۱۶۰ کاراکتر
- **محتوا**: خلاصه‌ی شفاف و جذاب
- **کلیدواژه**: کلیدواژه‌ی اصلی را در ابتدا قرار دهید

### 2. Titles
- **طول**: ۵۰-۶۰ کاراکتر
- **فرمت**: `[Page Title] | Capital Network`
- **کلیدواژه**: کلیدواژه اصلی را در ابتدا قرار دهید

### 3. URLs
- **ساختار**: `/blog/[slug]`
- **کاراکتر**: فقط حروف، اعداد و خط‌تیره
- **طول**: تا جای ممکن کوتاه

### 4. Headers (H1, H2, H3)
- **H1**: فقط یکی در صفحه
- **H2/H3**: برای تقسیم‌بندی محتوا
- **کلیدواژه**: کلیدواژه‌های مرتبط را شامل کنید

### 5. Images
- **Alt Text**: توضیح دقیق تصویر
- **Format**: WebP برای بهتر performance
- **Compression**: تصاویر فشرده شده باشند

### 6. Links
- **Anchor Text**: توصیفی و معنی‌دار
- **Internal Links**: حداقل ۲-۳ لینک داخلی در هر صفحه
- **External Links**: فقط منابع معتبر

### 7. Content
- **طول**: حداقل ۱۵۰۰-۲۰۰۰ کلمه برای مقالات اصلی
- **استراتژی**: Pillar + Cluster (مقاله اصلی + مقالات مرتبط)
- **تازگی**: محتوا را منظم به‌روز کنید

---

## 📊 Monitoring و Testing

### Google Search Console
1. [اضافه کردن Sitemap](https://search.google.com/search-console)
2. [آزمایش Mobile Friendliness](https://search.google.com/test/mobile-friendly)
3. [بررسی Core Web Vitals](https://search.google.com/tools/core-web-vitals)

### Tools
- **PageSpeed Insights**: بررسی سرعت
- **Schema.org Validator**: بررسی schema markup
- **SEMrush**: تحلیل رقابتی

---

## 🔧 Implementation Checklist

### Phase 1: Foundation ✅
- [x] Router configuration
- [x] Meta tags system
- [x] Schema markup
- [x] Sitemap generator
- [x] RSS feed generator

### Phase 2: Pages
- [ ] Update App.tsx with new routes
- [ ] Implement CategoryPage
- [ ] Implement TagPage
- [ ] Implement AuthorPage
- [ ] Add Breadcrumb navigation

### Phase 3: Enhancement
- [ ] Add Table of Contents
- [ ] Optimize images
- [ ] Add author boxes
- [ ] Implement social sharing
- [ ] Add reading time estimator

### Phase 4: Testing
- [ ] Test all pages for SEO
- [ ] Validate schema markup
- [ ] Check Core Web Vitals
- [ ] Submit to Search Console
- [ ] Monitor rankings

---

## 📚 References

- [Google SEO Guide](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Moz SEO Guide](https://moz.com/beginners-guide-to-seo)
- [Yoast SEO Blog](https://yoast.com/seo/)

---

**آخرین به‌روزرسانی**: ۱۴۰۳/۱۱/۲۱
