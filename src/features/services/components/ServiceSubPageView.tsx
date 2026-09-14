// ─── Service Sub-Page Renderer ────────────────────────────────────────────────
// Renders a dynamically-created service sub-page from the localStorage store.
// Each section type is rendered with a matching visual style.

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';
import { loadSubPages, SECTION_META, type ServiceSubPage, type SubPageSection } from '../data/serviceSubPageStore';

import { t as tr, useLanguage, deepTranslate } from '@/i18n';


// ─── Fade-in wrapper ─────────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </motion.div>
);

// ─── Section heading ─────────────────────────────────────────────────────────
const SectionTitle = ({ title, subtitle, color = '#00BCD4' }: { title?: string; subtitle?: string; color?: string }) => (
  title ? (
    <div className="text-center mb-10">
      <div className="inline-block w-8 h-1 rounded-full mb-4" style={{ background: color }} />
      <h2 className="text-3xl md:text-4xl font-black text-white mb-3">{title}</h2>
      {subtitle && <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
    </div>
  ) : null
);

// ─── Individual section renderers ─────────────────────────────────────────────
function RenderSection({ section, color }: { section: SubPageSection; color: string }) {
  const d = section.data;

  if (!section.visible) return null;

  switch (section.type) {
    case 'hero': return (
      <section className="relative min-h-[70vh] flex flex-col justify-center px-6 md:px-16 py-20 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#050d1a 0%,#0d1829 100%)' }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 end-0 w-96 h-96 rounded-full opacity-10 blur-[80px]"
            style={{ background: color }} />
          <div className="absolute bottom-0 start-0 w-64 h-64 rounded-full opacity-8 blur-[60px]"
            style={{ background: '#7c3aed' }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto w-full">
          {!!d.badge && (
            <span className="inline-block rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
              style={{ borderColor: color + '40', background: color + '12', color }}>
              {String(d.badge)}
            </span>
          )}
          {!!d.eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.35em] mb-4" style={{ color }}>{String(d.eyebrow)}</p>
          )}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6">
            {String(d.title)}
          </h1>
          {!!d.subtitle && <p className="text-xl font-semibold text-white mb-4 max-w-2xl">{String(d.subtitle)}</p>}
          {!!d.description && <p className="text-base text-white/70 mb-10 max-w-2xl leading-relaxed">{String(d.description)}</p>}
          <div className="flex flex-wrap gap-4 mb-8">
            {!!d.ctaPrimary && (
              <a href="/evaluation"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-slate-950 transition-all hover:-translate-y-0.5"
                style={{ background: color }}>
                {String(d.ctaPrimary)} <ArrowLeft size={15} />
              </a>
            )}
            {!!d.ctaSecondary && (
              <a href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:-translate-y-0.5">
                {String(d.ctaSecondary)}
              </a>
            )}
          </div>
          {Array.isArray(d.trustBadges) && d.trustBadges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(d.trustBadges as string[]).map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-medium text-slate-400">
                  ✓ {b}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    );

    case 'introduction': return (
      <section className="py-20 px-6 md:px-16" style={{ background: '#0d1829' }}>
        <div className="max-w-5xl mx-auto">
          <SectionTitle title={String(d.title ?? '')} color={color} />
          {!!d.description && (
            <p className="text-slate-300 text-lg leading-relaxed text-center mb-12 max-w-3xl mx-auto">{String(d.description)}</p>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(['uses', 'audience', 'value', 'advantages'] as const).map((key) => {
              const labels: Record<string, string> = { uses: tr("کاربردها"), audience: tr("مخاطبان"), value: 'ارزش‌ها', advantages: tr("مزیت‌ها") };
              const items = (d[key] as string[]) ?? [];
              if (!items.length) return null;
              return (
                <div key={key} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color }}>{labels[key]}</p>
                  <ul className="space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );

    case 'features': {
      const items = (d.items as Array<{ title: string; description: string }>) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#111c2d' }}>
          <div className="max-w-5xl mx-auto">
            <SectionTitle title={tr("ویژگی‌ها")} color={color} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((f, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <div className="p-5 rounded-2xl h-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 font-bold text-sm"
                      style={{ background: color + '20', color }}>
                      {i + 1}
                    </div>
                    <h3 className="text-white font-bold text-sm mb-2">{f.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{f.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'benefits': {
      const items = (d.items as Array<{ title: string; description: string }>) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#0d1829' }}>
          <div className="max-w-5xl mx-auto">
            <SectionTitle title={tr("مزایا")} color={color} />
            <div className="grid md:grid-cols-2 gap-5">
              {items.map((b, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <div className="flex gap-4 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: color + '20', color, fontSize: 18 }}>✓</div>
                    <div>
                      <h3 className="text-white font-bold text-sm mb-1">{b.title}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">{b.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'whyChooseUs': {
      const items = (d.items as Array<{ title: string; description: string; status?: string }>) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#111c2d' }}>
          <div className="max-w-5xl mx-auto">
            <SectionTitle title={d.title as string || tr("چرا ما؟")} subtitle={d.description as string} color={color} />
            <div className="grid md:grid-cols-3 gap-5">
              {items.map((item, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <div className="p-5 rounded-2xl h-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {item.status && <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-3 inline-block" style={{ background: color + '20', color }}>{item.status}</span>}
                    <h3 className="text-white font-bold text-sm mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'process': {
      const steps = (d.steps as Array<{ title: string; description: string; duration?: string }>) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#0d1829' }}>
          <div className="max-w-3xl mx-auto">
            <SectionTitle title={tr("فرآیند کار")} color={color} />
            <div className="space-y-4">
              {steps.map((step, i) => (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="flex gap-5 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
                      style={{ background: color + '20', color }}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-bold text-sm">{step.title}</h3>
                        {step.duration && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>{step.duration}</span>}
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'statistics': {
      const items = (d.items as Array<{ value: string; label: string; prefix?: string; suffix?: string }>) ?? [];
      return (
        <section className="py-16 px-6 md:px-16" style={{ background: '#111c2d' }}>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {items.map((s, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-3xl font-black mb-1" style={{ color }}>{s.prefix}{s.value}{s.suffix}</p>
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'testimonials': {
      const items = (d.items as Array<{ name: string; role?: string; company?: string; quote: string }>) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#0d1829' }}>
          <div className="max-w-5xl mx-auto">
            <SectionTitle title={tr("نظرات مشتریان")} color={color} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((t, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <div className="p-5 rounded-2xl h-full flex flex-col" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-4">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ background: color + '20', color }}>
                        {t.name?.[0]}
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">{t.name}</p>
                        {t.role && <p className="text-slate-500 text-[10px]">{t.role}{t.company ? ` · ${t.company}` : ''}</p>}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'faq': {
      const items = (d.items as Array<{ question: string; answer: string }>) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#111c2d' }}>
          <div className="max-w-3xl mx-auto">
            <SectionTitle title={tr("سوالات متداول")} color={color} />
            <div className="space-y-3">
              {items.map((faq, i) => (
                <FaqItem key={i} question={faq.question} answer={faq.answer} color={color} />
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'cta': {
      if ((d.enabled as boolean) === false) return null;
      return (
        <section className="py-20 px-6 md:px-16 text-center" style={{ background: '#0d1829' }}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-4">{String(d.title || tr("آماده شروع هستید؟"))}</h2>
            {!!d.description && <p className="text-slate-400 mb-8">{String(d.description)}</p>}
            <div className="flex flex-wrap gap-4 justify-center">
              {!!d.primaryLabel && (
                <a href={String(d.primaryLink || '/evaluation')}
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-slate-950 transition-all hover:-translate-y-0.5"
                  style={{ background: color }}>
                  {String(d.primaryLabel)} <ArrowLeft size={15} />
                </a>
              )}
              {!!d.secondaryLabel && (
                <a href={String(d.secondaryLink || '/contact')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:-translate-y-0.5">
                  {String(d.secondaryLabel)}
                </a>
              )}
            </div>
          </div>
        </section>
      );
    }

    case 'pricing': {
      const plans = (d.plans as Array<{ name: string; price: string; currency?: string; description?: string; ctaLabel?: string }>) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#111c2d' }}>
          <div className="max-w-5xl mx-auto">
            <SectionTitle title={tr("قیمت‌گذاری")} color={color} />
            <div className="grid md:grid-cols-3 gap-5">
              {plans.map((plan, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <div className="p-6 rounded-2xl h-full flex flex-col" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)` }}>
                    <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                    <p className="text-3xl font-black mb-3" style={{ color }}>{plan.price} <span className="text-sm font-normal text-slate-400">{plan.currency || tr("تومان")}</span></p>
                    {plan.description && <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-4">{plan.description}</p>}
                    <a href="/evaluation" className="w-full text-center rounded-xl py-2.5 text-sm font-bold transition-all"
                      style={{ background: color + '20', color }}>
                      {plan.ctaLabel || tr("انتخاب پلن")}
                    </a>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'team': {
      const members = (d.members as Array<{ name: string; role?: string; bio?: string; avatar?: string }>) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#0d1829' }}>
          <div className="max-w-5xl mx-auto">
            <SectionTitle title={tr("تیم ما")} color={color} />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {members.map((m, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <div className="text-center p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-black"
                        style={{ background: color + '20', color }}>{m.name?.[0]}</div>
                    )}
                    <p className="text-white font-bold text-sm">{m.name}</p>
                    {m.role && <p className="text-xs mt-0.5" style={{ color }}>{m.role}</p>}
                    {m.bio && <p className="text-slate-500 text-xs mt-2 leading-relaxed">{m.bio}</p>}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'richText':
      return (
        <section className="py-16 px-6 md:px-16" style={{ background: '#0d1829' }}>
          <div className="max-w-3xl mx-auto prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: (d.content as string) ?? '' }} />
        </section>
      );

    case 'imageGallery': {
      const images = (d.images as string[]) ?? [];
      const cols = (d.columns as number) ?? 3;
      return (
        <section className="py-16 px-6 md:px-16" style={{ background: '#111c2d' }}>
          <div className="max-w-5xl mx-auto">
            <div className={`grid gap-4 grid-cols-2 md:grid-cols-${Math.min(cols, 4)}`}>
              {images.map((url, i) => (
                <img key={i} src={url} alt={t('تصویر {n}', { n: i + 1 })}
                  className="w-full h-48 object-cover rounded-xl"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }} />
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'videoEmbed':
      return (
        <section className="py-16 px-6 md:px-16" style={{ background: '#0d1829' }}>
          <div className="max-w-3xl mx-auto">
            {d.url ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe src={String(d.url)} title={d.caption ? String(d.caption) : tr("ویدیو")}
                  className="absolute inset-0 w-full h-full rounded-2xl"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen />
              </div>
            ) : (
              <div className="h-48 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-slate-500 text-sm">{tr("ویدیویی تنظیم نشده")}</p>
              </div>
            )}
            {d.caption && <p className="text-center text-slate-400 text-sm mt-3">{String(d.caption)}</p>}
          </div>
        </section>
      );

    case 'divider': {
      const spacing = { sm: 'py-4', md: 'py-8', lg: 'py-16' }[(d.spacing as string) ?? 'md'] ?? 'py-8';
      return (
        <div className={spacing} style={{ background: '#0d1829' }}>
          {d.style !== 'space' && (
            <div className="max-w-5xl mx-auto px-6 md:px-16">
              <div className={`w-full h-px ${d.style === 'dots' ? 'border-t-2 border-dashed' : ''}`}
                style={{ background: d.style === 'dots' ? 'transparent' : 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.08)' }} />
            </div>
          )}
        </div>
      );
    }

    case 'deliverables': {
      const items = (d.items as Array<{ title: string; format?: string; description?: string }>) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#0d1829' }}>
          <div className="max-w-5xl mx-auto">
            <SectionTitle title={tr("خروجی‌ها")} color={color} />
            <div className="space-y-3">
              {items.map((item, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs"
                      style={{ background: color + '20', color }}>{item.format || '📄'}</div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      {item.description && <p className="text-slate-400 text-xs mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'technologies': {
      const items = (d.items as Array<{ name: string; category?: string; version?: string }>) ?? [];
      return (
        <section className="py-16 px-6 md:px-16" style={{ background: '#111c2d' }}>
          <div className="max-w-5xl mx-auto">
            <SectionTitle title={tr("تکنولوژی‌ها")} color={color} />
            <div className="flex flex-wrap gap-3 justify-center">
              {items.map((t, i) => (
                <span key={i} className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}>
                  {t.name}{t.version ? ` v${t.version}` : ''}
                  {t.category && <span className="ms-2 text-[10px] opacity-50">{t.category}</span>}
                </span>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'newsletter':
      return (
        <section className="py-16 px-6 md:px-16" style={{ background: '#0d1829' }}>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-black text-white mb-3">{d.title as string || tr("خبرنامه")}</h2>
            <p className="text-slate-400 text-sm mb-6">{d.description as string}</p>
            <div className="flex gap-3">
              <input type="email" placeholder={(d.placeholder as string) || tr("ایمیل شما...")}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-[color:var(--c)]"
                style={{ '--c': color } as React.CSSProperties} />
              <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-950 shrink-0"
                style={{ background: color }}>
                {(d.buttonLabel as string) || tr("عضویت")}
              </button>
            </div>
          </div>
        </section>
      );

    case 'portfolio': {
      const items = (d.items as Array<{ title: string; client?: string; category?: string; description?: string; thumbnail?: string }>) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#111c2d' }}>
          <div className="max-w-5xl mx-auto">
            <SectionTitle title={tr("نمونه‌کارها")} color={color} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item, i) => (
                <FadeIn key={i} delay={i * 0.06}>
                  <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center" style={{ background: color + '15' }}>
                        <span className="text-3xl">🖼️</span>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-white font-bold text-sm mb-1">{item.title}</p>
                      {item.client && <p className="text-xs" style={{ color }}>{item.client}</p>}
                      {item.description && <p className="text-slate-400 text-xs mt-1 leading-relaxed">{item.description}</p>}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'caseStudies': {
      const items = (d.items as Array<{ title: string; client?: string; industry?: string; challenge?: string; solution?: string; results?: string }>) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#0d1829' }}>
          <div className="max-w-5xl mx-auto">
            <SectionTitle title={tr("مطالعات موردی")} color={color} />
            <div className="space-y-5">
              {items.map((cs, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                        style={{ background: color + '20', color }}>{i + 1}</div>
                      <div>
                        <p className="text-white font-bold text-sm">{cs.title}</p>
                        {cs.client && <p className="text-xs" style={{ color }}>{cs.client}{cs.industry ? ` · ${cs.industry}` : ''}</p>}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {cs.challenge && <div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{tr("چالش")}</p><p className="text-slate-400 text-xs leading-relaxed">{cs.challenge}</p></div>}
                      {cs.solution && <div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{tr("راه‌حل")}</p><p className="text-slate-400 text-xs leading-relaxed">{cs.solution}</p></div>}
                      {cs.results && <div><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{tr("نتایج")}</p><p className="text-xs mt-1 leading-relaxed" style={{ color: color + 'cc' }}>{cs.results}</p></div>}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'clientLogos': {
      const items = (d.items as Array<{ name: string; logo?: string; url?: string }>) ?? [];
      return (
        <section className="py-12 px-6 md:px-16" style={{ background: '#111c2d' }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-8">
              {items.map((logo, i) => (
                <div key={i} className="flex items-center justify-center h-12 w-28 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
                  {logo.logo ? (
                    <img src={logo.logo} alt={logo.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-white font-bold text-sm text-center">{logo.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'comparison': {
      const columns = (d.columns as string[]) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#0d1829' }}>
          <div className="max-w-5xl mx-auto">
            <SectionTitle title={d.title as string || tr("جدول مقایسه")} subtitle={d.description as string} color={color} />
            <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: color + '15' }}>
                    {columns.map((col, i) => (
                      <th key={i} className={`px-5 py-3.5 text-xs font-bold uppercase tracking-widest ${i === 0 ? 'text-right' : 'text-center'}`}
                        style={{ color: i === 0 ? 'rgba(255,255,255,0.5)' : color }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </section>
      );
    }

    case 'categories': {
      const items = (d.items as Array<{ name: string; description?: string; icon?: string }>) ?? [];
      return (
        <section className="py-20 px-6 md:px-16" style={{ background: '#111c2d' }}>
          <div className="max-w-5xl mx-auto">
            <SectionTitle title={tr("دسته‌بندی‌ها")} color={color} />
            <div className="grid md:grid-cols-3 gap-5">
              {items.map((cat, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <div className="p-5 rounded-2xl h-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {cat.icon && <div className="text-3xl mb-3">{cat.icon}</div>}
                    <h3 className="text-white font-bold text-sm mb-2">{cat.name}</h3>
                    {cat.description && <p className="text-slate-400 text-xs leading-relaxed">{cat.description}</p>}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    default: return null;
  }
}

// ─── FAQ accordion item ───────────────────────────────────────────────────────
function FaqItem({ question, answer, color }: { question: string; answer: string; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid rgba(255,255,255,${open ? '0.12' : '0.07'})` }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-end transition-all"
        style={{ background: open ? color + '10' : 'rgba(255,255,255,0.04)' }}>
        <span className="text-sm font-semibold text-white">{question}</span>
        <ChevronRight size={16} style={{ color, transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }} />
      </button>
      {open && (
        <div className="px-5 py-4" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-slate-400 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────
interface ServiceSubPageViewProps {
  slug: string;
  onBack: () => void;
}

export default function ServiceSubPageView({ slug, onBack }: ServiceSubPageViewProps) {
  const [rawPage, setPage] = useState<ServiceSubPage | null | 'loading'>('loading');
  const { lang } = useLanguage();

  // زیرصفحه‌های خدمات به فارسی ذخیره شده‌اند؛ ترجمهٔ عمیق برای نسخهٔ انگلیسی
  const page = useMemo(
    () => (rawPage && rawPage !== 'loading' ? deepTranslate(rawPage) : rawPage),
    [rawPage, lang]
  );

  useEffect(() => {
    const pages = loadSubPages();
    const found = pages.find(p => p.slug === slug);
    setPage(found ?? null);
  }, [slug]);

  if (page === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1829' }}>
        <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: '#0d1829' }}>
        <p className="text-6xl mb-6">🔍</p>
        <h1 className="text-2xl font-black text-white mb-3">{tr("صفحه یافت نشد")}</h1>
        <p className="text-slate-400 mb-8">{tr("صفحه‌ای با این آدرس وجود ندارد یا حذف شده است.")}</p>
        <button onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#00BCD4,#00838F)' }}>
          <ArrowLeft size={15} /> {tr("بازگشت به خدمات")}
        </button>
      </div>
    );
  }

  const color = page.color || '#00BCD4';
  const visibleSections = page.sections.filter(s => s.visible);

  return (
    <div className="min-h-screen" style={{ background: '#0d1829', color: '#e2e8f0' }} dir="rtl">
      {/* Breadcrumb nav */}
      <div className="bg-[#050d1a]/80 border-b border-white/[0.06] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <button onClick={() => { window.history.pushState(null, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
            className="hover:text-white transition-colors flex items-center gap-1">
            <Home size={11} /> {tr("خانه")}
          </button>
          <ChevronRight size={10} className="opacity-40" />
          <button onClick={onBack} className="hover:text-white transition-colors">{tr("خدمات")}</button>
          <ChevronRight size={10} className="opacity-40" />
          <span style={{ color }}>{page.name}</span>
        </div>
      </div>

      {/* Sections */}
      {visibleSections.map(section => (
        <FadeIn key={section.id}>
          <RenderSection section={section} color={color} />
        </FadeIn>
      ))}

      {/* Fallback if no sections */}
      {visibleSections.length === 0 && (
        <div className="py-32 text-center">
          <p className="text-slate-600 text-sm">{tr("این صفحه هنوز محتوایی ندارد.")}</p>
        </div>
      )}
    </div>
  );
}
