# 🔗 Link Tracking System - Implementation Guide

## 📋 فهرست

1. [نمای کلی](#نمای-کلی)
2. [فایل‌های ایجاد شده](#فایل‌های-ایجاد-شده)
3. [استفاده](#استفاده)
4. [مثال‌ها](#مثال‌ها)
5. [Analytics Integration](#analytics-integration)

---

## 🎯 نمای کلی

سیستم tracking لینک‌ها به صورت خودکار **link_id** را به تمام لینک‌های داخلی اضافه می‌کند، تا بتوانید:

- ✅ تمام کلیک‌های لینک را track کنید
- ✅ مسیر کاربران را دنبال کنید
- ✅ conversion را اندازه‌گیری کنید
- ✅ صفحات محبوب را شناسایی کنید
- ✅ User Journey را درک کنید

**مثال**:
```
/blog/category/investment?link_id=168f9gk2-randomid
/blog/tag/pitch-deck?link_id=168f9xyz1-otherid
/contact?link_id=168f9abc3-contactid
```

---

## 📂 فایل‌های ایجاد شده

### 1. **src/lib/linkTracking.ts**
توابع هسته‌ای برای tracking:

```typescript
// تولید unique ID
generateLinkId()                    // "168f9gk2-randomid"

// افزودن link_id به URL
addLinkTracking(url, linkId)        // "/blog/category/investment?link_id=..."
buildTrackedLink(path, options)     // URL با query params

// اطلاعات tracking
getLinkIdFromUrl(url)               // استخراج link_id از URL
getCurrentQueryParams()             // تمام query params

// Analytics
trackLinkClick(linkId, path)        // فرستادن به Google Analytics
getTrackingInfo(linkId)             // دریافت tracking info
```

### 2. **src/hooks/useLinkTracking.ts**
React Hook برای tracking:

```typescript
// در component
const { generateTrackedLink, handleLinkClick, currentLinkId } = useLinkTracking();

// استفاده
const trackedUrl = generateTrackedLink('/blog/category/investment');
// نتیجه: /blog/category/investment?link_id=abc123
```

### 3. **src/components/TrackedLink.tsx**
React Components برای tracked links:

```tsx
// Tracked Link
<TrackedLink href="/blog/category/investment">
  سرمایه‌گذاری
</TrackedLink>

// Tracked Button
<TrackedButton onClick={(linkId) => navigate(linkId)}>
  رفتن به بلاگ
</TrackedButton>

// Tracking Info Display
<TrackingInfoDisplay linkId={linkId} path={path} clickCount={123} />
```

---

## 🚀 استفاده

### سناریو 1: لینک‌های ساده

```tsx
import { TrackedLink } from './components/TrackedLink';

function BlogPage() {
  return (
    <div>
      <TrackedLink href="/blog/category/investment" className="text-blue-500">
        دسته سرمایه‌گذاری
      </TrackedLink>
      
      <TrackedLink href="/blog/tag/pitch-deck">
        تگ Pitch Deck
      </TrackedLink>
    </div>
  );
}

// نتیجه:
// /blog/category/investment?link_id=168f9gk2-randomid
// /blog/tag/pitch-deck?link_id=168f9abc1-otherid
```

### سناریو 2: Navigation برنامه‌ریزی شده

```tsx
import { useLinkTracking } from './hooks/useLinkTracking';

function RelatedPosts() {
  const { generateTrackedLink, handleLinkClick } = useLinkTracking();

  const handleNavigate = (path: string) => {
    handleLinkClick(path);
    window.location.href = path;
  };

  return (
    <button 
      onClick={() => handleNavigate(generateTrackedLink('/blog/category/investment'))}
    >
      مقالات مرتبط
    </button>
  );
}
```

### سناریو 3: Custom Link ID

```tsx
import { TrackedLink } from './components/TrackedLink';

function CategoriesMenu() {
  return (
    <div>
      <TrackedLink 
        href="/blog/category/investment" 
        linkId="menu-category-investment"
      >
        سرمایه‌گذاری
      </TrackedLink>
      
      <TrackedLink 
        href="/blog/category/strategy"
        linkId="menu-category-strategy"
      >
        استراتژی
      </TrackedLink>
    </div>
  );
}

// نتیجه:
// /blog/category/investment?link_id=menu-category-investment
// /blog/category/strategy?link_id=menu-category-strategy
```

---

## 💡 مثال‌ها

### مثال 1: Related Posts Component

```tsx
import { RelatedPosts } from './components/RelatedPosts';
import { useLinkTracking } from './hooks/useLinkTracking';

export function BlogPostDetail({ post }: Props) {
  const { currentLinkId } = useLinkTracking();

  const handleRelatedPostClick = (slug: string) => {
    const trackedUrl = `/blog/${slug}?link_id=${currentLinkId || generateLinkId()}`;
    window.location.href = trackedUrl;
  };

  return (
    <div>
      {/* Article */}
      
      <RelatedPosts 
        posts={relatedPosts}
        onNavigate={handleRelatedPostClick}
      />
    </div>
  );
}
```

### مثال 2: Menu Navigation

```tsx
import { TrackedLink } from './components/TrackedLink';

export function Navbar() {
  return (
    <nav>
      <TrackedLink href="/blog" className="nav-link" linkId="navbar-blog">
        بلاگ
      </TrackedLink>
      
      <TrackedLink href="/services" className="nav-link" linkId="navbar-services">
        خدمات
      </TrackedLink>
      
      <TrackedLink href="/contact" className="nav-link" linkId="navbar-contact">
        تماس
      </TrackedLink>
    </nav>
  );
}
```

### مثال 3: Category Grid

```tsx
import { TrackedLink } from './components/TrackedLink';

export function CategoryGrid() {
  const categories = ['investment', 'strategy', 'case-study'];

  return (
    <div className="grid grid-cols-3 gap-4">
      {categories.map(cat => (
        <TrackedLink 
          key={cat}
          href={`/blog/category/${cat}`}
          linkId={`category-${cat}`}
          className="card"
        >
          {cat}
        </TrackedLink>
      ))}
    </div>
  );
}
```

---

## 📊 Analytics Integration

### Google Analytics Setup

```typescript
// در lib/linkTracking.ts - خودکار
if (window.gtag) {
  window.gtag('event', 'link_click', {
    link_id: linkId,
    page_path: path,
    source: source,
  });
}
```

### Custom Event Tracking

```typescript
import { trackLinkClick } from './lib/linkTracking';

function MyComponent() {
  const handleClick = () => {
    trackLinkClick('custom-link-id', '/blog/category/investment');
    // خودکار به Google Analytics فرستاده می‌شود
  };

  return <button onClick={handleClick}>Click</button>;
}
```

### Dashboard Example

```tsx
import { TrackingInfoDisplay } from './components/TrackedLink';

export function AdminDashboard() {
  return (
    <div>
      <h2>Link Tracking</h2>
      
      <TrackingInfoDisplay 
        linkId="menu-blog-investment"
        path="/blog/category/investment"
        clickCount={1250}
      />
      
      <TrackingInfoDisplay 
        linkId="related-posts-strategy"
        path="/blog/category/strategy"
        clickCount={890}
      />
    </div>
  );
}
```

---

## 🔍 Query Parameter Format

### Standard Format
```
/path?link_id=unique-id
```

### Multiple Parameters
```
/blog/category/investment?link_id=abc123&source=navbar&utm_source=internal
```

### Parsing Example
```typescript
import { parseQueryParams } from './lib/linkTracking';

const params = parseQueryParams('?link_id=abc123&source=navbar');
// Result: { link_id: 'abc123', source: 'navbar' }
```

---

## ⚙️ Configuration

### Disable Auto-Tracking

```typescript
const { generateTrackedLink } = useLinkTracking({ 
  autoTrack: false  // Disable automatic tracking
});
```

### Custom Link ID

```typescript
const { generateTrackedLink } = useLinkTracking({
  customLinkId: 'sidebar-category-menu'
});

const url = generateTrackedLink('/blog/category/investment');
// Result: /blog/category/investment?link_id=sidebar-category-menu
```

---

## 🧪 Testing

### Test URLs

```bash
# Category link
http://localhost:5173/blog/category/investment?link_id=test-id-1

# Tag link
http://localhost:5173/blog/tag/pitch-deck?link_id=test-id-2

# Author link
http://localhost:5173/blog/author/ali-rezaei?link_id=test-id-3

# Post link
http://localhost:5173/blog/vc-ready-deck-guide?link_id=test-id-4
```

### Console Check

```javascript
// در browser console:
new URL(window.location.href).searchParams.get('link_id')
// نتیجه: "test-id-1" (اگر موجود باشد)
```

---

## 📈 Tracking Metrics

| Metric | Format | مثال |
|--------|--------|------|
| **Link Click** | `link_click` event | navbar → blog |
| **Source** | referrer | internal, direct |
| **Page View** | `page_view_tracked` | /blog/category/investment |
| **Conversion** | custom event | contact form submit |

---

## ✅ Checklist

- [ ] فایل‌ها ایجاد شدند
- [ ] Route files آپدیت شدند
- [ ] Components با TrackedLink استفاده کنند
- [ ] Link tracking test شد
- [ ] Google Analytics setup شد
- [ ] Custom tracking parameters set شدند
- [ ] Analytics dashboard setup شد

---

## 📚 Reference

| Function | استفاده | مثال |
|----------|---------|------|
| `generateLinkId()` | ID سازی | `const id = generateLinkId()` |
| `buildTrackedLink()` | URL سازی | `buildTrackedLink('/blog')` |
| `useLinkTracking()` | Hook | `const { generateTrackedLink } = useLinkTracking()` |
| `<TrackedLink>` | Component | `<TrackedLink href="/blog">` |
| `trackLinkClick()` | Event Send | `trackLinkClick(id, path)` |

---

**Last Update**: 1403/11/21
