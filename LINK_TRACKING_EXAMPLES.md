# 🎯 Link Tracking - Implementation Examples

## مثال عملی 1: RelatedPosts Component

### قبل (بدون Tracking):
```tsx
function RelatedPosts({ posts, onNavigate }: Props) {
  return (
    <div>
      {posts.map(post => (
        <button 
          key={post.id}
          onClick={() => onNavigate('blog-post', post.slug)}
        >
          {post.title}
        </button>
      ))}
    </div>
  );
}
```

### بعد (با Tracking):
```tsx
import { TrackedLink } from './TrackedLink';
import { useLinkTracking } from '../hooks/useLinkTracking';
import { createLinkTrackingContext, logTrackingEvent } from '../utils/trackingRouter';

function RelatedPosts({ posts, onNavigate }: Props) {
  const { currentLinkId } = useLinkTracking();

  const handlePostClick = (post: BlogPost) => {
    // Track the click
    const context = createLinkTrackingContext('related-posts', post.slug);
    logTrackingEvent('related_post_click', {
      ...context,
      postId: post.id,
      postCategory: post.category,
    });

    // Navigate with tracking
    onNavigate('blog-post', post.slug, 'all', currentLinkId);
  };

  return (
    <div>
      {posts.map(post => (
        <button 
          key={post.id}
          onClick={() => handlePostClick(post)}
          className="tracked-link"
        >
          {post.title}
        </button>
      ))}
    </div>
  );
}
```

---

## مثال عملی 2: Category Grid

### بدون Tracking:
```tsx
function CategoryGrid() {
  const categories = ['investment', 'strategy', 'case-study'];

  return (
    <div className="grid">
      {categories.map(cat => (
        <a key={cat} href={`/blog/category/${cat}`}>
          {cat}
        </a>
      ))}
    </div>
  );
}
```

### با Tracking:
```tsx
import { TrackedLink } from './TrackedLink';

function CategoryGrid() {
  const categories = ['investment', 'strategy', 'case-study'];

  return (
    <div className="grid">
      {categories.map(cat => (
        <TrackedLink
          key={cat}
          href={`/blog/category/${cat}`}
          linkId={`category-grid-${cat}`}
          className="category-card"
        >
          {cat}
        </TrackedLink>
      ))}
    </div>
  );
}
```

---

## مثال عملی 3: Breadcrumb Navigation

### کد:
```tsx
import { TrackedLink } from './TrackedLink';

interface BreadcrumbItem {
  label: string;
  path: string;
  trackingId: string;
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumb">
      {items.map((item, index) => (
        <div key={item.path} className="breadcrumb-item">
          {index > 0 && <span className="separator">/</span>}
          
          {index === items.length - 1 ? (
            <span className="current">{item.label}</span>
          ) : (
            <TrackedLink
              href={item.path}
              linkId={item.trackingId}
              className="breadcrumb-link"
            >
              {item.label}
            </TrackedLink>
          )}
        </div>
      ))}
    </nav>
  );
}

// استفاده:
<Breadcrumb items={[
  { label: 'خانه', path: '/', trackingId: 'breadcrumb-home' },
  { label: 'بلاگ', path: '/blog', trackingId: 'breadcrumb-blog' },
  { label: 'سرمایه‌گذاری', path: '/blog/category/investment', trackingId: 'breadcrumb-category' },
  { label: 'مقاله', path: '#', trackingId: 'breadcrumb-current' },
]} />
```

---

## مثال عملی 4: Popular Posts Sidebar

### کد:
```tsx
import { TrackedLink } from './TrackedLink';

function PopularPosts({ posts }: { posts: BlogPost[] }) {
  return (
    <aside className="popular-posts">
      <h3>مقالات محبوب</h3>
      <div className="posts-list">
        {posts.map((post, index) => (
          <TrackedLink
            key={post.id}
            href={`/blog/${post.slug}`}
            linkId={`popular-posts-${index + 1}`}
            className="post-item"
          >
            <span className="rank">{index + 1}</span>
            <span className="title">{post.title}</span>
            <span className="views">{post.views}</span>
          </TrackedLink>
        ))}
      </div>
    </aside>
  );
}
```

---

## مثال عملی 5: Tag Cloud

