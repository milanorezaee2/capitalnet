/**
 * generate-video-config.js
 *
 * اسکن پوشه‌های ویدیو و ساخت خودکار videos.config.json
 * جدیدترین .mp4 در هر پوشه را به عنوان ویدیوی فعال انتخاب می‌کند.
 *
 * اجرا: node scripts/generate-video-config.js
 */

import { readdirSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(process.cwd(), 'public/videos');
const CONFIG_PATH = join(ROOT, 'videos.config.json');

/**
 * پوشه را اسکن می‌کند و مسیر جدیدترین .mp4 را برمی‌گرداند.
 * اگر فایلی نباشد null برمی‌گرداند.
 */
function findNewestMp4(dir) {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter(f => f.toLowerCase().endsWith('.mp4'));
  if (files.length === 0) return null;

  let newest = null;
  let newestTime = 0;
  for (const f of files) {
    try {
      const { mtimeMs } = statSync(join(dir, f));
      if (mtimeMs > newestTime) {
        newestTime = mtimeMs;
        newest = f;
      }
    } catch {
      if (!newest) newest = f;
    }
  }
  return newest;
}

const heroDir = join(ROOT, 'hero');
const appraisalDir = join(ROOT, 'appraisal');
const heroFile = findNewestMp4(heroDir);
const rootHeroFile = findNewestMp4(ROOT);
const appraisalFile = findNewestMp4(appraisalDir);

const config = {
  hero: heroFile ? `/videos/hero/${heroFile}` : (rootHeroFile ? `/videos/${rootHeroFile}` : '/videos/hero/2340-157269921.mp4'),
  appraisal: appraisalFile ? `/videos/appraisal/${appraisalFile}` : '/videos/appraisal/8252-207598592.mp4',
};

writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8');

console.log('✅ videos.config.json updated:');
console.log(JSON.stringify(config, null, 2));
