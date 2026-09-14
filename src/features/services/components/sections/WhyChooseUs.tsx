// ─── WhyChooseUs Section — Cards with Real Images ───────────────────────────
import { motion } from 'framer-motion';
import type { WhyChooseUsContent } from '../../types/enterprise';

export interface WhyChooseUsProps {
  content: WhyChooseUsContent;
}

const WHY_IMAGES = [
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80&auto=format&fit=crop', // financial expertise
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80&auto=format&fit=crop', // AI technology
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80&auto=format&fit=crop', // security / lock
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80&auto=format&fit=crop', // analytics
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80&auto=format&fit=crop', // teamwork
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&auto=format&fit=crop', // growth chart
];

const ACCENTS = ['#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#f43f5e', '#6366f1'];

const WhyCard = ({ item, index }: { item: any; index: number }) => {
  const img = WHY_IMAGES[index % WHY_IMAGES.length];
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden transition-all hover:-translate-y-1 hover:border-white/15"
    >
      {/* image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={img}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111c2d] via-[#111c2d]/50 to-transparent" />

        {/* status badge */}
        <span
          className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-[11px] font-black uppercase border"
          style={{ color: accent, borderColor: `${accent}40`, background: `${accent}15` }}
        >
          {item.status}
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-black text-white mb-2">{item.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
        <div className="mt-5 h-px" style={{ background: `linear-gradient(to left, ${accent}, transparent)` }} />
      </div>
    </motion.div>
  );
};

export const WhyChooseUs = ({ content }: WhyChooseUsProps) => (
  <section id="why-choose-us" className="py-24 md:py-32 bg-[#111c2d]">
    <div className="mx-auto max-w-7xl px-8">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-violet-400"
      >
        تمایز ما
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-4 text-4xl font-black text-white md:text-5xl"
      >
        {content.title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mb-14 text-base text-slate-400 max-w-xl"
      >
        {content.description}
      </motion.p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {content.items.map((item, i) => (
          <WhyCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  </section>
);