### کد:
```tsx
import { TrackedLink } from './TrackedLink';

function TagCloud({ tags }: { tags: string[] }) {
  return (
    <div className="tag-cloud">
      {tags.map(tag => (
        <TrackedLink
          key={tag}
          href={`/blog/tag/${tag}`}
          linkId={`tag-cloud-${tag}`}
          className="tag-badge"
        >
          #{tag}
        </TrackedLink>
      ))}
    </div>
  );
}
```

---

## مثال عملی 6: Author Card

### کد:
```tsx
import { TrackedLink } from './TrackedLink';

function AuthorCard({ author }: { author: BlogAuthor }) {
  return (
    <div className="author-card">
      <div className="author-info">
        <h4>{author.name}</h4>
        <p>{author.role}</p>
      </div>
      
      <TrackedLink
        href={`/blog/author/${author.name}`}
        linkId={`author-card-${author.name}`}
        className="view-all-link"
      >
        مشاهده تمام مقالات
      </TrackedLink>
    </div>
  );
}
```

---

## مثال عملی 7: Navigation Menu

### کد:
```tsx
import { TrackedLink } from './TrackedLink';

function Navbar() {
  const navItems = [
    { label: 'خدمات', path: '/services', id: 'navbar-services' },
    { label: 'فرآیند', path: '/process', id: 'navbar-process' },
    { label: 'بلاگ', path: '/blog', id: 'navbar-blog' },
    { label: 'درباره', path: '/about', id: 'navbar-about' },
    { label: 'تماس', path: '/contact', id: 'navbar-contact' },
  ];

  return (
    <nav className="navbar">
      {navItems.map(item => (
        <TrackedLink
          key={item.path}
          href={item.path}
          linkId={item.id}
          className="nav-link"
        >
          {item.label}
        </TrackedLink>
      ))}
    </nav>
  );
}
```

---

## مثال عملی 8: CTA Buttons

### کد:
```tsx
import { TrackedButton } from './TrackedLink';
import { navigateWithTracking } from '../utils/trackingRouter';

function CTASection() {
  const handleCTAClick = (linkId: string) => {
    navigateWithTracking({
      page: 'contact',
      linkId,
      queryParams: { source: 'cta-section' }
    }, 'homepage-cta');
  };

  return (
    <section className="cta-section">
      <h2>آماده ‌سازی برای سرمایه‌گذاری؟</h2>
      
      <TrackedButton
        onClick={handleCTAClick}
        linkId="cta-contact-button"
        className="cta-button"
      >
        تماس با ما
      </TrackedButton>
    </section>
  );
}
```

---

## مثال عملی 9: Category Filter Buttons

### کد:
```tsx
import { TrackedLink } from './TrackedLink';

function CategoryFilter() {
  const categories = [
    { value: 'investment', label: 'سرمایه‌گذاری' },
    { value: 'strategy', label: 'استراتژی' },
    { value: 'case-study', label: 'مطالعه موردی' },
  ];

  return (
    <div className="category-filter">
      {categories.map(cat => (
        <TrackedLink
          key={cat.value}
          href={`/blog/category/${cat.value}`}
          linkId={`filter-${cat.value}`}
          className="filter-button"
        >
          {cat.label}
        </TrackedLink>
      ))}
    </div>
  );
}
```

---

## مثال عملی 10: Search Results

### کد:
```tsx
import { TrackedLink } from './TrackedLink';

function SearchResults({ results }: { results: BlogPost[] }) {
  return (
    <div className="search-results">
      {results.length === 0 ? (
        <p>نتیجه‌ای یافت نشد</p>
      ) : (
        <ul>
          {results.map((post, index) => (
            <li key={post.id}>
              <TrackedLink
                href={`/blog/${post.slug}`}
                linkId={`search-result-${index}`}
                className="result-item"
              >
                {post.title}
              </TrackedLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## خلاصه

| Component | Tracking ID Format | مثال |
|-----------|-------------------|------|
| Navbar | `navbar-[page]` | `navbar-blog` |
| Breadcrumb | `breadcrumb-[level]` | `breadcrumb-category` |
| Popular Posts | `popular-posts-[index]` | `popular-posts-1` |
| Related Posts | `related-posts-[slug]` | `related-posts-post1` |
| Tag Cloud | `tag-cloud-[tag]` | `tag-cloud-pitch-deck` |
| Author Card | `author-card-[name]` | `author-card-ali` |
| Category Grid | `category-grid-[name]` | `category-grid-investment` |
| CTA Button | `cta-[section]` | `cta-contact` |

---

**Last Update**: 1403/11/21
