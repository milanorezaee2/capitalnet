import { Mail, Phone, Youtube, Twitter, Linkedin } from 'lucide-react';
import type { SiteSettings } from '../lib/settingsApi';
import type { MobilePageKey } from './MobileAppShell';

import { t } from '@/i18n';


interface Props {
  themeMode: 'dark' | 'light';
  settings?: SiteSettings;
  onNavigate: (page: MobilePageKey) => void;
}

const NAV_LINKS: Array<{ label: string; page: MobilePageKey }> = [
  { label: 'خانه',      page: 'home'     },
  { label: 'خدمات',     page: 'services' },
  { label: 'فرآیند',    page: 'process'  },
  { label: 'بلاگ',      page: 'blog'     },
  { label: 'تماس با ما',page: 'contact'  },
  { label: 'درباره ما', page: 'about'    },
];

export default function MobileFooter({ themeMode, settings, onNavigate }: Props) {
  const d = themeMode === 'dark';

  /* ── colour tokens ── */
  const bg          = d ? 'rgba(255,255,255,0.025)' : '#ffffff';
  const border      = d ? 'rgba(255,255,255,0.07)'  : 'rgba(15,23,42,0.10)';
  const divider     = d ? 'rgba(255,255,255,0.06)'  : 'rgba(15,23,42,0.08)';
  const textHigh    = d ? '#ffffff'                  : '#0f172a';
  const textMid     = d ? 'rgba(255,255,255,0.55)'   : '#64748b';
  const textLow     = d ? 'rgba(255,255,255,0.28)'   : '#94a3b8';
  const navHoverBg  = d ? 'rgba(255,255,255,0.05)'   : 'rgba(15,23,42,0.05)';
  const iconBg      = d ? 'rgba(255,255,255,0.07)'   : 'rgba(15,23,42,0.06)';
  const iconBorder  = d ? 'rgba(255,255,255,0.10)'   : 'rgba(15,23,42,0.10)';
  const iconColor   = d ? 'rgba(255,255,255,0.55)'   : '#475569';

  const logoText   = settings?.header_logo_text   ?? 'Capital Network';
  const tagline    = settings?.footer_brand_tagline ?? t("اتصال استارتاپ از Seed تا Series B به شبکه جهانی سرمایه‌گذاران Tier-1 در ۵ قاره.");
  const email      = settings?.contact_email       ?? 'invest@capitalnetwork.ir';
  const phone      = settings?.contact_phone       ?? '+98 21 1234 5678';
  const copyright  = settings?.footer_copyright    ?? `© Capital Network. All rights reserved ${new Date().getFullYear()} ©`;
  const twitter    = settings?.social_twitter      ?? '#';
  const linkedin   = settings?.social_linkedin     ?? '#';
  const youtube    = settings?.social_youtube      ?? '#';

  return (
    <footer
      dir="rtl"
      className="mx-3 mt-4 rounded-[22px] overflow-hidden"
      style={{ background: bg, border: `1px solid ${border}`, marginBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
    >

      {/* ── Top: logo + CTA ── */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3"
        style={{ borderBottom: `1px solid ${divider}` }}>

        {/* Logo block */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-[11px] font-black text-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            CN
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black leading-none truncate" style={{ color: textHigh }}>{logoText}</p>
            <p className="text-[10px] mt-0.5 leading-none" style={{ color: textMid }}>{t("پلتفرم رشد و سرمایه‌گذاری")}</p>
          </div>
        </div>

        {/* CTA button */}
        <button
          type="button"
          onClick={() => onNavigate('evaluation')}
          className="shrink-0 rounded-full px-4 py-2 text-[11px] font-black text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
        >
          {t("ارزیابی رایگان")}
        </button>
      </div>

      {/* ── Brand tagline ── */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${divider}` }}>
        <p className="text-xs leading-[1.85] text-right" style={{ color: textMid }}>{tagline}</p>
      </div>

      {/* ── Quick access links ── */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${divider}` }}>
        <p className="text-[10px] font-black tracking-widest mb-2.5 text-right" style={{ color: textLow }}>
          {t("دسترسی سریع")}
        </p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          {NAV_LINKS.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => onNavigate(item.page)}
              className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-right text-xs font-semibold transition-colors active:opacity-70"
              style={{ color: textMid }}
              onMouseEnter={(e) => (e.currentTarget.style.background = navHoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ color: textLow, fontSize: 10 }}>›</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contact info ── */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${divider}` }}>
        <p className="text-[10px] font-black tracking-widest mb-2.5 text-right" style={{ color: textLow }}>
          {t("ارتباط با ما")}
        </p>
        <div className="space-y-2">
          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="flex items-center justify-end gap-2 active:opacity-70"
          >
            <span className="text-xs font-medium" style={{ color: textMid }}>{email}</span>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
              style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
              <Mail size={12} style={{ color: iconColor }} />
            </div>
          </a>
          {/* Phone */}
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-end gap-2 active:opacity-70"
            dir="ltr"
          >
            <span className="text-xs font-medium" style={{ color: textMid }}>{phone}</span>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
              style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
              <Phone size={12} style={{ color: iconColor }} />
            </div>
          </a>
        </div>
      </div>

      {/* ── Social networks ── */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${divider}` }}>
        <div className="flex items-center justify-end gap-2.5">
          <p className="text-[10px] font-semibold" style={{ color: textLow }}>{t(":شبکه‌های اجتماعی")}</p>

          {/* YouTube */}
          <a
            href={youtube || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-opacity active:opacity-60"
            style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
          >
            <Youtube size={15} style={{ color: iconColor }} />
          </a>

          {/* Twitter / X */}
          <a
            href={twitter || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-opacity active:opacity-60"
            style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
          >
            <Twitter size={15} style={{ color: iconColor }} />
          </a>

          {/* LinkedIn */}
          <a
            href={linkedin || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-opacity active:opacity-60"
            style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
          >
            <Linkedin size={15} style={{ color: iconColor }} />
          </a>
        </div>
      </div>

      {/* ── Copyright bar ── */}
      <div className="px-4 py-3">
        <p className="text-[10px] text-center" style={{ color: textLow }}>{copyright}</p>
      </div>

    </footer>
  );
}
