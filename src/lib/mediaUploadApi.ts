/**
 * mediaUploadApi.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * آپلود فایل‌های رسانه (ویدئو و عکس) به Supabase Storage
 *
 * Video bucket: "media-videos" — حداکثر 2GB — فرمت mp4/webm/mov/mkv
 * Image bucket: "media-images" — فرمت‌های متنوع با کیفیت‌های مختلف
 */

import { supabase } from './supabaseApi';

// ── bucket names ──────────────────────────────────────────────────────────────
export const VIDEO_BUCKET = 'media-videos';
export const IMAGE_BUCKET = 'media-images';

// ── Video quality labels ──────────────────────────────────────────────────────
export type VideoQuality = '480p' | '720p' | '1080p' | 'bluray';
export const VIDEO_QUALITY_LABELS: Record<VideoQuality, { label: string; desc: string; color: string }> = {
  '480p':    { label: '480p SD',        desc: 'استاندارد — مناسب اینترنت کند',  color: '#94a3b8' },
  '720p':    { label: '720p HD',        desc: 'کیفیت بالا — پیشنهادی',          color: '#38bdf8' },
  '1080p':   { label: '1080p Full HD',  desc: 'فول اچ‌دی — کیفیت عالی',         color: '#00BCD4' },
  'bluray':  { label: '4K / Blu-ray',   desc: 'بالاترین کیفیت ممکن',            color: '#a78bfa' },
};

// ── Image format labels ───────────────────────────────────────────────────────
export type ImageFormat =
  | 'gif'
  | 'jpg-low' | 'jpg-high'
  | 'png8'    | 'png24'
  | 'webp'    | 'avif'
  | 'tiff'    | 'raw'
  | 'psd-ai';

export const IMAGE_FORMAT_META: Record<ImageFormat, {
  label: string;
  ext: string[];
  accept: string;
  maxMB: number;
  desc: string;
  color: string;
}> = {
  'gif':      { label: 'GIF',                  ext: ['gif'],                    accept: '.gif',                              maxMB: 50,   desc: 'انیمیشن یا تصویر ثابت',              color: '#f472b6' },
  'jpg-low':  { label: 'JPG — کیفیت پایین',    ext: ['jpg','jpeg'],             accept: '.jpg,.jpeg',                        maxMB: 20,   desc: 'فشرده‌شده برای وب',                   color: '#fb923c' },
  'jpg-high': { label: 'JPG — کیفیت بالا',     ext: ['jpg','jpeg'],             accept: '.jpg,.jpeg',                        maxMB: 100,  desc: 'حداکثر کیفیت JPEG',                   color: '#fbbf24' },
  'png8':     { label: 'PNG-8',                ext: ['png'],                    accept: '.png',                              maxMB: 50,   desc: '256 رنگ — سبک‌وزن',                   color: '#34d399' },
  'png24':    { label: 'PNG-24 / PNG-32',      ext: ['png'],                    accept: '.png',                              maxMB: 200,  desc: 'کامل‌ترین شفافیت — بی‌ضرر',           color: '#10b981' },
  'webp':     { label: 'WebP',                 ext: ['webp'],                   accept: '.webp',                             maxMB: 100,  desc: 'فرمت مدرن وب — بهترین تعادل',        color: '#38bdf8' },
  'avif':     { label: 'AVIF',                 ext: ['avif'],                   accept: '.avif',                             maxMB: 100,  desc: 'فشرده‌سازی نسل جدید',                 color: '#818cf8' },
  'tiff':     { label: 'TIFF',                 ext: ['tif','tiff'],             accept: '.tif,.tiff',                        maxMB: 500,  desc: 'بدون اتلاف — چاپ حرفه‌ای',            color: '#a78bfa' },
  'raw':      { label: 'RAW',                  ext: ['raw','cr2','nef','arw','dng','orf','raf'], accept: '.raw,.cr2,.nef,.arw,.dng,.orf,.raf', maxMB: 1024, desc: 'خام دوربین — بالاترین کیفیت',        color: '#f43f5e' },
  'psd-ai':   { label: 'PSD / AI',             ext: ['psd','ai'],               accept: '.psd,.ai',                          maxMB: 1024, desc: 'فایل لایه‌بندی Photoshop / Illustrator', color: '#e879f9' },
};

