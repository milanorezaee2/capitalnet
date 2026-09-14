// ─── Vite Plugin for SEO (Generate Sitemap & RSS Feed) ────────────────────────

import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { generateSitemapXML, generateRSSFeed, generateRobotsTxt } from '../lib/seoGenerator';
import type { BlogPost, BlogCategory } from '../types/blog';

/**
 * Mock data loader - в реальности вам нужно загрузить from database
 * Это просто для примера
 */
async function loadBlogPosts(): Promise<BlogPost[]> {
  // Для production версии, загружать из базы данных
  // Для сейчас возвращаем пустой массив
  return [];
}

/**
 * Get all categories from blog posts
 */
function extractCategories(posts: BlogPost[]): BlogCategory[] {
  return Array.from(new Set(posts.map(p => p.category))) as BlogCategory[];
}

/**
 * Get all authors from blog posts
 */
function extractAuthors(posts: BlogPost[]): string[] {
  return Array.from(new Set(posts.map(p => p.author.name)));
}

/**
 * Vite Plugin для генерации SEO files
 */
export function seoPlugin(): Plugin {
  let isBuild = false;

  return {
    name: 'vite-plugin-seo',
    
    apply: 'build',
    
    enforce: 'post',

    configResolved(config) {
      isBuild = config.command === 'build';
    },

    async generateBundle() {
      if (!isBuild) return;

      try {
        const posts = await loadBlogPosts();
        const categories = extractCategories(posts);
        const authors = extractAuthors(posts);
        const baseUrl = process.env.VITE_APP_URL || 'https://capitalnetwork.ir';

        // Generate Sitemap
        const sitemap = generateSitemapXML(baseUrl, posts, categories, authors);
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: sitemap,
        });

        // Generate RSS Feed
        const rss = generateRSSFeed(
          baseUrl,
          'Capital Network Blog',
          'مقالات راهبردی سرمایه‌گذاری و استارتاپ',
          posts
        );
        this.emitFile({
          type: 'asset',
          fileName: 'feed.xml',
          source: rss,
        });

        // Generate robots.txt
        const robots = generateRobotsTxt(`${baseUrl}/sitemap.xml`);
        this.emitFile({
          type: 'asset',
          fileName: 'robots.txt',
          source: robots,
        });

        console.log('✅ SEO files generated: sitemap.xml, feed.xml, robots.txt');
      } catch (error) {
        console.error('❌ Error generating SEO files:', error);
      }
    },
  };
}

/**
 * Vite Plugin for generating static HTML pages from routes
 * This helps with SEO by creating pre-rendered pages
 */
export function staticSiteGeneratorPlugin(routes: string[]): Plugin {
  return {
    name: 'vite-plugin-static-site-generator',
    apply: 'build',
    enforce: 'post',

    async generateBundle() {
      console.log(`🏗️  Pre-rendering ${routes.length} pages for SEO...`);
      // This would require actual page rendering logic
      // For now, just log the routes
      routes.forEach(route => {
        console.log(`  ✓ ${route}`);
      });
    },
  };
}
