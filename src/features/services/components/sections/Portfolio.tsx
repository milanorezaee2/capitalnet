// ─── Portfolio Section — Editorial Dark Style + Real Images ─────────────────
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import type { PortfolioItem } from '../../types/enterprise';
import { useState } from 'react';

export interface PortfolioProps {
  items: PortfolioItem[];
}

// Curated Unsplash finance/tech project images
const PORTFOLIO_IMAGES = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop', // analytics dashboard
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&auto=format&fit=crop', // trading charts
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop', // growth charts
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80&auto=format&fit=crop', // investment data
];

const ACCENTS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

const PortfolioCard = ({ item, index }: { item: PortfolioItem; index: number }) => {
  const img = PORTFOLIO_IMAGES[index % PORTFOLIO_IMAGES.length];
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden transition-all hover:-translate-y-1 hover:border-white/15"
    >
      {/* hero image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={img}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1829] via-[#0d1829]/50 to-transparent" />

        {/* category badge */}
        <span
          className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-black uppercase border backdrop-blur-sm"
          style={{ color: accent, borderColor: `${accent}40`, background: `${accent}18` }}
        >
          {item.category}
        </span>

        {/* external link */}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 left-4 flex items-center justify-center rounded-full p-2 border border-white/20 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink size={16} className="text-white" />
          </a>
        )}

        {/* title overlay */}
        <div className="absolute bottom-4 right-4 left-4">
          <h3 className="text-xl font-black text-white leading-tight">{item.title}</h3>
          {item.client && <p className="mt-1 text-xs text-slate-400">{item.client}</p>}
        </div>
      </div>

      {/* content */}
      <div className="p-6">
        <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>

        {/* tech tags */}
        {item.technologies && item.technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div
          className="mt-5 h-px"
          style={{ background: `linear-gradient(to left, ${accent}, transparent)` }}
        />
      </div>
    </motion.div>
  );
};

export const Portfolio = ({ items }: PortfolioProps) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = ['all', ...Array.from(new Set(items.map((item) => item.category)))];
  const filtered = activeFilter === 'all' ? items : items.filter((item) => item.category === activeFilter);

  return (
    <section id="portfolio" className="py-24 md:py-32 bg-[#111c2d]">
      <div className="mx-auto max-w-7xl px-8">
        {/* header */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-pink-400"
        >
          نمونه‌کارها
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-4xl font-black text-white md:text-5xl"
        >
          پروژه‌های موفق
        </motion.h2>

        {/* filter */}
        {categories.length > 1 && (
          <div className="mb-10 flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`rounded-full border px-5 py-1.5 text-sm font-bold transition-all ${
                  activeFilter === cat
                    ? 'border-pink-500 bg-pink-500/15 text-pink-300'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'همه' : cat}
              </button>
            ))}
          </div>
        )}

        {/* grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {filtered.map((item, index) => (
              <PortfolioCard key={item.id} item={item} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