// ── UploadResult ──────────────────────────────────────────────────────────────
export interface UploadResult {
  url: string;
  path: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
}

export interface UploadProgress {
  percent: number;   // 0–100
  phase: 'reading' | 'uploading' | 'done' | 'error';
  error?: string;
}

// ── Video Upload ──────────────────────────────────────────────────────────────
/** حداکثر ۲ گیگابایت */
export const VIDEO_MAX_BYTES = 2 * 1024 * 1024 * 1024;

export const VIDEO_ACCEPT = '.mp4,.webm,.mov,.mkv,.avi,.m4v';
export const VIDEO_MIME_TYPES = [
  'video/mp4', 'video/webm', 'video/quicktime',
  'video/x-matroska', 'video/x-msvideo', 'video/mp4',
];

export function validateVideoFile(file: File): string | null {
  if (file.size > VIDEO_MAX_BYTES)
    return `حجم فایل (${formatBytes(file.size)}) از حد مجاز ۲ گیگابایت بیشتر است`;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const allowed = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v'];
  if (!allowed.includes(ext))
    return `فرمت ${ext} پشتیبانی نمی‌شود. فرمت‌های مجاز: ${allowed.join(', ')}`;
  return null;
}

export function validateImageFile(file: File, format: ImageFormat): string | null {
  const meta = IMAGE_FORMAT_META[format];
  const maxBytes = meta.maxMB * 1024 * 1024;
  if (file.size > maxBytes)
    return `حجم فایل (${formatBytes(file.size)}) از حد مجاز ${meta.maxMB}MB بیشتر است`;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!meta.ext.includes(ext))
    return `فرمت .${ext} برای ${meta.label} معتبر نیست. فرمت‌های مجاز: .${meta.ext.join(', .')}`;
  return null;
}

export async function uploadVideo(
  file: File,
  quality: VideoQuality,
  onProgress?: (p: UploadProgress) => void,
): Promise<UploadResult | null> {
  onProgress?.({ percent: 5, phase: 'uploading' });

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${quality}/${Date.now()}_${safeName}`;

  const { data, error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(path, file, {
      cacheControl: '86400',
      upsert: false,
      contentType: file.type || 'video/mp4',
    });

  if (error || !data) {
    const msg = error?.message ?? 'خطای ناشناخته';
    onProgress?.({ percent: 0, phase: 'error', error: msg });
    console.error('[uploadVideo]', msg);
    return null;
  }

  const { data: urlData } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(data.path);
  onProgress?.({ percent: 100, phase: 'done' });

  return {
    url: urlData?.publicUrl ?? '',
    path: data.path,
    name: file.name,
    sizeBytes: file.size,
    mimeType: file.type,
  };
}

export async function uploadImage(
  file: File,
  format: ImageFormat,
  onProgress?: (p: UploadProgress) => void,
): Promise<UploadResult | null> {
  onProgress?.({ percent: 5, phase: 'uploading' });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${format}/${Date.now()}_${safeName}`;

  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    });

  if (error || !data) {
    const msg = error?.message ?? 'خطای ناشناخته';
    onProgress?.({ percent: 0, phase: 'error', error: msg });
    console.error('[uploadImage]', msg);
    return null;
  }

  const { data: urlData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(data.path);
  onProgress?.({ percent: 100, phase: 'done' });

  return {
    url: urlData?.publicUrl ?? '',
    path: data.path,
    name: file.name,
    sizeBytes: file.size,
    mimeType: file.type,
  };
}

export async function deleteMedia(bucket: string, path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) { console.error('[deleteMedia]', error.message); return false; }
  return true;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
