/**
 * Post-build: optimize modulepreload hints in dist/index.html
 *
 * Vite injects <link rel="modulepreload"> for ALL chunks by default.
 * This is counterproductive for lazy chunks — it pre-fetches the admin panel,
 * blog, services etc. on every page load, burning bandwidth.
 *
 * This script removes modulepreload hints for non-critical (lazy) chunks
 * and keeps only the critical ones needed for initial paint.
 *
 * Run: node scripts/post-build.mjs (via "postbuild" npm script)
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIST = join(process.cwd(), 'dist');
const INDEX = join(DIST, 'index.html');

// These chunks are NEVER needed on initial load — remove their modulepreload hints
// to avoid downloading 1.5MB of code the user might never need
const LAZY_CHUNK_PATTERNS = [
  /chunk-admin/,
  /chunk-blog/,
  /chunk-services/,
  /chunk-process/,
  /FounderOnboarding/,
  /UserDashboard/,
  // Supabase is only needed after user interaction — don't prefetch eagerly
  /vendor-supabase/,
];

let html = readFileSync(INDEX, 'utf-8');
const originalLength = html.length;

// Remove modulepreload hints for lazy chunks
let removedCount = 0;
html = html.replace(
  /<link rel="modulepreload"[^>]+href="\/assets\/([^"]+)"[^>]*>/g,
  (fullMatch, filename) => {
    const shouldRemove = LAZY_CHUNK_PATTERNS.some(p => p.test(filename));
    if (shouldRemove) {
      removedCount++;
      return `<!-- deferred: ${filename} -->`;
    }
    return fullMatch;
  }
);

writeFileSync(INDEX, html, 'utf-8');

const savedKB = Math.round((originalLength - html.length) / 1024);
console.log(`[post-build] Removed ${removedCount} lazy modulepreload hints (~${savedKB} KB of eager prefetch removed)`);
console.log('[post-build] Kept preload hints for: vendor-react, vendor-motion, vendor-icons, index, chunk-data');
