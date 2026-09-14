// ─── Introduction Section — Split Layout ────────────────────────────────────
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { IntroductionContent } from '../../types/enterprise';

export interface IntroductionProps {
  content: IntroductionContent;
}

export const Introduction = ({ content }: IntroductionProps) => (
  <section id="introduction" className="py-24 md:py-32 bg-[#111c2d]">
    <div className="mx-auto max-w-7xl px-8">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
        {/* left: header */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400"
          >
            معرفی
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 text-4xl font-black text-white md:text-5xl leading-tight"
          >
            {content.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base leading-relaxed text-slate-400"
          >
            {content.description}
          </motion.p>

          {/* advantages */}
          <motion.ul
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-3"
          >
            {content.advantages.map((adv, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                {adv}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* right: two columns of lists */}
        <div className="grid gap-8 sm:grid-cols-2">
          {[
            { label: 'کاربردها', items: content.uses },
            { label: 'مخاطبان', items: content.audience },
            { label: 'ارزش‌ها', items: content.value },
          ].map(({ label, items }, gi) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: gi * 0.1 }}
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
              <ul className="space-y-2">
                {items.map((it, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-1 w-4 rounded-full bg-emerald-500/60" />
                    {it}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
