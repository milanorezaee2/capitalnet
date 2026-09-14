// ─── Process Section — Vertical Numbered Steps ──────────────────────────────
import { motion } from 'framer-motion';
import type { ProcessStep } from '../../types/enterprise';

export interface ProcessProps {
  steps: ProcessStep[];
}

export const Process = ({ steps }: ProcessProps) => (
  <section id="process" className="py-24 md:py-32 bg-[#0d1829]">
    <div className="mx-auto max-w-5xl px-8">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-amber-500"
      >
        روش کار
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16 text-4xl font-black text-white md:text-5xl"
      >
        فرآیند انجام پروژه
      </motion.h2>

      <div className="relative">
        {/* vertical line */}
        <div className="absolute top-0 bottom-0 right-[19px] w-px bg-white/6 md:right-auto md:left-1/2" />

        <div className="space-y-0">
          {steps.map((step, i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`relative flex gap-6 pb-12 ${
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* step number bubble */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-amber-500/40 bg-[#0d1829] text-sm font-black text-amber-400 md:mx-auto">
                  {i + 1}
                </div>

                {/* content */}
                <div className={`flex-1 rounded-xl border border-white/6 bg-white/[0.025] p-5 ${
                  isEven ? 'md:ml-6' : 'md:mr-6'
                }`}>
                  <h3 className="text-lg font-black text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  {step.duration && (
                    <span className="mt-3 inline-block rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
                      {step.duration}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);
