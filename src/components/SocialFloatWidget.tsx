// ─── Social Float Widget ──────────────────────────────────────────────────────
// آیکون‌های شبکه‌های اجتماعی شناور در گوشه پایین-راست سایت
// وقتی فعال باشد، جایگزین دکمه چت می‌شود
// settings از App.tsx (useSettings) تزریق می‌شود تا از query مضاعف جلوگیری شود

import { motion, AnimatePresence } from 'framer-motion';
import { Twitter, Linkedin, Instagram, Youtube, MessageCircle, Send, Facebook } from 'lucide-react';
import { normalizeExternalUrl } from '../lib/urlHelpers';
import type { SocialFloatItem, SocialNetwork, SiteSettings } from '../lib/settingsApi';

const MAX_FLOAT = 4;

// آیکون TikTok (در lucide-react موجود نیست)
function TikTokIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.36 6.36 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.71a8.16 8.16 0 0 0 4.77 1.52V6.78a4.85 4.85 0 0 1-1-.09z"/>
    </svg>
  );
}

function SocialIcon({ network, size = 22 }: { network: SocialNetwork; size?: number }) {
  switch (network) {
    case 'twitter':   return <Twitter size={size} />;
    case 'linkedin':  return <Linkedin size={size} />;
    case 'instagram': return <Instagram size={size} />;
    case 'youtube':   return <Youtube size={size} />;
    case 'telegram':  return <Send size={size} />;
    case 'whatsapp':  return <MessageCircle size={size} />;
    case 'facebook':  return <Facebook size={size} />;
    case 'tiktok':    return <TikTokIcon size={size} />;
    default:          return null;
  }
}

const NETWORK_COLORS: Record<SocialNetwork, string> = {
  twitter:   '#1DA1F2',
  linkedin:  '#0A66C2',
  instagram: '#E1306C',
  youtube:   '#FF0000',
  telegram:  '#2CA5E0',
  whatsapp:  '#25D366',
  facebook:  '#1877F2',
  tiktok:    '#010101',
};

interface SocialFloatWidgetProps {
  settings: SiteSettings;
}

export default function SocialFloatWidget({ settings }: SocialFloatWidgetProps) {
  const allItems: SocialFloatItem[] = settings.social_float_items ?? [];
  const items: SocialFloatItem[] = allItems
    .map(item => ({ ...item, url: normalizeExternalUrl(item.url) }))
    .filter(item => item.active && item.url)
    .slice(0, MAX_FLOAT);

  // اگر فعال نیست یا آیتم ندارد، نمایش نده
  if (!settings.social_float_enabled || items.length === 0) return null;

  return (
    <div
      className="social-float-widget fixed bottom-8 right-8 z-50 flex flex-col items-center gap-2.5"
      dir="ltr"
    >
      <AnimatePresence>
        {items.map((item, i) => {
          const color = NETWORK_COLORS[item.network] ?? '#00BCD4';
          return (
            <motion.a
              key={item.network}
              href={normalizeExternalUrl(item.url)}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 340, damping: 28 }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-shadow"
              style={{
                background: `${color}22`,
                border: `1px solid ${color}66`,
                color: color,
                boxShadow: `0 4px 20px ${color}33`,
              }}
              aria-label={item.network}
            >
              <SocialIcon network={item.network} size={22} />
            </motion.a>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
