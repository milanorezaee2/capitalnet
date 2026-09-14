import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import { readdirSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

// ─── Auto-generate videos.config.json ────────────────────────────────────────
function findNewestMp4(dir: string): string | null {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter(f => f.toLowerCase().endsWith('.mp4'));
  if (files.length === 0) return null;
  let newest: string | null = null;
  let newestTime = 0;
  for (const f of files) {
    try {
      const { mtimeMs } = statSync(join(dir, f));
      if (mtimeMs > newestTime) { newestTime = mtimeMs; newest = f; }
    } catch { if (!newest) newest = f; }
  }
  return newest;
}

function generateVideoConfig() {
  const root = resolve(process.cwd(), 'public/videos');
  mkdirSync(root, { recursive: true });

  const heroDir = join(root, 'hero');
  mkdirSync(heroDir, { recursive: true });

  const appraisalDir = join(root, 'appraisal');
  mkdirSync(appraisalDir, { recursive: true });

  const heroFile = findNewestMp4(heroDir);
  const rootHeroFile = findNewestMp4(root);
  const appraisalFile = findNewestMp4(appraisalDir);

  const config = {
    hero: heroFile ? `/videos/hero/${heroFile}` : (rootHeroFile ? `/videos/${rootHeroFile}` : '/videos/hero/2340-157269921.mp4'),
    appraisal: appraisalFile ? `/videos/appraisal/${appraisalFile}` : '/videos/appraisal/8252-207598592.mp4',
  };
  writeFileSync(join(root, 'videos.config.json'), JSON.stringify(config, null, 2) + '\n', 'utf-8');
  console.log('[video-config] updated →', config);
  return config;
}

function videoConfigPlugin() {
  return {
    name: 'video-config',
    buildStart() {
      generateVideoConfig();
    },
    configureServer(server: any) {
      const videosDir = resolve(process.cwd(), 'public/videos');
      server.watcher.add(videosDir);
      server.watcher.on('add',    (f: string) => { if (f.toLowerCase().endsWith('.mp4')) generateVideoConfig(); });
      server.watcher.on('unlink', (f: string) => { if (f.toLowerCase().endsWith('.mp4')) generateVideoConfig(); });
    },
  };
}
// ─────────────────────────────────────────────────────────────────────────────

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages deploys under /capitalnet/ — set base accordingly
  base: process.env.NODE_ENV === 'production' ? '/capitalnet/' : '/',
  plugins: [
    videoConfigPlugin(),
    react({
      // babel JSX transform with fast refresh
      babel: {
        plugins: [],
      },
    }),
    // ── Brotli compression — best ratio, served by Apache mod_brotli ──────────
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 512,
      deleteOriginFile: false,
      compressionOptions: { params: { level: 11 } } as any,
    }),
    // ── Gzip fallback for servers without brotli ────────────────────────────
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 512,
      deleteOriginFile: false,
      compressionOptions: { level: 9 },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
    watch: {
      ignored: ['**/dist.zip'],
    },
  },
  preview: {
    port: 5173,
    open: true,
  },
  build: {
    // ── Target modern browsers — smaller output, no legacy polyfills ───────────
    target: ['es2020', 'chrome89', 'firefox89', 'safari14'],
    // ── Use esbuild for minification (fastest, near-terser quality) ────────────
    minify: 'esbuild',
    // ── Enable CSS code-splitting — each chunk gets its own tiny CSS file ──────
    cssCodeSplit: true,
    // ── Inline small assets as base64 — eliminates extra HTTP requests ─────────
    assetsInlineLimit: 4096, // 4 KB
    // ── Emit source maps only for production debugging (remove for pure perf) ──
    sourcemap: false,
    // ── Raise warning limit to avoid noise ────────────────────────────────────
    chunkSizeWarningLimit: 600,
    // ── Report compressed sizes ───────────────────────────────────────────────
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // ── Immutable hashed filenames — 1 year cache headers safe ────────────
        entryFileNames:   'assets/[name]-[hash].js',
        chunkFileNames:   'assets/[name]-[hash].js',
        assetFileNames:   'assets/[name]-[hash][extname]',
        // ── Manual chunk strategy — keep initial bundle lean ──────────────────
        manualChunks(id: string) {
          // ── React core — always needed, tiny, cache-stable ─────────────────
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // ── Framer-motion — only lazy pages need it, defer ─────────────────
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // ── Lucide icons — tree-shaken but grouped to avoid duplication ─────
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // ── Supabase — network-only, completely defer ───────────────────────
          if (id.includes('node_modules/@supabase') || id.includes('node_modules/ws/') || id.includes('node_modules/isomorphic-ws')) {
            return 'vendor-supabase';
          }
          // ── Admin panel — completely isolated ──────────────────────────────
          if (id.includes('/components/admin/') || id.includes('/components/AdminBlogPage')) {
            return 'chunk-admin';
          }
          // ── Blog feature ────────────────────────────────────────────────────
          if (id.includes('/features/blog-post/') || id.includes('/features/blog-cms/')) {
            return 'chunk-blog';
          }
          // ── Process page ────────────────────────────────────────────────────
          if (id.includes('/features/process/')) {
            return 'chunk-process';
          }
          // ── Services feature ────────────────────────────────────────────────
          if (id.includes('/features/services/')) {
            return 'chunk-services';
          }
          // ── Supabase/auth utilities — lazy-loaded ───────────────────────────
          if (id.includes('/lib/supabaseApi') || id.includes('/lib/cmsApi') || id.includes('/lib/usersApi') || id.includes('/lib/leadsApi')) {
            return 'chunk-data';
          }
        },
      },
    },
    // ── esbuild options: drop console/debugger in production ──────────────────
    esbuildOptions: {
      drop: ['debugger'],
      legalComments: 'none',
      // Keep console.warn/error for real errors, drop console.log
      pure: ['console.log', 'console.info', 'console.debug'],
      treeShaking: true,
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
    },
  },
});
