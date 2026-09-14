/**
 * BlogPostCTA
 * Call-to-action box shown below the article body.
 * Configurable variant: register | contact | download | consult | read-more.
 *
 * NOTE: All gradient/colour values are written as inline styles —
 * never as dynamic Tailwind class strings — so Tailwind JIT never purges them.
 */
import { ArrowLeft, PhoneCall, UserPlus, Download, BookOpen } from 'lucide-react';

type CTAVariant = 'consult' | 'contact' | 'register' | 'download' | 'read-more';

interface Props {
  variant?: CTAVariant;
  onAction?: () => void;
}

// Hex colour pairs — never dynamic Tailwind strings
const CTA_CONFIG: Record<
  CTAVariant,
  { icon: React.ReactNode; title: string; desc: string; label: string; from: string; to: string }
> = {
  consult: {
    icon: <PhoneCall size={20} aria-hidden="true" />,
    title: 'آماده شروع جذب سرمایه هستید؟',
    desc: 'تیم ما با تجربه بیش از ۱۵ سال در زمینه تأمین مالی، همراه شماست.',
    label: 'درخواست مشاوره رایگان',
    from: '#14b8a6', to: '#22d3ee',
  },
  contact: {
    icon: <PhoneCall size={20} aria-hidden="true" />,
    title: 'سوالی دارید؟',
    desc: 'با تیم ما در تماس باشید و پاسخ سوالات خود را دریافت کنید.',
    label: 'تماس با ما',
    from: '#3b82f6', to: '#6366f1',
  },
  register: {
    icon: <UserPlus size={20} aria-hidden="true" />,
    title: 'عضو شبکه سرمایه‌گذاران شوید',
    desc: 'با عضویت رایگان به جدیدترین فرصت‌های سرمایه‌گذاری دسترسی پیدا کنید.',
    label: 'ثبت‌نام رایگان',
    from: '#8b5cf6', to: '#a855f7',
  },
  download: {
    icon: <Download size={20} aria-hidden="true" />,
    title: 'منابع رایگان دانلود کنید',
    desc: 'قالب‌های آماده Pitch Deck، مدل مالی و فهرست سرمایه‌گذاران را دریافت کنید.',
    label: 'دانلود رایگان',
    from: '#f59e0b', to: '#f97316',
  },
  'read-more': {
    icon: <BookOpen size={20} aria-hidden="true" />,
    title: 'مطالب بیشتر بخوانید',
    desc: 'مقالات تخصصی بیشتری در حوزه سرمایه‌گذاری و استارتاپ در بلاگ ما منتشر شده است.',
    label: 'مشاهده همه مقالات',
    from: '#14b8a6', to: '#f59e0b',
  },
};

export default function BlogPostCTA({ variant = 'consult', onAction }: Props) {
  const cfg = CTA_CONFIG[variant];
  const gradient = `linear-gradient(135deg, ${cfg.from}, ${cfg.to})`;
  const gradientLR = `linear-gradient(90deg, ${cfg.from}, ${cfg.to})`;
  const glowBg = `linear-gradient(135deg, ${cfg.from}1a, ${cfg.to}12)`;

  return (
    <div
      className="mt-12 rounded-2xl border border-white/10 overflow-hidden relative"
      aria-label="دعوت به اقدام"
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{ background: glowBg }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.05), transparent 60%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
        {/* Icon badge */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white"
          style={{ background: gradient, boxShadow: `0 8px 32px ${cfg.from}55` }}
          aria-hidden="true"
        >
          {cfg.icon}
        </div>

        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-black text-white mb-2">{cfg.title}</h3>
          <p className="text-white/55 text-sm leading-relaxed">{cfg.desc}</p>
        </div>

        <button
          onClick={onAction}
          className="flex-shrink-0 flex items-center gap-2 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-150 hover:opacity-90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/30"
          style={{ background: gradientLR }}
        >
          {cfg.label}
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
