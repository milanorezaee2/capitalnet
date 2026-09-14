// ─── Custom Section Renderer — renders admin-built sections live ─────────────
import { motion } from 'framer-motion';
import type { CustomSection, CustomBlock } from '../../types/enterprise';

import { t } from '@/i18n';


// ── Block-level renderer ──────────────────────────────────────────────────────

const SPACER_SIZE: Record<string, string> = { xs: 'py-2', sm: 'py-4', md: 'py-8', lg: 'py-14' };
const ICON_SIZE: Record<string, string>  = { sm: 'text-3xl', md: 'text-5xl', lg: 'text-7xl', xl: 'text-9xl' };
const STICKER_SIZE: Record<string, string> = { md: 'text-5xl', lg: 'text-7xl', xl: 'text-9xl' };
const PADDINGY: Record<string, string> = { none: 'py-0', sm: 'py-3', md: 'py-6', lg: 'py-12' };
const ALIGN_CLS: Record<string, string> = { right: 'text-right', center: 'text-center', left: 'text-left' };

function Block({ block }: { block: CustomBlock }) {
  const py = PADDINGY[block.paddingY ?? 'none'];
  const align = ALIGN_CLS[block.align ?? 'right'];

  switch (block.type) {

    case 'heading': {
      const Tag = (block.level ?? 'h2') as 'h2' | 'h3' | 'h4';
      const sizeMap = { h2: 'text-3xl md:text-4xl font-black', h3: 'text-2xl font-black', h4: 'text-xl font-bold' };
      return (
        <div className={`${py} ${align}`}>
          <Tag className={`${sizeMap[Tag]} text-white leading-tight`}
            style={block.textColor ? { color: block.textColor } : undefined}>
            {block.content || ''}
          </Tag>
        </div>
      );
    }

    case 'text':
      return (
        <div className={`${py} ${align}`}>
          <p className="text-base leading-relaxed text-slate-300 whitespace-pre-wrap"
            style={block.textColor ? { color: block.textColor } : undefined}>
            {block.content || ''}
          </p>
        </div>
      );

    case 'image':
      return block.imageUrl ? (
        <div className={`${py}`}>
          <figure className="overflow-hidden rounded-2xl">
            <img src={block.imageUrl} alt={block.imageAlt || ''} loading="lazy"
              className="w-full object-cover transition-transform duration-700 hover:scale-105"
              style={{ maxHeight: 480 }} />
            {block.imageCaption && (
              <figcaption className="mt-2 text-center text-xs text-slate-500">{block.imageCaption}</figcaption>
            )}
          </figure>
        </div>
      ) : null;

    case 'icon':
      return (
        <div className={`${py} flex justify-center`}>
          <span
            className={`${ICON_SIZE[block.iconSize ?? 'md']} leading-none select-none`}
            style={block.iconColor ? { color: block.iconColor } : undefined}
          >
            {block.icon || '⭐'}
          </span>
        </div>
      );

    case 'sticker':
      return (
        <div className={`${py} flex justify-center`}>
          <motion.span
            initial={{ scale: 0.5, rotate: -10 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className={`${STICKER_SIZE[block.stickerSize ?? 'lg']} leading-none select-none inline-block`}
          >
            {block.sticker || '🎯'}
          </motion.span>
        </div>
      );

    case 'badge':
      return (
        <div className={`${py} flex ${block.align === 'center' ? 'justify-center' : block.align === 'left' ? 'justify-end' : 'justify-start'}`}>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border"
            style={{
              background: block.badgeColor ? `${block.badgeColor}18` : 'rgba(0,188,212,0.12)',
              borderColor: block.badgeColor ? `${block.badgeColor}40` : 'rgba(0,188,212,0.3)',
              color: block.badgeColor ?? '#00BCD4',
            }}>
            {block.content || t("برچسب")}
          </span>
        </div>
      );

    case 'button':
      return (
        <div className={`${py} flex ${block.align === 'center' ? 'justify-center' : block.align === 'left' ? 'justify-end' : 'justify-start'}`}>
          <a
            href={block.buttonUrl || '#'}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              block.buttonVariant === 'ghost'
                ? 'bg-transparent text-white hover:bg-white/10 border border-white/20'
                : block.buttonVariant === 'outline'
                ? 'bg-transparent border-2 hover:bg-white/10'
                : 'text-white shadow-lg hover:brightness-110'
            }`}
            style={
              block.buttonVariant !== 'ghost' && block.buttonVariant !== 'outline'
                ? { background: block.bgColor ?? 'linear-gradient(135deg,#00BCD4,#00838F)' }
                : { borderColor: block.bgColor ?? '#00BCD4', color: block.bgColor ?? '#00BCD4' }
            }
          >
            {block.content || t("دکمه")}
          </a>
        </div>
      );

    case 'divider':
      if (block.dividerStyle === 'dots') {
        return (
          <div className={`${py} flex items-center justify-center gap-2`}>
            {[0,1,2,3,4].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full"
                style={{ background: block.bgColor ?? 'rgba(255,255,255,0.2)', opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        );
      }
      if (block.dividerStyle === 'wave') {
        return (
          <div className={`${py}`}>
            <svg viewBox="0 0 1440 20" className="w-full" style={{ height: 16 }}>
              <path d="M0,10 C360,20 720,0 1080,10 C1260,15 1380,8 1440,10"
                stroke={block.bgColor ?? 'rgba(255,255,255,0.15)'} strokeWidth="2" fill="none" />
            </svg>
          </div>
        );
      }
      return (
        <div className={`${py}`}>
          <div className="h-px w-full" style={{ background: block.bgColor ?? 'rgba(255,255,255,0.08)' }} />
        </div>
      );

    case 'spacer':
      return <div className={SPACER_SIZE[block.spacerSize ?? 'md']} />;

    case 'two_col':
      return (
        <div className={`${py} grid grid-cols-1 md:grid-cols-2 gap-6`}>
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{block.colLeft || ''}</div>
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{block.colRight || ''}</div>
        </div>
      );

    case 'card': {
      const accent = block.cardAccent ?? '#00BCD4';
      return (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`${py} rounded-2xl p-6`}
          style={{ background: `${accent}0d`, border: `1px solid ${accent}25` }}
        >
          {block.cardSubtitle && (
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: accent }}>
              {block.cardSubtitle}
            </p>
          )}
          <p className="text-base text-slate-200 leading-relaxed whitespace-pre-wrap">{block.content || ''}</p>
          <div className="mt-4 h-px" style={{ background: `linear-gradient(to left, ${accent}, transparent)` }} />
        </motion.div>
      );
    }

    case 'highlight': {
      const accent = block.bgColor ?? '#f59e0b';
      return (
        <div className={`${py} px-5 py-4 rounded-xl border-e-4`}
          style={{ background: `${accent}10`, borderColor: accent }}>
          <p className="text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">{block.content || ''}</p>
        </div>
      );
    }

    default: return null;
  }
}

// ── Background variant class map ──────────────────────────────────────────────

const BG_MAP: Record<string, string> = {
  dark:        'bg-[#0d1829]',
  darker:      'bg-[#070e1a]',
  transparent: 'bg-transparent',
};

// ── Section renderer ──────────────────────────────────────────────────────────

export function CustomSectionRenderer({ section }: { section: CustomSection }) {
  if (!section.enabled || section.blocks.length === 0) return null;

  const accent = section.accentColor ?? '#00BCD4';
  const bgClass = BG_MAP[section.bgVariant ?? 'dark'];
  const headingAlign = ALIGN_CLS[section.headingAlign ?? 'right'];

  return (
    <section
      id={`custom-${section.id}`}
      className={`py-20 md:py-28 ${bgClass}`}
    >
      <div className="mx-auto max-w-7xl px-8">
        {/* Section header */}
        {(section.eyebrow || section.heading) && (
          <div className={`mb-12 ${headingAlign}`}>
            {section.eyebrow && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mb-3 text-xs font-black uppercase tracking-[0.3em]"
                style={{ color: accent }}
              >
                {section.eyebrow}
              </motion.p>
            )}
            {section.heading && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-black text-white md:text-5xl leading-tight"
              >
                {section.heading}
              </motion.h2>
            )}
          </div>
        )}

        {/* Blocks */}
        <div className="space-y-2">
          {section.blocks.map((block, i) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Block block={block} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
