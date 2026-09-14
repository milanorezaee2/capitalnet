/**
 * ShareButtons
 * Social sharing row + copy-link button.
 * Supports: Telegram, WhatsApp, Facebook, LinkedIn, X (Twitter), Copy Link.
 */
import { Link, Linkedin, Facebook, Twitter, Check } from 'lucide-react';
import { useCopyToClipboard } from '../hooks';

import { t } from '@/i18n';


interface Props {
  title: string;
  url: string;
}

const PLATFORMS = [
  {
    key: 'telegram',
    label: 'تلگرام',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.14 13.53l-2.963-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.834.953l-.023-.004z" />
      </svg>
    ),
    href: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    color: 'hover:bg-sky-500/20 hover:text-sky-400 hover:border-sky-500/40',
  },
  {
    key: 'whatsapp',
    label: 'واتساپ',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    href: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    color: 'hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/40',
  },
  {
    key: 'linkedin',
    label: 'لینکدین',
    icon: <Linkedin size={16} aria-hidden="true" />,
    href: (url: string) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`,
    color: 'hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/40',
  },
  {
    key: 'facebook',
    label: 'فیسبوک',
    icon: <Facebook size={16} aria-hidden="true" />,
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: 'hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/40',
  },
  {
    key: 'twitter',
    label: 'ایکس',
    icon: <Twitter size={16} aria-hidden="true" />,
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    color: 'hover:bg-white/10 hover:text-white hover:border-white/30',
  },
] as const;

export default function ShareButtons({ title, url }: Props) {
  const [copied, copy] = useCopyToClipboard(2200);

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("اشتراک‌گذاری")}>
      <span className="text-sm text-white/40 ml-1">{t("اشتراک‌گذاری:")}</span>

      {PLATFORMS.map((p) => (
        <a
          key={p.key}
          href={p.href(url, title)}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/50 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${p.color}`}
          aria-label={t('اشتراک‌گذاری در {label}', { label: p.label })}
        >
          {p.icon}
          <span className="hidden sm:inline">{p.label}</span>
        </a>
      ))}

      {/* Copy link */}
      <button
        onClick={() => copy(url)}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${
          copied
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
            : 'border-white/10 bg-white/5 text-white/50 hover:bg-teal-500/10 hover:text-teal-400 hover:border-teal-500/40'
        }`}
        aria-label={copied ? t("لینک کپی شد") : t("کپی لینک")}
      >
        {copied ? (
          <><Check size={14} aria-hidden="true" /> {t("کپی شد")}</>
        ) : (
          <><Link size={14} aria-hidden="true" /> <span className="hidden sm:inline">{t("کپی لینک")}</span></>
        )}
      </button>
    </div>
  );
}
