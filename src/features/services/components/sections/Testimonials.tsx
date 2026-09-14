// ─── Testimonials Section — Full-width Quote Carousel ───────────────────────
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { Testimonial } from '../../types/enterprise';
import { useState, useEffect } from 'react';

import { t as tr } from '@/i18n';


export interface TestimonialsProps {
  testimonials: Testimonial[];
}

export const Testimonials = ({ testimonials }: TestimonialsProps) => {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setIdx((p) => (p + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(t);
  }, [testimonials.length]);

  const go = (d: number) => {
    setDir(d);
    setIdx((p) => (p + d + testimonials.length) % testimonials.length);
  };

  const t = testimonials[idx];

  return (
    <section id="testimonials" className="py-24 md:py-32 bg-[#111c2d]">
      <div className="mx-auto max-w-4xl px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-3 text-center text-xs font-bold uppercase tracking-[0.3em] text-rose-400"
        >
          {tr("نظرات مشتریان")}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center text-4xl font-black text-white md:text-5xl"
        >
          {tr("آنچه می‌گویند")}
        </motion.h2>

        {/* quote */}
        <div className="relative min-h-[220px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={idx}
              custom={dir}
              initial={{ opacity: 0, x: dir > 0 ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir > 0 ? -60 : 60 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex flex-col justify-center"
            >
              {/* large quote mark */}
              <Quote size={48} className="mb-4 text-white/6" />

              <p className="text-xl font-medium leading-relaxed text-white md:text-2xl">
                «{t.quote}»
              </p>

              {/* author */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-lg font-black text-white">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-sm text-slate-400">{t.role} · {t.company}</p>
                </div>
                {/* stars */}
                <div className="mr-auto flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* controls */}
        <div className="mt-12 flex items-center justify-between">
          {/* dots */}
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
                className={`h-2 rounded-full transition-all ${i === idx ? 'w-8 bg-rose-400' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => go(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => go(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
