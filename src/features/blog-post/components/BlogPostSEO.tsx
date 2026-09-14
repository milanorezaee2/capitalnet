/**
 * BlogPostSEO
 * Injects full SEO meta tags into <head> via Helmet-like approach
 * using a direct DOM manipulation strategy (no external dependency needed).
 * 
 * Emits:
 *  - <title>
 *  - meta description, canonical, robots
 *  - Open Graph (og:*) tags
 *  - Twitter Card tags
 *  - JSON-LD: Article + BreadcrumbList + Author schema
 *  - hreflang (fa)
 */
import { useEffect } from 'react';
import type { AppBlogPost } from '../../../lib/blogApi';

interface Props {
  post: AppBlogPost;
  url: string;
  breadcrumbs: { name: string; url: string }[];
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(id: string, data: object) {
  let el = document.querySelector(`script[data-jsonld="${id}"]`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-jsonld', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export default function BlogPostSEO({ post, url, breadcrumbs }: Props) {
  useEffect(() => {
    const siteTitle = 'Capital Network';
    const fullTitle = `${post.title} | ${siteTitle}`;
    const description = post.excerpt;
    const image = post.cover_image ?? `${window.location.origin}/og-default.jpg`;

    // Title
    document.title = fullTitle;

    // Core meta
    setMeta('description', description);
    setMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // Canonical + hreflang
    setLink('canonical', url);
    setLink('alternate', url, 'fa');

    // Open Graph
    setMeta('og:type', 'article', true);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:url', url, true);
    setMeta('og:image', image, true);
    setMeta('og:image:alt', post.title, true);
    setMeta('og:site_name', siteTitle, true);
    setMeta('og:locale', 'fa_IR', true);
    setMeta('article:author', post.author_name, true);
    setMeta('article:published_time', post.published_at ?? post.created_at, true);
    setMeta('article:section', post.category ?? '', true);
    (post.tags ?? []).forEach((t, i) =>
      setMeta(`article:tag:${i}`, t, true)
    );

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    // JSON-LD: Article
    setJsonLd('article', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description,
      image,
      datePublished: post.published_at ?? post.created_at,
      author: {
        '@type': 'Person',
        name: post.author_name,
        jobTitle: post.author_role,
      },
      publisher: {
        '@type': 'Organization',
        name: siteTitle,
        logo: { '@type': 'ImageObject', url: `${window.location.origin}/logo.png` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    });

    // JSON-LD: BreadcrumbList
    setJsonLd('breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });

    // Restore on unmount
    return () => {
      document.title = siteTitle;
    };
  }, [post, url, breadcrumbs]);

  return null;
}
